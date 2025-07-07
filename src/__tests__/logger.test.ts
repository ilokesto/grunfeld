import { logger } from "../utils/logger";

describe("logger", () => {
  let consoleSpy: {
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
    debug: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
      error: jest.spyOn(console, "error").mockImplementation(() => {}),
      debug: jest.spyOn(console, "debug").mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
    consoleSpy.debug.mockRestore();
    jest.clearAllMocks();
  });

  describe("warn", () => {
    it("should log warning in development environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.warn("Test warning", { test: "data" });

      expect(consoleSpy.warn).toHaveBeenCalledWith("[Grunfeld] Test warning", {
        test: "data",
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log warning in production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      logger.warn("Test warning", { test: "data" });

      expect(consoleSpy.warn).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle missing data parameter", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.warn("Test warning");

      expect(consoleSpy.warn).toHaveBeenCalledWith(
        "[Grunfeld] Test warning",
        ""
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("error", () => {
    it("should log error in all environments", () => {
      const originalEnv = process.env.NODE_ENV;

      // 개발 환경에서 테스트
      process.env.NODE_ENV = "development";
      logger.error("Test error", new Error("test"));
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[Grunfeld] Test error",
        new Error("test")
      );

      consoleSpy.error.mockClear();

      // 프로덕션 환경에서 테스트
      process.env.NODE_ENV = "production";
      logger.error("Test error", new Error("test"));
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[Grunfeld] Test error",
        new Error("test")
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle missing error parameter", () => {
      logger.error("Test error");

      expect(consoleSpy.error).toHaveBeenCalledWith(
        "[Grunfeld] Test error",
        ""
      );
    });

    it("should handle non-Error objects", () => {
      logger.error("Test error", { message: "custom error" });

      expect(consoleSpy.error).toHaveBeenCalledWith("[Grunfeld] Test error", {
        message: "custom error",
      });
    });
  });

  describe("debug", () => {
    it("should log debug in development environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.debug("Test debug", { debug: "info" });

      expect(consoleSpy.debug).toHaveBeenCalledWith("[Grunfeld] Test debug", {
        debug: "info",
      });

      process.env.NODE_ENV = originalEnv;
    });

    it("should not log debug in production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      logger.debug("Test debug", { debug: "info" });

      expect(consoleSpy.debug).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });

    it("should handle missing data parameter", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      logger.debug("Test debug");

      expect(consoleSpy.debug).toHaveBeenCalledWith(
        "[Grunfeld] Test debug",
        ""
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
