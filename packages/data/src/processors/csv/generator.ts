/**
 * CSV generator for Docen
 *
 * This file implements a generator for CSV files.
 */

import type {
  ConversionResult,
  Document,
  Generator,
  ProcessorOptions,
  Table,
  TableCell,
  TableRow,
} from "@docen/core";

/**
 * CSV Generator options
 */
export interface CSVGeneratorOptions extends ProcessorOptions {
  /** Delimiter character for CSV (default: ',') */
  delimiter?: string;
  /** Whether to include a header row (default: true) */
  includeHeader?: boolean;
  /** Whether to quote all values (default: false) */
  quoteAll?: boolean;
}

/**
 * CSV Generator implementation
 */
export class CSVGenerator implements Generator {
  id = "csv-generator";
  name = "CSV Generator";
  supportedInputTypes: string[] = [];
  supportedOutputTypes = ["text/csv"];
  supportedInputExtensions: string[] = [];
  supportedOutputExtensions = ["csv"];

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
   * Generate CSV output from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated CSV content
   */
  async generate(
    document: Document,
    options?: CSVGeneratorOptions,
  ): Promise<ConversionResult> {
    // Generate CSV content from the document AST
    const csvContent = this.generateCSVContent(document, options);

    // Convert to UTF-8 encoded Uint8Array
    const encoder = new TextEncoder();
    const content = encoder.encode(csvContent);

    return {
      content,
      mimeType: "text/csv",
      extension: "csv",
    };
  }

  /**
   * Generate CSV content from document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns CSV content as string
   */
  private generateCSVContent(
    document: Document,
    options?: CSVGeneratorOptions,
  ): string {
    let csvContent = "";

    // Find table nodes in the document
    if (document.content?.children) {
      for (const node of document.content.children) {
        if (node.type === "table") {
          csvContent += this.tableToCSV(node, options);
          break; // Only process the first table for now
        }
      }
    }

    return csvContent;
  }

  /**
   * Convert a table node to CSV format
   *
   * @param table The table node to convert
   * @param options Generation options
   * @returns CSV content as string
   */
  private tableToCSV(table: Table, options?: CSVGeneratorOptions): string {
    // Get options with defaults
    const delimiter = options?.delimiter || ",";
    const includeHeader =
      options?.includeHeader !== undefined
        ? Boolean(options.includeHeader)
        : true;
    const quoteAll =
      options?.quoteAll !== undefined ? Boolean(options.quoteAll) : false;

    const rows: string[] = [];

    // Process each row in the table
    for (let i = 0; i < table.children.length; i++) {
      const row = table.children[i];
      // Skip header row if not including headers
      if (i === 0 && !includeHeader && table.children.length > 1) {
        continue;
      }

      if (row.type === "tableRow") {
        const csvRow = this.rowToCSV(row, delimiter, quoteAll);
        rows.push(csvRow);
      }
    }

    return rows.join("\n");
  }

  /**
   * Convert a table row to CSV format
   *
   * @param row The table row to convert
   * @returns CSV row as string
   */
  private rowToCSV(row: TableRow, delimiter = ",", quoteAll = false): string {
    const cells: string[] = [];

    // Process each cell in the row
    for (const cell of row.children) {
      if (cell.type === "tableCell") {
        const csvCell = this.cellToCSV(cell, quoteAll);
        cells.push(csvCell);
      }
    }

    return cells.join(delimiter);
  }

  /**
   * Convert a table cell to CSV format
   *
   * @param cell The table cell to convert
   * @returns CSV cell as string
   */
  private cellToCSV(cell: TableCell, quoteAll = false): string {
    // Extract text content from the cell
    let content = "";

    for (const child of cell.children) {
      if (child.type === "text") {
        content += child.value;
      }
      // Could handle other inline content types here
    }

    // Escape special characters in CSV
    return this.escapeCSV(content, quoteAll);
  }

  /**
   * Escape special characters in CSV content
   *
   * @param content The content to escape
   * @returns Escaped content
   */
  private escapeCSV(content: string, quoteAll = false): string {
    // If content contains commas, quotes, or newlines, or quoteAll is true, wrap in quotes and escape quotes
    if (
      quoteAll ||
      content.includes(",") ||
      content.includes('"') ||
      content.includes("\n")
    ) {
      return `"${content.replace(/"/g, '""')}"`;
    }
    return content;
  }
}
