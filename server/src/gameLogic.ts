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

// Returns a random element from an array.
const getRandomValue = <T>(array: readonly T[]): T => {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
};

// Checks validity against top and left neighbors.
const isValidCell = (
  grid: Cell[][],
  row: number,
  col: number,
  shape: Shape,
  color: Color
): boolean => {
  // 1. Check top neighbor
  if (row > 0) {
    const top = grid[row - 1][col];
    if (top.shape === shape || top.color === color) return false;
  }

  // 2. Check left neighbor
  if (col > 0) {
    const left = grid[row][col - 1];
    if (left.shape === shape || left.color === color) return false;
  }

  return true;
};

// Generates a starting grid that is guaranteed to be valid.
export const generateInitialGrid = (): Cell[][] => {
  const grid: Cell[][] = Array.from({ length: ROWS }, () => []);

  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      let attempts = 0;
      let shape: Shape;
      let color: Color;

      do {
        shape = getRandomValue(SHAPES);
        color = getRandomValue(COLORS);
        attempts++;

        // Failsafe for infinite loop
        if (attempts > 50) {
          console.error(
            "Game Logic Error: Restarting grid generation due to failure to find a valid combination."
          );
          return generateInitialGrid();
        }
      } while (!isValidCell(grid, r, c, shape, color));

      grid[r][c] = { shape, color, cooldown: 0 };
    }
  }
  return grid;
};

// Gets the valid neighbors (Up, Down, Left, Right) of a cell.
const getNeighbors = (grid: Cell[][], row: number, col: number): Cell[] => {
  const neighbors: Cell[] = [];

  // Directions: Up, Down, Left, Right
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];

  for (const { dr, dc } of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    // Check bounds
    if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
      neighbors.push(grid[newRow][newCol]);
    }
  }

  return neighbors;
};

// Checks if a potential move is valid against all 4 neighbors.
export const isMoveValid = (
  grid: Cell[][],
  row: number,
  col: number,
  newShape: Shape,
  newColor: Color
): boolean => {
  const neighbors = getNeighbors(grid, row, col);

  for (const neighbor of neighbors) {
    // Check: Shape must be different
    if (neighbor.shape === newShape) {
      return false;
    }

    // Check: Color must be different
    if (neighbor.color === newColor) {
      return false;
    }
  }

  return true;
};

/**
 * Processes a player's click.
 * Returns the updated GameState, or null if Game Over.
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

  // 1. Check Cooldown
  if (currentCell.cooldown > 0) {
    return newState;
  }

  const oldShape = currentCell.shape;
  const oldColor = currentCell.color;

  // 2. Find all valid moves (must be different shape AND different color)
  let validMoves: { shape: Shape; color: Color }[] = [];

  for (const shape of SHAPES) {
    for (const color of COLORS) {
      // Must be a different shape and color from current cell
      if (shape === oldShape || color === oldColor) {
        continue;
      }

      if (isMoveValid(newState.grid, row, col, shape, color)) {
        validMoves.push({ shape, color });
      }
    }
  }

  if (validMoves.length > 0) {
    // Valid Move: Update State
    const selectedMove = getRandomValue(validMoves);

    // Update cell, apply cooldown, increment score
    newState.grid[row][col].shape = selectedMove.shape;
    newState.grid[row][col].color = selectedMove.color;
    newState.grid[row][col].cooldown = COOLDOWN_TURNS;
    newState.score += 1;

    // 3. Update Cooldowns for other cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = newState.grid[r][c];
        // Reduce cooldown if active and not the clicked cell
        if (cell.cooldown > 0 && (r !== row || c !== col)) {
          cell.cooldown -= 1;
        }
      }
    }

    return newState;
  } else {
    // No Valid Move: Game Over
    newState.isActive = false;
    console.log(`Game Over! No valid move found for cell (${row}, ${col}).`);
    return null; // Game Over
  }
};

/**
 * Creates and initializes a new game state.
 */
export const createNewGame = (): GameState => {
  return {
    score: 0,
    grid: generateInitialGrid(),
    isActive: true,
  };
};
