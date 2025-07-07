import { Position } from "../types";
import { getPositionStyles } from "../utils/getPositionStyles";

describe("getPositionStyles", () => {
  describe("fixed positioning (default)", () => {
    it("should return correct styles for top-left position", () => {
      const styles = getPositionStyles("top-left");
      expect(styles).toEqual({
        position: "fixed",
        top: "0px",
        left: "0px",
      });
    });

    it("should return correct styles for top-center position", () => {
      const styles = getPositionStyles("top-center");
      expect(styles).toEqual({
        position: "fixed",
        top: "0px",
        left: "50%",
        transform: "translateX(-50%)",
      });
    });

    it("should return correct styles for top-right position", () => {
      const styles = getPositionStyles("top-right");
      expect(styles).toEqual({
        position: "fixed",
        top: "0px",
        right: "0px",
      });
    });

    it("should return correct styles for center-left position", () => {
      const styles = getPositionStyles("center-left");
      expect(styles).toEqual({
        position: "fixed",
        top: "50%",
        left: "0px",
        transform: "translateY(-50%)",
      });
    });

    it("should return correct styles for center position", () => {
      const styles = getPositionStyles("center");
      expect(styles).toEqual({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    });

    it("should return correct styles for center-right position", () => {
      const styles = getPositionStyles("center-right");
      expect(styles).toEqual({
        position: "fixed",
        top: "50%",
        right: "0px",
        transform: "translateY(-50%)",
      });
    });

    it("should return correct styles for bottom-left position", () => {
      const styles = getPositionStyles("bottom-left");
      expect(styles).toEqual({
        position: "fixed",
        bottom: "0px",
        left: "0px",
      });
    });

    it("should return correct styles for bottom-center position", () => {
      const styles = getPositionStyles("bottom-center");
      expect(styles).toEqual({
        position: "fixed",
        bottom: "0px",
        left: "50%",
        transform: "translateX(-50%)",
      });
    });

    it("should return correct styles for bottom-right position", () => {
      const styles = getPositionStyles("bottom-right");
      expect(styles).toEqual({
        position: "fixed",
        bottom: "0px",
        right: "0px",
      });
    });

    it("should return center styles for unknown position", () => {
      const styles = getPositionStyles("unknown-position" as Position);
      expect(styles).toEqual({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    });
  });

  describe("absolute positioning", () => {
    it("should return correct styles for top-left position with absolute", () => {
      const styles = getPositionStyles("top-left", true);
      expect(styles).toEqual({
        position: "absolute",
        top: "0px",
        left: "0px",
      });
    });

    it("should return correct styles for top-center position with absolute", () => {
      const styles = getPositionStyles("top-center", true);
      expect(styles).toEqual({
        position: "absolute",
        top: "0px",
        left: "50%",
        transform: "translateX(-50%)",
      });
    });

    it("should return correct styles for top-right position with absolute", () => {
      const styles = getPositionStyles("top-right", true);
      expect(styles).toEqual({
        position: "absolute",
        top: "0px",
        right: "0px",
      });
    });

    it("should return correct styles for center-left position with absolute", () => {
      const styles = getPositionStyles("center-left", true);
      expect(styles).toEqual({
        position: "absolute",
        top: "50%",
        left: "0px",
        transform: "translateY(-50%)",
      });
    });

    it("should return correct styles for center position with absolute", () => {
      const styles = getPositionStyles("center", true);
      expect(styles).toEqual({
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    });

    it("should return correct styles for center-right position with absolute", () => {
      const styles = getPositionStyles("center-right", true);
      expect(styles).toEqual({
        position: "absolute",
        top: "50%",
        right: "0px",
        transform: "translateY(-50%)",
      });
    });

    it("should return correct styles for bottom-left position with absolute", () => {
      const styles = getPositionStyles("bottom-left", true);
      expect(styles).toEqual({
        position: "absolute",
        bottom: "0px",
        left: "0px",
      });
    });

    it("should return correct styles for bottom-center position with absolute", () => {
      const styles = getPositionStyles("bottom-center", true);
      expect(styles).toEqual({
        position: "absolute",
        bottom: "0px",
        left: "50%",
        transform: "translateX(-50%)",
      });
    });

    it("should return correct styles for bottom-right position with absolute", () => {
      const styles = getPositionStyles("bottom-right", true);
      expect(styles).toEqual({
        position: "absolute",
        bottom: "0px",
        right: "0px",
      });
    });

    it("should return center styles for unknown position with absolute", () => {
      const styles = getPositionStyles("unknown-position" as Position, true);
      expect(styles).toEqual({
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    });
  });

  describe("edge cases", () => {
    it("should handle explicitly false useAbsolute parameter", () => {
      const styles = getPositionStyles("center", false);
      expect(styles).toEqual({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    });

    it("should handle undefined useAbsolute parameter", () => {
      const styles = getPositionStyles("center", undefined);
      expect(styles).toEqual({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      });
    });

    it("should handle all position values consistently", () => {
      const positions: Position[] = [
        "top-left",
        "top-center",
        "top-right",
        "center-left",
        "center",
        "center-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ];

      positions.forEach((position) => {
        const fixedStyles = getPositionStyles(position, false);
        const absoluteStyles = getPositionStyles(position, true);

        // Both should have the same properties except for position
        expect(fixedStyles.position).toBe("fixed");
        expect(absoluteStyles.position).toBe("absolute");

        // All other properties should be the same
        const { position: fixedPos, ...fixedRest } = fixedStyles;
        const { position: absolutePos, ...absoluteRest } = absoluteStyles;
        expect(fixedRest).toEqual(absoluteRest);
      });
    });

    it("should always return an object with position property", () => {
      const positions: (Position | string)[] = [
        "top-left",
        "center",
        "bottom-right",
        "invalid-position",
        "",
        undefined as any,
        null as any,
      ];

      positions.forEach((position) => {
        const styles = getPositionStyles(position as Position);
        expect(styles).toHaveProperty("position");
        expect(typeof styles.position).toBe("string");
        expect(
          styles.position === "fixed" || styles.position === "absolute"
        ).toBe(true);
      });
    });

    it("should have consistent CSS property types", () => {
      const styles = getPositionStyles("center");

      // Check that all values are strings (as required by React.CSSProperties)
      Object.values(styles).forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });

  describe("transform property consistency", () => {
    it("should use translateX for horizontal centering only", () => {
      const topCenter = getPositionStyles("top-center");
      const bottomCenter = getPositionStyles("bottom-center");

      expect(topCenter.transform).toBe("translateX(-50%)");
      expect(bottomCenter.transform).toBe("translateX(-50%)");
    });

    it("should use translateY for vertical centering only", () => {
      const centerLeft = getPositionStyles("center-left");
      const centerRight = getPositionStyles("center-right");

      expect(centerLeft.transform).toBe("translateY(-50%)");
      expect(centerRight.transform).toBe("translateY(-50%)");
    });

    it("should use translate for both horizontal and vertical centering", () => {
      const center = getPositionStyles("center");
      const unknownPosition = getPositionStyles("unknown" as Position);

      expect(center.transform).toBe("translate(-50%, -50%)");
      expect(unknownPosition.transform).toBe("translate(-50%, -50%)");
    });

    it("should not have transform property for corner positions", () => {
      const cornerPositions: Position[] = [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ];

      cornerPositions.forEach((position) => {
        const styles = getPositionStyles(position);
        expect(styles.transform).toBeUndefined();
      });
    });
  });
});
