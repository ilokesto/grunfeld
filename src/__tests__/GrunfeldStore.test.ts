import { GrunfeldStore } from "../store/GrunfeldStore";
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

describe("GrunfeldStore", () => {
  beforeEach(() => {
    GrunfeldStore.clear();
    jest.clearAllMocks();
  });

  describe("add", () => {
    it("should add dialog to store", () => {
      const dialog = { element: "Test dialog" };

      GrunfeldStore.add(dialog);

      const store = GrunfeldStore.getStore();
      expect(store).toHaveLength(1);
      expect(store[0]).toEqual(dialog);
    });

    it("should prevent duplicate dialogs", () => {
      const dialog = { element: "Test dialog", position: "center" as const };

      GrunfeldStore.add(dialog);
      GrunfeldStore.add(dialog); // Same dialog

      const store = GrunfeldStore.getStore();
      expect(store).toHaveLength(1);
    });

    it("should not add dialog when hashManager prevents it", () => {
      const dialog = { element: "Test dialog", position: "center" as const };

      // 첫 번째 추가는 성공
      GrunfeldStore.add(dialog);
      expect(GrunfeldStore.getStore()).toHaveLength(1);

      // 두 번째 추가는 실패 (중복)
      GrunfeldStore.add(dialog);
      expect(GrunfeldStore.getStore()).toHaveLength(1);
    });
  });

  describe("remove", () => {
    it("should remove last dialog from store", () => {
      const dialog1 = { element: "Dialog 1" };
      const dialog2 = { element: "Dialog 2" };

      GrunfeldStore.add(dialog1);
      GrunfeldStore.add(dialog2);

      expect(GrunfeldStore.getStore()).toHaveLength(2);

      GrunfeldStore.remove();

      expect(GrunfeldStore.getStore()).toHaveLength(1);
      expect(GrunfeldStore.getStore()[0]).toEqual(dialog1);
    });

    it("should call dismiss callback when removing dialog", () => {
      const dismissCallback = jest.fn();
      const dialog = {
        element: "Test dialog",
        dismissCallback,
      };

      GrunfeldStore.add(dialog);
      GrunfeldStore.remove();

      expect(dismissCallback).toHaveBeenCalledTimes(1);
    });

    it("should handle dismiss callback errors", () => {
      const dismissCallback = jest.fn().mockImplementation(() => {
        throw new Error("Dismiss callback error");
      });
      const dialog = {
        element: "Test dialog",
        dismissCallback,
      };

      GrunfeldStore.add(dialog);

      // 에러가 발생해도 제거 작업은 계속되어야 함
      expect(() => GrunfeldStore.remove()).not.toThrow();
      expect(GrunfeldStore.getStore()).toHaveLength(0);
    });

    it("should handle remove when store is empty", () => {
      expect(GrunfeldStore.getStore()).toHaveLength(0);

      // 빈 스토어에서 remove 호출 시 에러 없이 처리
      expect(() => GrunfeldStore.remove()).not.toThrow();
      expect(GrunfeldStore.getStore()).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("should remove all dialogs from store", () => {
      GrunfeldStore.add({ element: "Dialog 1" });
      GrunfeldStore.add({ element: "Dialog 2" });
      GrunfeldStore.add({ element: "Dialog 3" });

      expect(GrunfeldStore.getStore()).toHaveLength(3);

      GrunfeldStore.clear();

      expect(GrunfeldStore.getStore()).toHaveLength(0);
    });

    it("should call dismiss callbacks for all dialogs when clearing", () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      GrunfeldStore.add({ element: "Dialog 1", dismissCallback: callback1 });
      GrunfeldStore.add({ element: "Dialog 2", dismissCallback: callback2 });
      GrunfeldStore.add({ element: "Dialog 3", dismissCallback: callback3 });

      GrunfeldStore.clear();

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it("should handle dismiss callback errors during clear", () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error("Clear callback error");
      });
      const normalCallback = jest.fn();

      GrunfeldStore.add({
        element: "Dialog 1",
        dismissCallback: errorCallback,
      });
      GrunfeldStore.add({
        element: "Dialog 2",
        dismissCallback: normalCallback,
      });

      // 에러가 발생해도 모든 대화상자가 제거되어야 함
      expect(() => GrunfeldStore.clear()).not.toThrow();
      expect(GrunfeldStore.getStore()).toHaveLength(0);
      expect(normalCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("subscribe", () => {
    it("should notify subscribers when store changes", () => {
      const callback = jest.fn();

      const unsubscribe = GrunfeldStore.subscribe(callback);

      GrunfeldStore.add({ element: "Test dialog" });

      expect(callback).toHaveBeenCalled();

      unsubscribe();
    });

    it("should not notify unsubscribed callbacks", () => {
      const callback = jest.fn();

      const unsubscribe = GrunfeldStore.subscribe(callback);
      unsubscribe();

      GrunfeldStore.add({ element: "Test dialog" });

      expect(callback).not.toHaveBeenCalled();
    });

    it("should handle callback errors during notification", () => {
      const errorCallback = jest.fn().mockImplementation(() => {
        throw new Error("Callback error");
      });
      const normalCallback = jest.fn();

      GrunfeldStore.subscribe(errorCallback);
      GrunfeldStore.subscribe(normalCallback);

      // 콜백 에러가 발생해도 다른 콜백들은 계속 호출되어야 함
      expect(() => GrunfeldStore.add({ element: "Test dialog" })).not.toThrow();
      expect(normalCallback).toHaveBeenCalled();
    });

    it("should not notify when there are no callbacks", () => {
      // 콜백이 없을 때 최적화 경로 테스트
      expect(() => GrunfeldStore.add({ element: "Test dialog" })).not.toThrow();
      expect(GrunfeldStore.getStore()).toHaveLength(1);
    });
  });

  describe("addAsync", () => {
    it("should resolve with provided data when removeWith is called", async () => {
      const testData = { success: true };

      const promise = GrunfeldStore.addAsync((removeWith) => {
        setTimeout(() => removeWith(testData), 100);
        return { element: "Async dialog" };
      });

      const result = await promise;

      expect(result).toEqual(testData);
      expect(GrunfeldStore.getStore()).toHaveLength(0); // Should be removed
    });

    it("should handle removeWith callback errors", async () => {
      const testData = { success: true };

      const promise = GrunfeldStore.addAsync((removeWith) => {
        // removeWith 내부에서 에러 발생하도록 설정
        setTimeout(() => {
          // 스토어를 임의로 조작해서 indexOf가 -1을 반환하도록 함
          const originalStore = GrunfeldStore.getStore();
          (GrunfeldStore as any).store = []; // 강제로 빈 배열 설정
          removeWith(testData);
        }, 50);
        return { element: "Async dialog" };
      });

      try {
        await promise;
        // 에러가 발생하지 않으면 실패
        expect(false).toBe(true);
      } catch (error) {
        // removeWith에서 에러가 발생해야 함
        expect(error).toBeDefined();
      }
    });

    it("should handle duplicate async dialogs", async () => {
      const dialog = {
        element: "Duplicate async dialog",
        position: "center" as const,
      };

      // 첫 번째 async 대화상자 추가
      const promise1 = GrunfeldStore.addAsync((removeWith) => {
        setTimeout(() => removeWith({ result: 1 }), 200);
        return dialog;
      });

      // 동일한 대화상자로 두 번째 async 시도 (중복)
      const promise2 = GrunfeldStore.addAsync((removeWith) => {
        setTimeout(() => removeWith({ result: 2 }), 100);
        return dialog;
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual({ result: 1 });
      expect(result2).toEqual({}); // 중복으로 인해 빈 객체 반환
    });

    it("should handle dialogFactory errors", async () => {
      const promise = GrunfeldStore.addAsync((removeWith) => {
        throw new Error("DialogFactory error");
      });

      try {
        await promise;
        // 에러가 발생하지 않으면 실패
        expect(false).toBe(true);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("DialogFactory error");
        // addAsync의 에러 핸들링이 호출되었는지 확인
        expect(mockedLogger.error).toHaveBeenCalledWith(
          "Error in addAsync",
          expect.any(Error)
        );
      }
    });

    it("should prevent duplicate async dialogs", async () => {
      // 실제로 같은 해시를 생성하는 동일한 다이얼로그를 만들기 위해
      // 완전히 동일한 다이얼로그 객체를 생성하는 팩토리 사용
      let removeWithCallback: any;

      const dialogFactory1 = (removeWith: any) => {
        removeWithCallback = removeWith;
        return {
          element: "Exact Same Dialog",
          position: "center" as const,
          lightDismiss: true,
        };
      };

      const dialogFactory2 = (removeWith: any) => {
        return {
          element: "Exact Same Dialog",
          position: "center" as const,
          lightDismiss: true,
        };
      };

      // 첫 번째 다이얼로그 추가
      const promise1 = GrunfeldStore.addAsync(dialogFactory1);

      // 완전히 동일한 다이얼로그 다시 추가 시도 (해시가 같음)
      const promise2 = GrunfeldStore.addAsync(dialogFactory2);

      // 첫 번째 다이얼로그를 해제하여 promise1 완료
      removeWithCallback({ result: 1 });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toEqual({ result: 1 });
      expect(result2).toEqual({}); // 중복으로 인해 빈 객체 반환

      // 중복 방지 경고가 호출되었는지 확인
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Duplicate async dialog prevented"
      );
    });
  });
});
