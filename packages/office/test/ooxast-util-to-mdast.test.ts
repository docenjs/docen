import type { Root as MdastRoot } from "mdast";
import { unified } from "unified";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";
import type {
  FontProperties,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlRoot,
  ParagraphFormatting,
} from "../src/ast";
import { ooxastToMdast } from "../src/plugins";
import type { ToMdastOptions } from "../src/types";

// Helper function to create a simple OOXML AST structure
function createOoxmlParagraph(
  text: string,
  properties?: ParagraphFormatting
): OoxmlElement {
  return {
    type: "element",
    name: "paragraph",
    attributes: {},
    children: [
      {
        type: "element",
        name: "textRun",
        attributes: {},
        children: [
          {
            type: "text",
            value: text,
            data: { ooxmlType: "text" },
          },
        ],
        data: { ooxmlType: "textRun" },
      },
    ],
    data: { ooxmlType: "paragraph", properties: properties || {} },
  };
}

function createOoxmlHeading(text: string, level: number): OoxmlElement {
  return {
    type: "element",
    name: "heading",
    attributes: {},
    children: [
      {
        type: "text",
        value: text,
        data: { ooxmlType: "text" },
      },
    ],
    data: {
      ooxmlType: "heading",
      properties: { level },
    },
  };
}

function createOoxmlTable(): OoxmlElement {
  return {
    type: "element",
    name: "table",
    attributes: {},
    children: [
      {
        type: "element",
        name: "tableRow",
        attributes: {},
        children: [
          {
            type: "element",
            name: "tableCell",
            attributes: {},
            children: [
              {
                type: "text",
                value: "Cell 1",
                data: { ooxmlType: "text" },
              },
            ],
            data: { ooxmlType: "tableCell" },
          },
          {
            type: "element",
            name: "tableCell",
            attributes: {},
            children: [
              {
                type: "text",
                value: "Cell 2",
                data: { ooxmlType: "text" },
              },
            ],
            data: { ooxmlType: "tableCell" },
          },
        ],
        data: { ooxmlType: "tableRow" },
      },
    ],
    data: { ooxmlType: "table" },
  };
}

function createOoxmlRoot(children: OoxmlElementContent[]): OoxmlRoot {
  return {
    type: "root",
    children,
    data: { ooxmlType: "root" },
  };
}

// Helper function to process OOXML AST to MDAST
async function processToMdast(
  ooxmlAst: OoxmlRoot,
  options?: ToMdastOptions
): Promise<VFile> {
  const processor = unified().use(ooxastToMdast, options);
  const file = new VFile();
  const result = await processor.run(ooxmlAst, file);
  // Store the result in file.data for backwards compatibility with tests
  file.data = { ...file.data, mdast: result };
  return file;
}

