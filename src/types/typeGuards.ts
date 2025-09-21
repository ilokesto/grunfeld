import { GrunfeldElementProps, GrunfeldProps } from "./index";

/**
 * React Element 타입 체크를 위한 헬퍼 함수
 * React.ReactElement인지 확인합니다.
 */
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

/**
 * 직렬화 가능한 객체인지 확인하는 헬퍼 함수
 * JSON.stringify/parse가 가능한 객체인지 검증합니다.
 */
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

/**
 * GrunfeldElementProps 타입인지 확인하는 타입 가드
 * GrunfeldProps가 element 속성을 포함하는 객체인지 검증합니다.
 */
export function isValidGrunfeldElement(
  props: GrunfeldProps
): props is GrunfeldElementProps {
  return typeof props === "object" && props !== null && "element" in props;
}

/**
 * 객체가 유효한 CSS 스타일 객체인지 확인하는 타입 가드
 */
export function isValidCSSProperties(obj: unknown): obj is React.CSSProperties {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    return false;
  }

  // CSSProperties의 기본적인 구조 확인
  try {
    // 모든 값이 string, number, boolean, undefined 중 하나인지 확인
    for (const [key, value] of Object.entries(obj)) {
      if (
        typeof value !== "string" &&
        typeof value !== "number" &&
        typeof value !== "boolean" &&
        value !== undefined
      ) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * 문자열이 유효한 Position 타입인지 확인하는 타입 가드
 */
export function isValidPosition(
  value: unknown
): value is import("./index").Position {
  if (typeof value !== "string") {
    return false;
  }

  const validPositions = [
    "top-left",
    "top-center",
    "top-right",
    "center-left",
    "center",
    "center-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];

  return validPositions.includes(value);
}

/**
 * 통합된 타입 검증 유틸리티 객체
 * 모든 타입 가드 함수들을 하나의 네임스페이스로 제공
 */
export const TypeGuards = {
  isReactElement,
  isSerializable,
  isValidGrunfeldElement,
  isValidCSSProperties,
  isValidPosition,
} as const;
