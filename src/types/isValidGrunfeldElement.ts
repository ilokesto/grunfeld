import { GrunfeldProps, Position } from ".";

export function isValidGrunfeldElement(props: GrunfeldProps): props is {
  element: React.ReactNode;
  position?: Position;
  lightDismiss?: boolean;
  dismissCallback?: () => unknown;
} {
  return typeof props === "object" && props !== null && "element" in props;
}
