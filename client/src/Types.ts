export const SHAPES = ["Triangle", "Square", "Diamond", "Circle"] as const;
export const COLORS = ["Red", "Green", "Blue", "Yellow"] as const;

export type Shape = (typeof SHAPES)[number];
export type Color = (typeof COLORS)[number];

export interface Cell {
  shape: Shape | string;
  color: Color | string;
  cooldown: number;
}

export interface GameState {
  score: number;
  grid: Cell[][];
  isActive: boolean;
}

export interface HighScore {
  name: string;
  score: number;
  date: string;
}

// Initial state for React
export const initialGameState: GameState = {
  score: 0,
  grid: [],
  isActive: false,
};

export const SOCKET_SERVER_URL = "http://localhost:3001";
export const API_URL = "http://localhost:3001";
