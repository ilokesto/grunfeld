import { useEffect, useRef } from "react";
import GrunfeldStore from "../store/GrunfeldStore";
import { Position } from "../types";
import { getPositionStyles } from "../utils/getPositionStyles";

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

  return (
    <dialog
      ref={dialogRef}
      style={{
        ...getPositionStyles(position),
        ...backdropStyle,
      }}
      onClick={handleBackdropClick}
      aria-modal="true"
    >
      {element}
    </dialog>
  );
}
