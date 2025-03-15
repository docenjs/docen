/**
 * PDF parser for Docen
 *
 * This file implements a parser for PDF files using the unpdf library.
 */

import type {
  Document,
  Metadata,
  Paragraph,
  Parser,
  ProcessorOptions,
  Root,
  Source,
  Text,
} from "@docen/core";
import { toArrayBuffer, toUint8Array } from "@docen/core";
import { extractText as extractPdfText, getMeta } from "unpdf";

/**
 * PDF Parser implementation
 */
export class PDFParser implements Parser {
  id = "pdf-parser";
  name = "PDF Parser";
  supportedInputTypes = ["application/pdf"];
  supportedOutputTypes: string[] = [];
  supportedInputExtensions = ["pdf"];
  supportedOutputExtensions: string[] = [];

  /**
   * Check if this parser can handle the given source
   *
   * @param source The source to check
   * @param mimeType Optional MIME type hint
   * @param extension Optional file extension hint
   * @returns True if this parser can handle the source
   */
  async canParse(
    source: Source,
    mimeType?: string,
    extension?: string,
  ): Promise<boolean> {
    // Check if the MIME type or extension is supported
    if (mimeType && this.supportedInputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedInputExtensions.includes(extension)) {
      return true;
    }

    // If no hints are provided, try to detect the format
    try {
      // Convert source to Uint8Array for header checking
      const buffer = toArrayBuffer(source);
      const uint8Array = new Uint8Array(buffer);

      // Check for PDF signature (%PDF-)
      if (
        uint8Array.length >= 5 &&
        uint8Array[0] === 0x25 && // %
        uint8Array[1] === 0x50 && // P
        uint8Array[2] === 0x44 && // D
        uint8Array[3] === 0x46 && // F
        uint8Array[4] === 0x2d
      ) {
        // -
        return true;
      }
    } catch (error) {
      // If we can't check the header, return false
      return false;
    }

    return false;
  }

  /**
   * Parse PDF data into a document AST
   *
   * @param source The source data to parse
   * @param options Parsing options
   * @returns Parsed document
   */
  async parse(source: Source, options?: ProcessorOptions): Promise<Document> {
    // Convert source to Uint8Array
    const uint8Array = toUint8Array(source);

    // Create empty document structure
    const document: Document = {
      metadata: {},
      content: {
        type: "root",
        children: [],
      },
    };

    // Extract metadata if requested
    if (options?.extractMetadata) {
      try {
        const metaResult = await getMeta(uint8Array);

        // Convert PDF metadata to Docen metadata format
        const metadata: Metadata = {};

        if (metaResult.info) {
          // Map common PDF info fields to Docen metadata
          if (metaResult.info.Title)
            metadata.title = String(metaResult.info.Title);
          if (metaResult.info.Author)
            metadata.authors = [String(metaResult.info.Author)];
          if (metaResult.info.Subject)
            metadata.description = String(metaResult.info.Subject);
          if (metaResult.info.Keywords) {
            metadata.keywords = String(metaResult.info.Keywords)
              .split(/[,;]\s*/)
              .filter(Boolean);
          }
          if (metaResult.info.CreationDate) {
            try {
              // PDF dates are in format: D:YYYYMMDDHHmmSSOHH'mm'
              const dateStr = String(metaResult.info.CreationDate);
              if (dateStr.startsWith("D:")) {
                const year = Number.parseInt(dateStr.substring(2, 6));
                const month = Number.parseInt(dateStr.substring(6, 8)) - 1; // 0-based month
                const day = Number.parseInt(dateStr.substring(8, 10));
                metadata.created = new Date(year, month, day);
              }
            } catch (e) {
              // Ignore date parsing errors
            }
          }
          if (metaResult.info.ModDate) {
            try {
              const dateStr = String(metaResult.info.ModDate);
              if (dateStr.startsWith("D:")) {
                const year = Number.parseInt(dateStr.substring(2, 6));
                const month = Number.parseInt(dateStr.substring(6, 8)) - 1; // 0-based month
                const day = Number.parseInt(dateStr.substring(8, 10));
                metadata.modified = new Date(year, month, day);
              }
            } catch (e) {
              // Ignore date parsing errors
            }
          }

          // Add all other metadata fields as-is
          for (const [key, value] of Object.entries(metaResult.info)) {
            if (
              ![
                "Title",
                "Author",
                "Subject",
                "Keywords",
                "CreationDate",
                "ModDate",
              ].includes(key)
            ) {
              metadata[key] = value;
            }
          }
        }

        // Add metadata from XMP if available
        if (metaResult.metadata) {
          for (const [key, value] of Object.entries(metaResult.metadata)) {
            if (!(key in metadata)) {
              metadata[key] = value;
            }
          }
        }

        document.metadata = metadata;
      } catch (error) {
        // If metadata extraction fails, continue with empty metadata
        console.error("Failed to extract PDF metadata:", error);
      }
    }

    // Extract text content
    try {
      const { text, totalPages } = await extractPdfText(uint8Array, {
        mergePages: false,
      });

      // Store total pages in metadata
      document.metadata.pageCount = totalPages;

      // Convert extracted text to AST
      // Each page becomes a series of paragraphs
      // text is always an array of strings (one per page)
      const root: Root = {
        type: "root",
        children: [],
      };

      // Process each page
      for (let i = 0; i < text.length; i++) {
        const pageContent = text[i];

        // Split page content into paragraphs
        const paragraphs = pageContent
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((paragraphText) => {
            // Create paragraph node
            const paragraph: Paragraph = {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: paragraphText.trim(),
                } as Text,
              ],
            };

            return paragraph;
          });

        // Add paragraphs to root
        root.children.push(...paragraphs);
      }

      document.content = root;
    } catch (error) {
      console.error("Failed to extract PDF text:", error);
      // Create empty content if text extraction fails
      document.content = {
        type: "root",
        children: [],
      };
    }

    return document;
  }
}
