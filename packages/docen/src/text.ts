import { extractTextFromDocx } from "@docen/docx";
import { extractTextFromPDF } from "@docen/pdf";
import { detectFileType } from "./utils";

export async function extractText(
  source: Uint8Array,
  options?: {
    sourceType?: string;
  }
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
      text = Buffer.from(source).toString();
      break;
    default:
      throw new Error("Unsupported file type");
  }

  return text;
}
