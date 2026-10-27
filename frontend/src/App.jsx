import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Quiz from "./pages/Quiz.jsx";
import Scoreboard from "./pages/Scoreboard.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import "./App.css";

/**
 * Root component. Handles client-side routing and
 * redirects based on authentication state.
 */
function App() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Navbar />
      <div className="container">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/quiz" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/quiz" /> : <Register />}
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
            path="/"
            element={<Navigate to={user ? "/quiz" : "/login"} />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
