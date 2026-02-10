import { debug, error, info, warn } from "@tauri-apps/plugin-log";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorManager } from "../ErrorManager";

// Mock Tauri plugin log
vi.mock("@tauri-apps/plugin-log", () => ({
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("ErrorManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleError", () => {
    it("should log error to Tauri and show toast", async () => {
      const err = new Error("Test error");
      await errorManager.handleError(err, "TestContext");

      expect(error).toHaveBeenCalledWith(
        expect.stringContaining("[TestContext] Test error"),
      );
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong",
        expect.objectContaining({
          description: expect.stringContaining("TestContext"),
        }),
      );
    });

    it("should handle non-Error objects", async () => {
      await errorManager.handleError("String error", "StringContext");

      expect(error).toHaveBeenCalledWith(
        expect.stringContaining("[StringContext] String error"),
      );
    });

    it("should not show toast when notifyUser is false", async () => {
      await errorManager.handleError("Silent error", "Context", false);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should provide friendly messages for database errors", async () => {
      await errorManager.handleError(new Error("no such column: name"), "DB");
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong",
        expect.objectContaining({
          description:
            "Database structure mismatch. Re-trying auto-migration...",
        }),
      );
    });

    it("should provide friendly messages for network errors", async () => {
      await errorManager.handleError(new Error("Failed to fetch"), "Network");
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong",
        expect.objectContaining({
          description: "Network connection issue detected.",
        }),
      );
    });
  });

  describe("Logging methods", () => {
    it("should log warnings", async () => {
      await errorManager.logWarning("Warn msg", "Ctx");
      expect(warn).toHaveBeenCalledWith("[Ctx] Warn msg");
    });

    it("should log info", async () => {
      await errorManager.logInfo("Info msg", "Ctx");
      expect(info).toHaveBeenCalledWith("[Ctx] Info msg");
    });

    it("should log debug", async () => {
      await errorManager.logDebug("Debug msg", "Ctx");
      expect(debug).toHaveBeenCalledWith("[Ctx] Debug msg");
    });
  });
});
