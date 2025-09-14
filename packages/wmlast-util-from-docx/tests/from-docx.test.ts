import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { parseDocx, fromDocx } from "../src/index";
import type { Root, Element } from "@docen/wmlast";

// Helper function to extract text from xast nodes
function extractText(node: any): string[] {
  if (node.type === "text" && node.value.trim()) {
    return [node.value.trim()];
  }
  if (node.children) {
    return node.children.flatMap(extractText);
  }
  return [];
}

describe("wmlast-util-from-docx", () => {
  const fixturePath = join(__dirname, "fixtures", "sample.docx");
  let docxBuffer: Buffer;

  beforeAll(() => {
    docxBuffer = readFileSync(fixturePath);
  });

  describe("fromDocx", () => {
    it("should parse DOCX and return document xast", async () => {
      const result = await fromDocx(docxBuffer);

      expect(result).toBeDefined();
      expect(result.type).toBe("root");
      expect(result.children).toBeInstanceOf(Array);
      expect(result.children.length).toBeGreaterThan(0);

      // Find the main document element
      const documentElement = result.children.find(
        (child): child is Element =>
          child.type === "element" && child.name === "w:document",
      );

      expect(documentElement).toBeDefined();
      expect(documentElement?.attributes).toBeDefined();
    });

    it("should handle document body content", async () => {
      const result = await fromDocx(docxBuffer);
      const documentElement = result.children.find(
        (child): child is Element =>
          child.type === "element" && child.name === "w:document",
      );

      const bodyElement = documentElement?.children.find(
        (child): child is Element =>
          child.type === "element" && child.name === "w:body",
      );

      expect(bodyElement).toBeDefined();

      // Check for paragraphs
      const paragraphs = bodyElement?.children.filter(
        (child): child is Element =>
          child.type === "element" && child.name === "w:p",
      );

      expect(paragraphs?.length).toBeGreaterThan(0);

      // Check first paragraph has content
      const firstParagraph = paragraphs?.[0];
      const textRuns = firstParagraph?.children.filter(
        (child): child is Element =>
          child.type === "element" && child.name === "w:r",
      );

      expect(textRuns?.length).toBeGreaterThan(0);
    });
  });

  describe("parseDocx", () => {
    it("should parse DOCX with full options", async () => {
      const result = await parseDocx(docxBuffer, {
        styles: true,
        comments: true,
        footnotes: true,
        numbering: true,
        theme: true,
        settings: true,
        coreProperties: true,
        appProperties: true,
        customProperties: true,
        contentTypes: true,
      });

      expect(result.type).toBe("package");
      expect(result.children).toBeInstanceOf(Array);
      expect(result.children.length).toBeGreaterThan(0);

      // Find document root
      const documentRoot = result.children.find(
        (root): root is Root => root.data?.fileType === "document",
      );
      expect(documentRoot).toBeDefined();
      expect(documentRoot?.type).toBe("root");

      // Check for optional components
      const stylesRoot = result.children.find(
        (root): root is Root => root.data?.fileType === "styles",
      );
      const commentsRoot = result.children.find(
        (root): root is Root => root.data?.fileType === "comments",
      );
      const footnotesRoot = result.children.find(
        (root): root is Root => root.data?.fileType === "footnotes",
      );

      if (stylesRoot) {
        expect(stylesRoot.type).toBe("root");
      }

      if (commentsRoot) {
        expect(commentsRoot.type).toBe("root");
      }

      if (footnotesRoot) {
        expect(footnotesRoot.type).toBe("root");
      }
    });

    it("should parse DOCX with minimal options", async () => {
      const result = await parseDocx(docxBuffer);

      expect(result.type).toBe("package");
      expect(result.children).toBeInstanceOf(Array);

      // Should always have document root
      const documentRoot = result.children.find(
        (root): root is Root => root.data?.fileType === "document",
      );
      expect(documentRoot).toBeDefined();

      // Should not have optional components with minimal options
      const stylesRoot = result.children.find(
        (root): root is Root => root.data?.fileType === "styles",
      );
      const commentsRoot = result.children.find(
        (root): root is Root => root.data?.fileType === "comments",
      );
      const footnotesRoot = result.children.find(
        (root): root is Root => root.data?.fileType === "footnotes",
      );

      expect(stylesRoot).toBeUndefined();
      expect(commentsRoot).toBeUndefined();
      expect(footnotesRoot).toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should throw error for invalid DOCX", async () => {
      const invalidBuffer = Buffer.from("not a docx file");

      await expect(fromDocx(invalidBuffer)).rejects.toThrow();
    });

    it("should throw error for empty buffer", async () => {
      const emptyBuffer = Buffer.alloc(0);

      await expect(fromDocx(emptyBuffer)).rejects.toThrow();
    });
  });

  describe("document structure validation", () => {
    it("should find text content in document", async () => {
      const result = await fromDocx(docxBuffer);
      const documentElement = result.children.find(
        (child): child is Element =>
          child.type === "element" && child.name === "w:document",
      );
      const bodyElement = documentElement?.children.find(
        (child): child is Element =>
          child.type === "element" && child.name === "w:body",
      );

      const allText = extractText(bodyElement);

      expect(allText.length).toBeGreaterThan(0);
      expect(allText.some((text) => text.length > 0)).toBe(true);
    });

    it("should detect text formatting", async () => {
      const result = await fromDocx(docxBuffer);
      const documentElement = result.children.find(
        (child): child is Element =>
          child.type === "element" && child.name === "w:document",
      );
      const bodyElement = documentElement?.children.find(
        (child): child is Element =>
          child.type === "element" && child.name === "w:body",
      );

      // Find text runs with formatting
      const textRuns = bodyElement?.children
        .filter(
          (child): child is Element =>
            child.type === "element" && child.name === "w:p",
        )
        .flatMap((para) =>
          para.children.filter(
            (child): child is Element =>
              child.type === "element" && child.name === "w:r",
          ),
        );

      const formattedRuns = textRuns?.filter((run) => {
        const rPr = run.children.find(
          (child): child is Element =>
            child.type === "element" && child.name === "w:rPr",
        );
        return rPr && rPr.children.length > 0;
      });

      expect(formattedRuns?.length).toBeGreaterThan(0);
    });
  });
});
