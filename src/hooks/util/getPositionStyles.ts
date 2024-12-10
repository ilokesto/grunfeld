import { Position, PositionX, PositionY } from "../types/position";

export function getPositionStyles(position: Position): Record<string, string> {
  const styles: Record<string, string> = {
    position: "fixed", // 고정된 위치
  };

  const [y, x] = position.split("-") as [PositionY, PositionX];

  // Y축 처리
  if (y === "top") {
    styles.top = "0";
  } else if (y === "bottom") {
    styles.bottom = "0";
  } else if (y === "center") {
    styles.top = "50%";
    styles.transform = "translateY(-50%)"; // Y축 중앙
  }

  // X축 처리
  if (x === "left") {
    styles.left = "0";
  } else if (x === "right") {
    styles.right = "0";
  } else if (x === "center") {
    styles.left = "50%";
    styles.transform = styles.transform 
      ? `${styles.transform} translateX(-50%)` // 기존 transform에 추가
      : "translateX(-50%)"; // X축 중앙
  }

  return styles;
}