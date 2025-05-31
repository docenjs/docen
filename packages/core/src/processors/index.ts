/**
 * Core processor interface extending unified.js
 * Pure unified.js functionality
 */
import { unified } from "unified";
import type { DocenProcessor, DocenProcessorOptions } from "../types";

/**
 * Factory function to create a Docen processor
 */
export function createProcessor(
  options: DocenProcessorOptions = {}
): DocenProcessor {
  // Create the base unified processor
  const processor = unified();

  // Apply plugins if provided
  if (options.plugins) {
    for (const plugin of options.plugins) {
      if (Array.isArray(plugin)) {
        // Plugin with options: [plugin, options]
        processor.use(plugin[0], plugin[1]);
      } else {
        // Plugin without options
        processor.use(plugin);
      }
    }
  }

  // Return the processor as DocenProcessor
  // Since DocenProcessor extends UnifiedProcessor without additional methods,
  // we can directly cast it
  return processor as DocenProcessor;
}
