// server/src/server.ts

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import * as fs from "fs";
import * as path from "path";
// ----------------------------------------------
// --- ייבוא מהמודול החדש! ---
import {
  ROWS,
  COLS,
  COOLDOWN_TURNS,
  SHAPES,
  COLORS,
  Shape,
  Color,
  Cell,
  GameState,
  HighScore,
} from "./types";
// ----------------------------------------------

const app = express();
const httpServer = createServer(app);
const PORT = 3001;

// ... (שאר הגדרות השרת וה-Socket.IO)

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

// --- פונקציות עזר יתווספו כאן (בשלב 2.2) ---
// פונקציית עזר: קבלת ערך אקראי מתוך מערך
const getRandomValue = <T>(array: readonly T[]): T => {
  // שינוי ל-readonly T[] כדי להתאים ל-as const
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

// פונקציית עזר: בדיקה האם תא (row, col) חוקי ביחס לשכנים שכבר קיימים
const isValidCell = (
  grid: Cell[][],
  row: number,
  col: number,
  shape: Shape,
  color: Color
): boolean => {
  // ... (הפונקציה נשארת כפי שהיא, הטיפוסים כבר מיובאים)
  // ...
  // 1. בדיקת תא למעלה (row - 1)
  if (row > 0) {
    const top = grid[row - 1][col];
    // בדיקה: האם זהה לצורה או לצבע של התא שמעליו
    if (top.shape === shape || top.color === color) return false;
  }

  // 2. בדיקת תא משמאל (col - 1)
  if (col > 0) {
    const left = grid[row][col - 1];
    // בדיקה: האם זהה לצורה או לצבע של התא משמאלו
    if (left.shape === shape || left.color === color) return false;
  }

  // מאחר שאנו בונים משמאל לימין ומלמעלה למטה, אין צורך לבדוק ימין ולמטה.
  // אין צורך לבדוק אלכסונים (לפי דרישות המשימה).
  return true;
};

// הפונקציה הראשית: יצירת לוח התחלתי תקין (Initial Valid Grid)
const generateInitialGrid = (): Cell[][] => {
  // יצירת מערך דו-ממדי בגודל ROWS x COLS
  const grid: Cell[][] = Array.from({ length: ROWS }, () => []);

  for (let r = 0; r < ROWS; r++) {
    grid[r] = []; // אתחול השורה כמערך ריק
    for (let c = 0; c < COLS; c++) {
      let attempts = 0;
      let shape: Shape;
      let color: Color;

      // ניסיון למצוא צירוף חוקי
      do {
        // בחירה אקראית מתוך רשימת הקבועים
        // שימו לב: אין צורך ב-as Shape/Color כי getRandomValue עובדת עם המערכים
        shape = getRandomValue(SHAPES);
        color = getRandomValue(COLORS);
        attempts++;

        // מנגנון הגנה נגד לולאה אינסופית
        if (attempts > 50) {
          // אם נתקענו, הלוח כנראה צפוף מדי. מתחילים את כל הלוח מחדש.
          console.error(
            "Restarting grid generation due to failure to find a valid combination."
          );
          return generateInitialGrid();
        }
      } while (!isValidCell(grid, r, c, shape, color));

      grid[r][c] = { shape, color, cooldown: 0 };
    }
  }
  return grid;
};

// ... (שאר פונקציות העזר נשארות כפי שהן)
const getNeighbors = (grid: Cell[][], row: number, col: number): Cell[] => {
  // ... (הפונקציה נשארת כפי שהיא)
  const neighbors: Cell[] = [];

  // רשימת שינויים בקואורדינטות (dx, dy) עבור למעלה, למטה, שמאל, ימין
  const directions = [
    { dr: -1, dc: 0 }, // למעלה
    { dr: 1, dc: 0 }, // למטה
    { dr: 0, dc: -1 }, // שמאל
    { dr: 0, dc: 1 }, // ימין
  ];

  for (const { dr, dc } of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    // בדיקה: האם הקואורדינטות החדשות בתוך גבולות הלוח?
    if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
      neighbors.push(grid[newRow][newCol]);
    }
  }

  return neighbors;
};

const isMoveValid = (
  grid: Cell[][],
  row: number,
  col: number,
  newShape: Shape,
  newColor: Color
): boolean => {
  const neighbors = getNeighbors(grid, row, col);
  // ... (הפונקציה נשארת כפי שהיא)
  for (const neighbor of neighbors) {
    // בדיקת חוקיות צורה
    if (neighbor.shape === newShape) {
      console.log(
        `Validation Failed: Shape ${newShape} matches neighbor at (${neighbor.shape})`
      );
      return false;
    }

    // בדיקת חוקיות צבע
    if (neighbor.color === newColor) {
      console.log(
        `Validation Failed: Color ${newColor} matches neighbor at (${neighbor.color})`
      );
      return false;
    }
  }

  return true;
};
// ... (שאר פונקציות העזר נשארות כפי שהן)
const resetGame = () => {
  gameState = {
    score: 0,
    grid: generateInitialGrid(), // יצירת לוח חדש
    isActive: true, // הפעלת המשחק
  };
  console.log("Game successfully reset. New game started.");
};

