import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { GameState } from "./types";
import { createNewGame, processPlayerClick } from "./gameLogic";
import {
  loadLeaderboard,
  addScoreToLeaderboard,
  getTopScores,
} from "./leaderboard";

const app = express();
const httpServer = createServer(app);
const PORT = 3001;

app.use(cors({ origin: "*" }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let gameState: GameState = {
  score: 0,
  grid: [],
  isActive: false,
};

app.get("/api/leaderboard", (req, res) => {
  const top10 = getTopScores();
  res.json(top10);
});

io.on("connection", (socket: Socket) => {
  // Send the current state to the newly connected client
  socket.emit("gameStateUpdate", gameState);

  socket.on("playerClick", (data: { row: number; col: number }) => {
    const { row, col } = data;

    const updatedState = processPlayerClick(gameState, row, col);

    if (updatedState === null) {
      // Game Over: The move was invalid
      const finalScore = gameState.score;
      gameState.isActive = false;

      // Send Game Over event to all clients
      io.emit("gameOver", { finalScore });
      console.log(`Game Over. Final Score: ${finalScore}`);
    } else {
      // Valid Move or Cooldown
      gameState = updatedState;

      // Send state update to all clients if the game is still active
      if (gameState.isActive) {
        io.emit("gameStateUpdate", gameState);
      }
    }
  });

  socket.on("submitScore", (data: { name: string; score: number }) => {
    const { name, score } = data;

    // Add score via the leaderboard module
    addScoreToLeaderboard(name, score);

    // Start a new game
    gameState = createNewGame();
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("disconnect", () => {});
});

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);

  loadLeaderboard();

  gameState = createNewGame();

  // Send initial state to any connected clients
  io.emit("gameStateUpdate", gameState);

  console.log("Game State Initialized. Ready to play!");
});
