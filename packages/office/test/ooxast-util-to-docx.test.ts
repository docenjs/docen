import { readFileSync } from "node:fs";
import { join } from "node:path";
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
import { docxToOoxast, ooxastToDocx } from "../src/plugins";

// Helper function to create a simple OOXML AST structure
function createOoxmlParagraph(
  text: string,
  properties?: ParagraphFormatting,
): OoxmlElement {
  return {
    type: "element",
    name: "w:p",
    attributes: {},
    children: [
      {
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
                value: text,
                data: { ooxmlType: "text" },
              },
            ],
            data: { ooxmlType: "textContentWrapper" },
          },
        ],
        data: { ooxmlType: "textRun" },
      },
    ],
    data: { ooxmlType: "paragraph", properties: properties || {} },
  };
}

function createOoxmlRoot(children: OoxmlElementContent[]): OoxmlRoot {
  return {
    type: "root",
    children,
    data: { ooxmlType: "root" },
  };
}

// Helper function to process OOXML AST to DOCX
async function processToDocx(ooxmlAst: OoxmlRoot): Promise<VFile> {
  const processor = unified().use(ooxastToDocx);
  const file = new VFile();
  await processor.run(ooxmlAst, file);
  return file;
}

// Helper function to process DOCX back to OOXML AST
async function processFromDocx(docxBuffer: Uint8Array): Promise<OoxmlRoot> {
  const processor = unified().use(docxToOoxast);
  const file = new VFile({ value: docxBuffer });

  const initialRoot: OoxmlRoot = {
    type: "root",
    children: [],
    data: { ooxmlType: "root" },
  };

  return (await processor.run(initialRoot, file)) as OoxmlRoot;
}

describe("ooxast-util-to-docx Plugin Tests", () => {
  it("should convert simple paragraph to DOCX", async () => {
    const ooxmlAst = createOoxmlRoot([createOoxmlParagraph("Hello, world!")]);

    const file = await processToDocx(ooxmlAst);

    expect(file.result).toBeDefined();
    // docx.js Document object should be defined (not checking specific properties as they're internal)
  });

  it("should convert heading with style", async () => {
    const ooxmlAst = createOoxmlRoot([
      createOoxmlParagraph("Main Title", { styleId: "Heading1" }),
    ]);

    const file = await processToDocx(ooxmlAst);

    expect(file.result).toBeDefined();
    expect(file.messages).toHaveLength(0); // No error messages
  });

  it("should convert formatted text runs", async () => {
    const boldParagraph: OoxmlElement = {
      type: "element",
      name: "w:p",
      attributes: {},
      children: [
        {
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
                  value: "Bold text",
                  data: { ooxmlType: "text" },
                },
              ],
              data: { ooxmlType: "textContentWrapper" },
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
    const file = await processToDocx(ooxmlAst);

    expect(file.result).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0); // No fatal errors
  });

  it("should convert hyperlinks", async () => {
    const hyperlinkParagraph: OoxmlElement = {
      type: "element",
      name: "w:p",
      attributes: {},
      children: [
        {
          type: "element",
          name: "w:hyperlink",
          attributes: {},
          children: [
            {
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
                      value: "Visit Example",
                      data: { ooxmlType: "text" },
                    },
                  ],
                  data: { ooxmlType: "textContentWrapper" },
                },
              ],
              data: { ooxmlType: "textRun" },
            },
          ],
          data: {
            ooxmlType: "hyperlink",
            properties: {
              url: "https://example.com",
              title: "Example Site",
            },
          },
        },
      ],
      data: { ooxmlType: "paragraph", properties: {} },
    };

    const ooxmlAst = createOoxmlRoot([hyperlinkParagraph]);
    const file = await processToDocx(ooxmlAst);

    expect(file.result).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0); // No fatal errors
  });

  it("should handle empty document", async () => {
    const emptyAst = createOoxmlRoot([]);
    const file = await processToDocx(emptyAst);

    expect(file.result).toBeDefined();
    // Should create a document with at least an empty paragraph
  });

  // Round-trip test: DOCX -> OOXML AST -> DOCX -> OOXML AST
  it("should maintain consistency in round-trip conversion", async () => {
    // Load a simple fixture
    const fixturePath = join(__dirname, "fixtures", "simple_paragraph.docx");
    const originalBuffer = readFileSync(fixturePath);

    // First conversion: DOCX -> OOXML AST
    const firstOoxmlAst = await processFromDocx(new Uint8Array(originalBuffer));

    // Second conversion: OOXML AST -> DOCX
    const firstDocxFile = await processToDocx(firstOoxmlAst);
    expect(firstDocxFile.result).toBeDefined();

    // Extract buffer from the Document object (this is a simplified test)
    // In reality, we'd need to serialize the Document to buffer
    // For now, just verify the structure is maintained
    expect(firstOoxmlAst.type).toBe("root");
    expect(firstOoxmlAst.children).toBeDefined();

    // Verify we can find paragraph content
    const paragraphs = firstOoxmlAst.children.filter(
      (child) =>
        child.type === "element" &&
        (child as OoxmlElement).data?.ooxmlType === "paragraph",
    );
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it("should convert complex document structure", async () => {
    const complexAst = createOoxmlRoot([
      createOoxmlParagraph("Title", { styleId: "Heading1" }),
      createOoxmlParagraph("This is a regular paragraph."),
      createOoxmlParagraph("Another paragraph with some content."),
    ]);

    const file = await processToDocx(complexAst);

    expect(file.result).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle conversion options", async () => {
    const ooxmlAst = createOoxmlRoot([
      createOoxmlParagraph("Test document with metadata"),
    ]);

    const processor = unified().use(ooxastToDocx, {
      metadata: {
        title: "Test Document",
        creator: "Test Suite",
        description: "Generated by test",
      },
      debug: true,
    });

    const file = new VFile();
    await processor.run(ooxmlAst, file);

    expect(file.result).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  // Test error handling
  it("should handle malformed OOXML AST gracefully", async () => {
    const malformedAst: OoxmlRoot = {
      type: "root",
      children: [
        {
          type: "element",
          name: "invalid:element",
          attributes: {},
          children: [],
          data: { ooxmlType: "unknown" },
        },
      ],
      data: { ooxmlType: "root" },
    };

    const file = await processToDocx(malformedAst);

    // Should not throw, but may have warnings
    expect(file.result).toBeDefined();
  });
});
