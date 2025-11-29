// server/src/gameLogic.ts

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
} from "./types";

// פונקציית עזר: קבלת ערך אקראי מתוך מערך
const getRandomValue = <T>(array: readonly T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

// פונקציית עזר: בדיקה האם תא (row, col) חוקי ביחס לשכנים שכבר קיימים
// משמשת רק ליצירת לוח התחלתי!
const isValidCell = (
  grid: Cell[][],
  row: number,
  col: number,
  shape: Shape,
  color: Color
): boolean => {
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

  return true;
};

// הפונקציה הראשית: יצירת לוח התחלתי תקין (Initial Valid Grid)
export const generateInitialGrid = (): Cell[][] => {
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

// פונקציית עזר: קבלת שכנים (לשימוש ב-isMoveValid)
const getNeighbors = (grid: Cell[][], row: number, col: number): Cell[] => {
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

// פונקציית לוגיקה: בדיקת חוקיות מהלך מול שכנים
export const isMoveValid = (
  grid: Cell[][],
  row: number,
  col: number,
  newShape: Shape,
  newColor: Color
): boolean => {
  const neighbors = getNeighbors(grid, row, col);

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

/**
 * פונקציה ראשית לעיבוד לחיצת שחקן.
 * מחזירה את מצב המשחק המעודכן או null אם המשחק נגמר.
 */
export const processPlayerClick = (
  currentState: GameState,
  row: number,
  col: number
): GameState | null => {
  if (!currentState.isActive) return currentState;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return currentState;

  const newState = JSON.parse(JSON.stringify(currentState)) as GameState;
  const currentCell = newState.grid[row][col];

  // 1. בדיקת צינון (Cooldown)
  if (currentCell.cooldown > 0) {
    console.log(`Click ignored: Cell (${row}, ${col}) is on cooldown.`);
    return newState;
  }

  const oldShape = currentCell.shape;
  const oldColor = currentCell.color;

  // 2. חיפוש כל המהלכים החוקיים (ששונים מהמצב הנוכחי)
  let validMoves: { shape: Shape; color: Color }[] = [];

  for (const shape of SHAPES) {
    for (const color of COLORS) {
      // חובה: הצורה שונה וגם הצבע שונה מהתא הנוכחי
      if (shape === oldShape || color === oldColor) {
        continue;
      }

      // בדיקת חוקיות מול השכנים
      if (isMoveValid(newState.grid, row, col, shape, color)) {
        validMoves.push({ shape, color });
      }
    }
  }

  // --- טיפול בתוצאה ---

  if (validMoves.length > 0) {
    // מהלך חוקי: עדכון מצב המשחק
    const selectedMove = getRandomValue(validMoves);

    // עדכון ה-Cell שנלחץ
    newState.grid[row][col].shape = selectedMove.shape;
    newState.grid[row][col].color = selectedMove.color;

    // הפעלת צינון (Cooldown)
    newState.grid[row][col].cooldown = COOLDOWN_TURNS;

    // עדכון ה-Score
    newState.score += 1;

    // 3. עדכון הצינון של שאר התאים (הורדת 1 מה-cooldown)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = newState.grid[r][c];
        // אם התא בצינון וזה לא התא שנלחץ עכשיו, הורד את הצינון
        if (cell.cooldown > 0 && (r !== row || c !== col)) {
          cell.cooldown -= 1;
        }
      }
    }

    console.log(`Valid Move: (${row}, ${col}). New Score: ${newState.score}`);
    return newState;
  } else {
    // אין מהלך חוקי: Game Over
    newState.isActive = false;
    console.log(`Game Over! No valid move found for cell (${row}, ${col}).`);
    return null; // נחזיר null כדי לסמן שהמשחק נגמר
  }
};

/**
 * פונקציה המאפסת ומאתחלת משחק חדש.
 */
export const createNewGame = (): GameState => {
  return {
    score: 0,
    grid: generateInitialGrid(), // יצירת לוח חדש
    isActive: true, // הפעלת המשחק
  };
};
