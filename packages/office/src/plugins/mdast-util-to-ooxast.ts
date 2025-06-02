import type {
  Blockquote,
  Definition,
  FootnoteDefinition,
  FootnoteReference,
  Heading,
  Html,
  Image,
  ImageReference,
  Link,
  LinkReference,
  List,
  ListItem,
  RootContent as MdastContent,
  Paragraph as MdastParagraph,
  Root as MdastRoot,
  Table as MdastTable,
  PhrasingContent,
} from "mdast";
import type { Plugin } from "unified";
import { SKIP, visit } from "unist-util-visit";
import { x } from "xastscript";
import type {
  BorderStyleProperties,
  FontProperties,
  OoxmlData,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlRoot,
  OoxmlText,
  ParagraphFormatting,
  WmlBreakProperties,
  WmlFootnoteReferenceProperties,
  WmlHyperlinkProperties,
  WmlImageRefProperties,
  WmlListItemProperties,
  WmlListProperties,
  WmlTableCellProperties,
  WmlTableProperties,
  WmlTableRowProperties,
} from "../ast";

// --- Helper Functions ---

/**
 * Simple HTML tag parser for basic inline tags (<u>, <sub>, <sup>).
 * Returns an array of text segments and associated tags.
 * Very basic, assumes valid nesting and no attributes.
 */
function parseBasicHtml(
  html: string,
): { text: string; tags: Array<"u" | "sub" | "sup"> }[] {
  const segments: { text: string; tags: Array<"u" | "sub" | "sup"> }[] = [];

  // Basic regex approach - more robust parsing might be needed for complex cases
  const regex = /(\s*<\/?(u|sub|sup)>\s*)|([^<]+)/gi;
  const match = regex.exec(html);
  let lastIndex = 0;
  const currentTags: Array<"u" | "sub" | "sup"> = [];

  // Add initial segment if HTML doesn't start with a tag
  // Simplified: This basic parser assumes tags directly adjacent or separated by processable text

  while (match !== null) {
    const fullMatch = match[0];
    const tagPart = match[1];
    const tagName = match[2]?.toLowerCase() as "u" | "sub" | "sup" | undefined;
    const textPart = match[3];

    // Capture text before the tag
    if (match.index > lastIndex) {
      const textBefore = html.substring(lastIndex, match.index);
      if (textBefore.trim()) {
        // Avoid adding empty/whitespace-only segments
        segments.push({ text: textBefore, tags: [...currentTags] });
      }
    }

    if (tagPart) {
      // Handle tag
      const isClosing = tagPart.includes("</");
      if (isClosing && tagName) {
        const index = currentTags.lastIndexOf(tagName);
        if (index !== -1) {
          currentTags.splice(index, 1); // Remove last matching tag
        }
      } else if (tagName) {
        currentTags.push(tagName);
      }
    } else if (textPart) {
      // Handle text segment
      segments.push({ text: textPart, tags: [...currentTags] });
    }

    lastIndex = regex.lastIndex;
  }

  // Capture any remaining text after the last tag
  if (lastIndex < html.length) {
    const remainingText = html.substring(lastIndex);
    if (remainingText.trim()) {
      segments.push({ text: remainingText, tags: [...currentTags] });
    }
  }

  return segments;
}

/**
 * Process inline MDAST nodes into OOXML AST Run Content (<w:r>, <w:hyperlink>, etc.).
 */
