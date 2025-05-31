import { createProcessor } from "@docen/core";
import type { DocenProcessorOptions } from "@docen/core";
import type { Processor } from "unified";
import type { OoxmlRoot } from "../ast";

// Define specific options, extending core options if needed
export interface PdfProcessorOptions extends DocenProcessorOptions {
  // Add any PDF-specific options here
}

// Processor focuses on the OoxmlRoot AST
export type PdfProcessor = Processor<OoxmlRoot>;

/**
 * Factory function to create a processor for PDF files.
 * Follows unified.js conventions.
 */
export function createPdfProcessor(
  options: PdfProcessorOptions = {}
): PdfProcessor {
  const processor = createProcessor({
    ...options,
  }) as unknown as PdfProcessor;

  // Note: Parser handled via fromPdf() function for standalone conversion
  // No DOCX output for PDF - use fromPdf() then convert to other formats

  return processor;
}
