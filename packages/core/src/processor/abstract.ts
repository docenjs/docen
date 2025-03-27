/**
 * Abstract processor implementations for Docen
 *
 * This file provides abstract base classes for processors that implement
 * common functionality and default behaviors.
 */

import type { Content, Document, Node, Parent } from "../ast";
import type {
  CommonProcessorOptions,
  ConversionResult,
  Generator,
  Parser,
  ProcessorOptions,
  ProgressCallback,
  Source,
} from "./interfaces";
import { UnsupportedNodeHandling } from "./interfaces";

/**
 * Type for cached values in processor
 */
export type CacheValue =
  | string
  | Document
  | Node
  | Content
  | ConversionResult
  | null
  | boolean;

/**
 * Error interface extending standard Error with cause property
 */
export interface ProcessorError extends Error {
  /** The original error that caused this error */
  cause?: Error;
  /** Processor ID that generated the error */
  processorId?: string;
  /** The node being processed when the error occurred */
  node?: Node;
  /** Additional context information */
  context?: Record<string, unknown>;
}

/**
 * Create a processor error with additional context
 *
 * @param message Error message
 * @param processorId Processor ID
 * @param node Node that caused the error (optional)
 * @param cause Original error that caused this error (optional)
 * @param context Additional context information (optional)
 * @returns Formatted error
 */
export function createProcessorError(
  message: string,
  processorId: string,
  node?: Node,
  cause?: Error,
  context?: Record<string, unknown>,
): ProcessorError {
  const error = new Error(
    `Processor error [${processorId}]: ${message}${node ? ` (node type: ${node.type})` : ""}`,
  ) as ProcessorError;

  error.processorId = processorId;
  error.node = node;
  error.cause = cause;
  error.context = context;

  return error;
}

/**
 * Abstract base class for parsers
 */
export abstract class AbstractParser implements Parser {
  /** Unique parser ID */
  abstract id: string;
  /** Human-readable parser name */
  abstract name: string;
  /** Supported input MIME types */
  abstract supportedInputTypes: string[];
  /** Supported output MIME types */
  abstract supportedOutputTypes: string[];
  /** Supported input file extensions */
  abstract supportedInputExtensions: string[];
  /** Supported output file extensions */
  abstract supportedOutputExtensions: string[];

  /** Processing cache for performance optimization */
  protected cache = new Map<string, CacheValue>();

  /** Default progress callback that does nothing */
  protected defaultProgressCallback: ProgressCallback = () => {};

  /**
   * Parse source data into a document AST
   *
   * @param source The source data to parse
   * @param options Parsing options
   * @returns Parsed document
   */
  abstract parse(source: Source, options?: ProcessorOptions): Promise<Document>;

  /**
   * Check if this parser can handle the given source
   *
   * @param source The source to check
   * @param mimeType Optional MIME type hint
   * @param extension Optional file extension hint
   * @returns True if this parser can handle the source
   */
  async canParse(
    source: Source,
    mimeType?: string,
    extension?: string,
  ): Promise<boolean> {
    // Check MIME type if provided
    if (mimeType && this.supportedInputTypes.includes(mimeType)) {
      return true;
    }

    // Check extension if provided
    if (extension && this.supportedInputExtensions.includes(extension)) {
      return true;
    }

    // Default implementation: try to detect based on content
    return this.detectFormat(source);
  }

  /**
   * Handle an unsupported node
   *
   * @param node The node that cannot be handled
   * @param context Additional context about the node
   * @returns The handling strategy to use
   */
  handleUnsupportedNode(
    node: Node,
    context?: Record<string, unknown>,
  ): UnsupportedNodeHandling {
    // Default implementation: try to convert unsupported nodes
    return UnsupportedNodeHandling.CONVERT;
  }

  /**
   * Parse a specific node type
   *
   * Default implementation that parses the full document and then finds nodes of the requested type
   *
   * @param source The source to parse
   * @param nodeType The specific node type to parse
   * @param options Parsing options
   * @returns The parsed node, or null if the node type is not supported
   */
  async parseNodeType(
    source: Source,
    nodeType: string,
    options?: ProcessorOptions,
  ): Promise<Content | null> {
    // Default implementation: parse the whole document and extract the requested node type
    const document = await this.parse(source, options);

    // Find the first node of the requested type using a depth-first search
    const findNodeByType = (node: Node): Content | null => {
      if (node.type === nodeType) {
        return node as Content;
      }

      // Check if node is a parent node with children
      if ("children" in node && Array.isArray((node as Parent).children)) {
        for (const child of (node as Parent).children) {
          const found = findNodeByType(child);
          if (found) {
            return found;
          }
        }
      }

      return null;
    };

    return findNodeByType(document.content);
  }

