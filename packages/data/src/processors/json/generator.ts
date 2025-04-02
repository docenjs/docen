/**
 * JSON generator for Docen
 *
 * This file implements a generator for JSON files.
 */

import type {
  ConversionResult,
  Document,
  Node,
  Parent,
  ProcessorOptions,
  Table,
  TableRow,
} from "@docen/core";
import { AbstractGenerator, createProcessorError } from "@docen/core";

/**
 * JSON Generator specific options
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
export class JSONGenerator extends AbstractGenerator {
  id = "json-generator";
  name = "JSON Generator";
  supportedInputTypes: string[] = [];
  supportedOutputTypes = ["application/json"];
  supportedInputExtensions: string[] = [];
  supportedOutputExtensions = ["json"];

  /**
   * Generate JSON from a document AST
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
      const prettyPrint = options?.prettyPrint ?? true;
      const indentSize = options?.indentSize ?? 2;
      const handleSpecialValues =
        options?.handleSpecialValues !== undefined
          ? Boolean(options.handleSpecialValues)
          : true;

      // Convert document to JSON
      const jsonData = this.documentToJSON(document);

      // Convert to string with optional pretty printing
      const jsonString = prettyPrint
        ? JSON.stringify(jsonData, null, indentSize)
        : JSON.stringify(jsonData);

      // Convert to UTF-8 encoded Uint8Array
      const encoder = new TextEncoder();
      const content = encoder.encode(jsonString);

      return {
        content,
        mimeType: "application/json",
      };
    } catch (error) {
      throw createProcessorError(
        "Failed to generate JSON content",
        this.id,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Convert a document to JSON data
   *
   * @param document The document to convert
   * @returns JSON data
   */
  private documentToJSON(document: Document): unknown {
    // Find the first table in the document
    const table = this.findFirstTable(document.content);
    if (!table) {
      return {};
    }

    return this.tableToJSON(table);
  }

  /**
   * Find the first table in a document
   *
   * @param root The root node to search in
   * @returns The first table found, or undefined
   */
  private findFirstTable(root: Node): Table | undefined {
    if (root.type === "table") {
      return root as Table;
    }

    if ("children" in root && Array.isArray((root as Parent).children)) {
      for (const child of (root as Parent).children) {
        const table = this.findFirstTable(child);
        if (table) {
          return table;
        }
      }
    }

    return undefined;
  }

  /**
   * Convert a table to JSON data
   *
   * @param table The table to convert
   * @returns JSON data
   */
  private tableToJSON(table: Table): unknown {
    if (!table.children || table.children.length === 0) {
      return {};
    }

    // Check if this is a key-value table
    const firstRow = table.children[0] as TableRow;
    if (firstRow.children.length === 2) {
      return this.keyValueTableToJSON(table);
    }

    // Otherwise treat as array of objects
    return this.arrayTableToJSON(table);
  }

  /**
   * Convert a key-value table to JSON object
   *
   * @param table The table to convert
   * @returns JSON object
   */
  private keyValueTableToJSON(table: Table): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const row of table.children) {
      const keyCell = (row as TableRow).children[0];
      const valueCell = (row as TableRow).children[1];

      const key = this.getCellText(keyCell);
      const value = this.getCellText(valueCell);

      result[key] = this.parseValue(value);
    }

    return result;
  }

  /**
   * Convert an array table to JSON array
   *
   * @param table The table to convert
   * @returns JSON array
   */
  private arrayTableToJSON(table: Table): unknown[] {
    const result: unknown[] = [];

    // Get headers from first row
    const headerRow = table.children[0] as TableRow;
    const headers = headerRow.children.map((cell) => this.getCellText(cell));

    // Convert each row to an object
    for (let i = 1; i < table.children.length; i++) {
      const row = table.children[i] as TableRow;
      const obj: Record<string, unknown> = {};

      for (let j = 0; j < headers.length; j++) {
        const value = this.getCellText(row.children[j]);
        obj[headers[j]] = this.parseValue(value);
      }

      result.push(obj);
    }

    return result;
  }

  /**
   * Get text content from a cell
   *
   * @param cell The cell to get text from
   * @returns Cell text content
   */
  private getCellText(cell: Node): string {
    if (!("children" in cell) || !Array.isArray((cell as Parent).children)) {
      return "";
    }

    return (cell as Parent).children
      .map((child: Node) =>
        "value" in child ? (child as { value: string }).value : ""
      )
      .join("")
      .trim();
  }

  /**
   * Parse a string value into appropriate JSON type
   *
   * @param value The string value to parse
   * @returns Parsed value
   */
  private parseValue(value: string): unknown {
    // Try to parse as number
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num;
    }

    // Try to parse as boolean
    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }

    // Try to parse as null
    if (value.toLowerCase() === "null") {
      return null;
    }

    // Try to parse as JSON
    try {
      return JSON.parse(value);
    } catch {
      // If all else fails, return as string
      return value;
    }
  }
}
