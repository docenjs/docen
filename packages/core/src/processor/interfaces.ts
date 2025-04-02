/**
 * Processor interfaces for Docen
 *
 * This file defines the core processor interfaces used for parsing and generating
 * content in various formats.
 */

import type { Content, Document, Node } from "../ast";

/**
 * Response type for unsupported nodes in a processor
 */
export enum UnsupportedNodeHandling {
  /** Ignore the node completely */
  IGNORE = "ignore",
  /** Keep the node in the output but don't process its content */
  KEEP_AS_IS = "keep-as-is",
  /** Try to convert the node to something that can be handled */
  CONVERT = "convert",
  /** Replace with a generic representation (e.g., placeholder text) */
  REPLACE = "replace",
  /** Throw an error */
  ERROR = "error",
}

/**
 * Conversion result interface
 */
export interface ConversionResult {
  /** Converted content */
  content: Uint8Array | string;
  /** MIME type of the content */
  mimeType?: string;
  /** File extension of the content */
  extension?: string;
}

/**
 * Source type for parsing
 */
export type Source = Uint8Array | string;

/**
 * Optional processor options
 */
export interface ProcessorOptions {
  [key: string]: unknown;
}

/**
 * Progress information for long-running operations
 */
export interface ProgressInfo {
  /** Current progress (0-100) */
  progress: number;
  /** Total expected processing time in milliseconds (if known) */
  totalTime?: number;
  /** Additional status information */
  status?: string;
  /** Current operation being performed */
  operation?: string;
}

/**
 * Progress callback function
 */
export type ProgressCallback = (info: ProgressInfo) => void;

/**
 * Common options for all processors
 */
export interface CommonProcessorOptions extends ProcessorOptions {
  /** Progress tracking callback */
  onProgress?: ProgressCallback;
  /** Whether to include source position information */
  preservePosition?: boolean;
  /** Whether to keep track of source formatting */
  preserveFormat?: boolean;
  /** Whether to extract and include metadata */
  extractMetadata?: boolean;
  /** Whether to extract embedded images */
  extractImages?: boolean;
  /** Processing mode (sync/async/streaming) */
  mode?: "sync" | "async" | "streaming";
}

/**
 * Base processor interface
 */
export interface Processor {
  /** Unique processor ID */
  id: string;
  /** Human-readable processor name */
  name?: string;
  /** Supported input MIME types */
  supportedInputTypes?: string[];
  /** Supported output MIME types */
  supportedOutputTypes?: string[];
  /** Supported input file extensions */
  supportedInputExtensions?: string[];
  /** Supported output file extensions */
  supportedOutputExtensions?: string[];

  /**
   * Handle an unsupported node
   *
   * This method defines how to handle nodes that the processor doesn't explicitly support.
   * Different processors can implement different fallback strategies.
   *
   * @param node The node that cannot be handled
   * @param context Additional context about the node (e.g., parent, position in the document)
   * @returns The handling strategy to use
   */
  handleUnsupportedNode?(
    node: Node,
    context?: Record<string, unknown>
  ): UnsupportedNodeHandling;
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

  /**
   * Parse a specific node type
   *
   * This optional method allows for parsing specific node types only,
   * which can be useful for components that need to parse subsets of content.
   *
   * @param source The source to parse
   * @param nodeType The specific node type to parse
   * @param options Parsing options
   * @returns The parsed node, or null if the node type is not supported
   */
  parseNodeType?(
    source: Source,
    nodeType: string,
    options?: ProcessorOptions
  ): Promise<Content | null>;

  /**
   * Start incremental parsing for streaming content
   *
   * @param options Parsing options
   * @returns A writable stream that accepts chunks of content and a readable stream that emits nodes
   */
  createIncrementalParser?(options?: ProcessorOptions): {
    input: WritableStream<Source>;
    output: ReadableStream<Content>;
  };
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

  /**
   * Generate output for a specific node type
   *
   * This optional method allows for generating output for specific node types only,
   * which can be useful for incremental generation or partial document rendering.
   *
   * @param node The node to generate from
   * @param options Generation options
   * @returns Generated content for the node, or null if the node type is not supported
   */
  generateFromNode?(
    node: Content,
    options?: ProcessorOptions
  ): Promise<ConversionResult | null>;

  /**
   * Start incremental generation for streaming content
   *
   * @param options Generation options
   * @returns A writable stream that accepts nodes and a readable stream that emits content chunks
   */
  createIncrementalGenerator?(options?: ProcessorOptions): {
    input: WritableStream<Content>;
    output: ReadableStream<Uint8Array | string>;
  };
}
