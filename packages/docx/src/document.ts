import JSZIP from "jszip";
import { type DataType, toUint8Array } from "undio";

export async function getDocumentXML(source: DataType) {
  return JSZIP.loadAsync(toUint8Array(source)).then((zip) =>
    zip?.file("word/document.xml")?.async("text"),
  );
}

export async function getStylesXML(source: DataType) {
  return JSZIP.loadAsync(toUint8Array(source)).then((zip) =>
    zip?.file("word/styles.xml")?.async("text"),
  );
}

export async function replaceStylesXML(source: DataType, target: Uint8Array) {
  const sourceStyles = await getStylesXML(toUint8Array(source));

  const targetZip = await JSZIP.loadAsync(target);

  if (sourceStyles) {
    targetZip.file("word/styles.xml", sourceStyles);
  }

  return targetZip.generateAsync({ type: "uint8array" });
}
