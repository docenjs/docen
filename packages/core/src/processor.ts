/**
 * Processor interface definitions for Docen
 *
 * This file defines the interfaces for document processors that handle
 * parsing from source formats to AST and generating output from AST.
 */

import type { Document, Root } from "./ast";

/**
 * Input source types that can be processed
 */
export type Source =
  | ArrayBuffer
  | Uint8Array
  | string
  | Blob
  | ReadableStream<Uint8Array>;

/**
 * Options for processors
 */
export interface ProcessorOptions {
  /** Preserve formatting when possible */
  preserveFormatting?: boolean;
  /** Extract images when possible */
  extractImages?: boolean;
  /** Extract metadata when possible */
  extractMetadata?: boolean;
  /** Format-specific options */
  [key: string]: unknown;
}

/**
 * Result of a conversion operation
 */
export interface ConversionResult {
  /** The converted content */
  content: string | ArrayBuffer | Uint8Array;
  /** MIME type of the result */
  mimeType: string;
  /** File extension for the result */
  extension: string;
}

/**
 * Base processor interface
 */
export interface Processor {
  /** Unique identifier for the processor */
  id: string;
  /** Human-readable name */
  name: string;
  /** Supported input MIME types */
  supportedInputTypes: string[];
  /** Supported output MIME types */
  supportedOutputTypes: string[];
  /** Supported input file extensions */
  supportedInputExtensions: string[];
  /** Supported output file extensions */
  supportedOutputExtensions: string[];
}

/**
 * Parser interface for converting from source format to AST
 */
export interface Parser extends Processor {
  /**
   * Parse source data into a document AST
   *
   * @param source The source data to parse
   * @param options Parsing options
   * @returns Parsed document
   */
  parse(source: Source, options?: ProcessorOptions): Promise<Document>;

  /**
   * Check if this parser can handle the given source
   *
   * @param source The source to check
   * @param mimeType Optional MIME type hint
   * @param extension Optional file extension hint
   * @returns True if this parser can handle the source
   */
  canParse(
    source: Source,
    mimeType?: string,
    extension?: string
  ): Promise<boolean>;
}

/**
 * Generator interface for converting from AST to output format
 */
export interface Generator extends Processor {
  /**
   * Generate output in the target format from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated content
   */
  generate(
    document: Document,
    options?: ProcessorOptions
  ): Promise<ConversionResult>;

  /**
   * Check if this generator can produce the requested output format
   *
   * @param mimeType Target MIME type
   * @param extension Target file extension
   * @returns True if this generator can produce the requested format
   */
  canGenerate(mimeType?: string, extension?: string): boolean;
}

/**
 * Combined processor that can both parse and generate
 */
export interface FullProcessor extends Parser, Generator {
  /**
   * Convert directly from one format to another without exposing the AST
   *
   * @param source Source data
   * @param targetFormat Target format (MIME type or extension)
   * @param options Conversion options
   * @returns Converted content
   */
  convert(
    source: Source,
    targetFormat: string,
    options?: ProcessorOptions
  ): Promise<ConversionResult>;
}
