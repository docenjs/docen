import { convertToHtml, extractRawText } from "mammoth";

export async function extractTextFromDocx(docxSource: ArrayBuffer) {
  const source = Buffer.from(docxSource);

  return (await extractRawText({ buffer: source })).value;
}

export async function convertDocxToHtml(docxSource: ArrayBuffer) {
  const source = Buffer.from(docxSource);

  return (await convertToHtml({ buffer: source })).value;
}
