import { generateDialogHash, hashManager } from "../store/GrunfeldHashManager";
import { GrunfeldProps } from "../types";

describe("GrunfeldHashManager", () => {
  beforeEach(() => {
    hashManager.clearAll();
  });

  describe("generateDialogHash", () => {
    it("should generate consistent hash for same dialog", () => {
      const dialog: GrunfeldProps = {
        element: "Test dialog",
        position: "center",
        lightDismiss: true,
      };

      const hash1 = generateDialogHash(dialog);
      const hash2 = generateDialogHash(dialog);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe("string");
      expect(hash1.length).toBeGreaterThan(0);
    });

    it("should generate different hash for different dialogs", () => {
      const dialog1: GrunfeldProps = {
        element: "Dialog 1",
        position: "center",
      };

      const dialog2: GrunfeldProps = {
        element: "Dialog 2",
        position: "bottom",
      };

      const hash1 = generateDialogHash(dialog1);
      const hash2 = generateDialogHash(dialog2);

      expect(hash1).not.toBe(hash2);
    });

    it("should handle React.ReactNode dialogs", () => {
      const dialog1: GrunfeldProps = "Simple string dialog";
      const dialog2: GrunfeldProps = 123;

      const hash1 = generateDialogHash(dialog1);
      const hash2 = generateDialogHash(dialog2);

      expect(typeof hash1).toBe("string");
      expect(typeof hash2).toBe("string");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("hashManager", () => {
    it("should prevent duplicate dialogs", () => {
      const dialog: GrunfeldProps = {
        element: "Test dialog",
        position: "center",
      };

      const result1 = hashManager.tryAddDialog(dialog);
      const result2 = hashManager.tryAddDialog(dialog);

      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });

    it("should allow adding different dialogs", () => {
      const dialog1: GrunfeldProps = {
        element: "Dialog 1",
        position: "center",
      };

      const dialog2: GrunfeldProps = {
        element: "Dialog 2",
        position: "bottom",
      };

      const result1 = hashManager.tryAddDialog(dialog1);
      const result2 = hashManager.tryAddDialog(dialog2);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
    });

    it("should remove dialogs correctly", () => {
      const dialog: GrunfeldProps = {
        element: "Test dialog",
        position: "center",
      };

      hashManager.tryAddDialog(dialog);
      hashManager.removeDialog(dialog);

      // Should be able to add again after removal
      const result = hashManager.tryAddDialog(dialog);
      expect(result).toBe(true);
    });

    it("should clear all dialogs", () => {
      const dialog1: GrunfeldProps = { element: "Dialog 1" };
      const dialog2: GrunfeldProps = { element: "Dialog 2" };

      hashManager.tryAddDialog(dialog1);
      hashManager.tryAddDialog(dialog2);

      expect(hashManager.getHashCount()).toBe(2);

      hashManager.clearAll();

      expect(hashManager.getHashCount()).toBe(0);

      // Should be able to add again after clear
      expect(hashManager.tryAddDialog(dialog1)).toBe(true);
      expect(hashManager.tryAddDialog(dialog2)).toBe(true);
    });
  });
});
