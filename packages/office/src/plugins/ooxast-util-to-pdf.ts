import { defu } from "defu";
import {
  PDFDocument,
  type PDFFont,
  type PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";
import type { Plugin } from "unified";
import type { Node } from "unist";
import type { VFile } from "vfile";
import type {
  FontProperties,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlRoot,
  OoxmlText,
  PositionalProperties,
} from "../ast";
import type { ToPdfOptions } from "../types";

/**
 * Document state for PDF generation
 */
interface PdfGenerationState {
  doc: PDFDocument;
  currentPage: PDFPage;
  currentY: number;
  currentX: number;
  fonts: Map<string, PDFFont>;
  options: Required<ToPdfOptions>;
}

/**
 * Default options for PDF generation
 */
const DEFAULT_OPTIONS: Required<ToPdfOptions> = {
  // Base plugin options
  debug: false,
  processorOptions: {},

  // Office options
  metadata: {},
  pageSettings: {
    width: 595.28,
    height: 841.89,
    margin: {
      top: 72,
      bottom: 72,
      left: 72,
      right: 72,
    },
    orientation: "portrait",
  },
  compression: 6,
  optimizeSize: false,

  // PDF-specific options
  pageWidth: 595.28, // A4 width
  pageHeight: 841.89, // A4 height
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
  defaultFontSize: 12,
  lineHeight: 1.2,
  customOptions: {},
  fonts: {
    embedCustomFonts: false,
    subset: false,
    fallbacks: {},
  },
};

/**
 * Convert OOXML AST to PDF using pdf-lib
 */
export const ooxastToPdf: Plugin<[ToPdfOptions?]> = (
  options: ToPdfOptions = {},
) => {
  return async (tree: Node, file: VFile): Promise<void> => {
    try {
      // Type guard to ensure we have an OoxmlRoot
      if (!("children" in tree) || !Array.isArray(tree.children)) {
        throw new Error("Expected OoxmlRoot node with children");
      }

      const ooxmlTree = tree as OoxmlRoot;
      const mergedOptions: Required<ToPdfOptions> = defu(
        options,
        DEFAULT_OPTIONS,
      ) as Required<ToPdfOptions>;

      // Create PDF document
      const pdfDoc = await PDFDocument.create();

      // Initialize state
      const state: PdfGenerationState = {
        doc: pdfDoc,
        currentPage: pdfDoc.addPage([
          mergedOptions.pageWidth,
          mergedOptions.pageHeight,
        ]),
        currentY: mergedOptions.pageHeight - (mergedOptions.margins.top || 72),
        currentX: mergedOptions.margins.left || 72,
        fonts: new Map(),
        options: mergedOptions,
      };

      // Embed default fonts
      await setupDefaultFonts(state);

      // Process the OOXML tree
      for (const child of ooxmlTree.children) {
        await processNode(child, state);
      }

      // Generate PDF bytes
      const pdfBytes = await pdfDoc.save();

      // Store PDF bytes in file data
      file.data = { ...file.data, pdfBytes };

      console.log(`Generated PDF with ${pdfDoc.getPageCount()} pages`);
    } catch (error) {
      console.error("Error converting OOXML to PDF:", error);
      file.message(
        new Error(
          `PDF generation failed: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      throw error;
    }
  };
};

/**
 * Setup default fonts for the PDF document
 */
async function setupDefaultFonts(state: PdfGenerationState): Promise<void> {
  const { doc, fonts } = state;

  // Embed standard fonts
  fonts.set("TimesRoman", await doc.embedFont(StandardFonts.TimesRoman));
  fonts.set(
    "TimesRomanBold",
    await doc.embedFont(StandardFonts.TimesRomanBold),
  );
  fonts.set(
    "TimesRomanItalic",
    await doc.embedFont(StandardFonts.TimesRomanItalic),
  );
  fonts.set(
    "TimesRomanBoldItalic",
    await doc.embedFont(StandardFonts.TimesRomanBoldItalic),
  );
  fonts.set("Helvetica", await doc.embedFont(StandardFonts.Helvetica));
  fonts.set("HelveticaBold", await doc.embedFont(StandardFonts.HelveticaBold));
  fonts.set(
    "HelveticaOblique",
    await doc.embedFont(StandardFonts.HelveticaOblique),
  );
  fonts.set(
    "HelveticaBoldOblique",
    await doc.embedFont(StandardFonts.HelveticaBoldOblique),
  );
}

/**
 * Process a node in the OOXML tree
 */
async function processNode(
  node: OoxmlElementContent,
  state: PdfGenerationState,
): Promise<void> {
  if (node.type === "text") {
    await renderText(node, state);
  } else if (node.type === "element") {
    await renderElement(node, state);
  }
}

/**
 * Render a text node
 */
async function renderText(
  node: OoxmlText,
  state: PdfGenerationState,
): Promise<void> {
  const { options } = state;

  if (!node.value || node.value.trim() === "") return;

  // Use default font
  const font = state.fonts.get("TimesRoman");
  if (!font) throw new Error("Default font not found");

  const fontSize = options.defaultFontSize;

  // Check if we need a new page
  if (state.currentY < (options.margins.bottom || 72) + fontSize) {
    state.currentPage = state.doc.addPage([
      options.pageWidth,
      options.pageHeight,
    ]);
    state.currentY = options.pageHeight - (options.margins.top || 72);
    state.currentX = options.margins.left || 72;
  }

  // Draw text
  state.currentPage.drawText(node.value, {
    x: state.currentX,
    y: state.currentY,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  // Update position
  const textWidth = font.widthOfTextAtSize(node.value, fontSize);
  state.currentX += textWidth;
}

/**
 * Render an element node
 */
async function renderElement(
  element: OoxmlElement,
  state: PdfGenerationState,
): Promise<void> {
  const { name } = element;

  switch (name) {
    case "paragraph":
      await renderParagraph(element, state);
      break;
    case "textRun":
      await renderTextRun(element, state);
      break;
    case "heading":
      await renderHeading(element, state);
      break;
    case "drawing":
      await renderDrawing(element, state);
      break;
    default:
      // Process children for unknown elements
      if (element.children) {
        for (const child of element.children) {
          await processNode(child, state);
        }
      }
      break;
  }
}

/**
 * Render a paragraph element
 */
async function renderParagraph(
  element: OoxmlElement,
  state: PdfGenerationState,
): Promise<void> {
  // Start new line for paragraph
  state.currentY -= state.options.defaultFontSize * state.options.lineHeight;
  state.currentX = state.options.margins.left || 72;

  // Process children
  if (element.children) {
    for (const child of element.children) {
      await processNode(child, state);
    }
  }

  // Add paragraph spacing
  state.currentY -= state.options.defaultFontSize * 0.5;
}

/**
 * Render a text run with formatting
 */
async function renderTextRun(
  element: OoxmlElement,
  state: PdfGenerationState,
): Promise<void> {
  const { options } = state;

  // Extract font properties from element data
  const fontProps = element.data?.properties as FontProperties | undefined;

  // Determine font and size
  let fontKey = "TimesRoman";
  if (fontProps?.bold && fontProps?.italic) {
    fontKey = "TimesRomanBoldItalic";
  } else if (fontProps?.bold) {
    fontKey = "TimesRomanBold";
  } else if (fontProps?.italic) {
    fontKey = "TimesRomanItalic";
  }

  const font = state.fonts.get(fontKey);
  if (!font) throw new Error(`Font ${fontKey} not found`);

  const fontSize = fontProps?.size?.value || options.defaultFontSize;

  // Determine color
  let color = rgb(0, 0, 0);
  if (fontProps?.color?.value) {
    const colorHex = fontProps.color.value;
    const r = Number.parseInt(colorHex.slice(0, 2), 16) / 255;
    const g = Number.parseInt(colorHex.slice(2, 4), 16) / 255;
    const b = Number.parseInt(colorHex.slice(4, 6), 16) / 255;
    color = rgb(r, g, b);
  }

  // Process text children
  if (element.children) {
    for (const child of element.children) {
      if (child.type === "text") {
        // Check if we need a new page
        if (state.currentY < (options.margins.bottom || 72) + fontSize) {
          state.currentPage = state.doc.addPage([
            options.pageWidth,
            options.pageHeight,
          ]);
          state.currentY = options.pageHeight - (options.margins.top || 72);
          state.currentX = options.margins.left || 72;
        }

        // Draw text with formatting
        state.currentPage.drawText(child.value, {
          x: state.currentX,
          y: state.currentY,
          size: fontSize,
          font,
          color,
        });

        // Update position
        const textWidth = font.widthOfTextAtSize(child.value, fontSize);
        state.currentX += textWidth;
      }
    }
  }
}

/**
 * Render a heading element
 */
async function renderHeading(
  element: OoxmlElement,
  state: PdfGenerationState,
): Promise<void> {
  const { options } = state;

  // Determine heading level and size
  const level =
    ((element.data?.properties as Record<string, unknown>)?.level as number) ||
    1;
  const headingSizes = [24, 20, 16, 14, 12, 10]; // h1-h6
  const fontSize = headingSizes[Math.min(level - 1, 5)];

  // Use bold font for headings
  const font = state.fonts.get("TimesRomanBold");
  if (!font) throw new Error("Bold font not found");

  // Add spacing before heading
  state.currentY -= fontSize * 0.5;
  state.currentX = options.margins.left || 72;

  // Check if we need a new page
  if (state.currentY < (options.margins.bottom || 72) + fontSize * 2) {
    state.currentPage = state.doc.addPage([
      options.pageWidth,
      options.pageHeight,
    ]);
    state.currentY = options.pageHeight - (options.margins.top || 72);
    state.currentX = options.margins.left || 72;
  }

  // Process children (heading text)
  if (element.children) {
    for (const child of element.children) {
      if (child.type === "text") {
        state.currentPage.drawText(child.value, {
          x: state.currentX,
          y: state.currentY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });

        const textWidth = font.widthOfTextAtSize(child.value, fontSize);
        state.currentX += textWidth;
      }
    }
  }

  // Add spacing after heading
  state.currentY -= fontSize * 0.5;
}

/**
 * Render a drawing/image element (placeholder implementation)
 */
async function renderDrawing(
  element: OoxmlElement,
  state: PdfGenerationState,
): Promise<void> {
  const { options } = state;

  // Extract positional properties
  const posProps = element.data?.properties as PositionalProperties | undefined;

  // For now, just add a placeholder rectangle
  const width = Number(posProps?.size?.width) || 100;
  const height = Number(posProps?.size?.height) || 100;

  // Check if we need a new page
  if (state.currentY - height < (options.margins.bottom || 72)) {
    state.currentPage = state.doc.addPage([
      options.pageWidth,
      options.pageHeight,
    ]);
    state.currentY = options.pageHeight - (options.margins.top || 72);
    state.currentX = options.margins.left || 72;
  }

  // Draw placeholder rectangle
  state.currentPage.drawRectangle({
    x: state.currentX,
    y: state.currentY - height,
    width,
    height,
    borderColor: rgb(0.5, 0.5, 0.5),
    borderWidth: 1,
  });

  // Update position
  state.currentY -= height + 10; // Add some spacing
}