// --- לוגיקת Leaderboard (Persistence) ---
const LEADERBOARD_FILE = path.join(__dirname, "leaderboard.json");
let leaderboard: HighScore[] = [];

// ... (פונקציות Leaderboard)
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
  // ... (טיפול בחיבור לקוח)
  console.log(`Client connected: ${socket.id}`); // כאשר לקוח חדש מתחבר, שלח לו את מצב המשחק הנוכחי

  socket.emit("gameStateUpdate", gameState); // לוגיקה לטיפול ב-Game Logic (תתווסף בהמשך)

  socket.on("playerClick", (data: { row: number; col: number }) => {
    const { row, col } = data;

    // 1. בדיקת מצב משחק פעיל וקואורדינטות (מנגנון הגנה)
    if (!gameState.isActive) return;
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    const currentCell = gameState.grid[row][col];

    // 2. בדיקת צינון (Cooldown)
    if (currentCell.cooldown > 0) {
      console.log(`Click ignored: Cell (${row}, ${col}) is on cooldown.`);
      return;
    }

    // נשמור את המצב הקודם של התא (לצורך אימות השינוי)
    const oldShape = currentCell.shape;
    const oldColor = currentCell.color;

    // 3. חיפוש כל המהלכים החוקיים (שבהכרח שונים מהמצב הנוכחי)
    let validMoves: { shape: Shape; color: Color }[] = [];

    // סורק את כל 16 הצירופים האפשריים
    for (const shape of SHAPES) {
      for (const color of COLORS) {
        // *** התיקון כאן ***
        // הדרישה: הצורה *חייבת* להיות שונה וגם הצבע *חייב* להיות שונה.
        if (shape === oldShape) {
          // פסול: הצורה נשארה זהה
          continue;
        }

        if (color === oldColor) {
          // פסול: הצבע נשאר זהה
          continue;
        }
        // *** סוף התיקון ***

        // בדיקת חוקיות מול השכנים
        if (
          // שימו לב: אין צורך ב-as Shape/Color כי השתמשנו ב-as const ב-types.ts וה-for-of עובד נכון עם הטיפוסים
          isMoveValid(gameState.grid, row, col, shape, color)
        ) {
          validMoves.push({ shape, color });
        }
      }
    }

    // --- טיפול בתוצאה ---

    if (validMoves.length > 0) {
      // 4. מהלך חוקי: עדכון מצב המשחק

      // בחר מהלך אקראי מתוך רשימת המהלכים החוקיים שנאספו
      const selectedMove = getRandomValue(validMoves);

      // עדכון ה-Cell שנלחץ
      gameState.grid[row][col].shape = selectedMove.shape;
      gameState.grid[row][col].color = selectedMove.color;

      // הפעלת צינון (Cooldown)
      gameState.grid[row][col].cooldown = COOLDOWN_TURNS; // 3 תורות

      // עדכון ה-Score
      gameState.score += 1; // +1 score for every valid change

      // 5. עדכון הצינון של שאר התאים (הורדת 1 מה-cooldown)
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cell = gameState.grid[r][c];
          // אם התא בצינון וזה לא התא שנלחץ עכשיו, הורד את הצינון
          if (cell.cooldown > 0 && (r !== row || c !== col)) {
            cell.cooldown -= 1;
          }
        }
      }

      console.log(
        `Valid Move: (${row}, ${col}). New Score: ${gameState.score}`
      );
    } else {
      // 6. אין מהלך חוקי: Game Over
      gameState.isActive = false;
      console.log(`Game Over! No valid move found for cell (${row}, ${col}).`);

      // **שינוי: שלח אירוע מיוחד ללקוחות כדי שיבקשו את הכינוי**
      io.emit("gameOver", { finalScore: gameState.score });
    }

    // 7. שלח את המצב המעודכן לכל הלקוחות (כדי לעדכן את ה-UI)
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("submitScore", (data: { name: string; score: number }) => {
    const { name, score } = data;
    addScoreToLeaderboard(name, score);
    console.log(`Score submitted: ${name} with ${score}`);

    resetGame();
    io.emit("gameStateUpdate", gameState);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// --- 3. הפעלת השרת ---
httpServer.listen(PORT, () => {
  // ... (אתחול שרת)
  console.log(`Server listening on port ${PORT}`);

  // טען את ה-Leaderboard הקיים
  loadLeaderboard();

  // *** אתחול מצב המשחק הראשי ***
  gameState = {
    score: 0,
    grid: generateInitialGrid(), // יצירת הלוח התקין
    isActive: true, // התחל את המשחק
  };

  // שלח עדכון מצב משחק לכל הלקוחות הקיימים (אם יש כאלו, למרות שבשלב זה כנראה שאין)
  io.emit("gameStateUpdate", gameState);

  console.log("Game State Initialized. Ready to play!");
});
