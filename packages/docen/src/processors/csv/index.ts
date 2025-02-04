import { writeFile } from "node:fs/promises";
import { type DataType, toArrayBuffer, toText } from "undio";
import type {
  CSVOptions,
  ConversionOptions,
  DocumentMetadata,
  FormatProcessor,
  SpreadsheetMetadata,
} from "../../types";

interface CSVConvertOptions {
  header?: boolean | string | string[];
  delimiter?: string;
  repeatMarker?: string;
  quotechar?: string;
  newline?: string;
}

/**
 * CSV document processor
 */
export class CSVProcessor implements FormatProcessor {
  sourceFormats = ["csv"];
  targetFormats = ["csv", "txt", "json"];

  /**
   * Convert CSV to target format
   */
  async convert(
    source: DataType,
    target: string,
    options?: ConversionOptions,
  ): Promise<void> {
    const sourceText = await toText(source);
    const targetFormat = target.split(".").pop()?.toLowerCase();

    switch (targetFormat) {
      case "csv": {
        // CSV to CSV (cleanup, reformat)
        const json = this.convertCSVToJSON(sourceText, options?.csv);
        const csv = this.convertJSONToCSV(json, options?.csv);
        await writeFile(target, csv);
        break;
      }
      case "json": {
        // CSV to JSON
        const json = this.convertCSVToJSON(sourceText, options?.csv);
        await writeFile(
          target,
          JSON.stringify(json, null, options?.indent || 2),
        );
        break;
      }
      case "txt": {
        // CSV to text
        const text = await this.extractText(source, options);
        await writeFile(target, text);
        break;
      }
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }

  /**
   * Extract text from CSV
   */
  async extractText(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<string> {
    const sourceText = await toText(source);
    const json = this.convertCSVToJSON(sourceText, options?.csv);

    // Convert to readable text format
    const header = Object.keys(json[0] || {});
    const headerText = header.join("\t");

    // Build text output
    return `${[
      headerText,
      "-".repeat(headerText.length),
      ...json.map((row) => header.map((col) => row[col]).join("\t")),
    ].join("\n")}\n`;
  }

  /**
   * Get CSV metadata
   */
  async getMetadata(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<DocumentMetadata> {
    const sourceText = await toText(source);
    const json = this.convertCSVToJSON(sourceText, options?.csv);
    const metadata: SpreadsheetMetadata = {
      rowCount: json.length,
      columnCount: Object.keys(json[0] || {}).length,
    };

    return {
      createdAt: new Date(),
      modifiedAt: new Date(),
      spreadsheet: metadata,
    };
  }

  /**
   * Convert CSV to JSON
   */
  private convertCSVToJSON(source: string, options?: CSVOptions) {
    const delimiter = options?.delimiter ?? ",";
    const repeatMarker = options?.repeatMarker ?? "$";
    const quotechar = options?.quotechar ?? '"';
    const newline = options?.newline ?? "\n";

    const data = source.split(new RegExp(`\r?${newline}`, "g")).map((row) => {
      const regex = new RegExp(
        `(${quotechar}[^${quotechar}]*${quotechar}|[^${delimiter}]+)`,
        "g",
      );
      return row.match(regex) ?? [];
    });

    const maxColumns = Math.max(...data.map((row) => row.length));
    let header: string[] = [];
    let isHeaderRow = false;

    if (options?.header === true) {
      header = data[0];
      isHeaderRow = true;
    } else if (options?.header && Array.isArray(options?.header)) {
      header = options?.header;
    } else if (options?.header) {
      header = Array.from(
        { length: maxColumns },
        (_, i) => `${options?.header}${i + 1}`,
      );
    }

    for (let i = 0; i < header.length; i++) {
      if (header[i].length === 0 || header.indexOf(header[i]) !== i) {
        header[i] = `${header[i]}${repeatMarker}${i + 1}`;
      }
    }

    if (header.length < maxColumns) {
      header = header.concat(
        Array.from(
          { length: maxColumns - header.length },
          (_, i) => `${i + 1}`,
        ),
      );
    }

    const json = [];

    for (const row of data) {
      if (!isHeaderRow || data.indexOf(row) !== 0) {
        const obj: { [key: string]: string } = {};

        for (let i = 0; i < header.length; i++) {
          obj[header[i]] = row[i];

          if (!obj[header[i]]) {
            obj[header[i]] = "";
          }
        }

        json.push(obj);
      }
    }

    return json;
  }

  /**
   * Convert JSON to CSV
   */
  private convertJSONToCSV(
    source: Record<string, string | number | boolean | null>[],
    options?: CSVOptions,
  ) {
    const delimiter = options?.delimiter ?? ",";
    const newline = options?.newline ?? "\n";
    const quotechar = options?.quotechar ?? '"';
    const repeatMarker = options?.repeatMarker ?? "$";

    let header: string[] = [];
    let csv = "";

    const maxColumns = Math.max(
      ...source.map((row) => Object.keys(row).length),
    );

    if (options?.header === true) {
      header = Object.keys(source[maxColumns]);
    } else if (options?.header && Array.isArray(options?.header)) {
      header = options?.header;
    } else if (options?.header) {
      header = Array.from(
        { length: maxColumns },
        (_, i) => `${options?.header}${i + 1}`,
      );
    }

    for (let i = 0; i < header.length; i++) {
      if (header[i].length === 0 || header.indexOf(header[i]) !== i) {
        header[i] = `${header[i]}${repeatMarker}${i + 1}`;
      }
    }

    if (header.length < maxColumns) {
      header = header.concat(
        Array.from(
          { length: maxColumns - header.length },
          (_, i) => `${i + 1}`,
        ),
      );
    }

    csv += header.join(delimiter) + newline;

    for (const row of source) {
      let line = "";

      for (let i = 0; i < header.length; i++) {
        if (i > 0) {
          line += delimiter;
        }

        line += `${quotechar}${
          row[header[i]] ?? Object.values(row)[i]
        }${quotechar}`;
      }

      csv += line + newline;
    }

    return csv;
  }
}
