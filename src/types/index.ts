export type Position = "center" | "bottom";

export interface GrunfeldElementProps {
  element: React.ReactNode;
  position?: Position;
  lightDismiss?: boolean;
  dismissCallback?: () => unknown;
}
export type GrunfeldProps = GrunfeldElementProps | React.ReactNode;

export function isValidGrunfeldElement(
  props: GrunfeldProps
): props is GrunfeldElementProps {
  return typeof props === "object" && props !== null && "element" in props;
}

// React Element 타입 체크를 위한 헬퍼 함수
export function isReactElement(
  node: React.ReactNode
): node is React.ReactElement {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    "props" in node
  );
}

// 직렬화 가능한 객체인지 확인하는 헬퍼 함수
export function isSerializable(obj: unknown): boolean {
  try {
    JSON.stringify(obj);
    return true;
  } catch {
    return false;
  }
}

export type GrunfeldProviderProps = {
  children: React.ReactNode;
  options?: {
    defaultPosition?: Position;
    defaultLightDismiss?: boolean;
    backdropStyle?: React.CSSProperties;
  };
};
