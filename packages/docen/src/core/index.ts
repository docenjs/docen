import type { DataType } from "undio";
import { toArrayBuffer } from "undio";
import { getProcessor } from "../registry";
import type { ConversionOptions } from "../types";
import { detectFileType } from "../utils";

/**
 * Convert a document from one format to another
 * @param source Source document (file path, buffer, or stream)
 * @param target Target file path
 * @param options Conversion options
 */
export async function convert(
  source: DataType,
  target: string,
  options: ConversionOptions = {},
) {
  // Detect source format if not specified
  const sourceFormat =
    options.sourceFormat ?? (await detectFileType(toArrayBuffer(source))).ext;

  // Detect target format from file extension
  const targetFormat =
    options.targetFormat ?? target.split(".").pop()?.toLowerCase();

  if (!sourceFormat || !targetFormat) {
    throw new Error("Could not determine source or target format");
  }

  // Get appropriate processor
  const processor = getProcessor(sourceFormat, targetFormat);
  if (!processor) {
    throw new Error(
      `No processor available for converting ${sourceFormat} to ${targetFormat}`,
    );
  }

  // Perform conversion
  return processor.convert(source, target, options);
}

/**
 * Extract text content from a document
 * @param source Source document
 * @param options Extraction options
 */
export async function extractText(
  source: DataType,
  options: ConversionOptions = {},
) {
  const sourceFormat =
    options.sourceFormat ?? (await detectFileType(toArrayBuffer(source))).ext;

  if (!sourceFormat) {
    throw new Error("Could not determine source format");
  }

  const processor = getProcessor(sourceFormat, "txt");
  if (!processor) {
    throw new Error(`No text extraction available for ${sourceFormat}`);
  }

  return processor.extractText(source, options);
}

/**
 * Get metadata from a document
 * @param source Source document
 * @param options Metadata options
 */
export async function getMetadata(
  source: DataType,
  options: ConversionOptions = {},
) {
  const sourceFormat =
    options.sourceFormat ?? (await detectFileType(toArrayBuffer(source))).ext;

  if (!sourceFormat) {
    throw new Error("Could not determine source format");
  }

  const processor = getProcessor(sourceFormat, sourceFormat);
  if (!processor) {
    throw new Error(`No metadata extraction available for ${sourceFormat}`);
  }

  return processor.getMetadata(source, options);
}
