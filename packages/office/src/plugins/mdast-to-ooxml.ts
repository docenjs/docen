import type {
  BlockContent,
  Blockquote,
  Break,
  DefinitionContent,
  Emphasis,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Code as MdastCode,
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
  WmlBreakProperties,
  WmlHyperlinkProperties,
  WmlImageRefProperties,
  WmlTableCellProperties,
  WmlTableProperties,
} from "../ast";

// Helper function to process inline MDAST nodes into OOXML AST Run Content
// Returns an array of OOXML inline elements (like <w:r>, <w:hyperlink>, etc.)
function processInlineContent(
  nodes: PhrasingContent[],
  currentState: FontProperties = {}
): OoxmlElement[] {
  // Ensure return type is array of OoxmlElement (specifically runs)
  const ooxmlRuns: OoxmlElement[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      const currentProps = { ...currentState };
      const textRun: OoxmlElement = {
        type: "element",
        name: "w:r",
        attributes: {},
        children: [
          {
            type: "element",
            name: "w:t",
            attributes: { "xml:space": "preserve" }, // Preserve whitespace
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
          // Only add properties if currentProps is not empty
          ...(Object.keys(currentProps).length > 0 && {
            properties: currentProps,
          }),
        },
      };
      ooxmlRuns.push(textRun);
    } else if (node.type === "strong") {
      ooxmlRuns.push(
        ...processInlineContent(node.children, { ...currentState, bold: true })
      );
    } else if (node.type === "emphasis") {
      ooxmlRuns.push(
        ...processInlineContent(node.children, {
          ...currentState,
          italic: true,
        })
      );
    } else if (node.type === "link") {
      const linkNode = node as Link;
      const linkContentRuns = processInlineContent(
        linkNode.children,
        currentState
      ); // Process link text runs
      // Create a w:hyperlink element containing the text runs
      const hyperlinkElement: OoxmlElement = {
        type: "element",
        name: "w:hyperlink",
        attributes: {}, // Attributes like r:id will be added by docx-to-ooxml if needed
        children: linkContentRuns, // Embed the processed runs
        data: {
          ooxmlType: "hyperlink",
          properties: {
            url: linkNode.url,
            title: linkNode.title,
          } as WmlHyperlinkProperties,
        },
      };
      // The current `ooxml-to-docx` plugin expects <w:hyperlink> elements.
      // Return the hyperlink element directly. The caller (e.g., paragraph handler)
      // must be able to handle non-<w:r> elements in the returned array.
      ooxmlRuns.push(hyperlinkElement);
    } else if (node.type === "break") {
      const breakElement: OoxmlElement = {
        type: "element",
        name: "w:br",
        attributes: {},
        children: [],
        data: { ooxmlType: "break", properties: {} as WmlBreakProperties }, // Type might be needed?
      };
      // A break needs to be inside a run (<w:r><w:br/></w:r>)
      const breakRun: OoxmlElement = {
        type: "element",
        name: "w:r",
        attributes: {},
        children: [breakElement],
        data: { ooxmlType: "textRun" },
      };
      ooxmlRuns.push(breakRun);
    } else if (node.type === "image") {
      const imageNode = node as Image;
      // Create the imageRef element (custom AST node for deferred processing)
      const imageRefElement: OoxmlElement = {
        type: "element",
        name: "imageRef", // Custom node type
        attributes: {},
        children: [],
        data: {
          ooxmlType: "imageRef", // Mark for ooxml-to-docx
          properties: {
            url: imageNode.url,
            alt: imageNode.alt,
            title: imageNode.title,
          } as WmlImageRefProperties,
        },
      };
      // Wrap imageRef in a text run for inline placement context
      const imageRunWrapper: OoxmlElement = {
        type: "element",
        name: "w:r",
        attributes: {},
        children: [imageRefElement],
        data: { ooxmlType: "textRun" },
      };
      ooxmlRuns.push(imageRunWrapper);
    } else if (node.type === "inlineCode") {
      const codeText = node.value;
      // Define properties for inline code using FontProperties directly
      const codeProps: FontProperties = {
        ...currentState, // Keep existing state like bold/italic if nested
        font: "Courier New", // Specify monospace font
      };
      const codeRun: OoxmlElement = {
        type: "element",
        name: "w:r",
        attributes: {},
        children: [
          {
            type: "element",
            name: "w:t",
            attributes: { "xml:space": "preserve" },
            children: [
              {
                type: "text",
                value: codeText,
                data: { ooxmlType: "text" },
              } as OoxmlText,
            ],
            data: { ooxmlType: "textContentWrapper" },
          },
        ],
        data: {
          ooxmlType: "textRun",
          properties: codeProps, // Apply code formatting properties
        },
      };
      ooxmlRuns.push(codeRun);
    }
    // TODO: Handle delete etc.
  }
  // Filter out any null/undefined entries if logic changes
  return ooxmlRuns.filter(Boolean) as OoxmlElement[];
}

