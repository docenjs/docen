// packages/office/src/ast/pdf.ts
// Defines PDF-specific types and interfaces for parsing PDF documents
// Based on PDF.js parsing capabilities and compatibility with WordprocessingML
// These types represent PDF content converted to WordprocessingML format

import type { OoxmlData, OoxmlElement } from "./shared";

// --- PDF Specific OOXML Types (String Literals) ---
// These define PDF-specific semantic types that can be converted to WordprocessingML

// PDF document structure types (converted to WML equivalents)
export type PdfDocumentType = "pdfDocument"; // Entire PDF document (maps to WML document)
export type PdfPageType = "pdfPage"; // PDF page (maps to WML section)
export type PdfPageBreakType = "pdfPageBreak"; // Page break between PDF pages

// PDF text content types (converted to WML text structures)
export type PdfTextBlockType = "pdfTextBlock"; // Block of text (maps to WML paragraph)
export type PdfTextLineType = "pdfTextLine"; // Line of text within block
export type PdfTextRunType = "pdfTextRun"; // Continuous text with same formatting (maps to WML run)
export type PdfGlyphType = "pdfGlyph"; // Individual character/glyph

// PDF graphics and image types (converted to WML/DML elements)
export type PdfImageType = "pdfImage"; // Embedded or referenced image (maps to WML drawing)
export type PdfVectorGraphicType = "pdfVectorGraphic"; // Vector graphics (maps to VML/DML)
export type PdfPathType = "pdfPath"; // Vector path element
export type PdfAnnotationType = "pdfAnnotation"; // PDF annotation (maps to WML comment)

// PDF form and interactive types
export type PdfFormFieldType = "pdfFormField"; // Form field (maps to WML structured document tag)
export type PdfLinkType = "pdfLink"; // Hyperlink (maps to WML hyperlink)
export type PdfBookmarkType = "pdfBookmark"; // PDF bookmark (maps to WML bookmark)

// PDF table structure types (converted to WML table elements)
export type PdfTableType = "pdfTable"; // Detected table structure (maps to WML table)
export type PdfTableRowType = "pdfTableRow"; // Table row (maps to WML table row)
export type PdfTableCellType = "pdfTableCell"; // Table cell (maps to WML table cell)

// PDF metadata and properties types
export type PdfMetadataType = "pdfMetadata"; // PDF document metadata
export type PdfLayerType = "pdfLayer"; // PDF layer/optional content group

// Union of all PDF semantic types
export type PdfOoxmlType =
  // Document structure
  | PdfDocumentType
  | PdfPageType
  | PdfPageBreakType
  // Text content
  | PdfTextBlockType
  | PdfTextLineType
  | PdfTextRunType
  | PdfGlyphType
  // Graphics and images
  | PdfImageType
  | PdfVectorGraphicType
  | PdfPathType
  | PdfAnnotationType
  // Interactive elements
  | PdfFormFieldType
  | PdfLinkType
  | PdfBookmarkType
  // Table structures
  | PdfTableType
  | PdfTableRowType
  | PdfTableCellType
  // Metadata and properties
  | PdfMetadataType
  | PdfLayerType;

// --- PDF Source Information Interfaces ---

/**
 * Stores original coordinate and transformation information from PDF
 */
export interface PdfCoordinateInfo {
  x: number; // X coordinate in PDF user space
  y: number; // Y coordinate in PDF user space
  width: number; // Width in PDF user space
  height: number; // Height in PDF user space
  transform?: number[]; // PDF transformation matrix [a, b, c, d, e, f]
  pageIndex: number; // 0-based page index
  pageWidth: number; // PDF page width
  pageHeight: number; // PDF page height
}

/**
 * Font information extracted from PDF
 */
export interface PdfFontInfo {
  name: string; // Font name from PDF
  size: number; // Font size in points
  family?: string; // Font family
  style?: "normal" | "italic" | "oblique"; // Font style
  weight?: "normal" | "bold" | number; // Font weight
  color?: string; // Text color in RGB hex
  isEmbedded?: boolean; // Whether font is embedded in PDF
  encoding?: string; // Font encoding
  ascent?: number; // Font ascent
  descent?: number; // Font descent
}

/**
 * Image information extracted from PDF
 */
export interface PdfImageInfo {
  objectId: string; // PDF object identifier
  width: number; // Image width in pixels
  height: number; // Image height in pixels
  bitsPerComponent?: number; // Bits per color component
  colorSpace?: string; // Color space (DeviceRGB, DeviceGray, etc.)
  filter?: string; // Compression filter (DCTDecode, FlateDecode, etc.)
  data?: ArrayBuffer; // Raw image data
  mimeType?: string; // MIME type of extracted image
}

/**
 * Vector graphics information from PDF
 */
export interface PdfVectorInfo {
  paths: PdfPathInfo[]; // Vector paths
  fillColor?: string; // Fill color
  strokeColor?: string; // Stroke color
  strokeWidth?: number; // Stroke width
  opacity?: number; // Opacity (0-1)
}

/**
 * Path information for vector graphics
 */
