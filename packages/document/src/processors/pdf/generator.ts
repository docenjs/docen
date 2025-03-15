/**
 * PDF Generator for Docen
 *
 * This file implements a generator for PDF files using the pdf-lib library.
 */

import type {
  ConversionResult,
  Document,
  Generator,
  ProcessorOptions,
} from "@docen/core";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * PDF Generator implementation
 */
export class PDFGenerator implements Generator {
  id = "pdf-generator";
  name = "PDF Generator";
  supportedInputTypes: string[] = [];
  supportedOutputTypes = ["application/pdf"];
  supportedInputExtensions: string[] = [];
  supportedOutputExtensions = ["pdf"];

  /**
   * Check if this generator can produce the requested output format
   *
   * @param mimeType Target MIME type
   * @param extension Target file extension
   * @returns True if this generator can produce the requested format
   */
  canGenerate(mimeType?: string, extension?: string): boolean {
    if (mimeType && this.supportedOutputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedOutputExtensions.includes(extension)) {
      return true;
    }

    return false;
  }

  /**
   * Generate PDF output from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated PDF content
   */
  async generate(
    document: Document,
    options?: ProcessorOptions,
  ): Promise<ConversionResult> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    let page = pdfDoc.addPage();

    // Get the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Set font size and line height
    const fontSize = 12;
    const lineHeight = fontSize * 1.2;

    // Set initial position
    const x = 50;
    let y = page.getHeight() - 50;

    // Add title if available
    if (document.metadata.title) {
      const titleFontSize = 24;
      const title = String(document.metadata.title);
      page.drawText(title, {
        x,
        y,
        size: titleFontSize,
        font,
        color: rgb(0, 0, 0),
      });

      y -= titleFontSize * 2;
    }

    // Process content
    if (document.content?.children) {
      for (const node of document.content.children) {
        switch (node.type) {
          case "paragraph": {
            // Join all text nodes in the paragraph
            const text = node.children
              .filter((child) => child.type === "text")
              .map((child) => (child.type === "text" ? child.value : ""))
              .join(" ");

            // Simple text wrapping (basic implementation)
            const words = text.split(" ");
            let line = "";
            const maxWidth = page.getWidth() - 100; // margins on both sides

            for (const word of words) {
              const testLine = line + (line ? " " : "") + word;
              const testWidth = font.widthOfTextAtSize(testLine, fontSize);

              if (testWidth > maxWidth) {
                // Draw the current line
                page.drawText(line, {
                  x,
                  y,
                  size: fontSize,
                  font,
                  color: rgb(0, 0, 0),
                });

                // Move to next line
                y -= lineHeight;
                line = word;

                // Check if we need a new page
                if (y < 50) {
                  // Add a new page
                  const newPage = pdfDoc.addPage();
                  page = newPage;
                  y = page.getHeight() - 50;
                }
              } else {
                line = testLine;
              }
            }

            // Draw the last line
            if (line) {
              page.drawText(line, {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(0, 0, 0),
              });
              y -= lineHeight * 1.5; // Extra space after paragraph
            }
            break;
          }

          case "heading": {
            // Calculate font size based on heading level
            const headingFontSize = fontSize + (6 - (node.depth || 1)) * 4;

            // Join all text nodes in the heading
            const headingText = node.children
              .filter((child) => child.type === "text")
              .map((child) => (child.type === "text" ? child.value : ""))
              .join(" ");

            // Draw the heading
            page.drawText(headingText, {
              x,
              y,
              size: headingFontSize,
              font,
              color: rgb(0, 0, 0),
            });

            y -= headingFontSize * 1.5;
            break;
          }

          // Add more node types as needed

          default:
            // Skip unsupported node types
            break;
        }

        // Check if we need a new page
        if (y < 50) {
          // Add a new page
          const newPage = pdfDoc.addPage();
          page = newPage;
          y = page.getHeight() - 50;
        }
      }
    }

    // Serialize the PDF document to bytes
    const pdfBytes = await pdfDoc.save();

    return {
      content: pdfBytes,
      mimeType: "application/pdf",
      extension: "pdf",
    };
  }
}
