import { defu } from "defu";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  type IBorderOptions,
  type IImageOptions,
  type ILevelsOptions,
  type IRunOptions,
  type ISectionOptions,
  type ITableBordersOptions,
  type ITableCellOptions,
  type ITableOptions,
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
import { loadDocxTemplate } from "../templates/loader";

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
  const tempBorder: Record<string, unknown> = {
    // Use a generic writable object
    style: BorderStyle[style],
    color: color,
    size: size ? Math.round(size) : undefined,
    space: astBorder.space?.value, // Assuming space is a direct number mapping
  };

  // Clean undefined properties using reduce on the temporary object
  const finalBorder = Object.entries(tempBorder).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      (acc as Record<string, unknown>)[key] = value;
    }
    return acc;
  }, {} as IBorderOptions);

  return finalBorder;
}

// Helper function to convert table borders
function mapTableBorders(
  astBorders?: TableBorderProperties,
): ITableBordersOptions | undefined {
  if (!astBorders) return undefined;

  const mappedBorders: Record<string, IBorderOptions> = {};

  // Map each border type
  const borderTypes = [
    "top",
    "bottom",
    "left",
    "right",
    "insideH",
    "insideV",
  ] as const;

  for (const borderType of borderTypes) {
    const astBorder = astBorders[borderType];
    if (astBorder) {
      const mappedBorder = mapBorderStyle(astBorder);
      if (mappedBorder) {
        mappedBorders[borderType] = mappedBorder;
      }
    }
  }

  return Object.keys(mappedBorders).length > 0
    ? (mappedBorders as ITableBordersOptions)
    : undefined;
}

interface ProcessingContext {
  listLevel?: number;
  listRef?: string;
}

function dxaToPoints(dxa: unknown): number | undefined {
  if (typeof dxa === "number") {
    return dxa / 20; // 1 point = 20 dxa
  }
  return undefined;
}

// Import shared types
import type { ToDocxOptions } from "../types";

/**
 * Serialize OOXML AST to DOCX Document object
 * Follows unified.js naming convention (similar to toXml, toMarkdown)
 *
 * Based on the original ooxmlToDocx implementation but adapted for unified.js patterns
 */
export const ooxastToDocx: Plugin<
  [ToDocxOptions?],
  OoxmlRoot,
  Promise<void>
