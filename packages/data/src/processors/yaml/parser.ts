/**
 * YAML parser for Docen
 *
 * This file implements a parser for YAML files.
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
 * YAML Parser specific options
 */
export interface YAMLParserOptions extends ProcessorOptions {
  /** Whether to preserve comments (default: false) */
  preserveComments?: boolean;
  /** Whether to convert primitive values to appropriate types (default: true) */
  convertTypes?: boolean;
  /** Whether to handle anchors and aliases (default: true) */
  handleAnchors?: boolean;
}

/**
 * YAML Parser implementation
 */
export class YAMLParser extends AbstractParser {
  id = "yaml-parser";
  name = "YAML Parser";
  supportedInputTypes = ["text/yaml", "text/x-yaml"];
  supportedOutputTypes: string[] = [];
  supportedInputExtensions = ["yaml", "yml"];
  supportedOutputExtensions: string[] = [];

  /**
   * Parse YAML data into a document AST
   *
   * @param source The source data to parse
   * @param options Parsing options
   * @returns Parsed document
   */
  async parse(source: Source, options?: YAMLParserOptions): Promise<Document> {
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
        } as Root,
      };

      // Parse YAML content
      const content = await this.parseYAML(text, options);
      document.content = content;

      return document;
    } catch (error) {
      throw createProcessorError(
        "Failed to parse YAML content",
        this.id,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Try to detect if the source is in YAML format
   *
   * @param source The source to check
   * @returns True if the source appears to be YAML
   */
  protected async detectFormat(source: Source): Promise<boolean> {
    try {
      // Convert source to string for basic format detection
      const data = toUint8Array(source);
      const text = new TextDecoder().decode(data.slice(0, 1000));

      // Check if the content looks like YAML
      const trimmed = text.trim();
      if (
        trimmed.startsWith("---") ||
        trimmed.startsWith("- ") ||
        /^[a-zA-Z0-9_]+:/.test(trimmed)
      ) {
        return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  /**
   * Parse YAML content into AST
   *
   * @param text The YAML text content
   * @param options Parsing options
   * @returns Root node of the AST
   */
  private async parseYAML(
    text: string,
    options?: YAMLParserOptions,
  ): Promise<Root> {
    const root: Root = {
      type: "root",
      children: [],
    };

    try {
      // Parse YAML content
      const yamlData = this.parseYAMLContent(text, options);

      // Convert YAML to table structure
      const table = this.yamlToTable(yamlData, options);
      if (table) {
        root.children.push(table);
      }
    } catch (error) {
      console.error("Error parsing YAML content:", error);
      // Add an error table to the AST
      root.children.push({
        type: "table",
        children: [
          {
            type: "tableRow",
            children: [
              {
                type: "tableCell",
                children: [
                  {
                    type: "text",
                    value: `Error parsing YAML document: ${error}`,
                  },
                ],
              },
            ],
          },
        ],
      } as Table);
    }

    return root;
  }

  /**
   * Parse YAML content into a JavaScript object
   *
   * @param text The YAML text content
   * @param options Parsing options
   * @returns Parsed YAML data
   */
  private parseYAMLContent(text: string, options?: YAMLParserOptions): unknown {
    const lines = this.splitYAMLLines(text);
    const result: Record<string, unknown> = {};
    let currentKey = "";
    let currentValue: unknown[] = [];
    let currentIndent = 0;
    let inBlockString = false;
    let blockStringIndent = 0;
    let blockStringLines: string[] = [];
    const anchors: Record<string, unknown> = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      // Calculate indentation
      const indent = line.match(/^\s*/)?.[0].length || 0;

      // Handle block strings
      if (trimmed.startsWith("|") || trimmed.startsWith(">")) {
        inBlockString = true;
        blockStringIndent = indent;
        blockStringLines = [];
        continue;
      }

      if (inBlockString) {
        if (indent <= blockStringIndent && trimmed !== "") {
          inBlockString = false;
          const blockString = blockStringLines.join("\n");
          currentValue.push(blockString);
        } else {
          blockStringLines.push(line.slice(blockStringIndent));
        }
        continue;
      }

      // Handle anchors and aliases
      if (options?.handleAnchors) {
        const anchorMatch = trimmed.match(/^([^&]+)\s*&(\w+)\s*$/);
        if (anchorMatch) {
          const [, value, anchor] = anchorMatch;
          const parsedValue = this.parseValue(value.trim(), options);
          anchors[anchor] = parsedValue;
          currentValue.push(parsedValue);
          continue;
        }

        const aliasMatch = trimmed.match(/^([^&]+)\s*\*(\w+)\s*$/);
        if (aliasMatch) {
          const [, value, alias] = aliasMatch;
          if (anchors[alias]) {
            currentValue.push(anchors[alias]);
          } else {
            currentValue.push(value.trim());
          }
          continue;
        }
      }

      // Handle list items
      if (trimmed.startsWith("- ")) {
        const value = trimmed.slice(2);
        currentValue.push(this.parseValue(value, options));
        continue;
      }

      // Handle key-value pairs
      const match = trimmed.match(/^([^:]+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        const parsedKey = key.trim();
        const parsedValue = value.trim();

        // If we have a previous key-value pair, save it
        if (currentKey) {
          result[currentKey] =
            currentValue.length > 1 ? currentValue : currentValue[0];
          currentValue = [];
        }

        currentKey = parsedKey;
        if (parsedValue) {
          currentValue.push(this.parseValue(parsedValue, options));
        }
        currentIndent = indent;
        continue;
      }

      // Handle indented values
      if (indent > currentIndent && currentKey) {
        currentValue.push(this.parseValue(trimmed, options));
      }
    }

    // Save the last key-value pair
    if (currentKey) {
      result[currentKey] =
        currentValue.length > 1 ? currentValue : currentValue[0];
    }

    return result;
  }

  /**
   * Split YAML text into lines while preserving block strings
   *
   * @param text The YAML text to split
   * @returns Array of lines
   */
  private splitYAMLLines(text: string): string[] {
    const lines: string[] = [];
    let currentLine = "";
    let inBlockString = false;
    let blockStringIndent = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];

      if (char === "\n") {
        if (inBlockString) {
          currentLine += char;
        } else {
          lines.push(currentLine);
          currentLine = "";
        }
        continue;
      }

      if (char === "|" || char === ">") {
        if (currentLine.trim() === "") {
          inBlockString = true;
          blockStringIndent = currentLine.length;
        }
      }

      currentLine += char;
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Parse a YAML value into a JavaScript value
   *
   * @param value The YAML value to parse
   * @param options Parsing options
   * @returns Parsed value
   */
  private parseValue(value: string, options?: YAMLParserOptions): unknown {
    // Handle null values
    if (value === "null" || value === "~") {
      return null;
    }

    // Handle boolean values
    if (value === "true" || value === "false") {
      return value === "true";
    }

    // Handle numbers
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num;
    }

    // Handle arrays
    if (value.startsWith("[") && value.endsWith("]")) {
      return value
        .slice(1, -1)
        .split(",")
        .map((item) => this.parseValue(item.trim(), options));
    }

    // Handle objects
    if (value.startsWith("{") && value.endsWith("}")) {
      const obj: Record<string, unknown> = {};
      const pairs = value.slice(1, -1).split(",");
      for (const pair of pairs) {
        const [key, val] = pair.split(":").map((item) => item.trim());
        if (key && val) {
          obj[key] = this.parseValue(val, options);
        }
      }
      return obj;
    }

    // Return as string if no other type matches
    return value;
  }

  /**
   * Convert YAML data to a table structure
   *
   * @param data The YAML data to convert
   * @param options Parsing options
   * @returns Table node or undefined if conversion is not possible
   */
  private yamlToTable(
    data: unknown,
    options?: YAMLParserOptions,
  ): Table | undefined {
    // Create table node
    const table: Table = {
      type: "table",
      children: [],
    };

    // Handle different YAML structures
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
              value: String(data),
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
    options?: YAMLParserOptions,
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
    options?: YAMLParserOptions,
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
    options?: YAMLParserOptions,
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
