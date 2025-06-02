import type { Plugin } from "unified";
import { getResolvedPDFJS } from "unpdf"; // Use getResolvedPDFJS
import type { VFile } from "vfile";
import type {
  ColorDefinition,
  FontProperties,
  Measurement,
  OoxmlData,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlRoot,
  OoxmlText,
  PdfDrawingData,
  PdfDrawingElement,
  PdfTextRunData,
  PdfTextRunElement,
  PositionalProperties,
} from "../ast";

// Define unpdf/PDF.js types based on actual API
interface PDFJSNamespace {
  getDocument: (data: { data: Uint8Array } | Uint8Array) => {
    promise: Promise<PDFDocumentProxy>;
  };
  OPS: Record<string, number>;
  Util: {
    normalizeRect: (rect: number[]) => number[];
    transform: (m1: number[], m2: number[]) => number[];
  };
  XObjectKind: {
    IMAGE: string;
  };
  version: string;
}

// Define interface for PDF image data
interface PDFImageData {
  kind: string;
  width: number;
  height: number;
  data?: Uint8Array;
}

interface PDFDocumentProxy {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPageProxy>;
  getMetadata: () => Promise<PDFMetadata>;
}

interface PDFPageProxy {
  getTextContent: () => Promise<PDFTextContent>;
  getViewport: (params: { scale: number }) => PDFViewport;
  getOperatorList: () => Promise<PDFOperatorList>;
  getAnnotations: () => Promise<PDFAnnotation[]>;
  commonObjs: {
    get: (ref: string) => Promise<unknown>;
  };
}

interface PDFTextContent {
  items: PDFTextItem[];
}

interface PDFTextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  fontName: string;
}

interface PDFViewport {
  width: number;
  height: number;
}

interface PDFOperatorList {
  fnArray: number[];
  argsArray: unknown[][];
}

interface PDFAnnotation {
  subtype: string;
  url?: string;
  rect?: number[];
}

