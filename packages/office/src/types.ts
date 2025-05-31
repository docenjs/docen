/**
 * Office document processing types
 * Pure unified.js compatible types for office documents
 */

import type { Node, Parent } from "@docen/core";

// --- Office document AST nodes ---

export interface OfficeRoot extends Parent {
  type: "office-root";
  children: OfficeNode[];
  format: "docx" | "xlsx" | "pptx";
}

export interface OfficeDocument extends Parent {
  type: "office-document";
  children: OfficeNode[];
}

export interface OfficeParagraph extends Parent {
  type: "office-paragraph";
  children: OfficeInlineNode[];
  style?: string;
}

export interface OfficeRun extends Parent {
  type: "office-run";
  children: OfficeInlineNode[];
  formatting?: OfficeFormatting;
}

export interface OfficeText extends Node {
  type: "office-text";
  value: string;
}

export interface OfficeTable extends Parent {
  type: "office-table";
  children: OfficeTableRow[];
  style?: string;
}

export interface OfficeTableRow extends Parent {
  type: "office-table-row";
  children: OfficeTableCell[];
}

export interface OfficeTableCell extends Parent {
  type: "office-table-cell";
  children: OfficeNode[];
  colspan?: number;
  rowspan?: number;
}

export interface OfficeImage extends Node {
  type: "office-image";
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface OfficeList extends Parent {
  type: "office-list";
  children: OfficeListItem[];
  ordered?: boolean;
  level?: number;
}

export interface OfficeListItem extends Parent {
  type: "office-list-item";
  children: OfficeNode[];
  level?: number;
}

// --- Spreadsheet-specific nodes ---

export interface OfficeWorkbook extends Parent {
  type: "office-workbook";
  children: OfficeWorksheet[];
}

export interface OfficeWorksheet extends Parent {
  type: "office-worksheet";
  children: OfficeRow[];
  name: string;
}

export interface OfficeRow extends Parent {
  type: "office-row";
  children: OfficeCell[];
  index: number;
}

export interface OfficeCell extends Node {
  type: "office-cell";
  value: string | number | boolean | Date;
  formula?: string;
  style?: string;
  column: string;
  row: number;
}

// --- Presentation-specific nodes ---

export interface OfficePresentation extends Parent {
  type: "office-presentation";
  children: OfficeSlide[];
}

export interface OfficeSlide extends Parent {
  type: "office-slide";
  children: OfficeNode[];
  layout?: string;
  index: number;
}

// --- Formatting types ---

export interface OfficeFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
}

// --- Content type unions ---

export type OfficeNode =
  | OfficeParagraph
  | OfficeTable
  | OfficeImage
  | OfficeList
  | OfficeWorkbook
  | OfficePresentation;

export type OfficeInlineNode = OfficeText | OfficeRun;

// --- Processor options ---

export interface OfficeProcessorOptions {
  format: "docx" | "xlsx" | "pptx";
  preserveFormatting?: boolean;
  extractImages?: boolean;
  includeMetadata?: boolean;
}

// --- Shared Plugin Options ---

/**
 * Base options interface for all office format plugins
 */
export interface BasePluginOptions {
  /** Whether to include debugging information */
  debug?: boolean;
  /** Custom extraction/processing options */
  customOptions?: Record<string, unknown>;
}

/**
 * Options for parsing office documents
 */
export interface FromOfficeOptions extends BasePluginOptions {
  /** Whether to preserve whitespace in text elements */
  preserveWhitespace?: boolean;
  /** Whether to include raw parser data for debugging */
  includeRawData?: boolean;
  /** Configure which document parts to parse */
  parts?: {
    styles?: boolean;
    numbering?: boolean;
    comments?: boolean;
    footnotes?: boolean;
    endnotes?: boolean;
    headers?: boolean;
    footers?: boolean;
    relationships?: boolean;
    metadata?: boolean;
  };
  /** Custom element handlers for specific elements */
  handlers?: Record<string, (element: unknown, context: unknown) => unknown>;
  /** Extensions to enable */
  extensions?: Array<{
    name: string;
    handler?: (element: unknown, context: unknown) => unknown;
  }>;
}

/**
 * Options for converting to office documents
 */
export interface ToOfficeOptions extends BasePluginOptions {
  /** Document metadata */
  metadata?: {
    creator?: string;
    description?: string;
    title?: string;
    subject?: string;
    lastModifiedBy?: string;
    keywords?: string;
    category?: string;
    comments?: string;
  };
  /** Page layout settings */
  pageSettings?: {
    width?: number;
    height?: number;
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    orientation?: "portrait" | "landscape";
  };
  /** Compression level for output (0-9) */
  compression?: number;
  /** Whether to optimize for file size */
  optimizeSize?: boolean;
}

/**
 * Options specific to DOCX parsing
 */
export interface FromDocxOptions extends FromOfficeOptions {
  // DOCX-specific options can be added here
}

/**
 * Options specific to DOCX generation
 */
export interface ToDocxOptions extends ToOfficeOptions {
  // DOCX-specific options can be added here
}

/**
 * Options specific to PDF parsing
 */
export interface FromPdfOptions extends FromOfficeOptions {
  /** Whether to attempt OCR on images */
  enableOCR?: boolean;
  /** Language for OCR (if enabled) */
  ocrLanguage?: string;
  /** Whether to preserve page structure */
  preservePageStructure?: boolean;
  /** OCR confidence threshold (0-1) */
  ocrConfidenceThreshold?: number;
  /** Whether to detect tables automatically */
  detectTables?: boolean;
  /** Table detection algorithm */
  tableDetectionMethod?: "structure" | "heuristic" | "ml";
}
