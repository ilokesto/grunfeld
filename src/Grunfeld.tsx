import GrunfeldStore from "./GrunfeldStore";
import { Position } from "./types";

export function Grunfeld({
  element,
  position,
  lightDismiss,
  backdropStyle,
}: {
  element: React.ReactNode;
  position?: Position;
  lightDismiss?: boolean;
  backdropStyle?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        background: "rgba(0, 0, 0, 0.3)",
      }}
      onClick={(e) =>
        e.target === e.currentTarget && lightDismiss && GrunfeldStore.remove()
      }
    >
      <div
        style={{
          position: "fixed",
          left: "50%",
          top: position === "center" ? "50%" : undefined,
          bottom: position === "bottom" ? "0" : undefined,
          transform: `translate(${position === "center" ? "-50%" : "0"}, -50%)`,
          ...backdropStyle,
        }}
        role="dialog"
      >
        {element}
      </div>
    </div>
  );
}