export interface PdfPathInfo {
  commands: PdfPathCommand[]; // Path commands
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * PDF path command (moveTo, lineTo, curveTo, etc.)
 */
export interface PdfPathCommand {
  type: "M" | "L" | "C" | "S" | "Q" | "T" | "A" | "Z"; // SVG-style path commands
  points: number[]; // Command coordinates
}

/**
 * PDF annotation information
 */
export interface PdfAnnotationInfo {
  type: string; // Annotation type (Text, Link, Highlight, etc.)
  content?: string; // Annotation content/text
  author?: string; // Annotation author
  creationDate?: Date; // Creation date
  modificationDate?: Date; // Modification date
  rect: [number, number, number, number]; // Annotation rectangle
  dest?: string; // Link destination
  uri?: string; // URI for link annotations
}

/**
 * PDF form field information
 */
export interface PdfFormFieldInfo {
  type: "text" | "checkbox" | "radio" | "select" | "button"; // Field type
  name: string; // Field name
  value?: string | boolean; // Field value
  options?: string[]; // Options for select fields
  required?: boolean; // Whether field is required
  readOnly?: boolean; // Whether field is read-only
  maxLength?: number; // Maximum length for text fields
}

/**
 * Comprehensive PDF source information
 */
export interface PdfSourceInfo {
  coordinates: PdfCoordinateInfo;
  font?: PdfFontInfo; // For text elements
  image?: PdfImageInfo; // For image elements
  vector?: PdfVectorInfo; // For vector graphics
  annotation?: PdfAnnotationInfo; // For annotations
  formField?: PdfFormFieldInfo; // For form fields
  layer?: string; // PDF layer/OCG name
  structureType?: string; // PDF structure element type
  alternativeText?: string; // Alternative text from PDF structure
  actualText?: string; // Actual text from PDF structure
  language?: string; // Language from PDF structure
}

/**
 * PDF document metadata
 */
export interface PdfDocumentMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string; // Creating application
  producer?: string; // PDF producer
  creationDate?: Date;
  modificationDate?: Date;
  version?: string; // PDF version
  encrypted?: boolean; // Whether PDF was encrypted
  pageCount: number; // Total number of pages
  pageLayout?:
    | "SinglePage"
    | "OneColumn"
    | "TwoColumnLeft"
    | "TwoColumnRight"
    | "TwoPageLeft"
    | "TwoPageRight";
  pageMode?:
    | "UseNone"
    | "UseOutlines"
    | "UseThumbs"
    | "FullScreen"
    | "UseOC"
    | "UseAttachments";
}

/**
 * PDF page-specific information
 */
export interface PdfPageInfo {
  pageIndex: number; // 0-based page index
  mediaBox: [number, number, number, number]; // Media box [x, y, width, height]
  cropBox?: [number, number, number, number]; // Crop box
  rotation?: 0 | 90 | 180 | 270; // Page rotation
  userUnit?: number; // User unit scale factor
  resources?: {
    fonts?: Record<string, PdfFontInfo>;
    images?: Record<string, PdfImageInfo>;
    colorSpaces?: Record<string, string>;
  };
}

// --- Extended Data Interfaces ---

/**
 * Interface for data nodes that carry PDF-specific source information
 */
export interface PdfSpecificData {
  pdf?: PdfSourceInfo;
}

/**
 * Specific data interface for PDF document root
 */
export interface PdfDocumentData extends OoxmlData, PdfSpecificData {
  metadata?: PdfDocumentMetadata;
}

/**
 * Specific data interface for PDF pages
 */
export interface PdfPageData extends OoxmlData, PdfSpecificData {
  pageInfo?: PdfPageInfo;
}

/**
 * Specific data interface for text runs originating from PDF
 */
export interface PdfTextRunData extends OoxmlData, PdfSpecificData {
  originalText?: string; // Original text before any processing
  confidence?: number; // OCR confidence if applicable
}

/**
 * Specific data interface for drawing elements (image placeholders) originating from PDF
 */
export interface PdfDrawingData extends OoxmlData, PdfSpecificData {
  relationId?: string; // Generated relationship ID for OOXML
  originalFormat?: string; // Original image format in PDF
  extractedData?: ArrayBuffer; // Extracted image data
}

/**
 * Specific data interface for table structures detected in PDF
 */
export interface PdfTableData extends OoxmlData, PdfSpecificData {
  detectionMethod?: "structure" | "heuristic" | "manual"; // How table was detected
  confidence?: number; // Detection confidence (0-1)
  originalBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Specific data interface for PDF annotations converted to comments
 */
export interface PdfAnnotationData extends OoxmlData, PdfSpecificData {
  annotationType?: string; // Original PDF annotation type
  preserved?: boolean; // Whether annotation was preserved as comment
}

// --- Element Interfaces ---

/**
 * Represents a PDF document element
 */
export interface PdfDocumentElement extends OoxmlElement {
  data?: PdfDocumentData;
}

/**
 * Represents a PDF page element
 */
export interface PdfPageElement extends OoxmlElement {
  data?: PdfPageData;
}

/**
 * Represents a text run element originating from PDF parsing
 */
export interface PdfTextRunElement extends OoxmlElement {
  data?: PdfTextRunData;
}

/**
 * Represents a drawing element (image placeholder) originating from PDF parsing
 */
export interface PdfDrawingElement extends OoxmlElement {
  data?: PdfDrawingData;
}

/**
 * Represents a table element detected in PDF
 */
export interface PdfTableElement extends OoxmlElement {
  data?: PdfTableData;
}

/**
 * Represents an annotation element from PDF converted to comment
 */
export interface PdfAnnotationElement extends OoxmlElement {
  data?: PdfAnnotationData;
}
