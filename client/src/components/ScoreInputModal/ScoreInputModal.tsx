import React, { useState } from "react";
import "./ScoreInputModal.css";

interface ScoreInputModalProps {
  score: number;
  onSubmit: (nickname: string) => void;
}

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
    <div className="modal-overlay">
      <form onSubmit={handleSubmit} className="form-container">
        <h3 className="game-over-title">GAME OVER!</h3>
        <p className="score-text">
          Final Score: <strong className="final-score">{score}</strong>
        </p>
        <label className="label-nickname">
          Enter Nickname:
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            maxLength={15}
            className="input-field"
          />
        </label>
        <button type="submit" className="submit-button">
          Save Score
        </button>
      </form>
    </div>
  );
};

export default ScoreInputModal;
