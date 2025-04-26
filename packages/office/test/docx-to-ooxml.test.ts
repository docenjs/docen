import { readFileSync } from "node:fs";
import { join } from "node:path";
import { unified } from "unified";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";
import type { OoxmlContent, OoxmlDrawing } from "../src/ast";
import type {
  OoxmlNode,
  XastElement,
  XastNode,
  XastRoot,
  XastText,
} from "../src/ast/common-types";
import type {
  OoxmlBookmarkEnd,
  OoxmlBookmarkStart,
  OoxmlComment,
  OoxmlCommentReference,
  OoxmlHyperlink,
  OoxmlList,
  OoxmlListItem,
  OoxmlParagraph,
  OoxmlRoot,
  OoxmlTable,
  OoxmlTableCell,
  OoxmlTableRow,
  OoxmlTextRun,
} from "../src/ast/ooxml-ast";
import { docxToOoxmlAst } from "../src/plugins/docx-to-ooxml";

// Helper function to load a DOCX file and run the parser
async function parseDocxFile(fileName: string): Promise<OoxmlRoot | undefined> {
  const filePath = join(__dirname, "fixtures", fileName);
  const buffer = readFileSync(filePath);
  const file = new VFile({ value: new Uint8Array(buffer), path: filePath });

  // Create a minimal OoxmlRoot to satisfy the type checker for processor.run
  const initialRoot: OoxmlRoot = {
    type: "root",
    children: [],
    data: { ooxmlType: "root" },
  };

  const processor = unified().use(docxToOoxmlAst);
  // Pass the minimal OoxmlRoot
  const result = await processor.run(initialRoot, file);

  if (file.messages.length > 0) {
    console.warn(`Messages for ${fileName}:`, file.messages);
  }
  return result as OoxmlRoot | undefined;
}

