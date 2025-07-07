import { Position } from "../types";

export const getPositionStyles = (position: Position): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    position: "fixed",
  };

  switch (position) {
    case "top-left":
      return {
        ...baseStyles,
        top: "20px",
        left: "20px",
      };
    case "top-center":
      return {
        ...baseStyles,
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "top-right":
      return {
        ...baseStyles,
        top: "20px",
        right: "20px",
      };
    case "center-left":
      return {
        ...baseStyles,
        top: "50%",
        left: "20px",
        transform: "translateY(-50%)",
      };
    case "center":
      return {
        ...baseStyles,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    case "center-right":
      return {
        ...baseStyles,
        top: "50%",
        right: "20px",
        transform: "translateY(-50%)",
      };
    case "bottom-left":
      return {
        ...baseStyles,
        bottom: "20px",
        left: "20px",
      };
    case "bottom-center":
      return {
        ...baseStyles,
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "bottom-right":
      return {
        ...baseStyles,
        bottom: "20px",
        right: "20px",
      };
    default:
      return {
        ...baseStyles,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
  }
};
