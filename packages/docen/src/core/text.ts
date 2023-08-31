import { extractTextFromDocx, extractTextFromPDF } from "../lib";

export async function extractText(
  source: ArrayBuffer,
  options: { fileType: string }
) {
  let text: string;
  switch (options.fileType) {
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
