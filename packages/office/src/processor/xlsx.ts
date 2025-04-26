import { createProcessor } from "@docen/core";
import type { DocenProcessorOptions } from "@docen/core"; // Removed YjsAdapterOptions import for now
import { type Plugin, type Processor, unified } from "unified";
import type { VFile } from "vfile";
import type { OoxmlRoot } from "../ast";
import { xlsxToOoxmlAst } from "../plugins/xlsx-to-ooxml";

// Define specific options, extending core options if needed
export interface XlsxProcessorOptions extends DocenProcessorOptions {
  // Add any XLSX-specific options here
}

// Processor focuses on the OoxmlRoot AST
export type XlsxProcessor = Processor<OoxmlRoot>;

/**
 * Factory function to create a Docen processor specifically for XLSX files,
 * potentially with collaboration enabled via @docen/core.
 */
export function createXlsxProcessor(
  options: XlsxProcessorOptions = {},
): XlsxProcessor {
  const processor = createProcessor({
    ...options,
  }) as unknown as XlsxProcessor;

  processor.use(xlsxToOoxmlAst as Plugin<[], OoxmlRoot | undefined>);

  console.warn("XLSX Compiler/Stringify logic is not yet implemented.");

  return processor;
}
