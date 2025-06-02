/**
 * Office package types for unified.js processing
 * Core types for OOXML processing and DOCX generation
 */

import type { Node, Parent } from "@docen/core";
import type { DocxTemplateConfig } from "./templates/types";

// --- Base Plugin Types ---

/**
 * Base plugin options extending unified.js patterns
 */
export interface BasePluginOptions {
  /** Enable debug output */
  debug?: boolean;
  /** Additional processor options */
  processorOptions?: Record<string, unknown>;
}

/**
 * Common office document parsing options
 */
export interface FromOfficeOptions extends BasePluginOptions {
  /** Whether to preserve formatting */
  preserveFormatting?: boolean;
  /** Whether to extract images */
  extractImages?: boolean;
  /** Custom parsing options */
  parseOptions?: Record<string, unknown>;
}

/**
 * Common office document processing options
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
 * Options for generating DOCX documents with template support
 */
export interface ToDocxOptions extends ToOfficeOptions {
  /** DOCX template configuration using c12 */
  template?: {
    /** Template preset name (for c12 config resolution) */
    preset?: string;
    /** Template configuration object */
    config?: DocxTemplateConfig;
    /** Debug template processing */
    debug?: boolean;
  };
  /** External styles XML content */
  externalStyles?: string;
}

/**
 * Options for generating XLSX documents
 */
export interface ToXlsxOptions extends ToOfficeOptions {
  /** Worksheet configuration */
  worksheets?: {
    name?: string;
    data?: unknown[][];
    headers?: string[];
  }[];
}

/**
 * Options for generating PPTX documents
 */
export interface ToPptxOptions extends ToOfficeOptions {
  /** Slide layout configuration */
  slideLayouts?: {
    master?: string;
    layouts?: string[];
  };
}

/**
 * Options for parsing DOCX documents
 */
export interface FromDocxOptions extends FromOfficeOptions {
  /** DOCX-specific parsing options */
  docxOptions?: {
    /** Whether to parse comments */
    parseComments?: boolean;
    /** Whether to parse tracked changes */
    parseRevisions?: boolean;
  };
  /** Custom handlers for processing elements */
  handlers?: Record<string, (...args: unknown[]) => unknown>;
  /** Whether to include raw XML data in the output */
  includeRawData?: boolean;
}

/**
 * Options for parsing PDF documents
 */
export interface FromPdfOptions extends FromOfficeOptions {
  /** PDF-specific parsing options */
  pdfOptions?: {
    /** OCR settings for scanned PDFs */
    ocrSettings?: Record<string, unknown>;
    /** Page range to parse */
    pageRange?: { start?: number; end?: number };
  };
}

/**
 * Options for converting to PDF documents
 */
export interface ToPdfOptions extends ToOfficeOptions {
  /** Page width in points */
  pageWidth?: number;
  /** Page height in points */
  pageHeight?: number;
  /** Page margins */
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  /** Default font size */
  defaultFontSize?: number;
  /** Line height multiplier */
  lineHeight?: number;
  /** Custom options for specific use cases */
  customOptions?: Record<string, unknown>;
  /** Font configuration */
  fonts?: {
    /** Whether to embed custom fonts */
    embedCustomFonts?: boolean;
    /** Whether to subset fonts */
    subset?: boolean;
    /** Font fallback mappings */
    fallbacks?: Record<string, string>;
  };
}

/**
 * Options for converting to MDAST
 */
export interface ToMdastOptions extends BasePluginOptions {
  /** Whether to allow HTML elements in output */
  allowHtml?: boolean;
  /** Whether to preserve element attributes when converting to HTML */
  preserveAttributes?: boolean;
  /** Function to resolve image paths from relation IDs */
  resolveImagePath?: (relationId: string) => string;
  /** Markdown conversion options */
  markdownOptions?: {
    /** Whether to preserve HTML */
    preserveHtml?: boolean;
    /** Whether to use GFM syntax */
    gfm?: boolean;
  };
}

// --- AST Node Types ---

/**
 * Base OOXAST node
 */
export interface OoxastNode extends Node {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  attributes?: Record<string, string | number | boolean>;
}

/**
 * OOXAST parent node
 */
export interface OoxastParent extends Parent {
  children: OoxastNode[];
}

/**
 * OOXAST element node
 */
export interface OoxastElement extends OoxastNode {
  tagName: string;
  properties: Record<string, unknown>;
  children?: OoxastNode[];
}

/**
 * OOXAST text node
 */
export interface OoxastText extends OoxastNode {
  type: "text";
  value: string;
}

/**
 * OOXAST document node
 */
export interface OoxastDocument extends OoxastParent {
  type: "document";
  children: OoxastElement[];
}

// --- Document Structure Types ---

/**
 * Document section configuration
 */
export interface DocumentSection {
  pageSize?: {
    width: number;
    height: number;
    orientation?: "portrait" | "landscape";
  };
  pageMargins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    header?: number;
    footer?: number;
  };
  columns?: {
    count: number;
    space?: number;
    separator?: boolean;
  };
}

/**
 * Document header/footer configuration
 */
export interface HeaderFooterConfig {
  type: "header" | "footer";
  pageType: "default" | "first" | "even";
  content: OoxastElement[];
}

// --- Processing Pipeline Types ---

/**
 * Plugin processing context
 */
export interface ProcessingContext {
  /** Current document being processed */
  document: OoxastDocument;
  /** Plugin options */
  options: BasePluginOptions;
  /** Processing metadata */
  metadata: Record<string, unknown>;
}

/**
 * Plugin processor function
 */
export type PluginProcessor<T = BasePluginOptions> = (
  context: ProcessingContext,
  options: T,
) => Promise<OoxastDocument> | OoxastDocument;

/**
 * Plugin definition
 */
export interface PluginDefinition<T = BasePluginOptions> {
  name: string;
  processor: PluginProcessor<T>;
  defaultOptions?: Partial<T>;
}

// --- Validation and Error Types ---

/**
 * Document validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  code: string;
  message: string;
  line?: number;
  column?: number;
  path?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  code: string;
  message: string;
  line?: number;
  column?: number;
  path?: string;
}

// --- Export Types ---

export type { DocxTemplateConfig } from "./templates/types";
