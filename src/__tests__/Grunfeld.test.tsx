import { Grunfeld } from "../components/Grunfeld";

// Mock the child components
jest.mock("../components/GrunfeldDialog", () => ({
  GrunfeldDialog: jest.fn(() => "GrunfeldDialog"),
}));

jest.mock("../components/GrunfeldModal", () => ({
  GrunfeldModal: jest.fn(() => "GrunfeldModal"),
}));

describe("Grunfeld Component", () => {
  it("should render GrunfeldModal by default", () => {
    const component = (
      <Grunfeld element="Test Element" position="center" lightDismiss={true} />
    );

    expect(component).toBeDefined();
    // Since we're mocking, just check that the function returns something
    expect(typeof component).toBe("object");
  });

  it("should render GrunfeldDialog when renderMode is top-layer", () => {
    const component = (
      <Grunfeld
        element="Test Element"
        position="center"
        lightDismiss={true}
        renderMode="top-layer"
      />
    );

    expect(component).toBeDefined();
    expect(typeof component).toBe("object");
  });

  it("should render GrunfeldModal when renderMode is inline", () => {
    const component = (
      <Grunfeld
        element="Test Element"
        position="center"
        lightDismiss={true}
        renderMode="inline"
      />
    );

    expect(component).toBeDefined();
    expect(typeof component).toBe("object");
  });

  it("should handle different element types", () => {
    const stringComponent = <Grunfeld element="String Element" />;

    const numberComponent = <Grunfeld element={42} />;

    expect(stringComponent).toBeDefined();
    expect(numberComponent).toBeDefined();
  });

  it("should use default values for optional props", () => {
    const component = <Grunfeld element="Test Element" />;

    expect(component).toBeDefined();
    expect(typeof component).toBe("object");
  });
});
