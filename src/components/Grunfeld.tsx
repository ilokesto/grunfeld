import { BackdropStyle, GrunfeldElementProps } from "../types";
import { GrunfeldDialog } from "./GrunfeldDialog";
import { GrunfeldModal } from "./GrunfeldModal";

export function Grunfeld({
  element,
  position = "center",
  lightDismiss = true,
  backdropStyle,
  renderMode = "inline",
}: GrunfeldElementProps & {
  backdropStyle?: BackdropStyle;
}) {
  // useTopLayer에 따라 조건부 렌더링
  if (renderMode === "top-layer") {
    return (
      <GrunfeldDialog
        element={element}
        position={position}
        lightDismiss={lightDismiss}
        backdropStyle={backdropStyle}
      />
    );
  }

  return (
    <GrunfeldModal
      element={element}
      position={position}
      lightDismiss={lightDismiss}
      backdropStyle={backdropStyle}
    />
  );
}
