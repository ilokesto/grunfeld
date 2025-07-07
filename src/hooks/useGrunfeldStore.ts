import { useCallback, useSyncExternalStore } from "react";
import { GrunfeldStore } from "../store/GrunfeldStore";
import { GrunfeldProps } from "../types";

/**
 * Grunfeld 스토어 상태를 관리하는 커스텀 훅
 * 성능 최적화를 위해 선택적 구독과 메모이제이션을 제공합니다.
 */
export function useGrunfeldStore() {
  const store = useSyncExternalStore(
    GrunfeldStore.subscribe,
    GrunfeldStore.getStore,
    GrunfeldStore.getStore
  );

  const add = useCallback((dialog: GrunfeldProps) => {
    GrunfeldStore.add(dialog);
  }, []);

  const remove = useCallback(() => {
    GrunfeldStore.remove();
  }, []);

  const clear = useCallback(() => {
    GrunfeldStore.clear();
  }, []);

  const addAsync = useCallback(
    <T>(dialogFactory: (removeWith: (data: T) => T) => GrunfeldProps) => {
      return GrunfeldStore.addAsync(dialogFactory);
    },
    []
  );

  return {
    store,
    actions: {
      add,
      remove,
      clear,
      addAsync,
    },
    hasDialogs: store.length > 0,
    dialogCount: store.length,
  };
}

/**
 * 대화상자가 열려있는지 여부만 확인하는 가벼운 훅
 * 전체 스토어 상태가 필요하지 않을 때 사용합니다.
 */
export function useHasDialogs(): boolean {
  const store = useSyncExternalStore(
    GrunfeldStore.subscribe,
    () => GrunfeldStore.getStore().length > 0,
    () => GrunfeldStore.getStore().length > 0
  );

  return store;
}
