/**
 * PDF Generator for Docen
 *
 * This file implements a generator for PDF files using the pdf-lib library.
 */

import type {
  ConversionResult,
  Document,
  Generator,
  Image,
  ProcessorOptions,
  Table,
  TableEnhanced,
} from "@docen/core";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFFont, PDFPage } from "pdf-lib";

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
    options?: ProcessorOptions
  ): Promise<ConversionResult> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    let page = pdfDoc.addPage();

    // Get the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

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
        font: fontBold,
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
                  page = pdfDoc.addPage();
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
              font: fontBold,
              color: rgb(0, 0, 0),
            });

            y -= headingFontSize * 1.5;
            break;
          }

          case "equation": {
            // Simple handling: render equation as italic text
            const equationText = `${node.content} (${node.format})`;
            page.drawText(equationText, {
              x,
              y,
              size: fontSize,
              font: fontItalic,
              color: rgb(0, 0, 0.7),
            });
            y -= lineHeight * 1.5;
            break;
          }

          case "chart": {
            // Simple handling: add chart type text
            page.drawText(`[Chart: ${node.chartType}]`, {
              x,
              y,
              size: fontSize,
              font,
              color: rgb(0, 0.5, 0),
            });
            y -= lineHeight * 3;
            break;
          }

          case "table": {
            // Process tables, including regular and enhanced tables
            const newY = this.drawTable(
              pdfDoc,
              page,
              node,
              x,
              y,
              font,
              fontSize
            );
            y = newY;
            break;
          }

          case "image": {
            // Process images
            try {
              const newY = await this.drawImage(pdfDoc, page, node, x, y);
              y = newY;
            } catch (error) {
              console.error("Error drawing image:", error);
              y -= lineHeight * 2;
            }
            break;
          }

          default:
            // Skip unsupported node types
            break;
        }

        // Check if we need a new page
        if (y < 50) {
          // Add a new page
          page = pdfDoc.addPage();
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

  /**
   * Draw a table on the page
   *
   * @param pdfDoc The PDF document
   * @param initialPage The initial PDF page
   * @param tableNode The table node (basic or enhanced)
   * @param startX The x position
   * @param startY The y position
   * @param font The font to use
   * @param fontSize The font size
   * @returns The new y position after drawing the table
   */
  private drawTable(
    pdfDoc: PDFDocument,
    initialPage: PDFPage,
    tableNode: Table | TableEnhanced,
    startX: number,
    startY: number,
    font: PDFFont,
    fontSize: number
  ): number {
    // Table padding and cell dimensions
    const cellPadding = 5;
    const cellHeight = fontSize * 1.5;
    const tableWidth = initialPage.getWidth() - 100;

    // Current position
    let x = startX;
    let y = startY;

    // Current page
    let currentPage = initialPage;

    // Determine number of columns (based on first row or header cells)
    let columnCount = 0;
    if (
      "header" in tableNode &&
      tableNode.header &&
      tableNode.header.rows.length > 0
    ) {
      // Enhanced table, get column count from header
      columnCount = tableNode.header.rows[0].children.length;
    } else if (tableNode.children.length > 0) {
      // Regular table, get column count from first row
      columnCount = tableNode.children[0].children.length;
    }

    if (columnCount === 0) {
      return startY - cellHeight; // Empty table, leave only one row space
    }

    // Calculate column width
    const columnWidth = tableWidth / columnCount;

    // Draw header (if table is enhanced)
    if ("header" in tableNode && tableNode.header) {
      const headerRows = tableNode.header.rows;
      for (const row of headerRows) {
        // Draw header cell backgrounds
        for (let i = 0; i < row.children.length; i++) {
          currentPage.drawRectangle({
            x: x + i * columnWidth,
            y: y - cellHeight,
            width: columnWidth,
            height: cellHeight,
            color: rgb(0.9, 0.9, 0.9),
            borderColor: rgb(0.5, 0.5, 0.5),
            borderWidth: 1,
          });
        }

        // Draw header cell text
        for (let i = 0; i < row.children.length; i++) {
          const cell = row.children[i];
          const cellText = cell.children
            .filter((child) => child.type === "text")
            .map((child) => (child.type === "text" ? child.value : ""))
            .join(" ");

          currentPage.drawText(cellText, {
            x: x + i * columnWidth + cellPadding,
            y: y - cellHeight + cellPadding,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
        }

        // Move to next row
        y -= cellHeight;
      }
    }

    // Draw table body
    for (const row of tableNode.children) {
      // If page has insufficient space, add new page
      if (y < 50 + cellHeight) {
        const newPage = pdfDoc.addPage();
        y = newPage.getHeight() - 50;
        x = startX;
        currentPage = newPage;
      }

      // Draw cell borders
      for (let i = 0; i < row.children.length; i++) {
        currentPage.drawRectangle({
          x: x + i * columnWidth,
          y: y - cellHeight,
          width: columnWidth,
          height: cellHeight,
          borderColor: rgb(0.5, 0.5, 0.5),
          borderWidth: 1,
        });
      }

      // Draw cell text
      for (let i = 0; i < row.children.length; i++) {
        const cell = row.children[i];
        const cellText = cell.children
          .filter((child) => child.type === "text")
          .map((child) => (child.type === "text" ? child.value : ""))
          .join(" ");

        currentPage.drawText(cellText, {
          x: x + i * columnWidth + cellPadding,
          y: y - cellHeight + cellPadding,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      }

      // Move to next row
      y -= cellHeight;
    }

    // Add extra space after table
    return y - cellHeight;
  }

  /**
   * Draw an image on the page
   *
   * @param pdfDoc The PDF document
   * @param page The PDF page
   * @param imageNode The image node
   * @param startX The x position
   * @param startY The y position
   * @returns The new y position after drawing the image
   */
  private async drawImage(
    pdfDoc: PDFDocument,
    page: PDFPage,
    imageNode: Image,
    startX: number,
    startY: number
  ): Promise<number> {
    // If URL is a data URI, extract image data directly
    if (imageNode.url.startsWith("data:image/")) {
      const imageType = imageNode.url.split(";")[0].split("/")[1];
      const base64Data = imageNode.url.split(",")[1];
      const imageBytes = Buffer.from(base64Data, "base64");

      // Embed image
      const pdfImage = (() => {
        if (imageType === "png") {
          return pdfDoc.embedPng(imageBytes);
        }
        if (imageType === "jpeg" || imageType === "jpg") {
          return pdfDoc.embedJpg(imageBytes);
        }
        return null;
      })();

      // If cannot embed image, show placeholder text
      if (!pdfImage) {
        page.drawText(`[Image: ${imageNode.alt || "Unsupported format"}]`, {
          x: startX,
          y: startY,
          size: 12,
          color: rgb(0.5, 0, 0),
        });
        return startY - 20;
      }

      // Calculate image dimensions, controlling maximum width
      const maxWidth = page.getWidth() - 100;
      const embeddedImage = await pdfImage;
      const imgWidth = Math.min(embeddedImage.width, maxWidth);
      const imgHeight = (embeddedImage.height * imgWidth) / embeddedImage.width;

      // Draw image
      page.drawImage(embeddedImage, {
        x: startX,
        y: startY - imgHeight,
        width: imgWidth,
        height: imgHeight,
      });

      // Add image caption (if alt text exists)
      if (imageNode.alt) {
        page.drawText(imageNode.alt, {
          x: startX,
          y: startY - imgHeight - 15,
          size: 10,
          color: rgb(0.3, 0.3, 0.3),
        });
        return startY - imgHeight - 30;
      }

      return startY - imgHeight - 10;
    }

    // External URL, show placeholder text
    page.drawText(`[External image: ${imageNode.alt || imageNode.url}]`, {
      x: startX,
      y: startY,
      size: 12,
      color: rgb(0, 0, 0.5),
    });
    return startY - 20;
  }
}
