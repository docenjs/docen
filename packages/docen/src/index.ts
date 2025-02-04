// Core functionality
export { convert, extractText, getMetadata } from "./core";

// Registry
export {
  registerProcessor,
  getProcessor,
  getProcessors,
  getSupportedSourceFormats,
  getSupportedTargetFormats,
  clearProcessors,
} from "./registry";

// Types
export type {
  ConversionOptions,
  DocumentMetadata,
  FormatProcessor,
  CSVOptions,
  JSONPOptions,
  XLSXOptions,
  ImageMetadata,
  SpreadsheetMetadata,
  JSONMetadata,
} from "./types";

// Processors
export { PDFProcessor } from "./processors/pdf";
export { DOCXProcessor } from "./processors/docx";
export { XLSXProcessor } from "./processors/xlsx";
export { CSVProcessor } from "./processors/csv";
export { ImageProcessor } from "./processors/image";
export { JSONProcessor } from "./processors/json";
