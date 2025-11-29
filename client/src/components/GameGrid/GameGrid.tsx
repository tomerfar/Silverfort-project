import React from "react";
import { GameState } from "../../Types";
import GameCell from "../GameCell/GameCell";
import "./GameGrid.css";

interface GameGridProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
}

const GameGrid: React.FC<GameGridProps> = ({ gameState, onCellClick }) => {
  const isGameOver = !gameState.isActive;

  return (
    <div className="game-grid-container">
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
