import {
  clearAllScenarios,
  createScenario,
  getScenario,
} from "../store/ScenarioManager";
import { ScenarioDefinition } from "../types";
import { logger } from "../utils/logger";

// Mock dependencies
jest.mock("../utils/logger");
const mockLogger = logger as jest.Mocked<typeof logger>;

describe("ScenarioManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAllScenarios();
  });

  describe("createScenario", () => {
    it("should create a new scenario with given definition", () => {
      const definition: ScenarioDefinition = {
        step1: () => console.log("Step 1"),
        step2: () => console.log("Step 2"),
      };

      const scenario = createScenario("test-scenario", definition);

      expect(scenario.name).toBe("test-scenario");
      expect(scenario.getSteps()).toEqual(["step1", "step2"]);
      expect(scenario.hasStep("step1")).toBe(true);
      expect(scenario.hasStep("nonexistent")).toBe(false);
    });
  });

  describe("dynamic method access", () => {
    it("should call steps as methods with parameters", async () => {
      const loginMock = jest.fn();
      const showDashboardMock = jest.fn();
      const logoutMock = jest.fn();

      const definition: ScenarioDefinition = {
        login: loginMock,
        showDashboard: showDashboardMock,
        logout: logoutMock,
      };

      const scenario = createScenario("dynamic-test", definition);

      // 동적 메서드 접근 테스트
      await (scenario as any).login({ username: "admin", password: "123" });
      await (scenario as any).showDashboard();
      await (scenario as any).logout();

      expect(loginMock).toHaveBeenCalledWith({
        username: "admin",
        password: "123",
      });
      expect(showDashboardMock).toHaveBeenCalledWith(undefined);
      expect(logoutMock).toHaveBeenCalledWith(undefined);
    });

    it("should return undefined for non-existent methods", async () => {
      const definition: ScenarioDefinition = {
        login: jest.fn(),
      };

      const scenario = createScenario("undefined-test", definition);

      expect((scenario as any).nonExistent).toBeUndefined();
      expect((scenario as any).anotherNonExistent).toBeUndefined();
    });
  });

  describe("step method (removed - now private)", () => {
    it("should have removed public step method in favor of dynamic access", () => {
      const definition: ScenarioDefinition = {
        testStep: jest.fn(),
      };

      const scenario = createScenario("step-removal-test", definition);

      // step 메서드가 public API에서 제거되었는지 확인
      expect((scenario as any).step).toBeUndefined();
    });

    it("should use dynamic method access instead of step method", async () => {
      const stepMock = jest.fn();
      const definition: ScenarioDefinition = {
        testStep: stepMock,
      };

      const scenario = createScenario("dynamic-access-test", definition);
      const params = { test: "value" };

      // 동적 메서드 접근 사용
      await (scenario as any).testStep(params);

      expect(stepMock).toHaveBeenCalledWith(params);
      expect(stepMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("scenario utilities", () => {
    it("should clone scenario with new name", () => {
      const definition: ScenarioDefinition = {
        step1: () => {},
        step2: () => {},
      };

      const original = createScenario("original", definition);
      const cloned = original.clone("cloned");

      expect(cloned.name).toBe("cloned");
      expect(cloned.getSteps()).toEqual(original.getSteps());
      expect(cloned).not.toBe(original);
    });

    it("should get scenario by name", () => {
      const definition: ScenarioDefinition = {
        step1: () => {},
      };

      createScenario("findme", definition);
      const found = getScenario("findme");
      const notFound = getScenario("notfound");

      expect(found).toBeDefined();
      expect(found!.name).toBe("findme");
      expect(notFound).toBeUndefined();
    });
  });
});
