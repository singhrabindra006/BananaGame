import axios from "axios";

/**
 * ============================================================
 * INTEROPERABILITY: Own Backend (Node/Express + MongoDB)
 * ============================================================
 * Connects frontend to our custom REST API running on a
 * separate server (localhost:5000), which itself interoperates
 * with MongoDB.
 * ============================================================
 */
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const login = (username, password) =>
  API.post("/auth/login", { username, password }).then((res) => res.data);

export const register = (username, password) =>
  API.post("/auth/register", { username, password }).then((res) => res.data);

export const saveScore = (username, score) =>
  API.post("/auth/score", { username, score }).then((res) => res.data);

export const getScores = () => API.get("/auth/scores").then((res) => res.data);
