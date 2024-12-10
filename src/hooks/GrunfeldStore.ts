type Store = { message: string, type: "error" | "success"} | undefined;

export class GrunfeldStore {
  static _store: Store;
  static listeners: Function[] = [];

  static get store() {
    return this._store;
  }

  static set store(value: Store) {
    this._store = value;
    this.notifyListeners();
  }

  static addListener(listener: Function) {
    this.listeners.push(listener);
  }

  static removeListener(listener: Function) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  static notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}