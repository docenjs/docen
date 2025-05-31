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
import { ooxastToPdf } from "../src/plugins";
import type { ToPdfOptions } from "../src/types";

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

function createOoxmlRoot(children: OoxmlElementContent[]): OoxmlRoot {
  return {
    type: "root",
    children,
    data: { ooxmlType: "root" },
  };
}

// Helper function to process OOXML AST to PDF
async function processToPdf(
  ooxmlAst: OoxmlRoot,
  options?: ToPdfOptions
): Promise<VFile> {
  const processor = unified().use(ooxastToPdf, options);
  const file = new VFile();
  await processor.run(ooxmlAst, file);
  return file;
}

describe("ooxast-util-to-pdf Plugin Tests", () => {
  it("should convert simple paragraph to PDF", async () => {
    const ooxmlAst = createOoxmlRoot([createOoxmlParagraph("Hello, world!")]);

    const file = await processToPdf(ooxmlAst);

    expect(file.data?.pdfBytes).toBeDefined();
    expect(file.data.pdfBytes).toBeInstanceOf(Uint8Array);
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should convert heading with different levels", async () => {
    const ooxmlAst = createOoxmlRoot([
      createOoxmlHeading("Main Title", 1),
      createOoxmlHeading("Subtitle", 2),
      createOoxmlParagraph("Content paragraph"),
    ]);

    const file = await processToPdf(ooxmlAst);

    expect(file.data?.pdfBytes).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
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
    const file = await processToPdf(ooxmlAst);

    expect(file.data?.pdfBytes).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle custom page settings", async () => {
    const options: ToPdfOptions = {
      pageWidth: 612, // Letter size
      pageHeight: 792,
      margins: {
        top: 36,
        bottom: 36,
        left: 36,
        right: 36,
      },
      defaultFontSize: 14,
    };

    const ooxmlAst = createOoxmlRoot([
      createOoxmlParagraph("Custom page settings test"),
    ]);

    const file = await processToPdf(ooxmlAst, options);

    expect(file.data?.pdfBytes).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle drawing elements", async () => {
    const drawingElement: OoxmlElement = {
      type: "element",
      name: "drawing",
      attributes: {},
      children: [],
      data: {
        ooxmlType: "drawing",
        properties: {
          size: {
            width: 200,
            height: 150,
          },
        },
      },
    };

    const ooxmlAst = createOoxmlRoot([
      createOoxmlParagraph("Before drawing"),
      drawingElement,
      createOoxmlParagraph("After drawing"),
    ]);

    const file = await processToPdf(ooxmlAst);

    expect(file.data?.pdfBytes).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle empty document", async () => {
    const emptyAst = createOoxmlRoot([]);
    const file = await processToPdf(emptyAst);

    expect(file.data?.pdfBytes).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle complex formatting", async () => {
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
              value: "bold ",
              data: { ooxmlType: "text" },
            },
          ],
          data: {
            ooxmlType: "textRun",
            properties: { bold: true } as FontProperties,
          },
        },
        {
          type: "element",
          name: "textRun",
          attributes: {},
          children: [
            {
              type: "text",
              value: "italic ",
              data: { ooxmlType: "text" },
            },
          ],
          data: {
            ooxmlType: "textRun",
            properties: { italic: true } as FontProperties,
          },
        },
        {
          type: "element",
          name: "textRun",
          attributes: {},
          children: [
            {
              type: "text",
              value: "colored text",
              data: { ooxmlType: "text" },
            },
          ],
          data: {
            ooxmlType: "textRun",
            properties: {
              color: { value: "FF0000" },
            } as FontProperties,
          },
        },
      ],
      data: { ooxmlType: "paragraph", properties: {} },
    };

    const ooxmlAst = createOoxmlRoot([complexParagraph]);
    const file = await processToPdf(ooxmlAst);

    expect(file.data?.pdfBytes).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should respect debug option", async () => {
    const options: ToPdfOptions = {
      debug: true,
    };

    const ooxmlAst = createOoxmlRoot([createOoxmlParagraph("Debug test")]);
    const file = await processToPdf(ooxmlAst, options);

    expect(file.data?.pdfBytes).toBeDefined();
    expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
  });
});
