import { describe, expect, it } from "vitest";
import {
  createHtmlProcessor,
  createHtmlToMarkdownProcessor,
} from "../src/processors";

describe("@docen/document HTML Processing", () => {
  it("should parse and stringify basic HTML fragment", async () => {
    const processor = createHtmlProcessor();
    const html = "<p>Hello <b>world</b>!</p>";
    const file = await processor.process(html);
    const output = file.value.toString();
    expect(output).toContain("<p>Hello ");
    expect(output).toContain("<b>world</b>!</p>");
  });

  it("should parse HTML document", async () => {
    const processor = createHtmlProcessor();
    const html =
      "<!doctype html><html><head><title>Test</title></head><body><p>Body</p></body></html>";
    const file = await processor.process(html);
    const output = file.value.toString();
    expect(output).toContain("<p>Body</p>");
  });

  // --- HTML to Markdown Conversion Tests ---

  it("should convert basic HTML to Markdown", async () => {
    const processor = createHtmlToMarkdownProcessor({ gfm: true });
    const html =
      "<h1>Heading</h1><p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>";
    const file = await processor.process(html);
    const markdownOutput = file.value.toString().trim();

    expect(markdownOutput).toContain("# Heading");
    expect(markdownOutput).toContain("Paragraph with **bold**");
    expect(markdownOutput).toMatch(/\*italic\*|_italic_/); // Accept either * or _ for italic
  });

  it("should convert HTML table to Markdown", async () => {
    const processor = createHtmlToMarkdownProcessor({ gfm: true });
    const html =
      "<table><thead><tr><th>H1</th><th>H2</th></tr></thead><tbody><tr><td>C1</td><td>C2</td></tr></tbody></table>";
    const file = await processor.process(html);
    const markdownOutput = file.value.toString();

    // Expect GFM table format - be more flexible with separator format
    expect(markdownOutput).toMatch(/\|\s*H1\s*\|\s*H2\s*\|/);
    expect(markdownOutput).toMatch(/\|\s*-+\s*\|\s*-+\s*\|/); // Accept varying dash counts
    expect(markdownOutput).toMatch(/\|\s*C1\s*\|\s*C2\s*\|/);
  });
});
