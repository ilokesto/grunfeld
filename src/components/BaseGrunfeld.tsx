import { useRef } from "react";
import { useFocusManagement, useGrunfeldBehavior } from "../hooks";
import { GrunfeldElementProps } from "../types";
import { getPositionStyles } from "../utils";

interface BaseGrunfeldProps extends GrunfeldElementProps {
  renderStrategy: (props: {
    elementRef: React.RefObject<HTMLElement>;
    handleBackdropClick: (event: React.MouseEvent) => void;
    handleDialogClose: () => void;
    positionStyles: React.CSSProperties;
  }) => React.ReactNode;
}

/**
 * Modal과 Dialog의 공통 로직을 처리하는 Base 컴포넌트
 * Render prop 패턴을 사용하여 렌더링 전략만 다르게 처리
 */
export function BaseGrunfeld({
  element,
  position = "center",
  lightDismiss = true,
  renderStrategy,
}: BaseGrunfeldProps) {
  const elementRef = useRef<HTMLElement>(null);

  // 공통 행동 처리
  const { handleBackdropClick, handleDialogClose } = useGrunfeldBehavior({
    lightDismiss,
  });

  // 포커스 관리
  useFocusManagement(elementRef);

  // 위치 스타일 계산
  const positionStyles = getPositionStyles(position);

  return (
    <>
      {renderStrategy({
        elementRef,
        handleBackdropClick,
        handleDialogClose,
        positionStyles,
      })}
    </>
  );
}
