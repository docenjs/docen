import { createProcessor } from "@docen/core";
import type { DocenProcessorOptions, YjsAdapterOptions } from "@docen/core";
import { type Plugin, type Processor, unified } from "unified";
import type { VFile } from "vfile";
import type { OoxmlRoot } from "../ast";
import { docxToOoxmlAst } from "../plugins/docx-to-ooxml";

// Define specific options, extending core options if needed
export interface DocxProcessorOptions extends DocenProcessorOptions {
  // Add any DOCX-specific options here
}

// Processor focuses on the OoxmlRoot AST
// Use the DocenProcessor type from core
export type DocxProcessor = Processor<OoxmlRoot>;

/**
 * Factory function to create a Docen processor specifically for DOCX files,
 * potentially with collaboration enabled via @docen/core.
 */
export function createDocxProcessor(
  options: DocxProcessorOptions = {}
): DocxProcessor {
  // Use the core processor factory
  const processor = createProcessor({
    ...options, // Pass core options like collaborative, ydoc, etc.
  }) as unknown as DocxProcessor; // Cast needed due to specific AST type

  // Use the async plugin responsible for parsing and AST transformation
  processor.use(docxToOoxmlAst as Plugin<[], OoxmlRoot | undefined>);

  // Stringification handled separately or via core mechanisms if applicable
  console.warn(
    "DOCX Compiler/Stringify logic is not yet implemented within createDocxProcessor."
  );

  return processor;
}
