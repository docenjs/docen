import { Parser } from "htmlparser2";
import JSZIP from "jszip";
import { type DataType, toUint8Array } from "undio";
import { parseCellPosition } from "./utils";

export async function parseSheets(source: DataType) {
  const xlsxSource = await JSZIP.loadAsync(toUint8Array(source));
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

  const sheets = [];

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

          const { row, column } = parseCellPosition(currentCell) as {
            row: number;
            column: number;
          };

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
