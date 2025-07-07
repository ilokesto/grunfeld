import { GrunfeldElementProps, GrunfeldProps } from ".";

export function isValidGrunfeldElement(
  props: GrunfeldProps
): props is GrunfeldElementProps {
  return typeof props === "object" && props !== null && "element" in props;
}
