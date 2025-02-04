import type { FormatProcessor } from "./types";

const processors = new Map<string, FormatProcessor>();

/**
 * Register a format processor
 * @param processor Format processor to register
 */
export function registerProcessor(processor: FormatProcessor) {
  for (const format of processor.sourceFormats) {
    processors.set(format, processor);
  }
}

/**
 * Get a processor for the given source and target formats
 * @param sourceFormat Source format
 * @param targetFormat Target format
 * @returns Format processor if available, undefined otherwise
 */
export function getProcessor(
  sourceFormat: string,
  targetFormat: string,
): FormatProcessor | undefined {
  const processor = processors.get(sourceFormat);
  if (!processor) {
    return undefined;
  }

  return processor.targetFormats.includes(targetFormat) ? processor : undefined;
}

/**
 * Get all registered processors
 * @returns Array of registered processors
 */
export function getProcessors(): FormatProcessor[] {
  return Array.from(new Set(processors.values()));
}

/**
 * Get all supported source formats
 * @returns Array of supported source formats
 */
export function getSupportedSourceFormats(): string[] {
  return Array.from(processors.keys());
}

/**
 * Get all supported target formats for a given source format
 * @param sourceFormat Source format
 * @returns Array of supported target formats
 */
export function getSupportedTargetFormats(sourceFormat: string): string[] {
  const processor = processors.get(sourceFormat);
  return processor ? processor.targetFormats : [];
}

/**
 * Clear all registered processors
 */
export function clearProcessors(): void {
  processors.clear();
}
