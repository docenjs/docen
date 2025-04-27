import {
  AbstractNumbering,
  Alignment,
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  type IRunOptions,
  type ISectionOptions,
  Level,
  LevelSuffix,
  Numbering,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";
import type { Plugin } from "unified";
import { CONTINUE, SKIP, visit } from "unist-util-visit";
import type { VFile } from "vfile";
import type {
  FontProperties,
  OnOffValue,
  OoxmlData,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlNode,
  OoxmlRoot,
  OoxmlText,
  ParagraphFormatting,
  WmlTableCellProperties as TableCellProperties,
  WmlTableProperties as TableProperties,
} from "../ast";

// Define the type for the objects that docx.Document expects in its sections.children array
type DocxChild = Paragraph | Table; // Added Table

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

// Simple numbering configuration for basic lists
const numbering = {
  config: [
    {
      reference: "ooxml-bullet-list",
      levels: [
        {
          level: 0,
          format: "bullet" as const,
          text: "\u2022",
          alignment: "left",
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 },
            },
          },
        },
      ],
    },
    {
      reference: "ooxml-number-list",
      levels: [
        {
          level: 0,
          format: "decimal" as const,
          text: "%1.",
          alignment: "left",
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 },
            },
          },
        },
      ],
    },
  ] as const,
};

// Define context type for passing list info
interface ProcessingContext {
  listLevel?: number;
  listRef?: string;
}

/**
 * Unified plugin to convert an OOXML AST tree (OoxmlRoot) to a docx.js Document object.
 * Assigns the generated Document to file.result.
 */
