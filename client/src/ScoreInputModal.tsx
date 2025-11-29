// client/src/ScoreInputModal.tsx

import React, { useState } from "react";

interface ScoreInputModalProps {
  score: number;
  onSubmit: (nickname: string) => void;
}

/**
 * Modal/Form for entering a nickname after the game is over.
 */
const ScoreInputModal: React.FC<ScoreInputModalProps> = ({
  score,
  onSubmit,
}) => {
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      onSubmit(nickname);
    }
  };

  return (
    <div style={styles.overlay}>
      <form onSubmit={handleSubmit} style={styles.formContainer}>
        <h3 style={styles.gameOverTitle}>GAME OVER!</h3>
        <p style={styles.scoreText}>
          Final Score: <strong style={styles.finalScore}>{score}</strong>
        </p>
        <label style={styles.label}>
          Enter Nickname:
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength={15}
            style={styles.inputField}
          />
        </label>
        <button type="submit" style={styles.submitButton}>
          Save Score
        </button>
      </form>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  formContainer: {
    padding: "25px",
    border: "3px solid #ff6b6b", // Red border for game over
    borderRadius: "12px",
    backgroundColor: "#444",
    maxWidth: "350px",
    textAlign: "center",
    boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
  },
  gameOverTitle: {
    color: "#ff6b6b",
    fontSize: "24px",
    marginBottom: "10px",
  },
  scoreText: {
    color: "#fff",
    marginBottom: "20px",
  },
  finalScore: {
    color: "#61dafb",
  },
  label: {
    color: "#fff",
    display: "block",
    marginBottom: "15px",
    fontSize: "16px",
  },
  inputField: {
    marginLeft: "10px",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "150px",
  },
  submitButton: {
    padding: "10px 20px",
    backgroundColor: "#ff6b6b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
  },
};

export default ScoreInputModal;
