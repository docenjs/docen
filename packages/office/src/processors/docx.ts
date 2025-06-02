import { createProcessor } from "@docen/core";
import type { DocenProcessorOptions } from "@docen/core";
import type { Processor } from "unified";
import type { OoxmlRoot } from "../ast";

// Define specific options, extending core options if needed
export interface DocxProcessorOptions extends DocenProcessorOptions {
  // Add any DOCX-specific options here
}

// Processor focuses on the OoxmlRoot AST
export type DocxProcessor = Processor<OoxmlRoot>;

/**
 * Factory function to create a processor for DOCX files.
 * Follows unified.js conventions.
 */
export function createDocxProcessor(
  options: DocxProcessorOptions = {},
): DocxProcessor {
  // Use the core processor factory - pure unified.js
  const processor = createProcessor({
    ...options,
  }) as unknown as DocxProcessor;

  // Note: Parser and compiler are set up via plugins
  // Following unified.js pattern where plugins handle parsing/compiling
  // Use fromDocx() and toDocx() functions directly for standalone conversion

  return processor;
}
