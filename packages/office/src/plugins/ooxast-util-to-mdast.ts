import type {
  RootContent as MdastContent,
  List as MdastList,
  ListItem as MdastListItem,
  Root as MdastRoot,
  Table as MdastTable,
  TableCell as MdastTableCell,
  TableRow as MdastTableRow,
  Text as MdastText,
  PhrasingContent,
} from "mdast";
import type { Plugin } from "unified";
import type { Node } from "unist";
import type { VFile } from "vfile";
import type {
  FontProperties,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlRoot,
  OoxmlText,
} from "../ast";
import type { ToMdastOptions } from "../types";

/**
 * Convert OOXML AST to MDAST (Markdown Abstract Syntax Tree)
 */
export const ooxastToMdast: Plugin<[ToMdastOptions?]> = (
  options: ToMdastOptions = {}
) => {
  return (tree: Node, file: VFile): Node => {
    try {
      // Type guard to ensure we have an OoxmlRoot
      if (!("children" in tree) || !Array.isArray(tree.children)) {
        throw new Error("Expected OoxmlRoot node with children");
      }

      const ooxmlTree = tree as OoxmlRoot;
      const mdastRoot: MdastRoot = {
        type: "root",
        children: [],
      };

      // Process all children of the OOXML root
      for (const child of ooxmlTree.children) {
        const converted = convertNode(child, options);
        if (converted) {
          if (Array.isArray(converted)) {
            mdastRoot.children.push(...converted);
          } else {
            mdastRoot.children.push(converted);
          }
        }
      }

      // Return the converted MDAST tree
      return mdastRoot;
    } catch (error) {
      console.error("Error converting OOXML to MDAST:", error);
      file.message(
        new Error(
          `MDAST conversion failed: ${error instanceof Error ? error.message : String(error)}`
        )
      );
      throw error;
    }
  };
};

/**
 * Convert a single OOXML node to MDAST node(s)
 */
function convertNode(
  node: OoxmlElementContent,
  options: ToMdastOptions
): MdastContent | MdastContent[] | null {
  if (node.type === "text") {
    return convertTextNode(node);
  }
  if (node.type === "element") {
    return convertElementNode(node, options);
  }
  return null;
}

/**
 * Convert OOXML text node to MDAST text node
 */
function convertTextNode(node: OoxmlText): MdastText {
  return {
    type: "text",
    value: node.value,
  };
}

/**
 * Convert OOXML element node to MDAST node(s)
 */
