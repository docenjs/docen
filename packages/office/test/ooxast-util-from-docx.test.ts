import { readFileSync } from "node:fs";
import { join } from "node:path";
import { unified } from "unified";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";
import type {
  FontProperties,
  OoxmlData,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlNode,
  OoxmlRoot,
  OoxmlText,
  ParagraphFormatting,
  SharedCommentDefinition,
  SharedResources,
} from "../src/ast";
import type {
  WmlBookmarkEndProperties,
  WmlBookmarkStartProperties,
  WmlCommentRefProperties,
  WmlHyperlinkProperties,
  WmlListItemProperties,
  WmlListProperties,
  WmlTableProperties,
} from "../src/ast/wml";

// Define local type aliases for clearer test assertions
// These represent OoxmlElement/OoxmlText nodes with specific ooxmlType in their data
// Use OoxmlData directly for WmlRoot and include expected fields
type WmlRoot = OoxmlRoot & {
  data?: OoxmlData & {
    sharedResources?: SharedResources;
    metadata?: { comments?: Record<string, SharedCommentDefinition> };
  };
};
type WmlParagraph = OoxmlElement & {
  data?: OoxmlData & {
    ooxmlType: "paragraph";
    properties?: ParagraphFormatting;
  };
};
type WmlTextRun = OoxmlElement & {
  data?: OoxmlData & { ooxmlType: "textRun"; properties?: FontProperties };
};
type WmlText = OoxmlText & {
  data?: OoxmlData & { ooxmlType: "text"; properties?: FontProperties };
};
type WmlList = OoxmlElement & {
  data?: OoxmlData & { ooxmlType: "list"; properties?: WmlListProperties };
};
type WmlListItem = OoxmlElement & {
  data?: OoxmlData & {
    ooxmlType: "listItem";
    properties?: WmlListItemProperties;
  };
};
type WmlTable = OoxmlElement & {
  data?: OoxmlData & { ooxmlType: "table"; properties?: WmlTableProperties };
};
type WmlTableRow = OoxmlElement & {
  data?: OoxmlData & { ooxmlType: "tableRow" };
};
type WmlTableCell = OoxmlElement & {
  data?: OoxmlData & { ooxmlType: "tableCell" };
};
type WmlHyperlink = OoxmlElement & {
  data?: OoxmlData & {
    ooxmlType: "hyperlink";
    properties?: WmlHyperlinkProperties;
  };
};
type DmlDrawing = OoxmlElement & {
  data?: OoxmlData & {
    ooxmlType: "drawing";
    properties?: { relationId?: string; fileName?: string };
  };
};
type WmlBookmarkStart = OoxmlElement & {
  data?: OoxmlData & {
    ooxmlType: "bookmarkStart";
    properties?: WmlBookmarkStartProperties;
  };
};
type WmlBookmarkEnd = OoxmlElement & {
  data?: OoxmlData & {
    ooxmlType: "bookmarkEnd";
    properties?: WmlBookmarkEndProperties;
  };
};
type WmlCommentReference = OoxmlElement & {
  data?: OoxmlData & {
    ooxmlType: "commentReference";
    properties?: WmlCommentRefProperties;
  };
};
type WmlComment = SharedCommentDefinition;

import { docxToOoxast } from "../src/plugins";

// Helper function to load a DOCX file and run the parser
async function parseDocxFile(fileName: string): Promise<WmlRoot | undefined> {
  const filePath = join(__dirname, "fixtures", fileName);
  const buffer = readFileSync(filePath);
  const file = new VFile({ value: new Uint8Array(buffer), path: filePath });

  // Use WmlRoot for initial tree
  const initialRoot: WmlRoot = {
    type: "root",
    children: [],
    data: { ooxmlType: "wmlRoot" },
  };

  const processor = unified().use(docxToOoxast);
  const result = await processor.run(initialRoot, file);

  if (file.messages.length > 0) {
    console.warn(`Messages for ${fileName}:`, file.messages);
  }
  return result as WmlRoot | undefined;
}

