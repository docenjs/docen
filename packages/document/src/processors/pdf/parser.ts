/**
 * PDF parser for Docen
 *
 * This file implements a parser for PDF files using the PDF.js library via unpdf.
 * It extracts text, structure, and images from PDF documents.
 */

import type {
  Document,
  Heading,
  Image,
  Metadata,
  Paragraph,
  Parser,
  ProcessorOptions,
  Root,
  Source,
  Table,
  TableCell,
  TableRow,
  Text,
} from "@docen/core";
import { toUint8Array } from "@docen/core";
import { getResolvedPDFJS } from "unpdf";
import type { TextContent } from "unpdf/types/src/display/xfa_text";
import type {
  PDFDocumentProxy,
  PDFPageProxy,
  PageViewport,
} from "unpdf/types/src/pdf";

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
   * Create a paragraph node
   *
   * @param text The paragraph text
   * @returns A paragraph node
   */
  private createParagraphNode(text: string): Paragraph {
    return {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: text,
        } as Text,
      ],
    };
  }

  /**
   * Create a heading node
   *
   * @param text The heading text
   * @param level The heading level (1-6)
   * @returns A heading node
   */
  private createHeadingNode(
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
  ): Heading {
    return {
      type: "heading",
      depth: level,
      children: [
        {
          type: "text",
          value: text,
        } as Text,
      ],
    };
  }

  /**
   * Extract images from a PDF page
   *
   * @param page The PDF page
   * @param pageNum The page number
   * @returns Array of image nodes
   */
  private async extractImages(
    page: PDFPageProxy,
    pageNum: number,
  ): Promise<Image[]> {
    const images: Image[] = [];
    try {
      const operatorList = await page.getOperatorList();
      const commonObjs = page.commonObjs;
      const objs = page.objs;

      // Extract image objects from the page
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        if (operatorList.fnArray[i] === 44) {
          // PDF.js operator for images
          const imgData = operatorList.argsArray[i][0];
          if (imgData?.data) {
            const image: Image = {
              type: "image",
              url: `data:image/${imgData.mimeType || "jpeg"};base64,${Buffer.from(imgData.data).toString("base64")}`,
              alt: `Image from page ${pageNum}`,
              title: `Image ${i + 1} from page ${pageNum}`,
            };
            images.push(image);
          }
        }
      }
    } catch (error) {
      console.error(`Error extracting images from page ${pageNum}:`, error);
    }
    return images;
  }

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
      const uint8Array = toUint8Array(source);

      // Check for PDF signature (%PDF-)
      if (
        uint8Array.length >= 5 &&
        uint8Array[0] === 0x25 && // %
        uint8Array[1] === 0x50 && // P
        uint8Array[2] === 0x44 && // D
        uint8Array[3] === 0x46 && // F
        uint8Array[4] === 0x2d // -
      ) {
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
    let sourceData: Uint8Array;
    try {
      if (source instanceof Buffer) {
        // Convert Buffer to Uint8Array using the buffer's underlying ArrayBuffer
        sourceData = new Uint8Array(
          source.buffer,
          source.byteOffset,
          source.byteLength,
        );
      } else if (source instanceof ArrayBuffer) {
        // If source is already an ArrayBuffer, create Uint8Array directly
        sourceData = new Uint8Array(source);
      } else if (source instanceof Uint8Array) {
        // If source is already a Uint8Array, use it directly
        sourceData = source;
      } else {
        // For other types, use the toUint8Array utility
        sourceData = toUint8Array(source);
      }
    } catch (error) {
      console.error("Failed to convert source to Uint8Array:", error);
      throw new Error("Failed to convert source to Uint8Array");
    }

    // Create empty document structure
    const document: Document = {
      metadata: {},
      content: {
        type: "root",
        children: [],
      },
    };

    try {
      // Get the PDF.js library
      const pdfjs = await getResolvedPDFJS();

      // Load the PDF document
      const pdfDocument = await pdfjs.getDocument(sourceData).promise;

      // Extract metadata if requested
      if (options?.extractMetadata) {
        document.metadata = await this.extractMetadata(pdfDocument);
      }

      // Store total pages in metadata
      document.metadata.pageCount = pdfDocument.numPages;

      // Parse the content
      document.content = await this.parseContent(pdfDocument, options);
    } catch (error) {
      console.error("Failed to parse PDF document:", error);
      // Return empty document if parsing fails
      document.content = {
        type: "root",
        children: [],
      };
    }

    return document;
  }

  /**
   * Extract metadata from PDF document
   *
   * @param pdfDocument The PDF document
   * @returns Extracted metadata
   */
  private async extractMetadata(
    pdfDocument: PDFDocumentProxy,
  ): Promise<Metadata> {
    try {
      const metaResult = await pdfDocument.getMetadata();
      const metadata: Metadata = {};

      // Add basic document info
      metadata.pageCount = pdfDocument.numPages;

      return metadata;
    } catch (error) {
      console.error("Error extracting metadata:", error);
      return {};
    }
  }

  /**
   * Parse PDF content into AST
   *
   * @param pdfDocument The PDF document
   * @param options Parsing options
   * @returns Root node of the AST
   */
  private async parseContent(
    pdfDocument: PDFDocumentProxy,
    options?: ProcessorOptions,
  ): Promise<Root> {
    const root: Root = {
      type: "root",
      children: [],
    };

    // Process each page
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      try {
        const page = await pdfDocument.getPage(i);
        const pageContent = await this.parsePage(page, i, options);
        root.children.push(...pageContent);
      } catch (error) {
        console.error(`Failed to parse page ${i}:`, error);
      }
    }

    return root;
  }

  /**
   * Parse a single PDF page
   *
   * @param page The PDF page
   * @param pageNum The page number
   * @param options Parsing options
   * @returns Array of content nodes
   */
  private async parsePage(
    page: PDFPageProxy,
    pageNum: number,
    options?: ProcessorOptions,
  ): Promise<(Paragraph | Heading | Image | Table)[]> {
    const content: (Paragraph | Heading | Image | Table)[] = [];

    try {
      // Get text content
      const textContent = await page.getTextContent();

      // Get page viewport for positioning
      const viewport = page.getViewport({ scale: 1.0 });

      // Process text items
      const processedContent = this.processTextContent(
        textContent,
        viewport,
        pageNum,
      );
      content.push(...processedContent);

      // Extract tables if requested
      if (options?.extractTables) {
        const tables = await this.extractTables(textContent, viewport);
        content.push(...tables);
      }

      // Extract images if requested
      if (options?.extractImages) {
        const images = await this.extractImages(page, pageNum);
        content.push(...images);
      }
    } catch (error) {
      console.error(`Error processing page ${pageNum}:`, error);
      // Add a simple paragraph with error information
      content.push({
        type: "paragraph",
        children: [
          {
            type: "text",
            value: `Error processing page ${pageNum}: ${error}`,
          } as Text,
        ],
      });
    }

    return content;
  }

  /**
   * Process text content from PDF.js
   *
   * @param textContent The text content from PDF.js
   * @param viewport The page viewport
   * @param pageNum The page number
   * @returns Array of content nodes
   */
  private processTextContent(
    textContent: TextContent,
    viewport: PageViewport,
    pageNum: number,
  ): (Paragraph | Heading)[] {
    const content: (Paragraph | Heading)[] = [];
    const items = textContent.items;

    if (!items || items.length === 0) {
      return content;
    }

    // Group text items by their vertical position to identify paragraphs
    const lineGroups: TextContent["items"][] = [];
    let currentLineY: number | null = null;
    let currentLineItems: TextContent["items"] = [];

    // Sort items by their vertical position (top to bottom) and then by horizontal position (left to right)
    const sortedItems = [...items].sort((a, b) => {
      // Only sort TextItems, skip TextMarkedContent
      if ("transform" in a && "transform" in b) {
        const yDiff = a.transform[5] - b.transform[5];
        if (Math.abs(yDiff) < 2) {
          // Items on the same line (with small tolerance)
          return a.transform[4] - b.transform[4]; // Sort by x position
        }
        return yDiff;
      }
      return 0;
    });

    // Group items into lines
    for (const item of sortedItems) {
      if (!("transform" in item)) continue;

      const y = item.transform[5];

      if (currentLineY === null || Math.abs(y - currentLineY) > 5) {
        // New line detected
        if (currentLineItems.length > 0) {
          lineGroups.push(currentLineItems);
        }
        currentLineItems = [item];
        currentLineY = y;
      } else {
        currentLineItems.push(item);
      }
    }

    // Add the last line
    if (currentLineItems.length > 0) {
      lineGroups.push(currentLineItems);
    }

    // Process line groups into paragraphs and headings
    let currentParagraphLines: string[] = [];
    let prevFontSize = 0;

    for (let i = 0; i < lineGroups.length; i++) {
      const line = lineGroups[i];
      const lineText = line
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .trim();

      if (lineText.length === 0) {
        // Empty line - end of paragraph
        if (currentParagraphLines.length > 0) {
          content.push(
            this.createParagraphNode(currentParagraphLines.join(" ")),
          );
          currentParagraphLines = [];
        }
        continue;
      }

      // Check if this might be a heading based on font size and style
      const avgFontSize =
        line.reduce(
          (sum, item) => sum + ("height" in item ? item.height || 0 : 0),
          0,
        ) / line.length;
      const isBold = line.some(
        (item) =>
          "fontName" in item &&
          item.fontName &&
          item.fontName.toLowerCase().includes("bold"),
      );

      // Detect if this is likely a heading
      const isHeading =
        (avgFontSize > prevFontSize * 1.2 ||
          (isBold && avgFontSize >= prevFontSize)) &&
        lineText.length < 100 && // Headings are typically not very long
        !lineText.endsWith(".");

      if (isHeading) {
        // End current paragraph if any
        if (currentParagraphLines.length > 0) {
          content.push(
            this.createParagraphNode(currentParagraphLines.join(" ")),
          );
          currentParagraphLines = [];
        }

        // Determine heading level based on font size
        let headingLevel: 1 | 2 | 3 | 4 | 5 | 6 = 3; // Default to h3
        if (avgFontSize > 16) headingLevel = 1;
        else if (avgFontSize > 14) headingLevel = 2;

        content.push(this.createHeadingNode(lineText, headingLevel));
      } else {
        // Regular text - add to current paragraph
        currentParagraphLines.push(lineText);

        // Check if this is the end of a paragraph
        const nextLine = i < lineGroups.length - 1 ? lineGroups[i + 1] : null;
        const isEndOfParagraph =
          !nextLine ||
          nextLine.length === 0 ||
          nextLine
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ")
            .trim().length === 0;

        if (isEndOfParagraph) {
          content.push(
            this.createParagraphNode(currentParagraphLines.join(" ")),
          );
          currentParagraphLines = [];
        }
      }

      prevFontSize = avgFontSize;
    }

    // Add any remaining paragraph
    if (currentParagraphLines.length > 0) {
      content.push(this.createParagraphNode(currentParagraphLines.join(" ")));
    }

    return content;
  }

  /**
   * Extract tables from PDF content
   *
   * @param textContent The text content from PDF.js
   * @param viewport The page viewport
   * @returns Array of table nodes
   */
  private async extractTables(
    textContent: TextContent,
    viewport: PageViewport,
  ): Promise<Table[]> {
    const tables: Table[] = [];
    const items = textContent.items;

    if (!items || items.length === 0) {
      return tables;
    }

    // Group text items by their vertical position to identify rows
    const rows: TextContent["items"][] = [];
    let currentRowY: number | null = null;
    let currentRowItems: TextContent["items"] = [];

    // Sort items by their vertical position (top to bottom) and then by horizontal position (left to right)
    const sortedItems = [...items].sort((a, b) => {
      // Only sort TextItems, skip TextMarkedContent
      if ("transform" in a && "transform" in b) {
        const yDiff = a.transform[5] - b.transform[5];
        if (Math.abs(yDiff) < 2) {
          // Items on the same line (with small tolerance)
          return a.transform[4] - b.transform[4]; // Sort by x position
        }
        return yDiff;
      }
      return 0;
    });

    // Group items into rows
    for (const item of sortedItems) {
      if (!("transform" in item)) continue;

      const y = item.transform[5];

      if (currentRowY === null || Math.abs(y - currentRowY) > 5) {
        // New row detected
        if (currentRowItems.length > 0) {
          rows.push(currentRowItems);
        }
        currentRowItems = [item];
        currentRowY = y;
      } else {
        currentRowItems.push(item);
      }
    }

    // Add the last row
    if (currentRowItems.length > 0) {
      rows.push(currentRowItems);
    }

    // Analyze rows to detect table structure
    let currentTable: Table | null = null;
    let currentTableRows: TableRow[] = [];
    let prevRowY: number | null = null;
    let prevRowHeight: number | null = null;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.length) continue;

      // Get first TextItem with transform
      const firstItem = row.find((item) => "transform" in item);
      if (!firstItem || !("transform" in firstItem)) continue;

      // Get row position and height
      const rowY = firstItem.transform[5];
      const rowHeight = Math.max(
        ...row.map((item) => ("height" in item ? item.height : 0)),
      );

      // Check if this row belongs to a table
      const isTableRow = this.isTableRow(row, prevRowY, prevRowHeight);

      if (isTableRow) {
        // Create or update table
        if (!currentTable) {
          currentTable = {
            type: "table",
            children: [],
          };
        }

        // Create table row
        const tableRow: TableRow = {
          type: "tableRow",
          children: [],
        };

        // Group items by x position to identify cells
        const cells = this.groupItemsIntoCells(row);

        // Create table cells
        for (const cellItems of cells) {
          const cellText = cellItems
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ")
            .trim();

          const tableCell: TableCell = {
            type: "tableCell",
            children: [
              {
                type: "text",
                value: cellText,
              } as Text,
            ],
          };

          tableRow.children.push(tableCell);
        }

        currentTableRows.push(tableRow);
      } else if (currentTable) {
        // End of table detected
        currentTable.children = currentTableRows;
        tables.push(currentTable);
        currentTable = null;
        currentTableRows = [];
      }

      prevRowY = rowY;
      prevRowHeight = rowHeight;
    }

    // Add the last table if exists
    if (currentTable && currentTableRows.length > 0) {
      currentTable.children = currentTableRows;
      tables.push(currentTable);
    }

    return tables;
  }

  /**
   * Check if a row belongs to a table
   *
   * @param row The row items
   * @param prevRowY The y position of the previous row
   * @param prevRowHeight The height of the previous row
   * @returns True if the row belongs to a table
   */
  private isTableRow(
    row: TextContent["items"],
    prevRowY: number | null,
    prevRowHeight: number | null,
  ): boolean {
    if (!row.length) return false;

    // Get first TextItem with transform
    const firstItem = row.find((item) => "transform" in item);
    if (!firstItem || !("transform" in firstItem)) return false;

    // Get row position and height
    const rowY = firstItem.transform[5];
    const rowHeight = Math.max(
      ...row.map((item) => ("height" in item ? item.height : 0)),
    );

    // Check if this is the first row
    if (prevRowY === null) {
      return row.length > 1; // Consider it a table if it has multiple items
    }

    // Check if this row is close to the previous row
    const rowSpacing = Math.abs(rowY - prevRowY);
    const avgRowHeight = (rowHeight + (prevRowHeight || 0)) / 2;

    // If rows are close together and have similar heights, they might be part of a table
    return rowSpacing <= avgRowHeight * 1.5 && row.length > 1;
  }

  /**
   * Group items into cells based on their x position
   *
   * @param row The row items
   * @returns Array of cell items
   */
  private groupItemsIntoCells(
    row: TextContent["items"],
  ): TextContent["items"][] {
    const cells: TextContent["items"][] = [];
    let currentCell: TextContent["items"] = [];
    let lastX = -1;

    // Filter and sort items by x position
    const sortedItems = row
      .filter((item) => "transform" in item)
      .sort((a, b) => {
        if ("transform" in a && "transform" in b) {
          return a.transform[4] - b.transform[4];
        }
        return 0;
      });

    for (const item of sortedItems) {
      if (!("transform" in item)) continue;

      const x = item.transform[4];

      // If there's a significant gap, start a new cell
      if (lastX !== -1 && x - lastX > 20) {
        if (currentCell.length > 0) {
          cells.push(currentCell);
        }
        currentCell = [];
      }

      currentCell.push(item);
      lastX = x;
    }

    // Add the last cell
    if (currentCell.length > 0) {
      cells.push(currentCell);
    }

    return cells;
  }
}
