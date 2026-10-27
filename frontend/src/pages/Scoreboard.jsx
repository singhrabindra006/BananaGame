import React, { useState, useEffect } from "react";
import { getScores } from "../services/api";

function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  // EVENT: Component mount - fetch scores from backend/MongoDB
  useEffect(() => {
    getScores()
      .then((data) => setScores(data.sort((a, b) => b.score - a.score)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="scoreboard-page">
      <h2>🏆 Leaderboard</h2>
      {loading ? (
        <p>Loading scores...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s, i) => (
              <tr key={s.username}>
                <td>{i + 1}</td>
                <td>{s.username}</td>
                <td>{s.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Scoreboard;
