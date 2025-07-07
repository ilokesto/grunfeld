export type Position =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type BackdropStyle =
  `rgba(${number}, ${number}, ${number}, 0.${number})`;

export interface GrunfeldElementProps {
  element: React.ReactNode;
  position?: Position;
  lightDismiss?: boolean;
  dismissCallback?: () => unknown;
  renderMode?: "top-layer" | "inline";
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
  // 직렬화될 수 없는 타입들 미리 체크
  if (typeof obj === "function" || typeof obj === "symbol") {
    return false;
  }

  // undefined는 JSON.stringify에서 무시되므로 false
  if (obj === undefined) {
    return false;
  }

  // 객체의 경우 내부에 함수나 심볼이 있는지 재귀적으로 확인
  if (obj !== null && typeof obj === "object") {
    try {
      // 순환 참조 체크를 위해 WeakSet 사용
      const seen = new WeakSet();

      function checkObject(value: any): boolean {
        if (value === null || typeof value !== "object") {
          return (
            typeof value !== "function" &&
            typeof value !== "symbol" &&
            value !== undefined
          );
        }

        if (seen.has(value)) {
          return false; // 순환 참조
        }
        seen.add(value);

        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            if (!checkObject(value[key])) {
              return false;
            }
          }
        }
        return true;
      }

      return checkObject(obj);
    } catch {
      return false;
    }
  }

  try {
    const serialized = JSON.stringify(obj);
    if (serialized === undefined) {
      return false;
    }
    JSON.parse(serialized);
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
    defaultRenderMode?: "top-layer" | "inline";
    backdropStyle?: BackdropStyle;
  };
};
