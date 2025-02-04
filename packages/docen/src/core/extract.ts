import type { DataType } from "undio";
import type { ConversionOptions } from "../types";
import { getProcessor } from "./registry";

/**
 * Extract text from document
 */
export async function extractText(
  source: DataType,
  options?: ConversionOptions,
): Promise<string> {
  const processor = await getProcessor(source, options?.sourceFormat);
  return processor.extractText(source, options);
}
