import {
  GrunfeldElementProps,
  GrunfeldProps,
  isReactElement,
  isSerializable,
  isValidGrunfeldElement,
} from "../types";

describe("Types Utilities", () => {
  describe("isValidGrunfeldElement", () => {
    it("should return true for valid GrunfeldElementProps", () => {
      const validProps: GrunfeldElementProps = {
        element: "Test element",
        position: "center",
        lightDismiss: true,
      };

      expect(isValidGrunfeldElement(validProps)).toBe(true);
    });

    it("should return true for minimal GrunfeldElementProps", () => {
      const validProps: GrunfeldElementProps = {
        element: "Test element",
      };

      expect(isValidGrunfeldElement(validProps)).toBe(true);
    });

    it("should return false for React.ReactNode", () => {
      const reactNode: GrunfeldProps = "Simple string";
      expect(isValidGrunfeldElement(reactNode)).toBe(false);

      const numberNode: GrunfeldProps = 123;
      expect(isValidGrunfeldElement(numberNode)).toBe(false);

      const nullNode: GrunfeldProps = null;
      expect(isValidGrunfeldElement(nullNode)).toBe(false);
    });

    it("should return false for objects without element property", () => {
      const invalidProps = {
        position: "center",
        lightDismiss: true,
      };

      expect(isValidGrunfeldElement(invalidProps as any)).toBe(false);
    });

    it("should return false for null and undefined", () => {
      expect(isValidGrunfeldElement(null)).toBe(false);
      expect(isValidGrunfeldElement(undefined as any)).toBe(false);
    });
  });

  describe("isReactElement", () => {
    it("should return true for valid React elements", () => {
      const reactElement = {
        type: "div",
        props: { children: "Hello" },
      };

      expect(isReactElement(reactElement as any)).toBe(true);
    });

    it("should return true for component React elements", () => {
      const Component = () => null;
      const reactElement = {
        type: Component,
        props: { name: "test" },
      };

      expect(isReactElement(reactElement as any)).toBe(true);
    });

    it("should return false for non-React elements", () => {
      expect(isReactElement("string")).toBe(false);
      expect(isReactElement(123)).toBe(false);
      expect(isReactElement(null)).toBe(false);
      expect(isReactElement(undefined)).toBe(false);
      expect(isReactElement({} as any)).toBe(false);
    });

    it("should return false for objects without type or props", () => {
      const invalidElement1 = { type: "div" }; // props 없음
      const invalidElement2 = { props: {} }; // type 없음

      expect(isReactElement(invalidElement1 as any)).toBe(false);
      expect(isReactElement(invalidElement2 as any)).toBe(false);
    });
  });

  describe("isSerializable", () => {
    it("should return true for serializable objects", () => {
      expect(isSerializable({ name: "test", age: 30 })).toBe(true);
      expect(isSerializable([1, 2, 3])).toBe(true);
      expect(isSerializable("string")).toBe(true);
      expect(isSerializable(123)).toBe(true);
      expect(isSerializable(true)).toBe(true);
      expect(isSerializable(null)).toBe(true);
    });

    it("should return false for non-serializable objects", () => {
      // 순환 참조
      const circular: any = {};
      circular.self = circular;
      expect(isSerializable(circular)).toBe(false);

      // 함수
      expect(isSerializable(() => {})).toBe(false);

      // Symbol
      expect(isSerializable(Symbol("test"))).toBe(false);

      // undefined
      expect(isSerializable(undefined)).toBe(false);
    });

    it("should handle complex non-serializable nested objects", () => {
      const complexObj = {
        name: "test",
        callback: () => {},
        nested: {
          value: 42,
          func: function () {
            return this;
          },
        },
      };

      expect(isSerializable(complexObj)).toBe(false);
    });

    it("should handle errors during object traversal", () => {
      // WeakSet.has가 에러를 발생시키는 상황을 시뮬레이션
      // 더 현실적인 에러 케이스: 객체의 속성 접근에서 에러 발생
      const problematicObj = {};

      // getter에서 에러가 발생하는 속성 추가
      Object.defineProperty(problematicObj, "testProp", {
        get() {
          throw new Error("Property access error");
        },
        enumerable: true,
        configurable: true,
      });

      expect(isSerializable(problematicObj)).toBe(false);
    });

    it("should handle JSON.stringify errors for primitive-like values", () => {
      // JSON.stringify가 undefined를 반환하는 경우를 테스트
      // 실제로는 primitive 값들은 이 경우에 해당하지 않지만,
      // 특수한 객체를 만들어 테스트할 수 있음
      const symbolKey = Symbol("test");
      const objWithSymbolProperty = { [symbolKey]: "value" };

      // Symbol 키를 가진 객체는 JSON.stringify에서 무시되지만 여전히 유효한 JSON 반환
      expect(isSerializable(objWithSymbolProperty)).toBe(true);
    });

    it("should handle circular reference errors", () => {
      // WeakSet을 사용한 순환 참조 감지에서 에러가 발생하는 경우
      const circular: any = {};
      circular.self = circular;

      expect(isSerializable(circular)).toBe(false);
    });
  });
});
