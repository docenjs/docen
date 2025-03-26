/**
 * JSON generator for Docen
 *
 * This file implements a generator for JSON files.
 */

import type {
  ConversionResult,
  Document,
  Generator,
  ProcessorOptions,
  Table,
  TableCell,
  TableRow,
  Text,
} from "@docen/core";

/**
 * JSON Generator options
 */
export interface JSONGeneratorOptions extends ProcessorOptions {
  /** Pretty print JSON output (default: true) */
  prettyPrint?: boolean;
  /** Indentation spaces for pretty printing (default: 2) */
  indentSize?: number;
  /** Whether to handle special values (NaN, Infinity, etc.) (default: true) */
  handleSpecialValues?: boolean;
}

/**
 * JSON Generator implementation
 */
export class JSONGenerator implements Generator {
  id = "json-generator";
  name = "JSON Generator";
  supportedInputTypes: string[] = [];
  supportedOutputTypes = ["application/json"];
  supportedInputExtensions: string[] = [];
  supportedOutputExtensions = ["json"];

  /**
   * Check if this generator can produce the requested output format
   *
   * @param mimeType Target MIME type
   * @param extension Target file extension
   * @returns True if this generator can produce the requested format
   */
  canGenerate(mimeType?: string, extension?: string): boolean {
    if (mimeType && this.supportedOutputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedOutputExtensions.includes(extension)) {
      return true;
    }

    return false;
  }

  /**
   * Generate JSON output from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated JSON content
   */
  async generate(
    document: Document,
    options?: JSONGeneratorOptions
  ): Promise<ConversionResult> {
    try {
      // Get options with defaults
      const prettyPrint =
        options?.prettyPrint !== undefined
          ? Boolean(options.prettyPrint)
          : true;
      const indentSize =
        options?.indentSize !== undefined ? Number(options.indentSize) : 2;
      const handleSpecialValues =
        options?.handleSpecialValues !== undefined
          ? Boolean(options.handleSpecialValues)
          : true;

      // Generate JSON data from the document AST
      const jsonData = this.generateJSONData(document, options);

      // Convert to formatted JSON string
      const jsonContent = prettyPrint
        ? JSON.stringify(jsonData, null, indentSize)
        : JSON.stringify(jsonData);

      // Convert to UTF-8 encoded Uint8Array
      const encoder = new TextEncoder();
      const content = encoder.encode(jsonContent);

      return {
        content,
        mimeType: "application/json",
        extension: "json",
      };
    } catch (error) {
      console.error("Error generating JSON content:", error);
      throw new Error(`Failed to generate JSON: ${error}`);
    }
  }

  /**
   * Generate JSON data from document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns JSON data object or array
   */
  private generateJSONData(
    document: Document,
    options?: JSONGeneratorOptions
  ): unknown {
    // Find table nodes in the document
    if (document.content?.children) {
      for (const node of document.content.children) {
        if (node.type === "table") {
          return this.tableToJSON(node as Table, options);
        }
      }
    }

    // If no table found, return empty object
    return {};
  }

  /**
   * Convert a table node to JSON data
   *
   * @param table The table node to convert
   * @param options Generation options
   * @returns JSON data object or array
   */
  private tableToJSON(table: Table, options?: JSONGeneratorOptions): unknown {
    if (table.children.length === 0) {
      return {};
    }

    // Check if the table has a header row
    // Instead of relying on isHeader property which is not in the TableCell interface,
    // we'll check if the first row looks like a header based on content patterns
    const hasHeader = table.children.length >= 2;
    const firstRow = table.children[0] as TableRow;

    if (hasHeader) {
      // Table with headers - convert to array of objects or key-value object
      return this.headerTableToJSON(table);
    }
    // Table without headers - convert to array of values
    return this.simpleTableToJSON(table);
  }

  /**
   * Convert a table with headers to JSON data
   *
   * @param table The table with headers to convert
   * @returns JSON data (array of objects or key-value object)
   */
  private headerTableToJSON(table: Table): unknown {
    const rows = table.children;
    if (rows.length < 2) {
      return {};
    }

    // First row is treated as header row
    const headerRow = rows[0] as TableRow;
    const headers = headerRow.children.map((cell) =>
      this.getCellTextContent(cell as TableCell)
    );

    // Check if this is a key-value table (two columns with "Key" and "Value" headers)
    if (
      headers.length === 2 &&
      headers[0] === "Key" &&
      headers[1] === "Value"
    ) {
      // Convert to key-value object
      const result: Record<string, unknown> = {};

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] as TableRow;
        if (row.children.length >= 2) {
          const key = this.getCellTextContent(row.children[0] as TableCell);
          const value = this.parseJSONValue(
            this.getCellTextContent(row.children[1] as TableCell)
          );
          result[key] = value;
        }
      }

      return result;
    }
    // Convert to array of objects
    const result: Record<string, unknown>[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as TableRow;
      const obj: Record<string, unknown> = {};

      for (let j = 0; j < headers.length && j < row.children.length; j++) {
        const header = headers[j];
        const value = this.parseJSONValue(
          this.getCellTextContent(row.children[j] as TableCell)
        );
        obj[header] = value;
      }

      result.push(obj);
    }

    return result;
  }

  /**
   * Convert a simple table (without headers) to JSON data
   *
   * @param table The simple table to convert
   * @returns Array of values
   */
  private simpleTableToJSON(table: Table): unknown[] {
    const result: unknown[] = [];

    // Skip the first row if it's a header-like row (e.g., "Value")
    const startIndex =
      table.children.length > 0 &&
      this.getCellTextContent(
        (table.children[0] as TableRow).children[0] as TableCell
      ) === "Value"
        ? 1
        : 0;

    for (let i = startIndex; i < table.children.length; i++) {
      const row = table.children[i] as TableRow;
      if (row.children.length > 0) {
        const value = this.parseJSONValue(
          this.getCellTextContent(row.children[0] as TableCell)
        );
        result.push(value);
      }
    }

    return result;
  }

  /**
   * Get text content from a table cell
   *
   * @param cell The table cell
   * @returns Text content as string
   */
  private getCellTextContent(cell: TableCell): string {
    let content = "";

    for (const child of cell.children) {
      if (child.type === "text") {
        content += (child as Text).value;
      }
      // Could handle other inline content types here
    }

    return content;
  }

  /**
   * Parse a string value into a JSON value
   *
   * @param value The string value to parse
   * @returns Parsed JSON value
   */
  private parseJSONValue(value: string): unknown {
    // Handle special values
    if (value === "null") {
      return null;
    }
    if (value === "undefined") {
      return undefined;
    }
    if (value === "NaN") {
      return Number.NaN;
    }
    if (value === "Infinity") {
      return Number.POSITIVE_INFINITY;
    }
    if (value === "-Infinity") {
      return Number.NEGATIVE_INFINITY;
    }

    // Try to parse as number
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num;
    }

    // Try to parse as boolean
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }

    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch {
      // If parsing fails, return as string
      return value;
    }
  }
}
