import JSZIP from "jszip";

export async function getDocumentXML(docxSource: Uint8Array) {
  return JSZIP.loadAsync(docxSource).then(
    (zip) => zip?.file("word/document.xml")?.async("text"),
  );
}
