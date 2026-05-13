"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";

// Works with both real JWTs and our fake mock tokens
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { user_id, username, role, full_name }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        const decoded = decodeToken(token);
        // Check token not expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      } catch {
        localStorage.removeItem("access_token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.post("/auth/login/", { username, password });
    const { access, refresh } = res.data;
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    const decoded = decodeToken(access);
    setUser(decoded);
    return decoded;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  const isAdmin = () => user?.role === "admin";
  const isProducer = () => user?.role === "producer" || user?.role === "admin";
  const isAccountant = () =>
    user?.role === "accountant" || user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAdmin,
        isProducer,
        isAccountant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
