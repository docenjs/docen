/**
 * JSON parser for Docen
 *
 * This file implements a parser for JSON files.
 */

import type {
  Document,
  ProcessorOptions,
  Root,
  Source,
  Table,
  TableRow,
} from "@docen/core";
import { AbstractParser, createProcessorError } from "@docen/core";
import { toUint8Array } from "@docen/core";

/**
 * JSON Parser specific options
 */
export interface JSONParserOptions extends ProcessorOptions {
  /** Pretty print JSON output (default: true) */
  prettyPrint?: boolean;
  /** Indentation spaces for pretty printing (default: 2) */
  indentSize?: number;
  /** Convert primitive values to appropriate types (default: true) */
  convertTypes?: boolean;
}

/**
 * JSON Parser implementation
 */
export class JSONParser extends AbstractParser {
  id = "json-parser";
  name = "JSON Parser";
  supportedInputTypes = ["application/json"];
  supportedOutputTypes: string[] = [];
  supportedInputExtensions = ["json"];
  supportedOutputExtensions: string[] = [];

  /**
   * Parse JSON data into a document AST
   *
   * @param source The source data to parse
   * @param options Parsing options
   * @returns Parsed document
   */
  async parse(source: Source, options?: JSONParserOptions): Promise<Document> {
    try {
      // Convert source to string
      const data = toUint8Array(source);
      const text = new TextDecoder().decode(data);

      // Create empty document structure
      const document: Document = {
        metadata: {},
        content: {
          type: "root",
          children: [],
        },
      };

      // Parse JSON content
      const content = await this.parseJSON(text, options);
      document.content = content;

      return document;
    } catch (error) {
      throw createProcessorError(
        "Failed to parse JSON content",
        this.id,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Try to detect if the source is in JSON format
   *
   * @param source The source to check
   * @returns True if the source appears to be JSON
   */
  protected async detectFormat(source: Source): Promise<boolean> {
    try {
      // Convert source to string for basic format detection
      const data = toUint8Array(source);
      const text = new TextDecoder().decode(data.slice(0, 1000));

      // Check if the content looks like JSON
      const trimmed = text.trim();
      if (
        (trimmed.startsWith("{") && trimmed.includes("}")) ||
        (trimmed.startsWith("[") && trimmed.includes("]"))
      ) {
        // Try to parse a small sample to confirm it's valid JSON
        JSON.parse(
          trimmed.length > 100 ? `${trimmed.substring(0, 100)}...` : trimmed
        );
        return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  /**
   * Parse JSON content into AST
   *
   * @param text The JSON text content
   * @param options Parsing options
   * @returns Root node of the AST
   */
  private async parseJSON(
    text: string,
    options?: JSONParserOptions
  ): Promise<Root> {
    const root: Root = {
      type: "root",
      children: [],
    };

    try {
      // Parse JSON
      const jsonData = JSON.parse(text);

      // Get options with defaults
      const convertTypes =
        options?.convertTypes !== undefined
          ? Boolean(options.convertTypes)
          : true;

      // Convert JSON to table structure
      const table = this.jsonToTable(jsonData, options);
      if (table) {
        root.children.push(table);
      }
    } catch (error) {
      throw createProcessorError(
        "Failed to parse JSON content",
        this.id,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }

    return root;
  }

  /**
   * Convert JSON data to a table structure
   *
   * @param data The JSON data to convert
   * @param options Parsing options
   * @returns Table node or undefined if conversion is not possible
   */
  private jsonToTable(
    data: unknown,
    options?: JSONParserOptions
  ): Table | undefined {
    // Create table node
    const table: Table = {
      type: "table",
      children: [],
    };

    // Handle different JSON structures
    if (Array.isArray(data)) {
      if (data.length === 0) {
        // Empty array, return empty table
        return table;
      }

      if (typeof data[0] === "object" && data[0] !== null) {
        // Array of objects - convert to table with headers
        return this.objectArrayToTable(data, options);
      }
      // Array of primitives - convert to simple table
      return this.primitiveArrayToTable(data, options);
    }
    if (typeof data === "object" && data !== null) {
      // Object - convert to key-value table
      return this.objectToTable(data as Record<string, unknown>, options);
    }

    // If we can't convert to table, add as text
    const row: TableRow = {
      type: "tableRow",
      children: [
        {
          type: "tableCell",
          children: [
            {
              type: "text",
              value: JSON.stringify(data),
            },
          ],
        },
      ],
    };
    table.children.push(row);

    return table;
  }

  /**
   * Convert an array of objects to a table with headers
   *
   * @param data Array of objects
   * @returns Table node
   */
  private objectArrayToTable(
    data: Record<string, unknown>[],
    options?: JSONParserOptions
  ): Table {
    const table: Table = {
      type: "table",
      children: [],
    };

    // Get all unique keys from all objects
    const keys = new Set<string>();
    for (const item of data) {
      for (const key of Object.keys(item)) {
        keys.add(key);
      }
    }
    const headers = Array.from(keys);

    // Create header row
    const headerRow: TableRow = {
      type: "tableRow",
      children: headers.map((header) => ({
        type: "tableCell",
        children: [
          {
            type: "text",
            value: header,
          },
        ],
        isHeader: true,
      })),
    };
    table.children.push(headerRow);

    // Get convertTypes option with default
    const convertTypes =
      options?.convertTypes !== undefined
        ? Boolean(options.convertTypes)
        : true;

    // Create data rows
    for (const item of data) {
      const row: TableRow = {
        type: "tableRow",
        children: headers.map((header) => ({
          type: "tableCell",
          children: [
            {
              type: "text",
              value: this.formatValue(item[header], convertTypes),
            },
          ],
        })),
      };
      table.children.push(row);
    }

    return table;
  }

  /**
   * Convert an array of primitives to a simple table
   *
   * @param data Array of primitive values
   * @returns Table node
   */
  private primitiveArrayToTable(
    data: (string | number | boolean | null)[],
    options?: JSONParserOptions
  ): Table {
    const table: Table = {
      type: "table",
      children: [],
    };

    // Create header row
    const headerRow: TableRow = {
      type: "tableRow",
      children: [
        {
          type: "tableCell",
          children: [
            {
              type: "text",
              value: "Value",
            },
          ],
        },
      ],
    };
    table.children.push(headerRow);

    // Get convertTypes option with default
    const convertTypes =
      options?.convertTypes !== undefined
        ? Boolean(options.convertTypes)
        : true;

    // Create data rows
    for (const item of data) {
      const row: TableRow = {
        type: "tableRow",
        children: [
          {
            type: "tableCell",
            children: [
              {
                type: "text",
                value: this.formatValue(item, convertTypes),
              },
            ],
          },
        ],
      };
      table.children.push(row);
    }

    return table;
  }

  /**
   * Convert an object to a key-value table
   *
   * @param data Object to convert
   * @returns Table node
   */
  private objectToTable(
    data: Record<string, unknown>,
    options?: JSONParserOptions
  ): Table {
    const table: Table = {
      type: "table",
      children: [],
    };

    // Create header row
    const headerRow: TableRow = {
      type: "tableRow",
      children: [
        {
          type: "tableCell",
          children: [
            {
              type: "text",
              value: "Key",
            },
          ],
        },
        {
          type: "tableCell",
          children: [
            {
              type: "text",
              value: "Value",
            },
          ],
        },
      ],
    };
    table.children.push(headerRow);

    // Get convertTypes option with default
    const convertTypes =
      options?.convertTypes !== undefined
        ? Boolean(options.convertTypes)
        : true;

    // Create data rows
    for (const [key, value] of Object.entries(data)) {
      const row: TableRow = {
        type: "tableRow",
        children: [
          {
            type: "tableCell",
            children: [
              {
                type: "text",
                value: key,
              },
            ],
          },
          {
            type: "tableCell",
            children: [
              {
                type: "text",
                value: this.formatValue(value, convertTypes),
              },
            ],
          },
        ],
      };
      table.children.push(row);
    }

    return table;
  }

  /**
   * Format a value for display in a table cell
   *
   * @param value The value to format
   * @returns Formatted string representation
   */
  /**
   * Format a value for display in a table cell
   *
   * @param value The value to format
   * @param convertTypes Whether to convert primitive values to appropriate types
   * @returns Formatted string representation
   */
  private formatValue(value: unknown, convertTypes = true): string {
    if (value === undefined) {
      return "";
    }
    if (value === null) {
      return "null";
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    // Use convertTypes parameter to determine if we should convert string values to appropriate types
    if (convertTypes && typeof value === "string") {
      const strValue = String(value);

      // Check if it's a number
      if (!Number.isNaN(Number(strValue)) && strValue.trim() !== "") {
        // Only convert if it looks like a valid number
        const numValue = Number(strValue);
        if (String(numValue) === strValue) {
          return strValue;
        }
      }

      // Check if it's a boolean
      if (strValue === "true" || strValue === "false") {
        return strValue;
      }
    }

    return String(value);
  }
}
