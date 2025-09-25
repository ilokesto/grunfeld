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
    ? grunfeldComponentProps
    : { element: grunfeldComponentProps };

  const defaultProps = {
    defaultPosition: "center",
    defaultLightDismiss: true,
    defaultRenderMode: "inline",
    defaultBackdropStyle: { backgroundColor: "rgba(0, 0, 0, 0.3)" },
  };

  Object.keys(defaultProps).forEach((key) => {
    const originalKey = key.replace("default", "") as string;

    // 유저가 지정한 값이 없으면 기본값 할당
    (propsFormUser as any)[key] ??= defaultProps[key as keyof Default];

    // 최종 props에 유저가 지정한 값 또는 기본값 할당
    (props as any)[originalKey] ??= propsFormUser[key as keyof Default];
  });

  return props;
}
