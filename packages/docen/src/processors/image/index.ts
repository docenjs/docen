import { writeFile } from "node:fs/promises";
import { imageMeta } from "image-meta";
import { createWorker } from "tesseract.js";
import { type DataType, toArrayBuffer, toUint8Array } from "undio";
import type {
  ConversionOptions,
  DocumentMetadata,
  FormatProcessor,
  ImageMetadata,
} from "../../types";

/**
 * Image processor
 */
export class ImageProcessor implements FormatProcessor {
  sourceFormats = ["bmp", "jpg", "jpeg", "png", "pbm", "webp"];
  targetFormats = ["txt"];

  /**
   * Convert image to target format
   */
  async convert(
    source: DataType,
    target: string,
    options?: ConversionOptions,
  ): Promise<void> {
    const targetFormat = target.split(".").pop()?.toLowerCase();

    switch (targetFormat) {
      case "txt": {
        // Image to text (OCR)
        const text = await this.extractText(source, options);
        await writeFile(target, text);
        break;
      }
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }

  /**
   * Extract text from image using OCR
   */
  async extractText(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<string> {
    const { type } = imageMeta(toUint8Array(source));

    // Check if image type is supported
    const isImageType =
      type && ["bmp", "jpg", "png", "pbm", "webp"].includes(type);
    if (!isImageType) {
      throw new Error("Unsupported image type");
    }

    // Create Tesseract worker
    const worker = await createWorker(options?.language);

    try {
      // Perform OCR
      const {
        data: { text },
      } = await worker.recognize(toArrayBuffer(source));
      return text;
    } finally {
      await worker.terminate();
    }
  }

  /**
   * Get image metadata
   */
  async getMetadata(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<DocumentMetadata> {
    const meta = imageMeta(toUint8Array(source));
    const metadata: ImageMetadata = {
      width: meta.width,
      height: meta.height,
      format: meta.type,
    };

    return {
      createdAt: new Date(),
      modifiedAt: new Date(),
      image: metadata,
    };
  }
}
