import type { Plugin } from "unified";
import { getResolvedPDFJS } from "unpdf"; // Use getResolvedPDFJS
import type * as PDFJS from "unpdf/pdfjs"; // Import types for PDF.js API
import type { TextItem } from "unpdf/types/src/display/api";
import type { PageViewport } from "unpdf/types/src/display/display_utils";
import type { VFile } from "vfile";
import type {
  FontProperties, // Import FontProperties for styling
  OoxmlBlockContent,
  OoxmlDrawing, // Assuming image maps to drawing
  OoxmlHyperlink, // Import for hyperlink creation
  OoxmlImage, // Import OoxmlImage for image handling
  OoxmlInlineContent,
  OoxmlParagraph,
  OoxmlRoot,
  OoxmlTextRun,
  PositionalProperties, // For image positioning
  XastElement, // Import XastElement for placeholder creation
} from "../ast";

// Local alias for TransformMatrix to avoid import issues
type TransformMatrix = number[]; // PDFJS.TransformMatrix is [number, number, number, number, number, number]

// Local alias for Rect to avoid import issues
type Rect = { x1: number; y1: number; x2: number; y2: number };

// Structure to hold raw content items before sorting and processing links
interface RawPdfContentItem {
  type: "text" | "imagePlaceholder";
  // For text: contains a preliminary OoxmlTextRun
  // For images: contains a placeholder XastElement for the drawing
  node: OoxmlTextRun | XastElement;
  bbox: { x1: number; y1: number; x2: number; y2: number }; // Bounding box in PDF coords
  // Store original TextItem for link processing
  originalItem?: TextItem;
}

// Structure for Link Annotations
interface LinkAnnotationData {
  url: string;
  rect: Rect; // Use local Rect type
}

/**
 * Approximates font size from the PDF transform matrix.
 * NOTE: This is a heuristic and might not be accurate for complex transforms.
 * PDF font size is often related to vertical scaling.
 * Assumes typical text orientation.
 */
function approximateFontSize(transform: TransformMatrix): number {
  const scaleY = transform[3];
  const scaleX = transform[0];
  // Use Math.hypot for potentially rotated text
  const verticalScale = Math.hypot(transform[1], transform[3]); // Approx vertical scale
  // A simple heuristic: size is roughly the vertical scale. Default to 10pt.
  // Consider if the size in FontProperties should be half-points like in DOCX parsing
  // Let's assume FontProperties.size expects points for now.
  return Math.abs(verticalScale) || 10;
}

/**
 * Infers basic font styles (bold, italic) from the font name.
 * NOTE: This is unreliable as it depends on naming conventions.
 */
function inferFontStylesFromName(
  fontName: string
): Pick<FontProperties, "bold" | "italic"> {
  const styles: Pick<FontProperties, "bold" | "italic"> = {};
  const lowerFontName = fontName.toLowerCase();
  if (lowerFontName.includes("bold")) {
    styles.bold = true;
  }
  if (lowerFontName.includes("italic") || lowerFontName.includes("oblique")) {
    styles.italic = true;
  }
  return styles;
}

