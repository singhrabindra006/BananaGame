import axios from "axios";
import Cookies from "js-cookie";

/**
 * ============================================================
 * INTEROPERABILITY: Internal Backend (Node/Express + MongoDB)
 * ============================================================
 * Connects frontend to our custom REST API running on
 * localhost:5000, passing Virtual Identity credentials.
 * ============================================================
 */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: inject active auth token automatically
API.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = (username, password) =>
  API.post("/auth/login", { username, password }).then((res) => res.data);

export const register = (username, password) =>
  API.post("/auth/register", { username, password }).then((res) => res.data);

export const getMe = () =>
  API.get("/auth/me").then((res) => res.data);

export const logoutApi = () =>
  API.post("/auth/logout").then((res) => res.data).catch(() => null);

export const saveScore = (username, score) =>
  API.post("/auth/score", { username, score }).then((res) => res.data);

export const getScores = (params = {}) =>
  API.get("/auth/scores", { params }).then((res) => res.data);

export default API;