describe("ooxast-util-to-mdast Plugin Tests", () => {
  it("should convert simple paragraph to MDAST", async () => {
    const ooxmlAst = createOoxmlRoot([createOoxmlParagraph("Hello, world!")]);

    const file = await processToMdast(ooxmlAst);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.type).toBe("root");
    expect(mdast.children).toHaveLength(1);
    expect(mdast.children[0]?.type).toBe("paragraph");
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should convert heading with different levels", async () => {
    const ooxmlAst = createOoxmlRoot([
      createOoxmlHeading("Main Title", 1),
      createOoxmlHeading("Subtitle", 2),
      createOoxmlParagraph("Content paragraph"),
    ]);

    const file = await processToMdast(ooxmlAst);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.children).toHaveLength(3);

    // Check first heading
    expect(mdast.children[0]?.type).toBe("heading");
    if (mdast.children[0]?.type === "heading") {
      expect(mdast.children[0].depth).toBe(1);
    }

    // Check second heading
    expect(mdast.children[1]?.type).toBe("heading");
    if (mdast.children[1]?.type === "heading") {
      expect(mdast.children[1].depth).toBe(2);
    }

    // Check paragraph
    expect(mdast.children[2]?.type).toBe("paragraph");
  });

  it("should convert formatted text runs", async () => {
    const boldParagraph: OoxmlElement = {
      type: "element",
      name: "paragraph",
      attributes: {},
      children: [
        {
          type: "element",
          name: "textRun",
          attributes: {},
          children: [
            {
              type: "text",
              value: "Bold text",
              data: { ooxmlType: "text" },
            },
          ],
          data: {
            ooxmlType: "textRun",
            properties: { bold: true } as FontProperties,
          },
        },
      ],
      data: { ooxmlType: "paragraph", properties: {} },
    };

    const ooxmlAst = createOoxmlRoot([boldParagraph]);
    const file = await processToMdast(ooxmlAst);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.children).toHaveLength(1);

    if (mdast.children[0]?.type === "paragraph") {
      expect(mdast.children[0].children).toHaveLength(1);
      expect(mdast.children[0].children[0]?.type).toBe("strong");
    }
  });

  it("should convert tables", async () => {
    const ooxmlAst = createOoxmlRoot([createOoxmlTable()]);
    const file = await processToMdast(ooxmlAst);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.children).toHaveLength(1);
    expect(mdast.children[0]?.type).toBe("table");

    if (mdast.children[0]?.type === "table") {
      expect(mdast.children[0].children).toHaveLength(1);
      expect(mdast.children[0].children[0]?.type).toBe("tableRow");

      if (mdast.children[0].children[0]?.type === "tableRow") {
        expect(mdast.children[0].children[0].children).toHaveLength(2);
        expect(mdast.children[0].children[0].children[0]?.type).toBe(
          "tableCell"
        );
        expect(mdast.children[0].children[0].children[1]?.type).toBe(
          "tableCell"
        );
      }
    }
  });

  it("should convert hyperlinks", async () => {
    const hyperlinkParagraph: OoxmlElement = {
      type: "element",
      name: "paragraph",
      attributes: {},
      children: [
        {
          type: "element",
          name: "hyperlink",
          attributes: {},
          children: [
            {
              type: "text",
              value: "Visit Example",
              data: { ooxmlType: "text" },
            },
          ],
          data: {
            ooxmlType: "hyperlink",
            properties: {
              url: "https://example.com",
            },
          },
        },
      ],
      data: { ooxmlType: "paragraph", properties: {} },
    };

    const ooxmlAst = createOoxmlRoot([hyperlinkParagraph]);
    const file = await processToMdast(ooxmlAst);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.children).toHaveLength(1);

    if (mdast.children[0]?.type === "paragraph") {
      expect(mdast.children[0].children).toHaveLength(1);
      expect(mdast.children[0].children[0]?.type).toBe("link");

      if (mdast.children[0].children[0]?.type === "link") {
        expect(mdast.children[0].children[0].url).toBe("https://example.com");
      }
    }
  });

  it("should convert lists", async () => {
    const listElement: OoxmlElement = {
      type: "element",
      name: "list",
      attributes: {},
      children: [
        {
          type: "element",
          name: "listItem",
          attributes: {},
          children: [createOoxmlParagraph("First item")],
          data: { ooxmlType: "listItem" },
        },
        {
          type: "element",
          name: "listItem",
          attributes: {},
          children: [createOoxmlParagraph("Second item")],
          data: { ooxmlType: "listItem" },
        },
      ],
      data: {
        ooxmlType: "list",
        properties: { ordered: false },
      },
    };

    const ooxmlAst = createOoxmlRoot([listElement]);
    const file = await processToMdast(ooxmlAst);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.children).toHaveLength(1);
    expect(mdast.children[0]?.type).toBe("list");

    if (mdast.children[0]?.type === "list") {
      expect(mdast.children[0].ordered).toBe(false);
      expect(mdast.children[0].children).toHaveLength(2);
      expect(mdast.children[0].children[0]?.type).toBe("listItem");
      expect(mdast.children[0].children[1]?.type).toBe("listItem");
    }
  });

  it("should handle drawing elements", async () => {
    const drawingElement: OoxmlElement = {
      type: "element",
      name: "drawing",
      attributes: {},
      children: [],
      data: {
        ooxmlType: "drawing",
        relationId: "rId1",
        properties: {
          alt: "Sample image",
          title: "Image title",
        },
      },
    };

    const options: ToMdastOptions = {
      resolveImagePath: (relationId: string) => `images/${relationId}.png`,
    };

    const ooxmlAst = createOoxmlRoot([drawingElement]);
    const file = await processToMdast(ooxmlAst, options);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.children).toHaveLength(1);
    expect(mdast.children[0]?.type).toBe("image");

    if (mdast.children[0]?.type === "image") {
      expect(mdast.children[0].url).toBe("images/rId1.png");
      expect(mdast.children[0].alt).toBe("Sample image");
      expect(mdast.children[0].title).toBe("Image title");
    }
  });

  it("should handle empty document", async () => {
    const emptyAst = createOoxmlRoot([]);
    const file = await processToMdast(emptyAst);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.type).toBe("root");
    expect(mdast.children).toHaveLength(0);
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle complex formatting combinations", async () => {
    const complexParagraph: OoxmlElement = {
      type: "element",
      name: "paragraph",
      attributes: {},
      children: [
        {
          type: "element",
          name: "textRun",
          attributes: {},
          children: [
            {
              type: "text",
              value: "Normal ",
              data: { ooxmlType: "text" },
            },
          ],
          data: { ooxmlType: "textRun" },
        },
        {
          type: "element",
          name: "textRun",
          attributes: {},
          children: [
            {
              type: "text",
              value: "bold and italic ",
              data: { ooxmlType: "text" },
            },
          ],
          data: {
            ooxmlType: "textRun",
            properties: {
              bold: true,
              italic: true,
            } as FontProperties,
          },
        },
        {
          type: "element",
          name: "textRun",
          attributes: {},
          children: [
            {
              type: "text",
              value: "monospace",
              data: { ooxmlType: "text" },
            },
          ],
          data: {
            ooxmlType: "textRun",
            properties: {
              name: "Courier New",
            } as FontProperties,
          },
        },
      ],
      data: { ooxmlType: "paragraph", properties: {} },
    };

    const ooxmlAst = createOoxmlRoot([complexParagraph]);
    const file = await processToMdast(ooxmlAst);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.children).toHaveLength(1);

    if (mdast.children[0]?.type === "paragraph") {
      expect(mdast.children[0].children.length).toBeGreaterThan(0);
      // Should contain text, emphasis/strong, and inlineCode elements
      const hasInlineCode = mdast.children[0].children.some(
        (child) => child.type === "inlineCode"
      );
      expect(hasInlineCode).toBe(true);
    }
  });

  it("should respect allowHtml option", async () => {
    const options: ToMdastOptions = {
      allowHtml: true,
      preserveAttributes: true,
    };

    const customElement: OoxmlElement = {
      type: "element",
      name: "customElement",
      attributes: {
        "data-custom": "value",
      },
      children: [
        {
          type: "text",
          value: "Custom content",
          data: { ooxmlType: "text" },
        },
      ],
      data: { ooxmlType: "custom" },
    };

    const ooxmlAst = createOoxmlRoot([customElement]);
    const file = await processToMdast(ooxmlAst, options);

    expect(file.data?.mdast).toBeDefined();
    const mdast = file.data.mdast as MdastRoot;
    expect(mdast.children).toHaveLength(1);
    expect(mdast.children[0]?.type).toBe("html");

    if (mdast.children[0]?.type === "html") {
      expect(mdast.children[0].value).toContain("customElement");
      expect(mdast.children[0].value).toContain("data-custom");
    }
  });
});
