import { useEffect, useRef } from "react";
import GrunfeldStore from "../store/GrunfeldStore";
import { BackdropStyle, GrunfeldElementProps } from "../types";
import { getPositionStyles } from "../utils/getPositionStyles";

export function GrunfeldDialog({
  element,
  position = "center",
  lightDismiss,
  backdropStyle,
}: GrunfeldElementProps & { backdropStyle?: BackdropStyle }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Dialog를 top-layer에 표시하고 이벤트 관리
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // showModal()로 top-layer에 표시
    dialog.showModal();

    const handleClose = () => {
      GrunfeldStore.remove();
    };

    // ESC 키와 close 이벤트를 브라우저가 자동으로 처리
    dialog.addEventListener("close", handleClose);

    return () => {
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, []);

  // backdropStyle을 dialog::backdrop에 적용
  useEffect(() => {
    if (!backdropStyle) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // 고유한 클래스명 생성
    const className = `grunfeld-dialog-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    dialog.classList.add(className);

    // 스타일 요소 생성 및 삽입
    const styleElement = document.createElement("style");
    styleElement.textContent = `.${className}::backdrop { background: ${
      backdropStyle ?? "rgba(0, 0, 0, 0.3)"
    } }`;
    document.head.appendChild(styleElement);

    return () => {
      // 정리: 스타일 요소 제거
      document.head.removeChild(styleElement);
      dialog.classList.remove(className);
    };
  }, [backdropStyle]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && lightDismiss) {
      GrunfeldStore.remove();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      style={{
        padding: 0,
        border: "none",
        background: "transparent",
        width: "100vw",
        height: "100vh",
        maxWidth: "none",
        maxHeight: "none",
      }}
      onClick={handleBackdropClick}
      aria-modal="true"
    >
      <div style={getPositionStyles(position, true)}>{element}</div>
    </dialog>
  );
}
