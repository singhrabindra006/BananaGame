import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getMe, changePassword, updateAvatar } from "../services/api";

const AVATAR_OPTIONS = ["🍌", "🐒", "🦍", "🌴", "👑", "🚀", "⭐", "🏆", "🎮", "🧠"];

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState("🍌");
  const [avatarMsg, setAvatarMsg] = useState("");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    getMe()
      .then((data) => {
        if (!ignore && data) {
          setProfile(data);
          if (data.avatar) setSelectedAvatar(data.avatar);
        }
      })
      .catch(() => null)
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleAvatarSelect = async (emoji) => {
    setSelectedAvatar(emoji);
    setAvatarMsg("");
    try {
      await updateAvatar(emoji);
      setAvatarMsg("Avatar updated! ✨");
      setTimeout(() => setAvatarMsg(""), 2500);
    } catch {
      setAvatarMsg("Failed to update avatar.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      setPwMsg(res.message || "Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPwError(err.response?.data?.message || "Error changing password.");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-loading-state">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-avatar-large">
          <span className="profile-avatar-emoji">{selectedAvatar}</span>
        </div>
        <div className="profile-info">
          <h2>{user?.username}</h2>
          <p className="profile-subtitle">Member since {joinDate}</p>
        </div>
      </div>

      {/* Avatar Picker */}
      <div className="profile-section-card">
        <div className="section-header-inline">
          <h3>Choose Your Avatar</h3>
          {avatarMsg && <span className="save-toast">{avatarMsg}</span>}
        </div>
        <div className="avatar-picker-grid">
          {AVATAR_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`avatar-option-btn ${selectedAvatar === emoji ? "active" : ""}`}
              onClick={() => handleAvatarSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Career Stats */}
      <div className="profile-section-card">
        <h3>Career Game Stats</h3>
        <div className="profile-stats-grid">
          <div className="stat-box">
            <span className="stat-label">High Score</span>
            <span className="stat-value text-accent">{profile?.highScore || 0} / 10</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Games Played</span>
            <span className="stat-value">{profile?.gamesPlayed || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Total Bananas</span>
            <span className="stat-value">{profile?.totalPoints || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Flawless 10/10s</span>
            <span className="stat-value text-success">{profile?.perfectGames || 0} ⭐</span>
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <div className="profile-section-card">
        <h3>Security Settings</h3>
        <p className="section-desc">Change your password to keep your account safe</p>

        {pwMsg && (
          <div className="alert-box alert-success" role="alert">
            <span className="alert-icon">✅</span>
            <span>{pwMsg}</span>
          </div>
        )}

        {pwError && (
          <div className="alert-box alert-error" role="alert">
            <span className="alert-icon">⚠️</span>
            <span>{pwError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="auth-form">
          <div className="form-group">
            <label htmlFor="cur-pass">Current Password</label>
            <input
              id="cur-pass"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-pass">New Password (min 6 chars)</label>
            <input
              id="new-pass"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm-new-pass">Confirm New Password</label>
            <input
              id="confirm-new-pass"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Repeat new password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={pwLoading || !currentPassword || !newPassword || !confirmNewPassword}
          >
            {pwLoading ? "Updating Password..." : "Update Password 🔒"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
