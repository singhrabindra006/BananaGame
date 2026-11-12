import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getMe, changePassword } from "../services/api";
import {
  UserIcon,
  LockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TargetIcon,
  TrophyIcon,
  StarIcon,
  ShieldIcon,
} from "../components/Icons.jsx";

const getTier = (score) => {
  if (score >= 10) return { label: "Grand Master", badgeClass: "tier-grandmaster" };
  if (score >= 8) return { label: "Advanced", badgeClass: "tier-master" };
  if (score >= 5) return { label: "Intermediate", badgeClass: "tier-adventurer" };
  return { label: "Foundational", badgeClass: "tier-sprout" };
};

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <p>Loading profile details...</p>
      </div>
    );
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "November 2026";

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "U";
  const userTier = getTier(profile?.highScore || 0);

  return (
    <div className="profile-container">
      {/* Profile Summary Header */}
      <div className="profile-header-card">
        <div className="profile-header-main">
          <div className="profile-avatar-large">
            <span className="profile-avatar-initial">{userInitial}</span>
            <span className="profile-status-indicator" title="Active Account" />
          </div>

          <div className="profile-info">
            <div className="profile-title-row">
              <h2>{user?.username}</h2>
              <span className={`tier-badge ${userTier.badgeClass}`}>
                {userTier.label}
              </span>
              <span className="account-verified-pill">
                <CheckCircleIcon size={12} /> Verified Player
              </span>
            </div>
            <p className="profile-subtitle">
              Member since {joinDate}
            </p>
          </div>
        </div>

        <div className="profile-header-kpis">
          <div className="header-kpi-item">
            <span className="header-kpi-val">{profile?.highScore || 0}/10</span>
            <span className="header-kpi-lbl">Top Score</span>
          </div>
          <div className="header-kpi-divider" />
          <div className="header-kpi-item">
            <span className="header-kpi-val">{profile?.gamesPlayed || 0}</span>
            <span className="header-kpi-lbl">Sessions</span>
          </div>
          <div className="header-kpi-divider" />
          <div className="header-kpi-item">
            <span className="header-kpi-val">{profile?.totalPoints || 0}</span>
            <span className="header-kpi-lbl">Total Points</span>
          </div>
        </div>
      </div>

      {/* Career Performance Overview */}
      <div className="profile-section-card">
        <div className="section-title-wrap">
          <TargetIcon size={18} className="section-title-icon" />
          <h3>Performance Analytics</h3>
        </div>
        <p className="section-desc">Summary of your puzzle solving statistics and rankings</p>

        <div className="profile-stats-grid">
          <div className="stat-box">
            <span className="stat-label">Personal Best</span>
            <span className="stat-value text-accent">{profile?.highScore || 0} / 10</span>
          </div>
          <div className="stat-box">
            <span className="stat-label">Completed Sessions</span>
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

      {/* Security & Credentials */}
      <div className="profile-section-card">
        <div className="section-title-wrap">
          <LockIcon size={18} className="section-title-icon" />
          <h3>Security & Password</h3>
        </div>
        <p className="section-desc">Manage your password to ensure secure access to your account</p>

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

        <form onSubmit={handleChangePassword} className="auth-form profile-pw-form">
          <div className="form-group">
            <label htmlFor="cur-pass">Current Password</label>
            <input
              id="cur-pass"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
            />
          </div>

          <div className="form-row-two-col">
            <div className="form-group">
              <label htmlFor="new-pass">
                New Password <span className="label-hint">(min 6 characters)</span>
              </label>
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
          </div>

          <div className="profile-form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={pwLoading || !currentPassword || !newPassword || !confirmNewPassword}
            >
              <LockIcon size={15} />
              <span>{pwLoading ? "Updating Password..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
