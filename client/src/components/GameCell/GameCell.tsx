import React from "react";
import { Cell } from "../../Types";
import SvgShape from "../SvgShape/SvgShape";
import "./GameCell.css";

interface GameCellProps {
  cell: Cell;
  onClick: () => void;
  isGameOver: boolean;
}

const GameCell: React.FC<GameCellProps> = ({ cell, onClick, isGameOver }) => {
  const hasCooldown = cell.cooldown > 0;

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
      {/* 1. SVG Shape Renderer */}
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
