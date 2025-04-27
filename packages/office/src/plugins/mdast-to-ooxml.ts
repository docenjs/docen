import type {
  BlockContent,
  DefinitionContent,
  Emphasis,
  Heading,
  Link,
  List,
  ListItem,
  RootContent as MdastContent,
  Paragraph as MdastParagraph,
  Root as MdastRoot,
  Table as MdastTable,
  TableCell as MdastTableCell,
  TableRow as MdastTableRow,
  Text as MdastText,
  ThematicBreak as MdastThematicBreak,
  PhrasingContent,
  Strong,
} from "mdast";
import type { Plugin } from "unified";
import { SKIP, visit } from "unist-util-visit";
import type { VFile } from "vfile";
import type {
  BorderStyleProperties,
  FontProperties,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlNode,
  OoxmlRoot,
  OoxmlText,
  ParagraphFormatting,
  WmlTableCellProperties,
  WmlTableProperties,
} from "../ast";

// Define interface for formatting state used during inline processing
interface FormattingState {
  bold?: boolean;
  italics?: boolean;
  // Add other states like strike, code font etc. later
}

// Helper function to process inline MDAST nodes into OOXML AST PhrasingContent
function processInlineContent(
  nodes: PhrasingContent[],
  currentState: FormattingState = {},
): OoxmlElementContent[] {
  // Return OOXML AST nodes
  const ooxmlContent: OoxmlElementContent[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      // If there's formatting, wrap in a textRun element
      if (currentState.bold || currentState.italics) {
        const textRun: OoxmlElement = {
          type: "element",
          name: "w:r", // Use WML tag name for potential future direct XML generation
          attributes: {},
          children: [
            {
              type: "element",
              name: "w:t",
              attributes: {},
              children: [
                {
                  type: "text",
                  value: node.value,
                  data: { ooxmlType: "text" },
                } as OoxmlText,
              ],
              data: { ooxmlType: "textContentWrapper" },
            },
          ],
          data: {
            ooxmlType: "textRun",
            properties: { ...currentState } as FontProperties,
          },
        };
        ooxmlContent.push(textRun);
      } else {
        // If no formatting, create a simple text node wrapper
        // (Or should plain text also be in a run? Check docx-to-ooxml)
        // Let's assume plain text is also in a run for consistency
        const textRun: OoxmlElement = {
          type: "element",
          name: "w:r",
          attributes: {},
          children: [
            {
              type: "element",
              name: "w:t",
              attributes: {},
              children: [
                {
                  type: "text",
                  value: node.value,
                  data: { ooxmlType: "text" },
                } as OoxmlText,
              ],
              data: { ooxmlType: "textContentWrapper" },
            },
          ],
          data: { ooxmlType: "textRun" }, // No specific properties
        };
        ooxmlContent.push(textRun);
      }
    } else if (node.type === "strong") {
      // Recursively call with updated state
      ooxmlContent.push(
        ...processInlineContent(node.children, { ...currentState, bold: true }),
      );
    } else if (node.type === "emphasis") {
      // Recursively call with updated state
      ooxmlContent.push(
        ...processInlineContent(node.children, {
          ...currentState,
          italics: true,
        }),
      );
    }
    // TODO: Handle inlineCode, link, image, break, delete etc.
  }
  return ooxmlContent;
}

/**
 * Unified plugin to convert an MDAST tree to an OOXML AST tree (OoxmlRoot).
 * The resulting OoxmlRoot object will be attached to `vfile.result`.
 */