// Revert Plugin signature and function signature to synchronous, outputting Document via file.result
export const ooxmlToDocx: Plugin<[], OoxmlRoot, void> = () => {
  return (tree: OoxmlRoot, file: VFile): void => {
    // --- Log Input Tree ---
    console.log(
      `[ooxmlToDocx] Starting processing. Input tree type: ${tree?.type}, children count: ${tree?.children?.length}`,
    );
    // ----------------------
    const docxSections: ISectionOptions[] = [];
    let currentSectionChildren: DocxChild[] = [];

    const processNode = (
      node: OoxmlNode,
      context: ProcessingContext = {},
      depth = 0,
    ): DocxChild[] => {
      const indent = "  ".repeat(depth);
      console.log(
        `${indent}[processNode] Processing node type: ${node?.type}, ooxmlType: ${(node as any)?.data?.ooxmlType}`,
      );
      const children: DocxChild[] = [];
      if (!node) {
        console.log(`${indent}[processNode] Node is null or undefined.`);
        return children;
      }

      try {
        // Add try...catch around node processing
        if (node.type === "element") {
          const element = node as OoxmlElement;
          const data = element.data || {};
          const properties = data.properties || {};
          console.log(
            `${indent}[processNode] Element ooxmlType: ${data.ooxmlType}`,
          );

          if (data.ooxmlType === "paragraph") {
            console.log(`${indent}[processNode] Handling paragraph...`);
            const paragraphProps: any = {};
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
                  `HEADING_${outlineLevelNum + 1}` as keyof typeof HeadingLevel;
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
            const runs: TextRun[] = [];
            for (const child of element.children || []) {
              if (
                child.type === "element" &&
                (child.data as OoxmlData)?.ooxmlType === "textRun"
              ) {
                const runElement = child as OoxmlElement;
                const runProps = (runElement.data?.properties ||
                  {}) as FontProperties;
                let textContent = "";
                const textWrapper = runElement.children?.[0];
                if (
                  textWrapper?.type === "element" &&
                  (textWrapper.data as OoxmlData)?.ooxmlType ===
                    "textContentWrapper"
                ) {
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
                };

                // Use for...of loop instead of forEach to remove undefined properties
                for (const key of Object.keys(convertedRunProps)) {
                  const typedKey = key as keyof IRunOptions;
                  if (convertedRunProps[typedKey] === undefined) {
                    delete convertedRunProps[typedKey];
                  }
                }

                if (textContent || Object.keys(convertedRunProps).length > 0) {
                  runs.push(
                    new TextRun({ text: textContent, ...convertedRunProps }),
                  );
                }
              }
            }
            children.push(new Paragraph({ ...paragraphProps, children: runs }));
            console.log(`${indent}[processNode] Added Paragraph.`);
          } else if (data.ooxmlType === "list") {
            console.log(`${indent}[processNode] Handling list...`);
            const listRef = (properties as { ordered?: boolean }).ordered
              ? "ooxml-number-list"
              : "ooxml-bullet-list";
            const listLevel =
              context.listLevel !== undefined ? context.listLevel + 1 : 0;
            const newContext: ProcessingContext = {
              ...context,
              listLevel,
              listRef,
            };
            for (const child of element.children || []) {
              children.push(...processNode(child, newContext, depth + 1));
            }
            console.log(`${indent}[processNode] Finished list.`);
          } else if (data.ooxmlType === "listItem") {
            console.log(`${indent}[processNode] Handling listItem...`);
            for (const child of element.children || []) {
              children.push(...processNode(child, context, depth + 1));
            }
            console.log(`${indent}[processNode] Finished listItem.`);
          } else if (data.ooxmlType === "table") {
            console.log(`${indent}[processNode] Handling table...`);
            const tableProps = properties as TableProperties;
            const tableRows: TableRow[] = [];
            let columnCount = 0;
            let tableGridElement: OoxmlElement | undefined;

            // First pass: Find the table grid and process rows
            for (const child of element.children || []) {
              if (child.type === "element") {
                const childData = child.data as OoxmlData | undefined;
                if (childData?.ooxmlType === "tableGrid") {
                  tableGridElement = child as OoxmlElement;
                  // Count columns from gridCol children
                  columnCount =
                    tableGridElement.children?.filter(
                      (gc) =>
                        gc.type === "element" &&
                        (gc.data as OoxmlData)?.ooxmlType === "tableGridCol",
                    ).length ?? 0;
                  console.log(
                    `${indent}  Found tableGrid with ${columnCount} columns.`,
                  );
                } else if (childData?.ooxmlType === "tableRow") {
                  // Process row (same logic as before)
                  const rowElement = child as OoxmlElement;
                  const tableCells: TableCell[] = [];
                  for (const cellChild of rowElement.children || []) {
                    if (
                      cellChild.type === "element" &&
                      (cellChild.data as OoxmlData)?.ooxmlType === "tableCell"
                    ) {
                      const cellElement = cellChild as OoxmlElement;
                      const cellProps = (cellElement.data?.properties ||
                        {}) as TableCellProperties;
                      const cellContent: (Paragraph | Table)[] = [];
                      for (const contentNode of cellElement.children || []) {
                        cellContent.push(...processNode(contentNode, {}));
                      }
                      const docxCellProps: any = { children: cellContent };
                      if (cellProps.gridSpan !== undefined) {
                        const span = cellProps.gridSpan;
                        if (!Number.isNaN(span)) {
                          docxCellProps.columnSpan = span;
                        }
                      }
                      // TODO: Add cell border/shading/valign mapping from cellProps
                      tableCells.push(new TableCell(docxCellProps));
                    }
                  }
                  if (tableCells.length > 0) {
                    tableRows.push(new TableRow({ children: tableCells }));
                  }
                }
              }
            }

            if (tableRows.length > 0 && columnCount > 0) {
              // --- Prepare docx.Table properties ---
              const docxTableProps: any = { rows: tableRows };

              // 1. Calculate column widths (example: equal percentage)
              const columnWidths = Array(columnCount).fill(100 / columnCount);
              docxTableProps.columnWidths = columnWidths;
              console.log(`${indent}  Calculated columnWidths:`, columnWidths);

              // 2. Apply width property from AST if available
              if (tableProps.width) {
                if (tableProps.width === "auto") {
                  docxTableProps.width = { size: 0, type: WidthType.AUTO }; // Use 0 for AUTO size
                  console.log(`${indent}  Applied width from props: auto`);
                } else if (
                  typeof tableProps.width === "object" &&
                  tableProps.width !== null
                ) {
                  // Now we are sure it's an object (Measurement or { value, unit: 'pct' })
                  if (
                    "unit" in tableProps.width &&
                    tableProps.width.unit === "pct"
                  ) {
                    // Assuming { value: number; unit: "pct"; }
                    const percentWidth = tableProps.width.value;
                    docxTableProps.width = {
                      size: percentWidth,
                      type: WidthType.PERCENTAGE,
                    };
                    console.log(
                      `${indent}  Applied width from props: ${percentWidth}%`,
                    );
                  } else if (
                    "value" in tableProps.width &&
                    "unit" in tableProps.width
                  ) {
                    // Handle other Measurement units (e.g., dxa) - TBD
                    console.warn(
                      `${indent}  Unhandled table width object type/unit: ${tableProps.width.unit}`,
                    );
                    docxTableProps.width = {
                      size: 100,
                      type: WidthType.PERCENTAGE,
                    }; // Fallback
                  } else {
                    // Unknown object structure
                    console.warn(
                      `${indent}  Unknown table width object structure in props:`,
                      tableProps.width,
                    );
                    docxTableProps.width = {
                      size: 100,
                      type: WidthType.PERCENTAGE,
                    }; // Fallback
                  }
                } else {
                  // Should not happen if type definition is correct, but handle defensively
                  console.warn(
                    `${indent}  Unexpected table width type in props:`,
                    typeof tableProps.width,
                    tableProps.width,
                  );
                  docxTableProps.width = {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                  }; // Fallback
                }
              } else {
                // Default width if not specified in props
                docxTableProps.width = {
                  size: 100,
                  type: WidthType.PERCENTAGE,
                };
                console.log(`${indent}  Using default table width: 100%`);
              }

              // 3. Apply border properties from AST
              if (tableProps.borders) {
                // TODO: Convert WmlTableBorderProperties to docx ITableBordersOptions if needed
                // Assuming direct mapping works for basic styles for now
                docxTableProps.borders = tableProps.borders;
                console.log(`${indent}  Applied borders from props.`);
              } else {
                console.log(
                  `${indent}  No border properties found in AST data.`,
                );
                // Optionally add default borders here if none are provided
              }
              // --- End docx.Table properties preparation ---

              children.push(new Table(docxTableProps));
              console.log(`${indent}[processNode] Added Table.`);
            } else {
              console.log(
                `${indent}[processNode] Table generated no rows or column count was zero.`,
              );
            }
            console.log(`${indent}[processNode] Finished table.`);
          } else if (
            ["textRun", "tableRow", "tableCell", "textContentWrapper"].includes(
              data.ooxmlType || "",
            )
          ) {
            console.log(
              `${indent}[processNode] Skipping handled type: ${data.ooxmlType}`,
            );
            // Special case: process children of tableCell recursively
            if (data.ooxmlType === "tableCell") {
              console.log(
                `${indent}  [processNode] Processing children of tableCell...`,
              );
              const cellContent: (Paragraph | Table)[] = [];
              for (const contentNode of element.children || []) {
                cellContent.push(...processNode(contentNode, {}, depth + 1));
              }
              // Note: This recursive call result isn't directly added to `children` here,
              // it's handled within the 'table' type logic which calls processNode for cell content.
              // This log is just to see if cell processing is reached.
            }
          } else {
            console.log(
              `${indent}[processNode] Unhandled element ooxmlType: ${data.ooxmlType}`,
            );
            // Recursively process children of unhandled elements too?
            // for(const child of element.children || []){
            //     children.push(...processNode(child, context, depth + 1));
            // }
          }
        } else if (node.type === "text") {
          console.log(
            `${indent}[processNode] Handling text node: "${(node as OoxmlText).value?.substring(0, 30)}..."`,
          );
        } else if (node.type === "root") {
          console.log(`${indent}[processNode] Handling root node...`);
          for (const child of (node as OoxmlRoot).children || []) {
            children.push(...processNode(child, {}, depth + 1)); // Start children at depth 1
          }
          console.log(`${indent}[processNode] Finished root node.`);
        } else {
          console.log(
            `${indent}[processNode] Unhandled node type: ${node?.type}`,
          );
        }
      } catch (error) {
        console.error(
          `${indent}[processNode] Error processing node:`,
          node,
          error,
        );
        // Decide whether to re-throw or just log and continue
        // throw error; // Re-throwing might hide subsequent errors
      }
      return children;
    };

    // Start processing from the root
    currentSectionChildren = processNode(tree);
    console.log(
      `[ooxmlToDocx] Finished processing nodes. Generated ${currentSectionChildren.length} top-level children.`,
    );

    // Create sections
    if (currentSectionChildren.length > 0) {
      docxSections.push({
        properties: {},
        children: currentSectionChildren,
      });
    } else {
      docxSections.push({
        properties: {},
        children: [new Paragraph("")],
      });
      // Keep warn log if needed
      // console.warn("ooxmlToDocx: Generated document was empty...");
    }

    // Create the Document object
    const doc = new Document({
      sections: docxSections,
      numbering: numbering,
    });
    console.log("[ooxmlToDocx] Document object created successfully.");

    // Remove internal logs
    // console.log(`[ooxmlToDocx] Created docx.Document object: ${!!doc}`);

    // Remove Packer logic
    // try { ... } catch { ... }

    // Assign the Document object to file.result
    try {
      // Add try...catch around the main processing and assignment
      file.result = doc;
      console.log("[ooxmlToDocx] Assigned Document object to file.result.");
    } catch (error) {
      console.error(
        "[ooxmlToDocx] Error during main processing or assignment:",
        error,
      );
      file.result = undefined; // Ensure result is undefined on error
    }
  };
};
