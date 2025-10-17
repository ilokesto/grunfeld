import { grunfeld } from "../index";

describe("Scenario API", () => {
  beforeEach(() => {
    grunfeld.clear();
  });

  describe("Basic Scenario (Object Definition)", () => {
    it("should create scenario with object definition", async () => {
      const basicScenario = grunfeld.scenario("basic-test", {
        step1: () => {
          grunfeld.add(() => "Step 1");
        },
        step2: (data: { value: string }) => {
          grunfeld.add(() => `Step 2: ${data.value}`);
        },
      }) as any; // 타입 추론 문제 해결을 위한 임시 any

      expect(basicScenario.name).toBe("basic-test");

      await basicScenario.step1();
      await basicScenario.step2({ value: "test" });

      const store = grunfeld.getStore();
      expect(store).toHaveLength(2);
      expect(store[0]).toBe("Step 1");
      expect(store[1]).toBe("Step 2: test");
    });
  });

  describe("Separated Scenario (Factory + Implementation)", () => {
    it("should create separated scenario with factory and implementation", async () => {
      const implementation = {
        startFlow: async () => {
          grunfeld.add(() => "Welcome to our app!");
          grunfeld.add(() => "Please provide your information");
        },
        finishFlow: async () => {
          grunfeld.add(() => "Please confirm your data");
        },
      };

      const welcomeScenario = grunfeld.scenario(
        "welcome-flow",
        (cliche: any) => ({
          startFlow: async () => {
            await cliche.startFlow();
          },
          finishFlow: async () => {
            await cliche.finishFlow();
          },
        }),
        implementation
      ) as any; // 타입 추론 문제 해결을 위한 임시 any

      expect(welcomeScenario.name).toBe("welcome-flow");

      await welcomeScenario.startFlow();

      const store = grunfeld.getStore();
      expect(store).toHaveLength(2);
      expect(store[0]).toBe("Welcome to our app!");
      expect(store[1]).toBe("Please provide your information");
    });

    it("should support parameter passing in separated scenarios", async () => {
      const implementation = {
        welcomeUser: async (user: { name: string; role: string }) => {
          grunfeld.add(() => `Hello ${user.name}, you are a ${user.role}`);
          grunfeld.add(() => `Processing: login`);
        },
      };

      const userScenario = grunfeld.scenario(
        "user-interaction",
        (cliche: any) => ({
          welcomeUser: async (user: { name: string; role: string }) => {
            await cliche.welcomeUser(user);
          },
        }),
        implementation
      ) as any; // 타입 추론 문제 해결을 위한 임시 any

      // Use dynamic method instead of step method
      await userScenario.welcomeUser({ name: "Alice", role: "admin" });

      const store = grunfeld.getStore();
      expect(store).toHaveLength(2);
      expect(store[0]).toContain("Alice");
      expect(store[0]).toContain("admin");
      expect(store[1]).toBe("Processing: login");
    });

    it("should handle conditional logic in separated scenarios", async () => {
      const implementation = {
        checkAccess: async (user: { isPremium: boolean; isValid: boolean }) => {
          if (!user.isValid) {
            grunfeld.add(() => "Access denied");
            return;
          }

          if (user.isPremium) {
            grunfeld.add(() => "Premium user content");
          } else {
            grunfeld.add(() => "Basic user content");
          }
        },
      };

      const conditionalScenario = grunfeld.scenario(
        "conditional-access",
        (cliche: any) => ({
          checkAccess: async (user: {
            isPremium: boolean;
            isValid: boolean;
          }) => {
            await cliche.checkAccess(user);
          },
        }),
        implementation
      ) as any; // 타입 추론 문제 해결을 위한 임시 any

      // Test premium user
      await conditionalScenario.checkAccess({
        isPremium: true,
        isValid: true,
      });
      expect(grunfeld.getStore()).toHaveLength(1);
      expect(grunfeld.getStore()[0]).toBe("Premium user content");

      grunfeld.clear();

      // Test basic user
      await conditionalScenario.checkAccess({
        isPremium: false,
        isValid: true,
      });
      expect(grunfeld.getStore()).toHaveLength(1);
      expect(grunfeld.getStore()[0]).toBe("Basic user content");

      grunfeld.clear();

      // Test invalid user
      await conditionalScenario.checkAccess({
        isPremium: true,
        isValid: false,
      });
      expect(grunfeld.getStore()).toHaveLength(1);
      expect(grunfeld.getStore()[0]).toBe("Access denied");
    });
  });

  describe("API Distinction", () => {
    it("should properly distinguish between object and factory patterns", () => {
      // Object pattern
      const objectScenario = grunfeld.scenario("object", {
        step1: () => {},
        step2: () => {},
      });

      expect(objectScenario.name).toBe("object");

      // Factory pattern (requires 3 arguments)
      const factoryScenario = grunfeld.scenario(
        "factory",
        (cliche: any) => ({ step1: () => {} }),
        { step1: async () => {} }
      );

      expect(factoryScenario.name).toBe("factory");
    });
  });
});