function processInlineContent(
  nodes: PhrasingContent[],
  definitions: Record<string, Definition>,
  footnoteDefinitions: Record<string, FootnoteDefinition>,
  currentState: FontProperties = {},
): OoxmlElement[] {
  const ooxmlRuns: OoxmlElement[] = [];

  for (const node of nodes) {
    if (node.type === "text") {
      const textRun: OoxmlElement = {
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
                value: node.value,
                data: { ooxmlType: "text" },
              } as OoxmlText,
            ],
            data: { ooxmlType: "textContentWrapper" },
          },
        ],
        data: {
          ooxmlType: "textRun",
          ...(Object.keys(currentState).length > 0 && {
            properties: { ...currentState },
          }),
        },
      };
      ooxmlRuns.push(textRun);
    } else if (node.type === "strong") {
      ooxmlRuns.push(
        ...processInlineContent(
          node.children,
          definitions,
          footnoteDefinitions,
          {
            ...currentState,
            bold: true,
          },
        ),
      );
    } else if (node.type === "emphasis") {
      ooxmlRuns.push(
        ...processInlineContent(
          node.children,
          definitions,
          footnoteDefinitions,
          {
            ...currentState,
            italic: true,
          },
        ),
      );
    } else if (node.type === "delete") {
      ooxmlRuns.push(
        ...processInlineContent(
          node.children,
          definitions,
          footnoteDefinitions,
          {
            ...currentState,
            strike: true,
          },
        ),
      );
    } else if (node.type === "link") {
      const linkNode = node as Link;
      const linkContentRuns = processInlineContent(
        linkNode.children,
        definitions,
        footnoteDefinitions,
        currentState,
      );
      const hyperlinkElement: OoxmlElement = {
        type: "element",
        name: "w:hyperlink",
        attributes: {},
        children: linkContentRuns,
        data: {
          ooxmlType: "hyperlink",
          properties: {
            url: linkNode.url,
            title: linkNode.title,
            tooltip: linkNode.title,
          } as WmlHyperlinkProperties,
        },
      };
      ooxmlRuns.push(hyperlinkElement);
    } else if (node.type === "linkReference") {
      const linkRefNode = node as LinkReference;
      const definition = definitions[linkRefNode.identifier.toUpperCase()];
      if (definition) {
        const linkContentRuns = processInlineContent(
          linkRefNode.children,
          definitions,
          footnoteDefinitions,
          currentState,
        );
        const hyperlinkElement: OoxmlElement = {
          type: "element",
          name: "w:hyperlink",
          attributes: {},
          children: linkContentRuns,
          data: {
            ooxmlType: "hyperlink",
            properties: {
              url: definition.url,
              title: definition.title,
              tooltip: definition.title,
            } as WmlHyperlinkProperties,
          },
        };
        ooxmlRuns.push(hyperlinkElement);
      } else {
        console.warn(
          `Definition not found for linkReference: ${linkRefNode.identifier}`,
        );
        ooxmlRuns.push(
          ...processInlineContent(
            linkRefNode.children,
            definitions,
            footnoteDefinitions,
            currentState,
          ),
        );
      }
    } else if (node.type === "break") {
      const breakElement = x("w:br", {});
      breakElement.data = {
        ooxmlType: "break",
        properties: {} as WmlBreakProperties,
      };
      const breakRun = x("w:r", {}, [breakElement]);
      breakRun.data = { ooxmlType: "textRun" };
      ooxmlRuns.push(breakRun);
    } else if (node.type === "image") {
      const imageNode = node as Image;
      const imageRefElement = x("imageRef", {});
      imageRefElement.data = {
        ooxmlType: "imageRef",
        properties: {
          url: imageNode.url,
          alt: imageNode.alt,
          title: imageNode.title,
        } as WmlImageRefProperties,
      };
      const imageRunWrapper = x("w:r", {}, [imageRefElement]);
      imageRunWrapper.data = { ooxmlType: "textRun" };
      ooxmlRuns.push(imageRunWrapper);
    } else if (node.type === "imageReference") {
      const imageRefNode = node as ImageReference;
      const definition = definitions[imageRefNode.identifier.toUpperCase()];
      if (definition) {
        const imageRefElement = x("imageRef", {});
        imageRefElement.data = {
          ooxmlType: "imageRef",
          properties: {
            url: definition.url,
            alt: imageRefNode.alt,
            title: definition.title,
            identifier: imageRefNode.identifier,
          } as WmlImageRefProperties,
        };
        const imageRunWrapper = x("w:r", {}, [imageRefElement]);
        imageRunWrapper.data = { ooxmlType: "textRun" };
        ooxmlRuns.push(imageRunWrapper);
      } else {
        console.warn(
          `Definition not found for imageReference: ${imageRefNode.identifier}`,
        );
        if (imageRefNode.alt) {
          const fallbackRun = x("w:r", {}, [
            x("w:t", { "xml:space": "preserve" }, imageRefNode.alt),
          ]);
          fallbackRun.data = { ooxmlType: "textRun", properties: currentState };
          ooxmlRuns.push(fallbackRun);
        }
      }
    } else if (node.type === "inlineCode") {
      const codeText = node.value;
      const codeRun = x("w:r", {}, [
        x("w:t", { "xml:space": "preserve" }, codeText),
      ]);
      codeRun.data = {
        ooxmlType: "textRun",
        properties: { ...currentState, styleId: "CodeChar" } as FontProperties,
      };
      ooxmlRuns.push(codeRun);
    } else if (node.type === "footnoteReference") {
      const footnoteRefNode = node as FootnoteReference;
      const definition =
        footnoteDefinitions[footnoteRefNode.identifier.toUpperCase()];
      if (definition) {
        const footnoteRefElement = x("w:footnoteReference", {});
        footnoteRefElement.data = {
          ooxmlType: "footnoteReference",
          properties: {
            id: footnoteRefNode.identifier,
          } as WmlFootnoteReferenceProperties,
        };
        const footnoteRefRun = x("w:r", {}, [footnoteRefElement]);
        footnoteRefRun.data = {
          ooxmlType: "textRun",
          properties: {
            ...currentState,
            styleId: "FootnoteReference",
          } as FontProperties,
        };
        ooxmlRuns.push(footnoteRefRun);
      } else {
        console.warn(
          `Footnote definition not found for reference: ${footnoteRefNode.identifier}`,
        );
        const fallbackText = `[^${footnoteRefNode.identifier}]`;
        const fallbackRun = x("w:r", {}, [
          x("w:t", { "xml:space": "preserve" }, fallbackText),
        ]);
        fallbackRun.data = { ooxmlType: "textRun", properties: currentState };
        ooxmlRuns.push(fallbackRun);
      }
    } else if (node.type === "html") {
      const htmlNode = node as Html;
      const segments = parseBasicHtml(htmlNode.value);
      for (const segment of segments) {
        const segmentState = { ...currentState };
        for (const tag of segment.tags) {
          if (tag === "u") {
            segmentState.underline = { style: "single" };
          } else if (tag === "sub") {
            segmentState.vertAlign = "subscript";
          } else if (tag === "sup") {
            segmentState.vertAlign = "superscript";
          }
        }
        const segmentRun = x("w:r", {}, [
          x("w:t", { "xml:space": "preserve" }, segment.text),
        ]);
        segmentRun.data = { ooxmlType: "textRun", properties: segmentState };
        ooxmlRuns.push(segmentRun);
      }
    }
  }
  return ooxmlRuns.filter(Boolean) as OoxmlElement[];
}