  /**
   * Clear the parser's cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Try to detect if the source is in a format supported by this parser
   *
   * @param source The source to check
   * @returns True if the source appears to be in a supported format
   */
  protected abstract detectFormat(source: Source): Promise<boolean>;

  /**
   * Get the progress callback from options or use the default
   *
   * @param options Processing options
   * @returns Progress callback function
   */
  protected getProgressCallback(
    options?: CommonProcessorOptions,
  ): ProgressCallback {
    return options?.onProgress || this.defaultProgressCallback;
  }

  /**
   * Report processing progress
   *
   * @param progress Progress percentage (0-100)
   * @param callback Progress callback
   * @param status Optional status message
   * @param operation Optional operation description
   */
  protected reportProgress(
    progress: number,
    callback: ProgressCallback,
    status?: string,
    operation?: string,
  ): void {
    callback({
      progress,
      status,
      operation,
    });
  }
}

/**
 * Abstract base class for generators
 */
export abstract class AbstractGenerator implements Generator {
  /** Unique generator ID */
  abstract id: string;
  /** Human-readable generator name */
  abstract name: string;
  /** Supported input MIME types */
  abstract supportedInputTypes: string[];
  /** Supported output MIME types */
  abstract supportedOutputTypes: string[];
  /** Supported input file extensions */
  abstract supportedInputExtensions: string[];
  /** Supported output file extensions */
  abstract supportedOutputExtensions: string[];

  /** Processing cache for performance optimization */
  protected cache = new Map<string, CacheValue>();

  /** Default progress callback that does nothing */
  protected defaultProgressCallback: ProgressCallback = () => {};

  /**
   * Generate output in the target format from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated content
   */
  abstract generate(
    document: Document,
    options?: ProcessorOptions,
  ): Promise<ConversionResult>;

  /**
   * Check if this generator can produce the requested output format
   *
   * @param mimeType Target MIME type
   * @param extension Target file extension
   * @returns True if this generator can produce the requested format
   */
  canGenerate(mimeType?: string, extension?: string): boolean {
    if (mimeType && this.supportedOutputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedOutputExtensions.includes(extension)) {
      return true;
    }

    return false;
  }

  /**
   * Handle an unsupported node
   *
   * @param node The node that cannot be handled
   * @param context Additional context about the node
   * @returns The handling strategy to use
   */
  handleUnsupportedNode(
    node: Node,
    context?: Record<string, unknown>,
  ): UnsupportedNodeHandling {
    // Default implementation: keep unsupported nodes as is
    return UnsupportedNodeHandling.KEEP_AS_IS;
  }

  /**
   * Generate output for a specific node
   *
   * @param node The node to generate output for
   * @param options Generation options
   * @returns Generated content for the node
   */
  async generateFromNode(
    node: Content,
    options?: ProcessorOptions,
  ): Promise<ConversionResult | null> {
    // Create a minimal document containing just this node
    const document: Document = {
      metadata: {},
      content: {
        type: "root",
        children: [node],
      },
    };

    // Generate content from the minimal document
    return this.generate(document, options);
  }

  /**
   * Clear the generator's cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Convert a specific node to a format that can be handled
   *
   * @param node The node to convert
   * @param targetType The desired node type
   * @param context Additional context
   * @returns The converted node, or null if conversion is not possible
   */
  protected convertNode(
    node: Node,
    targetType: string,
    context?: Record<string, unknown>,
  ): Node | null {
    // Default implementation: conversion not supported
    return null;
  }

  /**
   * Get the progress callback from options or use the default
   *
   * @param options Processing options
   * @returns Progress callback function
   */
  protected getProgressCallback(
    options?: CommonProcessorOptions,
  ): ProgressCallback {
    return options?.onProgress || this.defaultProgressCallback;
  }

  /**
   * Report processing progress
   *
   * @param progress Progress percentage (0-100)
   * @param callback Progress callback
   * @param status Optional status message
   * @param operation Optional operation description
   */
  protected reportProgress(
    progress: number,
    callback: ProgressCallback,
    status?: string,
    operation?: string,
  ): void {
    callback({
      progress,
      status,
      operation,
    });
  }
}
