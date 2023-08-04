import { convertToHtml, extractRawText } from "mammoth";

export async function extractTextFromDocx(
  docxSource: string | URL | Buffer | ArrayBuffer,
) {
  let result = { value: "" };

  switch (typeof docxSource) {
    case "string":
      result = await extractRawText({ path: docxSource });
    case "object":
      if (docxSource instanceof URL) {
        result = await extractRawText({ path: docxSource.href });
      } else if (docxSource instanceof Buffer) {
        result = await extractRawText({ buffer: docxSource });
      } else if (docxSource instanceof ArrayBuffer) {
        result = await extractRawText({ arrayBuffer: docxSource });
      }
      break;
  }

  return result.value;
}

export async function convertDocxToHtml(
  docxSource: string | URL | Buffer | ArrayBuffer,
) {
  let result = { value: "" };

  switch (typeof docxSource) {
    case "string":
      result = await convertToHtml({ path: docxSource });
    case "object":
      if (docxSource instanceof URL) {
        result = await convertToHtml({ path: docxSource.href });
      } else if (docxSource instanceof Buffer) {
        result = await convertToHtml({ buffer: docxSource });
      } else if (docxSource instanceof ArrayBuffer) {
        result = await convertToHtml({ arrayBuffer: docxSource });
      }
      break;
  }

  return result.value;
}
