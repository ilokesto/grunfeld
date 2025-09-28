import { useDialog } from "../hooks/useGrunfeldDialog";
import { GrunfeldElementProps } from "../types";
import { getPositionStyles } from "../utils";

export function GrunfeldDialog({
  element,
  position = "center",
  lightDismiss = true,
  backdropStyle,
}: GrunfeldElementProps) {
  const { dialogRef, handleBackdropClick } = useDialog(
    lightDismiss,
    backdropStyle
  );

  return (
    <dialog
      ref={dialogRef}
      style={{
        color: "inherit",
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
