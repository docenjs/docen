import { writeFile } from "node:fs/promises";
import { Parser } from "htmlparser2";
import JSZip from "jszip";
import { type DataType, toArrayBuffer, toUint8Array } from "undio";
import type {
  ConversionOptions,
  DocumentMetadata,
  FormatProcessor,
  SpreadsheetMetadata,
} from "../../types";

/**
 * Parse Excel cell position (e.g., 'A1' -> { row: 1, column: 1 })
 */
function parseCellPosition(position: string): { row: number; column: number } {
  const match = position.match(/^([A-Z]+)(\d+)$/);
  if (!match) throw new Error(`Invalid cell position: ${position}`);

  const [, col, row] = match;
  const column = col
    .split("")
    .reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);

  return {
    row: Number.parseInt(row, 10),
    column,
  };
}

/**
 * XLSX document processor
 */
export class XLSXProcessor implements FormatProcessor {
  sourceFormats = ["xlsx"];
  targetFormats = ["xlsx", "txt", "csv"];

  /**
   * Convert XLSX to target format
   */
  async convert(
    source: DataType,
    target: string,
    options?: ConversionOptions,
  ): Promise<void> {
    const sourceBuffer = await toArrayBuffer(source);
    const targetFormat = target.split(".").pop()?.toLowerCase();

    switch (targetFormat) {
      case "xlsx": {
        // XLSX to XLSX (optimization, cleanup, etc.)
        await writeFile(target, Buffer.from(sourceBuffer));
        break;
      }
      case "txt":
      case "csv": {
        // XLSX to text/CSV
        const text = await this.extractText(source, options);
        await writeFile(target, text);
        break;
      }
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }

  /**
   * Extract text from XLSX
   */
  async extractText(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<string> {
    const sheets = await this.parseSheets(source);
    let text = "";

    for (const sheet of sheets) {
      text += `Sheet: ${sheet.name}\n`;
      for (const row of sheet.data) {
        if (row) {
          text += `${row.join("\t")}\n`;
        }
      }
      text += "\n";
    }

    return text;
  }

  /**
   * Get XLSX metadata
   */
  async getMetadata(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<DocumentMetadata> {
    const sheets = await this.parseSheets(source);
    const metadata: SpreadsheetMetadata = {
      sheetCount: sheets.length,
      rowCount: Math.max(...sheets.map((sheet) => sheet.data.length)),
      columnCount: Math.max(
        ...sheets.map((sheet) =>
          Math.max(...sheet.data.map((row) => row.length)),
        ),
      ),
    };

    return {
      createdAt: new Date(),
      modifiedAt: new Date(),
      spreadsheet: metadata,
    };
  }

  /**
   * Parse XLSX sheets
   */
  private async parseSheets(
    source: DataType,
  ): Promise<Array<{ name: string; data: string[][] }>> {
    const xlsxSource = await JSZip.loadAsync(toUint8Array(source));
    const files = xlsxSource?.files;

    const worksheets = [];

    for (const fileName in files) {
      if (fileName.startsWith("xl/worksheets/")) {
        const sheetXML = await files[fileName]?.async("text");

        worksheets.push({
          name: fileName.replace("xl/worksheets/", ""),
          data: sheetXML,
        });
      }
    }

    const sharedStringsXML = await xlsxSource
      .file("xl/sharedStrings.xml")
      ?.async("text");

    const sharedStrings: string[] = [];

    if (sharedStringsXML) {
      let isString = false;

      const parser = new Parser({
        onopentag: (name) => {
          if (name === "t") {
            isString = true;
          }
        },
        ontext: (text) => {
          if (isString && text) {
            sharedStrings.push(text);
          }
        },
        onclosetag: (name) => {
          if (name === "t") {
            isString = false;
          }
        },
      });

      parser.write(sharedStringsXML);
      parser.end();
    }

    const sheets = [];

    for (const worksheet of worksheets) {
      const rows: string[][] = [];
      let currentCell = "";

      const parser = new Parser({
        onopentag: (name, attributes) => {
          if (name === "c") {
            currentCell = attributes.r;
          }
        },
        ontext: (text) => {
          if (currentCell) {
            const index = Number(text);
            const value = sharedStrings[index];

            const { row, column } = parseCellPosition(currentCell);

            if (!rows[row - 1]) {
              rows[row - 1] = [];
            }

            rows[row - 1][column - 1] = value;
          }
        },
        onclosetag: (name) => {
          if (name === "c") {
            currentCell = "";
          }
        },
      });

      parser.write(worksheet.data);
      parser.end();

      sheets.push({
        name: worksheet.name.slice(0, -4),
        data: rows,
      });
    }

    return sheets;
  }
}
