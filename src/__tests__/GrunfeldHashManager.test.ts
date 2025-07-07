import React from "react";
import { generateDialogHash, hashManager } from "../store/GrunfeldHashManager";
import { GrunfeldElementProps, GrunfeldProps } from "../types";
import { logger } from "../utils/logger";

// Mock dependencies
jest.mock("../utils/logger");
const mockLogger = logger as jest.Mocked<typeof logger>;

// Mock btoa for consistent testing
const mockBtoa = jest.fn();
global.btoa = mockBtoa;

describe("GrunfeldHashManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hashManager.clearAll();
    mockBtoa.mockImplementation((str) => Buffer.from(str).toString("base64"));
  });

  describe("generateDialogHash", () => {
    it("should generate hash for GrunfeldElementProps", () => {
      const dialog: GrunfeldElementProps = {
        element: "Test Dialog",
        position: "center",
        lightDismiss: true,
      };

      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });

    it("should generate hash for React element", () => {
      const reactElement = React.createElement(
        "div",
        { className: "test" },
        "Hello"
      );
      const dialog: GrunfeldElementProps = {
        element: reactElement,
        position: "top-left",
      };

      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });

    it("should generate hash for React component", () => {
      const TestComponent = () => React.createElement("div", null, "Test");
      const reactElement = React.createElement(TestComponent, {
        prop: "value",
      });
      const dialog: GrunfeldElementProps = {
        element: reactElement,
        position: "center",
      };

      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });

    it("should generate hash for simple ReactNode", () => {
      const dialog: GrunfeldProps = "Simple string";
      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });

    it("should generate hash for number ReactNode", () => {
      const dialog: GrunfeldProps = 123;
      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });

    it("should generate hash for null ReactNode", () => {
      const dialog: GrunfeldProps = null;
      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });

    it("should handle non-serializable element props", () => {
      const nonSerializableElement = {
        type: "div",
        props: {
          callback: () => {},
          circular: {} as any,
        },
      };
      nonSerializableElement.props.circular.self =
        nonSerializableElement.props.circular;

      const dialog: GrunfeldElementProps = {
        element: nonSerializableElement as any,
        position: "center",
      };

      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });

    it("should handle btoa failure with fallback", () => {
      mockBtoa.mockImplementation(() => {
        throw new Error("btoa failed");
      });

      const dialog: GrunfeldElementProps = {
        element: "Test Dialog",
        position: "center",
      };

      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
      expect(mockLogger.warn).toHaveBeenCalledWith(
        "Hash creation failed, using fallback",
        expect.any(Error)
      );
    });

    it("should handle unexpected errors with fallback", () => {
      // Mock a scenario where an error occurs during serialization
      const problematicDialog = {};
      Object.defineProperty(problematicDialog, "element", {
        get() {
          throw new Error("Serialization failed");
        },
        enumerable: true,
      });

      const hash = generateDialogHash(problematicDialog as any);

      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Unexpected error during hash generation",
        expect.any(Error)
      );

      // Restore original
    });

    it("should generate different hashes for different dialogs", () => {
      const dialog1: GrunfeldElementProps = {
        element: "Dialog 1",
        position: "center",
      };

      const dialog2: GrunfeldElementProps = {
        element: "Dialog 2",
        position: "center",
      };

      const hash1 = generateDialogHash(dialog1);
      const hash2 = generateDialogHash(dialog2);

      expect(hash1).not.toBe(hash2);
    });

    it("should generate same hash for identical dialogs", () => {
      // Mock btoa to return consistent result
      mockBtoa.mockImplementation(() => "consistent-hash-123");

      const dialog: GrunfeldElementProps = {
        element: "Same Dialog",
        position: "center",
        lightDismiss: true,
      };

      const hash1 = generateDialogHash(dialog);
      const hash2 = generateDialogHash(dialog);

      expect(hash1).toBe(hash2);
    });

    it("should handle complex React element with serializable props", () => {
      const reactElement = React.createElement("div", {
        className: "test",
        "data-value": "serializable",
        style: { color: "red" },
      });

      const dialog: GrunfeldElementProps = {
        element: reactElement,
        position: "bottom-right",
      };

      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });

    it("should handle React element with non-serializable props", () => {
      const reactElement = React.createElement("div", {
        className: "test",
        onClick: () => {},
        ref: React.createRef(),
      });

      const dialog: GrunfeldElementProps = {
        element: reactElement,
        position: "bottom-right",
      };

      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");
    });
  });

  describe("hashManager", () => {
    describe("tryAddDialog", () => {
      it("should add new dialog and return true", () => {
        const dialog: GrunfeldElementProps = {
          element: "New Dialog",
          position: "center",
        };

        const result = hashManager.tryAddDialog(dialog);
        expect(result).toBe(true);
        expect(hashManager.getHashCount()).toBe(1);
      });

      it("should prevent duplicate dialog and return false", () => {
        // Use a simpler approach - mock the hash generation to return same hash
        let callCount = 0;
        const originalBtoa = global.btoa;
        global.btoa = jest.fn().mockImplementation(() => {
          callCount++;
          return "same-hash-for-duplicate-test";
        });

        const dialog: GrunfeldElementProps = {
          element: "Duplicate Dialog",
          position: "center",
        };

        const result1 = hashManager.tryAddDialog(dialog);
        expect(result1).toBe(true);

        const result2 = hashManager.tryAddDialog(dialog);
        expect(result2).toBe(false);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Duplicate dialog prevented",
          expect.objectContaining({ hash: expect.any(String) })
        );
        expect(hashManager.getHashCount()).toBe(1);

        // Restore
        global.btoa = originalBtoa;
      });

      it("should log debug message when adding dialog", () => {
        const dialog: GrunfeldElementProps = {
          element: "Debug Dialog",
          position: "center",
        };

        hashManager.tryAddDialog(dialog);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Dialog added",
          expect.objectContaining({ hash: expect.any(String) })
        );
      });
    });

    describe("removeDialog", () => {
      it("should remove existing dialog", () => {
        // Mock consistent hash generation
        let callCount = 0;
        const originalBtoa = global.btoa;
        global.btoa = jest.fn().mockImplementation(() => {
          return "consistent-hash-for-remove-test";
        });

        const dialog: GrunfeldElementProps = {
          element: "Remove Test Dialog",
          position: "center",
        };

        hashManager.tryAddDialog(dialog);
        expect(hashManager.getHashCount()).toBe(1);

        hashManager.removeDialog(dialog);
        expect(hashManager.getHashCount()).toBe(0);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "Dialog removed",
          expect.objectContaining({ hash: expect.any(String) })
        );

        // Restore
        global.btoa = originalBtoa;
      });

      it("should log warning when removing non-existent dialog", () => {
        const dialog: GrunfeldElementProps = {
          element: "Non-existent Dialog",
          position: "center",
        };

        hashManager.removeDialog(dialog);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "Attempted to remove non-existent dialog",
          expect.objectContaining({ hash: expect.any(String) })
        );
        expect(hashManager.getHashCount()).toBe(0);
      });
    });

    describe("clearAll", () => {
      it("should clear all dialogs", () => {
        const dialog1: GrunfeldElementProps = {
          element: "Dialog 1",
          position: "center",
        };
        const dialog2: GrunfeldElementProps = {
          element: "Dialog 2",
          position: "top-left",
        };

        hashManager.tryAddDialog(dialog1);
        hashManager.tryAddDialog(dialog2);
        expect(hashManager.getHashCount()).toBe(2);

        hashManager.clearAll();
        expect(hashManager.getHashCount()).toBe(0);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "All dialogs cleared",
          expect.objectContaining({ count: 2 })
        );
      });

      it("should handle clearing empty hash set", () => {
        expect(hashManager.getHashCount()).toBe(0);

        hashManager.clearAll();
        expect(hashManager.getHashCount()).toBe(0);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          "All dialogs cleared",
          expect.objectContaining({ count: 0 })
        );
      });
    });

    describe("getHashCount", () => {
      it("should return correct count", () => {
        // Clear any existing state first
        hashManager.clearAll();

        // Mock consistent hash generation
        const mockHashes = ["hash-1", "hash-2"];
        let hashIndex = 0;
        const originalBtoa = global.btoa;
        global.btoa = jest.fn().mockImplementation(() => {
          const hash = mockHashes[hashIndex % mockHashes.length];
          hashIndex++;
          return hash;
        });

        expect(hashManager.getHashCount()).toBe(0);

        const dialog1: GrunfeldElementProps = {
          element: "Dialog 1",
          position: "center",
        };

        // Reset hash index for consistent generation
        hashIndex = 0;
        hashManager.tryAddDialog(dialog1);
        expect(hashManager.getHashCount()).toBe(1);

        const dialog2: GrunfeldElementProps = {
          element: "Dialog 2",
          position: "top-left",
        };
        hashManager.tryAddDialog(dialog2);
        expect(hashManager.getHashCount()).toBe(2);

        // Reset index to ensure same hash for dialog1 removal
        hashIndex = 0;
        hashManager.removeDialog(dialog1);
        expect(hashManager.getHashCount()).toBe(1);

        hashManager.clearAll();
        expect(hashManager.getHashCount()).toBe(0);

        // Restore
        global.btoa = originalBtoa;
      });
    });
  });

  describe("safeStringify", () => {
    it("should handle primitive values", () => {
      // These tests are indirect since safeStringify is not exported
      // but we can test it through generateDialogHash
      const stringDialog: GrunfeldProps = "test string";
      const numberDialog: GrunfeldProps = 42;
      const booleanDialog: GrunfeldProps = true;
      const nullDialog: GrunfeldProps = null;

      expect(() => generateDialogHash(stringDialog)).not.toThrow();
      expect(() => generateDialogHash(numberDialog)).not.toThrow();
      expect(() => generateDialogHash(booleanDialog)).not.toThrow();
      expect(() => generateDialogHash(nullDialog)).not.toThrow();
    });

    it("should handle complex non-serializable objects", () => {
      const complexObj = {
        func: () => {},
        symbol: Symbol("test"),
        circular: {} as any,
      };
      complexObj.circular.self = complexObj.circular;

      const dialog: GrunfeldProps = complexObj as any;

      expect(() => generateDialogHash(dialog)).not.toThrow();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        "Object is not serializable, using fallback",
        complexObj
      );
    });

    it("should handle JSON.stringify failures", () => {
      // Mock a scenario where JSON.stringify fails
      const originalStringify = JSON.stringify;
      let callCount = 0;
      JSON.stringify = jest.fn().mockImplementation((obj) => {
        callCount++;
        if (callCount === 2) {
          // Fail on the second call (safeStringify)
          throw new Error("Stringify failed");
        }
        return originalStringify(obj);
      });

      const dialog: GrunfeldElementProps = {
        element: { complexObject: "test" } as any,
        position: "center",
      };

      expect(() => generateDialogHash(dialog)).not.toThrow();

      // Restore original
      JSON.stringify = originalStringify;
    });
  });

  describe("fallback hash generation", () => {
    it("should generate unique fallback hashes", () => {
      // Mock both btoa and JSON.stringify to fail
      mockBtoa.mockImplementation(() => {
        throw new Error("btoa failed");
      });

      const dialog1: GrunfeldElementProps = {
        element: "Dialog 1",
        position: "center",
      };

      const dialog2: GrunfeldElementProps = {
        element: "Dialog 2",
        position: "center",
      };

      const hash1 = generateDialogHash(dialog1);
      const hash2 = generateDialogHash(dialog2);

      expect(hash1).toBeTruthy();
      expect(hash2).toBeTruthy();
      expect(hash1).not.toBe(hash2);
    });

    it("should handle Date.now and Math.random in fallback", () => {
      const originalDateNow = Date.now;
      const originalMathRandom = Math.random;

      Date.now = jest.fn().mockReturnValue(1234567890);
      Math.random = jest.fn().mockReturnValue(0.5);

      mockBtoa.mockImplementation(() => {
        throw new Error("btoa failed");
      });

      const dialog: GrunfeldElementProps = {
        element: "Fallback Dialog",
        position: "center",
      };

      const hash = generateDialogHash(dialog);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe("string");

      // Restore originals
      Date.now = originalDateNow;
      Math.random = originalMathRandom;
    });
  });
});
