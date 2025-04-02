/**
 * XML generator for Docen
 *
 * This file implements a generator for XML files.
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
 * XML Generator options
 */
export interface XMLGeneratorOptions extends ProcessorOptions {
  /** Whether to include XML declaration (default: true) */
  includeDeclaration?: boolean;
  /** Whether to preserve attributes (default: true) */
  preserveAttributes?: boolean;
  /** Whether to handle special values (NaN, Infinity, etc.) (default: true) */
  handleSpecialValues?: boolean;
  /** Indentation spaces (default: 2) */
  indentSize?: number;
}

/**
 * XML Generator implementation
 */
export class XMLGenerator implements Generator {
  id = "xml-generator";
  name = "XML Generator";
  supportedInputTypes: string[] = [];
  supportedOutputTypes = ["text/xml", "application/xml"];
  supportedInputExtensions: string[] = [];
  supportedOutputExtensions = ["xml"];

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
   * Generate XML output from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated XML content
   */
  async generate(
    document: Document,
    options?: XMLGeneratorOptions
  ): Promise<ConversionResult> {
    try {
      // Get options with defaults
      const includeDeclaration =
        options?.includeDeclaration !== undefined
          ? Boolean(options.includeDeclaration)
          : true;
      const preserveAttributes =
        options?.preserveAttributes !== undefined
          ? Boolean(options.preserveAttributes)
          : true;
      const handleSpecialValues =
        options?.handleSpecialValues !== undefined
          ? Boolean(options.handleSpecialValues)
          : true;
      const indentSize =
        options?.indentSize !== undefined ? Number(options.indentSize) : 2;

      // Generate XML data from the document AST
      const xmlData = this.generateXMLData(document, options);

      // Convert to XML string
      const xmlContent = this.generateXMLContent(xmlData, {
        includeDeclaration,
        preserveAttributes,
        handleSpecialValues,
        indentSize,
      });

      // Convert to UTF-8 encoded Uint8Array
      const encoder = new TextEncoder();
      const content = encoder.encode(xmlContent);

      return {
        content,
        mimeType: "text/xml",
        extension: "xml",
      };
    } catch (error) {
      console.error("Error generating XML content:", error);
      throw new Error(`Failed to generate XML: ${error}`);
    }
  }

  /**
   * Generate XML data from document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns XML data object
   */
  private generateXMLData(
    document: Document,
    options?: XMLGeneratorOptions
  ): Record<string, unknown> {
    // Find table nodes in the document
    if (document.content?.children) {
      for (const node of document.content.children) {
        if (node.type === "table") {
          return this.tableToXML(node as Table, options);
        }
      }
    }

    // If no table found, return empty object
    return {};
  }

  /**
   * Convert a table node to XML data
   *
   * @param table The table node to convert
   * @param options Generation options
   * @returns XML data object
   */
  private tableToXML(
    table: Table,
    options?: XMLGeneratorOptions
  ): Record<string, unknown> {
    if (table.children.length === 0) {
      return {};
    }

    // Check if the table has a header row
    const hasHeader = table.children.length >= 2;
    const firstRow = table.children[0] as TableRow;

    if (hasHeader) {
      // Table with headers - convert to array of objects or key-value object
      return this.headerTableToXML(table);
    }
    // Table without headers - convert to array of values
    return this.simpleTableToXML(table);
  }

