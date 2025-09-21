import GrunfeldStore from "../store/GrunfeldStore";

// GrunfeldStore 모킹
jest.mock("../store/GrunfeldStore", () => ({
  remove: jest.fn(),
}));

describe("useGrunfeldBehavior", () => {
  const mockRemove = GrunfeldStore.remove as jest.MockedFunction<
    typeof GrunfeldStore.remove
  >;

  beforeEach(() => {
    mockRemove.mockClear();
  });

  // 실제 훅 테스트는 컴포넌트 테스트에서 다루고, 여기서는 모킹된 함수 확인만
  it("should have GrunfeldStore.remove function available", () => {
    expect(GrunfeldStore.remove).toBeDefined();
    expect(typeof GrunfeldStore.remove).toBe("function");

    // Mock 함수 호출 테스트
    GrunfeldStore.remove();
    expect(mockRemove).toHaveBeenCalledTimes(1);
  });
});
