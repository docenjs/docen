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
  Text as MdastText,
  ThematicBreak as MdastThematicBreak,
  PhrasingContent,
  Strong,
} from "mdast";
import type { Plugin } from "unified";
import { SKIP, visit } from "unist-util-visit";
import type { VFile } from "vfile";
import type {
  FontProperties,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlNode,
  OoxmlRoot,
  OoxmlText,
  ParagraphFormatting,
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

    visit(tree, (node) => {
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
      if (!["root", "text"].includes(node.type)) {
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