function convertElementNode(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastContent | MdastContent[] | null {
  // First check the ooxmlType in data if available
  const ooxmlType = element.data?.ooxmlType;

  // Use ooxmlType if available, otherwise fall back to element name
  const typeToProcess = ooxmlType || element.name;

  switch (typeToProcess) {
    case "paragraph":
      return convertParagraph(element, options);
    case "heading":
      return convertHeading(element, options);
    case "textRun":
      return convertTextRun(element, options);
    case "table":
      return convertTable(element, options);
    case "tableRow":
      return convertTableRow(element, options);
    case "tableCell":
      return convertTableCell(element, options);
    case "list":
      return convertList(element, options);
    case "listItem":
      return convertListItem(element, options);
    case "drawing":
      return convertDrawing(element, options);
    case "hyperlink":
      return convertHyperlink(element, options);
    case "lineBreak":
      return { type: "break" };
    // Handle OOXML-specific paragraph types
    case "w:p":
      return convertParagraph(element, options);
    // Handle styled paragraphs that should be headings
    default:
      // Check if this is a paragraph with heading style
      if (
        element.data?.properties &&
        typeof element.data.properties === "object"
      ) {
        const props = element.data.properties as Record<string, unknown>;
        if (
          props.styleId &&
          typeof props.styleId === "string" &&
          props.styleId.startsWith("Heading")
        ) {
          return convertHeading(element, options);
        }
      }
      return convertGenericElement(element, options);
  }
}

/**
 * Convert paragraph element to MDAST paragraph
 */
function convertParagraph(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastContent {
  const children: PhrasingContent[] = [];

  if (element.children) {
    for (const child of element.children) {
      const converted = convertNode(child, options);
      if (converted) {
        if (Array.isArray(converted)) {
          children.push(...converted.filter(isPhrasingContent));
        } else if (isPhrasingContent(converted)) {
          children.push(converted);
        }
      }
    }
  }

  return {
    type: "paragraph",
    children,
  };
}

/**
 * Convert heading element to MDAST heading
 */
function convertHeading(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastContent {
  const children: PhrasingContent[] = [];
  const elementLevel = (element.data?.properties as Record<string, unknown>)
    ?.level as number | undefined;
  const level = Math.min(Math.max(1, elementLevel || 1), 6) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6;

  if (element.children) {
    for (const child of element.children) {
      const converted = convertNode(child, options);
      if (converted) {
        if (Array.isArray(converted)) {
          children.push(...converted.filter(isPhrasingContent));
        } else if (isPhrasingContent(converted)) {
          children.push(converted);
        }
      }
    }
  }

  return {
    type: "heading",
    depth: level,
    children,
  };
}

/**
 * Convert text run with formatting to MDAST nodes
 */
function convertTextRun(
  element: OoxmlElement,
  options: ToMdastOptions
): PhrasingContent | PhrasingContent[] {
  if (!element.children || element.children.length === 0) {
    return { type: "text", value: "" };
  }

  // Extract font properties
  const fontProps = element.data?.properties as FontProperties | undefined;

  // Process children to get text content
  const textContent: PhrasingContent[] = [];
  for (const child of element.children) {
    const converted = convertNode(child, options);
    if (converted) {
      if (Array.isArray(converted)) {
        textContent.push(...converted.filter(isPhrasingContent));
      } else if (isPhrasingContent(converted)) {
        textContent.push(converted);
      }
    }
  }

  // Apply formatting by wrapping in appropriate elements
  let result: PhrasingContent[] = textContent;

  if (fontProps?.bold) {
    result = [
      {
        type: "strong",
        children: result,
      },
    ];
  }

  if (fontProps?.italic) {
    result = [
      {
        type: "emphasis",
        children: result,
      },
    ];
  }

  if (fontProps?.underline) {
    // Markdown doesn't have native underline, use HTML if allowed
    if (options.allowHtml) {
      result = [
        {
          type: "html",
          value: `<u>${getTextValue(result)}</u>`,
        },
      ];
    }
  }

  // Handle inline code (monospace fonts)
  if (
    fontProps?.name?.toLowerCase().includes("courier") ||
    fontProps?.name?.toLowerCase().includes("mono")
  ) {
    const textValue = getTextValue(result);
    return {
      type: "inlineCode",
      value: textValue,
    };
  }

  return result.length === 1 ? result[0] : result;
}

/**
 * Convert table element to MDAST table
 */
function convertTable(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastTable {
  const children: MdastTableRow[] = [];

  if (element.children) {
    for (const child of element.children) {
      if (child.type === "element" && child.name === "tableRow") {
        const converted = convertTableRow(child, options);
        if (converted) {
          children.push(converted);
        }
      }
    }
  }

  // Generate table alignment (default to left)
  const firstRow = children[0];
  const columnCount = firstRow?.children?.length || 0;
  const align = Array(columnCount).fill("left") as (
    | "left"
    | "right"
    | "center"
  )[];

  return {
    type: "table",
    align,
    children,
  };
}

/**
 * Convert table row element to MDAST table row
 */
function convertTableRow(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastTableRow {
  const children: MdastTableCell[] = [];

  if (element.children) {
    for (const child of element.children) {
      if (child.type === "element" && child.name === "tableCell") {
        const converted = convertTableCell(child, options);
        if (converted) {
          children.push(converted);
        }
      }
    }
  }

  return {
    type: "tableRow",
    children,
  };
}

/**
 * Convert table cell element to MDAST table cell
 */
function convertTableCell(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastTableCell {
  const children: PhrasingContent[] = [];

  if (element.children) {
    for (const child of element.children) {
      const converted = convertNode(child, options);
      if (converted) {
        if (Array.isArray(converted)) {
          children.push(...converted.filter(isPhrasingContent));
        } else if (isPhrasingContent(converted)) {
          children.push(converted);
        }
      }
    }
  }

  return {
    type: "tableCell",
    children,
  };
}

/**
 * Convert list element to MDAST list
 */
function convertList(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastList {
  const children: MdastListItem[] = [];
  const isOrdered =
    (element.data?.properties as Record<string, unknown>)?.ordered === true;

  if (element.children) {
    for (const child of element.children) {
      if (child.type === "element" && child.name === "listItem") {
        const converted = convertListItem(child, options);
        if (converted) {
          children.push(converted);
        }
      }
    }
  }

  return {
    type: "list",
    ordered: isOrdered,
    children,
  };
}

/**
 * Convert list item element to MDAST list item
 */
function convertListItem(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastListItem {
  const children: (
    | import("mdast").BlockContent
    | import("mdast").DefinitionContent
  )[] = [];

  if (element.children) {
    for (const child of element.children) {
      const converted = convertNode(child, options);
      if (converted) {
        if (Array.isArray(converted)) {
          // Filter to only include block content and definition content
          children.push(...converted.filter(isBlockOrDefinitionContent));
        } else if (isBlockOrDefinitionContent(converted)) {
          children.push(converted);
        }
      }
    }
  }

  return {
    type: "listItem",
    children,
  };
}

/**
 * Convert drawing/image element to MDAST image
 */
function convertDrawing(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastContent | null {
  const relationId = element.data?.relationId as string | undefined;
  if (!relationId) {
    return null;
  }

  // Resolve image path
  const url = options.resolveImagePath
    ? options.resolveImagePath(relationId)
    : `image_${relationId}`;

  // Extract alt text and title from drawing properties
  const elementData = element.data?.properties as
    | Record<string, unknown>
    | undefined;
  const alt = (elementData?.alt as string) || "";
  const title = elementData?.title as string | undefined;

  return {
    type: "image",
    url,
    alt,
    title,
  };
}

/**
 * Convert hyperlink element to MDAST link
 */
function convertHyperlink(
  element: OoxmlElement,
  options: ToMdastOptions
): PhrasingContent {
  const children: PhrasingContent[] = [];
  const url =
    ((element.data?.properties as Record<string, unknown>)?.url as string) ||
    "";

  if (element.children) {
    for (const child of element.children) {
      const converted = convertNode(child, options);
      if (converted) {
        if (Array.isArray(converted)) {
          children.push(...converted.filter(isPhrasingContent));
        } else if (isPhrasingContent(converted)) {
          children.push(converted);
        }
      }
    }
  }

  return {
    type: "link",
    url,
    children,
  };
}

/**
 * Convert generic/unknown element
 */
function convertGenericElement(
  element: OoxmlElement,
  options: ToMdastOptions
): MdastContent | MdastContent[] | null {
  // If HTML is allowed, convert to HTML element
  if (options.allowHtml) {
    const htmlTag = element.name;
    const attrs = options.preserveAttributes
      ? Object.entries(element.attributes || {})
          .map(([key, value]) => `${key}="${value}"`)
          .join(" ")
      : "";

    const openTag = attrs ? `<${htmlTag} ${attrs}>` : `<${htmlTag}>`;
    const closeTag = `</${htmlTag}>`;

    // Process children
    const childrenHtml: string[] = [];
    if (element.children) {
      for (const child of element.children) {
        if (child.type === "text") {
          childrenHtml.push(child.value);
        } else if (child.type === "element") {
          const converted = convertGenericElement(child, options);
          if (
            converted &&
            "value" in converted &&
            typeof converted.value === "string"
          ) {
            childrenHtml.push(converted.value);
          }
        }
      }
    }

    return {
      type: "html",
      value: `${openTag}${childrenHtml.join("")}${closeTag}`,
    };
  }

  // Otherwise, just process children
  const children: MdastContent[] = [];
  if (element.children) {
    for (const child of element.children) {
      const converted = convertNode(child, options);
      if (converted) {
        if (Array.isArray(converted)) {
          children.push(...converted);
        } else {
          children.push(converted);
        }
      }
    }
  }

  return children;
}

/**
 * Type guard to check if a node is phrasing content
 */
function isPhrasingContent(node: MdastContent): node is PhrasingContent {
  const phrasingTypes = [
    "text",
    "emphasis",
    "strong",
    "delete",
    "html",
    "link",
    "image",
    "inlineCode",
    "break",
  ];
  return phrasingTypes.includes(node.type);
}

/**
 * Type guard to check if a node is block content or definition content
 */
function isBlockOrDefinitionContent(
  node: MdastContent
): node is import("mdast").BlockContent | import("mdast").DefinitionContent {
  const blockTypes = [
    "paragraph",
    "heading",
    "thematicBreak",
    "blockquote",
    "list",
    "table",
    "html",
    "code",
  ];
  const definitionTypes = ["definition", "footnoteDefinition"];
  return blockTypes.includes(node.type) || definitionTypes.includes(node.type);
}

/**
 * Extract text value from MDAST content array
 */
function getTextValue(content: PhrasingContent[]): string {
  return content
    .map((node) => {
      if (node.type === "text") {
        return node.value;
      }
      if ("children" in node && Array.isArray(node.children)) {
        return getTextValue(node.children);
      }
      return "";
    })
    .join("");
}
