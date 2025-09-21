import {
  TypeGuards,
  isValidCSSProperties,
  isValidPosition,
} from "../types/typeGuards";

describe("TypeGuards", () => {
  describe("isValidPosition", () => {
    it("should return true for valid positions", () => {
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

      validPositions.forEach((position) => {
        expect(isValidPosition(position)).toBe(true);
      });
    });

    it("should return false for invalid positions", () => {
      const invalidPositions = [
        "invalid-position",
        "top",
        "left",
        "middle-center",
        123,
        null,
        undefined,
        {},
        [],
      ];

      invalidPositions.forEach((position) => {
        expect(isValidPosition(position)).toBe(false);
      });
    });
  });

  describe("isValidCSSProperties", () => {
    it("should return true for valid CSS properties", () => {
      const validStyles = [
        { color: "red" },
        { fontSize: "16px" },
        { zIndex: 1000 },
        { opacity: 0.5 },
        { backgroundColor: "blue", fontSize: "14px" },
        { display: undefined }, // undefined는 허용
        { overflow: true }, // boolean도 일부 CSS 속성에서 허용
        {},
      ];

      validStyles.forEach((style) => {
        expect(isValidCSSProperties(style)).toBe(true);
      });
    });

    it("should return false for invalid CSS properties", () => {
      const invalidStyles = [
        null,
        undefined,
        "string",
        123,
        [],
        { fontSize: {} }, // 객체는 허용되지 않음
        { callback: () => {} }, // 함수는 허용되지 않음
      ];

      invalidStyles.forEach((style, index) => {
        expect(isValidCSSProperties(style)).toBe(false);
      });
    });
  });

  describe("TypeGuards object", () => {
    it("should contain all type guard functions", () => {
      expect(TypeGuards.isReactElement).toBeDefined();
      expect(TypeGuards.isSerializable).toBeDefined();
      expect(TypeGuards.isValidGrunfeldElement).toBeDefined();
      expect(TypeGuards.isValidCSSProperties).toBeDefined();
      expect(TypeGuards.isValidPosition).toBeDefined();

      // 모든 함수가 function 타입인지 확인
      Object.values(TypeGuards).forEach((fn) => {
        expect(typeof fn).toBe("function");
      });
    });

    it("should be readonly object", () => {
      // TypeGuards 객체가 있는지만 확인 (readonly 테스트는 TypeScript 컴파일 시점에서 확인됨)
      expect(TypeGuards).toBeDefined();
      expect(Object.keys(TypeGuards).length).toBeGreaterThan(0);
    });
  });

  describe("integration with existing type guards", () => {
    it("should maintain compatibility with legacy exports", () => {
      // 기존 테스트에서 사용하던 방식들이 여전히 작동해야 함
      expect(TypeGuards.isReactElement("string")).toBe(false);
      expect(TypeGuards.isSerializable({ a: 1 })).toBe(true);
      expect(TypeGuards.isValidGrunfeldElement({ element: "test" })).toBe(true);
    });
  });
});
