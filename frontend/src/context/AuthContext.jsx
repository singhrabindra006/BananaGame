import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import * as api from "../services/api";
import { logEvent } from "../utils/logger";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

/**
 * ============================================================
 * VIRTUAL IDENTITY: Authentication Context
 * ============================================================
 * Manages the user's virtual identity across the app.
 * A token (issued by the backend after verifying credentials
 * against MongoDB) is stored in a cookie to persist the
 * session across page reloads.
 * ============================================================
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  // Restore session from cookie on app load
  useEffect(() => {
    const token = Cookies.get("token");
    const username = Cookies.get("username");
    if (token && username) {
      setUser({ username, token });
      logEvent("SESSION_RESTORED", { username });
    }
  }, []);

  const loginUser = async (username, password) => {
    setError("");
    try {
      const { token } = await api.login(username, password);
      Cookies.set("token", token, { expires: 1, sameSite: "strict" });
      Cookies.set("username", username, { expires: 1, sameSite: "strict" });
      setUser({ username, token });
      logEvent("LOGIN_SUCCESS", { username });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      logEvent("LOGIN_FAILED", { username });
      return false;
    }
  };

  const registerUser = async (username, password) => {
    setError("");
    try {
      await api.register(username, password);
      logEvent("REGISTER_SUCCESS", { username });
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      logEvent("REGISTER_FAILED", { username });
      return false;
    }
  };

  const logout = () => {
    logEvent("LOGOUT", { username: user?.username });
    Cookies.remove("token");
    Cookies.remove("username");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, error, loginUser, registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
