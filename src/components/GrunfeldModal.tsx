import { memo, useMemo, useRef } from "react";
import { useFocusManagement, useGrunfeldBehavior } from "../hooks";
import { GrunfeldElementProps } from "../types";
import { getPositionStyles } from "../utils";

export const GrunfeldModal = memo(function GrunfeldModal({
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

  // 위치 스타일 계산 (메모이제이션)
  const positionStyles = useMemo(() => getPositionStyles(position), [position]);

  // 백드롭 스타일 메모이제이션
  const backdropStyles = useMemo(
    () => ({
      position: "fixed" as const,
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      zIndex: 1000,
      ...backdropStyle,
    }),
    [backdropStyle]
  );

  return (
    <div style={backdropStyles} onClick={handleBackdropClick}>
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
});
