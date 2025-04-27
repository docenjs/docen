/**
 * Error handling utilities for the Docen ecosystem
 *
 * Following best practices from the article on clean error handling:
 * https://medium.com/with-orus/the-5-commandments-of-clean-error-handling-in-typescript-93a9cbdf1af5
 */
import type { Node } from "./types";

/**
 * Base error class for all Docen errors
 */
export class DocenError extends Error {
  public readonly context?: unknown;
  public readonly cause?: Error;

  constructor(
    message: string,
    options: { error?: Error; context?: unknown } = {}
  ) {
    const { error, context } = options;

    super(message);
    this.name = this.constructor.name;
    this.cause = error;
    this.context = context;
  }
}

/**
 * Error thrown when there's an issue with parsing content
 */
export class ParseError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: {
        content?: string;
        position?: {
          line: number;
          column: number;
          offset: number;
        };
      };
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Error thrown when there's an issue with transforming the AST
 */
export class TransformError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: {
        node?: Node;
        path?: (string | number)[];
        pluginName?: string;
      };
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Error thrown when there's an issue with compiling the AST to output
 */
export class CompileError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: {
        node?: Node;
        format?: string;
      };
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Error thrown when there's an issue with collaborative editing
 */
export class CollaborationError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: {
        nodeType?: string;
        path?: (string | number)[];
        localUpdate?: Uint8Array;
        remoteUpdate?: Uint8Array;
      };
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Error thrown when there's a synchronization conflict that can't be resolved
 */
export class SyncConflictError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: {
        localNode?: Node;
        remoteNode?: Node;
        path?: (string | number)[];
        strategy?: string;
      };
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Error thrown when a processor plugin is incorrectly configured or executed
 */
export class PluginError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: {
        pluginName?: string;
        phase?: "parse" | "transform" | "compile";
      };
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Utility to safely handle errors using Result pattern
 */
export type Result<T, E extends DocenError = DocenError> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Ensure that any thrown value is properly converted to a DocenError
 */
export function ensureDocenError(value: unknown): DocenError {
  if (value instanceof DocenError) return value;

  if (value instanceof Error) {
    return new DocenError(value.message, { error: value });
  }

  let stringified = "[Unable to stringify the thrown value]";
  try {
    stringified = JSON.stringify(value);
  } catch {
    // Ignore stringification errors
  }

  return new DocenError(`Unexpected error: ${stringified}`);
}

/**
 * Helper function to wrap code in try/catch and return a Result
 */
export async function tryCatch<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const value = await fn();
    return { success: true, value };
  } catch (error) {
    return {
      success: false,
      error: ensureDocenError(error),
    };
  }
}

/**
 * Synchronous version of tryCatch
 */
export function tryCatchSync<T>(fn: () => T): Result<T> {
  try {
    const value = fn();
    return { success: true, value };
  } catch (error) {
    return {
      success: false,
      error: ensureDocenError(error),
    };
  }
}

/**
 * Add file metadata to a DocenError
 */
export function addFileContext(
  error: DocenError,
  fileContext: {
    path?: string;
    contents?: string;
    position?: { line: number; column: number; offset: number };
  }
): DocenError {
  // Create a combined context with file information
  const combinedContext = error.context
    ? { ...(error.context as object), file: fileContext }
    : { file: fileContext };

  return new (error.constructor as typeof DocenError)(error.message, {
    error: error.cause as Error,
    context: combinedContext,
  });
}

/**
 * Convert unified-style errors to DocenErrors
 */
export function fromUnifiedError(
  error: Error & { name?: string; position?: unknown }
): DocenError {
  if (error.name === "ParseError") {
    return new ParseError(error.message, {
      error,
      context: {
        position: error.position as {
          line: number;
          column: number;
          offset: number;
        },
      },
    });
  }

  if (error.name === "CompileError") {
    return new CompileError(error.message, { error });
  }

  return new DocenError(error.message, { error });
}
