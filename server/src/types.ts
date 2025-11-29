export const ROWS = 3;
export const COLS = 6;
export const COOLDOWN_TURNS = 3;

export const SHAPES = ["Triangle", "Square", "Diamond", "Circle"] as const;
export const COLORS = ["Red", "Green", "Blue", "Yellow"] as const;

/**
 * Shape Type: "Triangle" | "Square" | "Diamond" | "Circle"
 */
export type Shape = (typeof SHAPES)[number];

/**
 * Color Type: "Red" | "Green" | "Blue" | "Yellow"
 */
export type Color = (typeof COLORS)[number];

/**
 * Defines a single cell on the game grid.
 */
export interface Cell {
  shape: Shape;
  color: Color;
  cooldown: number; // The number of turns remaining before the cell can be clicked again.
}

/**
 * Defines the entire global state of the game.
 */
export interface GameState {
  score: number;
  grid: Cell[][];
  isActive: boolean; // True if the game is in progress.
}

/**
 * Defines a single entry in the High Score Leaderboard.
 */
export interface HighScore {
  name: string;
  score: number;
  date: string;
}
