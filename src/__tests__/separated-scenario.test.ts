import { grunfeld } from "../index";

describe("separated scenario API", () => {
  beforeEach(() => {
    grunfeld.clear();
  });

  it("should work with separated recursive scenario", async () => {
    let executedSteps: string[] = [];

    const separatedScenario = grunfeld.scenario(
      "separated-test",
      // 제어 로직 (cliche 사용)
      (cliche: any) => ({
        checkUser: async (user: { isPremium: boolean }) => {
          executedSteps.push("checkUser");
          if (user.isPremium) {
            await cliche.premium();
          } else {
            await cliche.normal();
          }
        },
      }),
      // 실제 구현
      {
        premium: () => {
          executedSteps.push("premium");
          grunfeld.add(() => "프리미엄 사용자");
        },
        normal: () => {
          executedSteps.push("normal");
          grunfeld.add(() => "일반 사용자");
        },
      }
    );

    await (separatedScenario as any).checkUser({ isPremium: true });

    expect(executedSteps).toEqual(["checkUser", "premium"]);

    const store = grunfeld.getStore();
    expect(store).toHaveLength(1);
  });
});
