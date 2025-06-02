import { unified } from "unified";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";
import type {
  OoxmlElement,
  OoxmlElementContent,
  OoxmlRoot,
} from "../../src/ast";
import { ooxastToDocx } from "../../src/plugins";
import {
  type DocxTemplateConfig,
  composeDocxTemplate,
  createMetadata,
  createNumbering,
  createPageLayout,
  createTableOfContents,
  createTypography,
} from "../../src/templates";
import type { ToDocxOptions } from "../../src/types";

// Helper function to create a simple OOXML AST structure
function createOoxmlParagraph(text: string): OoxmlElement {
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
    data: { ooxmlType: "paragraph", properties: {} },
  };
}

function createOoxmlHeading(text: string, level = 1): OoxmlElement {
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
    data: {
      ooxmlType: "paragraph",
      properties: {
        styleId: `Heading${level}`,
        outlineLevel: level - 1,
      },
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

// Helper function to process OOXML AST to DOCX with template options
async function processToDocxWithTemplate(
  ooxmlAst: OoxmlRoot,
  options?: ToDocxOptions,
): Promise<VFile> {
  const processor = unified().use(ooxastToDocx, options);
  const file = new VFile();
  await processor.run(ooxmlAst, file);
  return file;
}

describe("ooxast-util-to-docx with Template Tests", () => {
  describe("Template Building Blocks", () => {
    it("should create page layout configuration", () => {
      const pageLayout = createPageLayout({
        size: "A4",
        orientation: "portrait",
        margins: {
          top: 90,
          right: 90,
          bottom: 90,
          left: 90,
        },
      });

      expect(pageLayout.pageSettings).toBeDefined();
      expect(pageLayout.pageSettings?.width).toBe(595.28);
      expect(pageLayout.pageSettings?.height).toBe(841.89);
      expect(pageLayout.pageSettings?.orientation).toBe("portrait");
      expect(pageLayout.pageSettings?.margin?.top).toBe(90);
    });

    it("should create typography configuration", () => {
      const typography = createTypography({
        bodyFont: "Times New Roman",
        headingFont: "Arial",
        fontSize: 12,
        lineHeight: 1.2,
      });

      expect(typography.styles).toBeDefined();
      expect(typography.styles?.paragraphStyles).toHaveLength(3);
      expect(typography.styles?.paragraphStyles?.[0]?.run?.font).toBe(
        "Times New Roman",
      );
      expect(typography.styles?.paragraphStyles?.[1]?.run?.font).toBe("Arial");
    });

    it("should create metadata configuration", () => {
      const metadata = createMetadata({
        title: "Test Document",
        description: "A test document for template functionality",
        creator: "Test Author",
        keywords: ["test", "template", "docx"],
      });

      expect(metadata.metadata).toBeDefined();
      expect(metadata.metadata?.title).toBe("Test Document");
      expect(metadata.metadata?.creator).toBe("Test Author");
      expect(metadata.metadata?.keywords).toBe("test, template, docx");
    });

    it("should create table of contents configuration", () => {
      const toc = createTableOfContents({
        title: "Contents",
        styles: ["Heading1", "Heading2"],
        levels: 2,
        pageNumbers: true,
      });

      expect(toc.tableOfContents).toBeDefined();
      expect(toc.tableOfContents?.title).toBe("Contents");
      expect(toc.tableOfContents?.styles).toEqual(["Heading1", "Heading2"]);
      expect(toc.tableOfContents?.levels).toBe(2);
    });

    it("should create numbering configuration", () => {
      const numbering = createNumbering({
        id: "myList",
        type: "decimal",
        levels: 3,
      });

      expect(numbering.numbering).toBeDefined();
      expect(numbering.numbering?.[0]?.id).toBe("myList");
      expect(numbering.numbering?.[0]?.levels).toHaveLength(3);
    });
  });

  describe("Template Composition", () => {
    it("should compose multiple template configurations using defu", () => {
      const pageLayout = createPageLayout({ size: "Letter" });
      const typography = createTypography({ bodyFont: "Calibri" });
      const metadata = createMetadata({ title: "Composed Document" });

      const composedTemplate = composeDocxTemplate(
        pageLayout,
        typography,
        metadata,
      );

      expect(composedTemplate.pageSettings?.width).toBe(612); // Letter width
      expect(composedTemplate.styles?.paragraphStyles?.[0]?.run?.font).toBe(
        "Calibri",
      );
      expect(composedTemplate.metadata?.title).toBe("Composed Document");
    });

    it("should handle overlapping configurations with proper precedence", () => {
      const baseMetadata = createMetadata({
        title: "Base Title",
        creator: "Base Author",
      });
      const overrideMetadata = createMetadata({
        title: "Override Title",
      });

      const composedTemplate = composeDocxTemplate(
        baseMetadata,
        overrideMetadata,
      );

      expect(composedTemplate.metadata?.title).toBe("Override Title");
      // defu merges from right to left, so the last config takes precedence
      expect(composedTemplate.metadata?.creator).toBe(
        "Docen DOCX Template System",
      );
    });
  });

  describe("DOCX Generation with Templates", () => {
    it("should convert simple document with template configuration", async () => {
      const ooxmlAst = createOoxmlRoot([
        createOoxmlHeading("Document Title", 1),
        createOoxmlParagraph("This is a paragraph with template styling."),
      ]);

      const templateConfig: DocxTemplateConfig = composeDocxTemplate(
        createPageLayout({ size: "A4", orientation: "portrait" }),
        createTypography({ bodyFont: "Calibri", fontSize: 11 }),
        createMetadata({
          title: "Template Test Document",
          creator: "Template System",
        }),
      );

      const options: ToDocxOptions = {
        template: {
          config: templateConfig,
        },
        debug: false,
      };

      const file = await processToDocxWithTemplate(ooxmlAst, options);

      expect(file.result).toBeDefined();
      expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
    });

    it("should handle metadata application", async () => {
      const ooxmlAst = createOoxmlRoot([
        createOoxmlParagraph("Test document content"),
      ]);

      const options: ToDocxOptions = {
        metadata: {
          title: "Direct Metadata Test",
          creator: "Direct Creator",
          description: "Test description",
        },
        debug: false,
      };

      const file = await processToDocxWithTemplate(ooxmlAst, options);

      expect(file.result).toBeDefined();
      expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
    });

    it("should handle complex template with all components", async () => {
      const ooxmlAst = createOoxmlRoot([
        createOoxmlHeading("Chapter 1: Introduction", 1),
        createOoxmlParagraph("This is the introduction paragraph."),
        createOoxmlHeading("Section 1.1: Overview", 2),
        createOoxmlParagraph("This is an overview section."),
        createOoxmlParagraph("This is another paragraph."),
      ]);

      const templateConfig: DocxTemplateConfig = composeDocxTemplate(
        createPageLayout({
          size: "A4",
          orientation: "portrait",
          margins: { top: 100, right: 80, bottom: 100, left: 80 },
        }),
        createTypography({
          bodyFont: "Times New Roman",
          headingFont: "Arial",
          fontSize: 12,
          lineHeight: 1.15,
        }),
        createMetadata({
          title: "Complex Template Document",
          description: "A comprehensive test of template functionality",
          creator: "Template System",
          keywords: ["template", "test", "complex"],
          category: "Documentation",
        }),
        createTableOfContents({
          title: "Table of Contents",
          styles: ["Heading1", "Heading2", "Heading3"],
          levels: 3,
          pageNumbers: true,
          hyperlinks: true,
        }),
        createNumbering({
          id: "mainList",
          type: "decimal",
          levels: 5,
        }),
      );

      const options: ToDocxOptions = {
        template: {
          config: templateConfig,
        },
        debug: false,
      };

      const file = await processToDocxWithTemplate(ooxmlAst, options);

      expect(file.result).toBeDefined();
      expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
    });

    it("should handle empty template configuration gracefully", async () => {
      const ooxmlAst = createOoxmlRoot([
        createOoxmlParagraph("Simple document without template"),
      ]);

      const options: ToDocxOptions = {
        template: {
          config: {} as DocxTemplateConfig,
        },
        debug: false,
      };

      const file = await processToDocxWithTemplate(ooxmlAst, options);

      expect(file.result).toBeDefined();
      expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
    });

    it("should process document without any template configuration", async () => {
      const ooxmlAst = createOoxmlRoot([
        createOoxmlParagraph("Document without template"),
      ]);

      const file = await processToDocxWithTemplate(ooxmlAst);

      expect(file.result).toBeDefined();
      expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
    });
  });

  describe("Template Error Handling", () => {
    it("should handle invalid template configuration gracefully", async () => {
      const ooxmlAst = createOoxmlRoot([createOoxmlParagraph("Test content")]);

      const options: ToDocxOptions = {
        template: {
          // @ts-expect-error - Testing invalid configuration
          config: null,
        },
        debug: false,
      };

      const file = await processToDocxWithTemplate(ooxmlAst, options);

      // Should still produce a document despite invalid template
      expect(file.result).toBeDefined();
    });

    it("should handle template processing errors with debug mode", async () => {
      const ooxmlAst = createOoxmlRoot([createOoxmlParagraph("Test content")]);

      const templateConfig: DocxTemplateConfig = composeDocxTemplate(
        createMetadata({ title: "Debug Test Document" }),
      );

      const options: ToDocxOptions = {
        template: {
          config: templateConfig,
        },
        debug: true, // Enable debug mode
      };

      const file = await processToDocxWithTemplate(ooxmlAst, options);

      expect(file.result).toBeDefined();
      expect(file.messages.filter((m) => m.fatal)).toHaveLength(0);
    });
  });
});
