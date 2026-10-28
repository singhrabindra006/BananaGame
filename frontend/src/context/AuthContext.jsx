import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Restore & verify session on app initialization
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = Cookies.get("token");
      const savedUsername = Cookies.get("username");

      if (token && savedUsername) {
        if (isMounted) setUser({ username: savedUsername, token });
        try {
          const me = await api.getMe();
          if (isMounted && me?.username) {
            setUser({ username: me.username, token, highScore: me.highScore });
            logEvent("SESSION_RESTORED", { username: me.username });
          }
        } catch (err) {
          if (err.response?.status === 401) {
            logEvent("SESSION_EXPIRED", { username: savedUsername });
            Cookies.remove("token");
            Cookies.remove("username");
            if (isMounted) setUser(null);
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginUser = async (username, password) => {
    setError("");
    try {
      const data = await api.login(username, password);
      const token = data.token;
      const verifiedUsername = data.user?.username || username.trim();

      // Set cookie for session persistence (1 day)
      Cookies.set("token", token, { expires: 1, sameSite: "strict" });
      Cookies.set("username", verifiedUsername, { expires: 1, sameSite: "strict" });

      setUser({ username: verifiedUsername, token });
      logEvent("LOGIN_SUCCESS", { username: verifiedUsername });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(msg);
      logEvent("LOGIN_FAILED", { username, reason: msg });
      return false;
    }
  };

  const registerUser = async (username, password) => {
    setError("");
    try {
      const data = await api.register(username, password);
      logEvent("REGISTER_SUCCESS", { username: username.trim() });
      return { success: true, message: data.message };
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
      logEvent("REGISTER_FAILED", { username, reason: msg });
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    logEvent("LOGOUT", { username: user?.username });
    try {
      await api.logoutApi();
    } catch {
      // Ignore network errors on logout
    }
    Cookies.remove("token");
    Cookies.remove("username");
    setUser(null);
    setError("");
  };

  const clearError = useCallback(() => {
    setError("");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        clearError,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
