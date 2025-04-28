import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  type IBorderOptions,
  // Import specific image option types
  type IImageOptions,
  type ILevelsOptions,
  type IRunOptions,
  type ISectionOptions,
  type ITableBordersOptions,
  type ITableCellOptions,
  type ITableOptions,
  type ITableWidthProperties,
  ImageRun,
  LevelSuffix,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
// Import image-meta for type/dimension detection
import { imageMeta } from "image-meta";
import { ofetch } from "ofetch";
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import type {
  BorderStyleProperties,
  FontProperties,
  OnOffValue,
  OoxmlData,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlNode,
  OoxmlRoot,
  OoxmlText,
  ParagraphFormatting,
  TableBorderProperties,
  WmlTableCellProperties as TableCellProperties,
  WmlTableProperties as TableProperties,
  WmlHyperlinkProperties,
  WmlImageRefProperties,
} from "../ast";

// --- Constants for Numbering Generation ---
const MAX_LIST_LEVELS = 9; // Define the maximum number of levels (0-8)
const BASE_INDENT = 720; // Initial left indent for level 0 in DXA (twips)
const HANGING_INDENT = 360; // Consistent hanging indent in DXA (twips)
const INDENT_STEP = 720; // Increase in left indent per level in DXA (twips)

const BULLET_SYMBOLS = [
  "\u2022", // • Standard bullet
  "\u25E6", // ◦ White bullet
  "\u25AA", // ▪ Small black square
  "\u25AB", // ▫ Small white square
];

// Define number formats and their corresponding text patterns
// The text pattern uses %N where N is the level number (1-based index)
const NUMBER_FORMATS = [
  { format: "decimal" as const, text: "%1." }, // 1.
  { format: "lowerLetter" as const, text: "%2)" }, // a)
  { format: "lowerRoman" as const, text: "%3." }, // i.
  { format: "decimal" as const, text: "(%4)" }, // (1)
  { format: "lowerLetter" as const, text: "%5)" }, // a) - repeat pattern
  { format: "lowerRoman" as const, text: "%6." }, // i. - repeat pattern
  { format: "decimal" as const, text: "(%7)" }, // (1) - repeat pattern
  { format: "lowerLetter" as const, text: "%8)" }, // a) - repeat pattern
  { format: "lowerRoman" as const, text: "%9." }, // i. - repeat pattern
];

// Helper function to generate numbering levels programmatically
function generateNumberingLevels(
  type: "bullet" | "number",
  count: number = MAX_LIST_LEVELS,
): Readonly<ILevelsOptions>[] {
  return Array.from({ length: count }, (_, i) => {
    const levelIndex = i;
    const indentLeft = BASE_INDENT + levelIndex * INDENT_STEP;
    const levelStyle = {
      paragraph: {
        indent: { left: indentLeft, hanging: HANGING_INDENT },
      },
    };

    if (type === "bullet") {
      const symbol = BULLET_SYMBOLS[levelIndex % BULLET_SYMBOLS.length];
      return {
        level: levelIndex,
        format: "bullet" as const,
        text: symbol,
        alignment: AlignmentType.LEFT,
        style: levelStyle,
      };
    }
    // type === 'number'
    const formatInfo = NUMBER_FORMATS[levelIndex % NUMBER_FORMATS.length];
    const levelText = formatInfo.text
      ? formatInfo.text.replace(/%\d+/, `%${levelIndex + 1}`)
      : "";
    return {
      level: levelIndex,
      format: formatInfo.format,
      text: levelText,
      alignment: AlignmentType.LEFT,
      style: levelStyle,
      suffix: LevelSuffix.NOTHING,
    };
  });
}

// Define the type for the objects that docx.Document expects in its sections.children array
type DocxChild = Paragraph | Table;

// Helper function to convert OnOffValue to boolean for docx.js
function onOffToBoolean(value: OnOffValue | undefined): boolean | undefined {
  if (value === true || value === "on" || value === "1") return true;
  if (value === false || value === "off" || value === "0") return false;
  return undefined;
}

