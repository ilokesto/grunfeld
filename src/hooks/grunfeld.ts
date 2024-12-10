import { GrunfeldStore } from "./GrunfeldStore";

export const grunfeld = {
  success: (message: string) => {GrunfeldStore.store = { type: "success", message }},
  error: (message: string) => {GrunfeldStore.store = { type: "error", message }}
}
