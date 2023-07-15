import { extractTextFromDocx, extractTextFromPDF } from "../lib";
import { detectFileType } from "../utils";
import { readFileSync } from "fs";

export async function extractText(source: string | ArrayBuffer) {
  const fileType = await detectFileType(source);

  let text;
  switch (fileType?.ext) {
    case "docx":
      text = await extractTextFromDocx(source);
      break;
    case "pdf":
      text = await extractTextFromPDF(source);
      break;
    case "txt":
      switch (typeof source) {
        case "string":
          text = readFileSync(source, "utf-8");
          break;
        case "object":
          text = Buffer.from(source).toString("utf-8");
          break;
      }
      break;
    default:
      throw new Error("Unsupported file type");
  }

  return text;
}
