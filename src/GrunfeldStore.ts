import { hashManager } from "./GrunfeldHashManager";
import { GrunfeldProps, isValidGrunfeldElement } from "./types";

type Store = Array<GrunfeldProps>;
type Callback = () => void;
type RemoveWithFunction<T> = (data: T) => T;
type DialogFactory<T> = (removeWith: RemoveWithFunction<T>) => GrunfeldProps;

function createGrunfeldStore() {
  const callbacks = new Set<Callback>();
  let store: Store = [];

  const notifyCallbacks = () => {
    store = [...store];
    callbacks.forEach((callback) => callback());
  };

  return {
    add(dialog: GrunfeldProps) {
      if (!hashManager.tryAddDialog(dialog)) {
        return;
      }

      store.push(dialog);
      notifyCallbacks();
    },

    addAsync<T>(dialogFactory: DialogFactory<T>): Promise<T> {
      return new Promise<T>((resolve) => {
        let dialogProps: GrunfeldProps;

        const removeWith: RemoveWithFunction<T> = (data: T) => {
          const index = store.indexOf(dialogProps);
          if (index !== -1) {
            hashManager.removeDialog(dialogProps);
            store.splice(index, 1);
            notifyCallbacks();
          }
          resolve(data);
          return data;
        };

        dialogProps = dialogFactory(removeWith);

        if (!hashManager.tryAddDialog(dialogProps)) {
          console.warn("Duplicate async dialog prevented");
          resolve({} as T);
          return;
        }

        store.push(dialogProps);
        notifyCallbacks();
      });
    },

    remove() {
      const props = store.pop();
      if (props) {
        hashManager.removeDialog(props);
        dismissDialog(props);
        notifyCallbacks();
      }
    },

    clear() {
      store.forEach(dismissDialog);
      store = [];
      hashManager.clearAll();
      notifyCallbacks();
    },

    getStore: () => store,

    subscribe(callback: Callback) {
      callbacks.add(callback);
      return () => {
        callbacks.delete(callback);
      };
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

function dismissDialog(props: GrunfeldProps) {
  if (isValidGrunfeldElement(props) && props.dismissCallback) {
    props.dismissCallback();
  }
}
