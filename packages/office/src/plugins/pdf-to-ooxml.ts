import type { Plugin } from "unified";
import { getResolvedPDFJS } from "unpdf"; // Use getResolvedPDFJS
import type * as PDFJS from "unpdf/pdfjs"; // Import types for PDF.js API
import type { VFile } from "vfile";
import type { OoxmlParagraph, OoxmlRoot, OoxmlTextRun } from "../ast";

// Helper type for PDF.js Text Item - Use any for now due to export issue
type PdfTextItem = any; // PDFJS.TextItem;

/**
 * Async Unified plugin to:
 * 1. Load PDF using the PDF.js API via unpdf.
 * 2. Extract text content with position information.
 * 3. Transform the extracted content into an OoxmlRoot AST.
 */
export const pdfToOoxmlAst: Plugin<[], OoxmlRoot | undefined> = () => {
  return async (
    tree: OoxmlRoot | undefined,
    file: VFile,
  ): Promise<OoxmlRoot | undefined> => {
    console.log("Plugin: pdfToOoxmlAst running (using PDF.js API via unpdf).");

    if (!file.value || !(file.value instanceof Uint8Array)) {
      file.message(
        new Error("VFile value must be a Uint8Array for PDF parsing."),
      );
      return undefined;
    }

    let pdfjs: any; // Use any for now to resolve type conflict
    let doc: PDFJS.PDFDocumentProxy;
    try {
      pdfjs = await getResolvedPDFJS();
      // Load the PDF document
      doc = await pdfjs.getDocument(file.value).promise;
    } catch (error: unknown) {
      console.error("Error loading PDF document with PDF.js:", error);
      file.message(
        new Error(
          `PDF.js document loading failed: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
      return undefined;
    }

    const numPages = doc.numPages;
    let pdfMetadata: any = {};
    let pdfInfo: any = {};
    try {
      const meta = await doc.getMetadata();
      pdfMetadata = meta.metadata;
      pdfInfo = meta.info;
    } catch (metaError) {
      console.warn("Could not retrieve PDF metadata:", metaError);
    }

    const newRoot: OoxmlRoot = {
      type: "root",
      children: [],
      metadata: {
        source: "unpdf/pdfjs",
        totalPages: numPages,
        info: pdfInfo,
        metadata: pdfMetadata, // Raw metadata from PDF.js
      },
    };

    try {
      for (let i = 1; i <= numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();

        // --- Basic Transformation Logic ---
        // Group text items into paragraphs based on simple heuristics (e.g., y-coordinate)
        // This is a simplified approach and might need significant refinement for complex layouts.
        let currentParagraph: OoxmlParagraph | null = null;
        let lastY = Number.NEGATIVE_INFINITY;
        const Y_THRESHOLD = 5; // Threshold to consider text on the same line

        for (const item of textContent.items as PdfTextItem[]) {
          const yPos = item.transform[5]; // Y position from transform matrix
          const text = item.str.trim();

          if (text === "") continue; // Skip empty strings

          // Simple check: if Y position is significantly different, start new paragraph
          // Also check if current paragraph is null
          if (
            currentParagraph === null ||
            Math.abs(yPos - lastY) > Y_THRESHOLD
          ) {
            if (currentParagraph) {
              newRoot.children.push(currentParagraph);
            }
            currentParagraph = { type: "paragraph", children: [] };
            lastY = yPos;
          }

          // Add text run to current paragraph
          const textRun: OoxmlTextRun = {
            type: "textRun",
            value: item.str, // Keep original spacing for runs on same line
            properties: {
              fontName: item.fontName,
              transform: item.transform, // Store transform matrix
              // TODO: potentially add width, height, dir?
            },
          };
          currentParagraph.children.push(textRun);

          // Update lastY only if we added to the current paragraph on the same line
          // If a new paragraph started, lastY was already updated
          if (Math.abs(yPos - lastY) <= Y_THRESHOLD) {
            lastY = yPos; // Keep track of y-pos for items likely on the same line
          }
        }

        // Add the last paragraph if it exists
        if (currentParagraph) {
          newRoot.children.push(currentParagraph);
        }
      }

      console.log(
        `pdfToOoxmlAst plugin: Transformed PDF content into ${newRoot.children.length} paragraphs using PDF.js API.`,
      );
      return newRoot;
    } catch (transformError: unknown) {
      console.error(
        "Error during PDF to Ooxml AST transformation using PDF.js API:",
        transformError,
      );
      file.message(
        new Error(
          `PDF AST transformation failed: ${transformError instanceof Error ? transformError.message : String(transformError)}`,
        ),
      );
      return undefined;
    }
  };
};
