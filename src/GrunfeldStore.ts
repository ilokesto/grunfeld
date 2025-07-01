import { GrunfeldProps, isValidGrunfeldElement, Position } from "./types";
import { isValidElement } from "react";

type Store = Array<GrunfeldProps>;

function createGrunfeldStore() {
  let callbacks = new Set<() => void>();
  let store: Store = [];

  return {
    store,
    add(dialog: GrunfeldProps) {
      store.push(dialog);
      callbacks.forEach((ls) => ls());
    },
    addAsync<T>(
      dialog: (removeWith: (data: T) => T) => GrunfeldProps
    ): Promise<T> {
      return new Promise<T>((resolve) => {
        let dialogProps: GrunfeldProps;
        const removeWith = (data: T) => {
          const idx = store.indexOf(dialogProps);
          if (idx !== -1) {
            store.splice(idx, 1);
            callbacks.forEach((ls) => ls());
          }
          resolve(data);
          return data;
        };
        dialogProps = dialog(removeWith);
        store.push(dialogProps);
        callbacks.forEach((ls) => ls());
      });
    },
    remove() {
      const props = store.pop();
      if (props && isValidGrunfeldElement(props) && props.dismissCallback) {
        props.dismissCallback();
      }
      callbacks.forEach((ls) => ls());
    },
    clear() {
      store.forEach((props) => {
        if (props && isValidGrunfeldElement(props) && props.dismissCallback)
          props.dismissCallback();
      });
      store = [];
      callbacks.forEach((ls) => ls());
    },
    addListener(listener: () => void) {
      callbacks.add(listener);
    },
    removeListener(listener: () => void) {
      callbacks.delete(listener);
    },
    isStoreEmpty() {
      return store.length === 0;
    },
  };
}

export const GrunfeldStore = createGrunfeldStore();

export default {
  add: GrunfeldStore.add,
  addAsync: GrunfeldStore.addAsync,
  remove: GrunfeldStore.remove,
  clear: GrunfeldStore.clear,
};
