import { grunfeld } from "../index";

describe("unified scenario API", () => {
  beforeEach(() => {
    grunfeld.clear();
  });

  it("should support object definition (traditional way)", async () => {
    const objectScenario = grunfeld.scenario("object-test", {
      step1: () => {
        grunfeld.add(() => "Step 1");
      },
      step2: (data: { value: string }) => {
        grunfeld.add(() => `Step 2: ${data.value}`);
      },
    });

    await (objectScenario as any).step1();
    await (objectScenario as any).step2({ value: "test" });

    const store = grunfeld.getStore();
    expect(store).toHaveLength(2);
  });

  it("should support factory function (recursive way)", async () => {
    const factoryScenario = grunfeld.scenario(
      "factory-test",
      (scenario: any) => ({
        main: () => {
          grunfeld.add(() => "Main");
          scenario.sub();
        },
        sub: () => {
          grunfeld.add(() => "Sub");
        },
      })
    );

    await (factoryScenario as any).main();

    const store = grunfeld.getStore();
    expect(store).toHaveLength(2); // main과 sub 호출
  });

  it("should support separated recursive way (NEW)", async () => {
    const separatedScenario = grunfeld.scenario(
      "separated-test",
      (cliche: any) => ({
        checkUser: async (user: { isPremium: boolean }) => {
          if (user.isPremium) {
            await cliche.premium();
          } else {
            await cliche.normal();
          }
        },
      }),
      {
        premium: () => {
          grunfeld.add(() => "프리미엄 사용자");
        },
        normal: () => {
          grunfeld.add(() => "일반 사용자");
        },
      }
    );

    await (separatedScenario as any).checkUser({ isPremium: true });

    const store = grunfeld.getStore();
    expect(store).toHaveLength(1);
    expect((store[0] as any).element).toBe("프리미엄 사용자");
  });

  it("should differentiate between object and function", () => {
    // 객체 방식
    const objScenario = grunfeld.scenario("obj", {
      test: () => {},
    });

    // 함수 방식
    const funcScenario = grunfeld.scenario("func", () => ({
      test: () => {},
    }));

    expect(objScenario.name).toBe("obj");
    expect((funcScenario as any).name).toBe("func");
  });
});
