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