describe("docxToOoxmlAst Plugin (XAST-based)", () => {
  // Basic Paragraph Test
  it("should parse a simple paragraph with text", async () => {
    const root = await parseDocxFile("simple_paragraph.docx");
    expect(root).toBeDefined();
    expect(root?.type).toBe("root");
    // Root's children are now OoxmlBlockContent
    expect(root?.children).toHaveLength(1);

    // Expecting an OoxmlParagraph (which extends XastElement)
    const paragraph = root?.children[0] as OoxmlParagraph | undefined;
    expect(paragraph?.type).toBe("element"); // Now inherits from XastElement
    expect(paragraph?.name).toBe("w:p"); // Check element name
    expect(paragraph?.data?.ooxmlType).toBe("paragraph"); // Check semantic type
    expect(paragraph?.children).toBeDefined();
    expect(paragraph?.children).toHaveLength(1); // Should contain one child (the run element)

    // The direct child is likely the <w:r> element
    const runElement = paragraph?.children?.[0] as XastElement | undefined;
    expect(runElement?.type).toBe("element");
    expect(runElement?.name).toBe("w:r");
    expect(runElement?.children).toHaveLength(1); // <w:r> contains <w:t>

    // The text run node is inside <w:r>
    const textNode = runElement?.children?.[0] as OoxmlTextRun | undefined;
    expect(textNode?.type).toBe("text"); // Now inherits from XastText
    expect(textNode?.value).toBe("This is a simple paragraph.");
    expect(textNode?.data?.ooxmlType).toBe("textRun"); // Check semantic type
    // Check default properties (if populated by parser)
    // expect(textNode?.data?.properties).toBeDefined();
  });

  // Styles Test (Bold/Italic)
  it("should parse bold and italic text runs with properties in data", async () => {
    const root = await parseDocxFile("styled_text.docx");
    expect(root?.type).toBe("root");
    expect(root?.children).toHaveLength(1);
    const paragraph = root?.children[0] as OoxmlParagraph | undefined;
    expect(paragraph?.type).toBe("element");
    expect(paragraph?.name).toBe("w:p");
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");
    // Paragraph contains <w:r> elements
    expect(paragraph?.children).toHaveLength(5);

    // Find the specific <w:r> elements and check their <w:t> children
    const boldRunElement = paragraph?.children?.[1] as XastElement | undefined;
    const boldTextNode = boldRunElement?.children?.find(
      (c: XastNode) => c.type === "text",
    ) as OoxmlTextRun | undefined;
    expect(boldTextNode?.value).toBe("bold");
    expect(boldTextNode?.data?.ooxmlType).toBe("textRun");
    expect(boldTextNode?.data?.properties?.bold).toBe(true);
    expect(boldTextNode?.data?.properties?.italic).toBeUndefined();

    const italicRunElement = paragraph?.children?.[3] as
      | XastElement
      | undefined;
    const italicTextNode = italicRunElement?.children?.find(
      (c: XastNode) => c.type === "text",
    ) as OoxmlTextRun | undefined;
    expect(italicTextNode?.value).toBe("italic");
    expect(italicTextNode?.data?.ooxmlType).toBe("textRun");
    expect(italicTextNode?.data?.properties?.italic).toBe(true);
    expect(italicTextNode?.data?.properties?.bold).toBeUndefined();

    // Check non-styled runs (accessing data.properties correctly)
    const normalRun1Element = paragraph?.children?.[0] as
      | XastElement
      | undefined;
    const normalText1Node = normalRun1Element?.children?.find(
      (c: XastNode) => c.type === "text",
    ) as OoxmlTextRun | undefined;
    expect(normalText1Node?.data?.properties?.bold).toBeUndefined(); // Correct access
    expect(normalText1Node?.data?.properties?.italic).toBeUndefined(); // Correct access

    const normalRun2Element = paragraph?.children?.[2] as
      | XastElement
      | undefined;
    const normalText2Node = normalRun2Element?.children?.find(
      (c: XastNode) => c.type === "text",
    ) as OoxmlTextRun | undefined;
    expect(normalText2Node?.data?.properties?.bold).toBeUndefined(); // Correct access
    expect(normalText2Node?.data?.properties?.italic).toBeUndefined(); // Correct access

    const normalRun3Element = paragraph?.children?.[4] as
      | XastElement
      | undefined;
    const normalText3Node = normalRun3Element?.children?.find(
      (c: XastNode) => c.type === "text",
    ) as OoxmlTextRun | undefined;
    expect(normalText3Node?.data?.properties?.bold).toBeUndefined(); // Correct access
    expect(normalText3Node?.data?.properties?.italic).toBeUndefined(); // Correct access
  });

  // List Test (Bulleted)
  it("should parse a simple bulleted list", async () => {
    const root = await parseDocxFile("bullet_list.docx");
    expect(root).toBeDefined();
    expect(root?.children).toHaveLength(1);
    const list = root?.children[0] as OoxmlList;
    expect(list?.type).toBe("list");
    expect(list?.children).toHaveLength(3); // Assuming 3 list items
    expect(list?.properties?.numId).toBeDefined(); // Check if list has numbering ID

    // Check first list item
    const item1 = list?.children[0] as OoxmlListItem | undefined;
    expect(item1?.type).toBe("listItem");
    expect(item1?.properties?.level).toBe(0); // Assuming level 0
    expect(item1?.children).toHaveLength(1);
    const para1 = item1?.children[0] as OoxmlParagraph | undefined;
    expect(para1?.type).toBe("element");
    expect(para1?.name).toBe("w:p");
    expect(para1?.data?.ooxmlType).toBe("paragraph");
    // Remove non-null assertions, rely on optional chaining
    expect(para1?.data?.properties?.numbering).toBeDefined(); // Check if numbering exists
    expect(para1?.data?.properties?.numbering?.id).toEqual(
      list?.properties?.numId,
    );
    expect(para1?.data?.properties?.numbering?.level).toBe(0);
    // Check text content if needed
    // expect((para1?.children[0] as OoxmlTextRun)?.value).toBe('Item 1');
  });

  // List Test (Numbered)
  it("should parse a simple numbered list", async () => {
    const root = await parseDocxFile("numbered_list.docx");
    expect(root).toBeDefined();
    expect(root?.children).toHaveLength(1);
    const list = root?.children[0] as OoxmlList;
    expect(list?.type).toBe("list");
    expect(list?.children).toHaveLength(3); // Assuming 3 list items
    expect(list?.properties?.numId).toBeDefined();

    // Check first list item (similar checks as bulleted list)
    const item1 = list?.children[0] as OoxmlListItem | undefined;
    expect(item1?.type).toBe("listItem");
    expect(item1?.properties?.level).toBe(0);
    const para1 = item1?.children[0] as OoxmlParagraph | undefined;
    expect(para1?.type).toBe("element");
    expect(para1?.data?.ooxmlType).toBe("paragraph");
    // Remove non-null assertions, rely on optional chaining
    expect(para1?.data?.properties?.numbering).toBeDefined(); // Check if numbering exists
    expect(para1?.data?.properties?.numbering?.id).toEqual(
      list?.properties?.numId,
    );
    expect(para1?.data?.properties?.numbering?.level).toBe(0);
  });

  // Table Test (Basic Structure)
  it("should parse a simple 2x2 table", async () => {
    const root = await parseDocxFile("simple_table.docx");
    expect(root).toBeDefined();
    expect(root?.children).toHaveLength(2); // Expect table AND the following paragraph

    const table = root?.children[0] as OoxmlTable;
    expect(table?.type).toBe("element");
    expect(table?.name).toBe("w:tbl");
    expect(table?.data?.ooxmlType).toBe("table");
    expect(table?.children).toBeDefined();
    // Use XastElement from common-types
    const tableRows = table?.children?.filter(
      (c): c is OoxmlTableRow => c.type === "element" && c.name === "w:tr",
    ) as OoxmlTableRow[] | undefined;
    expect(tableRows).toHaveLength(2);

    const row1 = tableRows?.[0];
    expect(row1?.type).toBe("element");
    expect(row1?.name).toBe("w:tr");
    expect(row1?.data?.ooxmlType).toBe("tableRow");
    // Use XastElement from common-types
    const row1Cells = row1?.children?.filter(
      (c): c is OoxmlTableCell => c.type === "element" && c.name === "w:tc",
    ) as OoxmlTableCell[] | undefined;
    expect(row1Cells).toHaveLength(2);

    const cell1_1 = row1Cells?.[0];
    expect(cell1_1?.type).toBe("element");
    expect(cell1_1?.name).toBe("w:tc");
    expect(cell1_1?.data?.ooxmlType).toBe("tableCell");
    // Use XastElement from common-types
    const cell1_1Paras = cell1_1?.children?.filter(
      (c): c is OoxmlParagraph => c.type === "element" && c.name === "w:p",
    ) as OoxmlParagraph[] | undefined;
    expect(cell1_1Paras).toHaveLength(1);
    const para1_1 = cell1_1Paras?.[0];
    expect(para1_1?.data?.ooxmlType).toBe("paragraph");
    const run1_1 = para1_1?.children?.find(
      (c) => c.type === "element" && c.name === "w:r",
    ) as XastElement | undefined;
    // Use XastNode from common-types
    const text1_1 = run1_1?.children?.find(
      (c: XastNode) => c.type === "text",
    ) as OoxmlTextRun | undefined;
    expect(text1_1?.value).toBe("Cell A1");

    const cell1_2 = row1Cells?.[1];
    expect(cell1_2?.data?.ooxmlType).toBe("tableCell");
    const cell1_2Paras = cell1_2?.children?.filter(
      (c): c is OoxmlParagraph => c.type === "element" && c.name === "w:p",
    ) as OoxmlParagraph[] | undefined;
    expect(cell1_2Paras).toHaveLength(1);

    const row2 = tableRows?.[1];
    const row2Cells = row2?.children?.filter(
      (c): c is OoxmlTableCell => c.type === "element" && c.name === "w:tc",
    ) as OoxmlTableCell[] | undefined;
    expect(row2Cells).toHaveLength(2);
  });

  // Hyperlink Test
  it("should parse a hyperlink", async () => {
    const root = await parseDocxFile("hyperlink.docx");
    expect(root?.type).toBe("root");
    expect(root?.children).toHaveLength(1);
    const paragraph = root?.children[0] as OoxmlParagraph | undefined;
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");

    const hyperlinkElement = paragraph?.children?.find(
      (child): child is OoxmlHyperlink =>
        child.type === "element" && child.name === "w:hyperlink",
    ) as OoxmlHyperlink | undefined;

    expect(hyperlinkElement).toBeDefined();
    expect(hyperlinkElement?.type).toBe("element");
    expect(hyperlinkElement?.name).toBe("w:hyperlink");
    expect(hyperlinkElement?.data?.ooxmlType).toBe("hyperlink");
    expect(hyperlinkElement?.data?.url).toBe("https://example.com/");

    // Hyperlink children contain the <w:r> element
    expect(hyperlinkElement?.children).toHaveLength(1);
    const linkRunElement = hyperlinkElement?.children?.[0] as
      | XastElement
      | undefined;
    expect(linkRunElement?.type).toBe("element");
    expect(linkRunElement?.name).toBe("w:r");
    expect(linkRunElement?.children).toHaveLength(1); // <w:r> contains the text node

    // Find the OoxmlTextRun node inside the <w:r> element
    const linkTextNode = linkRunElement?.children?.find(
      (c: XastNode): c is OoxmlTextRun => c.type === "text",
    ) as OoxmlTextRun | undefined;
    expect(linkTextNode).toBeDefined();
    expect(linkTextNode?.type).toBe("text"); // OoxmlTextRun extends XastText
    expect(linkTextNode?.value).toBe("link");
    expect(linkTextNode?.data?.ooxmlType).toBe("textRun");
    // Optionally check for hyperlink style in properties
    // expect(linkTextNode?.data?.properties?.styleId).toBe('Hyperlink');
  });

  // Helper function to search recursively within nodes for a specific type
  function findNodeByTypeRecursively(
    nodes: OoxmlContent[] | undefined,
    type: string,
  ): OoxmlNode | undefined {
    if (!nodes) return undefined;
    for (const node of nodes) {
      if (node.type === type) {
        return node;
      }
      // Check children if it's a parent node (like textRun, paragraph, list item, table cell etc.)
      if ("children" in node && Array.isArray((node as any).children)) {
        const found = findNodeByTypeRecursively((node as any).children, type);
        if (found) return found;
      }
    }
    return undefined;
  }

  // Image/Drawing Test
  it("should parse an embedded image and find its relationId", async () => {
    const root = await parseDocxFile("image.docx");
    expect(root).toBeDefined();
    const paragraph = root?.children[0] as OoxmlParagraph;
    expect(paragraph?.type).toBe("element");
    expect(paragraph?.name).toBe("w:p");

    // Search recursively within the paragraph's children
    const drawingNode = findNodeByTypeRecursively(
      paragraph?.children,
      "drawing",
    ) as OoxmlDrawing | undefined;

    expect(drawingNode).toBeDefined();
    expect(drawingNode?.type).toBe("element");
    expect(drawingNode?.data?.ooxmlType).toBe("drawing");
    expect(drawingNode?.data?.properties?.relationId).toBeDefined();
    expect(typeof drawingNode?.data?.properties?.relationId).toBe("string");
    expect(drawingNode?.data?.properties?.relationId).toMatch(/^rId\d+$/); // Use double backslash for regex
  });

  // Bookmark Test
  it("should parse bookmark start and end tags", async () => {
    const root = await parseDocxFile("bookmark.docx");
    expect(root).toBeDefined();
    const paragraph = root?.children[0] as OoxmlParagraph | undefined;
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");

    const bookmarkStartElement = findNodeByTypeRecursively(
      paragraph?.children,
      "bookmarkStart",
    ) as OoxmlBookmarkStart | undefined;

    expect(bookmarkStartElement).toBeDefined();
    // OoxmlBookmarkStart doesn't extend XastElement directly, check specific props
    expect(bookmarkStartElement?.type).toBe("bookmarkStart");
    expect(bookmarkStartElement?.data?.ooxmlType).toBe("bookmarkStart");
    expect(bookmarkStartElement?.id).toBeDefined(); // Check id directly
    expect(bookmarkStartElement?.name).toBeDefined(); // Check name directly

    const bookmarkEndElement = findNodeByTypeRecursively(
      paragraph?.children,
      "bookmarkEnd",
    ) as OoxmlBookmarkEnd | undefined;

    expect(bookmarkEndElement).toBeDefined();
    expect(bookmarkEndElement?.type).toBe("bookmarkEnd");
    expect(bookmarkEndElement?.data?.ooxmlType).toBe("bookmarkEnd");
    expect(bookmarkEndElement?.id).toBeDefined(); // Check id directly
    expect(bookmarkStartElement?.id).toEqual(bookmarkEndElement?.id);
  });

  // Comment Test
  it("should parse comment references and associated comment data", async () => {
    const root = await parseDocxFile("comment.docx");
    expect(root).toBeDefined();
    const paragraph = root?.children[0] as OoxmlParagraph | undefined;
    expect(paragraph?.data?.ooxmlType).toBe("paragraph");

    const commentRefElement = findNodeByTypeRecursively(
      paragraph?.children,
      "commentReference",
    ) as OoxmlCommentReference | undefined;

    expect(commentRefElement).toBeDefined();
    expect(commentRefElement?.type).toBe("commentReference");
    expect(commentRefElement?.data?.ooxmlType).toBe("commentReference");
    const commentId = commentRefElement?.id;
    expect(commentId).toBeDefined();
    expect(typeof commentId).toBe("string");

    expect(root?.data?.metadata?.comments).toBeDefined();
    const commentData = root?.data?.metadata?.comments?.[
      commentId as string
    ] as OoxmlComment | undefined;
    expect(commentData).toBeDefined();
    expect(commentData?.type).toBe("comment");
    expect(commentData?.id).toBe(commentId);
    expect(commentData?.author).toBeDefined();
    expect(commentData?.children).toBeDefined();
    expect(commentData?.children.length).toBeGreaterThan(0);

    const commentPara = commentData?.children[0] as OoxmlParagraph | undefined;
    expect(commentPara).toBeDefined(); // Check if commentPara exists
    if (commentPara) {
      expect(commentPara.data?.ooxmlType).toBe("paragraph");
      expect(commentPara.children.length).toBeGreaterThan(0);

      // Correctly access the text run inside the <w:r> element
      const firstRunElement = commentPara.children[0] as
        | XastElement
        | undefined;
      expect(firstRunElement).toBeDefined();
      expect(firstRunElement?.type).toBe("element");
      expect(firstRunElement?.name).toBe("w:r");
      expect(firstRunElement?.children).toHaveLength(1);

      const textRun = firstRunElement?.children?.find(
        (c: XastNode): c is OoxmlTextRun => c.type === "text",
      ) as OoxmlTextRun | undefined;
      expect(textRun).toBeDefined();
      expect(textRun?.value.trim()).toBeTruthy();
    }
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
