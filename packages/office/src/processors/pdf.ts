import { createProcessor } from "@docen/core";
import type { DocenProcessorOptions } from "@docen/core";
import type { Plugin, Processor } from "unified";
import type { OoxmlRoot } from "../ast";
import { pdfToOoxmlAst } from "../plugins/pdf-to-ooxml";

// Define specific options, extending core options if needed
export interface PdfProcessorOptions extends DocenProcessorOptions {
  // Add any PDF-specific options here
}

// Processor focuses on the OoxmlRoot AST
export type PdfProcessor = Processor<OoxmlRoot>;

/**
 * Factory function to create a Docen processor specifically for PDF files,
 * potentially with collaboration enabled via @docen/core.
 */
export function createPdfProcessor(
  options: PdfProcessorOptions = {},
): PdfProcessor {
  const processor = createProcessor({
    ...options,
  }) as unknown as PdfProcessor;

  processor.use(pdfToOoxmlAst as Plugin<[], OoxmlRoot | undefined>);

  console.warn("PDF Compiler/Stringify logic is not implemented.");

  return processor;
}
