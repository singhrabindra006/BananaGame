import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
    navigate("/login");
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar-wrapper">
      <nav className="navbar">
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <span className="brand-icon">🍌</span>
          <span className="brand-text">Banana<span className="brand-accent">Quiz</span></span>
        </Link>

        {/* Mobile Hamburger Button */}
        <button
          className={`hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
          <span className="hamburger-bar"></span>
        </button>

        {/* Navigation links & User Actions */}
        <div className={`nav-links-container ${mobileMenuOpen ? "open" : ""}`}>
          {user ? (
            <>
              <div className="nav-links">
                <Link
                  to="/quiz"
                  className={`nav-link ${isActive("/quiz") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">🎮</span> Play Quiz
                </Link>
                <Link
                  to="/scoreboard"
                  className={`nav-link ${isActive("/scoreboard") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <span className="nav-icon">🏆</span> Leaderboard
                </Link>
              </div>

              <div className="nav-user-section">
                <div className="user-badge" title={`Signed in as ${user.username}`}>
                  <span className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{user.username}</span>
                </div>
                <button
                  className="btn-logout"
                  onClick={handleLogout}
                  title="Sign out of your account"
                >
                  <span className="logout-icon">🚪</span> Logout
                </button>
              </div>
            </>
          ) : (
            <div className="nav-links auth-nav-links">
              <Link
                to="/login"
                className={`nav-link ${isActive("/login") ? "active" : ""}`}
                onClick={closeMenu}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className={`nav-link btn-register-link ${isActive("/register") ? "active" : ""}`}
                onClick={closeMenu}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
