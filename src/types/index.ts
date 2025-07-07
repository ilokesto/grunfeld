export type Position = "center" | "bottom";

export type GrunfeldProps =
  | {
      element: React.ReactNode;
      position?: Position;
      lightDismiss?: boolean;
      dismissCallback?: () => unknown;
    }
  | React.ReactNode;

export function isValidGrunfeldElement(props: GrunfeldProps): props is {
  element: React.ReactNode;
  position?: Position;
  lightDismiss?: boolean;
  dismissCallback?: () => unknown;
} {
  return typeof props === "object" && props !== null && "element" in props;
}

export type GrunfeldProviderProps = {
  children: React.ReactNode;
  options?: {
    defaultPosition?: Position;
    defaultLightDismiss?: boolean;
    backdropStyle?: React.CSSProperties;
  };
};
