import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios"; // ייבוא axios לטעינת Leaderboard
import "./App.css";

const SOCKET_SERVER_URL = "http://localhost:3001";
const API_URL = "http://localhost:3001"; // כתובת בסיס ל-REST API

// --- הגדרת טיפוסים (Types) ---
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

interface HighScore {
  name: string;
  score: number;
  date: string;
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

  // States חדשים ל-Leaderboard ול-Game Over
  const [showScoreInput, setShowScoreInput] = useState(false);
  const [nickname, setNickname] = useState("");
  const [leaderboardData, setLeaderboardData] = useState<HighScore[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // --- פונקציות API ---

  // טעינת טבלת ה-Leaderboard משרת ה-REST API
  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/leaderboard`);
      setLeaderboardData(response.data);
      // ********************
      // *** תיקון עיקרי: הצג רק אחרי שהנתונים הגיעו בהצלחה ***
      setShowLeaderboard(true);
      // ********************
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      setShowLeaderboard(false); // אם נכשל, ודא שה-UI לא תקוע במצב הצגה
    }
  };

  // פונקציה שמטפלת בלחיצה על כפתור ה-Leaderboard
  const handleLeaderboardToggle = () => {
    // אם אנחנו מסתירים, פשוט שנה את המצב ל-false
    if (showLeaderboard) {
      setShowLeaderboard(false);
    } else {
      // אם אנחנו מציגים: טען את הנתונים (הפונקציה עצמה תגדיר setShowLeaderboard(true))
      fetchLeaderboard();
    }
  };

  // שליחת הניקוד לשרת ה-Socket.IO לאחר סיום המשחק
  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && gameState.score > 0) {
      // שליחת הניקוד והכינוי לשרת ה-Socket
      socket.emit("submitScore", {
        name: nickname.trim(),
        score: gameState.score,
      });

      // ניקוי המצב
      setShowScoreInput(false);
      setNickname("");
      fetchLeaderboard(); // רענן את ה-Leaderboard מיד לאחר שמירה
    }
  };

  // --- ניהול Socket.IO ו-Side Effects ---

  useEffect(() => {
    // --- 1. ניהול חיבור ---
    socket.on("connect", () => {
      setConnectionStatus("Connected! Waiting for game state...");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("Disconnected. Server may be down.");
    });

    // --- 2. קבלת עדכוני מצב משחק (Real-Time) ---
    socket.on("gameStateUpdate", (newGameState: GameState) => {
      setGameState(newGameState);
      setConnectionStatus("Connected: Real-time update received.");

      if (newGameState.isActive) {
        setShowScoreInput(false);
      }
    });

    // --- 3. טיפול באירוע Game Over (Bonus 1) ---
    socket.on("gameOver", (data: { finalScore: number }) => {
      // מציג את טופס הניקוד רק אם המשחק הסתיים בניקוד חיובי
      if (data.finalScore > 0) {
        setShowScoreInput(true);
      }
    });

    // --- Cleanup ---
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("gameStateUpdate");
      socket.off("gameOver");
    };
  }, []);

  // --- 4. שליחת מהלך לשרת ---
  const handleCellClick = (row: number, col: number) => {
    // נשתמש ב-Alerts כי זה מה שהשתמשנו בו קודם (במבחן בית היינו משתמשים במודל UI)
    if (!gameState.isActive) {
      alert("Game is not active! Please refresh to start a new game.");
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

  // --- 5. הצגת ה-UI ---
  return (
    <div className="App">
      <header className="App-header">
        <h1>Multi-Session Game 🕹️</h1>
        <p>
          Connection Status: <strong>{connectionStatus}</strong>
        </p>

        {/* כפתור Leaderboard */}
        <button
          onClick={handleLeaderboardToggle}
          style={{
            margin: "15px",
            padding: "10px 20px",
            backgroundColor: "#FFD700",
            color: "#333",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {showLeaderboard ? "🔼 Hide Leaderboard" : "🏆 Show Leaderboard"}
        </button>

        {/* רכיב Leaderboard */}
        {showLeaderboard && (
          <div
            style={{
              margin: "20px",
              padding: "15px",
              border: "1px solid #FFD700",
              borderRadius: "8px",
              backgroundColor: "#333",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <h3 style={{ color: "#FFD700" }}>🏆 Top 10 High Scores</h3>
            {leaderboardData.length === 0 ? (
              <p>No scores submitted yet.</p>
            ) : (
              <ol
                style={{
                  textAlign: "left",
                  margin: "0 auto",
                  maxWidth: "300px",
                }}
              >
                {leaderboardData.map((entry, index) => (
                  <li
                    key={index}
                    style={{ marginBottom: "5px", color: "#fff" }}
                  >
                    {index + 1}. {entry.name} - <strong>{entry.score}</strong> (
                    {new Date(entry.date).toLocaleDateString()})
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* הצגת ה-Score */}
        <h2>Score: {gameState.score}</h2>

        {/* טופס Game Over ושמירת ניקוד */}
        {showScoreInput && (
          <form
            onSubmit={handleSubmitScore}
            style={{
              margin: "20px",
              padding: "15px",
              border: "2px solid red",
              borderRadius: "8px",
              backgroundColor: "#555",
              maxWidth: "400px",
            }}
          >
            <h3 style={{ color: "red" }}>GAME OVER!</h3>
            <p>
              Final Score: <strong>{gameState.score}</strong>
            </p>
            <label style={{ color: "#fff" }}>
              Enter Nickname:
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                maxLength={15}
                style={{
                  marginLeft: "10px",
                  padding: "5px",
                  borderRadius: "3px",
                }}
              />
            </label>
            <button
              type="submit"
              style={{ marginLeft: "10px", padding: "5px 10px" }}
            >
              Save Score
            </button>
          </form>
        )}

        {/* הצגת ה-Game Over (אם הניקוד לא נשמר עדיין) */}
        {!gameState.isActive && gameState.score > 0 && !showScoreInput && (
          <h2 style={{ color: "red" }}>
            GAME OVER! (Score: {gameState.score})
          </h2>
        )}

        {/* בניית הלוח */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "5px",
            border: "2px solid white",
            padding: "10px",
            marginTop: "20px",
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
                  transition: "opacity 0.3s",
                }}
              >
                {/* הצגת הצורה */}
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
                      backgroundColor: "rgba(0,0,0,0.8)",
                      color: "white",
                      borderRadius: "50%",
                      padding: "2px 5px",
                      fontSize: "10px",
                      fontWeight: "bold",
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
