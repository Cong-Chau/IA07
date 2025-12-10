// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

let accessToken = null; // in-memory

export const setAccessToken = (token) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

function getRefreshToken() {
  return localStorage.getItem("refresh_token");
}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // no refresh -> let caller handle (e.g., logout)
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post("/api/auth/refresh", { refreshToken });
        const newAccess = res.data.accessToken;
        setAccessToken(newAccess);
        processQueue(null, newAccess);
        originalRequest.headers["Authorization"] = "Bearer " + newAccess;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // refresh failed -> clear refresh token so app can logout
        localStorage.removeItem("refresh_token");
        clearAccessToken();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
