import api, { setAccessToken, clearAccessToken } from "./axios";

export const loginRequest = async ({ email, password }) => {
  const res = await api.post("/auth/login", { email, password });
  const { accessToken, refreshToken, user } = res.data;
  // set access memory
  setAccessToken(accessToken);
  // persist refresh
  localStorage.setItem("refresh_token", refreshToken);
  return { user, accessToken };
};

export const logoutRequest = async () => {
  // if your backend supports blacklist you can call it
  clearAccessToken();
  localStorage.removeItem("refresh_token");
};

export const fetchMe = async () => {
  const res = await api.get("/protected/user");
  return res.data;
};
