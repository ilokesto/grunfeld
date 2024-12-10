import { GrunfeldStore } from "./GrunfeldStore";
import type { Store } from "./types";

export const grunfeld = {
  success: (message: string, option?: Omit<Store, "message" | "type">) => {
    GrunfeldStore.store = { type: "success", message, ...option }
  },
  error: (message: string, option?: Omit<Store, "message" | "type">) => {GrunfeldStore.store = { type: "error", message, ...option }}
}
