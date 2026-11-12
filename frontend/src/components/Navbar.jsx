import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { isSoundEnabled, setSoundEnabled, playClick } from "../utils/sound";
import {
  BananaLogoIcon,
  PlayIcon,
  TrophyIcon,
  UserIcon,
  LogoutIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "./Icons.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClick();
  };

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
          <div className="brand-icon-wrap">
            <BananaLogoIcon size={24} />
          </div>
          <span className="brand-text">
            Banana<span className="brand-accent">Quiz</span>
          </span>
        </Link>

        <div className="nav-actions-mobile">
          <button
            type="button"
            className="btn-sound-toggle-mobile"
            onClick={handleToggleSound}
            aria-label={soundOn ? "Mute audio" : "Enable audio"}
            title={soundOn ? "Mute audio" : "Enable audio"}
          >
            {soundOn ? <VolumeIcon size={18} /> : <VolumeMuteIcon size={18} />}
          </button>

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
        </div>

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
                  <PlayIcon size={16} className="nav-icon" />
                  <span>Challenge</span>
                </Link>
                <Link
                  to="/scoreboard"
                  className={`nav-link ${isActive("/scoreboard") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <TrophyIcon size={16} className="nav-icon" />
                  <span>Leaderboard</span>
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${isActive("/profile") ? "active" : ""}`}
                  onClick={closeMenu}
                >
                  <UserIcon size={16} className="nav-icon" />
                  <span>Profile</span>
                </Link>
              </div>

              <div className="nav-user-section">
                <button
                  type="button"
                  className="btn-sound-toggle-desktop"
                  onClick={handleToggleSound}
                  title={soundOn ? "Mute sound" : "Enable sound"}
                >
                  {soundOn ? <VolumeIcon size={18} /> : <VolumeMuteIcon size={18} />}
                </button>
                <Link
                  to="/profile"
                  className="user-badge"
                  title="View your profile"
                  onClick={closeMenu}
                >
                  <span className="user-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                  <span className="user-name">{user.username}</span>
                </Link>
                <button
                  className="btn-logout"
                  onClick={handleLogout}
                  title="Sign out of your account"
                >
                  <LogoutIcon size={16} className="logout-icon" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          ) : (
            <div className="nav-links auth-nav-links">
              <button
                type="button"
                className="btn-sound-toggle-desktop"
                onClick={handleToggleSound}
                title={soundOn ? "Mute sound" : "Enable sound"}
              >
                {soundOn ? <VolumeIcon size={18} /> : <VolumeMuteIcon size={18} />}
              </button>
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
