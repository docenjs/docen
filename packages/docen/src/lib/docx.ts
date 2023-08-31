import { convertToHtml, extractRawText } from "mammoth";

export async function extractTextFromDocx(docxSource: ArrayBuffer) {
  if (typeof window !== "undefined") {
    return (await extractRawText({ arrayBuffer: docxSource })).value;
  } else {
    const source = Buffer.from(docxSource);

    return (await extractRawText({ buffer: source })).value;
  }
}

export async function convertDocxToHtml(docxSource: ArrayBuffer) {
  if (typeof window !== "undefined") {
    return (await convertToHtml({ arrayBuffer: docxSource })).value;
  } else {
    const source = Buffer.from(docxSource);

    return (await convertToHtml({ buffer: source })).value;
  }
}
