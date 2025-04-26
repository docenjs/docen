import { XMLParser } from "fast-xml-parser";
import { strFromU8, unzip } from "fflate";
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import type {
  OoxmlRoot,
  OoxmlTable,
  OoxmlTableCell,
  OoxmlTableRow,
  OoxmlTextRun,
} from "../ast";

// XML Parser (same as for DOCX)
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  allowBooleanAttributes: true,
  parseAttributeValue: true,
  trimValues: true,
});

// Helper function (similar to DOCX one) - This needs refinement for XLSX structure
function findWorksheetPaths(files: Record<string, Uint8Array>): string[] {
  // TODO: Parse workbook.xml and workbook.xml.rels to find actual sheet paths and relationships
  // For now, find paths matching the typical pattern
  const sheetPaths = Object.keys(files).filter(
    (path) =>
      path.startsWith("xl/worksheets/") &&
      path.endsWith(".xml") &&
      !path.includes("rels"),
  );
  if (sheetPaths.length === 0) {
    console.warn(
      "Could not find any worksheet XML parts (e.g., xl/worksheets/sheet1.xml)",
    );
  }
  return sheetPaths.sort(); // Basic sort
}

// TODO: Helper function to parse sharedStrings.xml if present
function parseSharedStrings(files: Record<string, Uint8Array>): string[] {
  const sharedStringsPath = "xl/sharedStrings.xml";
  const sharedStrings: string[] = [];
  if (files[sharedStringsPath]) {
    try {
      const content = strFromU8(files[sharedStringsPath]);
      const parsed = xmlParser.parse(content);
      const sst = parsed?.sst; // Use dot notation
      if (sst?.si) {
        // Shared String Item
        const items = Array.isArray(sst.si) ? sst.si : [sst.si];
        for (const item of items) {
          // Simple text extraction, might need refinement for rich text runs (<r>)
          let text = "";
          if (item?.t && typeof item.t === "string") {
            text = item.t;
          } else if (item?.t?.["#text"]) {
            // Handle text within object
            text = item.t["#text"];
          }
          // TODO: Handle rich text runs <r> within shared strings
          sharedStrings.push(text);
        }
      }
    } catch (e) {
      console.error("Error parsing sharedStrings.xml:", e);
    }
  }
  return sharedStrings;
}

// Helper to get cell value (handles shared strings)
function getCellValue(cell: any, sharedStrings: string[]): string {
  const cellType = cell?.["@_"]?.t;
  const cellValue = cell?.v?.["#text"] ?? cell?.v; // Get value, handling text node

  if (cellType === "s" && sharedStrings && cellValue !== undefined) {
    // Shared string: index into sharedStrings array
    const ssIndex = Number.parseInt(cellValue, 10); // Use Number.parseInt
    // Add check for NaN using Number.isNaN
    if (!Number.isNaN(ssIndex)) {
      return sharedStrings[ssIndex] ?? ""; // Return shared string or empty if index invalid
    }
  }
  // No unnecessary else, handle non-shared string case directly
  if (cellValue !== undefined && cellValue !== null) {
    // Other types (number, boolean, inline string, date?)
    return String(cellValue); // Convert to string for text run
  }

  return ""; // Default empty string
}

/**
 * Async Unified plugin for XLSX:
 * 1. Unzips XLSX file using fflate.
 * 2. Parses worksheet XML using fast-xml-parser.
 * 3. Transforms sheet data into an OoxmlRoot AST with table(s).
 */
export const xlsxToOoxmlAst: Plugin<[], OoxmlRoot | undefined> = () => {
  return async (
    tree: OoxmlRoot | undefined,
    file: VFile,
  ): Promise<OoxmlRoot | undefined> => {
    console.log("Plugin: xlsxToOoxmlAst running (async with fflate).");

    if (!file.value || !(file.value instanceof Uint8Array)) {
      file.message(
        new Error("VFile value must be a Uint8Array for XLSX parsing."),
      );
      return undefined;
    }

    let decompressedFiles: Record<string, Uint8Array>;
    try {
      decompressedFiles = await new Promise((resolve, reject) => {
        unzip(file.value as Uint8Array, (err, data) => {
          err ? reject(err) : resolve(data);
        });
      });
      file.data.ooxmlFiles = decompressedFiles;
    } catch (error: unknown) {
      console.error("Error unzipping XLSX file with fflate:", error);
      file.message(
        new Error(
          `fflate unzip failed: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      return undefined;
    }

    const sharedStrings = parseSharedStrings(decompressedFiles);
    const worksheetPaths = findWorksheetPaths(decompressedFiles);
    if (worksheetPaths.length === 0) {
      file.message(new Error("No worksheets found in the XLSX file."));
      return undefined;
    }

    const newRoot: OoxmlRoot = {
      type: "root",
      children: [],
      metadata: { source: "fflate+xml" },
    };

    try {
      // Process each worksheet, creating a table for each
      for (const sheetPath of worksheetPaths) {
        const sheetXmlContent = strFromU8(decompressedFiles[sheetPath]);
        let parsedSheetXml: any;
        try {
          parsedSheetXml = xmlParser.parse(sheetXmlContent);
        } catch (error: unknown) {
          console.error(`Error parsing XML (${sheetPath}):`, error);
          file.message(
            new Error(
              `XML parsing failed for ${sheetPath}: ${error instanceof Error ? error.message : String(error)}`,
            ),
          );
          continue; // Skip this sheet on error
        }

        // Use dot notation for nested access
        const sheetData = parsedSheetXml?.worksheet?.sheetData;
        if (!sheetData?.row) {
          console.warn(`No sheet data or rows found in ${sheetPath}`);
          continue;
        }

        const table: OoxmlTable = {
          type: "table",
          children: [],
          properties: { sheetPath }, // Store original path
        };

        const rows = Array.isArray(sheetData.row)
          ? sheetData.row
          : [sheetData.row];

        for (const row of rows) {
          if (!row || typeof row !== "object") continue;
          const tableRow: OoxmlTableRow = {
            type: "tableRow",
            children: [],
            properties: row["@_"] || {}, // Row properties (e.g., row index)
          };

          const cells = row.c ? (Array.isArray(row.c) ? row.c : [row.c]) : [];

          for (const cell of cells) {
            if (!cell || typeof cell !== "object") continue;
            const cellValue = getCellValue(cell, sharedStrings);
            const textRun: OoxmlTextRun = { type: "textRun", value: cellValue };
            const tableCell: OoxmlTableCell = {
              type: "tableCell",
              children: [textRun], // Assume simple text for now
              properties: cell["@_"] || {}, // Cell properties (e.g., cell ref 'r', style 's', type 't')
            };
            tableRow.children.push(tableCell);
          }
          table.children.push(tableRow);
        }
        newRoot.children.push(table); // Add table for this sheet
      }

      console.log(
        `xlsxToOoxmlAst plugin: Transformed ${newRoot.children.length} sheets into OoxmlTables.`,
      );
      return newRoot;
    } catch (transformError: unknown) {
      console.error(
        "Error during XLSX to Ooxml AST transformation:",
        transformError,
      );
      file.message(
        new Error(
          `XLSX AST transformation failed: ${transformError instanceof Error ? transformError.message : String(transformError)}`,
        ),
      );
      return undefined;
    }
  };
};
