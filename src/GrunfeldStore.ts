import { Position } from "./types";

type Store = { [x: PropertyKey]: {element: React.ReactNode, position?: Position} };

export class GrunfeldStore {
  static _callbacks = new Set<() => void>();
  static _store: Store = {}

  static addDialog = (dialog: {element: React.ReactNode, position?: Position}) => {
    const newId = Object.keys(this.store).length; 
    this.store[newId] = dialog;
    this._callbacks.forEach((ls) => ls());
  }

  static removeDialog = () => {
    const latestId = Object.keys(this.store).length - 1;
    delete this.store[latestId];
    this._callbacks.forEach((ls) => ls());
  }

  static clearStore = () => {
    this._store = {};
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

const addDialog = GrunfeldStore.addDialog;
const removeDialog = GrunfeldStore.removeDialog;
const clearStore = GrunfeldStore.clearStore;

export { addDialog, removeDialog, clearStore };