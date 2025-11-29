import React from "react";
import { GameState } from "./Types";
import GameCell from "./GameCell";

interface GameGridProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
}

/**
 * Renders the 3x6 game grid by mapping over the GameState grid array.
 */
const GameGrid: React.FC<GameGridProps> = ({ gameState, onCellClick }) => {
  const isGameOver = !gameState.isActive;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: "8px",
        border: "3px solid #61dafb",
        padding: "10px",
        marginTop: "20px",
        marginBottom: "20px",
        borderRadius: "12px",
        backgroundColor: "#282c34",
        boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
        maxWidth: "550px",
        margin: "20px auto",
      }}
    >
      {gameState.grid.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GameCell
            key={`${rowIndex}-${colIndex}`}
            cell={cell}
            onClick={() => onCellClick(rowIndex, colIndex)}
            isGameOver={isGameOver}
          />
        ))
      )}
    </div>
  );
};

export default GameGrid;
