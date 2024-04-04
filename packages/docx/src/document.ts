import JSZIP from "jszip";

export async function getDocumentXML(source: Uint8Array) {
  return JSZIP.loadAsync(source).then((zip) =>
    zip?.file("word/document.xml")?.async("text"),
  );
}

export async function getStylesXML(source: Uint8Array) {
  return JSZIP.loadAsync(source).then((zip) =>
    zip?.file("word/styles.xml")?.async("text"),
  );
}

export async function replaceStylesXML(source: Uint8Array, target: Uint8Array) {
  const sourceStyles = await getStylesXML(source);

  const targetZip = await JSZIP.loadAsync(target);

  if (sourceStyles) {
    targetZip.file("word/styles.xml", sourceStyles);
  }

  return targetZip.generateAsync({ type: "uint8array" });
}
