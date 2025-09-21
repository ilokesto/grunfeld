import { useEffect, useRef } from "react";
import { useGrunfeldBehavior } from "../hooks";
import { GrunfeldElementProps } from "../types";
import { createDialogBackdropManager, getPositionStyles } from "../utils";

export function GrunfeldDialog({
  element,
  position = "center",
  lightDismiss = true,
  backdropStyle,
}: GrunfeldElementProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // 공통 행동 처리
  const { handleBackdropClick, handleDialogClose } = useGrunfeldBehavior({
    lightDismiss,
  });

  // Dialog를 top-layer에 표시하고 이벤트 관리
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // showModal()로 top-layer에 표시
    dialog.showModal();

    // ESC 키와 close 이벤트를 브라우저가 자동으로 처리
    dialog.addEventListener("close", handleDialogClose);

    return () => {
      dialog.removeEventListener("close", handleDialogClose);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [handleDialogClose]);

  // backdrop 스타일 관리
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !backdropStyle) return;

    const { cleanup } = createDialogBackdropManager(dialog, backdropStyle);
    return cleanup;
  }, [backdropStyle]);

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