export const mdastToOoxml: Plugin<[], MdastRoot, OoxmlRoot> = () => {
  return (tree: MdastRoot, file: VFile): void => {
    const ooxmlChildren: OoxmlElementContent[] = [];

    visit(tree, (node, index, parent) => {
      if (node.type === "paragraph") {
        const mdastParagraph = node as MdastParagraph;
        const paragraphContent = processInlineContent(mdastParagraph.children);
        if (paragraphContent.length > 0) {
          const ooxmlParagraph: OoxmlElement = {
            type: "element",
            name: "w:p",
            attributes: {},
            children: paragraphContent,
            data: { ooxmlType: "paragraph" },
          };
          ooxmlChildren.push(ooxmlParagraph);
        }
        return SKIP;
      }
      if (node.type === "heading") {
        const headingNode = node as Heading;
        const headingContent = processInlineContent(headingNode.children);
        if (headingContent.length > 0) {
          const ooxmlHeading: OoxmlElement = {
            type: "element",
            name: "w:p",
            attributes: {},
            children: headingContent,
            data: {
              ooxmlType: "paragraph",
              properties: {
                outlineLevel: headingNode.depth,
              } as ParagraphFormatting,
            },
          };
          ooxmlChildren.push(ooxmlHeading);
        }
        return SKIP;
      }
      if (node.type === "thematicBreak") {
        const ooxmlBreak: OoxmlElement = {
          type: "element",
          name: "w:p",
          attributes: {},
          children: [], // Thematic break usually has no content in OOXML paragraph
          data: {
            ooxmlType: "paragraph",
            properties: { thematicBreak: true } as ParagraphFormatting,
          },
        };
        ooxmlChildren.push(ooxmlBreak);
        return SKIP;
      }
      if (node.type === "list") {
        console.warn("List processing not yet implemented.");
        // TODO: Handle Lists
        return SKIP;
      }
      if (node.type === "table") {
        const mdastTable = node as MdastTable;
        const ooxmlTableRows: OoxmlElement[] = [];
        let columnCount = 0;

        // Iterate through MDAST rows to build OOXML rows and find max column count
        for (const mdastRow of mdastTable.children) {
          if (mdastRow.type === "tableRow") {
            const ooxmlCells: OoxmlElement[] = [];
            let currentRowCellCount = 0;
            // Iterate through MDAST cells
            mdastRow.children.forEach((mdastCell, cellIndex) => {
              if (mdastCell.type === "tableCell") {
                currentRowCellCount++;
                const align = mdastTable.align?.[cellIndex];
                const cellContent = processInlineContent(mdastCell.children);
                const cellParagraph: OoxmlElement = {
                  type: "element",
                  name: "w:p",
                  attributes: {},
                  children: cellContent,
                  data: {
                    ooxmlType: "paragraph",
                    properties: {
                      alignment: align ?? undefined,
                    } as ParagraphFormatting,
                  },
                };
                const ooxmlCell: OoxmlElement = {
                  type: "element",
                  name: "w:tc",
                  attributes: {},
                  children: [cellParagraph],
                  data: { ooxmlType: "tableCell" },
                };
                ooxmlCells.push(ooxmlCell);
              }
            });
            columnCount = Math.max(columnCount, currentRowCellCount); // Update max column count

            if (ooxmlCells.length > 0) {
              const ooxmlRow: OoxmlElement = {
                type: "element",
                name: "w:tr",
                attributes: {},
                children: ooxmlCells,
                data: { ooxmlType: "tableRow" },
              };
              ooxmlTableRows.push(ooxmlRow);
            }
          }
        }

        // Create OOXML table if it has rows and columns
        if (ooxmlTableRows.length > 0 && columnCount > 0) {
          // --- Create Table Grid ---
          const gridCols: OoxmlElement[] = [];
          for (let i = 0; i < columnCount; i++) {
            gridCols.push({
              type: "element",
              name: "w:gridCol",
              attributes: {},
              children: [],
              data: { ooxmlType: "tableGridCol" },
            });
          }
          const tableGrid: OoxmlElement = {
            type: "element",
            name: "w:tblGrid",
            attributes: {},
            children: gridCols,
            data: { ooxmlType: "tableGrid" },
          };
          // --- End Table Grid ---

          // --- Define Basic Table Borders (Example) ---
          // Use Measurement object for size and ColorDefinition for color
          const basicBorderStyle: BorderStyleProperties = {
            style: "single",
            size: { value: 0.5, unit: "pt" }, // 4/8 pt = 0.5pt
            color: { value: "auto" }, // Use ColorDefinition object
          };
          const tableBorders: WmlTableProperties["borders"] = {
            top: basicBorderStyle,
            bottom: basicBorderStyle,
            left: basicBorderStyle,
            right: basicBorderStyle,
            insideH: basicBorderStyle,
            insideV: basicBorderStyle,
          };
          // --- End Table Borders ---

          const ooxmlTable: OoxmlElement = {
            type: "element",
            name: "w:tbl",
            attributes: {},
            // Grid must come BEFORE rows
            children: [tableGrid, ...ooxmlTableRows],
            data: {
              ooxmlType: "table",
              properties: {
                borders: tableBorders,
                // TODO: Add width based on percentage?
                width: { value: 100, unit: "pct" }, // Add default width property
              } as WmlTableProperties,
            },
          };
          ooxmlChildren.push(ooxmlTable);
        }
        return SKIP; // Finished processing the table
      }
      if (["tableRow", "tableCell"].includes(node.type)) {
        return SKIP;
      }
      if (
        parent?.type === "root" &&
        ![
          "text",
          "paragraph",
          "heading",
          "thematicBreak",
          "list",
          "table",
        ].includes(node.type)
      ) {
        console.warn(
          `Unhandled block node type during conversion: ${node.type}`,
        );
        return SKIP;
      }
    });

    const ooxmlRoot: OoxmlRoot = {
      type: "root",
      children: ooxmlChildren,
      data: { ooxmlType: "root" }, // Add root type
    };

    file.result = ooxmlRoot;
  };
};
