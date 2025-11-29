// server/src/types.ts

// ----------------------------------------------------
// --- קבועים לטובת Game Logic ---
// ----------------------------------------------------
export const ROWS = 3;
export const COLS = 6;
export const COOLDOWN_TURNS = 3;

// קבועים המשמשים גם כ-Literal Types
export const SHAPES = ["Triangle", "Square", "Diamond", "Circle"] as const; // as const: מבטיח שהמערך הוא קבוע ולא ישתנה, ומאפשר שימוש נכון בטיפוסים
export const COLORS = ["Red", "Green", "Blue", "Yellow"] as const;

// ----------------------------------------------------
// --- הגדרת Literal Types (לשיפור Type Safety) ---
// ----------------------------------------------------

// יצירת Literal Type מתוך המערך הקבוע (SHAPES)
// דוגמה: "Triangle" | "Square" | "Diamond" | "Circle"
export type Shape = (typeof SHAPES)[number];

// יצירת Literal Type מתוך המערך הקבוע (COLORS)
// דוגמה: "Red" | "Green" | "Blue" | "Yellow"
export type Color = (typeof COLORS)[number];

// ----------------------------------------------------
// --- Interfaces למצב המשחק ---
// ----------------------------------------------------

/**
 * Interface המייצג תא בלוח המשחק.
 */
export interface Cell {
  shape: Shape;
  color: Color;
  cooldown: number; // מספר תורות עד שניתן ללחוץ על התא שוב
}

/**
 * Interface המייצג את המצב הגלובלי של המשחק.
 */
export interface GameState {
  score: number;
  grid: Cell[][];
  isActive: boolean;
}

/**
 * Interface המייצג שיא בטבלת ה-Leaderboard.
 */
export interface HighScore {
  name: string;
  score: number;
  date: string;
}
