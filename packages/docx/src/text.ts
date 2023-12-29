import { Parser } from "htmlparser2";
import { getDocumentXML } from "./document";

export async function extractTextFromDocx(docxSource: Uint8Array) {
  const documentXML = await getDocumentXML(docxSource);

  let text = "";

  if (!documentXML) {
    throw new Error("Document XML not found");
  }

  let isText = false;

  const document = new Parser({
    onopentag: (name) => {
      if (name === "w:t") {
        isText = true;
      }
    },
    ontext: (string) => {
      if (isText) {
        text += `${string}`;
      }
    },
    onclosetag: (name) => {
      if (name === "w:t") {
        isText = false;
      }

      if (name === "w:p") {
        text += "\n";
      }
    },
  });

  document.write(documentXML);

  return text;
}
