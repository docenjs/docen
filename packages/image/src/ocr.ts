import { imageMeta } from "image-meta";
import { createWorker } from "tesseract.js";
import { type DataType, toArrayBuffer, toUint8Array } from "undio";

export async function convertImageToText(
  source: DataType,
  options?: {
    // https://tesseract-ocr.github.io/tessdoc/Data-Files
    lang?: string | string[];
  }
) {
  const { type } = imageMeta(toUint8Array(source));

  // bmp、jpg、png、pbm、webp
  const isImageType =
    type && ["bmp", "jpg", "png", "pbm", "webp"].includes(type);

  if (isImageType) {
    const worker = await createWorker(options?.lang);

    const {
      data: { text },
    } = await worker.recognize(toArrayBuffer(source));

    await worker.terminate();

    return text;
  }

  throw new Error("Unsupported image type");
}
