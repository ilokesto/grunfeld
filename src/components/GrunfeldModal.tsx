import { useEffect, useRef } from "react";
import GrunfeldStore from "../store/GrunfeldStore";
import { BackdropStyle, GrunfeldElementProps } from "../types";
import { getPositionStyles } from "../utils/getPositionStyles";

export function GrunfeldModal({
  element,
  position = "center",
  lightDismiss,
  backdropStyle,
}: GrunfeldElementProps & { backdropStyle?: BackdropStyle }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC 키로 대화상자 닫기
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && lightDismiss) {
        event.preventDefault();
        GrunfeldStore.remove();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [lightDismiss]);

  // 포커스 트래핑 및 자동 포커스
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // 이전에 포커스된 요소 저장
    const previousActiveElement = document.activeElement as HTMLElement;

    // 대화상자 내의 포커스 가능한 요소들 찾기
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    // 첫 번째 포커스 가능한 요소에 포커스
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    } else {
      dialog.focus();
    }

    // 컴포넌트 언마운트 시 이전 포커스 복원
    return () => {
      if (
        previousActiveElement &&
        typeof previousActiveElement.focus === "function"
      ) {
        previousActiveElement.focus();
      }
    };
  }, []);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && lightDismiss) {
      GrunfeldStore.remove();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        background: backdropStyle ?? "rgba(0, 0, 0, 0.3)",
        zIndex: 1000,
      }}
      onClick={handleBackdropClick}
      aria-hidden="true"
    >
      <div
        ref={dialogRef}
        style={{
          ...getPositionStyles(position),
        }}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {element}
      </div>
    </div>
  );
}
