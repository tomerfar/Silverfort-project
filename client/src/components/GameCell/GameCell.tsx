// client/src/components/GameCell/GameCell.tsx

import React from "react";
import { Cell } from "../../Types";
import SvgShape from "../SvgShape/SvgShape"; // Updated path
import "./GameCell.css"; // Import the dedicated CSS file

interface GameCellProps {
  cell: Cell;
  onClick: () => void;
  isGameOver: boolean;
}

const GameCell: React.FC<GameCellProps> = ({ cell, onClick, isGameOver }) => {
  const hasCooldown = cell.cooldown > 0;

  // Determine the correct class names based on state
  const isClickable = !hasCooldown && !isGameOver;

  // Conditionally apply base class + state-specific class
  let cellClass = "game-cell-base ";
  if (isGameOver) {
    cellClass += "game-cell-gameover";
  } else if (hasCooldown) {
    cellClass += "game-cell-cooldown";
  } else {
    cellClass += "game-cell-clickable";
  }

  return (
    <div
      onClick={!isGameOver ? onClick : undefined}
      className={cellClass}
      style={{
        // backgroundColor must remain inline as it changes dynamically based on cell.color
        backgroundColor: cell.color,
      }}
      title={
        cell.cooldown > 0
          ? `Cooldown: ${cell.cooldown} turns`
          : `Shape: ${cell.shape}, Color: ${cell.color}`
      }
    >
      {/* 1. SVG Shape Renderer (Bonus 2) */}
      <div className="svg-shape-container">
        <SvgShape shape={cell.shape} fillColor="white" />
      </div>

      {/* 2. Cooldown Indicator */}
      {cell.cooldown > 0 && (
        <div className="cooldown-indicator">{cell.cooldown}</div>
      )}
    </div>
  );
};

export default GameCell;
