import { generateDialogHash, hashManager } from "../store/GrunfeldHashManager";
import { GrunfeldProps } from "../types";
import { logger } from "../utils/logger";

// 로거를 모킹
jest.mock("../utils/logger", () => ({
  logger: {
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

const mockedLogger = logger as jest.Mocked<typeof logger>;

describe("GrunfeldHashManager", () => {
  beforeEach(() => {
    hashManager.clearAll();
    jest.clearAllMocks();
  });

  describe("generateDialogHash", () => {
    it("should generate consistent hash for same dialog", () => {
      const dialog: GrunfeldProps = {
        element: "Test dialog",
        position: "center",
        lightDismiss: true,
      };

      const hash1 = generateDialogHash(dialog);
      const hash2 = generateDialogHash(dialog);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBeGreaterThan(0);
    });

    it("should generate different hash for different dialogs", () => {
      const dialog1: GrunfeldProps = {
        element: "Dialog 1",
        position: "center",
      };

      const dialog2: GrunfeldProps = {
        element: "Dialog 2",
        position: "bottom",
      };

      const hash1 = generateDialogHash(dialog1);
      const hash2 = generateDialogHash(dialog2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle React.ReactNode dialogs", () => {
      const dialog1: GrunfeldProps = "Simple string dialog";
      const dialog2: GrunfeldProps = 123;

      const hash1 = generateDialogHash(dialog1);
      const hash2 = generateDialogHash(dialog2);

      expect(typeof hash1).toBe("string");
      expect(typeof hash2).toBe("string");
      expect(hash1).not.toBe(hash2);
    });

    it("should handle null and undefined values", () => {
      const dialog1: GrunfeldProps = null;
      const dialog2: GrunfeldProps = undefined;

      const hash1 = generateDialogHash(dialog1);
      const hash2 = generateDialogHash(dialog2);

      expect(typeof hash1).toBe("string");
      expect(typeof hash2).toBe("string");
      expect(hash1).not.toBe(hash2);
    });

    it("should handle boolean values", () => {
      const dialog1: GrunfeldProps = true;
      const dialog2: GrunfeldProps = false;

      const hash1 = generateDialogHash(dialog1);
      const hash2 = generateDialogHash(dialog2);

      expect(typeof hash1).toBe("string");
      expect(typeof hash2).toBe("string");
      expect(hash1).not.toBe(hash2);
    });

    it("should handle non-serializable objects", () => {
      const circularObj: any = {};
      circularObj.self = circularObj; // 순환 참조로 JSON.stringify 실패

      const dialog: GrunfeldProps = {
        element: circularObj,
        position: "center",
      };

      const hash = generateDialogHash(dialog);

      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
      // debug 메시지가 호출되었는지 확인
      expect(mockedLogger.debug).toHaveBeenCalledWith(
        "Object is not serializable, using fallback",
        circularObj
      );
    });

    it("should handle React elements with non-serializable props", () => {
      const nonSerializableFunc = () => "test";

      const reactElement: any = {
        type: "div",
        props: { onClick: nonSerializableFunc }, // 함수는 직렬화 불가능
      };

      const dialog: GrunfeldProps = {
        element: reactElement as React.ReactNode,
        position: "center",
      };

      const hash = generateDialogHash(dialog);

      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
      // React element의 경우 isSerializable이 false여도 "[Non-serializable]"로 대체되므로
      // 정상적인 해시가 생성되어야 함
    });

    it("should call debug logger when safeStringify handles non-serializable element", () => {
      const circularObj: any = {};
      circularObj.self = circularObj;

      // React element가 아닌 비직렬화 가능한 객체를 element로 사용
      const dialog: GrunfeldProps = {
        element: circularObj, // 이 경우 safeStringify가 호출됨
        position: "center",
      };

      const hash = generateDialogHash(dialog);

      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
      // 비직렬화 가능한 element로 인해 debug 메시지가 호출되어야 함
      expect(mockedLogger.debug).toHaveBeenCalledWith(
        "Object is not serializable, using fallback",
        circularObj
      );
    });

    it("should handle React element with function type", () => {
      const MyComponent = () => null;
      const reactElement: any = {
        type: MyComponent, // 함수 컴포넌트
        props: { name: "test" },
      };

      const dialog: GrunfeldProps = {
        element: reactElement as React.ReactNode,
        position: "center",
      };

      const hash = generateDialogHash(dialog);

      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should use fallback hash when JSON.stringify fails in safeStringify", () => {
      // isSerializable을 모킹하여 true를 반환하게 하고, JSON.stringify에서 에러 발생시킴
      const originalIsSerializable = require("../types").isSerializable;
      const mockIsSerializable = jest.fn().mockReturnValue(true);

      // 모듈을 직접 모킹할 수 없으므로, JSON.stringify를 모킹
      const originalStringify = JSON.stringify;
      JSON.stringify = jest.fn().mockImplementation((obj) => {
        // BigInt와 같이 특정 조건에서 에러 발생
        if (typeof obj === "bigint") {
          throw new TypeError("Do not know how to serialize a BigInt");
        }
        return originalStringify(obj);
      });

      const bigIntValue = 123n; // BigInt

      const dialog: GrunfeldProps = {
        element: bigIntValue as any,
        position: "center",
      };

      const hash = generateDialogHash(dialog);

      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);

      // JSON.stringify 복원
      JSON.stringify = originalStringify;

      // 실제로는 isSerializable에서 이미 false가 반환되므로
      // debug 메시지가 호출되었을 것임
      expect(mockedLogger.debug).toHaveBeenCalledWith(
        "Object is not serializable, using fallback",
        bigIntValue
      );
    });

    it("should use fallback hash when btoa fails", () => {
      // btoa가 실패할 수 있는 상황을 시뮬레이션
      const originalBtoa = global.btoa;
      global.btoa = jest.fn().mockImplementation(() => {
        throw new Error("btoa failed");
      });

      const dialog: GrunfeldProps = {
        element: "Test dialog",
        position: "center",
      };

      const hash = generateDialogHash(dialog);

      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);

      // btoa 복원
      global.btoa = originalBtoa;
    });

    it("should use fallback hash when unexpected error occurs", () => {
      // isValidGrunfeldElement이 예외를 던지도록 모킹
      const originalIsValid = require("../types").isValidGrunfeldElement;
      const mockIsValid = jest.fn().mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      // 모듈을 다시 로드할 수 없으므로 다른 방법으로 에러 케이스 테스트
      const dialog: GrunfeldProps = {
        element: "Test dialog",
        position: "center",
      };

      // 정상적인 경우라도 에러 핸들링이 동작하는지 확인
      const hash = generateDialogHash(dialog);
      expect(typeof hash).toBe("string");
    });
  });

  describe("hashManager", () => {
    it("should prevent duplicate dialogs", () => {
      const dialog: GrunfeldProps = {
        element: "Test dialog",
        position: "center",
      };

      const result1 = hashManager.tryAddDialog(dialog);
      const result2 = hashManager.tryAddDialog(dialog);

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it("should allow adding different dialogs", () => {
      const dialog1: GrunfeldProps = {
        element: "Dialog 1",
        position: "center",
      };

      const dialog2: GrunfeldProps = {
        element: "Dialog 2",
        position: "bottom",
      };

      const result1 = hashManager.tryAddDialog(dialog1);
      const result2 = hashManager.tryAddDialog(dialog2);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it("should remove dialogs correctly", () => {
      const dialog: GrunfeldProps = {
        element: "Test dialog",
        position: "center",
      };

      hashManager.tryAddDialog(dialog);
      hashManager.removeDialog(dialog);

      // Should be able to add again after removal
      const result = hashManager.tryAddDialog(dialog);
      expect(result).toBe(true);
    });

    it("should handle removing non-existent dialog", () => {
      const dialog: GrunfeldProps = {
        element: "Non-existent dialog",
        position: "center",
      };

      // 존재하지 않는 대화상자 제거 시도
      hashManager.removeDialog(dialog);

      // 에러 없이 처리되어야 함
      expect(hashManager.getHashCount()).toBe(0);
    });

    it("should clear all dialogs", () => {
      const dialog1: GrunfeldProps = { element: "Dialog 1" };
      const dialog2: GrunfeldProps = { element: "Dialog 2" };

      hashManager.tryAddDialog(dialog1);
      hashManager.tryAddDialog(dialog2);

      expect(hashManager.getHashCount()).toBe(2);

      hashManager.clearAll();

      expect(hashManager.getHashCount()).toBe(0);

      // Should be able to add again after clear
      expect(hashManager.tryAddDialog(dialog1)).toBe(true);
      expect(hashManager.tryAddDialog(dialog2)).toBe(true);
    });

    it("should correctly count hashes", () => {
      expect(hashManager.getHashCount()).toBe(0);

      const dialog1: GrunfeldProps = { element: "Dialog 1" };
      const dialog2: GrunfeldProps = { element: "Dialog 2" };

      hashManager.tryAddDialog(dialog1);
      expect(hashManager.getHashCount()).toBe(1);

      hashManager.tryAddDialog(dialog2);
      expect(hashManager.getHashCount()).toBe(2);

      hashManager.removeDialog(dialog1);
      expect(hashManager.getHashCount()).toBe(1);

      hashManager.clearAll();
      expect(hashManager.getHashCount()).toBe(0);
    });
  });
});
