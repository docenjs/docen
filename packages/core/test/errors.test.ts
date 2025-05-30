import { describe, expect, it } from "vitest";
import {
  DocenError,
  ParseError,
  PluginError,
  TransformError,
  ValidationError,
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

  it("should create a ParseError with message and nested error", () => {
    const nestedError = new Error("Nested error");
    const error = new ParseError("Parse failed", {
      error: nestedError,
      context: { position: { line: 1, column: 5, offset: 5 } },
    });

    expect(error.message).toBe("Parse failed");
    expect(error.cause).toBe(nestedError);
    expect(error.context).toEqual({
      position: { line: 1, column: 5, offset: 5 },
    });
    expect(error.name).toBe("ParseError");
    expect(error instanceof DocenError).toBe(true);
  });

  it("should create a TransformError with message and context", () => {
    const error = new TransformError("Transform failed", {
      context: { nodeType: "paragraph", operation: "transform" },
    });

    expect(error.message).toBe("Transform failed");
    expect(error.context).toEqual({
      nodeType: "paragraph",
      operation: "transform",
    });
    expect(error.name).toBe("TransformError");
    expect(error instanceof DocenError).toBe(true);
  });

  it("should create a ValidationError with validation context", () => {
    const error = new ValidationError("Validation failed", {
      context: { field: "title", expected: "string", received: "number" },
    });

    expect(error.message).toBe("Validation failed");
    expect(error.context).toEqual({
      field: "title",
      expected: "string",
      received: "number",
    });
    expect(error.name).toBe("ValidationError");
    expect(error instanceof DocenError).toBe(true);
  });

  it("should create a PluginError with plugin context", () => {
    const error = new PluginError("Plugin failed", {
      context: { pluginName: "test-plugin", phase: "execute" },
    });

    expect(error.message).toBe("Plugin failed");
    expect(error.context).toEqual({
      pluginName: "test-plugin",
      phase: "execute",
    });
    expect(error.name).toBe("PluginError");
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
