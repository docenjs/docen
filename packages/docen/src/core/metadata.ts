import type { DataType } from "undio";
import type { ConversionOptions, DocumentMetadata } from "../types";
import { getProcessor } from "./registry";

/**
 * Get document metadata
 */
export async function getMetadata(
  source: DataType,
  options?: ConversionOptions,
): Promise<DocumentMetadata> {
  const processor = await getProcessor(source, options?.sourceFormat);
  return processor.getMetadata(source, options);
}
