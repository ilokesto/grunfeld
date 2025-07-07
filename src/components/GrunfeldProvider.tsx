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
  },
}: GrunfeldProviderProps) {
  const store = useSyncExternalStore(
    GrunfeldStore.subscribe,
    GrunfeldStore.getStore,
    GrunfeldStore.getStore
  );

  // 백드롭 스타일 메모이제이션
  const backdropContainerStyle = useMemo(
    () => ({
      position: "fixed" as const,
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      background: "transparent",
    }),
    []
  );

  // 대화상자 렌더링 최적화
  const renderedDialogs = useMemo(() => {
    return store.map((props, index) => {
      const { element, position, lightDismiss, renderMode } =
        isValidGrunfeldElement(props) ? props : { element: props };

      return (
        <Grunfeld
          key={index}
          position={position ?? options.defaultPosition}
          element={element}
          lightDismiss={lightDismiss ?? options.defaultLightDismiss}
          backdropStyle={options.backdropStyle}
          renderMode={renderMode ?? options.defaultRenderMode}
        />
      );
    });
  }, [
    store,
    options.defaultPosition,
    options.defaultLightDismiss,
    options.backdropStyle,
  ]);

  return (
    <>
      {children}

      {store.length > 0 && (
        <div style={backdropContainerStyle}>{renderedDialogs}</div>
      )}
    </>
  );
}
