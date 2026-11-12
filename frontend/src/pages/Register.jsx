import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  BananaLogoIcon,
  UserIcon,
  LockIcon,
  ShieldIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  AlertCircleIcon,
} from "../components/Icons.jsx";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");

  const { registerUser, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const isPasswordMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordLongEnough = password.length >= 6;
  const isUsernameValid = username.trim().length >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    const cleanUsername = username.trim();
    if (cleanUsername.length < 3) {
      setLocalError("Username must be at least 3 characters long.");
      return;
    }

    if (cleanUsername.length > 20) {
      setLocalError("Username cannot exceed 20 characters.");
      return;
    }

    if (!isPasswordLongEnough) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match. Please verify.");
      return;
    }

    setSubmitting(true);
    const result = await registerUser(cleanUsername, password);
    setSubmitting(false);

    if (result.success) {
      navigate("/login", {
        state: {
          registeredMsg: "Account registered successfully. Please sign in to proceed.",
        },
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-badge">
            <BananaLogoIcon size={32} />
          </div>
          <h2>Create Account</h2>
          <p className="auth-subtitle">
            Join the mathematical logic platform to track performance and rankings
          </p>
        </div>

        {(localError || error) && (
          <div className="alert-box alert-error" role="alert">
            <AlertCircleIcon size={18} className="alert-icon" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-username">
              Username <span className="label-hint">(3–20 characters)</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">
                <UserIcon size={16} />
              </span>
              <input
                id="reg-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">
              Password <span className="label-hint">(min 6 characters)</span>
            </label>
            <div className="input-with-icon">
              <span className="input-icon">
                <LockIcon size={16} />
              </span>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a secure password"
                autoComplete="new-password"
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
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm-password">Confirm Password</label>
            <div className="input-with-icon">
              <span className="input-icon">
                <ShieldIcon size={16} />
              </span>
              <input
                id="reg-confirm-password"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                required
                disabled={submitting}
              />
              {confirmPassword.length > 0 && (
                <span
                  className={`validation-status ${isPasswordMatch ? "valid" : "invalid"}`}
                  title={isPasswordMatch ? "Passwords match" : "Mismatch"}
                >
                  {isPasswordMatch ? (
                    <CheckCircleIcon size={16} />
                  ) : (
                    <AlertCircleIcon size={16} />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Password requirement hints */}
          <div className="password-hints">
            <div className={`hint-item ${isUsernameValid ? "valid" : ""}`}>
              <span className="hint-bullet">{isUsernameValid ? "✓" : "•"}</span> Username 3–20 chars
            </div>
            <div className={`hint-item ${isPasswordLongEnough ? "valid" : ""}`}>
              <span className="hint-bullet">{isPasswordLongEnough ? "✓" : "•"}</span> Min 6 characters
            </div>
            <div className={`hint-item ${isPasswordMatch ? "valid" : ""}`}>
              <span className="hint-bullet">{isPasswordMatch ? "✓" : "•"}</span> Passwords match
            </div>
          </div>

          <button
            type="submit"
            className="btn-auth-primary"
            disabled={submitting || !isUsernameValid || !isPasswordLongEnough || !isPasswordMatch}
          >
            {submitting ? (
              <span className="btn-content-loading">
                <span className="button-spinner"></span>
                <span>Creating Account...</span>
              </span>
            ) : (
              <span>Register Account</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-switch-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
