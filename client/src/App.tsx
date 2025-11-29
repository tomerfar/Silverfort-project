// client/src/App.tsx

import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";
import axios from "axios";
// ייבוא קובץ הטיפוסים (בהנחה ששם הקובץ הוא 'Types.ts')
import {
  GameState,
  HighScore,
  initialGameState,
  SOCKET_SERVER_URL,
  API_URL,
} from "./Types";
import GameGrid from "./GameGrid";
import Leaderboard from "./Leaderboard";
import ScoreInputModal from "./ScoreInputModal";
import ToastNotification from "./ToastNotification";

// ... (socket initialization, App component definition, state, API functions)

const socket = io(SOCKET_SERVER_URL);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  // Leaderboard and Game Over States
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<HighScore[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // *** NEW STATE FOR TOAST ***
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Function to show the toast notification
  const showToast = (message: string) => {
    setToastMessage(message);
    // The ToastNotification component will handle auto-closing via its onClose prop
  };

  // Function to close the toast notification
  const closeToast = () => {
    setToastMessage(null);
  };
  // --- API Functions (Omitted for brevity - same as before) ---
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

  // --- Socket.IO Handlers (Omitted for brevity - same as before) ---
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

  // --- 4. שליחת מהלך לשרת (Updated Logic) ---
  const handleCellClick = (row: number, col: number) => {
    if (!gameState.isActive) {
      // Replaced alert() with showToast()
      showToast("Game is not active! Please refresh to start.");
      return;
    }

    const cell = gameState.grid[row][col];

    if (cell && cell.cooldown > 0) {
      // *** Replaced alert() with showToast() for cooldown ***
      showToast(`Cell is cooling down. Ready in ${cell.cooldown} turns.`);
      return;
    }

    // Sending interaction to the server
    socket.emit("playerClick", { row, col });
  };

  // --- 5. הצגת ה-UI ---
  return (
    <div className="App" style={appStyles.container}>
      <header style={appStyles.header}>
        <h1 style={appStyles.h1}>Multi-Session Grid Game 🕹️</h1>
        <p style={appStyles.statusText}>
          Connection Status: <strong>{connectionStatus}</strong>
        </p>

        {/* Leaderboard Button */}
        <button
          onClick={handleLeaderboardToggle}
          style={appStyles.leaderboardButton}
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
        <div style={appStyles.gameContainer}>
          <h2 style={appStyles.score}>Score: {gameState.score}</h2>

          {!gameState.isActive && gameState.score > 0 && !showScoreInput && (
            <h2 style={appStyles.gameOverText}>
              GAME OVER! Final Score: {gameState.score}
            </h2>
          )}

          {/* Game Grid */}
          {gameState.grid.length > 0 && (
            <GameGrid gameState={gameState} onCellClick={handleCellClick} />
          )}
        </div>

        {/* *** RENDER THE TOAST NOTIFICATION *** */}
        {toastMessage && (
          <ToastNotification message={toastMessage} onClose={closeToast} />
        )}
      </header>
    </div>
  );
};

// --- Inline Styles (Omitted for brevity - same as before) ---
const appStyles: { [key: string]: React.CSSProperties } = {
  // ... same as before
  container: {
    textAlign: "center",
    backgroundColor: "#282c34",
    minHeight: "100vh",
    color: "white",
    padding: "20px 0",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "calc(10px + 2vmin)",
  },
  h1: {
    color: "#61dafb",
  },
  statusText: {
    fontSize: "14px",
    color: "#ccc",
  },
  leaderboardButton: {
    margin: "15px",
    padding: "10px 20px",
    backgroundColor: "#FFD700",
    color: "#333",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s",
    boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
  },
  score: {
    color: "#fff",
    margin: "10px 0",
  },
  gameOverText: {
    color: "#ff6b6b",
    animation: "pulse 1s infinite",
  },
  gameContainer: {
    marginTop: "20px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};

export default App;
