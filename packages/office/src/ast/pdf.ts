// packages/office/src/ast/pdf.ts
import type { OoxmlData, OoxmlElement } from "./shared";

/**
 * Stores original information extracted from the PDF source for a specific node.
 */
export interface PdfSourceInfo {
  ref?: string; // e.g., image reference
  transform?: number[]; // PDF transform matrix
  width: number;
  height: number;
  fontName?: string;
}

/**
 * Interface for data nodes that carry PDF-specific source information.
 */
export interface PdfSpecificData {
  pdf?: PdfSourceInfo;
}

/**
 * Specific data interface for text runs originating from PDF.
 */
export interface PdfTextRunData extends OoxmlData, PdfSpecificData {}

/**
 * Specific data interface for drawing elements (image placeholders) originating from PDF.
 */
export interface PdfDrawingData extends OoxmlData, PdfSpecificData {
  // relationId is generated, not directly from PDF source info
  relationId?: string;
}

/**
 * Represents a text run element originating from PDF parsing.
 */
export interface PdfTextRunElement extends OoxmlElement {
  data?: PdfTextRunData;
}

/**
 * Represents a drawing element (image placeholder) originating from PDF parsing.
 */
export interface PdfDrawingElement extends OoxmlElement {
  data?: PdfDrawingData;
}
