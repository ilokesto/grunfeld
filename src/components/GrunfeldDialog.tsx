import { useEffect, useRef } from "react";
import GrunfeldStore from "../store/GrunfeldStore";
import { Position } from "../types";

interface GrunfeldDialogProps {
  element: React.ReactNode;
  position: Position;
  lightDismiss: boolean;
  backdropStyle?: React.CSSProperties;
}

export function GrunfeldDialog({
  element,
  position,
  lightDismiss,
  backdropStyle,
}: GrunfeldDialogProps) {
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

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && lightDismiss) {
      GrunfeldStore.remove();
    }
  };

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      border: "none",
      padding: 0,
      background: "transparent",
      maxWidth: "none",
      maxHeight: "none",
      position: "fixed",
      left: "50%",
    };

    switch (position) {
      case "bottom":
        return {
          ...baseStyles,
          bottom: "0",
          transform: "translateX(-50%)",
        };
      case "center":
      default:
        return {
          ...baseStyles,
          top: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  return (
    <dialog
      ref={dialogRef}
      style={{
        ...getPositionStyles(),
        ...backdropStyle,
      }}
      onClick={handleBackdropClick}
      aria-modal="true"
    >
      {element}
    </dialog>
  );
}
