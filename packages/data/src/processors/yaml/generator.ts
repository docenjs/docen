/**
 * YAML generator for Docen
 *
 * This file implements a generator for YAML files.
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
 * YAML Generator options
 */
export interface YAMLGeneratorOptions extends ProcessorOptions {
  /** Whether to preserve comments (default: false) */
  preserveComments?: boolean;
  /** Whether to handle special values (NaN, Infinity, etc.) (default: true) */
  handleSpecialValues?: boolean;
  /** Indentation spaces (default: 2) */
  indentSize?: number;
}

/**
 * YAML Generator implementation
 */
export class YAMLGenerator implements Generator {
  id = "yaml-generator";
  name = "YAML Generator";
  supportedInputTypes: string[] = [];
  supportedOutputTypes = ["text/yaml", "text/x-yaml"];
  supportedInputExtensions: string[] = [];
  supportedOutputExtensions = ["yaml", "yml"];

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
   * Generate YAML output from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated YAML content
   */
  async generate(
    document: Document,
    options?: YAMLGeneratorOptions,
  ): Promise<ConversionResult> {
    try {
      // Get options with defaults
      const preserveComments =
        options?.preserveComments !== undefined
          ? Boolean(options.preserveComments)
          : false;
      const handleSpecialValues =
        options?.handleSpecialValues !== undefined
          ? Boolean(options.handleSpecialValues)
          : true;
      const indentSize =
        options?.indentSize !== undefined ? Number(options.indentSize) : 2;

      // Generate YAML data from the document AST
      const yamlData = this.generateYAMLData(document, options);

      // Convert to YAML string
      const yamlContent = this.generateYAMLContent(yamlData, {
        preserveComments,
        handleSpecialValues,
        indentSize,
      });

      // Convert to UTF-8 encoded Uint8Array
      const encoder = new TextEncoder();
      const content = encoder.encode(yamlContent);

      return {
        content,
        mimeType: "text/yaml",
        extension: "yaml",
      };
    } catch (error) {
      console.error("Error generating YAML content:", error);
      throw new Error(`Failed to generate YAML: ${error}`);
    }
  }

  /**
   * Generate YAML data from document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns YAML data object or array
   */
  private generateYAMLData(
    document: Document,
    options?: YAMLGeneratorOptions,
  ): unknown {
    // Find table nodes in the document
    if (document.content?.children) {
      for (const node of document.content.children) {
        if (node.type === "table") {
          return this.tableToYAML(node as Table, options);
        }
      }
    }

    // If no table found, return empty object
    return {};
  }

  /**
   * Convert a table node to YAML data
   *
   * @param table The table node to convert
   * @param options Generation options
   * @returns YAML data object or array
   */
  private tableToYAML(table: Table, options?: YAMLGeneratorOptions): unknown {
    if (table.children.length === 0) {
      return {};
    }

    // Check if the table has a header row
    const hasHeader = table.children.length >= 2;
    const firstRow = table.children[0] as TableRow;

    if (hasHeader) {
      // Table with headers - convert to array of objects or key-value object
      return this.headerTableToYAML(table);
    }
    // Table without headers - convert to array of values
    return this.simpleTableToYAML(table);
  }

  /**
   * Convert a table with headers to YAML data
   *
   * @param table The table with headers to convert
   * @returns YAML data (array of objects or key-value object)
   */
  private headerTableToYAML(table: Table): unknown {
    const rows = table.children;
    if (rows.length < 2) {
      return {};
    }

    // First row is treated as header row
    const headerRow = rows[0] as TableRow;
    const headers = headerRow.children.map((cell) =>
      this.getCellTextContent(cell as TableCell),
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
          const value = this.parseYAMLValue(
            this.getCellTextContent(row.children[1] as TableCell),
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
        const value = this.parseYAMLValue(
          this.getCellTextContent(row.children[j] as TableCell),
        );
        obj[header] = value;
      }

      result.push(obj);
    }

    return result;
  }

  /**
   * Convert a simple table (without headers) to YAML data
   *
   * @param table The simple table to convert
   * @returns Array of values
   */
  private simpleTableToYAML(table: Table): unknown[] {
    const result: unknown[] = [];

    // Skip the first row if it's a header-like row (e.g., "Value")
    const startIndex =
      table.children.length > 0 &&
      this.getCellTextContent(
        (table.children[0] as TableRow).children[0] as TableCell,
      ) === "Value"
        ? 1
        : 0;

    for (let i = startIndex; i < table.children.length; i++) {
      const row = table.children[i] as TableRow;
      if (row.children.length > 0) {
        const value = this.parseYAMLValue(
          this.getCellTextContent(row.children[0] as TableCell),
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
   * Parse a string value into a YAML value
   *
   * @param value The string value to parse
   * @returns Parsed YAML value
   */
  private parseYAMLValue(value: string): unknown {
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

  /**
   * Generate YAML content from data
   *
   * @param data The data to convert to YAML
   * @param options Generation options
   * @returns YAML string
   */
  private generateYAMLContent(
    data: unknown,
    options: {
      preserveComments: boolean;
      handleSpecialValues: boolean;
      indentSize: number;
    },
  ): string {
    const { preserveComments, handleSpecialValues, indentSize } = options;
    const lines: string[] = [];

    const generateValue = (value: unknown, indent: number): string => {
      if (value === null) return "null";
      if (value === undefined) return "undefined";

      if (Array.isArray(value)) {
        if (value.length === 0) return "[]";
        return value
          .map(
            (item) =>
              `${" ".repeat(indent)}- ${generateValue(item, indent + indentSize)}`,
          )
          .join("\n");
      }

      if (typeof value === "object") {
        if (!value) return "{}";
        const entries = Object.entries(value);
        if (entries.length === 0) return "{}";
        return entries
          .map(
            ([key, val]) =>
              `${" ".repeat(indent)}${key}: ${generateValue(val, indent + indentSize)}`,
          )
          .join("\n");
      }

      if (typeof value === "string") {
        if (handleSpecialValues) {
          if (value === "NaN") return "NaN";
          if (value === "Infinity") return "Infinity";
          if (value === "-Infinity") return "-Infinity";
        }

        if (value.match(/[:{}\[\],&*#?|\->%@`]/)) {
          return `"${value.replace(/"/g, '\\"')}"`;
        }
        return value;
      }

      return String(value);
    };

    return generateValue(data, 0);
  }
}
