// server/src/server.ts

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
// ייבוא מובנה נשאר
// import * as fs from "fs";
// import * as path from "path";

// ----------------------------------------------
// --- ייבוא מהמודולים השונים ---
import { GameState } from "./types";
import { createNewGame, processPlayerClick } from "./gameLogic";
import {
  loadLeaderboard,
  addScoreToLeaderboard,
  getTopScores,
} from "./leaderboard"; // ייבוא לוגיקת ה-Leaderboard
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

// **לוגיקת Leaderboard נמחקה מכאן (כולל המערך leaderboard) והועברה ל-leaderboard.ts**

// --- הגדרת נתיב (Endpoint) ל-Leaderboard ---
app.get("/api/leaderboard", (req, res) => {
  // קורא לפונקציה המייצאת את הנתונים הממוינים
  const top10 = getTopScores();
  res.json(top10);
});

// --- 2. לוגיקת חיבור לקוח ---
io.on("connection", (socket: Socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.emit("gameStateUpdate", gameState);

  socket.on("playerClick", (data: { row: number; col: number }) => {
    const { row, col } = data;

    const updatedState = processPlayerClick(gameState, row, col);

    if (updatedState === null) {
      // המשחק נגמר
      const finalScore = gameState.score;
      gameState.isActive = false;

      // שליחת אירוע Game Over
      io.emit("gameOver", { finalScore });
    } else {
      // עדכון מצב המשחק הגלובלי
      gameState = updatedState;

      // שליחת עדכון מצב
      if (gameState.isActive) {
        io.emit("gameStateUpdate", gameState);
      }
    }
  });

  socket.on("submitScore", (data: { name: string; score: number }) => {
    const { name, score } = data;

    // **שימוש בפונקציה המיובאת מהמודול החדש**
    addScoreToLeaderboard(name, score);

    // אתחול משחק חדש
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

  // **טעינת ה-Leaderboard באמצעות הפונקציה המיובאת**
  loadLeaderboard();

  // *** אתחול מצב המשחק הראשי ***
  gameState = createNewGame();

  io.emit("gameStateUpdate", gameState);

  console.log("Game State Initialized. Ready to play!");
});
