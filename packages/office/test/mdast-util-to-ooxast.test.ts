import type {
  BlockContent,
  DefinitionContent,
  Root as MdastRoot,
  PhrasingContent,
} from "mdast";
import { unified } from "unified";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";
import type {
  FontProperties,
  OoxmlElement,
  OoxmlRoot,
  ParagraphFormatting,
  WmlTableProperties,
} from "../src/ast";
import { mdastToOoxast } from "../src/plugins";

// Helper function to create MDAST nodes for testing
function createMdastRoot(
  children: (BlockContent | DefinitionContent)[]
): MdastRoot {
  return {
    type: "root",
    children,
  };
}

// Helper function to process MDAST and get OOXML AST
function processToOoxast(mdastTree: MdastRoot): OoxmlRoot {
  const processor = unified().use(mdastToOoxast);
  const file = new VFile();
  return processor.runSync(mdastTree, file) as OoxmlRoot;
}

describe("mdast-util-to-ooxast Plugin Tests", () => {
  it("should convert simple paragraph", () => {
    const mdast = createMdastRoot([
      {
        type: "paragraph",
        children: [{ type: "text", value: "Hello, world!" }],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);

    expect(ooxmlAst.type).toBe("root");
    expect(ooxmlAst.children).toHaveLength(1);

    const paragraph = ooxmlAst.children[0] as OoxmlElement;
    expect(paragraph.type).toBe("element");
    expect(paragraph.name).toBe("w:p");
    expect(paragraph.data?.ooxmlType).toBe("paragraph");
    expect(paragraph.children).toHaveLength(1);

    const run = paragraph.children[0] as OoxmlElement;
    expect(run.type).toBe("element");
    expect(run.name).toBe("w:r");
    expect(run.data?.ooxmlType).toBe("textRun");
  });

  it("should convert headings with appropriate style", () => {
    const mdast = createMdastRoot([
      {
        type: "heading",
        depth: 1,
        children: [{ type: "text", value: "Main Title" }],
      },
      {
        type: "heading",
        depth: 2,
        children: [{ type: "text", value: "Subtitle" }],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);

    expect(ooxmlAst.children).toHaveLength(2);

    const h1 = ooxmlAst.children[0] as OoxmlElement;
    expect(h1.data?.ooxmlType).toBe("paragraph");
    const h1Props = h1.data?.properties as ParagraphFormatting;
    expect(h1Props.styleId).toBe("Heading1");

    const h2 = ooxmlAst.children[1] as OoxmlElement;
    expect(h2.data?.ooxmlType).toBe("paragraph");
    const h2Props = h2.data?.properties as ParagraphFormatting;
    expect(h2Props.styleId).toBe("Heading2");
  });

  it("should convert formatted text (bold, italic, strikethrough)", () => {
    const mdast = createMdastRoot([
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Normal " },
          {
            type: "strong",
            children: [{ type: "text", value: "bold" }],
          },
          { type: "text", value: " " },
          {
            type: "emphasis",
            children: [{ type: "text", value: "italic" }],
          },
          { type: "text", value: " " },
          {
            type: "delete",
            children: [{ type: "text", value: "strikethrough" }],
          },
        ] as PhrasingContent[],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    const paragraph = ooxmlAst.children[0] as OoxmlElement;
    expect(paragraph.children).toHaveLength(6); // 6 runs

    // Bold text run
    const boldRun = paragraph.children[1] as OoxmlElement;
    expect(boldRun.data?.ooxmlType).toBe("textRun");
    const boldProps = boldRun.data?.properties as FontProperties;
    expect(boldProps.bold).toBe(true);

    // Italic text run
    const italicRun = paragraph.children[3] as OoxmlElement;
    expect(italicRun.data?.ooxmlType).toBe("textRun");
    const italicProps = italicRun.data?.properties as FontProperties;
    expect(italicProps.italic).toBe(true);

    // Strike text run
    const strikeRun = paragraph.children[5] as OoxmlElement;
    expect(strikeRun.data?.ooxmlType).toBe("textRun");
    const strikeProps = strikeRun.data?.properties as FontProperties;
    expect(strikeProps.strike).toBe(true);
  });

  it("should convert links", () => {
    const mdast = createMdastRoot([
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Visit " },
          {
            type: "link",
            url: "https://example.com",
            title: "Example Site",
            children: [{ type: "text", value: "example.com" }],
          },
        ] as PhrasingContent[],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    const paragraph = ooxmlAst.children[0] as OoxmlElement;
    expect(paragraph.children).toHaveLength(2);

    const hyperlink = paragraph.children[1] as OoxmlElement;
    expect(hyperlink.data?.ooxmlType).toBe("hyperlink");
    expect(hyperlink.data?.properties).toMatchObject({
      url: "https://example.com",
      title: "Example Site",
      tooltip: "Example Site",
    });
  });

  it("should convert bullet lists", () => {
    const mdast = createMdastRoot([
      {
        type: "list",
        ordered: false,
        children: [
          {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", value: "First item" }],
              },
            ],
          },
          {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", value: "Second item" }],
              },
            ],
          },
        ],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    expect(ooxmlAst.children).toHaveLength(1);

    const list = ooxmlAst.children[0] as OoxmlElement;
    expect(list.data?.ooxmlType).toBe("list");
    // WmlListProperties doesn't have ordered property, it's determined by list type in conversion
    expect(list.children).toHaveLength(2);

    const firstItem = list.children[0] as OoxmlElement;
    expect(firstItem.data?.ooxmlType).toBe("listItem");
  });

  it("should convert numbered lists", () => {
    const mdast = createMdastRoot([
      {
        type: "list",
        ordered: true,
        start: 1,
        children: [
          {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", value: "First item" }],
              },
            ],
          },
          {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", value: "Second item" }],
              },
            ],
          },
        ],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    const list = ooxmlAst.children[0] as OoxmlElement;
    expect(list.data?.ooxmlType).toBe("list");
    // WmlListProperties doesn't have ordered property, it's determined by list type in conversion
  });

  it("should convert tables", () => {
    const mdast = createMdastRoot([
      {
        type: "table",
        align: ["left", "center", "right"],
        children: [
          {
            type: "tableRow",
            children: [
              {
                type: "tableCell",
                children: [{ type: "text", value: "Header 1" }],
              },
              {
                type: "tableCell",
                children: [{ type: "text", value: "Header 2" }],
              },
              {
                type: "tableCell",
                children: [{ type: "text", value: "Header 3" }],
              },
            ],
          },
          {
            type: "tableRow",
            children: [
              {
                type: "tableCell",
                children: [{ type: "text", value: "Cell 1" }],
              },
              {
                type: "tableCell",
                children: [{ type: "text", value: "Cell 2" }],
              },
              {
                type: "tableCell",
                children: [{ type: "text", value: "Cell 3" }],
              },
            ],
          },
        ],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    const table = ooxmlAst.children[0] as OoxmlElement;
    expect(table.data?.ooxmlType).toBe("table");
    expect(table.name).toBe("w:tbl");

    const tableProps = table.data?.properties as WmlTableProperties;
    expect(tableProps.borders).toBeDefined();
    expect(tableProps.width).toEqual({ value: 100, unit: "pct" });
  });

  it("should convert code blocks", () => {
    const mdast = createMdastRoot([
      {
        type: "code",
        lang: "javascript",
        meta: null,
        value: "console.log('Hello, world!');",
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    expect(ooxmlAst.children).toHaveLength(1);

    const codeParagraph = ooxmlAst.children[0] as OoxmlElement;
    expect(codeParagraph.data?.ooxmlType).toBe("paragraph");
    const codeProps = codeParagraph.data?.properties as ParagraphFormatting;
    expect(codeProps.styleId).toBe("CodeBlock");
  });

  it("should convert inline code", () => {
    const mdast = createMdastRoot([
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Use " },
          { type: "inlineCode", value: "console.log()" },
          { type: "text", value: " to output." },
        ] as PhrasingContent[],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    const paragraph = ooxmlAst.children[0] as OoxmlElement;
    expect(paragraph.children).toHaveLength(3);

    const codeRun = paragraph.children[1] as OoxmlElement;
    expect(codeRun.data?.ooxmlType).toBe("textRun");
    const codeProps = codeRun.data?.properties as FontProperties;
    expect(codeProps.styleId).toBe("CodeChar");
  });

  it("should convert blockquotes", () => {
    const mdast = createMdastRoot([
      {
        type: "blockquote",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", value: "This is a quote." }],
          },
        ],
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    expect(ooxmlAst.children).toHaveLength(1);

    const quoteParagraph = ooxmlAst.children[0] as OoxmlElement;
    expect(quoteParagraph.data?.ooxmlType).toBe("paragraph");
    const quoteProps = quoteParagraph.data?.properties as ParagraphFormatting;
    expect(quoteProps.styleId).toBe("Quote");
  });

  it("should convert thematic breaks", () => {
    const mdast = createMdastRoot([
      {
        type: "thematicBreak",
      },
    ]);

    const ooxmlAst = processToOoxast(mdast);
    expect(ooxmlAst.children).toHaveLength(1);

    const breakParagraph = ooxmlAst.children[0] as OoxmlElement;
    expect(breakParagraph.data?.ooxmlType).toBe("paragraph");
    const breakProps = breakParagraph.data?.properties as ParagraphFormatting;
    expect(breakProps.thematicBreak).toBe(true);
  });

  it("should handle empty root", () => {
    const mdast = createMdastRoot([]);
    const ooxmlAst = processToOoxast(mdast);

    expect(ooxmlAst.type).toBe("root");
    expect(ooxmlAst.children).toHaveLength(0);
    expect(ooxmlAst.data?.ooxmlType).toBe("root");
  });
});
