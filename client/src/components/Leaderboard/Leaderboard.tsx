import React, { useEffect, useState } from "react";
import { HighScore } from "../../Types";
import "./Leaderboard.css";

interface LeaderboardProps {
  data: HighScore[];
  isVisible: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data, isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else if (shouldRender) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isVisible, shouldRender]);

  if (!shouldRender) return null;

  const animationClass = isVisible
    ? "leaderboard-enter-active"
    : "leaderboard-exit-active";

  return (
    <div
      className={`leaderboard-container ${animationClass}`}
      role="dialog"
      aria-modal="true"
      aria-label="High Scores Leaderboard"
    >
      <h3 className="leaderboard-title">🏆 Top 10 High Scores</h3>
      {data.length === 0 ? (
        <p className="no-scores">No scores submitted yet.</p>
      ) : (
        <>
          <div className="list-header">
            <span className="item-rank">No</span>
            <span className="item-name">Name</span>
            <span className="item-score">Score</span>
            <span className="item-date">Date</span>
          </div>

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
        </>
      )}
    </div>
  );
};

export default Leaderboard;
