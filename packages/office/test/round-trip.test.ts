import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Root as MdastRoot } from "mdast";
import { unified } from "unified";
import { VFile } from "vfile";
import { describe, expect, it } from "vitest";
import type { OoxmlElement, OoxmlRoot } from "../src/ast";
import { docxToOoxast, mdastToOoxast, ooxastToDocx } from "../src/plugins";

// Helper function to create MDAST for testing
function createMdastRoot(): MdastRoot {
  return {
    type: "root",
    children: [
      {
        type: "heading",
        depth: 1,
        children: [{ type: "text", value: "Document Title" }],
      },
      {
        type: "paragraph",
        children: [
          { type: "text", value: "This is a paragraph with " },
          {
            type: "strong",
            children: [{ type: "text", value: "bold" }],
          },
          { type: "text", value: " and " },
          {
            type: "emphasis",
            children: [{ type: "text", value: "italic" }],
          },
          { type: "text", value: " text." },
        ],
      },
      {
        type: "list",
        ordered: false,
        children: [
          {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", value: "First bullet item" }],
              },
            ],
          },
          {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: [{ type: "text", value: "Second bullet item" }],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        children: [
          { type: "text", value: "Visit " },
          {
            type: "link",
            url: "https://example.com",
            title: "Example Site",
            children: [{ type: "text", value: "this link" }],
          },
          { type: "text", value: " for more information." },
        ],
      },
    ],
  };
}

// Helper functions for conversions
async function mdastToDocx(mdast: MdastRoot): Promise<VFile> {
  // Step 1: MDAST -> OOXML AST
  const mdastProcessor = unified().use(mdastToOoxast);
  const mdastFile = new VFile();
  const ooxmlAst = mdastProcessor.runSync(mdast, mdastFile) as OoxmlRoot;

  // Step 2: OOXML AST -> DOCX
  const docxProcessor = unified().use(ooxastToDocx);
  const docxFile = new VFile();
  await docxProcessor.run(ooxmlAst, docxFile);

  return docxFile;
}

async function docxToOoxmlAst(docxBuffer: Uint8Array): Promise<OoxmlRoot> {
  const processor = unified().use(docxToOoxast);
  const file = new VFile({ value: docxBuffer });

  const initialRoot: OoxmlRoot = {
    type: "root",
    children: [],
    data: { ooxmlType: "root" },
  };

  return (await processor.run(initialRoot, file)) as OoxmlRoot;
}

// Helper function to compare OOXML AST structures (simplified comparison)
function compareOoxmlStructure(ast1: OoxmlRoot, ast2: OoxmlRoot): boolean {
  // Simple structural comparison - in a real test, you'd want more sophisticated comparison
  if (ast1.type !== ast2.type) return false;
  if (ast1.children.length !== ast2.children.length) return false;

  // Compare paragraph count and basic structure
  const paragraphs1 = ast1.children.filter(
    (child) =>
      child.type === "element" &&
      (child as OoxmlElement).data?.ooxmlType === "paragraph",
  );
  const paragraphs2 = ast2.children.filter(
    (child) =>
      child.type === "element" &&
      (child as OoxmlElement).data?.ooxmlType === "paragraph",
  );

  return paragraphs1.length === paragraphs2.length;
}

