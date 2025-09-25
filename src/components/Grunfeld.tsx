import { GrunfeldElementProps } from "../types";
import { GrunfeldDialog } from "./GrunfeldDialog";
import { GrunfeldModal } from "./GrunfeldModal";

export function Grunfeld({ renderMode, ...props }: GrunfeldElementProps) {
  return renderMode === "top-layer" ? (
    <GrunfeldDialog {...props} />
  ) : (
    <GrunfeldModal {...props} />
  );
}
