import JSZIP from "jszip";

export async function getDocumentXML(docxSource: Uint8Array) {
  return JSZIP.loadAsync(docxSource).then((zip) =>
    zip?.file("word/document.xml")?.async("text")
  );
}

export async function getStylesXML(docxSource: Uint8Array) {
  return JSZIP.loadAsync(docxSource).then((zip) =>
    zip?.file("word/styles.xml")?.async("text")
  );
}

export async function replaceStylesXML(
  docxSource: Uint8Array,
  docxTarget: Uint8Array
) {
  const sourceStyles = await getStylesXML(docxSource);

  const targetZip = await JSZIP.loadAsync(docxTarget);

  if (sourceStyles) {
    targetZip.file("word/styles.xml", sourceStyles);
  }

  return targetZip.generateAsync({ type: "uint8array" });
}
