/**
 * CSV parser for Docen
 *
 * This file implements a parser for CSV files.
 */

import type {
  Document,
  Parser,
  ProcessorOptions,
  Root,
  Source,
  Table,
  TableRow,
} from "@docen/core";
import { toUint8Array } from "@docen/core";

/**
 * CSV Parser specific options
 */
export interface CSVParserOptions extends ProcessorOptions {
  /** Delimiter character for CSV (default: ',') */
  delimiter?: string;
  /** Whether the first row is a header (default: true) */
  hasHeader?: boolean;
  /** Skip empty lines (default: true) */
  skipEmptyLines?: boolean;
  /** Trim whitespace from values (default: false) */
  trimValues?: boolean;
  /** Quote character (default: '"') */
  quote?: string;
  /** Escape character (default: '"') */
  escapeChar?: string;
  /** Whether to detect BOM (default: true) */
  detectBOM?: boolean;
}

/**
 * CSV Parser implementation
 */
export class CSVParser implements Parser {
  id = "csv-parser";
  name = "CSV Parser";
  supportedInputTypes = ["text/csv"];
  supportedOutputTypes: string[] = [];
  supportedInputExtensions = ["csv"];
  supportedOutputExtensions: string[] = [];

  /**
   * Check if this parser can handle the given source
   *
   * @param source The source to check
   * @param mimeType Optional MIME type hint
   * @param extension Optional file extension hint
   * @returns True if this parser can handle the source
   */
  async canParse(
    source: Source,
    mimeType?: string,
    extension?: string
  ): Promise<boolean> {
    // Check if the MIME type or extension is supported
    if (mimeType && this.supportedInputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedInputExtensions.includes(extension)) {
      return true;
    }

    // If no hints are provided, try to detect the format
    try {
      // Convert source to string for basic format detection
      const data = toUint8Array(source);
      const text = new TextDecoder().decode(data.slice(0, 1000));

      // Check if the content looks like CSV
      // Look for comma-separated values and newlines
      const lines = text
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0);
      if (lines.length > 0) {
        // Check if most lines have the same number of commas
        const commasPerLine = lines.map(
          (line) => (line.match(/,/g) || []).length
        );
        const mostCommonCount = this.getMostCommonValue(commasPerLine);

        // If most lines have the same number of commas and it's at least 1, it's likely CSV
        const matchingLines = commasPerLine.filter(
          (count) => count === mostCommonCount
        ).length;
        if (mostCommonCount >= 1 && matchingLines / lines.length > 0.7) {
          return true;
        }
      }
    } catch (error) {
      // If we can't check the content, return false
      return false;
    }