interface PDFMetadata {
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

// Local alias for TransformMatrix to avoid import issues
type TransformMatrix = number[]; // PDFJS.TransformMatrix is [number, number, number, number, number, number]

// Local alias for Rect to avoid import issues
type Rect = { x1: number; y1: number; x2: number; y2: number };

// Structure to hold raw content items before sorting and processing links
interface RawPdfContentItem {
  type: "text" | "imagePlaceholder";
  node: OoxmlElement; // Both text runs and drawing placeholders are OoxmlElements
  bbox: { x1: number; y1: number; x2: number; y2: number };
  originalItem?: PDFTextItem;
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
  fontName: string,
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

/** Checks if a point (x, y) is inside a rectangle */
function isPointInsideRect(x: number, y: number, rect: Rect): boolean {
  return x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2;
}

/**
 * Async Unified plugin to parse PDF content into an OoxmlRoot AST.
 * Aims to extract text with basic styles, and images with positions.
 */
// Import shared types
import type { FromPdfOptions } from "../types";

/**
 * Parse PDF file content into OOXML AST
 * Follows unified.js naming convention (like fromXml, fromMarkdown)
 */
export const pdfToOoxast: Plugin<[FromPdfOptions?], OoxmlRoot | undefined> = (
  options: FromPdfOptions = {},
) => {
  return async (
    _tree: OoxmlRoot | undefined, // Input tree is ignored, but type should match return
    file: VFile,
  ): Promise<OoxmlRoot | undefined> => {
    console.log(
      "Plugin: pdfToOoxast running (Enhanced with basic styles and image placeholders).",
    );

    if (!file.value || !(file.value instanceof Uint8Array)) {
      file.message(
        new Error("VFile value must be a Uint8Array for PDF parsing."),
      );
      return undefined;
    }

    let pdfjs: PDFJSNamespace;
    let doc: PDFDocumentProxy;
    try {
      pdfjs = (await getResolvedPDFJS()) as unknown as PDFJSNamespace;
      doc = await pdfjs.getDocument({ data: file.value }).promise;
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
    let pdfMetadata: Record<string, unknown> = {};
    let pdfInfo: Record<string, unknown> = {};
    try {
      const meta = await doc.getMetadata();
      pdfMetadata = meta.metadata as Record<string, unknown>;
      pdfInfo = meta.info as Record<string, unknown>;
    } catch (metaError) {
      console.warn("Could not retrieve PDF metadata:", metaError);
    }

    // Ensure newRoot is OoxmlRoot and use type assertion for data
    const newRoot: OoxmlRoot = {
      type: "root",
      children: [],
      // Use proper typing for metadata
      data: {
        ooxmlType: "root" as const, // Use specific type instead of generic 'root'
        metadata: {
          source: "unpdf/pdfjs",
          totalPages: numPages,
          info: pdfInfo || {},
          metadata: pdfMetadata || {},
        },
      } as OoxmlData & { metadata: Record<string, unknown> },
    };

    try {
      // --- Page Processing Loop ---
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await doc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const textContent = await page.getTextContent();
        const operatorList = await page.getOperatorList();
        const annotations = await page.getAnnotations();

        const pageContentItems: RawPdfContentItem[] = []; // Collect raw items first
        const links: LinkAnnotationData[] = annotations
          .filter((annot) => annot.subtype === "Link" && annot.url)
          .map((annot) => {
            // Ensure rect uses PDF coordinates (y-up)
            const normalizedRectArr = pdfjs.Util.normalizeRect(
              annot.rect as number[],
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

        // --- Graphics State Tracking (Improved) ---
        const OPS = pdfjs.OPS;

        // Enhanced graphics state machine
        interface GraphicsState {
          fillColor: number[]; // [R, G, B] or [Gray] or [C, M, Y, K]
          strokeColor: number[]; // [R, G, B] or [Gray] or [C, M, Y, K]
          fillColorSpace: "DeviceGray" | "DeviceRGB" | "DeviceCMYK" | string;
          strokeColorSpace: "DeviceGray" | "DeviceRGB" | "DeviceCMYK" | string;
          lineWidth: number;
          font: { name: string; size: number } | null;
        }

        const defaultGraphicsState: GraphicsState = {
          fillColor: [0, 0, 0], // Default black
          strokeColor: [0, 0, 0],
          fillColorSpace: "DeviceRGB",
          strokeColorSpace: "DeviceRGB",
          lineWidth: 1,
          font: null,
        };

        const graphicsStateStack: GraphicsState[] = [
          { ...defaultGraphicsState },
        ];
        let currentGraphicsState = graphicsStateStack[0];

        /**
         * Convert CMYK color values to RGB approximation
         * This is a simplified conversion - real-world CMYK to RGB requires color profiles
         */
        function cmykToRgb(
          c: number,
          m: number,
          y: number,
          k: number,
        ): [number, number, number] {
          // Convert CMYK (0-1) to RGB (0-1) using basic formula
          const r = 1 - Math.min(1, c * (1 - k) + k);
          const g = 1 - Math.min(1, m * (1 - k) + k);
          const b = 1 - Math.min(1, y * (1 - k) + k);
          return [r, g, b];
        }

        /**
         * Convert color array to hex string based on color space
         */
        function colorToHex(color: number[], colorSpace: string): string {
          if (colorSpace === "DeviceGray") {
            const gray = Math.round(color[0] * 255);
            return `${gray.toString(16).padStart(2, "0")}${gray.toString(16).padStart(2, "0")}${gray.toString(16).padStart(2, "0")}`;
          }
          if (colorSpace === "DeviceRGB") {
            const r = Math.round(color[0] * 255);
            const g = Math.round(color[1] * 255);
            const b = Math.round(color[2] * 255);
            return `${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          }
          if (colorSpace === "DeviceCMYK") {
            const [r, g, b] = cmykToRgb(color[0], color[1], color[2], color[3]);
            const rInt = Math.round(r * 255);
            const gInt = Math.round(g * 255);
            const bInt = Math.round(b * 255);
            return `${rInt.toString(16).padStart(2, "0")}${gInt.toString(16).padStart(2, "0")}${bInt.toString(16).padStart(2, "0")}`;
          }
          // Fallback for unknown color spaces
          return "000000";
        }

        for (let i = 0; i < operatorList.fnArray.length; i++) {
          const fn = operatorList.fnArray[i];
          const args = operatorList.argsArray[i];

          // Graphics state management
          if (fn === OPS.save) {
            graphicsStateStack.push({ ...currentGraphicsState });
          } else if (fn === OPS.restore) {
            if (graphicsStateStack.length > 1) {
              graphicsStateStack.pop();
              currentGraphicsState =
                graphicsStateStack[graphicsStateStack.length - 1];
            }
          }
          // Fill color tracking
          else if (fn === OPS.setFillGray) {
            currentGraphicsState.fillColor = [args[0] as number];
            currentGraphicsState.fillColorSpace = "DeviceGray";
          } else if (fn === OPS.setFillRGBColor) {
            currentGraphicsState.fillColor = [
              args[0] as number,
              args[1] as number,
              args[2] as number,
            ];
            currentGraphicsState.fillColorSpace = "DeviceRGB";
          } else if (fn === OPS.setFillCMYKColor) {
            currentGraphicsState.fillColor = [
              args[0] as number,
              args[1] as number,
              args[2] as number,
              args[3] as number,
            ];
            currentGraphicsState.fillColorSpace = "DeviceCMYK";
          }
          // Handle indexed and pattern color spaces
          else if (fn === OPS.setFillColorN) {
            // Pattern or separation color space - use fallback color
            console.warn(
              "Pattern/Separation color space not fully implemented, using black.",
            );
            currentGraphicsState.fillColor = [0, 0, 0];
            currentGraphicsState.fillColorSpace = "DeviceRGB";
          }
          // Color space changes
          else if (fn === OPS.setFillColorSpace) {
            const colorSpaceName = args[0] as string;
            currentGraphicsState.fillColorSpace = colorSpaceName;
            // Reset to default color when color space changes
            if (colorSpaceName === "DeviceGray") {
              currentGraphicsState.fillColor = [0]; // Black in gray
            } else if (colorSpaceName === "DeviceRGB") {
              currentGraphicsState.fillColor = [0, 0, 0]; // Black in RGB
            } else if (colorSpaceName === "DeviceCMYK") {
              currentGraphicsState.fillColor = [0, 0, 0, 1]; // Black in CMYK
            }
          }
          // Font tracking
          else if (fn === OPS.setFont) {
            const fontRef = args[0] as string;
            const fontSize = args[1] as number;
            currentGraphicsState.font = { name: fontRef, size: fontSize };
          }
        }

        // Get final fill color for text rendering
        const finalFillColorHex = colorToHex(
          currentGraphicsState.fillColor,
          currentGraphicsState.fillColorSpace,
        );

        // --- 1. Process Text Content (Create RawPdfContentItem) ---
        for (const item of textContent.items as PDFTextItem[]) {
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
            size: { value: fontSize, unit: "pt" } as Measurement,
            color: { value: finalFillColorHex } as ColorDefinition,
            ...fontStyles,
          };

          // --- Text Node Creation (Use OoxmlText) ---
          const textNode: OoxmlText = {
            type: "text",
            value: item.str,
            data: {
              ooxmlType: "text", // Mark as plain text node
            },
          };

          // --- Text Run Container Creation (Use PdfTextRunElement) ---
          const textRun: PdfTextRunElement = {
            type: "element",
            name: "textRun",
            attributes: {},
            children: [textNode],
            data: {
              ooxmlType: "textRun",
              properties: fontProps,
              pdf: {
                coordinates: {
                  x: x1,
                  y: y1,
                  width: x2 - x1,
                  height: y2 - y1,
                  transform: item.transform,
                  pageIndex: pageNum - 1,
                  pageWidth: viewport.width,
                  pageHeight: viewport.height,
                },
                font: {
                  name: item.fontName,
                  size: fontSize,
                },
              },
            } as PdfTextRunData,
          };

          pageContentItems.push({
            type: "text",
            node: textRun,
            bbox: bbox,
            originalItem: item,
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
              a as number,
              b as number,
              c as number,
              d as number,
              e as number,
              f as number,
            ] as TransformMatrix);
            ctmStack[ctmStack.length - 1] = currentCtm;
          } else if (fn === OPS.paintImageXObject) {
            const imgRef = args[0] as string;
            try {
              const imgData = await page.commonObjs.get(imgRef);
              if (
                imgData &&
                typeof imgData === "object" &&
                (imgData as PDFImageData).kind === pdfjs.XObjectKind.IMAGE
              ) {
                const pdfImage = imgData as PDFImageData;
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

                // Use PdfDrawingElement for the placeholder
                const drawingPlaceholder: PdfDrawingElement = {
                  type: "element",
                  name: "drawingPlaceholder",
                  attributes: {},
                  children: [],
                  data: {
                    ooxmlType: "drawing",
                    properties: positionalProps,
                    relationId: `pdfImage_${pageNum}_${imgRef}`,
                    pdf: {
                      coordinates: {
                        x: imgX,
                        y: imgY,
                        width: imgWidth,
                        height: imgHeight,
                        pageIndex: pageNum - 1,
                        pageWidth: viewport.width,
                        pageHeight: viewport.height,
                      },
                      image: {
                        objectId: imgRef,
                        width: pdfImage.width,
                        height: pdfImage.height,
                      },
                    },
                  } as PdfDrawingData,
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
                imgError,
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
        const finalPageContent: OoxmlElementContent[] = [];
        let currentParagraph: OoxmlElement | null = null;
        let lastItemY2 = Number.POSITIVE_INFINITY;
        const PARA_Y_THRESHOLD = 5; // Threshold to group items into same paragraph

        for (const item of pageContentItems) {
          let nodeToAdd: OoxmlElementContent = item.node;

          if (item.type === "text" && item.originalItem) {
            // Use text item's origin point for intersection check
            const textOriginX = item.originalItem.transform[4];
            const textOriginY = item.originalItem.transform[5];

            for (const link of links) {
              if (isPointInsideRect(textOriginX, textOriginY, link.rect)) {
                // Wrap the text run in a hyperlink (Use OoxmlElement)
                const linkNode: OoxmlElement = {
                  type: "element",
                  name: "hyperlink",
                  attributes: {},
                  children: [item.node as OoxmlElementContent],
                  data: {
                    ooxmlType: "hyperlink",
                    properties: {
                      ...(item.node as OoxmlElement).data?.properties,
                      url: link.url.endsWith("/")
                        ? link.url.slice(0, -1)
                        : link.url,
                    },
                  },
                };
                nodeToAdd = linkNode;
                break;
              }
            }
          }

          // Group into paragraphs (Use OoxmlElement)
          if (
            currentParagraph === null ||
            lastItemY2 - item.bbox.y2 > PARA_Y_THRESHOLD
          ) {
            // Start new paragraph (Ensure type is OoxmlElement)
            currentParagraph = {
              type: "element",
              name: "paragraph",
              attributes: {},
              children: [],
              data: { ooxmlType: "paragraph" },
            };
            finalPageContent.push(currentParagraph);
          }
          if (currentParagraph) {
            currentParagraph.children.push(nodeToAdd);
          }

          lastItemY2 = item.bbox.y2;
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
        `pdfToOoxmlAst plugin: Processed ${numPages} pages. Added color (approx), links. Tables not parsed. AST contains ${newRoot.children.length} paragraphs.`,
      );
      return newRoot;
    } catch (transformError: unknown) {
      console.error(
        "Error during PDF to Ooxml AST transformation:",
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
