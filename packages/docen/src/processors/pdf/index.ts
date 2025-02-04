import { writeFile } from "node:fs/promises";
import { type DataType, toArrayBuffer, toUint8Array } from "undio";
import { getResolvedPDFJS } from "unpdf";
import type { TextItem } from "unpdf/dist/types/src/display/api";
import type {
  ConversionOptions,
  DocumentMetadata,
  FormatProcessor,
} from "../../types";

/**
 * PDF document processor
 */
export class PDFProcessor implements FormatProcessor {
  sourceFormats = ["pdf"];
  targetFormats = ["pdf", "txt"];

  /**
   * Convert PDF to target format
   */
  async convert(
    source: DataType,
    target: string,
    options?: ConversionOptions,
  ): Promise<void> {
    const sourceBuffer = await toArrayBuffer(source);
    const targetFormat = target.split(".").pop()?.toLowerCase();

    switch (targetFormat) {
      case "pdf": {
        // PDF to PDF (optimization, compression, etc.)
        await writeFile(target, Buffer.from(sourceBuffer));
        break;
      }
      case "txt": {
        // PDF to text
        const text = await this.extractText(source, options);
        await writeFile(target, text);
        break;
      }
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }

  /**
   * Extract text from PDF
   */
  async extractText(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<string> {
    // Load a PDF document
    const { getDocument } = await getResolvedPDFJS();
    const loadingTask = getDocument(Uint8Array.from(toUint8Array(source)));
    const pdf = await loadingTask.promise;

    // Get the number of pages
    const numPages = pdf.numPages;

    // Get text-fragments
    let lastY = 0;
    let text = "";

    const pages =
      options?.pages ?? Array.from({ length: numPages }, (_, i) => i + 1);

    for (let i = 1; i <= pages.length; i++) {
      const page = await pdf.getPage(pages[i - 1]);
      const textContent = await page.getTextContent();
      // Content contains lots of information about the text layout and
      // styles, but we need only strings at the moment
      for (const item of textContent.items as TextItem[]) {
        if (lastY === item.transform[5] || !lastY) {
          text += item.str;
        } else {
          text += `\n${item.str}`;
        }
        lastY = item.transform[5];
      }
    }

    return text;
  }

  /**
   * Get PDF metadata
   */
  async getMetadata(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<DocumentMetadata> {
    const { getDocument } = await getResolvedPDFJS();
    const loadingTask = getDocument(Uint8Array.from(toUint8Array(source)));
    const pdf = await loadingTask.promise;

    return {
      pageCount: pdf.numPages,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
  }
}
