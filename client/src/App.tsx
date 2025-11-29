import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  GameState,
  HighScore,
  initialGameState,
  SOCKET_SERVER_URL,
  API_URL,
} from "./Types";
import GameGrid from "./components/GameGrid/GameGrid";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import ScoreInputModal from "./components/ScoreInputModal/ScoreInputModal";
import ToastNotification from "./components/ToastNotification/ToastNotification";
import "./App.css";

const socket = io(SOCKET_SERVER_URL);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  const [showScoreInput, setShowScoreInput] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<HighScore[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const closeToast = () => {
    setToastMessage(null);
  };

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await axios.get<HighScore[]>(
        `${API_URL}/api/leaderboard`
      );
      setLeaderboardData(response.data);
      setShowLeaderboard(true);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      setShowLeaderboard(false);
    }
  }, []);

  const handleLeaderboardToggle = () => {
    if (showLeaderboard) {
      setShowLeaderboard(false);
    } else {
      fetchLeaderboard();
    }
  };

  const handleSubmitScore = (nickname: string) => {
    if (nickname.trim() && gameState.score > 0) {
      socket.emit("submitScore", {
        name: nickname.trim(),
        score: gameState.score,
      });

      setShowScoreInput(false);
      fetchLeaderboard();
    }
  };

  useEffect(() => {
    // 1. Connection Management
    socket.on("connect", () => {
      setConnectionStatus("Connected. Waiting for game state...");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected. Server may be down.");
    });

    // 2. Real-Time Game State Update
    socket.on("gameStateUpdate", (newGameState: GameState) => {
      setGameState(newGameState);
      setConnectionStatus("Connected: Real-time update received.");

      if (newGameState.isActive) {
        setShowScoreInput(false);
      }
    });

    // 3. Game Over Event
    socket.on("gameOver", (data: { finalScore: number }) => {
      if (data.finalScore > 0) {
        setShowScoreInput(true);
      }
    });

    // Cleanup
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("gameStateUpdate");
      socket.off("gameOver");
    };
  }, [fetchLeaderboard]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameState.isActive) {
      showToast("Game is not active! Please refresh to start.");
      return;
    }

    const cell = gameState.grid[row][col];

    if (cell && cell.cooldown > 0) {
      showToast(`Cell is cooling down. Ready in ${cell.cooldown} turns.`);
      return;
    }
    socket.emit("playerClick", { row, col });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="App-title">Multi-Session Grid Game</h1>
        <p className="status-text">
          Connection Status: <strong>{connectionStatus}</strong>
        </p>

        {/* Leaderboard Button */}
        <button
          onClick={handleLeaderboardToggle}
          className="leaderboard-toggle-btn"
        >
          {showLeaderboard ? "🔼 Hide Leaderboard" : "🏆 Show Leaderboard"}
        </button>

        {/* Score Input Modal */}
        {showScoreInput && (
          <ScoreInputModal
            score={gameState.score}
            onSubmit={handleSubmitScore}
          />
        )}

        {/* Leaderboard Display */}
        {showLeaderboard && <Leaderboard data={leaderboardData} />}

        {/* Core Game UI */}
        <div className="game-container">
          <h2 className="current-score">Score: {gameState.score}</h2>

          {!gameState.isActive && gameState.score > 0 && !showScoreInput && (
            <h2 className="game-over-text">
              GAME OVER! Final Score: {gameState.score}
            </h2>
          )}

          {/* Game Grid */}
          {gameState.grid.length > 0 && (
            <GameGrid gameState={gameState} onCellClick={handleCellClick} />
          )}
        </div>

        {/* Toast */}
        {toastMessage && (
          <ToastNotification message={toastMessage} onClose={closeToast} />
        )}
      </header>
    </div>
  );
};

export default App;
