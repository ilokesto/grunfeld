import { grunfeld } from "../index";

describe("API Restriction Tests", () => {
  beforeEach(() => {
    grunfeld.clear();
  });

  it("should throw error for factory function alone (unsupported pattern)", () => {
    expect(() => {
      // 이 패턴은 더 이상 지원되지 않아야 함
      // TypeScript에서는 타입 에러가 발생하지만, 런타임에서도 에러가 발생해야 함
      (grunfeld.scenario as any)("unsupported", (scenario: any) => ({
        step1: () => {
          grunfeld.add(() => "This should not work");
        },
      }));
    }).toThrow("Controller factory function alone is not supported");
  });

  it("should support basic object pattern", () => {
    expect(() => {
      const scenario = grunfeld.scenario("basic", {
        step1: () => {
          grunfeld.add(() => "Basic pattern works");
        },
      });
      expect(scenario.name).toBe("basic");
    }).not.toThrow();
  });

  it("should support separated pattern", () => {
    expect(() => {
      const scenario = grunfeld.scenario(
        "separated",
        (cliche: any) => ({
          step1: async () => {
            await cliche.step1();
          },
        }),
        {
          step1: () => {
            grunfeld.add(() => "Separated pattern works");
          },
        }
      );
      expect(scenario.name).toBe("separated");
    }).not.toThrow();
  });

  it("should throw error for invalid separated scenario arguments", () => {
    expect(() => {
      // 팩토리 함수가 아닌 객체를 두 번째 인자로 전달
      (grunfeld.scenario as any)(
        "invalid",
        { step1: () => {} },
        { impl1: () => {} }
      );
    }).toThrow(
      "Separated scenario requires controller factory function as second argument"
    );

    expect(() => {
      // 구현 객체가 아닌 다른 값을 세 번째 인자로 전달
      (grunfeld.scenario as any)(
        "invalid2",
        (cliche: any) => ({}),
        "not an object"
      );
    }).toThrow(
      "Separated scenario requires implementation object as third argument"
    );
  });
});
