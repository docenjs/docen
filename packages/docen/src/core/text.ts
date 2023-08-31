import { extractTextFromDocx, extractTextFromPDF } from "../lib";
import { detectFileType } from "../utils";
import { readFileSync } from "fs";

export async function extractText(source: ArrayBuffer) {
  const fileType = await detectFileType(source);

  let text: string;
  switch (fileType?.ext) {
    case "docx":
      text = await extractTextFromDocx(source);
      break;
    case "pdf":
      text = await extractTextFromPDF(source);
      break;
    case "txt":
      text = source.toString();
      break;
    default:
      throw new Error("Unsupported file type");
  }

  return text;
}
