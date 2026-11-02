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

export const changePassword = (currentPassword, newPassword) =>
  API.put("/auth/password", { currentPassword, newPassword }).then((res) => res.data);

export const updateAvatar = (avatar) =>
  API.put("/auth/avatar", { avatar }).then((res) => res.data);

export const logoutApi = () =>
  API.post("/auth/logout").then((res) => res.data).catch(() => null);

export const saveScore = (username, score) =>
  API.post("/auth/score", { username, score }).then((res) => res.data);

export const getScores = (params = {}) =>
  API.get("/auth/scores", { params }).then((res) => res.data);

/**
 * Fetches a banana-themed math question from the external Banana API.
 * Includes automatic retry with exponential back-off for resilience.
 *
 * @param {number} maxRetries - Maximum number of retry attempts (default 2)
 * @param {number} baseDelay  - Initial delay in ms before first retry (default 500)
 * @returns {Promise<object>} The question payload from the API
 */
export const fetchBananaQuestion = async (maxRetries = 2, baseDelay = 500) => {
  const BANANA_API_URL = "https://marcconrad.com/uob/banana/api.php";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(BANANA_API_URL, { timeout: 8000 });
      return response.data;
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;
      if (isLastAttempt) {
        // Rethrow on the final attempt so the caller can handle it
        throw new Error(
          `Banana API unavailable after ${maxRetries + 1} attempts: ${err.message}`
        );
      }
      // Exponential back-off: 500ms, 1000ms, 2000ms, …
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

export default API;
