import JSZIP from "jszip";
import { type DataType, toUint8Array } from "undio";

export async function getStylesXML(source: DataType) {
  return JSZIP.loadAsync(toUint8Array(source)).then((zip) =>
    zip?.file("xl/styles.xml")?.async("text")
  );
}

export async function replaceStylesXML(source: DataType, target: Uint8Array) {
  const sourceStyles = await getStylesXML(source);

  const targetZip = await JSZIP.loadAsync(target);

  if (sourceStyles) {
    targetZip.file("xl/styles.xml", sourceStyles);
  }

  return targetZip.generateAsync({ type: "uint8array" });
}

export async function getWorksheetsXML(source: DataType) {
  const files = (await JSZIP.loadAsync(toUint8Array(source)))?.files;

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

  return worksheets;
}

export async function getSharedStringsXML(source: DataType) {
  return JSZIP.loadAsync(toUint8Array(source)).then((zip) =>
    zip?.file("xl/sharedStrings.xml")?.async("text")
  );
}