/** Converts RGB color component (0-1) to hex string */
function componentToHex(c: number): string {
  const hex = Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

/** Converts PDF color array (RGB or Grayscale) to hex string */
function pdfColorToHex(color: number[]): string {
  if (!color || color.length === 0) return "000000"; // Default black
  if (color.length === 1) {
    // Grayscale
    const hex = componentToHex(color[0]);
    return `${hex}${hex}${hex}`;
  }
  if (color.length >= 3) {
    // RGB
    const r = componentToHex(color[0]);
    const g = componentToHex(color[1]);
    const b = componentToHex(color[2]);
    return `${r}${g}${b}`;
  }
  return "000000"; // Fallback black
}

/** Checks if two rectangles intersect */
function doRectanglesIntersect(rect1: Rect, rect2: Rect): boolean {
  return (
    rect1.x1 < rect2.x2 &&
    rect1.x2 > rect2.x1 &&
    rect1.y1 < rect2.y2 && // PDF Y-axis increases upwards
    rect1.y2 > rect2.y1
  );
}

/** Checks if a point (x, y) is inside a rectangle */
function isPointInsideRect(x: number, y: number, rect: Rect): boolean {
  return x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2;
}

/**
 * Async Unified plugin to parse PDF content into an OoxmlRoot AST.
 * Aims to extract text with basic styles, and images with positions.
 */
export const pdfToOoxmlAst: Plugin<[], OoxmlRoot | undefined> = () => {
  return async (
    tree: OoxmlRoot | undefined,
    file: VFile
  ): Promise<OoxmlRoot | undefined> => {
    console.log(
      "Plugin: pdfToOoxmlAst running (Enhanced with basic styles and image placeholders)."
    );

    if (!file.value || !(file.value instanceof Uint8Array)) {
      file.message(
        new Error("VFile value must be a Uint8Array for PDF parsing.")
      );
      return undefined;
    }

    let pdfjs: any;
    let doc: PDFJS.PDFDocumentProxy;
    try {
      pdfjs = await getResolvedPDFJS();
      doc = await pdfjs.getDocument(file.value).promise;
    } catch (error: unknown) {
      console.error("Error loading PDF document with PDF.js:", error);
      file.message(
        new Error(
          `PDF.js document loading failed: ${error instanceof Error ? error.message : String(error)}`
        )
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
      data: {
        ooxmlType: "root",
        metadata: {
          source: "unpdf/pdfjs",
          totalPages: numPages,
          info: pdfInfo || {},
          metadata: pdfMetadata || {},
        },
      },
    };

    try {
      // --- Page Processing Loop ---
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 }) as PageViewport;
        const textContent = await page.getTextContent();
        const operatorList = await page.getOperatorList();
        const annotations = await page.getAnnotations();

        const pageContentItems: RawPdfContentItem[] = []; // Collect raw items first
        const links: LinkAnnotationData[] = annotations
          .filter((annot) => annot.subtype === "Link" && annot.url)
          .map((annot) => {
            // Ensure rect uses PDF coordinates (y-up)
            const normalizedRectArr = pdfjs.Util.normalizeRect(
              annot.rect as number[]
            ); // Returns [x1, y1, x2, y2]
            const rectObject: Rect = {
              x1: normalizedRectArr[0],
              y1: normalizedRectArr[1],
              x2: normalizedRectArr[2],
              y2: normalizedRectArr[3],
            };
            return {
              rect: rectObject,
              url: annot.url as string,
            };
          }); // Simplified link extraction

        // --- Graphics State Tracking (Approximate Color) ---
        const OPS = pdfjs.OPS;
        let currentFillColor: number[] = [0, 0, 0]; // Default black [R, G, B] or [Gray]
        // TODO: Need a more robust graphics state machine for accurate color/style tracking

        for (let i = 0; i < operatorList.fnArray.length; i++) {
          const fn = operatorList.fnArray[i];
          const args = operatorList.argsArray[i];

          // Track fill color changes (simplified)
          if (fn === OPS.setFillGray) {
            currentFillColor = [args[0]];
          } else if (fn === OPS.setFillRGBColor) {
            currentFillColor = [args[0], args[1], args[2]];
          } else if (fn === OPS.setFillCMYKColor) {
            // TODO: Convert CMYK to RGB - complex, using fallback for now
            console.warn("CMYK color conversion not implemented, using black.");
            currentFillColor = [0, 0, 0];
          }
          // TODO: Handle setFillColorN (Pattern/Separation), setFillColorSpace
        }
        // Note: This color tracking is very basic. A real implementation needs to
        // track the full graphics state stack (q/Q operators) and apply color
        // precisely when text drawing ops (Tj/TJ) occur relative to color ops.
        // Applying the *last* color found is a significant approximation.
        const lastFillColorHex = pdfColorToHex(currentFillColor);

        // --- 1. Process Text Content (Create RawPdfContentItem) ---
        for (const item of textContent.items as TextItem[]) {
          if (item.str.trim() === "") continue;

          // Calculate bounding box (approximate)
          // Transform matrix: [a, b, c, d, e, f]
          // x', y' = a*x + c*y + e, b*x + d*y + f
          const tx = item.transform;
          const x1 = tx[4];
          const y1 = tx[5];
          const x2 = tx[0] * item.width + tx[2] * item.height + x1; // Simplified: assumes width/height are in untransformed space
          const y2 = tx[1] * item.width + tx[3] * item.height + y1;

          // Normalize bbox (ensure x1<x2, y1<y2 - PDF origin bottom-left)
          const bbox: RawPdfContentItem["bbox"] = {
            x1: Math.min(x1, x2),
            y1: Math.min(y1, y2),
            x2: Math.max(x1, x2),
            y2: Math.max(y1, y2),
          };

          // --- Style Extraction ---
          const fontStyles = inferFontStylesFromName(item.fontName);
          const fontSize = approximateFontSize(item.transform);
          const fontProps: FontProperties = {
            name: item.fontName,
            size: fontSize,
            color: lastFillColorHex, // Apply approximate color
            ...fontStyles,
          };

          // --- Text Run Creation ---
          const textRun: OoxmlTextRun = {
            type: "text",
            value: item.str,
            data: {
              ooxmlType: "textRun",
              properties: fontProps,
              pdf: {
                transform: item.transform,
                width: item.width,
                height: item.height,
                fontName: item.fontName,
              },
            },
          };

          pageContentItems.push({
            type: "text",
            node: textRun,
            bbox: bbox,
            originalItem: item, // Keep original item for link matching
          });
        }

        // --- 2. Process Operator List for Images (Create RawPdfContentItem) ---
        // Reset CTM tracking for image processing
        const ctmStack: TransformMatrix[] = [[1, 0, 0, 1, 0, 0]];
        let currentCtm: TransformMatrix = ctmStack[ctmStack.length - 1];

        for (let i = 0; i < operatorList.fnArray.length; i++) {
          const fn = operatorList.fnArray[i];
          const args = operatorList.argsArray[i];

          if (fn === OPS.save) {
            ctmStack.push([...currentCtm]);
          } else if (fn === OPS.restore) {
            if (ctmStack.length > 1) {
              ctmStack.pop();
              currentCtm = ctmStack[ctmStack.length - 1];
            }
          } else if (fn === OPS.transform) {
            const [a, b, c, d, e, f] = args;
            currentCtm = pdfjs.Util.transform(currentCtm, [
              a,
              b,
              c,
              d,
              e,
              f,
            ] as TransformMatrix);
            ctmStack[ctmStack.length - 1] = currentCtm;
          } else if (fn === OPS.paintImageXObject) {
            const imgRef = args[0];
            try {
              const imgData = await page.commonObjs.get(imgRef);
              if (
                imgData &&
                typeof imgData === "object" &&
                (imgData as any).kind === pdfjs.XObjectKind.IMAGE
              ) {
                const pdfImage = imgData as any;
                const imgX = currentCtm[4];
                const imgY = currentCtm[5];
                const imgWidth = Math.abs(currentCtm[0]) * pdfImage.width;
                const imgHeight = Math.abs(currentCtm[3]) * pdfImage.height;

                const positionalProps: PositionalProperties = {
                  size: { width: imgWidth, height: imgHeight },
                  positionH: { relativeTo: "page", offset: imgX },
                  positionV: { relativeTo: "page", offset: imgY },
                  wrap: null,
                };

                const drawingPlaceholder: XastElement = {
                  type: "element",
                  name: "drawingPlaceholder",
                  attributes: {},
                  children: [],
                  data: {
                    ooxmlType: "drawing",
                    properties: positionalProps,
                    relationId: `pdfImage_${pageNum}_${imgRef}`,
                    pdf: {
                      ref: imgRef,
                      width: pdfImage.width,
                      height: pdfImage.height,
                    },
                  },
                };

                const imgBbox: RawPdfContentItem["bbox"] = {
                  x1: imgX,
                  y1: imgY,
                  x2: imgX + imgWidth,
                  y2: imgY + imgHeight, // Top edge Y
                };

                pageContentItems.push({
                  type: "imagePlaceholder",
                  node: drawingPlaceholder,
                  bbox: imgBbox,
                });
              } // End if image
            } catch (imgError) {
              console.warn(
                `Could not load image resource ${imgRef}:`,
                imgError
              );
            } // End try-catch
          } // End if paintImageXObject
        } // End operator list loop

        // --- 3. Sort Raw Content Items by Position ---
        pageContentItems.sort((a, b) => {
          const yDiff = b.bbox.y2 - a.bbox.y2; // Compare top edges (higher Y first)
          if (Math.abs(yDiff) > 1) {
            return yDiff;
          }
          return a.bbox.x1 - b.bbox.x1; // Compare left edges (lower X first)
        });

        // --- 4. Process Links and Group into Paragraphs ---
        const finalPageContent: OoxmlBlockContent[] = [];
        let currentParagraph: OoxmlParagraph | null = null;
        let lastItemY2 = Number.POSITIVE_INFINITY;
        const PARA_Y_THRESHOLD = 5; // Threshold to group items into same paragraph

        for (const item of pageContentItems) {
          let nodeToAdd: OoxmlInlineContent | XastElement = item.node;
          // Check for link intersection only for text items
          if (item.type === "text" && item.originalItem) {
            // Use text item's origin point for intersection check
            const textOriginX = item.originalItem.transform[4];
            const textOriginY = item.originalItem.transform[5];
            // const textBbox = item.bbox; // Keep bbox for potential future use

            for (const link of links) {
              // Use isPointInsideRect instead of doRectanglesIntersect
              if (isPointInsideRect(textOriginX, textOriginY, link.rect)) {
                // Wrap the text run (or part of it) in a hyperlink
                const linkNode: OoxmlHyperlink = {
                  type: "element",
                  name: "hyperlink", // Use a standard name
                  attributes: {},
                  children: [item.node as OoxmlTextRun], // Wrap the existing text run
                  data: {
                    ooxmlType: "hyperlink",
                    url: link.url.endsWith("/")
                      ? link.url.slice(0, -1)
                      : link.url, // Trim trailing slash
                    // Inherit/copy properties from text run if needed?
                    properties: (item.node.data as any)?.properties,
                  },
                };
                nodeToAdd = linkNode;
                break; // Apply first matching link
              }
            }
          }

          // Group into paragraphs (simplified logic)
          // If item's top is significantly below last item's top, start new para
          if (
            currentParagraph === null ||
            lastItemY2 - item.bbox.y2 > PARA_Y_THRESHOLD
          ) {
            // Start new paragraph
            currentParagraph = {
              type: "element",
              name: "paragraph",
              attributes: {},
              children: [],
              data: { ooxmlType: "paragraph" },
            };
            finalPageContent.push(currentParagraph);
          }

          // Add the node (potentially wrapped in a link) to the current paragraph
          currentParagraph.children.push(nodeToAdd as XastElement); // Assert as XastElement for now
          lastItemY2 = item.bbox.y2; // Update last Y position for grouping
        }

        // Add content for this page to the root
        newRoot.children.push(...finalPageContent);

        // --- Add comment about Table complexity ---
        // NOTE: Table parsing from PDF is highly complex due to the lack of semantic
        // structure. It typically involves advanced layout analysis (detecting lines,
        // grouping text within cells) which is beyond the scope of this basic plugin.
        // Robust table extraction usually requires dedicated libraries or algorithms.
      } // End page loop

      console.log(
        `pdfToOoxmlAst plugin: Processed ${numPages} pages. Added color (approx), links. Tables not parsed. AST contains ${newRoot.children.length} paragraphs.`
      );
      return newRoot;
    } catch (transformError: unknown) {
      console.error(
        "Error during PDF to Ooxml AST transformation:",
        transformError
      );
      file.message(
        new Error(
          `PDF AST transformation failed: ${transformError instanceof Error ? transformError.message : String(transformError)}`
        )
      );
      return undefined;
    }
  };
};
