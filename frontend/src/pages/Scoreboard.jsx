import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getScores } from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";
import {
  TrophyIcon,
  CrownIcon,
  MedalIcon,
  SearchIcon,
  RefreshIcon,
  PlayIcon,
  ShareIcon,
  UsersIcon,
  TargetIcon,
  StarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  XIcon,
} from "../components/Icons.jsx";

const getTier = (score) => {
  if (score >= 10) return { label: "Grand Master", badgeClass: "tier-grandmaster", icon: "crown" };
  if (score >= 8) return { label: "Clever Monkey", badgeClass: "tier-master", icon: "star" };
  if (score >= 5) return { label: "Adventurer", badgeClass: "tier-adventurer", icon: "target" };
  return { label: "Sprout", badgeClass: "tier-sprout", icon: "dot" };
};

const renderTierIcon = (iconType) => {
  if (iconType === "crown") return <CrownIcon size={13} className="tier-icon-svg" />;
  if (iconType === "star") return <StarIcon size={13} filled={true} className="tier-icon-svg" />;
  if (iconType === "target") return <TargetIcon size={13} className="tier-icon-svg" />;
  return <span className="tier-dot-marker" />;
};

function Scoreboard() {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("score");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const loadLeaderboard = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    setError("");

    try {
      const data = await getScores({ sortBy });
      let list = [];
      let globalStats = null;

      if (data && Array.isArray(data.scores)) {
        list = data.scores;
        globalStats = data.stats;
      } else if (Array.isArray(data)) {
        list = data;
      }

      setScores(list);
      if (globalStats) {
        setStats(globalStats);
      } else {
        // Fallback calculation from list
        setStats({
          totalPlayers: list.length,
          totalGames: list.reduce((acc, curr) => acc + (curr.gamesPlayed || 1), 0),
          highestScore: list.reduce((max, curr) => Math.max(max, curr.score || 0), 0),
          totalPoints: list.reduce((acc, curr) => acc + (curr.totalScore || curr.score || 0), 0),
          perfectCount: list.reduce((acc, curr) => acc + (curr.perfectGames || (curr.score === 10 ? 1 : 0)), 0),
        });
      }
    } catch {
      setError("Unable to load leaderboard. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getScores({ sortBy })
      .then((data) => {
        if (ignore) return;
        let list = [];
        let globalStats = null;

        if (data && Array.isArray(data.scores)) {
          list = data.scores;
          globalStats = data.stats;
        } else if (Array.isArray(data)) {
          list = data;
        }

        setScores(list);
        if (globalStats) {
          setStats(globalStats);
        } else {
          setStats({
            totalPlayers: list.length,
            totalGames: list.reduce((acc, curr) => acc + (curr.gamesPlayed || 1), 0),
            highestScore: list.reduce((max, curr) => Math.max(max, curr.score || 0), 0),
            totalPoints: list.reduce((acc, curr) => acc + (curr.totalScore || curr.score || 0), 0),
            perfectCount: list.reduce((acc, curr) => acc + (curr.perfectGames || (curr.score === 10 ? 1 : 0)), 0),
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          setError("Unable to load leaderboard. Please make sure the backend server is running.");
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [sortBy]);

  // Filter scores by search term
  const filteredScores = scores.filter((item) =>
    item.username.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  // Top 3 Podium
  const firstPlace = scores[0];
  const secondPlace = scores[1];
  const thirdPlace = scores[2];

  // User rank in unfiltered list
  const userRankIndex = scores.findIndex((s) => s.username === user?.username);
  const currentUserScore = userRankIndex !== -1 ? scores[userRankIndex] : null;

  const handleShare = () => {
    if (!currentUserScore) return;
    const rankNum = userRankIndex + 1;
    const shareText = `Ranked #${rankNum} on BananaQuiz with a score of ${currentUserScore.score}/10. Challenge your score on BananaQuiz.`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    }
  };

  return (
    <div className="scoreboard-container">
      {/* Header Banner */}
      <div className="scoreboard-header-card">
        <div className="scoreboard-title-group">
          <div className="scoreboard-icon-badge">
            <TrophyIcon size={24} />
          </div>
          <div>
            <h2>Global Leaderboard</h2>
            <p className="scoreboard-subtitle">
              Verified standings, high-score benchmarks, and player rankings
            </p>
          </div>
        </div>

        <div className="scoreboard-actions">
          <button
            type="button"
            className="btn-refresh"
            onClick={() => loadLeaderboard(true)}
            disabled={loading || refreshing}
            title="Refresh leaderboard"
          >
            <RefreshIcon size={14} className={refreshing ? "spin-icon" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <Link to="/quiz" className="btn-play-cta">
            <PlayIcon size={14} />
            <span>Start Quiz</span>
          </Link>
        </div>
      </div>

      {/* Global Community Statistics Ribbon */}
      {stats && (
        <div className="stats-ribbon">
          <div className="stat-pill">
            <span className="stat-pill-icon">
              <UsersIcon size={18} />
            </span>
            <div className="stat-pill-info">
              <span className="stat-pill-val">{stats.totalPlayers}</span>
              <span className="stat-pill-lbl">Active Players</span>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-icon">
              <PlayIcon size={18} />
            </span>
            <div className="stat-pill-info">
              <span className="stat-pill-val">{stats.totalGames}</span>
              <span className="stat-pill-lbl">Sessions Completed</span>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-icon">
              <TargetIcon size={18} />
            </span>
            <div className="stat-pill-info">
              <span className="stat-pill-val">{stats.totalPoints}</span>
              <span className="stat-pill-lbl">Points Scored</span>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-icon">
              <StarIcon size={18} filled={true} />
            </span>
            <div className="stat-pill-info">
              <span className="stat-pill-val">{stats.perfectCount || 0}</span>
              <span className="stat-pill-lbl">Perfect Scores (10/10)</span>
            </div>
          </div>
        </div>
      )}

      {/* Current User Highlight & Challenge Card */}
      {currentUserScore && (
        <div className="my-rank-card">
          <div className="my-rank-left">
            <div className="my-rank-number">
              <span className="rank-hash">#</span>
              <span className="rank-digit">{userRankIndex + 1}</span>
            </div>
            <div className="my-rank-details">
              <div className="my-rank-title-row">
                <h3>{user?.username} (You)</h3>
                <span className={`tier-badge ${getTier(currentUserScore.score).badgeClass}`}>
                  {renderTierIcon(getTier(currentUserScore.score).icon)}
                  <span>{getTier(currentUserScore.score).label}</span>
                </span>
              </div>
              <div className="my-rank-stats-row">
                <span>Best: <strong>{currentUserScore.score}/10</strong></span>
                <span className="stat-divider">•</span>
                <span>Sessions: <strong>{currentUserScore.gamesPlayed || 1}</strong></span>
                <span className="stat-divider">•</span>
                <span>Cumulative: <strong>{currentUserScore.totalScore || currentUserScore.score} pts</strong></span>
                {currentUserScore.perfectGames > 0 && (
                  <>
                    <span className="stat-divider">•</span>
                    <span className="perfect-stat">
                      <StarIcon size={12} filled={true} /> {currentUserScore.perfectGames} Perfect
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="my-rank-actions">
            <button
              type="button"
              className="btn-share-score"
              onClick={handleShare}
              title="Copy rank summary to clipboard"
            >
              {copiedShare ? (
                <>
                  <CheckCircleIcon size={14} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <ShareIcon size={14} />
                  <span>Share Rank</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="scoreboard-loading">
          <div className="spinner"></div>
          <p>Loading database rankings...</p>
        </div>
      ) : error ? (
        <div className="alert-box alert-error">
          <AlertCircleIcon size={18} className="alert-icon" />
          <span>{error}</span>
          <button
            type="button"
            className="btn-retry-inline"
            onClick={() => loadLeaderboard(true)}
          >
            Retry
          </button>
        </div>
      ) : scores.length === 0 ? (
        <div className="empty-scoreboard-card">
          <TrophyIcon size={40} className="empty-trophy-icon" />
          <h3>No Records Found</h3>
          <p>Complete a puzzle session to record your initial score on the leaderboard.</p>
          <Link to="/quiz" className="btn-primary">
            <PlayIcon size={16} />
            <span>Begin Session</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Olympic 3D-Tiered Podium: 2nd Place | 1st Place (Center, Elevated) | 3rd Place */}
          {firstPlace && (
            <div className="olympic-podium-section">
              <h3 className="section-title">Top Performers</h3>
              <div className="olympic-podium">
                {/* 2nd Place (Silver) */}
                {secondPlace ? (
                  <div
                    className={`podium-step podium-step-2 ${secondPlace.username === user?.username ? "is-current-user" : ""}`}
                    onClick={() => setSelectedPlayer(secondPlace)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="podium-pillar-header">
                      <span className="podium-medal-badge silver">
                        <MedalIcon size={12} /> Rank 2
                      </span>
                      <div className="podium-avatar silver-avatar">
                        {secondPlace.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="podium-player-name">{secondPlace.username}</span>
                      <span className="podium-score-pill">{secondPlace.score} pts</span>
                    </div>
                    <div className="podium-pedestal pedestal-2">
                      <span className="pedestal-num">2</span>
                    </div>
                  </div>
                ) : (
                  <div className="podium-step podium-step-empty"></div>
                )}

                {/* 1st Place (Gold, Tallest & Crowned) */}
                <div
                  className={`podium-step podium-step-1 ${firstPlace.username === user?.username ? "is-current-user" : ""}`}
                  onClick={() => setSelectedPlayer(firstPlace)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="podium-pillar-header">
                    <span className="crown-icon">
                      <CrownIcon size={18} />
                    </span>
                    <span className="podium-medal-badge gold">
                      <CrownIcon size={12} /> Rank 1
                    </span>
                    <div className="podium-avatar gold-avatar">
                      {firstPlace.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="podium-player-name champion-name">{firstPlace.username}</span>
                    <span className="podium-score-pill champion-score">{firstPlace.score} pts</span>
                  </div>
                  <div className="podium-pedestal pedestal-1">
                    <span className="pedestal-num">1</span>
                  </div>
                </div>

                {/* 3rd Place (Bronze) */}
                {thirdPlace ? (
                  <div
                    className={`podium-step podium-step-3 ${thirdPlace.username === user?.username ? "is-current-user" : ""}`}
                    onClick={() => setSelectedPlayer(thirdPlace)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="podium-pillar-header">
                      <span className="podium-medal-badge bronze">
                        <MedalIcon size={12} /> Rank 3
                      </span>
                      <div className="podium-avatar bronze-avatar">
                        {thirdPlace.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="podium-player-name">{thirdPlace.username}</span>
                      <span className="podium-score-pill">{thirdPlace.score} pts</span>
                    </div>
                    <div className="podium-pedestal pedestal-3">
                      <span className="pedestal-num">3</span>
                    </div>
                  </div>
                ) : (
                  <div className="podium-step podium-step-empty"></div>
                )}
              </div>
            </div>
          )}

          {/* Search Bar & Sort Filters */}
          <div className="leaderboard-controls-card">
            <div className="search-box">
              <span className="search-icon">
                <SearchIcon size={15} />
              </span>
              <input
                type="text"
                placeholder="Search player username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                  aria-label="Clear search"
                >
                  <XIcon size={14} />
                </button>
              )}
            </div>

            <div className="sort-tabs">
              <span className="sort-label">Order by:</span>
              <button
                type="button"
                className={`sort-tab-btn ${sortBy === "score" ? "active" : ""}`}
                onClick={() => setSortBy("score")}
              >
                Top Score
              </button>
              <button
                type="button"
                className={`sort-tab-btn ${sortBy === "games" ? "active" : ""}`}
                onClick={() => setSortBy("games")}
              >
                Sessions
              </button>
              <button
                type="button"
                className={`sort-tab-btn ${sortBy === "perfect" ? "active" : ""}`}
                onClick={() => setSortBy("perfect")}
              >
                Perfect 10s
              </button>
              <button
                type="button"
                className={`sort-tab-btn ${sortBy === "recent" ? "active" : ""}`}
                onClick={() => setSortBy("recent")}
              >
                Recent
              </button>
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="scoreboard-table-card">
            {filteredScores.length === 0 ? (
              <div className="no-search-results">
                <p>No players matched "<strong>{searchTerm}</strong>"</p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Filter
                </button>
              </div>
            ) : (
              <table className="scoreboard-table">
                <thead>
                  <tr>
                    <th className="col-rank">Rank</th>
                    <th className="col-player">Player</th>
                    <th className="col-tier">Tier</th>
                    <th className="col-score">High Score</th>
                    <th className="col-games">Sessions</th>
                    <th className="col-perfects">Perfect (10/10)</th>
                    <th className="col-date">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScores.map((item, i) => {
                    const isCurrent = item.username === user?.username;
                    const tier = getTier(item.score);
                    const rankNum = i + 1;
                    const dateStr = item.updatedAt
                      ? new Date(item.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "—";

                    return (
                      <tr
                        key={item.username}
                        className={`leaderboard-row ${isCurrent ? "current-user-row" : ""}`}
                        onClick={() => setSelectedPlayer(item)}
                        title="View player breakdown"
                      >
                        <td className="col-rank">
                          <span className={`rank-badge-text ${rankNum <= 3 ? `top-rank-${rankNum}` : ""}`}>
                            #{rankNum}
                          </span>
                        </td>
                        <td className="col-player">
                          <div className="player-cell">
                            <span className="player-avatar-mini">
                              {item.username.charAt(0).toUpperCase()}
                            </span>
                            <span className="player-username">
                              {item.username}
                              {isCurrent && <span className="you-pill">You</span>}
                            </span>
                          </div>
                        </td>
                        <td className="col-tier">
                          <span className={`tier-badge ${tier.badgeClass}`}>
                            {renderTierIcon(tier.icon)}
                            <span>{tier.label}</span>
                          </span>
                        </td>
                        <td className="col-score">
                          <span className="score-badge">{item.score} / 10</span>
                        </td>
                        <td className="col-games">
                          <span className="games-count">{item.gamesPlayed || 1}</span>
                        </td>
                        <td className="col-perfects">
                          <span className="perfect-count-badge">
                            {item.perfectGames || (item.score === 10 ? 1 : 0)}
                          </span>
                        </td>
                        <td className="col-date">{dateStr}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <div className="modal-backdrop" onClick={() => setSelectedPlayer(null)}>
          <div className="player-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedPlayer(null)}
              aria-label="Close dialog"
            >
              <XIcon size={16} />
            </button>

            <div className="modal-player-header">
              <div className="modal-avatar">
                {selectedPlayer.username.charAt(0).toUpperCase()}
              </div>
              <h3>{selectedPlayer.username}</h3>
              <span className={`tier-badge ${getTier(selectedPlayer.score).badgeClass}`}>
                {renderTierIcon(getTier(selectedPlayer.score).icon)}
                <span>{getTier(selectedPlayer.score).label}</span>
              </span>
            </div>

            <div className="modal-stats-grid">
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">High Score</span>
                <span className="modal-stat-val text-accent">{selectedPlayer.score} / 10</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">Sessions Completed</span>
                <span className="modal-stat-val">{selectedPlayer.gamesPlayed || 1}</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">Cumulative Points</span>
                <span className="modal-stat-val">{selectedPlayer.totalScore || selectedPlayer.score}</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">Perfect Scores</span>
                <span className="modal-stat-val text-success">
                  {selectedPlayer.perfectGames || (selectedPlayer.score === 10 ? 1 : 0)}
                </span>
              </div>
            </div>

            <p className="modal-footer-date">
              Last session recorded:{" "}
              {selectedPlayer.updatedAt
                ? new Date(selectedPlayer.updatedAt).toLocaleString()
                : "Recently"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Scoreboard;
