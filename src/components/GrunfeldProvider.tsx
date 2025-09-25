import { useMemo, useSyncExternalStore } from "react";
import { GrunfeldStore } from "../store/GrunfeldStore";
import { GrunfeldProviderProps } from "../types";
import { getMergedProps } from "../utils/getMergedProps";
import { Grunfeld } from "./Grunfeld";

export function GrunfeldProvider({ children, options }: GrunfeldProviderProps) {
  const store = useSyncExternalStore(
    GrunfeldStore.subscribe,
    GrunfeldStore.getStore,
    GrunfeldStore.getStore
  );

  // 대화상자 렌더링 최적화
  const renderedDialogs = useMemo(() => {
    return store.map((props, index) => {
      const mergedProps = getMergedProps(props, options);

      return <Grunfeld key={index} {...mergedProps} />;
    });
  }, [store, options]);

  return (
    <>
      {children}

      {store.length > 0 && renderedDialogs}
    </>
  );
}