// Helper to map OOXML alignment to docx.js AlignmentType
function mapAlignment(
  align?: string,
): (typeof AlignmentType)[keyof typeof AlignmentType] | undefined {
  switch (align?.toLowerCase()) {
    case "start":
    case "left":
      return AlignmentType.LEFT;
    case "center":
      return AlignmentType.CENTER;
    case "end":
    case "right":
      return AlignmentType.RIGHT;
    case "both": // OOXML 'both' maps to docx 'both' which is also 'justified'
      return AlignmentType.BOTH; // or AlignmentType.JUSTIFIED, they are the same value
    case "justify": // Handle explicit 'justify' if needed
      return AlignmentType.JUSTIFIED;
    default:
      return undefined;
  }
}

// Helper function to convert AST BorderStyleProperties to docx IBorderOptions
function mapBorderStyle(
  astBorder?: BorderStyleProperties,
): IBorderOptions | undefined {
  if (!astBorder) return undefined;
  const style = astBorder.style?.toUpperCase() as keyof typeof BorderStyle;
  let color: string | undefined = "auto";
  if (typeof astBorder.color?.value === "string") {
    color = astBorder.color.value;
    // *** FIX: Simplify color mapping - Assume valid CSS color string or 'auto' ***
    // color = color === "auto" ? "auto" : (color.length === 6 ? `#${color}` : "auto"); // Remove hex prefix logic
    if (
      color !== "auto" &&
      !/^#[0-9A-Fa-f]{6}$/.test(color) &&
      !/^[a-zA-Z]+$/.test(color)
    ) {
      // Basic check for 'auto', known color names, or hex format. Improve as needed.
      console.warn(
        `[mapBorderStyle] Potentially unsupported color value: ${color}`,
      );
      // color = "auto"; // Optionally fallback
    }
  }
  let size: number | undefined;
  if (astBorder.size?.unit === "pt") {
    size = astBorder.size.value * 8; // Convert points to eighths-of-a-point
  } else if (astBorder.size?.unit === "dxa") {
    size = astBorder.size.value / 2.5; // Approx DXA to eighths-of-a-point (1pt = 20dxa) -> size_pt * 8 = size_dxa / 20 * 8 = size_dxa / 2.5
  } else if (typeof astBorder.size?.value === "number") {
    // Assume eighths-of-a-point if no unit? Risky.
    size = astBorder.size.value;
  }

  if (!style || !BorderStyle[style]) {
    console.warn(
      `[mapBorderStyle] Invalid or unsupported border style: ${astBorder.style}`,
    );
    return undefined; // Skip border if style is invalid
  }

  // Build a writable object first
  const tempBorder: { [key: string]: any } = {
    // Use a generic writable object
    style: BorderStyle[style],
    color: color,
    size: size ? Math.round(size) : undefined,
    space: astBorder.space?.value, // Assuming space is a direct number mapping
  };

  // Clean undefined properties using reduce on the temporary object
  const finalBorder = Object.entries(tempBorder).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value; // Assign to generic accumulator
      }
      return acc;
    },
    {} as { [key: string]: any },
  ); // Use writable type for accumulator

  // Return cast to IBorderOptions only if valid
  return Object.keys(finalBorder).length > 0
    ? (finalBorder as IBorderOptions)
    : undefined;
}

// Helper function to map AST TableBorderProperties to docx ITableBordersOptions
function mapTableBorders(
  astBorders?: TableBorderProperties,
): ITableBordersOptions | undefined {
  if (!astBorders) return undefined;

  // Build a writable object first
  const tempBorders: { [key: string]: any } = {
    // Use a generic writable object
    top: mapBorderStyle(astBorders.top),
    left: mapBorderStyle(astBorders.left),
    bottom: mapBorderStyle(astBorders.bottom),
    right: mapBorderStyle(astBorders.right),
    insideHorizontal: mapBorderStyle(astBorders.insideH),
    insideVertical: mapBorderStyle(astBorders.insideV),
  };

  // Clean undefined properties using reduce on the temporary object
  const finalBorders = Object.entries(tempBorders).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value; // Assign to generic accumulator
      }
      return acc;
    },
    {} as { [key: string]: any },
  ); // Use writable type for accumulator

  // Return cast to ITableBordersOptions only if valid
  return Object.keys(finalBorders).length > 0
    ? (finalBorders as ITableBordersOptions)
    : undefined;
}

