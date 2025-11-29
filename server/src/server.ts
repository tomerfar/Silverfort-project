// server/src/server.ts

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import * as fs from "fs";
import * as path from "path";
// ----------------------------------------------
// --- ייבוא מהמודולים השונים ---
import { ROWS, COLS, GameState, HighScore } from "./types";
import { createNewGame, processPlayerClick } from "./gameLogic"; // ייבוא לוגיקת המשחק
// ----------------------------------------------

const app = express();
const httpServer = createServer(app);
const PORT = 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

// הגדרת Socket.IO: מאפשר לכל Client להתחבר (CORS)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // פורט ה-React Client
    methods: ["GET", "POST"],
  },
});

// מצב המשחק הגלובלי (מאותחל מאוחר יותר)
let gameState: GameState = {
  score: 0,
  grid: [],
  isActive: false,
};

// **פונקציות לוגיקת משחק נמחקו מכאן (כגון getRandomValue, generateInitialGrid, isMoveValid, resetGame)**
// **והועברו ל-gameLogic.ts**

// --- לוגיקת Leaderboard (Persistence) ---
const LEADERBOARD_FILE = path.join(__dirname, "leaderboard.json");
let leaderboard: HighScore[] = [];

// ... (שאר פונקציות Leaderboard)
const loadLeaderboard = () => {
  try {
    if (fs.existsSync(LEADERBOARD_FILE)) {
      const data = fs.readFileSync(LEADERBOARD_FILE, "utf-8");
      leaderboard = JSON.parse(data);
      console.log(`Leaderboard loaded with ${leaderboard.length} entries.`);
    }
  } catch (e) {
    console.error("Error loading leaderboard:", e);
  }
};

const saveLeaderboard = () => {
  try {
    // שמור רק את 10 התוצאות הטובות ביותר (בונוס)
    const topScores = leaderboard
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(topScores, null, 2));
  } catch (e) {
    console.error("Error saving leaderboard:", e);
  }
};

const addScoreToLeaderboard = (name: string, score: number) => {
  if (score > 0) {
    const newScore: HighScore = {
      name,
      score,
      date: new Date().toISOString(),
    };
    leaderboard.push(newScore);
    saveLeaderboard();
  }
};

app.get("/api/leaderboard", (req, res) => {
  // שלח את ה-10 התוצאות הטובות ביותר, ממוינות
  const top10 = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
  res.json(top10);
});

// --- 2. לוגיקת חיבור לקוח ---
io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit("gameStateUpdate", gameState);

  socket.on("playerClick", (data: { row: number; col: number }) => {
    const { row, col } = data;

    // --- שימוש ב-processPlayerClick המודולרית ---
    const updatedState = processPlayerClick(gameState, row, col);

    if (updatedState === null) {
      // המשחק נגמר (processPlayerClick החזירה null)
      // נשמור את התוצאה הסופית לשליחה ללקוח לפני איפוס
      const finalScore = gameState.score;

      // עדכון ה-gameState הגלובלי למצב Game Over
      gameState.isActive = false; // למקרה שזה לא עודכן בפונקציה
      io.emit("gameOver", { finalScore });
    } else {
      // עדכון מצב המשחק הגלובלי
      gameState = updatedState;

      // אם המשחק פעיל, נשלח עדכון מצב
      if (gameState.isActive) {
        io.emit("gameStateUpdate", gameState);
      }
    }
  });

  socket.on("submitScore", (data: { name: string; score: number }) => {
    const { name, score } = data;
    addScoreToLeaderboard(name, score);
    console.log(`Score submitted: ${name} with ${score}`);

    // **החלפת resetGame ב-createNewGame**
    gameState = createNewGame();
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- 3. הפעלת השרת ---
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);

  // טען את ה-Leaderboard הקיים
  loadLeaderboard();

  // *** אתחול מצב המשחק הראשי ***
  // **החלפת האתחול הישיר ב-createNewGame**
  gameState = createNewGame();

  // שלח עדכון מצב משחק לכל הלקוחות הקיימים
  io.emit("gameStateUpdate", gameState);

  console.log("Game State Initialized. Ready to play!");
});
