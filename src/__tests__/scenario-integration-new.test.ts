import { grunfeld } from "../index";

describe("grunfeld scenario integration", () => {
  beforeEach(() => {
    grunfeld.clear();
  });

  afterEach(() => {
    grunfeld.clear();
  });

  it("should create scenario through grunfeld.scenario", () => {
    const scenario = grunfeld.scenario("test", {
      step1: () => grunfeld.add(() => "Dialog 1"),
      step2: () => grunfeld.add(() => "Dialog 2"),
    });

    expect(scenario.name).toBe("test");
    expect(scenario.getSteps()).toEqual(["step1", "step2"]);
  });

  it("should execute scenario that manipulates grunfeld store", async () => {
    let userResponse = "";

    const scenario = grunfeld.scenario("user-flow", {
      initialize: () => {
        userResponse = "John"; // 사용자 입력 시뮬레이션
        grunfeld.clear();
      },

      showDialog: () => {
        grunfeld.add(() => ({
          element: "Please enter your name",
          position: "center",
        }));
      },

      showPersonalized: () => {
        grunfeld.remove(); // 입력 다이얼로그 제거
        grunfeld.add(() => ({
          element: `Hello, ${userResponse || "User"}!`,
          position: "top-right",
        }));
      },
    });

    // 워크플로우 개별 실행 (동적 메서드 접근)
    await (scenario as any).initialize();
    await (scenario as any).showDialog();
    await (scenario as any).showPersonalized();

    // 최종 상태 확인
    const store = grunfeld.getStore();
    expect(store).toHaveLength(1);
    expect(userResponse).toBe("John");
  });

  it("should handle scenario errors gracefully", async () => {
    const scenario = grunfeld.scenario("error-test", {
      validStep: () => {
        grunfeld.add(() => "Valid dialog");
      },
      errorStep: () => {
        throw new Error("Intentional test error");
      },
      recoveryStep: () => {
        grunfeld.add(() => "Recovery dialog");
      },
    });

    // step 메서드로 직접 테스트
    await scenario.step("validStep");
    await expect(scenario.step("errorStep")).rejects.toThrow(
      "Intentional test error"
    );
    await scenario.step("recoveryStep");

    // 에러가 발생했지만 다른 단계는 독립적으로 실행됨
    const store = grunfeld.getStore();
    expect(store).toHaveLength(2); // validStep과 recoveryStep의 다이얼로그
  });
  it("should support scenario cloning", () => {
    const originalScenario = grunfeld.scenario("original", {
      step1: () => grunfeld.add(() => "Original dialog"),
      step2: () => grunfeld.add(() => "Another dialog"),
    });

    const clonedScenario = originalScenario.clone("cloned");

    expect(clonedScenario.name).toBe("cloned");
    expect(clonedScenario.getSteps()).toEqual(originalScenario.getSteps());
    expect(clonedScenario).not.toBe(originalScenario);
  });

  it("should handle multiple scenarios independently", async () => {
    const scenario1 = grunfeld.scenario("scenario1", {
      addDialog: () => grunfeld.add(() => "Dialog from scenario 1"),
    });

    const scenario2 = grunfeld.scenario("scenario2", {
      addDialog: () => grunfeld.add(() => "Dialog from scenario 2"),
    });

    // 각각 독립적으로 실행
    await (scenario1 as any).addDialog();
    await (scenario2 as any).addDialog();

    // 스토어에 둘 다 추가됨
    const store = grunfeld.getStore();
    expect(store).toHaveLength(2);
  });
});