// Simple numbering configuration for basic lists
const numbering = {
  config: [
    {
      reference: "ooxml-bullet-list",
      levels: generateNumberingLevels("bullet"),
    },
    {
      reference: "ooxml-number-list",
      levels: generateNumberingLevels("number"),
    },
  ] as const,
};

// Define context type for passing list info
interface ProcessingContext {
  listLevel?: number;
  listRef?: string;
}

/**
 * Converts a DXA value to points.
 * @param dxa The value in twentieths of a point (DXA).
 * @returns The value in points, or undefined if input is invalid.
 */
function dxaToPoints(dxa: unknown): number | undefined {
  const num = Number(dxa);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    return num / 20;
  }
  return undefined;
}

/**
 * Unified plugin to convert an OOXML AST tree (OoxmlRoot) to a docx.js Document object.
 * Assigns the generated Document to file.result.
 */
// Make the plugin function return an async transformer function
export const ooxmlToDocx: Plugin<[], OoxmlRoot, Promise<void>> = () => {
  return async (tree: OoxmlRoot, file: VFile): Promise<void> => {
    // --- Log Input Tree ---
    console.log(
      `[ooxmlToDocx] Starting processing. Input tree type: ${tree?.type}, children count: ${tree?.children?.length}`,
    );
    // ----------------------
    const docxSections: ISectionOptions[] = [];
    let currentSectionChildren: DocxChild[] = [];

    // processNode needs to be async to handle awaits within loops
    const processNode = async (
      node: OoxmlNode,
      context: ProcessingContext = {},
      depth = 0,
    ): Promise<DocxChild[]> => {
      const indent = "  ".repeat(depth);
      let children: DocxChild[] = []; // Change to let for modification
      if (!node) {
        return children;
      }

      try {
        if (node.type === "element") {
          const element = node as OoxmlElement;
          const data = element.data || {};
          const properties = data.properties || {};

          if (data.ooxmlType === "paragraph") {
            const paragraphProps: Record<string, unknown> = {};
            const pFormatting = properties as ParagraphFormatting;
            paragraphProps.alignment = mapAlignment(pFormatting.alignment);
            if (pFormatting.outlineLevel !== undefined) {
              const outlineLevelNum = pFormatting.outlineLevel;
              if (
                !Number.isNaN(outlineLevelNum) &&
                outlineLevelNum >= 0 &&
                outlineLevelNum < 9
              ) {
                const headingKey =
                  `HEADING_${outlineLevelNum}` as keyof typeof HeadingLevel;
                if (HeadingLevel[headingKey]) {
                  paragraphProps.heading = HeadingLevel[headingKey];
                }
              }
            }
            if (pFormatting.thematicBreak) {
              paragraphProps.thematicBreak = true;
            }
            if (context.listLevel !== undefined && context.listRef) {
              paragraphProps.numbering = {
                reference: context.listRef,
                level: context.listLevel,
              };
            }

            // Handle tab stops from AST
            if (Array.isArray(pFormatting.tabs)) {
              paragraphProps.tabStops = pFormatting.tabs
                .map((tab) => {
                  if (
                    tab.position?.unit === "dxa" &&
                    typeof tab.position?.value === "number"
                  ) {
                    return {
                      type: tab.alignment,
                      position: tab.position.value,
                      leader: tab.leader,
                    };
                  }
                  return null;
                })
                .filter((ts) => ts !== null);
            }

            // Process paragraph children (runs, hyperlinks, images) asynchronously
            const runsPromises = (element.children || []).map(
              async (
                child,
              ): Promise<TextRun | ImageRun | ExternalHyperlink | null> => {
                if (
                  child.type === "element" &&
                  (child.data as OoxmlData)?.ooxmlType === "textRun"
                ) {
                  const runElement = child as OoxmlElement;
                  const imageRefChild = runElement.children?.find(
                    (c) =>
                      c.type === "element" &&
                      (c.data as OoxmlData)?.ooxmlType === "imageRef",
                  ) as OoxmlElement | undefined;

                  // --- Handle Image ---
                  if (imageRefChild) {
                    const imageProps = (imageRefChild.data?.properties ||
                      {}) as WmlImageRefProperties;
                    const imageUrl = imageProps.url;
                    if (!imageUrl) {
                      console.warn(
                        `${indent}[processNode] ImageRef found but missing URL.`,
                      );
                      // Return a placeholder TextRun if URL is missing
                      return new TextRun(
                        `[Image: ${imageProps.alt || "Missing URL"}]`,
                      );
                    }

                    try {
                      console.log(`${indent}  Fetching image: ${imageUrl}`);
                      const imageArrayBuffer = await ofetch(imageUrl, {
                        responseType: "arrayBuffer",
                      });
                      console.log(
                        `${indent}  Image fetched successfully: ${imageUrl}`,
                      );

                      let detectedType: string | undefined;
                      let detectedWidth: number | undefined;
                      let detectedHeight: number | undefined;
                      let imageRunType:
                        | "png"
                        | "jpeg"
                        | "gif"
                        | "bmp"
                        | "jpg"
                        | "svg"
                        | undefined; // Use jpeg for type matching
                      let imageRunOptions: IImageOptions; // Declare options variable

                      try {
                        const imageUint8Array = new Uint8Array(
                          imageArrayBuffer,
                        );
                        const meta = imageMeta(imageUint8Array);
                        detectedType = meta.type;
                        detectedWidth = meta.width;
                        detectedHeight = meta.height;
                        console.log(
                          `${indent}  Image meta detected: type=${detectedType}, width=${detectedWidth}, height=${detectedHeight}`,
                        );

                        switch (detectedType?.toLowerCase()) {
                          case "png":
                            imageRunType = "png";
                            break;
                          case "gif":
                            imageRunType = "gif";
                            break;
                          case "bmp":
                            imageRunType = "bmp";
                            break;
                          case "jpeg":
                          case "jpg":
                            imageRunType = "jpg";
                            break; // Map both jpg and jpeg to 'jpg'
                          case "svg":
                          case "svg+xml":
                            imageRunType = "svg";
                            break;
                          default:
                            console.warn(
                              `${indent}  Unsupported image type '${detectedType}' detected for ${imageUrl}.`,
                            );
                            imageRunType = undefined; // Explicitly set to undefined
                        }
                      } catch (metaError) {
                        console.warn(
                          `${indent}  Could not detect image meta for ${imageUrl}:`,
                          metaError,
                        );
                        // Fallback to placeholder if meta detection fails
                        return new TextRun(
                          `[Image Meta Error: ${imageProps.alt || imageUrl}]`,
                        );
                      }

                      if (!imageRunType) {
                        // Fallback to placeholder if type is unsupported or detection failed
                        return new TextRun(
                          `[Unsupported Image Type: ${imageProps.alt || imageUrl}]`,
                        );
                      }

                      // Use detected dimensions if available, otherwise default
                      const imageWidth = detectedWidth || 200; // Default width
                      const imageHeight = detectedHeight || 200; // Default height

                      const altTextOptions = {
                        title: imageProps.alt || imageProps.title || "Image",
                        description:
                          imageProps.alt || imageProps.title || "Image",
                        name: "Image", // You might want a more dynamic name
                      };

                      // Construct options based on type
                      if (imageRunType === "svg") {
                        imageRunOptions = {
                          type: "svg",
                          data: imageArrayBuffer,
                          altText: altTextOptions,
                          transformation: {
                            width: imageWidth,
                            height: imageHeight,
                          },
                          // Add fallback specifically for SVG
                          fallback: {
                            type: "png",
                            data: imageArrayBuffer,
                          },
                        };
                      } else {
                        // For non-SVG types, omit the fallback property
                        imageRunOptions = {
                          type: imageRunType as "png" | "jpg" | "gif" | "bmp", // Assert specific non-SVG types
                          data: imageArrayBuffer,
                          altText: altTextOptions,
                          transformation: {
                            width: imageWidth,
                            height: imageHeight,
                          },
                        };
                      }

                      // Create the ImageRun instance with the constructed options
                      return new ImageRun(imageRunOptions); // No need for extra assertion here if imageRunOptions is typed as IImageOptions
                    } catch (error) {
                      console.error(
                        `${indent}  Error processing image ${imageUrl}:`,
                        error,
                      );
                      // Fallback to placeholder on fetch or other errors
                      return new TextRun(
                        `[Image Error: ${imageProps.alt || imageUrl}]`,
                      );
                    }
                  } else {
                    // --- Handle Regular Text Run ---
                    const runProps = (runElement.data?.properties ||
                      {}) as FontProperties;
                    let textContent = "";
                    const textWrapper = runElement.children?.find(
                      (c) =>
                        c.type === "element" &&
                        (c.data as OoxmlData)?.ooxmlType ===
                          "textContentWrapper",
                    );
                    if (textWrapper?.type === "element") {
                      const textNode = textWrapper.children?.[0] as
                        | OoxmlText
                        | undefined;
                      if (textNode?.type === "text") {
                        textContent = textNode.value;
                      }
                    }

                    const convertedRunProps: Partial<IRunOptions> = {
                      bold: onOffToBoolean(runProps.bold),
                      italics: onOffToBoolean(runProps.italic),
                      strike: onOffToBoolean(runProps.strike),
                      doubleStrike: onOffToBoolean(runProps.doubleStrike),
                      // TODO: Add other run properties like font, size, color, underline
                    };

                    // Convert properties, ensuring correct types for docx.js
                    const runOptions: IRunOptions = {}; // Initialize empty options

                    // Object.keys(convertedRunProps).forEach((key) => {
                    for (const key of Object.keys(convertedRunProps)) {
                      const optionKey = key as keyof IRunOptions;
                      const value =
                        convertedRunProps[
                          key as keyof typeof convertedRunProps
                        ];
                      if (value !== undefined && value !== null) {
                        // Assign only if value is valid
                        (runOptions as any)[optionKey] = value;
                      }
                    }
                    // });

                    // Return TextRun only if there's text or specific formatting
                    if (
                      textContent ||
                      (runOptions && Object.keys(runOptions).length > 0)
                    ) {
                      return new TextRun({
                        text: textContent,
                        ...runOptions, // Spread the filtered options
                      });
                    }
                    return null; // Skip empty runs without formatting
                  }
                }
                // --- Handle Hyperlink ---
                else if (
                  child.type === "element" &&
                  (child.data as OoxmlData)?.ooxmlType === "hyperlink"
                ) {
                  const hyperlinkElement = child as OoxmlElement;
                  const hyperlinkProps = (hyperlinkElement.data?.properties ||
                    {}) as WmlHyperlinkProperties;
                  const linkRuns: TextRun[] = [];
                  // Process children of hyperlink (should be textRuns)
                  // NOTE: This assumes hyperlink children are only simple text runs for now
                  // A more robust solution might need async mapping here too if links can contain images
                  for (const linkChild of hyperlinkElement.children || []) {
                    if (
                      linkChild.type === "element" &&
                      (linkChild.data as OoxmlData)?.ooxmlType === "textRun"
                    ) {
                      // ... (existing code to create TextRun from linkChild) ...
                      const linkRunElement = linkChild as OoxmlElement;
                      const linkRunProps = (linkRunElement.data?.properties ||
                        {}) as FontProperties;
                      let linkTextContent = "";
                      const linkTextWrapper = linkRunElement.children?.find(
                        (c) =>
                          c.type === "element" &&
                          (c.data as OoxmlData)?.ooxmlType ===
                            "textContentWrapper",
                      );
                      if (linkTextWrapper?.type === "element") {
                        const linkTextNode = linkTextWrapper.children?.[0] as
                          | OoxmlText
                          | undefined;
                        if (linkTextNode?.type === "text") {
                          linkTextContent = linkTextNode.value;
                        }
                      }
                      const linkConvertedRunProps: Partial<IRunOptions> = {
                        bold: onOffToBoolean(linkRunProps.bold),
                        italics: onOffToBoolean(linkRunProps.italic),
                        // Add other styles if needed
                      };

                      const linkRunOptions: IRunOptions = {};

                      // Object.keys(linkConvertedRunProps).forEach((key) => {
                      for (const key of Object.keys(linkConvertedRunProps)) {
                        const optionKey = key as keyof IRunOptions;
                        const value =
                          linkConvertedRunProps[
                            key as keyof typeof linkConvertedRunProps
                          ];
                        if (value !== undefined && value !== null) {
                          (linkRunOptions as any)[optionKey] = value;
                        }
                      }
                      // });

                      if (
                        linkTextContent ||
                        (linkRunOptions &&
                          Object.keys(linkRunOptions).length > 0)
                      ) {
                        linkRuns.push(
                          new TextRun({
                            text: linkTextContent,
                            ...linkRunOptions, // Use the filtered options
                            style: "Hyperlink", // Apply hyperlink style
                          }),
                        );
                      }
                    }
                  }
                  if (linkRuns.length > 0 && hyperlinkProps.url) {
                    return new ExternalHyperlink({
                      children: linkRuns,
                      link: hyperlinkProps.url,
                    });
                  }
                  return null; // Skip invalid hyperlinks
                } else {
                  return null; // Skip other node types within paragraph for now
                }
              },
            );

            // Await all promises and filter out nulls
            const resolvedRuns = (await Promise.all(runsPromises)).filter(
              (r) => r !== null,
            ) as (TextRun | ImageRun | ExternalHyperlink)[];

            // Only add paragraph if it contains resolved runs
            if (resolvedRuns.length > 0) {
              children.push(
                new Paragraph({ ...paragraphProps, children: resolvedRuns }),
              );
            } else {
              console.log(`${indent}[processNode] Skipped empty paragraph.`);
            }
          } else if (data.ooxmlType === "list") {
            // ... existing list handling ...
            // Important: Need to await results from recursive calls
            const listProps = properties as { ordered?: boolean };
            const listRef = listProps.ordered
              ? "ooxml-number-list"
              : "ooxml-bullet-list";
            const listLevel =
              context.listLevel !== undefined ? context.listLevel + 1 : 0;
            const newContext: ProcessingContext = { listLevel, listRef };
            const listChildrenPromises = (element.children || []).map((child) =>
              processNode(child, newContext, depth + 1),
            );
            const resolvedListChildren =
              await Promise.all(listChildrenPromises);
            children.push(...resolvedListChildren.flat()); // Flatten the array of arrays
          } else if (data.ooxmlType === "listItem") {
            // ... existing listItem handling ...
            // Important: Need to await results from recursive calls
            const itemChildrenPromises = (element.children || []).map((child) =>
              processNode(child, context, depth + 1),
            );
            const resolvedItemChildren =
              await Promise.all(itemChildrenPromises);
            children.push(...resolvedItemChildren.flat()); // Flatten the array of arrays
          } else if (data.ooxmlType === "table") {
            const tableProps = properties as TableProperties;
            const tableRows: TableRow[] = [];
            let tableGridElement: OoxmlElement | undefined;
            const gridCols: number[] = [];

            // Find grid and row elements (sync)
            // element.children?.forEach((child) => {
            for (const child of element.children ?? []) {
              if (child.type === "element") {
                if (child.name === "w:tblGrid") {
                  tableGridElement = child as OoxmlElement;
                  // Store gridCol children
                  for (const gc of tableGridElement.children ?? []) {
                    if (
                      gc.type === "element" &&
                      gc.name === "w:gridCol" &&
                      gc.attributes?.["w:w"]
                    ) {
                      gridCols.push(
                        Number.parseInt(gc.attributes["w:w"] as string, 10),
                      );
                    }
                  }
                  console.log(
                    `${indent}  Found tableGrid with ${gridCols.length} columns.`,
                  );
                } else if (child.name === "w:tr") {
                  // Row processing needs to be async due to cell content
                }
              }
            }
            // });

            // Process rows asynchronously
            const rowPromises = (element.children || [])
              .filter(
                (child) =>
                  child.type === "element" &&
                  (child.data as OoxmlData)?.ooxmlType === "tableRow",
              )
              // REMOVE explicit type annotation for rowElement
              .map(async (rowElement) => {
                // Now rowElement should be inferred correctly or asserted inside if needed
                const tableCells: TableCell[] = [];
                // Filter for elements and provide type for cellChild
                // Type assertion might be needed if inference fails after filter
                const cellPromises = (
                  (rowElement as OoxmlElement).children || []
                )
                  .filter(
                    (c): c is OoxmlElement =>
                      c.type === "element" &&
                      (c.data as OoxmlData)?.ooxmlType === "tableCell",
                  )
                  // Provide type for cellElement
                  .map(async (cellElement: OoxmlElement) => {
                    const cellProps = (cellElement.data?.properties ||
                      {}) as TableCellProperties;
                    // Process cell content asynchronously
                    // Provide type for contentNode
                    const cellContentPromises = (
                      cellElement.children || []
                    ).map((contentNode: OoxmlElementContent) =>
                      processNode(contentNode, {}, depth + 1),
                    );
                    const cellContent = (
                      await Promise.all(cellContentPromises)
                    ).flat();

                    if (cellContent.length === 0) {
                      cellContent.push(new Paragraph(""));
                    }

                    const tempCellOpts: any = { children: cellContent };
                    // ... (map cellProps like gridSpan, verticalAlign to tempCellOpts)
                    const span = Number(cellProps.gridSpan);
                    if (!Number.isNaN(span) && span > 0) {
                      tempCellOpts.columnSpan = span;
                    }
                    if (cellProps.verticalAlign) {
                      const valignMap = {
                        top: VerticalAlign.TOP,
                        center: VerticalAlign.CENTER,
                        bottom: VerticalAlign.BOTTOM,
                      };
                      tempCellOpts.verticalAlign =
                        valignMap[cellProps.verticalAlign];
                    }
                    // TODO: Map borders, shading, margins

                    return new TableCell(tempCellOpts as ITableCellOptions);
                  });
                const resolvedCells = await Promise.all(cellPromises);
                if (resolvedCells.length > 0) {
                  return new TableRow({ children: resolvedCells });
                }
                return null;
              });

            const resolvedRows = (await Promise.all(rowPromises)).filter(
              (r) => r !== null,
            ) as TableRow[];

            const columnCount = gridCols.length;
            if (resolvedRows.length > 0 && columnCount > 0) {
              const tempTableOpts: ITableOptions = {
                rows: resolvedRows,
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE, // Set width to 100% of page
                },
              };
              // ... (existing table property mapping like width, borders, etc.) ...
              children.push(new Table(tempTableOpts));
            } else {
              console.log(
                `${indent}[processNode] Table generated no rows or column count was zero.`,
              );
            }
          } else {
            // ... handle other element types or skip ...
            // Recursively process children asynchronously for unhandled elements
            const otherChildrenPromises = (element.children || []).map(
              (child) => processNode(child, context, depth + 1),
            );
            const resolvedOtherChildren = await Promise.all(
              otherChildrenPromises,
            );
            children.push(...resolvedOtherChildren.flat());
          }
        } else if (node.type === "text") {
          // Text nodes handled within runs
        } else if (node.type === "root") {
          // Process root children asynchronously
          const rootChildrenPromises = (node as OoxmlRoot).children.map(
            (child) => processNode(child, {}, depth + 1),
          );
          const resolvedRootChildren = await Promise.all(rootChildrenPromises);
          children = resolvedRootChildren.flat(); // Assign directly to children
        } else {
          // ... handle other node types ...
        }
      } catch (error) {
        // ... error handling ...
      }
      return children;
    };

    // Start processing from the root, now awaiting the result
    currentSectionChildren = await processNode(tree);
    console.log(
      `[ooxmlToDocx] Finished processing nodes. Generated ${currentSectionChildren.length} top-level children.`,
    );

    // ... create sections and document (sync) ...
    if (currentSectionChildren.length > 0) {
      docxSections.push({
        properties: {},
        children: currentSectionChildren,
      });
    } else {
      docxSections.push({
        properties: {},
        children: [new Paragraph("Generated document is empty.")],
      });
      console.warn(
        "[ooxmlToDocx] No content generated for the document section.",
      );
    }

    // Create the Document object
    const doc = new Document({
      sections: docxSections,
      numbering: numbering,
    });
    console.log("[ooxmlToDocx] Document object created successfully.");

    // Assign the Document object to file.result
    file.result = doc;
    console.log("[ooxmlToDocx] Assigned Document object to file.result.");
  }; // End of async transformer function
}; // End of plugin definition

// Helper function placeholder (if needed later)
/*
function mapMoreTableProps(...) { ... }
*/
