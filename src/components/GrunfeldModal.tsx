import { GrunfeldElementProps } from "../types";
import { getModalBackdropStyles } from "../utils";
import { BaseGrunfeld } from "./BaseGrunfeld";

export function GrunfeldModal(props: GrunfeldElementProps) {
  return (
    <BaseGrunfeld
      {...props}
      renderStrategy={({ elementRef, handleBackdropClick, positionStyles }) => (
        <div
          style={getModalBackdropStyles(props.backdropStyle)}
          onClick={handleBackdropClick}
        >
          <div
            ref={elementRef as React.RefObject<HTMLDivElement>}
            style={positionStyles}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            {props.element}
          </div>
        </div>
      )}
    />
  );
}
