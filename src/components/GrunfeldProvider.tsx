import { useMemo, useSyncExternalStore } from "react";
import { GrunfeldStore } from "../store/GrunfeldStore";
import { GrunfeldProviderProps, isValidGrunfeldElement } from "../types";
import { Grunfeld } from "./Grunfeld";

export function GrunfeldProvider({
  children,
  options = {
    defaultPosition: "center",
    defaultLightDismiss: true,
    defaultRenderMode: "inline",
    defaultBackdropStyle: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
  },
}: GrunfeldProviderProps) {
  const store = useSyncExternalStore(
    GrunfeldStore.subscribe,
    GrunfeldStore.getStore,
    GrunfeldStore.getStore
  );

  // 대화상자 렌더링 최적화
  const renderedDialogs = useMemo(() => {
    return store.map((props, index) => {
      const { element, position, lightDismiss, renderMode, backdropStyle } =
        isValidGrunfeldElement(props) ? props : { element: props };

      return (
        <Grunfeld
          key={index}
          position={position ?? options.defaultPosition}
          element={element}
          lightDismiss={lightDismiss ?? options.defaultLightDismiss}
          backdropStyle={backdropStyle ?? options.defaultBackdropStyle}
          renderMode={renderMode ?? options.defaultRenderMode}
        />
      );
    });
  }, [
    store,
    options.defaultPosition,
    options.defaultLightDismiss,
    options.defaultBackdropStyle,
  ]);

  return (
    <>
      {children}

      {store.length > 0 && renderedDialogs}
    </>
  );
}
