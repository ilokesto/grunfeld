import { GrunfeldElementProps } from "../types";
import { getModalBackdropStyles } from "../utils";
import { BaseGrunfeld } from "./BaseGrunfeld";

export function GrunfeldModal({
  element,
  position = "center",
  lightDismiss = true,
  backdropStyle,
}: GrunfeldElementProps) {
  return (
    <BaseGrunfeld
      element={element}
      position={position}
      lightDismiss={lightDismiss}
      backdropStyle={backdropStyle}
      renderStrategy={({ elementRef, handleBackdropClick, positionStyles }) => (
        <div
          style={getModalBackdropStyles(backdropStyle)}
          onClick={handleBackdropClick}
        >
          <div
            ref={elementRef as React.RefObject<HTMLDivElement>}
            style={positionStyles}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            {element}
          </div>
        </div>
      )}
    />
  );
}