  /**
   * Convert a table with headers to XML data
   *
   * @param table The table with headers to convert
   * @returns XML data object
   */
  private headerTableToXML(table: Table): Record<string, unknown> {
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
          const value = this.parseXMLValue(
            this.getCellTextContent(row.children[1] as TableCell)
          );
          result[key] = value;
        }
      }

      return result;
    }
    // Convert to array of objects
    const result: Record<string, unknown> = {};

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as TableRow;
      const obj: Record<string, unknown> = {};

      for (let j = 0; j < headers.length && j < row.children.length; j++) {
        const header = headers[j];
        const value = this.parseXMLValue(
          this.getCellTextContent(row.children[j] as TableCell)
        );
        obj[header] = value;
      }

      if (Object.keys(obj).length > 0) {
        result[`item${i}`] = obj;
      }
    }

    return result;
  }

  /**
   * Convert a simple table (without headers) to XML data
   *
   * @param table The simple table to convert
   * @returns XML data object
   */
  private simpleTableToXML(table: Table): Record<string, unknown> {
    const result: Record<string, unknown> = {};

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
        const value = this.parseXMLValue(
          this.getCellTextContent(row.children[0] as TableCell)
        );
        result[`item${i + 1}`] = value;
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
   * Parse a string value into an XML value
   *
   * @param value The string value to parse
   * @returns Parsed XML value
   */
  private parseXMLValue(value: string): unknown {
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
   * Generate XML content from data
   *
   * @param data The data to convert to XML
   * @param options Generation options
   * @returns XML string
   */
  private generateXMLContent(
    data: unknown,
    options: {
      includeDeclaration: boolean;
      preserveAttributes: boolean;
      handleSpecialValues: boolean;
      indentSize: number;
    }
  ): string {
    const {
      includeDeclaration,
      preserveAttributes,
      handleSpecialValues,
      indentSize,
    } = options;
    const lines: string[] = [];
    const currentIndent = 0;

    // Add XML declaration if requested
    if (includeDeclaration) {
      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    }

    // Generate root element
    const rootElement = this.generateXMLElement(data, currentIndent, {
      preserveAttributes,
      handleSpecialValues,
      indentSize,
    });
    lines.push(rootElement);

    return lines.join("\n");
  }

  /**
   * Generate XML element from data
   *
   * @param data The data to convert to XML
   * @param indent Current indentation level
   * @param options Generation options
   * @returns XML element string
   */
  private generateXMLElement(
    data: unknown,
    indent: number,
    options: {
      preserveAttributes: boolean;
      handleSpecialValues: boolean;
      indentSize: number;
    }
  ): string {
    const { preserveAttributes, handleSpecialValues, indentSize } = options;

    if (data === null) {
      return "null";
    }
    if (data === undefined) {
      return "undefined";
    }
    if (typeof data === "object") {
      if (Array.isArray(data)) {
        if (data.length === 0) {
          return "<array/>";
        }
        const arrayLines: string[] = [];
        for (const item of data) {
          arrayLines.push(
            `${" ".repeat(indent)}<item>${this.generateXMLElement(
              item,
              indent + indentSize,
              options
            )}</item>`
          );
        }
        return arrayLines.join("\n");
      }
      if (Object.keys(data as Record<string, unknown>).length === 0) {
        return "<object/>";
      }
      const objectLines: string[] = [];
      for (const [key, value] of Object.entries(
        data as Record<string, unknown>
      )) {
        if (preserveAttributes && key === "@attributes") {
          const attrs = value as Record<string, string>;
          const attrLines: string[] = [];
          for (const [attrKey, attrValue] of Object.entries(attrs)) {
            attrLines.push(`${attrKey}="${this.escapeXMLString(attrValue)}"`);
          }
          objectLines.push(`<object ${attrLines.join(" ")}>`);
        } else if (key === "#text") {
          objectLines.push(
            `${" ".repeat(indent)}${this.generateXMLElement(
              value,
              indent + indentSize,
              options
            )}`
          );
        } else {
          objectLines.push(
            `${" ".repeat(indent)}<${key}>${this.generateXMLElement(
              value,
              indent + indentSize,
              options
            )}</${key}>`
          );
        }
      }
      return objectLines.join("\n");
    }
    if (typeof data === "string") {
      // Handle special values if enabled
      if (handleSpecialValues) {
        if (data === "NaN") {
          return "NaN";
        }
        if (data === "Infinity") {
          return "Infinity";
        }
        if (data === "-Infinity") {
          return "-Infinity";
        }
      }
      return this.escapeXMLString(data);
    }
    return String(data);
  }

  /**
   * Escape special characters in XML string
   *
   * @param str The string to escape
   * @returns Escaped string
   */
  private escapeXMLString(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }
}
