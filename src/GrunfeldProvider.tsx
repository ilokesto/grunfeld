import { useSyncExternalStore } from "react";
import { Grunfeld } from "./Grunfeld";
import { GrunfeldStore } from "./GrunfeldStore";
import { GrunfeldProviderProps, isValidGrunfeldElement } from "./types";

export function GrunfeldProvider({
  children,
  options = { defaultPosition: "center", defaultLightDismiss: true },
}: GrunfeldProviderProps) {
  const store = useSyncExternalStore(
    GrunfeldStore.subscribe,
    GrunfeldStore.getStore,
    GrunfeldStore.getStore
  );

  return (
    <>
      {children}

      {store.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            background: "transparent",
          }}
        >
          {store.map((props, index) => {
            const { element, position, lightDismiss } = isValidGrunfeldElement(
              props
            )
              ? props
              : { element: props };

            return (
              <Grunfeld
                key={index}
                position={position ?? options.defaultPosition}
                element={element}
                lightDismiss={lightDismiss ?? options.defaultLightDismiss}
                backdropStyle={options.backdropStyle}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
