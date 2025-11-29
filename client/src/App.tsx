// client/src/App.tsx

import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const SOCKET_SERVER_URL = "http://localhost:3001";

// הגדרת ה-Types כפי שמוגדרים בשרת (חובה ב-TS)
interface Cell {
  shape: string;
  color: string;
  cooldown: number;
}

interface GameState {
  score: number;
  grid: Cell[][];
  isActive: boolean;
}

// אתחול מצב הדיפולט של הלוח
const initialGameState: GameState = {
  score: 0,
  grid: [],
  isActive: false,
};

const socket = io(SOCKET_SERVER_URL);

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [connectionStatus, setConnectionStatus] = useState("Connecting...");

  useEffect(() => {
    // --- 1. ניהול חיבור ---
    socket.on("connect", () => {
      setConnectionStatus("Connected! Waiting for game state...");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected. Server may be down.");
    });

    // --- 2. קבלת עדכוני מצב משחק ---
    socket.on("gameStateUpdate", (newGameState: GameState) => {
      setGameState(newGameState);
      setConnectionStatus("Connected: Real-time update received.");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("gameStateUpdate");
    };
  }, []);

  // --- 3. שליחת מהלך לשרת ---
  const handleCellClick = (row: number, col: number) => {
    if (!gameState.isActive) {
      alert("Game is not active!");
      return;
    }
    if (gameState.grid[row][col].cooldown > 0) {
      alert(
        `Cell is in cooldown for ${gameState.grid[row][col].cooldown} turns.`
      );
      return;
    }

    // שליחת האינטראקציה לשרת
    socket.emit("playerClick", { row, col });
  };

  // --- 4. הצגת ה-UI ---
  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Session Game 🕹️</h1>
        <p>
          Connection Status: <strong>{connectionStatus}</strong>
        </p>

        {/* הצגת ה-Score */}
        <h2>Score: {gameState.score}</h2>

        {/* הצגת ה-Game Over */}
        {!gameState.isActive && gameState.score > 0 && (
          <h2 style={{ color: "red" }}>GAME OVER!</h2>
        )}

        {/* בניית הלוח */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "5px",
            border: "2px solid white",
            padding: "10px",
          }}
        >
          {gameState.grid.flatMap((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                style={{
                  width: "80px",
                  height: "80px",
                  backgroundColor: cell.color, // צבע הרקע
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: cell.cooldown > 0 ? "not-allowed" : "pointer",
                  opacity: cell.cooldown > 0 ? 0.5 : 1,
                  border: cell.cooldown > 0 ? "3px dashed black" : "none",
                  position: "relative",
                }}
              >
                {/* הצגת הצורה (ניתן לשפר ל-SVG/Canvas בהמשך) */}
                <span
                  style={{
                    fontSize: "30px",
                    color: "white",
                    textShadow: "0 0 5px black",
                  }}
                >
                  {cell.shape.charAt(0)}
                </span>

                {/* הצגת ה-Cooldown */}
                {cell.cooldown > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      backgroundColor: "black",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 5px",
                      fontSize: "10px",
                    }}
                  >
                    {cell.cooldown}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </header>
    </div>
  );
};

export default App;
