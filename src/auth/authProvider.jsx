import React, { createContext, useContext, useState, useEffect } from "react";
import { loginRequest, logoutRequest } from "../api/authApi";
import { setAccessToken, clearAccessToken } from "../api/axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Try to bootstrap from refresh token on app load
  useEffect(() => {
    const tryRefresh = async () => {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        setLoading(false);
        return;
      }
      try {
        // call refresh endpoint directly
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) throw new Error("Refresh failed");
        const data = await res.json();
        setAccessToken(data.accessToken);
        // decode user from token or call /protected/user
        const payload = jwtDecode(data.accessToken);
        setUser({ id: payload.sub, email: payload.email, name: payload.name });
      } catch (err) {
        localStorage.removeItem("refresh_token");
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    tryRefresh();
  }, []);

  const login = ({ user, accessToken, refreshToken }) => {
    setUser(user);
    setAccessToken(accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
