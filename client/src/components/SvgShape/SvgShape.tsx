import React from "react";
import { Shape } from "../../Types";

interface SvgShapeProps {
  shape: Shape | string;
  fillColor: string;
}

const SvgShape: React.FC<SvgShapeProps> = ({ shape, fillColor }) => {
  const commonProps = {
    fill: fillColor,
    stroke: "#333",
    strokeWidth: 2,
  };

  let renderedShape;

  switch (shape) {
    case "Triangle":
      // Triangle
      renderedShape = <polygon points="25,10 45,45 5,45" {...commonProps} />;
      break;
    case "Square":
      // Square
      renderedShape = (
        <rect x="10" y="10" width="30" height="30" rx="4" {...commonProps} />
      );
      break;
    case "Diamond":
      // Diamond
      renderedShape = (
        <polygon points="25,5 45,25 25,45 5,25" {...commonProps} />
      );
      break;
    case "Circle":
      // Circle
      renderedShape = <circle cx="25" cy="25" r="20" {...commonProps} />;
      break;
    default:
      // Placeholder for unhandled shapes or during initialization
      renderedShape = (
        <text x="25" y="30" textAnchor="middle" fontSize="12" fill="#333">
          ?
        </text>
      );
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 50 50"
      preserveAspectRatio="xMidYMid meet"
    >
      {renderedShape}
    </svg>
  );
};

export default SvgShape;
