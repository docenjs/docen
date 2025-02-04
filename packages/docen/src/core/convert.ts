import type { DataType } from "undio";
import type { ConversionOptions } from "../types";
import { getProcessor } from "./registry";

/**
 * Convert document from source format to target format
 */
export async function convert(
  source: DataType,
  targetFormat: string,
  options?: ConversionOptions,
): Promise<DataType> {
  const processor = await getProcessor(source, options?.sourceFormat);
  return processor.convert(source, targetFormat, options);
}
