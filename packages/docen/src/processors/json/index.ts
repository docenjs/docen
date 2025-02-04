import { writeFile } from "node:fs/promises";
import { type DataType, toText } from "undio";
import type {
  ConversionOptions,
  DocumentMetadata,
  FormatProcessor,
  JSONMetadata,
  JSONPOptions,
} from "../../types";

/**
 * JSON processor
 */
export class JSONProcessor implements FormatProcessor {
  sourceFormats = ["json", "jsonp"];
  targetFormats = ["json", "jsonp", "txt"];

  /**
   * Convert JSON to target format
   */
  async convert(
    source: DataType,
    target: string,
    options?: ConversionOptions,
  ): Promise<void> {
    const sourceText = await toText(source);
    const sourceFormat = options?.sourceFormat ?? "json";
    const targetFormat = target.split(".").pop()?.toLowerCase();

    // Parse source
    const data =
      sourceFormat === "jsonp"
        ? this.convertJSONPToJSON(sourceText, options?.jsonp)
        : JSON.parse(sourceText);

    switch (targetFormat) {
      case "json": {
        // Format JSON
        const formatted = JSON.stringify(data, null, options?.indent || 2);
        await writeFile(target, formatted);
        break;
      }
      case "jsonp": {
        // Convert to JSONP
        const callbackName = options?.jsonp?.callbackName || "callback";
        const jsonp = `${callbackName}(${JSON.stringify(data, null, options?.indent || 2)})`;
        await writeFile(target, jsonp);
        break;
      }
      case "txt": {
        // Convert to text
        const text = await this.extractText(source, options);
        await writeFile(target, text);
        break;
      }
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }

  /**
   * Extract text from JSON/JSONP
   */
  async extractText(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<string> {
    const sourceText = await toText(source);
    const sourceFormat = options?.sourceFormat ?? "json";

    // Parse source
    const data =
      sourceFormat === "jsonp"
        ? this.convertJSONPToJSON(sourceText, options?.jsonp)
        : JSON.parse(sourceText);

    // Convert to readable text format
    return this.jsonToText(data);
  }

  /**
   * Get JSON/JSONP metadata
   */
  async getMetadata(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<DocumentMetadata> {
    const sourceText = await toText(source);
    const sourceFormat = options?.sourceFormat ?? "json";

    // Parse source
    const data =
      sourceFormat === "jsonp"
        ? this.convertJSONPToJSON(sourceText, options?.jsonp)
        : JSON.parse(sourceText);

    const metadata: JSONMetadata = {
      type: Array.isArray(data) ? "array" : typeof data,
      itemCount: Array.isArray(data) ? data.length : Object.keys(data).length,
      format: sourceFormat,
    };

    return {
      fileSize: sourceText.length,
      createdAt: new Date(),
      modifiedAt: new Date(),
      json: metadata,
    };
  }

  /**
   * Convert JSONP to JSON
   */
  private convertJSONPToJSON(source: string, options?: JSONPOptions): unknown {
    const multiple = options?.multiple ?? false;

    const regGroup = source.match(/(?<functionName>.+)\(.*\)/);
    const functionName = regGroup?.groups?.functionName;

    if (!functionName) {
      throw new Error("Function name not found");
    }

    const parser = new Function(functionName, source);
    let result: unknown[] = [];

    parser((...values: unknown[]) => {
      result = values;
    });

    return multiple ? result : result[0];
  }

  /**
   * Convert JSON data to readable text format
   */
  private jsonToText(data: unknown, level = 0): string {
    const indent = "  ".repeat(level);

    if (Array.isArray(data)) {
      return data
        .map(
          (item, index) =>
            `${indent}${index + 1}. ${this.jsonToText(item, level + 1)}`,
        )
        .join("");
    }

    if (data && typeof data === "object") {
      return Object.entries(data)
        .map(
          ([key, value]) =>
            `${indent}${key}: ${this.jsonToText(value, level + 1)}`,
        )
        .join("");
    }

    return `${data}\n`;
  }
}
