import { useRef } from "react";
import { useFocusManagement, useGrunfeldBehavior } from "../hooks";
import { GrunfeldElementProps } from "../types";
import { getModalBackdropStyles, getPositionStyles } from "../utils";

export function GrunfeldModal({
  element,
  position = "center",
  lightDismiss = true,
  backdropStyle,
}: GrunfeldElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  // 공통 행동 처리 (ESC, backdrop click)
  const { handleBackdropClick } = useGrunfeldBehavior({
    lightDismiss,
  });

  // 포커스 관리
  useFocusManagement(elementRef);

  // 위치 스타일 계산
  const positionStyles = getPositionStyles(position);

  return (
    <div
      style={getModalBackdropStyles(backdropStyle)}
      onClick={handleBackdropClick}
    >
      <div
        ref={elementRef}
        style={positionStyles}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {element}
      </div>
    </div>
  );
}