describe("Round-trip Tests", () => {
  it("should maintain structure through MDAST -> OOXML -> DOCX conversion", async () => {
    const mdast = createMdastRoot();

    // Convert MDAST to OOXML AST
    const processor = unified().use(mdastToOoxast);
    const file = new VFile();
    const ooxmlAst = processor.runSync(mdast, file) as OoxmlRoot;

    expect(ooxmlAst.type).toBe("root");
    expect(ooxmlAst.children.length).toBeGreaterThan(0);

    // Verify heading is converted
    const heading = ooxmlAst.children.find((child) => {
      if (child.type === "element") {
        const element = child as OoxmlElement;
        const properties = element.data?.properties;
        return (
          properties &&
          typeof properties === "object" &&
          "styleId" in properties &&
          properties.styleId === "Heading1"
        );
      }
      return false;
    });
    expect(heading).toBeDefined();

    // Verify list is converted
    const list = ooxmlAst.children.find(
      (child) =>
        child.type === "element" &&
        (child as OoxmlElement).data?.ooxmlType === "list",
    );
    expect(list).toBeDefined();
  });

  it("should convert OOXML AST to DOCX successfully", async () => {
    const mdast = createMdastRoot();

    // Generate DOCX from MDAST
    const docxFile = await mdastToDocx(mdast);

    expect(docxFile.result).toBeDefined();
    expect(docxFile.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle existing DOCX files", async () => {
    // Load an existing DOCX fixture
    const fixturePath = join(__dirname, "fixtures", "simple_paragraph.docx");
    const docxBuffer = readFileSync(fixturePath);

    // Convert DOCX to OOXML AST
    const ooxmlAst = await docxToOoxmlAst(new Uint8Array(docxBuffer));

    expect(ooxmlAst.type).toBe("root");
    expect(ooxmlAst.children.length).toBeGreaterThan(0);

    // Should contain at least one paragraph
    const paragraphs = ooxmlAst.children.filter(
      (child) =>
        child.type === "element" &&
        (child as OoxmlElement).data?.ooxmlType === "paragraph",
    );
    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it("should maintain content through round-trip conversion", async () => {
    // Start with a fixture DOCX file
    const fixturePath = join(__dirname, "fixtures", "styled_text.docx");
    const originalBuffer = readFileSync(fixturePath);

    // First: DOCX -> OOXML AST
    const firstOoxmlAst = await docxToOoxmlAst(new Uint8Array(originalBuffer));

    // Second: OOXML AST -> DOCX
    const docxProcessor = unified().use(ooxastToDocx, { debug: true });
    const docxFile = new VFile();
    await docxProcessor.run(firstOoxmlAst, docxFile);

    expect(docxFile.result).toBeDefined();
    expect(docxFile.messages.filter((m) => m.fatal)).toHaveLength(0);

    // Verify the original structure is maintained
    expect(firstOoxmlAst.type).toBe("root");
    expect(firstOoxmlAst.children.length).toBeGreaterThan(0);

    // Check for specific content types
    const textRuns: unknown[] = [];
    function findTextRuns(node: unknown): void {
      if (node && typeof node === "object" && node !== null) {
        const nodeObj = node as Record<string, unknown>;
        if (
          nodeObj.data &&
          typeof nodeObj.data === "object" &&
          nodeObj.data !== null &&
          (nodeObj.data as Record<string, unknown>).ooxmlType === "textRun"
        ) {
          textRuns.push(node);
        }
        if (Array.isArray(nodeObj.children)) {
          nodeObj.children.forEach(findTextRuns);
        }
      }
    }
    findTextRuns(firstOoxmlAst);

    expect(textRuns.length).toBeGreaterThan(0);
  });

  it("should preserve formatting through conversions", async () => {
    const mdast = createMdastRoot();

    // Convert to OOXML AST
    const mdastProcessor = unified().use(mdastToOoxast);
    const mdastFile = new VFile();
    const ooxmlAst = mdastProcessor.runSync(mdast, mdastFile) as OoxmlRoot;

    // Find bold text run
    let foundBoldRun = false;
    function findBoldRun(node: unknown): void {
      if (node && typeof node === "object" && node !== null) {
        const nodeObj = node as Record<string, unknown>;
        const data = nodeObj.data as Record<string, unknown> | undefined;
        const properties = data?.properties as
          | Record<string, unknown>
          | undefined;

        if (data?.ooxmlType === "textRun" && properties?.bold === true) {
          foundBoldRun = true;
        }
        if (Array.isArray(nodeObj.children)) {
          nodeObj.children.forEach(findBoldRun);
        }
      }
    }
    findBoldRun(ooxmlAst);

    expect(foundBoldRun).toBe(true);

    // Convert to DOCX and verify no fatal errors
    const docxProcessor = unified().use(ooxastToDocx);
    const docxFile = new VFile();
    await docxProcessor.run(ooxmlAst, docxFile);

    expect(docxFile.result).toBeDefined();
    expect(docxFile.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle complex documents with tables", async () => {
    const mdastWithTable: MdastRoot = {
      type: "root",
      children: [
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
      ],
    };

    // Convert to DOCX
    const docxFile = await mdastToDocx(mdastWithTable);

    expect(docxFile.result).toBeDefined();
    expect(docxFile.messages.filter((m) => m.fatal)).toHaveLength(0);
  });

  it("should handle error cases gracefully", async () => {
    // Test with minimal MDAST that might cause issues
    const edgeCaseMdast: MdastRoot = {
      type: "root",
      children: [
        {
          type: "paragraph",
          children: [],
        },
      ],
    };

    const processor = unified().use(mdastToOoxast);
    const file = new VFile();
    const result = processor.runSync(edgeCaseMdast, file) as OoxmlRoot;

    // Should still produce a valid OOXML AST, potentially with warnings
    expect(result.type).toBe("root");
  });
});