// --- Core Conversion Function ---

/**
 * Converts a single MDAST block-level node to an array of OOXML Elements.
 */
function convertMdastNodeToOoxml(
  node: MdastContent,
  definitions: Record<string, Definition>,
  footnoteDefinitions: Record<string, FootnoteDefinition>,
): OoxmlElement[] {
  const results: OoxmlElement[] = [];

  if (node.type === "paragraph") {
    const mdastParagraph = node as MdastParagraph;
    const paragraphContent = processInlineContent(
      mdastParagraph.children,
      definitions,
      footnoteDefinitions,
    );
    if (paragraphContent.length > 0) {
      const ooxmlParagraph: OoxmlElement = {
        type: "element",
        name: "w:p",
        attributes: {},
        children: paragraphContent,
        data: { ooxmlType: "paragraph", properties: {} as ParagraphFormatting },
      };
      results.push(ooxmlParagraph);
    } else {
      const emptyParagraph: OoxmlElement = {
        type: "element",
        name: "w:p",
        attributes: {},
        children: [],
        data: { ooxmlType: "paragraph", properties: {} as ParagraphFormatting },
      };
      results.push(emptyParagraph);
    }
  } else if (node.type === "heading") {
    const headingNode = node as Heading;
    const headingContent = processInlineContent(
      headingNode.children,
      definitions,
      footnoteDefinitions,
    );
    if (headingContent.length > 0) {
      const ooxmlHeading: OoxmlElement = {
        type: "element",
        name: "w:p",
        attributes: {},
        children: headingContent,
        data: {
          ooxmlType: "paragraph",
          properties: {
            styleId: `Heading${headingNode.depth}`,
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
      children: [],
      data: {
        ooxmlType: "paragraph",
        properties: { thematicBreak: true } as ParagraphFormatting,
      },
    };
    results.push(ooxmlBreak);
  } else if (node.type === "blockquote") {
    const blockquoteNode = node as Blockquote;
    for (const childNode of blockquoteNode.children) {
      const convertedChildren = convertMdastNodeToOoxml(
        childNode,
        definitions,
        footnoteDefinitions,
      );
      for (const ooxmlChild of convertedChildren) {
        if (ooxmlChild.data?.ooxmlType === "paragraph") {
          const props = (ooxmlChild.data.properties ||
            {}) as ParagraphFormatting;
          props.styleId = "Quote";
          ooxmlChild.data.properties = props;
          results.push(ooxmlChild);
        } else if (ooxmlChild.data?.ooxmlType === "list") {
          console.warn(
            "Applying blockquote style to nested lists is not fully supported yet.",
          );
          results.push(ooxmlChild);
        } else {
          results.push(ooxmlChild);
        }
      }
    }
  } else if (node.type === "list") {
    const listNode = node as List;
    const ooxmlListItems: OoxmlElement[] = [];

    for (const itemNode of listNode.children) {
      if (itemNode.type === "listItem") {
        const mdastListItem = itemNode as ListItem;
        const ooxmlListItemChildren: OoxmlElementContent[] = [];
        // Convert children first
        for (const contentNode of mdastListItem.children) {
          const convertedContent = convertMdastNodeToOoxml(
            contentNode,
            definitions,
            footnoteDefinitions,
          );
          ooxmlListItemChildren.push(...convertedContent);
        }

        // If it's a GFM task list item, apply style to the first paragraph
        if (
          mdastListItem.checked !== null &&
          mdastListItem.checked !== undefined &&
          ooxmlListItemChildren.length > 0
        ) {
          const firstChild = ooxmlListItemChildren[0] as OoxmlElement; // Assert first child is an element for simplicity here

          // Ensure the first child is a paragraph element
          if (
            firstChild &&
            firstChild.type === "element" &&
            firstChild.name === "w:p"
          ) {
            // Ensure data exists and is of the correct type (or create it)
            let paragraphData = firstChild.data as OoxmlData | undefined;
            if (!paragraphData) {
              paragraphData = {};
              firstChild.data = paragraphData;
            }
            paragraphData.ooxmlType = paragraphData.ooxmlType || "paragraph"; // Ensure ooxmlType is set

            // Ensure properties object exists
            if (!paragraphData.properties) {
              paragraphData.properties = {};
            }

            const styleId = mdastListItem.checked
              ? "TaskItemChecked"
              : "TaskItemUnchecked";
            // Add or overwrite styleId
            (paragraphData.properties as ParagraphFormatting).styleId = styleId;
          }
        }

        if (ooxmlListItemChildren.length > 0) {
          const listItemProps: WmlListItemProperties = {
            level: 0, // Level still needs context, maybe handled by ooxml-to-docx based on list nesting
          };

          ooxmlListItems.push({
            type: "element",
            name: "listItem",
            attributes: {},
            children: ooxmlListItemChildren,
            data: {
              ooxmlType: "listItem",
              properties: listItemProps,
            },
          });
        }
      }
    }

    if (ooxmlListItems.length > 0) {
      results.push({
        type: "element",
        name: "list",
        attributes: {},
        children: ooxmlListItems,
        data: {
          ooxmlType: "list",
          properties: {
            ordered: listNode.ordered ?? false,
          } as WmlListProperties,
        },
      });
    }
  } else if (node.type === "table") {
    const mdastTable = node as MdastTable;
    const ooxmlTableRows: OoxmlElement[] = [];
    let columnCount = 0;

    for (const mdastRow of mdastTable.children) {
      if (mdastRow.type === "tableRow") {
        columnCount = Math.max(columnCount, mdastRow.children.length);
      }
    }

    mdastTable.children.forEach((mdastRow, rowIndex) => {
      if (mdastRow.type === "tableRow") {
        const ooxmlTableRowCells: OoxmlElement[] = [];
        mdastRow.children.forEach((mdastCell, cellIndex) => {
          if (mdastCell.type === "tableCell") {
            const align = mdastTable.align?.[cellIndex] ?? undefined;
            const cellContentRuns = processInlineContent(
              mdastCell.children,
              definitions,
              footnoteDefinitions,
            );

            const cellParagraph: OoxmlElement = {
              type: "element",
              name: "w:p",
              attributes: {},
              children: cellContentRuns.length > 0 ? cellContentRuns : [],
              data: {
                ooxmlType: "paragraph",
                properties: {
                  alignment: align,
                } as ParagraphFormatting,
              },
            };
            const cellProps: WmlTableCellProperties = {}; // Initialize empty or add standard props if needed
            const ooxmlCell: OoxmlElement = {
              type: "element",
              name: "w:tc",
              attributes: {},
              children: [cellParagraph],
              data: {
                ooxmlType: "tableCell",
                properties: cellProps,
              },
            };
            ooxmlTableRowCells.push(ooxmlCell);
          }
        });

        while (ooxmlTableRowCells.length < columnCount) {
          const emptyPara: OoxmlElement = {
            type: "element",
            name: "w:p",
            attributes: {},
            children: [],
            data: { ooxmlType: "paragraph", properties: {} },
          };
          ooxmlTableRowCells.push({
            type: "element",
            name: "w:tc",
            attributes: {},
            children: [emptyPara],
            data: { ooxmlType: "tableCell", properties: {} },
          });
        }

        if (ooxmlTableRowCells.length > 0) {
          const rowProps: WmlTableRowProperties = {
            isHeader: rowIndex === 0,
          };
          ooxmlTableRows.push({
            type: "element",
            name: "w:tr",
            attributes: {},
            children: ooxmlTableRowCells,
            data: {
              ooxmlType: "tableRow",
              properties: rowProps,
            },
          });
        }
      }
    });

    if (ooxmlTableRows.length > 0 && columnCount > 0) {
      const gridCols: OoxmlElement[] = Array.from(
        { length: columnCount },
        () => ({
          type: "element",
          name: "w:gridCol",
          attributes: {},
          children: [],
          data: { ooxmlType: "tableGridCol" },
        }),
      );
      const tableGrid: OoxmlElement = {
        type: "element",
        name: "w:tblGrid",
        attributes: {},
        children: gridCols,
        data: { ooxmlType: "tableGrid" },
      };

      const basicBorderStyle: BorderStyleProperties = {
        style: "single",
        size: { value: 0.5, unit: "pt" }, // 减小边框厚度从4pt到0.5pt
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
            width: { value: 100, unit: "pct" },
            layout: "autofit",
          } as WmlTableProperties,
        },
      });
    }
  } else if (node.type === "code") {
    const codeContent = node.value || "";
    const lines = codeContent.split("\\n");

    lines.forEach((line, index) => {
      const codeRun = x("w:r", {}, [
        x("w:t", { "xml:space": "preserve" }, line),
      ]);
      codeRun.data = { ooxmlType: "textRun" };

      const codeParagraph: OoxmlElement = {
        type: "element",
        name: "w:p",
        attributes: {},
        children: [codeRun],
        data: {
          ooxmlType: "paragraph",
          properties: { styleId: "CodeBlock" } as ParagraphFormatting,
        },
      };
      results.push(codeParagraph);
    });
  } else if (["definition", "footnoteDefinition"].includes(node.type)) {
  } else if (node.type === "html") {
    console.warn("Skipping block-level HTML node during conversion.");
  } else {
    console.warn(
      `Unhandled MDAST node type during conversion: ${
        "type" in node ? (node as { type: string }).type : "unknown"
      }`,
    );
  }

  return results;
}

