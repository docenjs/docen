import { parseSheets } from "./parse";

export async function convertXLSXToCSV(source: Uint8Array) {
  const sheets = await parseSheets(source);

  const sheetsCSV = sheets.map((sheet) => {
    return {
      name: sheet.name,
      data: sheet.data.map((row) => row.join(",")).join("\n"),
    };
  });

  return sheetsCSV;
}
