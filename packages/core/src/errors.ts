/**
 * Error handling utilities for the Docen ecosystem
 *
 * Following best practices from the article on clean error handling:
 * https://medium.com/with-orus/the-5-commandments-of-clean-error-handling-in-typescript-93a9cbdf1af5
 */
import type {
  FileErrorContext,
  ParseErrorContext,
  PluginErrorContext,
  Result,
  TransformErrorContext,
  ValidationErrorContext,
} from "./types";

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
      context?: ParseErrorContext;
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Error thrown when there's an issue with transforming content
 */
export class TransformError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: TransformErrorContext;
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Error thrown when there's an issue with validation
 */
export class ValidationError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: ValidationErrorContext;
    } = {}
  ) {
    super(message, options);
  }
}

/**
 * Error thrown when there's an issue with plugin loading or execution
 */
export class PluginError extends DocenError {
  constructor(
    message: string,
    options: {
      error?: Error;
      context?: PluginErrorContext;
    } = {}
  ) {
    super(message, options);
  }
}

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
export async function tryCatch<T>(
  fn: () => Promise<T>
): Promise<Result<T, DocenError>> {
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
export function tryCatchSync<T>(fn: () => T): Result<T, DocenError> {
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
  fileContext: FileErrorContext
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
 * Convert an unknown error to a DocenError
 */
export function fromUnknownError(
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

  if (error.name === "TransformError") {
    return new TransformError(error.message, { error });
  }

  if (error.name === "ValidationError") {
    return new ValidationError(error.message, { error });
  }

  if (error.name === "PluginError") {
    return new PluginError(error.message, { error });
  }

  return new DocenError(error.message, { error });
}
