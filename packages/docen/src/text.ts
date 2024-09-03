import { extractTextFromDocx } from "@docen/docx";
import { extractTextFromPDF } from "@docen/pdf";
import { type DataType, toArrayBuffer, toText } from "undio";
import { detectFileType } from "./utils";

export async function extractText(
  source: DataType,
  options?: {
    sourceType?: string;
  },
) {
  let text: string;

  const fileType =
    options?.sourceType ?? (await detectFileType(toArrayBuffer(source))).ext;

  switch (fileType) {
    case "docx":
      text = await extractTextFromDocx(source);
      break;
    case "pdf":
      text = await extractTextFromPDF(source);
      break;
    case "txt":
      text = toText(source);
      break;
    default:
      throw new Error("Unsupported file type");
  }

  return text;
}
