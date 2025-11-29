// client/src/GameCell.tsx

import React from "react";
import { Cell } from "./Types";
import SvgShape from "./SvgShape";

interface GameCellProps {
  cell: Cell;
  onClick: () => void;
  isGameOver: boolean;
}

/**
 * Renders a single, clickable cell on the game grid.
 * Allows the onClick event to always fire (unless Game Over) so the parent
 * component (App.tsx) can handle Cooldown feedback via Toast.
 */
const GameCell: React.FC<GameCellProps> = ({ cell, onClick, isGameOver }) => {
  const hasCooldown = cell.cooldown > 0;

  // Cell is visually clickable only if no cooldown AND game is active
  const isClickable = !hasCooldown && !isGameOver;

  return (
    <div
      // *** התיקון: הפעל את onClick אלא אם המשחק הסתיים לחלוטין ***
      // הלוגיקה ב-App.tsx תטפל בבדיקת ה-cooldown והצגת ה-Toast.
      onClick={!isGameOver ? onClick : undefined}
      style={{
        width: "80px",
        height: "80px",
        backgroundColor: cell.color, // Cell background is the color property
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.4)",
        // סמן העכבר משקף את מצב הלחיצות האמיתי
        cursor: isClickable ? "pointer" : "not-allowed",
        opacity: hasCooldown || isGameOver ? 0.6 : 1,
        border: hasCooldown ? "3px dashed #333" : "3px solid transparent",
        position: "relative",
        transition: "all 0.3s ease-in-out",
        transform: isClickable ? "scale(1.02)" : "scale(1)",
      }}
      title={
        cell.cooldown > 0
          ? `Cooldown: ${cell.cooldown} turns`
          : `Shape: ${cell.shape}, Color: ${cell.color}`
      }
    >
      {/* 1. SVG Shape Renderer (Bonus 2) */}
      <div style={{ width: "60%", height: "60%" }}>
        <SvgShape shape={cell.shape} fillColor="white" />
      </div>

      {/* 2. Cooldown Indicator */}
      {cell.cooldown > 0 && (
        <div
          style={{
            position: "absolute",
            top: "5px",
            right: "5px",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          {cell.cooldown}
        </div>
      )}
    </div>
  );
};

export default GameCell;
