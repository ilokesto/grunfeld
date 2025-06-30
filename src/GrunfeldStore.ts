import { Position } from "./types";

type Store = Array<{element: React.ReactNode, position?: Position}>;

export class GrunfeldStore {
  static _callbacks = new Set<() => void>();
  static _store: Store = []

  static addDialog = (dialog: {element: React.ReactNode, position?: Position}) => {
    this._store.push(dialog);
    this._callbacks.forEach((ls) => ls());
  }

  static removeDialog = () => {
    this._store.pop();
    this._callbacks.forEach((ls) => ls());
  }

  static clearStore = () => {
    this._store = [];
    this._callbacks.forEach((ls) => ls());
  }

  static get store() {
    return this._store;
  }

  static addListener(listener: () => void) {
    this._callbacks.add(listener);
  }

  static removeListener(listener: Function) {
    this._callbacks = new Set(Array.from(this._callbacks).filter((l) => l !== listener));
  }

  static isStoreEmpty() {
    return Object.keys(this.store).length === 0;
  }
}


export default {
  add: GrunfeldStore.addDialog,
  remove: GrunfeldStore.removeDialog,
  clear: GrunfeldStore.clearStore
}