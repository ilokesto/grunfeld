import { Position } from "../types";

export const getPositionStyles = (
  position: Position,
  useAbsolute: boolean = false
): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    position: useAbsolute ? "absolute" : "fixed",
  };

  switch (position) {
    case "top-left":
      return {
        ...baseStyles,
        top: "0px",
        left: "0px",
      };
    case "top-center":
      return {
        ...baseStyles,
        top: "0px",
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "top-right":
      return {
        ...baseStyles,
        top: "0px",
        right: "0px",
      };
    case "center-left":
      return {
        ...baseStyles,
        top: "50%",
        left: "0px",
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
        right: "0px",
        transform: "translateY(-50%)",
      };
    case "bottom-left":
      return {
        ...baseStyles,
        bottom: "0px",
        left: "0px",
      };
    case "bottom-center":
      return {
        ...baseStyles,
        bottom: "0px",
        left: "50%",
        transform: "translateX(-50%)",
      };
    case "bottom-right":
      return {
        ...baseStyles,
        bottom: "0px",
        right: "0px",
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
