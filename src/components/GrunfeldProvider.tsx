import { useMemo } from "react";
import { useGrunfeldStore } from "../hooks/useGrunfeldStore";
import { GrunfeldProviderProps, isValidGrunfeldElement } from "../types";
import { Grunfeld } from "./Grunfeld";

export function GrunfeldProvider({
  children,
  options = { defaultPosition: "center", defaultLightDismiss: true },
}: GrunfeldProviderProps) {
  const { store, hasDialogs } = useGrunfeldStore();

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
      const { element, position, lightDismiss } = isValidGrunfeldElement(props)
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

      {hasDialogs && (
        <div style={backdropContainerStyle}>{renderedDialogs}</div>
      )}
    </>
  );
}
