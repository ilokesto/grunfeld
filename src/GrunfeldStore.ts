import { Position } from "./types";

export interface IGrunfeldProps {
  element: React.ReactNode;
  position?: Position;
  lightDismiss?: boolean;
  dismissCallback?: () => unknown;
}

type Store = Array<IGrunfeldProps>;

export class GrunfeldStore {
  static _callbacks = new Set<() => void>();
  static _store: Store = [];

  static add = (dialog: IGrunfeldProps) => {
    GrunfeldStore._store.push(dialog);
    GrunfeldStore._callbacks.forEach((ls) => ls());
  };

  static addAsync = <T>(
    dialog: (removeWith: (data: T) => T) => IGrunfeldProps
  ): Promise<T> => {
    return new Promise<T>((resolve) => {
      const removeWith = (data: T) => {
        // dialog로 생성된 props를 스토어에서 제거
        GrunfeldStore._store = GrunfeldStore._store.filter(
          (d) => d !== dialogProps
        );
        GrunfeldStore._callbacks.forEach((ls) => ls());
        // remove가 호출될 때 data를 resolve
        resolve(data);
        return data;
      };

      const dialogProps = dialog(removeWith);
      GrunfeldStore._store.push(dialogProps);
      GrunfeldStore._callbacks.forEach((ls) => ls());
    });
  };

  static remove = () => {
    const props = GrunfeldStore._store.pop();

    if (props?.dismissCallback) props.dismissCallback();

    GrunfeldStore._callbacks.forEach((ls) => ls());
  };

  static clear = () => {
    GrunfeldStore._store.forEach((props) => {
      if (props.dismissCallback) props.dismissCallback();
    });

    GrunfeldStore._store = [];

    GrunfeldStore._callbacks.forEach((ls) => ls());
  };

  static get store() {
    return GrunfeldStore._store;
  }

  static addListener(listener: () => void) {
    GrunfeldStore._callbacks.add(listener);
  }

  static removeListener(listener: Function) {
    GrunfeldStore._callbacks = new Set(
      Array.from(GrunfeldStore._callbacks).filter((l) => l !== listener)
    );
  }

  static isStoreEmpty() {
    return Object.keys(GrunfeldStore.store).length === 0;
  }
}

export default {
  add: GrunfeldStore.add,
  addAsync: GrunfeldStore.addAsync,
  remove: GrunfeldStore.remove,
  clear: GrunfeldStore.clear,
};