// --- Core Conversion Function ---
// Converts a single MDAST block-level node to an array of OOXML Elements
function convertMdastNodeToOoxml(
  node: MdastContent,
  file: VFile
): OoxmlElement[] {
  // Return array as one node might become multiple (though unlikely here)
  const results: OoxmlElement[] = [];

  if (node.type === "paragraph") {
    const mdastParagraph = node as MdastParagraph;
    const paragraphContent = processInlineContent(mdastParagraph.children);
    // Only create paragraph if it has content (runs)
    if (paragraphContent.length > 0) {
      const ooxmlParagraph: OoxmlElement = {
        type: "element",
        name: "w:p",
        attributes: {},
        children: paragraphContent,
        data: { ooxmlType: "paragraph", properties: {} as ParagraphFormatting },
      };
      results.push(ooxmlParagraph);
    }
  } else if (node.type === "heading") {
    const headingNode = node as Heading;
    const headingContent = processInlineContent(headingNode.children);
    if (headingContent.length > 0) {
      const ooxmlHeading: OoxmlElement = {
        type: "element",
        name: "w:p", // Headings are paragraphs with outlineLevel
        attributes: {},
        children: headingContent,
        data: {
          ooxmlType: "paragraph",
          properties: {
            outlineLevel: headingNode.depth - 1, // Docx uses 0-based index for levels
          } as ParagraphFormatting,
        },
      };
      results.push(ooxmlHeading);
    }
  } else if (node.type === "thematicBreak") {
    const ooxmlBreak: OoxmlElement = {
      type: "element",
      name: "w:p",
      attributes: {},
      children: [], // Often represented by a paragraph border or specific run
      data: {
        ooxmlType: "paragraph",
        properties: { thematicBreak: true } as ParagraphFormatting, // Mark for specific handling
      },
    };
    results.push(ooxmlBreak);
  } else if (node.type === "blockquote") {
    const blockquoteNode = node as Blockquote;
    // Process children recursively and add 'isQuote' property
    for (const childNode of blockquoteNode.children) {
      const convertedChildren = convertMdastNodeToOoxml(childNode, file);
      for (const ooxmlChild of convertedChildren) {
        // Add quote property to paragraph children
        if (ooxmlChild.data?.ooxmlType === "paragraph") {
          const props = (ooxmlChild.data.properties ||
            {}) as ParagraphFormatting;
          // REMOVE indentation logic
          // props.indentation = { ...props.indentation, left: { value: 720, unit: 'dxa' } };
          // ADD tab stop definition
          props.tabs = [
            { alignment: "left", position: { value: 720, unit: "dxa" } },
            // Add more tab stops here if needed in the future
          ];
          ooxmlChild.data.properties = props;
        }
        // TODO: How to handle non-paragraph children within a quote?
        results.push(ooxmlChild);
      }
    }
  } else if (node.type === "list") {
    const listNode = node as List;
    const ooxmlListItems: OoxmlElement[] = [];

    for (const itemNode of listNode.children) {
      // Iterate through list items
      if (itemNode.type === "listItem") {
        const ooxmlListItemChildren: OoxmlElementContent[] = [];
        // Recursively convert block content inside the list item
        for (const contentNode of itemNode.children) {
          const convertedContent = convertMdastNodeToOoxml(contentNode, file);
          ooxmlListItemChildren.push(...convertedContent);
        }

        // Create the OOXML list item if it has content
        if (ooxmlListItemChildren.length > 0) {
          ooxmlListItems.push({
            type: "element",
            name: "listItem", // Abstract type, handled by ooxml-to-docx
            attributes: {},
            children: ooxmlListItemChildren,
            data: { ooxmlType: "listItem" },
          });
        }
      }
    }

    // Create the OOXML list element if it has list items
    if (ooxmlListItems.length > 0) {
      results.push({
        type: "element",
        name: "list", // Abstract type, handled by ooxml-to-docx
        attributes: {},
        children: ooxmlListItems,
        data: {
          ooxmlType: "list",
          properties: { ordered: listNode.ordered ?? false },
        },
      });
    }
  } else if (node.type === "table") {
    const mdastTable = node as MdastTable;
    const ooxmlTableRows: OoxmlElement[] = [];
    let columnCount = 0;

    // Determine column count from the first row (can be refined)
    if (mdastTable.children[0]?.type === "tableRow") {
      columnCount = mdastTable.children[0].children.length;
    }
    // Or iterate all rows to find max column count
    for (const mdastRow of mdastTable.children) {
      if (mdastRow.type === "tableRow") {
        columnCount = Math.max(columnCount, mdastRow.children.length);
      }
    }

    for (const mdastRow of mdastTable.children) {
      if (mdastRow.type === "tableRow") {
        const ooxmlTableRowCells: OoxmlElement[] = [];
        mdastRow.children.forEach((mdastCell, cellIndex) => {
          if (mdastCell.type === "tableCell") {
            const align = mdastTable.align?.[cellIndex];
            const cellContentRuns = processInlineContent(mdastCell.children);
            // Table cells must contain block-level content (like paragraphs)
            const cellParagraph: OoxmlElement = {
              type: "element",
              name: "w:p",
              attributes: {},
              children: cellContentRuns, // Paragraph contains the runs
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
              children: [cellParagraph], // Cell contains the paragraph
              data: {
                ooxmlType: "tableCell",
                properties: {} as WmlTableCellProperties,
              },
            };
            ooxmlTableRowCells.push(ooxmlCell);
          }
        });

        if (ooxmlTableRowCells.length > 0) {
          // Ensure row has correct number of cells (add empty if needed?) - Basic for now
          ooxmlTableRows.push({
            type: "element",
            name: "w:tr",
            attributes: {},
            children: ooxmlTableRowCells,
            data: { ooxmlType: "tableRow" },
          });
        }
      }
    }

    if (ooxmlTableRows.length > 0 && columnCount > 0) {
      const gridCols: OoxmlElement[] = Array.from(
        { length: columnCount },
        () => ({
          type: "element",
          name: "w:gridCol",
          attributes: {},
          children: [],
          data: { ooxmlType: "tableGridCol" }, // Width added later?
        })
      );
      const tableGrid: OoxmlElement = {
        type: "element",
        name: "w:tblGrid",
        attributes: {},
        children: gridCols,
        data: { ooxmlType: "tableGrid" },
      };

      // Basic borders (can be customized)
      const basicBorderStyle: BorderStyleProperties = {
        style: "single",
        size: { value: 4, unit: "dxa" },
        color: { value: "auto" },
      };
      const tableBorders: WmlTableProperties["borders"] = {
        top: basicBorderStyle,
        bottom: basicBorderStyle,
        left: basicBorderStyle,
        right: basicBorderStyle,
        insideH: basicBorderStyle,
        insideV: basicBorderStyle,
      };

      results.push({
        type: "element",
        name: "w:tbl",
        attributes: {},
        children: [tableGrid, ...ooxmlTableRows],
        data: {
          ooxmlType: "table",
          properties: {
            borders: tableBorders,
            width: { value: 100, unit: "pct" }, // Default width
          } as WmlTableProperties,
        },
      });
    }
  } else if (node.type === "code") {
    // Basic code block handling: place content in a single run within a paragraph
    const codeContent = node.value;
    const codeRun: OoxmlElement = {
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
              value: codeContent,
              data: { ooxmlType: "text" },
            } as OoxmlText,
          ],
          data: { ooxmlType: "textContentWrapper" },
        },
      ],
      // TODO: Apply a specific style (e.g., Courier font) for code
      data: {
        ooxmlType: "textRun",
        properties: { isCode: true /* custom flag? */ } as FontProperties,
      },
    };
    const codeParagraph: OoxmlElement = {
      type: "element",
      name: "w:p",
      attributes: {},
      children: [codeRun],
      // TODO: Apply paragraph style (e.g., shading, borders) for code block
      data: {
        ooxmlType: "paragraph",
        properties: {
          isCodeBlock: true /* custom flag? */,
        } as ParagraphFormatting,
      },
    };
    results.push(codeParagraph);
  } else if (["definition", "footnoteDefinition"].includes(node.type)) {
    // Skip these for now, handled separately if needed
    console.warn(`Skipping MDAST node type during conversion: ${node.type}`);
  } else if (node.type === "html") {
    // Skip HTML nodes
    console.warn("Skipping raw HTML node during conversion.");
  } else {
    console.warn(`Unhandled MDAST node type during conversion: ${node.type}`);
  }

  return results;
}

/**
 * Unified plugin to convert an MDAST tree to an OOXML AST tree (OoxmlRoot).
 */
export const mdastToOoxml: Plugin<[], MdastRoot, OoxmlRoot> = () => {
  return (tree: MdastRoot, file: VFile): OoxmlRoot => {
    const ooxmlChildren: OoxmlElementContent[] = [];

    // Process top-level block content nodes
    for (const node of tree.children) {
      const convertedNodes = convertMdastNodeToOoxml(node, file);
      ooxmlChildren.push(...convertedNodes);
    }

    const ooxmlRoot: OoxmlRoot = {
      type: "root",
      children: ooxmlChildren,
      data: { ooxmlType: "root" },
    };

    // Optional: Log the generated OOXML AST for debugging
    // console.log(JSON.stringify(ooxmlRoot, null, 2));

    return ooxmlRoot;
  };
};
