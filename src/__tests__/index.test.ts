import {
  grunfeld,
  GrunfeldElementProps,
  GrunfeldProps,
  GrunfeldProvider,
  Position,
} from "../index";

describe("Index exports", () => {
  it("should export grunfeld store", () => {
    expect(grunfeld).toBeDefined();
    expect(typeof grunfeld.add).toBe("function");
    expect(typeof grunfeld.remove).toBe("function");
    expect(typeof grunfeld.clear).toBe("function");
  });

  it("should export GrunfeldProvider component", () => {
    expect(GrunfeldProvider).toBeDefined();
    expect(typeof GrunfeldProvider).toBe("function");
  });

  it("should export types correctly", () => {
    // Test that we can create objects with the exported types
    const elementProps: GrunfeldElementProps = {
      element: "Test",
      position: "center",
      lightDismiss: true,
    };

    const reactNodeProps: GrunfeldProps = "Simple string";
    const position: Position = "top-left";

    expect(elementProps).toBeDefined();
    expect(reactNodeProps).toBeDefined();
    expect(position).toBeDefined();
  });

  it("should have consistent grunfeld API", () => {
    // Test that grunfeld methods work as expected
    expect(() => {
      grunfeld.add(() => "Test dialog");
    }).not.toThrow();

    expect(() => {
      grunfeld.remove();
    }).not.toThrow();

    expect(() => {
      grunfeld.clear();
    }).not.toThrow();
  });
});
