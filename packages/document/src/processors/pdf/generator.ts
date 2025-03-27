/**
 * PDF Generator for Docen
 *
 * This file implements a generator for PDF files using the pdf-lib library.
 */

import type {
  Content,
  ConversionResult,
  Document,
  Generator,
  Node,
  ProcessorOptions,
  Root,
} from "@docen/core";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Color, PDFFont, PDFPage } from "pdf-lib";

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

    // Get the standard fonts
    const fonts = {
      regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
      bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
      boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
    };

    // Initialize context for PDF generation
    const context: PDFGenerationContext = {
      pdfDoc,
      page: pdfDoc.addPage(),
      fonts,
      fontSize: 12,
      x: 50,
      y: 0,
      fontColor: rgb(0, 0, 0),
      lineHeight: 14,
    };

    // Set initial Y position at the top of the page
    context.y = context.page.getHeight() - 50;

    // Add title if available
    if (document.metadata?.title) {
      const titleFontSize = 24;
      const title = String(document.metadata.title);
      context.page.drawText(title, {
        x: context.x,
        y: context.y,
        size: titleFontSize,
        font: context.fonts.bold,
        color: context.fontColor,
      });

      context.y -= titleFontSize * 2;
    }

    // Process content
    if (document.content) {
      // Root node is not part of Content union, so handle it specially
      await this.processRootNode(document.content, context);
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
   * Generate output for a specific node type
   *
   * @param node The node to generate from
   * @param options Generation options
   * @returns Generated content for the node, or null if the node type is not supported
   */
  async generateFromNode(
    node: Content,
    options?: ProcessorOptions,
  ): Promise<ConversionResult | null> {
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Get the standard fonts
      const fonts = {
        regular: await pdfDoc.embedFont(StandardFonts.Helvetica),
        bold: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
        italic: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
        boldItalic: await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique),
      };

      // Initialize context for PDF generation
      const context: PDFGenerationContext = {
        pdfDoc,
        page: pdfDoc.addPage(),
        fonts,
        fontSize: 12,
        x: 50,
        y: 0,
        fontColor: rgb(0, 0, 0),
        lineHeight: 14,
      };

      // Set initial Y position at the top of the page
      context.y = context.page.getHeight() - 50;

      // Process the node
      await this.processNode(node, context);

      // Serialize the PDF document to bytes
      const pdfBytes = await pdfDoc.save();

      return {
        content: pdfBytes,
        mimeType: "application/pdf",
        extension: "pdf",
      };
    } catch (error) {
      console.error("Error generating PDF from node:", error);
      return null;
    }
  }

  /**
   * Process the root node
   *
   * @param root The root node to process
   * @param context The PDF generation context
   */
  private async processRootNode(
    root: Root,
    context: PDFGenerationContext,
  ): Promise<void> {
    // Process children of the root node
    if (root.children && Array.isArray(root.children)) {
      for (const child of root.children) {
        await this.processNode(child, context);

        // Check if we need a new page after each node
        if (context.y < 50) {
          context.page = context.pdfDoc.addPage();
          context.y = context.page.getHeight() - 50;
          context.x = 50;
        }
      }
    }
  }

  /**
   * Process a node for PDF generation
   *
   * @param node The node to process
   * @param context The PDF generation context
   */
  private async processNode(
    node: Node,
    context: PDFGenerationContext,
  ): Promise<void> {
    if (!node || typeof node !== "object" || !("type" in node)) return;

    const nodeType = node.type;

    // Process node based on its type
    switch (nodeType) {
      case "paragraph":
        await this.generateFromParagraph(
          node as Node & { children: Node[] },
          context,
        );
        break;
      case "heading":
        await this.generateFromHeading(
          node as Node & { depth: number; children: Node[] },
          context,
        );
        break;
      case "image":
      case "inlineImage":
        await this.generateFromImage(
          node as Node & { url: string; alt?: string },
          context,
        );
        break;
      case "list":
        await this.generateFromList(
          node as Node & { children: Node[]; ordered?: boolean },
          context,
        );
        break;
      case "text":
        this.generateFromText(node as Node & { value: string }, context);
        break;
      case "strong":
        await this.generateFromStrong(
          node as Node & { children: Node[] },
          context,
        );
        break;
      case "emphasis":
        await this.generateFromEmphasis(
          node as Node & { children: Node[] },
          context,
        );
        break;
      case "inlineCode":
        this.generateFromInlineCode(node as Node & { value: string }, context);
        break;
      case "code":
        await this.generateFromCode(
          node as Node & { value: string; lang?: string },
          context,
        );
        break;
      case "blockquote":
        await this.generateFromBlockQuote(
          node as Node & { children: Node[] },
          context,
        );
        break;
      case "thematicBreak":
        this.generateFromThematicBreak(node, context);
        break;
      case "break":
        this.generateFromLineBreak(node, context);
        break;
      case "link":
        await this.generateFromLink(
          node as Node & { children: Node[]; url: string },
          context,
        );
        break;
      default:
        await this.handleSpecialNodeTypes(node, context);
        break;
    }
  }

  /**
   * Handle special node types that aren't in the standard Node union
   *
   * @param node The node to handle
   * @param context The PDF generation context
   */
  private async handleSpecialNodeTypes(
    node: Node,
    context: PDFGenerationContext,
  ): Promise<void> {
    // Handle table nodes
    if (node.type === "table" && "children" in node) {
      // Safe cast - if it has type "table" and children, it's a table node
      const tableNode = node as unknown as {
        type: "table";
        children: Node[];
        header?: { rows: Node[] };
      };

      await this.generateFromTable(tableNode, context);
      return;
    }

    // Handle listItem nodes
    if (node.type === "listItem" && "children" in node) {
      // Safe cast for list item
      const listItemNode = node as unknown as {
        type: "listItem";
        children: Node[];
      };

      await this.generateFromListItem(listItemNode, context);
      return;
    }

    // Process children for unknown complex node types
    if (
      "children" in node &&
      Array.isArray((node as unknown as { children: Node[] }).children)
    ) {
      for (const child of (node as unknown as { children: Node[] }).children) {
        await this.processNode(child, context);
      }
    }
    // Handle nodes with direct content like equation
    else if (
      "content" in node &&
      typeof (node as unknown as { content: string }).content === "string"
    ) {
      const content = (node as unknown as { content: string }).content;
      const format =
        "format" in node &&
        typeof (node as unknown as { format: string }).format === "string"
          ? (node as unknown as { format: string }).format
          : "";

      const text = `${content}${format ? ` (${format})` : ""}`;

      context.page.drawText(text, {
        x: context.x,
        y: context.y,
        size: context.fontSize,
        font: context.fonts.italic,
        color: rgb(0, 0, 0.7),
      });
      context.y -= context.lineHeight * 1.5;
    }
    // Handle chart nodes
    else if ("chartType" in node) {
      const chartType =
        typeof (node as unknown as { chartType: string }).chartType === "string"
          ? (node as unknown as { chartType: string }).chartType
          : "unknown";

      context.page.drawText(`[Chart: ${chartType}]`, {
        x: context.x,
        y: context.y,
        size: context.fontSize,
        font: context.fonts.regular,
        color: rgb(0, 0.5, 0),
      });
      context.y -= context.lineHeight * 3;
    }
  }

  /**
   * Generate PDF content from a paragraph node
   *
   * @param paragraph The paragraph node
   * @param context The PDF generation context
   */
  private async generateFromParagraph(
    paragraph: Node & { children: Node[] },
    context: PDFGenerationContext,
  ): Promise<void> {
    // Save original font and size for restoring later
    const originalFont = context.fonts.regular;
    const originalFontSize = context.fontSize;

    // Simple text wrapping
    const paragraphText = this.extractTextFromNode(paragraph);

    const words = paragraphText.split(" ");
    let line = "";
    const maxWidth = context.page.getWidth() - 100;

    for (const word of words) {
      const testLine = line + (line ? " " : "") + word;
      const testWidth = context.fonts.regular.widthOfTextAtSize(
        testLine,
        context.fontSize,
      );

      if (testWidth > maxWidth) {
        // Draw the current line
        context.page.drawText(line, {
          x: context.x,
          y: context.y,
          size: context.fontSize,
          font: context.fonts.regular,
          color: context.fontColor,
        });

        // Move to next line
        context.y -= context.lineHeight;
        line = word;

        // Check if we need a new page
        if (context.y < 50) {
          context.page = context.pdfDoc.addPage();
          context.y = context.page.getHeight() - 50;
        }
      } else {
        line = testLine;
      }
    }

    // Draw the last line
    if (line) {
      context.page.drawText(line, {
        x: context.x,
        y: context.y,
        size: context.fontSize,
        font: context.fonts.regular,
        color: context.fontColor,
      });
      context.y -= context.lineHeight * 1.5; // Extra space after paragraph
    }

    // Process any non-text children that need special handling
    for (const child of paragraph.children) {
      if (child.type !== "text") {
        await this.processNode(child, context);
      }
    }

    // Restore original font and size
    context.fontSize = originalFontSize;
  }

  /**
   * Generate PDF content from a heading node
   *
   * @param heading The heading node
   * @param context The PDF generation context
   */
  private async generateFromHeading(
    heading: Node & { depth: number; children: Node[] },
    context: PDFGenerationContext,
  ): Promise<void> {
    const depth = heading.depth || 1;
    const headingFontSize = context.fontSize + (6 - depth) * 4;
    const headingText = this.extractTextFromNode(heading);

    context.page.drawText(headingText, {
      x: context.x,
      y: context.y,
      size: headingFontSize,
      font: context.fonts.bold,
      color: context.fontColor,
    });

    context.y -= headingFontSize * 1.5;
  }

  /**
   * Generate PDF content from an image node
   *
   * @param image The image node
   * @param context The PDF generation context
   */
  private async generateFromImage(
    image: Node & { url: string; alt?: string },
    context: PDFGenerationContext,
  ): Promise<void> {
    // Handle data URIs
    if (image.url.startsWith("data:image/")) {
      const imageType = image.url.split(";")[0].split("/")[1];
      const base64Data = image.url.split(",")[1];
      const imageBytes = Buffer.from(base64Data, "base64");

      try {
        // Embed image
        const pdfImage = await (async () => {
          if (imageType === "png") {
            return await context.pdfDoc.embedPng(imageBytes);
          }
          if (imageType === "jpeg" || imageType === "jpg") {
            return await context.pdfDoc.embedJpg(imageBytes);
          }
          return null;
        })();

        if (!pdfImage) {
          // Show placeholder for unsupported format
          const altText = image.alt || "Unsupported format";
          context.page.drawText(`[Image: ${altText}]`, {
            x: context.x,
            y: context.y,
            size: context.fontSize,
            font: context.fonts.regular,
            color: rgb(0.5, 0, 0),
          });
          context.y -= context.lineHeight;
          return;
        }

        // Calculate image dimensions, controlling maximum width
        const maxWidth = context.page.getWidth() - 100;
        const imgWidth = Math.min(pdfImage.width, maxWidth);
        const imgHeight = (pdfImage.height * imgWidth) / pdfImage.width;

        // Draw image
        context.page.drawImage(pdfImage, {
          x: context.x,
          y: context.y - imgHeight,
          width: imgWidth,
          height: imgHeight,
        });

        // Add image caption if alt text exists
        if (image.alt) {
          context.y -= imgHeight + 15;
          context.page.drawText(image.alt, {
            x: context.x,
            y: context.y,
            size: context.fontSize - 2,
            font: context.fonts.italic,
            color: rgb(0.3, 0.3, 0.3),
          });
          context.y -= context.lineHeight;
        } else {
          context.y -= imgHeight + context.lineHeight;
        }
      } catch (error) {
        console.error("Error embedding image:", error);
        // Show error placeholder
        context.page.drawText("[Image: Error embedding image]", {
          x: context.x,
          y: context.y,
          size: context.fontSize,
          font: context.fonts.regular,
          color: rgb(0.5, 0, 0),
        });
        context.y -= context.lineHeight;
      }
    } else {
      // External URL placeholder
      const altText = image.alt || image.url;
      context.page.drawText(`[External image: ${altText}]`, {
        x: context.x,
        y: context.y,
        size: context.fontSize,
        font: context.fonts.regular,
        color: rgb(0, 0, 0.5),
      });
      context.y -= context.lineHeight;
    }
  }

  /**
   * Generate PDF content from a table node
   *
   * @param table The table node
   * @param context The PDF generation context
   */
  private async generateFromTable(
    table: { type: "table"; children: Node[]; header?: { rows: Node[] } },
    context: PDFGenerationContext,
  ): Promise<void> {
    // Table padding and cell dimensions
    const cellPadding = 5;
    const cellHeight = context.fontSize * 1.5;
    const tableWidth = context.page.getWidth() - 100;

    // Get all rows
    const rows = table.children;
    if (rows.length === 0) return;

    // Enhanced table has header property
    const hasHeader =
      table.header &&
      "rows" in table.header &&
      Array.isArray(table.header.rows);

    // Get the maximum number of columns
    let maxColumns = 0;

    // Check header rows if available
    if (hasHeader && table.header) {
      const headerRows = table.header.rows;
      for (const row of headerRows) {
        if ("children" in row) {
          const tableRow = row as { children: Node[] };
          if (Array.isArray(tableRow.children)) {
            maxColumns = Math.max(maxColumns, tableRow.children.length);
          }
        }
      }
    }

    // Check body rows
    for (const row of rows) {
      if ("children" in row) {
        const tableRow = row as { children: Node[] };
        if (Array.isArray(tableRow.children)) {
          maxColumns = Math.max(maxColumns, tableRow.children.length);
        }
      }
    }

    if (maxColumns === 0) return;

    // Calculate column width
    const columnWidth = tableWidth / maxColumns;

    // Draw header if available for enhanced tables
    if (hasHeader && table.header) {
      const headerRows = table.header.rows;
      for (const row of headerRows) {
        if ("children" in row) {
          const tableRow = row as { children: Node[] };
          if (Array.isArray(tableRow.children)) {
            // Draw header cell backgrounds
            for (let i = 0; i < maxColumns; i++) {
              context.page.drawRectangle({
                x: context.x + i * columnWidth,
                y: context.y - cellHeight,
                width: columnWidth,
                height: cellHeight,
                color: rgb(0.9, 0.9, 0.9),
                borderColor: rgb(0.5, 0.5, 0.5),
                borderWidth: 1,
              });
            }

            // Draw header cell text
            for (let i = 0; i < tableRow.children.length; i++) {
              const cell = tableRow.children[i];
              if ("children" in cell) {
                const tableCell = cell as { children: Node[] };
                if (Array.isArray(tableCell.children)) {
                  const cellText = this.extractTextFromNode(cell);
                  context.page.drawText(cellText, {
                    x: context.x + i * columnWidth + cellPadding,
                    y: context.y - cellHeight + cellPadding,
                    size: context.fontSize,
                    font: context.fonts.bold,
                    color: context.fontColor,
                  });
                }
              }
            }

            // Move to next row
            context.y -= cellHeight;

            // Check if we need a new page
            if (context.y < 50) {
              context.page = context.pdfDoc.addPage();
              context.y = context.page.getHeight() - 50;
            }
          }
        }
      }
    }

    // Draw table body
    for (const row of rows) {
      if ("children" in row) {
        const tableRow = row as { children: Node[] };
        if (Array.isArray(tableRow.children)) {
          // Check if we need a new page
          if (context.y < 50 + cellHeight) {
            context.page = context.pdfDoc.addPage();
            context.y = context.page.getHeight() - 50;
          }

          // Draw cell borders
          for (let i = 0; i < maxColumns; i++) {
            context.page.drawRectangle({
              x: context.x + i * columnWidth,
              y: context.y - cellHeight,
              width: columnWidth,
              height: cellHeight,
              borderColor: rgb(0.5, 0.5, 0.5),
              borderWidth: 1,
            });
          }

          // Draw cell text
          for (let i = 0; i < tableRow.children.length; i++) {
            const cell = tableRow.children[i];
            if ("children" in cell) {
              const tableCell = cell as { children: Node[] };
              if (Array.isArray(tableCell.children)) {
                const cellText = this.extractTextFromNode(cell);
                context.page.drawText(cellText, {
                  x: context.x + i * columnWidth + cellPadding,
                  y: context.y - cellHeight + cellPadding,
                  size: context.fontSize,
                  font: context.fonts.regular,
                  color: context.fontColor,
                });
              }
            }
          }

          // Move to next row
          context.y -= cellHeight;
        }
      }
    }

    // Add extra space after table
    context.y -= cellHeight;
  }

  /**
   * Generate PDF content from a list node
   *
   * @param list The list node
   * @param context The PDF generation context
   */
  private async generateFromList(
    list: Node & { children: Node[]; ordered?: boolean },
    context: PDFGenerationContext,
  ): Promise<void> {
    const isOrdered = list.ordered === true;

    // Process each list item
    let counter = 1;
    for (const item of list.children) {
      // Save the current x position to restore it later
      const originalX = context.x;

      // Draw bullet or number
      const bulletText = isOrdered ? `${counter}. ` : "• ";
      context.page.drawText(bulletText, {
        x: context.x,
        y: context.y,
        size: context.fontSize,
        font: context.fonts.regular,
        color: context.fontColor,
      });

      // Indent the content
      context.x +=
        context.fonts.regular.widthOfTextAtSize(bulletText, context.fontSize) +
        5;

      // Process the list item content
      await this.processNode(item, context);

      // Restore x position for the next item
      context.x = originalX;

      counter++;
    }

    // Add extra space after the list
    context.y -= context.lineHeight;
  }

  /**
   * Generate PDF content from a list item node
   *
   * @param listItem The list item node
   * @param context The PDF generation context
   */
  private async generateFromListItem(
    listItem: { type: "listItem"; children: Node[] },
    context: PDFGenerationContext,
  ): Promise<void> {
    if (Array.isArray(listItem.children)) {
      for (const child of listItem.children) {
        await this.processNode(child, context);
      }
    }
  }

  /**
   * Generate PDF content from a text node
   *
   * @param text The text node
   * @param context The PDF generation context
   */
  private generateFromText(
    text: Node & { value: string },
    context: PDFGenerationContext,
  ): void {
    context.page.drawText(text.value, {
      x: context.x,
      y: context.y,
      size: context.fontSize,
      font: context.fonts.regular,
      color: context.fontColor,
    });

    // Move x position for inline elements
    context.x += context.fonts.regular.widthOfTextAtSize(
      text.value,
      context.fontSize,
    );
  }

  /**
   * Generate PDF content from a strong (bold) node
   *
   * @param strong The strong node
   * @param context The PDF generation context
   */
  private async generateFromStrong(
    strong: Node & { children: Node[] },
    context: PDFGenerationContext,
  ): Promise<void> {
    // Save original font
    const originalFont = context.fonts.regular;

    // Use bold font
    context.fonts.regular = context.fonts.bold;

    // Process children
    for (const child of strong.children) {
      await this.processNode(child, context);
    }

    // Restore original font
    context.fonts.regular = originalFont;
  }

  /**
   * Generate PDF content from an emphasis (italic) node
   *
   * @param emphasis The emphasis node
   * @param context The PDF generation context
   */
  private async generateFromEmphasis(
    emphasis: Node & { children: Node[] },
    context: PDFGenerationContext,
  ): Promise<void> {
    // Save original font
    const originalFont = context.fonts.regular;

    // Use italic font
    context.fonts.regular = context.fonts.italic;

    // Process children
    for (const child of emphasis.children) {
      await this.processNode(child, context);
    }

    // Restore original font
    context.fonts.regular = originalFont;
  }

  /**
   * Generate PDF content from an inline code node
   *
   * @param inlineCode The inline code node
   * @param context The PDF generation context
   */
  private generateFromInlineCode(
    inlineCode: Node & { value: string },
    context: PDFGenerationContext,
  ): void {
    // Draw with monospace appearance
    const text = inlineCode.value;

    // Draw background rectangle
    const textWidth = context.fonts.regular.widthOfTextAtSize(
      text,
      context.fontSize,
    );
    context.page.drawRectangle({
      x: context.x,
      y: context.y - context.fontSize * 0.2,
      width: textWidth + 6,
      height: context.fontSize * 1.2,
      color: rgb(0.9, 0.9, 0.9),
      borderWidth: 0,
    });

    // Draw text
    context.page.drawText(text, {
      x: context.x + 3,
      y: context.y,
      size: context.fontSize,
      font: context.fonts.regular,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Move x position
    context.x += textWidth + 6;
  }

  /**
   * Generate PDF content from a code block node
   *
   * @param code The code node
   * @param context The PDF generation context
   */
  private async generateFromCode(
    code: Node & { value: string; lang?: string },
    context: PDFGenerationContext,
  ): Promise<void> {
    const language = code.lang || "";
    const codeText = code.value;

    // Draw language label if available
    if (language) {
      context.page.drawText(`${language}:`, {
        x: context.x,
        y: context.y,
        size: context.fontSize - 2,
        font: context.fonts.italic,
        color: rgb(0.4, 0.4, 0.4),
      });
      context.y -= context.lineHeight;
    }

    // Draw background
    const lines = codeText.split("\n");
    const lineCount = lines.length;
    const blockHeight = lineCount * context.lineHeight + 10;

    context.page.drawRectangle({
      x: context.x - 5,
      y: context.y + 5,
      width: context.page.getWidth() - 100,
      height: -blockHeight,
      color: rgb(0.95, 0.95, 0.95),
      borderColor: rgb(0.8, 0.8, 0.8),
      borderWidth: 1,
    });

    // Draw code lines
    for (const line of lines) {
      // Check if we need a new page
      if (context.y < 50) {
        context.page = context.pdfDoc.addPage();
        context.y = context.page.getHeight() - 50;
      }

      context.page.drawText(line, {
        x: context.x,
        y: context.y,
        size: context.fontSize - 1,
        font: context.fonts.regular,
        color: rgb(0.1, 0.1, 0.1),
      });

      context.y -= context.lineHeight;
    }

    // Add some space after the code block
    context.y -= context.lineHeight;
  }

  /**
   * Generate PDF content from a blockquote node
   *
   * @param blockquote The blockquote node
   * @param context The PDF generation context
   */
  private async generateFromBlockQuote(
    blockquote: Node & { children: Node[] },
    context: PDFGenerationContext,
  ): Promise<void> {
    // Save the current position and font
    const originalX = context.x;
    const originalFont = context.fonts.regular;
    const originalColor = context.fontColor;

    // Draw the vertical line for the blockquote
    context.page.drawLine({
      start: { x: context.x - 10, y: context.y + 5 },
      end: {
        x: context.x - 10,
        y: context.y - context.lineHeight * blockquote.children.length - 5,
      },
      thickness: 3,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Indent and style the blockquote content
    context.x += 10;
    context.fontColor = rgb(0.3, 0.3, 0.3);
    context.fonts.regular = context.fonts.italic;

    // Process children
    for (const child of blockquote.children) {
      await this.processNode(child, context);
    }

    // Restore original position and font
    context.x = originalX;
    context.fonts.regular = originalFont;
    context.fontColor = originalColor;

    // Add extra space after blockquote
    context.y -= context.lineHeight;
  }

  /**
   * Generate PDF content from a thematic break (horizontal rule) node
   *
   * @param thematicBreak The thematic break node
   * @param context The PDF generation context
   */
  private generateFromThematicBreak(
    thematicBreak: Node,
    context: PDFGenerationContext,
  ): void {
    // Draw a horizontal line
    context.page.drawLine({
      start: { x: context.x, y: context.y },
      end: { x: context.page.getWidth() - 50, y: context.y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Add space after the line
    context.y -= context.lineHeight * 2;
  }

  /**
   * Generate PDF content from a line break node
   *
   * @param lineBreak The line break node
   * @param context The PDF generation context
   */
  private generateFromLineBreak(
    lineBreak: Node,
    context: PDFGenerationContext,
  ): void {
    // Move to the next line
    context.y -= context.lineHeight;
    context.x = 50; // Reset x position
  }

  /**
   * Generate PDF content from a link node
   *
   * @param link The link node
   * @param context The PDF generation context
   */
  private async generateFromLink(
    link: Node & { children: Node[]; url: string },
    context: PDFGenerationContext,
  ): Promise<void> {
    // Save original font and color
    const originalFont = context.fonts.regular;
    const originalColor = context.fontColor;

    // Use blue color for links
    context.fontColor = rgb(0, 0, 0.8);

    // Extract link text
    const linkText = this.extractTextFromNode(link);

    // Draw the link
    context.page.drawText(linkText, {
      x: context.x,
      y: context.y,
      size: context.fontSize,
      font: context.fonts.regular,
      color: context.fontColor,
    });

    // Draw underline
    const textWidth = context.fonts.regular.widthOfTextAtSize(
      linkText,
      context.fontSize,
    );
    context.page.drawLine({
      start: { x: context.x, y: context.y - 2 },
      end: { x: context.x + textWidth, y: context.y - 2 },
      thickness: 0.5,
      color: context.fontColor,
    });

    // Move x position
    context.x += textWidth;

    // Restore original font and color
    context.fonts.regular = originalFont;
    context.fontColor = originalColor;
  }

  /**
   * Extract text from a node and its children
   *
   * @param node The node to extract text from
   * @returns The extracted text
   */
  private extractTextFromNode(node: Node): string {
    if (!node) return "";

    // If node has direct value property, return it
    if (
      "value" in node &&
      typeof (node as { value: string }).value === "string"
    ) {
      return (node as { value: string }).value;
    }

    // If node has children, extract text from them
    if (
      "children" in node &&
      Array.isArray((node as { children: Node[] }).children)
    ) {
      return (node as { children: Node[] }).children
        .map((child: Node) => this.extractTextFromNode(child))
        .join("");
    }

    return "";
  }
}

/**
 * Context for PDF generation
 */
interface PDFGenerationContext {
  pdfDoc: PDFDocument;
  page: PDFPage;
  fonts: {
    regular: PDFFont;
    bold: PDFFont;
    italic: PDFFont;
    boldItalic: PDFFont;
  };
  fontSize: number;
  lineHeight: number;
  x: number;
  y: number;
  fontColor: Color;
}
