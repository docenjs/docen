import { writeFile } from "node:fs/promises";
import { Parser } from "htmlparser2";
import JSZip from "jszip";
import { type DataType, toArrayBuffer, toUint8Array } from "undio";
import type {
  ConversionOptions,
  DocumentMetadata,
  FormatProcessor,
} from "../../types";

/**
 * DOCX document processor
 */
export class DOCXProcessor implements FormatProcessor {
  sourceFormats = ["docx"];
  targetFormats = ["docx", "txt"];

  /**
   * Convert DOCX to target format
   */
  async convert(
    source: DataType,
    target: string,
    options?: ConversionOptions,
  ): Promise<void> {
    const sourceBuffer = await toArrayBuffer(source);
    const targetFormat = target.split(".").pop()?.toLowerCase();

    switch (targetFormat) {
      case "docx": {
        // DOCX to DOCX (optimization, cleanup, etc.)
        await writeFile(target, Buffer.from(sourceBuffer));
        break;
      }
      case "txt": {
        // DOCX to text
        const text = await this.extractText(source, options);
        await writeFile(target, text);
        break;
      }
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`);
    }
  }

  /**
   * Extract text from DOCX
   */
  async extractText(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<string> {
    const documentXML = await this.getDocumentXML(source);

    if (!documentXML) {
      throw new Error("Document XML not found");
    }

    let text = "";
    let isText = false;

    const document = new Parser({
      onopentag: (name) => {
        if (name === "w:t") {
          isText = true;
        }
      },
      ontext: (string) => {
        if (isText && string) {
          text += string;
        }
      },
      onclosetag: (name) => {
        if (name === "w:t") {
          isText = false;
        }

        if (name === "w:p") {
          text += "\n";
        }
      },
    });

    document.write(documentXML);
    document.end();

    return text;
  }

  /**
   * Get DOCX metadata
   */
  async getMetadata(
    source: DataType,
    options?: ConversionOptions,
  ): Promise<DocumentMetadata> {
    return {
      createdAt: new Date(),
      modifiedAt: new Date(),
    };
  }

  /**
   * Get document.xml content from DOCX file
   */
  private async getDocumentXML(source: DataType): Promise<string | undefined> {
    const zip = new JSZip();
    await zip.loadAsync(toUint8Array(source));

    const file = zip.file("word/document.xml");
    if (!file) return undefined;

    return file.async("string");
  }
}
