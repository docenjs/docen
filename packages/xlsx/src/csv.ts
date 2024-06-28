import type { DataType } from "undio";
import { parseSheets } from "./parse";

export async function convertXLSXToCSV(source: DataType) {
  const sheets = await parseSheets(source);

  const sheetsCSV = sheets.map((sheet) => {
    return {
      name: sheet.name,
      data: sheet.data.map((row) => row.join(",")).join("\n"),
    };
  });

  return sheetsCSV;
}
