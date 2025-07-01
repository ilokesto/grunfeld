import { useEffect, useState } from "react";
import { GrunfeldStore } from "./GrunfeldStore";
import { GrunfeldProviderProps, isValidGrunfeldElement } from "./types";
import { Grunfeld } from "./Grunfeld";

export function GrunfeldProvider({
  children,
  options = { defaultPosition: "center", defaultDismiss: true },
}: GrunfeldProviderProps) {
  const [_, grunfeldRerenderingTrigger] = useState(false);

  useEffect(() => {
    const handleStoreChange = () => {
      grunfeldRerenderingTrigger((prev) => !prev);
    };

    GrunfeldStore.addListener(handleStoreChange);
    return () => GrunfeldStore.removeListener(handleStoreChange);
  }, []);

  return (
    <>
      {children}

      {!GrunfeldStore.isStoreEmpty() && (
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
          {GrunfeldStore.store.map((props, index) => {
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
                lightDismiss={lightDismiss ?? options.defaultDismiss}
                backdropStyle={options.backdropStyle}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
