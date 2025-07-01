import { useEffect, useState } from "react";
import { IGrunfeldProps, GrunfeldStore } from "./GrunfeldStore";
import { Position } from "./types";

export function GrunfeldProvider({
  children,
  defaultPosition = "center",
  defaultDismiss = true,
}: {
  children: React.ReactNode;
  defaultPosition?: Position;
  defaultDismiss?: boolean;
}) {
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
          {GrunfeldStore.store.map(
            ({ position, element, lightDismiss }, index) => (
              <Grunfeld
                key={index}
                position={position ?? defaultPosition}
                element={element}
                lightDismiss={lightDismiss ?? defaultDismiss}
              />
            )
          )}
        </div>
      )}
    </>
  );
}

function Grunfeld({ element, position, lightDismiss }: IGrunfeldProps) {
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
        }}
        role="dialog"
      >
        {element}
      </div>
    </div>
  );
}