    return false;
  }

  /**
   * Parse CSV data into a document AST
   *
   * @param source The source data to parse
   * @param options Parsing options
   * @returns Parsed document
   */
  async parse(source: Source, options?: CSVParserOptions): Promise<Document> {
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

    // Parse CSV content
    const content = await this.parseCSV(text, options);
    document.content = content;

    return document;
  }

  /**
   * Parse CSV content into AST
   *
   * @param text The CSV text content
   * @param options Parsing options
   * @returns Root node of the AST
   */
  private async parseCSV(
    text: string,
    options?: CSVParserOptions
  ): Promise<Root> {
    const root: Root = {
      type: "root",
      children: [],
    };

    try {
      // Get options with defaults
      const delimiter = options?.delimiter || ",";
      const hasHeader =
        options?.hasHeader !== undefined ? Boolean(options.hasHeader) : true;
      const skipEmptyLines =
        options?.skipEmptyLines !== undefined
          ? Boolean(options.skipEmptyLines)
          : true;
      const trimValues =
        options?.trimValues !== undefined ? Boolean(options.trimValues) : false;
      const quote = options?.quote || '"';
      const escapeChar = options?.escapeChar || '"';
      const detectBOM =
        options?.detectBOM !== undefined ? Boolean(options.detectBOM) : true;

      // Remove BOM if present and detection is enabled
      const processedText =
        detectBOM && text.startsWith("\uFEFF") ? text.slice(1) : text;

      // Split into lines while preserving quoted newlines
      const lines = this.splitCSVLines(processedText, quote, escapeChar);

      // Filter empty lines if needed
      const filteredLines = skipEmptyLines
        ? lines.filter((line) => line.trim().length > 0)
        : lines;

      if (filteredLines.length === 0) {
        return root;
      }

      // Parse CSV into rows and cells
      const rows = filteredLines.map((line) =>
        this.parseCSVLine(line, delimiter, quote, escapeChar, trimValues)
      );

      // Create table node
      const table: Table = {
        type: "table",
        children: [],
      };

      // Add header row if applicable
      if (hasHeader && rows.length > 0) {
        const headerRow: TableRow = {
          type: "tableRow",
          children: rows[0].map((cell) => ({
            type: "tableCell",
            children: [
              {
                type: "text",
                value: cell,
              },
            ],
            isHeader: true,
          })),
        };
        table.children.push(headerRow);
      }

      // Add data rows
      const startIndex = hasHeader ? 1 : 0;
      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        const tableRow: TableRow = {
          type: "tableRow",
          children: row.map((cell) => ({
            type: "tableCell",
            children: [
              {
                type: "text",
                value: cell,
              },
            ],
          })),
        };
        table.children.push(tableRow);
      }

      // Add table to root
      root.children.push(table);
    } catch (error) {
      console.error("Error parsing CSV content:", error);
      // Add an error paragraph to the AST
      root.children.push({
        type: "paragraph",
        children: [
          {
            type: "text",
            value: `Error parsing CSV document: ${error}`,
          },
        ],
      });
    }

    return root;
  }

  /**
   * Split CSV text into lines while preserving quoted newlines
   *
   * @param text The CSV text content
   * @param quote The quote character
   * @param escapeChar The escape character
   * @returns Array of lines
   */
  private splitCSVLines(
    text: string,
    quote: string,
    escapeChar: string
  ): string[] {
    const lines: string[] = [];
    let currentLine = "";
    let inQuotes = false;
    let i = 0;

    while (i < text.length) {
      const char = text[i];

      if (char === quote) {
        // Check if this is an escaped quote
        if (i + 1 < text.length && text[i + 1] === escapeChar) {
          currentLine += quote;
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        i++;
        continue;
      }

      if (char === "\n" || char === "\r") {
        if (!inQuotes) {
          // Handle CRLF
          if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n") {
            i++;
          }
          lines.push(currentLine);
          currentLine = "";
        } else {
          currentLine += char;
        }
        i++;
        continue;
      }

      currentLine += char;
      i++;
    }

    // Add the last line if not empty
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Parse a CSV line into an array of cell values
   *
   * @param line CSV line to parse
   * @param delimiter The delimiter character to use
   * @param quote The quote character
   * @param escapeChar The escape character
   * @param trimValues Whether to trim whitespace from values
   * @returns Array of cell values
   */
  private parseCSVLine(
    line: string,
    delimiter: string,
    quote: string,
    escapeChar: string,
    trimValues: boolean
  ): string[] {
    const cells: string[] = [];
    let currentCell = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === quote) {
        // Check if this is an escaped quote
        if (i + 1 < line.length && line[i + 1] === escapeChar) {
          currentCell += quote;
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        i++;
        continue;
      }

      if (char === delimiter && !inQuotes) {
        cells.push(trimValues ? currentCell.trim() : currentCell);
        currentCell = "";
        i++;
        continue;
      }

      currentCell += char;
      i++;
    }

    // Add the last cell if not empty
    if (currentCell.length > 0) {
      cells.push(trimValues ? currentCell.trim() : currentCell);
    }

    return cells;
  }

  /**
   * Get the most common value in an array
   *
   * @param arr Array of numbers
   * @returns Most common value
   */
  private getMostCommonValue(arr: number[]): number {
    const counts: Record<number, number> = {};
    let maxCount = 0;
    let mostCommon = 0;

    for (const value of arr) {
      counts[value] = (counts[value] || 0) + 1;
      if (counts[value] > maxCount) {
        maxCount = counts[value];
        mostCommon = value;
      }
    }

    return mostCommon;
  }
}
