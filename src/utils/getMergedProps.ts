import {
  GrunfeldProps,
  GrunfeldProviderProps,
  isValidGrunfeldElement,
} from "../types";

type Default = GrunfeldProviderProps["options"];

export function getMergedProps(
  grunfeldComponentProps: GrunfeldProps,
  propsFormUser: Default = {}
) {
  const props = isValidGrunfeldElement(grunfeldComponentProps)
    ? ({ ...(grunfeldComponentProps as any) } as any)
    : ({ element: grunfeldComponentProps } as any);

  const defaultProps = {
    defaultPosition: "center",
    defaultLightDismiss: true,
    defaultRenderMode: "inline",
    defaultBackdropStyle: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
  };

  // Create a safe copy of user-provided defaults so we don't mutate the caller's object
  const userDefaults: Record<string, unknown> = {
    ...defaultProps,
    ...(propsFormUser as any),
  };

  // Build a new result object without mutating original inputs
  const result: Record<string, unknown> = { ...props };

  Object.keys(defaultProps).forEach((key) => {
    const originalKey = lowercaseFirst(key.replace("default", ""));
    // Use user-provided default if present, otherwise the library default
    result[originalKey] ??= userDefaults[key as keyof Default];
  });

  return result as any;
}

function lowercaseFirst(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
