import { extractTextFromDocx, extractTextFromPDF } from "../lib";
import { detectFileType } from "../utils";

export async function extractText(
  source: ArrayBuffer,
  options?: {
    sourceType?: string;
  },
) {
  let text: string;

  const fileType = options?.sourceType ?? (await detectFileType(source)).ext;

  switch (fileType) {
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
