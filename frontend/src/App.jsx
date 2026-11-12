import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Quiz from "./pages/Quiz.jsx";
import Scoreboard from "./pages/Scoreboard.jsx";
import Profile from "./pages/Profile.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { BananaLogoIcon } from "./components/Icons.jsx";
import "./App.css";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Root component. Handles client-side routing,
 * responsive layout structure, and auth redirection.
 */
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-splash-container">
        <div className="splash-card">
          <div className="splash-logo-wrap">
            <BananaLogoIcon size={44} />
          </div>
          <h2>BananaQuiz</h2>
          <div className="spinner"></div>
          <p>Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="container">
            <Routes>
              <Route
                path="/login"
                element={user ? <Navigate to="/quiz" replace /> : <Login />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/quiz" replace /> : <Register />}
              />
              <Route
                path="/quiz"
                element={
                  <ProtectedRoute>
                    <Quiz />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scoreboard"
                element={
                  <ProtectedRoute>
                    <Scoreboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/"
                element={<Navigate to={user ? "/quiz" : "/login"} replace />}
              />
              {/* Fallback route */}
              <Route
                path="*"
                element={<Navigate to={user ? "/quiz" : "/login"} replace />}
              />
            </Routes>
          </div>
        </main>
        <footer className="app-footer">
          <p>
            BananaQuiz &bull; Mathematical Problem Solving &bull; UoB Banana API &bull; {CURRENT_YEAR}
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