describe("docxToOoxmlAst Plugin (XAST-based)", () => {
  // Basic Paragraph Test
  it("should parse a simple paragraph with text", async () => {
    const root = await parseDocxFile("simple_paragraph.docx");
    expect(root).toBeDefined();
    expect(root?.type).toBe("root");
    expect(root?.children).toHaveLength(1);

    const paragraph = root?.children[0] as WmlParagraph | undefined;
    expect(paragraph?.type).toBe("element");
    expect(paragraph?.name).toBe("w:p");
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");
    expect(paragraph?.children).toBeDefined();
    expect(paragraph?.children).toHaveLength(1);

    const runElement = paragraph?.children?.[0] as WmlTextRun | undefined;
    expect(runElement?.type).toBe("element");
    expect(runElement?.name).toBe("w:r");
    expect(runElement?.children).toHaveLength(1);
    expect(runElement?.data?.ooxmlType).toBe("textRun");

    const textWrapperElement = runElement?.children?.[0] as
      | OoxmlElement
      | undefined;
    expect(textWrapperElement?.data?.ooxmlType).toBe("textContentWrapper");
    const textNode = textWrapperElement?.children?.[0] as WmlText | undefined;
    expect(textNode?.type).toBe("text");
    expect(textNode?.value).toBe("This is a simple paragraph.");
  });

  // Styles Test (Bold/Italic)
  it("should parse bold and italic text runs with properties in data", async () => {
    const root = await parseDocxFile("styled_text.docx");
    expect(root?.type).toBe("root");
    expect(root?.children).toHaveLength(1);
    const paragraph = root?.children[0] as WmlParagraph | undefined;
    expect(paragraph?.type).toBe("element");
    expect(paragraph?.name).toBe("w:p");
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");
    expect(paragraph?.children).toHaveLength(9);

    const boldRunElement = paragraph?.children?.[1] as WmlTextRun | undefined;
    expect(boldRunElement?.data?.ooxmlType).toBe("textRun");
    expect(boldRunElement?.data?.properties?.bold).toBe(true);
    const boldTextWrapper = boldRunElement?.children?.[0];
    let boldTextNode: WmlText | undefined;
    if (boldTextWrapper?.type === "element") {
      boldTextNode = boldTextWrapper.children?.[0] as WmlText | undefined;
    }
    expect(boldTextNode?.value).toBe("bold");

    const italicRunElement = paragraph?.children?.[3] as WmlTextRun | undefined;
    expect(italicRunElement?.data?.ooxmlType).toBe("textRun");
    expect(italicRunElement?.data?.properties?.italic).toBe(true);
    const italicTextWrapper = italicRunElement?.children?.[0];
    let italicTextNode: WmlText | undefined;
    if (italicTextWrapper?.type === "element") {
      italicTextNode = italicTextWrapper.children?.[0] as WmlText | undefined;
    }
    expect(italicTextNode?.value).toBe("italic");

    // Bold Italic - Target index 6
    const boldItalicRunElement = paragraph?.children?.[6] as
      | WmlTextRun
      | undefined;
    expect(boldItalicRunElement?.data?.ooxmlType).toBe("textRun");
    expect(boldItalicRunElement?.data?.properties?.bold).toBe(true);
    expect(boldItalicRunElement?.data?.properties?.italic).toBe(true);
    const boldItalicTextWrapper = boldItalicRunElement?.children?.[0];
    let boldItalicTextNode: WmlText | undefined;
    if (boldItalicTextWrapper?.type === "element") {
      boldItalicTextNode = boldItalicTextWrapper.children?.[0] as
        | WmlText
        | undefined;
    }
    // Update expected text if needed based on XML (it's "both")
    expect(boldItalicTextNode?.value).toBe("both");

    // Normal again - Target index 8
    const normalRunElement2 = paragraph?.children?.[8] as
      | WmlTextRun
      | undefined;
    expect(normalRunElement2?.data?.ooxmlType).toBe("textRun");
    // Check properties are false or undefined
    expect(normalRunElement2?.data?.properties?.bold).toBeFalsy();
    expect(normalRunElement2?.data?.properties?.italic).toBeFalsy();
    const normalTextWrapper2 = normalRunElement2?.children?.[0];
    let normalTextNode2: WmlText | undefined;
    if (normalTextWrapper2?.type === "element") {
      normalTextNode2 = normalTextWrapper2.children?.[0] as WmlText | undefined;
    }
    // Update expected text to match XML (".")
    expect(normalTextNode2?.value).toBe(".");
  });

  // List Test (Bulleted)
  it("should parse a simple bulleted list", async () => {
    const root = await parseDocxFile("bullet_list.docx");
    expect(root).toBeDefined();
    expect(root?.children).toHaveLength(1);
    const list = root?.children[0] as WmlList;
    expect(list?.data?.ooxmlType).toBe("list");
    expect(list?.children).toHaveLength(3);
    expect(list?.data?.properties?.numId).toBeDefined();

    const item1 = list?.children[0] as WmlListItem | undefined;
    expect(item1?.data?.ooxmlType).toBe("listItem");
    expect(item1?.data?.properties?.level).toBe(0);
    expect(item1?.children).toHaveLength(1);
    const para1 = item1?.children[0] as WmlParagraph | undefined;
    expect(para1?.type).toBe("element");
    expect(para1?.name).toBe("w:p");
    expect(para1?.data?.ooxmlType).toBe("paragraph");
    expect(para1?.data?.properties?.numbering).toBeDefined();
    expect(para1?.data?.properties?.numbering?.id).toEqual(
      list?.data?.properties?.numId,
    );
    expect(para1?.data?.properties?.numbering?.level).toBe(0);
  });

  // List Test (Numbered)
  it("should parse a simple numbered list", async () => {
    const root = await parseDocxFile("numbered_list.docx");
    expect(root).toBeDefined();
    expect(root?.children).toHaveLength(1);
    const list = root?.children[0] as WmlList;
    expect(list?.data?.ooxmlType).toBe("list");
    expect(list?.children).toHaveLength(3);
    expect(list?.data?.properties?.numId).toBeDefined();

    const item1 = list?.children[0] as WmlListItem | undefined;
    expect(item1?.data?.ooxmlType).toBe("listItem");
    expect(item1?.data?.properties?.level).toBe(0);
    const para1 = item1?.children[0] as WmlParagraph | undefined;
    expect(para1?.type).toBe("element");
    expect(para1?.data?.ooxmlType).toBe("paragraph");
    expect(para1?.data?.properties?.numbering).toBeDefined();
    expect(para1?.data?.properties?.numbering?.id).toEqual(
      list?.data?.properties?.numId,
    );
    expect(para1?.data?.properties?.numbering?.level).toBe(0);
  });

  // Table Test (Basic Structure)
  it("should parse a simple 2x2 table", async () => {
    const root = await parseDocxFile("simple_table.docx");
    expect(root).toBeDefined();
    expect(root?.children).toHaveLength(1);

    const table = root?.children[0] as WmlTable;
    expect(table?.type).toBe("element");
    expect(table?.name).toBe("w:tbl");
    expect(table?.data?.ooxmlType).toBe("table");
    expect(table?.children).toBeDefined();
    const tableRows = table?.children?.filter(
      (c: OoxmlNode): c is WmlTableRow =>
        c.type === "element" && (c as OoxmlElement).name === "w:tr",
    ) as WmlTableRow[] | undefined;
    expect(tableRows).toHaveLength(2);

    const row1 = tableRows?.[0];
    expect(row1?.type).toBe("element");
    expect(row1?.name).toBe("w:tr");
    expect(row1?.data?.ooxmlType).toBe("tableRow");
    const row1Cells = row1?.children?.filter(
      (c: OoxmlNode): c is WmlTableCell =>
        c.type === "element" && (c as OoxmlElement).name === "w:tc",
    ) as WmlTableCell[] | undefined;
    expect(row1Cells).toHaveLength(2);

    const cell1_1 = row1Cells?.[0];
    expect(cell1_1?.type).toBe("element");
    expect(cell1_1?.name).toBe("w:tc");
    expect(cell1_1?.data?.ooxmlType).toBe("tableCell");
    const para1_1 = cell1_1?.children?.find(
      (c: OoxmlNode): c is WmlParagraph =>
        c.type === "element" && (c as OoxmlElement).name === "w:p",
    ) as WmlParagraph | undefined;
    const run1_1 = para1_1?.children?.find(
      (c: OoxmlNode): c is WmlTextRun =>
        c.type === "element" && (c as OoxmlElement).name === "w:r",
    ) as WmlTextRun | undefined;
    const wrapper1_1 = run1_1?.children?.[0];
    let text1_1: WmlText | undefined;
    if (wrapper1_1?.type === "element") {
      text1_1 = wrapper1_1.children?.[0] as WmlText | undefined;
    }
    expect(text1_1?.value).toBe("Cell A1");

    const cell1_2 = row1Cells?.[1];
    expect(cell1_2?.data?.ooxmlType).toBe("tableCell");
    const para1_2 = cell1_2?.children?.find(
      (c: OoxmlNode): c is WmlParagraph =>
        c.type === "element" && (c as OoxmlElement).name === "w:p",
    ) as WmlParagraph | undefined;
    const run1_2 = para1_2?.children?.find(
      (c: OoxmlNode): c is WmlTextRun =>
        c.type === "element" && (c as OoxmlElement).name === "w:r",
    ) as WmlTextRun | undefined;
    const wrapper1_2 = run1_2?.children?.[0];
    let text1_2: WmlText | undefined;
    if (wrapper1_2?.type === "element") {
      text1_2 = wrapper1_2.children?.[0] as WmlText | undefined;
    }
    expect(text1_2?.value).toBe("Cell B1");

    const row2Cells = tableRows?.[1]?.children?.filter(
      (c: OoxmlNode): c is WmlTableCell =>
        c.type === "element" && (c as OoxmlElement).name === "w:tc",
    ) as WmlTableCell[] | undefined;
    expect(row2Cells).toHaveLength(2);

    const cell2_1 = row2Cells?.[0];
    expect(cell2_1?.data?.ooxmlType).toBe("tableCell");
    const para2_1 = cell2_1?.children?.find(
      (c: OoxmlNode): c is WmlParagraph =>
        c.type === "element" && (c as OoxmlElement).name === "w:p",
    ) as WmlParagraph | undefined;
    const run2_1 = para2_1?.children?.find(
      (c: OoxmlNode): c is WmlTextRun =>
        c.type === "element" && (c as OoxmlElement).name === "w:r",
    ) as WmlTextRun | undefined;
    const wrapper2_1 = run2_1?.children?.[0];
    let text2_1: WmlText | undefined;
    if (wrapper2_1?.type === "element") {
      text2_1 = wrapper2_1.children?.[0] as WmlText | undefined;
    }
    expect(text2_1?.value).toBe("Cell A2");

    const cell2_2 = row2Cells?.[1];
    expect(cell2_2?.data?.ooxmlType).toBe("tableCell");
    const para2_2 = cell2_2?.children?.find(
      (c: OoxmlNode): c is WmlParagraph =>
        c.type === "element" && (c as OoxmlElement).name === "w:p",
    ) as WmlParagraph | undefined;
    const run2_2 = para2_2?.children?.find(
      (c: OoxmlNode): c is WmlTextRun =>
        c.type === "element" && (c as OoxmlElement).name === "w:r",
    ) as WmlTextRun | undefined;
    const wrapper2_2 = run2_2?.children?.[0];
    let text2_2: WmlText | undefined;
    if (wrapper2_2?.type === "element") {
      text2_2 = wrapper2_2.children?.[0] as WmlText | undefined;
    }
    expect(text2_2?.value).toBe("Cell B2");
  });

  // Hyperlink Test
  it("should parse a hyperlink", async () => {
    const root = await parseDocxFile("hyperlink.docx");
    expect(root?.type).toBe("root");
    expect(root?.children).toHaveLength(1);
    const paragraph = root?.children[0] as WmlParagraph | undefined;
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");

    const hyperlinkElement = paragraph?.children?.find(
      (child: OoxmlNode): child is WmlHyperlink =>
        child.type === "element" &&
        (child as OoxmlElement).name === "w:hyperlink",
    ) as WmlHyperlink | undefined;

    expect(hyperlinkElement).toBeDefined();
    expect(hyperlinkElement?.type).toBe("element");
    expect(hyperlinkElement?.name).toBe("w:hyperlink");
    expect(hyperlinkElement?.data?.ooxmlType).toBe("hyperlink");
    expect(hyperlinkElement?.data?.properties?.url).toBe("https://example.com");

    expect(hyperlinkElement?.children).toHaveLength(1);
    const linkRunElement = hyperlinkElement?.children?.[0] as
      | WmlTextRun
      | undefined;
    expect(linkRunElement?.type).toBe("element");
    expect(linkRunElement?.name).toBe("w:r");
    expect(linkRunElement?.children).toHaveLength(1);
    const linkWrapper = linkRunElement?.children?.[0];
    let linkTextNode: WmlText | undefined;
    if (linkWrapper?.type === "element") {
      linkTextNode = linkWrapper.children?.[0] as WmlText | undefined;
    }
    expect(linkTextNode).toBeDefined();
    expect(linkTextNode?.type).toBe("text");
    expect(linkTextNode?.value).toBe("hyperlink");
  });

  // Recursive helper to find the first node matching a semantic type
  function findNodeByTypeRecursively(
    nodes: OoxmlElementContent[] | undefined,
    type: string,
  ): OoxmlNode | undefined {
    if (!nodes) return undefined;
    const stack: OoxmlNode[] = [...nodes];
    while (stack.length > 0) {
      const node = stack.shift();
      if (!node) continue;
      const nodeTypeToCheck = (node.data as OoxmlData | undefined)?.ooxmlType;
      if (nodeTypeToCheck === type) {
        return node;
      }
      if (
        node.type === "element" &&
        Array.isArray((node as OoxmlElement).children)
      ) {
        stack.unshift(...((node as OoxmlElement).children as OoxmlNode[]));
      }
    }
    return undefined;
  }

  // Image/Drawing Test
  it("should parse an embedded image and find its relationId", async () => {
    const root = await parseDocxFile("image.docx");
    expect(root).toBeDefined();
    const paragraph = root?.children[0] as WmlParagraph;
    expect(paragraph?.type).toBe("element");
    expect(paragraph?.name).toBe("w:p");

    const drawingNode = findNodeByTypeRecursively(
      paragraph?.children,
      "drawing",
    ) as DmlDrawing | undefined;

    expect(drawingNode).toBeDefined();
    expect(drawingNode?.type).toBe("element");
    expect(drawingNode?.data?.ooxmlType).toBe("drawing");
    expect(drawingNode?.data?.properties?.relationId).toBeDefined();
    expect(typeof drawingNode?.data?.properties?.relationId).toBe("string");
    expect(drawingNode?.data?.properties?.relationId).toMatch(/^rId\d+$/);
  });

  // Bookmark Test
  it("should parse bookmark start and end tags", async () => {
    const root = await parseDocxFile("bookmark.docx");
    expect(root).toBeDefined();
    const paragraph = root?.children[0] as WmlParagraph | undefined;
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");

    const bookmarkStartElement = findNodeByTypeRecursively(
      paragraph?.children,
      "bookmarkStart",
    ) as WmlBookmarkStart | undefined;

    expect(bookmarkStartElement).toBeDefined();
    expect(bookmarkStartElement?.type).toBe("element");
    expect(bookmarkStartElement?.data?.ooxmlType).toBe("bookmarkStart");
    expect(bookmarkStartElement?.data?.properties?.id).toBeDefined();
    expect(bookmarkStartElement?.data?.properties?.bookmarkName).toBeDefined();

    const bookmarkEndElement = findNodeByTypeRecursively(
      paragraph?.children,
      "bookmarkEnd",
    ) as WmlBookmarkEnd | undefined;

    expect(bookmarkEndElement).toBeDefined();
    expect(bookmarkEndElement?.type).toBe("element");
    expect(bookmarkEndElement?.data?.ooxmlType).toBe("bookmarkEnd");
    expect(bookmarkEndElement?.data?.properties?.id).toBeDefined();
    expect(bookmarkStartElement?.data?.properties?.id).toEqual(
      bookmarkEndElement?.data?.properties?.id,
    );
  });

  // Comment Test
  it("should parse comment references and associated comment data", async () => {
    const root = (await parseDocxFile("comment.docx")) as WmlRoot | undefined;
    expect(root).toBeDefined();
    const paragraph = root?.children[0] as WmlParagraph | undefined;
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");

    const commentRefElement = findNodeByTypeRecursively(
      paragraph?.children,
      "commentReference",
    ) as WmlCommentReference | undefined;

    expect(commentRefElement).toBeDefined();
    expect(commentRefElement?.type).toBe("element");
    expect(commentRefElement?.data?.ooxmlType).toBe("commentReference");
    const commentId = commentRefElement?.data?.properties?.id;
    expect(commentId).toBeDefined();
    expect(typeof commentId).toBe("string");

    expect(root?.data?.sharedResources?.comments).toBeDefined();
    const commentData =
      root?.data?.sharedResources?.comments?.[commentId as string];
    expect(commentData).toBeDefined();
    expect(commentData?.id).toBe(commentId);
    expect(commentData?.author).toBeDefined();
    expect(commentData?.children).toBeDefined();
    expect(commentData?.children).toHaveLength(0);
  });

  // TODO: Add tests for:
  // - Nested lists (bullet within numbered, etc.)
  // - Different numbering formats (letters, roman numerals)
  // - Table properties (width, borders, cell merging, shading)
  // - Header/Footer content
  // - Section properties (page size, margins)
  // - Different image types (VML, different embed methods)
  // - More complex text styling (superscript, subscript, highlight)
  // - Edge cases (empty document, document with only table/list)
  // - Styles applied to specific runs vs paragraphs
});
