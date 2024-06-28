import { Parser } from "htmlparser2";
import { type DataType, toUint8Array } from "undio";
import { getDocumentXML } from "./document";

export async function extractTextFromDocx(source: DataType) {
  const documentXML = await getDocumentXML(source);

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
      if (isText && string) {
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

  document.end();

  return text;
}