> = (options: ToDocxOptions = {}) => {
  return async (tree: OoxmlRoot, file: VFile): Promise<void> => {
    let finalOptions = { ...options };

    // Process template configuration
    if (options.template) {
      try {
        // Load preset template using c12
        if (options.template.preset) {
          if (options.debug) {
            console.log(`Loading template preset: ${options.template.preset}`);
          }

          const templateResult = await loadDocxTemplate({
            preset: options.template.preset,
            debug: options.template.debug || options.debug,
          });

          if (templateResult.config) {
            // Apply template configuration using defu for deep merging
            finalOptions = defu(finalOptions, {
              metadata: templateResult.config.metadata,
              pageSettings: templateResult.config.pageSettings,
              template: { config: templateResult.config },
            }) as ToDocxOptions;

            if (options.debug) {
              console.log("Template preset applied successfully");
            }
          }
        }

        // Use provided template configuration directly
        else if (options.template.config) {
          if (options.debug) {
            console.log("Using provided template configuration");
          }

          finalOptions = defu(finalOptions, {
            metadata: options.template.config.metadata,
            pageSettings: options.template.config.pageSettings,
            template: { config: options.template.config },
          }) as ToDocxOptions;
        }
      } catch (error) {
        console.error("Failed to process template configuration:", error);
        if (options.debug) {
          throw error;
        }
        // Continue with original options if template processing fails
      }
    }

    if (finalOptions.debug) {
      console.log("ooxastToDocx plugin: Starting OOXML AST serialization");
      if (finalOptions.template) {
        console.log("Template configuration:", finalOptions.template);
      }
    }

    // --- Log Input Tree ---
    console.log(
      `[toDocx] Starting processing. Input tree type: ${tree?.type}, children count: ${tree?.children?.length}`,
    );
    // ----------------------
    const docxSections: ISectionOptions[] = [];
    let currentSectionChildren: DocxChild[] = [];

    // Define numbering for lists
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
      ],
    };

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

            // --- Apply Style ID --- //
            if (pFormatting.styleId) {
              paragraphProps.style = pFormatting.styleId;
            }

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

                    // Attempt to find a direct <w:t> child element
                    const textElement = runElement.children?.find(
                      (c) => c.type === "element" && c.name === "w:t",
                    ) as OoxmlElement | undefined;

                    if (textElement) {
                      // Extract text value from the first text node child of <w:t>
                      const textNode = textElement.children?.[0] as
                        | OoxmlText
                        | undefined;
                      if (textNode && textNode.type === "text") {
                        textContent = textNode.value;
                      }
                    } else {
                      // Fallback or alternative search if needed, maybe log a warning
                      console.warn(
                        `${indent}  Could not find <w:t> element within <w:r> for text extraction.`,
                      );
                    }

                    const convertedRunProps: Partial<IRunOptions> = {
                      bold: onOffToBoolean(runProps.bold),
                      italics: onOffToBoolean(runProps.italic), // Direct conversion
                      strike: onOffToBoolean(runProps.strike),
                      doubleStrike: onOffToBoolean(runProps.doubleStrike),
                      // Directly map the font property if it exists
                      ...(runProps.font && { font: runProps.font }),
                      // Additional run properties from OOXML WML specifications
                      ...(runProps.size && {
                        size: Math.round(runProps.size.value * 2), // Convert points to half-points
                      }),
                      ...(runProps.color && {
                        color: runProps.color.value?.startsWith("#")
                          ? runProps.color.value.substring(1)
                          : runProps.color.value,
                      }),
                      ...(runProps.underline && {
                        underline: {
                          type:
                            runProps.underline.style === "dashed"
                              ? "dash"
                              : (runProps.underline.style as
                                  | "single"
                                  | "double"
                                  | "thick"
                                  | "dotted"
                                  | "wave") || "single",
                          ...(runProps.underline.color && {
                            color: runProps.underline.color.value?.startsWith(
                              "#",
                            )
                              ? runProps.underline.color.value.substring(1)
                              : runProps.underline.color.value,
                          }),
                        },
                      }),
                      // Note: highlight property requires specific enum values, skipping for now
                      ...(runProps.effect === "smallCaps" && {
                        smallCaps: true,
                      }),
                      ...(runProps.effect === "allCaps" && {
                        allCaps: true,
                      }),
                      ...(runProps.vertAlign === "subscript" && {
                        subScript: true,
                      }),
                      ...(runProps.vertAlign === "superscript" && {
                        superScript: true,
                      }),
                    };

                    // Convert properties, ensuring correct types for docx.js
                    const runOptions: IRunOptions = {}; // Initialize empty options

                    for (const key of Object.keys(convertedRunProps)) {
                      const optionKey = key as keyof IRunOptions;
                      const value =
                        convertedRunProps[
                          key as keyof typeof convertedRunProps
                        ];
                      if (value !== undefined && value !== null) {
                        // Assign only if value is valid - use type assertion instead of any
                        (runOptions as Record<string, unknown>)[optionKey] =
                          value;
                      }
                    }

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

                      for (const key of Object.keys(linkConvertedRunProps)) {
                        const optionKey = key as keyof IRunOptions;
                        const value =
                          linkConvertedRunProps[
                            key as keyof typeof linkConvertedRunProps
                          ];
                        if (value !== undefined && value !== null) {
                          (linkRunOptions as Record<string, unknown>)[
                            optionKey
                          ] = value;
                        }
                      }

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

            // ALWAYS add the paragraph, even if it has no runs (e.g., empty line in code block).
            // The paragraphProps (like style) are important to preserve structure.
            children.push(
              new Paragraph({ ...paragraphProps, children: resolvedRuns }),
            );
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
            let tableGridElement: OoxmlElement | undefined;

            // Find grid and row elements using ooxmlType instead of XML names
            for (const child of element.children ?? []) {
              if (child.type === "element") {
                const childData = (child as OoxmlElement).data as
                  | OoxmlData
                  | undefined;
                if (childData?.ooxmlType === "tableGrid") {
                  tableGridElement = child as OoxmlElement;
                  // Store gridCol children
                  for (const gc of tableGridElement.children ?? []) {
                    if (
                      gc.type === "element" &&
                      (gc.data as OoxmlData)?.ooxmlType === "tableGridCol"
                    ) {
                      const gcProps = (gc.data as OoxmlData)?.properties as
                        | { width?: { value: number } }
                        | undefined;
                      if (gcProps?.width?.value) {
                        // gridCols.push(gcProps.width.value); // This line is removed
                      }
                    }
                  }
                  console.log(
                    `${indent}  Found tableGrid with ${tableGridElement.children?.length || 0} columns.`,
                  );
                }
              }
            }

            // Process rows asynchronously
            const rowPromises = (element.children || [])
              .filter(
                (child) =>
                  child.type === "element" &&
                  (child.data as OoxmlData)?.ooxmlType === "tableRow",
              )
              .map(async (rowElement) => {
                const cellPromises = (
                  (rowElement as OoxmlElement).children || []
                )
                  .filter(
                    (c): c is OoxmlElement =>
                      c.type === "element" &&
                      (c.data as OoxmlData)?.ooxmlType === "tableCell",
                  )
                  .map(async (cellElement: OoxmlElement) => {
                    const cellProps = (cellElement.data?.properties ||
                      {}) as TableCellProperties;

                    // Process cell content asynchronously
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

                    const tempCellOpts: Record<string, unknown> = {
                      children: cellContent,
                    };

                    // Map cell properties
                    if (cellProps.gridSpan && cellProps.gridSpan > 1) {
                      tempCellOpts.columnSpan = cellProps.gridSpan;
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

                    // Map cell borders if available
                    if (cellProps.borders) {
                      const mappedBorders = mapTableBorders(cellProps.borders);
                      if (mappedBorders) {
                        tempCellOpts.borders = mappedBorders;
                      }
                    }

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

            if (resolvedRows.length > 0) {
              const tempTableOpts: Record<string, unknown> = {
                rows: resolvedRows,
                width: {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                },
              };

              // Apply table-level properties
              if (tableProps.borders) {
                const mappedTableBorders = mapTableBorders(tableProps.borders);
                if (mappedTableBorders) {
                  tempTableOpts.borders = mappedTableBorders;
                }
              }

              if (
                tableProps.width &&
                typeof tableProps.width === "object" &&
                tableProps.width !== null &&
                "unit" in tableProps.width
              ) {
                const widthObj = tableProps.width as {
                  value: number;
                  unit: string;
                };
                if (widthObj.unit === "pct") {
                  tempTableOpts.width = {
                    size: widthObj.value,
                    type: WidthType.PERCENTAGE,
                  };
                } else if (widthObj.unit === "dxa") {
                  tempTableOpts.width = {
                    size: dxaToPoints(widthObj.value) || widthObj.value,
                    type: WidthType.DXA,
                  };
                }
              }

              children.push(new Table(tempTableOpts as ITableOptions));
            } else {
              console.log(`${indent}[processNode] Table generated no rows.`);
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
        console.error(`Error processing node at depth ${depth}:`, error);
        file.message(new Error(`Node processing failed: ${String(error)}`));
      }
      return children;
    };

    // Start processing from the root, now awaiting the result
    currentSectionChildren = await processNode(tree);
    console.log(
      `[toDocx] Finished processing nodes. Generated ${currentSectionChildren.length} top-level children.`,
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
      console.warn("[toDocx] No content generated for the document section.");
    }

    // Create the Document object with template support
    const docOptions = {
      sections: docxSections,
      numbering: numbering,
      ...(finalOptions.metadata && {
        creator: finalOptions.metadata.creator,
        description: finalOptions.metadata.description,
        title: finalOptions.metadata.title,
        subject: finalOptions.metadata.subject,
        lastModifiedBy: finalOptions.metadata.lastModifiedBy,
        keywords: finalOptions.metadata.keywords,
        category: finalOptions.metadata.category,
      }),
      ...(finalOptions.externalStyles && {
        externalStyles: finalOptions.externalStyles,
      }),
    };

    // Apply custom styles from template configuration
    if (finalOptions.template?.config?.styles) {
      const stylesConfig: Record<string, unknown> = {};
      const templateStyles = finalOptions.template.config.styles;

      if (templateStyles.paragraphStyles) {
        stylesConfig.paragraphStyles = templateStyles.paragraphStyles.map(
          (style) => ({
            id: style.id,
            name: style.name,
            basedOn: style.basedOn,
            next: style.next,
            quickFormat: style.quickFormat,
            run: style.run,
            paragraph: style.paragraph,
          }),
        );
      }

      if (templateStyles.characterStyles) {
        stylesConfig.characterStyles = templateStyles.characterStyles;
      }

      if (templateStyles.tableStyles) {
        stylesConfig.tableStyles = templateStyles.tableStyles;
      }

      if (templateStyles.listStyles) {
        stylesConfig.listStyles = templateStyles.listStyles;
      }

      if (Object.keys(stylesConfig).length > 0) {
        Object.assign(docOptions, { styles: stylesConfig });
      }
    }

    const doc = new Document(docOptions);
    console.log("[toDocx] Document object created successfully.");

    // Assign the Document object to file.result
    file.result = doc;
    console.log("[toDocx] Assigned Document object to file.result.");
  }; // End of async transformer function
}; // End of plugin definition
