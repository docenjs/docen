import { parseSheets } from "./parse";
import { generateCellColumn } from "./utils";

export async function convertXLSXToJSON(
  source: Uint8Array,
  options: { header?: boolean | string | string[]; repeatMarker?: string }
) {
  const sheets = await parseSheets(source);

  const sheetJSON = [];

  const repeatMarker = options?.repeatMarker ?? "$";

  for (const sheet of sheets) {
    const { name, data } = sheet;

    let header: string[] = [];

    const maxColumns = Math.max(...data.map((row) => row.length));

    let isHeaderRow = false;

    if (options?.header === true) {
      header = data[0];

      isHeaderRow = true;
    } else if (Array.isArray(options?.header)) {
      header = options?.header;
    } else if (options?.header) {
      header = Array.from(
        { length: data[0].length },
        (_, i) => `${options?.header}${i + 1}`
      );
    } else {
      header = Array.from(
        { length: data[0].length },
        (_, i) => `${generateCellColumn(i + 1)}`
      );
    }

    for (let i = 1; i < header.length; i++) {
      if (header[i].length === 0) {
        header[i] = `${generateCellColumn(i + 1)}`;
      }

      if (header.indexOf(header[i]) !== i) {
        header[i] = `${header[i]}${repeatMarker}${i + 1}`;
      }
    }

    if (header.length < maxColumns) {
      for (let i = header.length; i < maxColumns; i++) {
        header.push(`${generateCellColumn(i + 1)}`);
      }
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

    sheetJSON.push({
      name,
      data: json,
    });
  }

  return sheetJSON;
}
