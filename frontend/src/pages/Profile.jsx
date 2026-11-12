import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getMe, changePassword, updateAvatar } from "../services/api";
import {
  LockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TargetIcon,
  TrophyIcon,
  StarIcon,
} from "../components/Icons.jsx";

const AVATAR_OPTIONS = [
  { id: "⚡", label: "Velocity" },
  { id: "💎", label: "Crystal" },
  { id: "🎯", label: "Precision" },
  { id: "🛡️", label: "Guardian" },
  { id: "👑", label: "Crown" },
  { id: "🧠", label: "Cognition" },
  { id: "🚀", label: "Orbit" },
  { id: "⭐", label: "Prime" },
  { id: "🏆", label: "Apex" },
  { id: "🔬", label: "Logic" },
];

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState("⚡");
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

  const handleAvatarSelect = async (symbol) => {
    setSelectedAvatar(symbol);
    setAvatarMsg("");
    try {
      await updateAvatar(symbol);
      setAvatarMsg("Avatar updated successfully.");
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
      setPwMsg(res.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPwError(err.response?.data?.message || "Error updating password.");
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-loading-state">
        <div className="spinner"></div>
        <p>Loading profile data...</p>
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
          <span className="profile-avatar-symbol">{selectedAvatar}</span>
        </div>
        <div className="profile-info">
          <h2>{user?.username}</h2>
          <p className="profile-subtitle">Account Member since {joinDate}</p>
        </div>
      </div>

      {/* Avatar Picker */}
      <div className="profile-section-card">
        <div className="section-header-inline">
          <div>
            <h3>Profile Identity Emblem</h3>
            <p className="section-desc">Select an emblem to represent your profile on rankings</p>
          </div>
          {avatarMsg && (
            <span className="save-toast">
              <CheckCircleIcon size={14} /> {avatarMsg}
            </span>
          )}
        </div>
        <div className="avatar-picker-grid">
          {AVATAR_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`avatar-option-btn ${selectedAvatar === item.id ? "active" : ""}`}
              onClick={() => handleAvatarSelect(item.id)}
              title={item.label}
            >
              <span className="avatar-icon-symbol">{item.id}</span>
              <span className="avatar-option-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Career Stats */}
      <div className="profile-section-card">
        <h3>Performance Overview</h3>
        <p className="section-desc">Summary of all validated problem solving sessions</p>
        <div className="profile-stats-grid">
          <div className="stat-box">
            <span className="stat-label">Best Score</span>
            <span className="stat-value text-accent">{profile?.highScore || 0} / 10</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Sessions Completed</span>
            <span className="stat-value">{profile?.gamesPlayed || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Cumulative Points</span>
            <span className="stat-value">{profile?.totalPoints || 0}</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Perfect 10/10 Runs</span>
            <span className="stat-value text-success">{profile?.perfectGames || 0}</span>
          </div>
        </div>
      </div>

      {/* Security & Password */}
      <div className="profile-section-card">
        <h3>Security & Credentials</h3>
        <p className="section-desc">Update your password to maintain account security</p>

        {pwMsg && (
          <div className="alert-box alert-success" role="alert">
            <CheckCircleIcon size={16} className="alert-icon" />
            <span>{pwMsg}</span>
          </div>
        )}

        {pwError && (
          <div className="alert-box alert-error" role="alert">
            <AlertCircleIcon size={16} className="alert-icon" />
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
              placeholder="Enter existing password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="new-pass">New Password <span className="label-hint">(min 6 characters)</span></label>
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
              placeholder="Re-enter new password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={pwLoading || !currentPassword || !newPassword || !confirmNewPassword}
          >
            <LockIcon size={15} />
            <span>{pwLoading ? "Updating Password..." : "Update Password"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
