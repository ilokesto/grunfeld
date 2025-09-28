import {
  convertBackdropStyleToCSS,
  createDialogBackdropManager,
  generateDialogClassName,
  getModalBackdropStyles,
} from "../utils/backdropStyles";

describe("backdropStyles utilities", () => {
  describe("getModalBackdropStyles", () => {
    it("should return base styles when no backdropStyle provided", () => {
      const styles = getModalBackdropStyles();

      expect(styles).toEqual({
        position: "fixed",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      });
    });

    it("should merge backdropStyle with base styles", () => {
      const backdropStyle = {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 2000,
      };

      const styles = getModalBackdropStyles(backdropStyle);

      expect(styles).toEqual({
        position: "fixed",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 2000, // 덮어씌워짐
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      });
    });
  });

  describe("convertBackdropStyleToCSS", () => {
    it("should convert camelCase to kebab-case", () => {
      const style = {
        backgroundColor: "red",
        fontSize: "16px",
        marginTop: "10px",
      };

      const css = convertBackdropStyleToCSS(style);

      expect(css).toBe(
        "background-color: red; font-size: 16px; margin-top: 10px"
      );
    });

    it("should handle single properties", () => {
      const style = { color: "blue" };
      const css = convertBackdropStyleToCSS(style);

      expect(css).toBe("color: blue");
    });

    it("should escape dangerous characters", () => {
      const style = { content: "';{};" };
      const css = convertBackdropStyleToCSS(style);

      expect(css).toBe("content: '");
    });

    it("should handle numeric values", () => {
      const style = { zIndex: 1000, opacity: 0.5 };
      const css = convertBackdropStyleToCSS(style);

      expect(css).toBe("z-index: 1000; opacity: 0.5");
    });
  });

  describe("generateDialogClassName", () => {
    it("should generate unique class names", () => {
      const class1 = generateDialogClassName();
      const class2 = generateDialogClassName();

      expect(class1).not.toBe(class2);
      expect(class1).toMatch(/^grunfeld-dialog-\d+-[a-z0-9]+$/);
      expect(class2).toMatch(/^grunfeld-dialog-\d+-[a-z0-9]+$/);
    });

    it("should have correct prefix", () => {
      const className = generateDialogClassName();
      expect(className).toMatch(/^grunfeld-dialog-/);
    });
  });

  describe("createDialogBackdropManager", () => {
    let mockDialog: HTMLDialogElement;

    beforeEach(() => {
      mockDialog = document.createElement("dialog") as HTMLDialogElement;
      document.head.innerHTML = ""; // 기존 스타일 제거
    });

    afterEach(() => {
      document.head.innerHTML = ""; // 정리
    });

    it("should return cleanup function when no backdropStyle provided", () => {
      const { cleanup } = createDialogBackdropManager(mockDialog);

      expect(typeof cleanup).toBe("function");
      expect(document.head.children.length).toBe(0);
    });

    it("should create style element for backdrop", () => {
      const backdropStyle = { backgroundColor: "rgba(0, 0, 0, 0.5)" };
      const { cleanup } = createDialogBackdropManager(
        mockDialog,
        backdropStyle
      );

      expect(document.head.children.length).toBe(1);

      const styleElement = document.head.children[0] as HTMLStyleElement;
      expect(styleElement.tagName).toBe("STYLE");
      expect(styleElement.textContent).toContain("::backdrop");
      expect(styleElement.textContent).toContain(
        "background-color: rgba(0, 0, 0, 0.5)"
      );

      cleanup();
    });

    it("should add class to dialog element", () => {
      const backdropStyle = { backgroundColor: "red" };
      const { cleanup } = createDialogBackdropManager(
        mockDialog,
        backdropStyle
      );

      expect(mockDialog.classList.length).toBe(1);
      const className = mockDialog.classList[0];
      expect(className).toMatch(/^grunfeld-dialog-/);

      cleanup();
    });

    it("should clean up styles and classes", () => {
      const backdropStyle = { backgroundColor: "blue" };
      const { cleanup } = createDialogBackdropManager(
        mockDialog,
        backdropStyle
      );

      // 스타일과 클래스가 추가되었는지 확인
      expect(document.head.children.length).toBe(1);
      expect(mockDialog.classList.length).toBe(1);

      // 정리 실행
      cleanup();

      // 스타일과 클래스가 제거되었는지 확인
      expect(document.head.children.length).toBe(0);
      expect(mockDialog.classList.length).toBe(0);
    });

    it("should handle webkit prefix", () => {
      const backdropStyle = { backgroundColor: "green" };
      const { cleanup } = createDialogBackdropManager(
        mockDialog,
        backdropStyle
      );

      const styleElement = document.head.children[0] as HTMLStyleElement;
      expect(styleElement.textContent).toContain("::-webkit-backdrop");

      cleanup();
    });
  });
});
