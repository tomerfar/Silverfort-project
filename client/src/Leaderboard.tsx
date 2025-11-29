// client/src/Leaderboard.tsx

import React from "react";
import { HighScore } from "./Types";

interface LeaderboardProps {
  data: HighScore[];
}

/**
 * Displays the Top 10 High Scores in a formatted list.
 */
const Leaderboard: React.FC<LeaderboardProps> = ({ data }) => {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>🏆 Top 10 High Scores</h3>
      {data.length === 0 ? (
        <p style={styles.noScores}>No scores submitted yet.</p>
      ) : (
        <ol style={styles.list}>
          {data.map((entry, index) => (
            <li key={index} style={styles.listItem}>
              <span style={styles.rank}>#{index + 1}</span>
              <span style={styles.name}>{entry.name}</span>
              <span style={styles.score}>
                <strong>{entry.score}</strong>
              </span>
              <span style={styles.date}>
                ({new Date(entry.date).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    margin: "20px auto",
    padding: "15px",
    border: "1px solid #FFD700",
    borderRadius: "12px",
    backgroundColor: "#333",
    maxWidth: "450px",
    width: "90%",
    boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
  },
  title: {
    color: "#FFD700",
    marginBottom: "10px",
    borderBottom: "1px solid #FFD70030",
    paddingBottom: "5px",
  },
  noScores: {
    color: "#ccc",
  },
  list: {
    textAlign: "left",
    listStyleType: "none",
    padding: 0,
    margin: 0,
  },
  listItem: {
    marginBottom: "8px",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0",
    borderBottom: "1px dotted #ffffff30",
    fontSize: "15px",
  },
  rank: {
    fontWeight: "bold",
    width: "20px",
    marginRight: "10px",
  },
  name: {
    flexGrow: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  score: {
    minWidth: "40px",
    textAlign: "right",
    marginLeft: "10px",
    color: "#61dafb",
  },
  date: {
    fontSize: "12px",
    color: "#aaa",
    marginLeft: "10px",
  },
};

export default Leaderboard;
