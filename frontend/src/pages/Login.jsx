import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { loginUser, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from register with success message in state
  const registrationSuccessMsg = location.state?.registeredMsg;

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setSubmitting(true);
    const success = await loginUser(username.trim(), password);
    setSubmitting(false);

    if (success) {
      navigate("/quiz");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <span className="auth-banana-emoji">🍌</span>
          </div>
          <h2>Welcome Back!</h2>
          <p className="auth-subtitle">Sign in to test your puzzle-solving skills</p>
        </div>

        {registrationSuccessMsg && (
          <div className="alert-box alert-success" role="alert">
            <span className="alert-icon">✅</span>
            <span>{registrationSuccessMsg}</span>
          </div>
        )}

        {error && (
          <div className="alert-box alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-username">Username</label>
            <div className="input-with-icon">
              <span className="input-icon">👤</span>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Password</label>
            <div className="input-with-icon">
              <span className="input-icon">🔒</span>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-primary"
            disabled={submitting || !username.trim() || !password}
          >
            {submitting ? (
              <span className="btn-content-loading">
                <span className="button-spinner"></span>
                <span>Signing in...</span>
              </span>
            ) : (
              <span>Sign In & Play 🚀</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{" "}
            <Link to="/register" className="auth-switch-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
