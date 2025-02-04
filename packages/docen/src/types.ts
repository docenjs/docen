import type { DataType } from "undio";

/**
 * Base conversion options
 */
export interface BaseConversionOptions {
  /** Source format override */
  sourceFormat?: string;
  /** Target format override */
  targetFormat?: string;
  /** Enable OCR for image-based documents */
  ocr?: boolean;
  /** Language for OCR */
  language?: string;
  /** Preserve original formatting */
  preserveFormatting?: boolean;
  /** Indentation for formatted output */
  indent?: number;
}

/**
 * CSV specific options
 */
export interface CSVOptions {
  /** Use first row as header */
  header?: boolean | string | string[];
  /** Field delimiter */
  delimiter?: string;
  /** Marker for repeated column names */
  repeatMarker?: string;
  /** Quote character */
  quotechar?: string;
  /** Line ending character(s) */
  newline?: string;
}

/**
 * JSONP specific options
 */
export interface JSONPOptions {
  /** JSONP callback function name */
  callbackName?: string;
  /** Return multiple values */
  multiple?: boolean;
}

/**
 * XLSX specific options
 */
export interface XLSXOptions {
  /** Sheet name(s) to process */
  sheets?: string[];
  /** Include formulas */
  includeFormulas?: boolean;
}

/**
 * Combined conversion options
 */
export type ConversionOptions = BaseConversionOptions &
  Partial<{
    csv: CSVOptions;
    jsonp: JSONPOptions;
    xlsx: XLSXOptions;
    pages?: number[];
    options?: Record<string, string | number | boolean | null>;
  }>;

/**
 * Base document metadata
 */
export interface BaseDocumentMetadata {
  /** Document title */
  title?: string;
  /** Document author */
  author?: string;
  /** Creation date */
  createdAt?: Date;
  /** Last modified date */
  modifiedAt?: Date;
  /** Page count */
  pageCount?: number;
  /** Word count */
  wordCount?: number;
  /** File size in bytes */
  fileSize?: number;
}

/**
 * Image specific metadata
 */
export interface ImageMetadata {
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Image format */
  format?: string;
}

/**
 * Spreadsheet specific metadata
 */
export interface SpreadsheetMetadata {
  /** Sheet count */
  sheetCount?: number;
  /** Row count */
  rowCount?: number;
  /** Column count */
  columnCount?: number;
}

/**
 * JSON specific metadata
 */
export interface JSONMetadata {
  /** Data type (array, object, etc.) */
  type?: string;
  /** Number of items (array length or object keys) */
  itemCount?: number;
  /** Format (json/jsonp) */
  format?: string;
}

/**
 * Combined document metadata
 */
export type DocumentMetadata = BaseDocumentMetadata &
  Partial<{
    image: ImageMetadata;
    spreadsheet: SpreadsheetMetadata;
    json: JSONMetadata;
  }>;

/**
 * Format processor interface
 */
export interface FormatProcessor {
  /** Source format(s) supported by this processor */
  sourceFormats: string[];
  /** Target format(s) supported by this processor */
  targetFormats: string[];

  /**
   * Convert document from source to target format
   */
  convert(
    source: DataType,
    target: string,
    options?: ConversionOptions,
  ): Promise<void>;

  /**
   * Extract text content from document
   */
  extractText(source: DataType, options?: ConversionOptions): Promise<string>;

  /**
   * Get document metadata
   */
  getMetadata(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<DocumentMetadata>;
}
