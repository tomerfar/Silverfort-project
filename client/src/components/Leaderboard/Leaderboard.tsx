import React from "react";
import { HighScore } from "../../Types";
import "./Leaderboard.css";

interface LeaderboardProps {
  data: HighScore[];
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  return (
    <div className="leaderboard-container">
      <h3 className="leaderboard-title">🏆 Top 10 High Scores</h3>
      {data.length === 0 ? (
        <p className="no-scores">No scores submitted yet.</p>
      ) : (
        <ol className="score-list">
          {data.map((entry, index) => (
            <li key={index} className="list-item">
              <span className="item-rank">#{index + 1}</span>
              <span className="item-name">{entry.name}</span>
              <span className="item-score">
                <strong>{entry.score}</strong>
              </span>
              <span className="item-date">
                ({new Date(entry.date).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default Leaderboard;
