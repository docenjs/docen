import { describe, expect, it } from "vitest";
import {
  CollaborationError,
  DocenError,
  SyncConflictError,
  ensureDocenError,
  tryCatch,
  tryCatchSync,
} from "../src/errors";

describe("Error Handling", () => {
  it("should create a DocenError with message and context", () => {
    const error = new DocenError("Test error message", {
      context: { testKey: "test-value" },
    });

    expect(error.message).toBe("Test error message");
    expect(error.context).toEqual({ testKey: "test-value" });
    expect(error.name).toBe("DocenError");
    expect(error instanceof Error).toBe(true);
  });

  it("should create a CollaborationError with message and nested error", () => {
    const nestedError = new Error("Nested error");
    const error = new CollaborationError("Collaboration failed", {
      error: nestedError,
      context: { nodeType: "paragraph" },
    });

    expect(error.message).toBe("Collaboration failed");
    expect(error.cause).toBe(nestedError);
    expect(error.context).toEqual({ nodeType: "paragraph" });
    expect(error.name).toBe("CollaborationError");
    expect(error instanceof DocenError).toBe(true);
  });

  it("should create a SyncConflictError with conflict details", () => {
    const error = new SyncConflictError("Sync conflict detected", {
      context: {
        path: ["root", "child"],
        strategy: "timestamp",
      },
    });

    expect(error.message).toBe("Sync conflict detected");
    expect(error.context).toEqual({
      path: ["root", "child"],
      strategy: "timestamp",
    });
    expect(error.name).toBe("SyncConflictError");
    expect(error instanceof DocenError).toBe(true);
  });

  it("should convert regular errors to DocenError using ensureDocenError", () => {
    const regularError = new Error("Regular error");
    const convertedError = ensureDocenError(regularError);

    expect(convertedError instanceof DocenError).toBe(true);
    expect(convertedError.message).toBe("Regular error");
    expect(convertedError.cause).toBe(regularError);
  });

  it("should pass through DocenError instances in ensureDocenError", () => {
    const originalError = new DocenError("Original error");
    const convertedError = ensureDocenError(originalError);

    expect(convertedError).toBe(originalError);
  });

  it("should handle non-error objects in ensureDocenError", () => {
    const nonError = { message: "Not an error" };
    const convertedError = ensureDocenError(nonError);

    expect(convertedError instanceof DocenError).toBe(true);
    expect(convertedError.message).toContain("Unexpected error");
  });

  it("should catch errors and return Result with error", async () => {
    const result = await tryCatch(async () => {
      throw new Error("Test error");
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error instanceof DocenError).toBe(true);
      expect(result.error.message).toBe("Test error");
    }
  });

  it("should return successful Result with value", async () => {
    const result = await tryCatch(async () => "success");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("success");
    }
  });

  it("should handle synchronous functions with tryCatchSync", () => {
    const result = tryCatchSync(() => "sync success");

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe("sync success");
    }
  });
});
