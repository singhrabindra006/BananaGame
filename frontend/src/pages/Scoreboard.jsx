import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getScores } from "../services/api";
import { useAuth } from "../context/AuthContext.jsx";

const getTier = (score) => {
  if (score >= 10) return { label: "Grand Master", icon: "👑", badgeClass: "tier-grandmaster" };
  if (score >= 8) return { label: "Clever Monkey", icon: "🐒", badgeClass: "tier-master" };
  if (score >= 5) return { label: "Adventurer", icon: "🌴", badgeClass: "tier-adventurer" };
  return { label: "Sprout", icon: "🌱", badgeClass: "tier-sprout" };
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
    const shareText = `🍌 I'm ranked #${rankNum} on BananaQuiz with a high score of ${currentUserScore.score}/10! Think you can beat me? Play now!`;

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
          <div className="scoreboard-icon-badge">🏆</div>
          <div>
            <h2>Banana Hall of Fame</h2>
            <p className="scoreboard-subtitle">
              Compete with players worldwide and claim your place on the podium
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
            {refreshing ? "Refreshing..." : "🔄 Refresh"}
          </button>
          <Link to="/quiz" className="btn-play-cta">
            🎮 Play Quiz
          </Link>
        </div>
      </div>

      {/* Global Community Statistics Ribbon */}
      {stats && (
        <div className="stats-ribbon">
          <div className="stat-pill">
            <span className="stat-pill-icon">👥</span>
            <div className="stat-pill-info">
              <span className="stat-pill-val">{stats.totalPlayers}</span>
              <span className="stat-pill-lbl">Players</span>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-icon">🎮</span>
            <div className="stat-pill-info">
              <span className="stat-pill-val">{stats.totalGames}</span>
              <span className="stat-pill-lbl">Games Played</span>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-icon">🍌</span>
            <div className="stat-pill-info">
              <span className="stat-pill-val">{stats.totalPoints}</span>
              <span className="stat-pill-lbl">Bananas Earned</span>
            </div>
          </div>
          <div className="stat-pill">
            <span className="stat-pill-icon">⭐</span>
            <div className="stat-pill-info">
              <span className="stat-pill-val">{stats.perfectCount || 0}</span>
              <span className="stat-pill-lbl">10/10 Perfects</span>
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
                  {getTier(currentUserScore.score).icon} {getTier(currentUserScore.score).label}
                </span>
              </div>
              <div className="my-rank-stats-row">
                <span>Best: <strong>{currentUserScore.score}/10</strong></span>
                <span>•</span>
                <span>Games: <strong>{currentUserScore.gamesPlayed || 1}</strong></span>
                <span>•</span>
                <span>Total Bananas: <strong>{currentUserScore.totalScore || currentUserScore.score}</strong></span>
                {currentUserScore.perfectGames > 0 && (
                  <>
                    <span>•</span>
                    <span className="perfect-stat">⭐ {currentUserScore.perfectGames} Perfects</span>
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
              title="Copy score challenge to clipboard"
            >
              {copiedShare ? "✅ Copied to Clipboard!" : "📋 Share Rank"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="scoreboard-loading">
          <div className="spinner"></div>
          <p>Fetching top scores from database...</p>
        </div>
      ) : error ? (
        <div className="alert-box alert-error">
          <span className="alert-icon">⚠️</span>
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
          <span className="empty-banana-emoji">🍌</span>
          <h3>No scores recorded yet!</h3>
          <p>Be the very first player to set a high score in the Hall of Fame.</p>
          <Link to="/quiz" className="btn-primary">
            Start Playing Now 🚀
          </Link>
        </div>
      ) : (
        <>
          {/* True Olympic 3D-Tiered Podium: 2nd Place | 1st Place (Center, Elevated) | 3rd Place */}
          {firstPlace && (
            <div className="olympic-podium-section">
              <h3 className="section-title">✨ Top Champions</h3>
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
                      <span className="podium-medal-badge silver">🥈 2nd</span>
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
                    <span className="crown-icon">👑</span>
                    <span className="podium-medal-badge gold">🥇 1st Place</span>
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
                      <span className="podium-medal-badge bronze">🥉 3rd</span>
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
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search player by name..."
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
                  ✕
                </button>
              )}
            </div>

            <div className="sort-tabs">
              <span className="sort-label">Sort By:</span>
              <button
                type="button"
                className={`sort-tab-btn ${sortBy === "score" ? "active" : ""}`}
                onClick={() => setSortBy("score")}
              >
                🏆 High Score
              </button>
              <button
                type="button"
                className={`sort-tab-btn ${sortBy === "games" ? "active" : ""}`}
                onClick={() => setSortBy("games")}
              >
                🎮 Games Played
              </button>
              <button
                type="button"
                className={`sort-tab-btn ${sortBy === "perfect" ? "active" : ""}`}
                onClick={() => setSortBy("perfect")}
              >
                ⭐ Perfect 10s
              </button>
              <button
                type="button"
                className={`sort-tab-btn ${sortBy === "recent" ? "active" : ""}`}
                onClick={() => setSortBy("recent")}
              >
                ⏱️ Recent
              </button>
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="scoreboard-table-card">
            {filteredScores.length === 0 ? (
              <div className="no-search-results">
                <p>No players found matching "<strong>{searchTerm}</strong>"</p>
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
                    <th className="col-games">Games</th>
                    <th className="col-perfects">⭐ 10/10</th>
                    <th className="col-date">Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScores.map((item, i) => {
                    const isCurrent = item.username === user?.username;
                    const tier = getTier(item.score);
                    const rankDisplay = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
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
                        title="Click to view player stats"
                      >
                        <td className="col-rank">
                          <span className="rank-badge-text">{rankDisplay}</span>
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
                            {tier.icon} {tier.label}
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
              ✕
            </button>

            <div className="modal-player-header">
              <div className="modal-avatar">
                {selectedPlayer.username.charAt(0).toUpperCase()}
              </div>
              <h3>{selectedPlayer.username}</h3>
              <span className={`tier-badge ${getTier(selectedPlayer.score).badgeClass}`}>
                {getTier(selectedPlayer.score).icon} {getTier(selectedPlayer.score).label}
              </span>
            </div>

            <div className="modal-stats-grid">
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">High Score</span>
                <span className="modal-stat-val text-accent">{selectedPlayer.score} / 10</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">Games Played</span>
                <span className="modal-stat-val">{selectedPlayer.gamesPlayed || 1}</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">Total Bananas</span>
                <span className="modal-stat-val">{selectedPlayer.totalScore || selectedPlayer.score}</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-lbl">10/10 Perfects</span>
                <span className="modal-stat-val text-success">
                  {selectedPlayer.perfectGames || (selectedPlayer.score === 10 ? 1 : 0)} ⭐
                </span>
              </div>
            </div>

            <p className="modal-footer-date">
              Last puzzle played:{" "}
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