/**
 * Unified plugin to convert an MDAST tree to an OOXML AST tree (OoxmlRoot).
 * Follows unified.js naming convention (similar to toHast, toMdast)
 */
export const mdastToOoxast: Plugin<[], MdastRoot, OoxmlRoot> = () => {
  return (tree: MdastRoot): OoxmlRoot => {
    const ooxmlChildren: OoxmlElementContent[] = [];

    // Local stores for definitions
    const definitions: Record<string, Definition> = {};
    const footnoteDefinitions: Record<string, FootnoteDefinition> = {};

    // First pass: Collect definitions
    visit(tree, ["definition", "footnoteDefinition"], (node) => {
      if (node.type === "definition") {
        const defNode = node as Definition;
        definitions[defNode.identifier.toUpperCase()] = defNode;
      } else if (node.type === "footnoteDefinition") {
        const footnoteDefNode = node as FootnoteDefinition;
        footnoteDefinitions[footnoteDefNode.identifier.toUpperCase()] =
          footnoteDefNode;
      }
      return SKIP;
    });

    for (const node of tree.children) {
      if (node.type === "definition" || node.type === "footnoteDefinition") {
        continue;
      }
      const convertedNodes = convertMdastNodeToOoxml(
        node,
        definitions,
        footnoteDefinitions,
      );
      ooxmlChildren.push(...convertedNodes);
    }

    const ooxmlRoot: OoxmlRoot = {
      type: "root",
      children: ooxmlChildren,
      data: { ooxmlType: "root" },
    };

    return ooxmlRoot;
  };
};
