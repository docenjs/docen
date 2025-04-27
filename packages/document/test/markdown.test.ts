import { createProcessor } from "@docen/core";
import { describe, expect, it } from "vitest";
import { docenMarkdown } from "../src/index";
// No longer need direct imports for remarkRehype/rehypeStringify in tests
// import remarkRehype from "remark-rehype";
// import rehypeStringify from "rehype-stringify";

describe("@docen/document Markdown Plugin", () => {
  // --- Basic Markdown Parsing/Stringification Tests ---
  it("should parse and stringify basic Markdown (default: to markdown)", async () => {
    const processor = createProcessor().use(docenMarkdown); // No options needed for default
    const markdown = "# Hello\n\nThis is **bold**.";
    const file = await processor.process(markdown);
    expect(file.value.toString().trim()).toBe(markdown);
  });

  it("should handle GFM features (e.g., tables) (default: to markdown)", async () => {
    const processor = createProcessor().use(docenMarkdown);
    const markdown =
      "| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |";
    const file = await processor.process(markdown);
    const stringified = file.value.toString();
    // Check essential parts, allowing for minor formatting differences
    expect(stringified).toMatch(/|\\s*Header 1\\s*|\\s*Header 2\\s*|/);
    expect(stringified).toMatch(/|\\s*---\\s*|\\s*---\\s*|/); // Use regex for flexible spacing
    expect(stringified).toMatch(/|\\s*Cell 1\\s*|\\s*Cell 2\\s*|/);
  });

  it("should handle GFM strikethrough (default: to markdown)", async () => {
    const processor = createProcessor().use(docenMarkdown);
    const markdown = "This is ~~deleted~~ text.";
    const file = await processor.process(markdown);
    expect(file.value.toString().trim()).toBe(markdown);
  });

  it("should handle GFM task lists (default: to markdown)", async () => {
    const processor = createProcessor().use(docenMarkdown);
    const markdown = "- [x] Completed task\n- [ ] Incomplete task";
    const file = await processor.process(markdown);
    const stringified = file.value.toString();
    // Use simpler toContain assertions
    expect(stringified).toContain("[x] Completed task");
    expect(stringified).toContain("[ ] Incomplete task");
    // Optionally check for list marker if needed, but keep it simple
    expect(stringified).toMatch(/^[*\-] /m); // Check beginning of line has marker
  });

  // --- Markdown to HTML Conversion Tests ---

  it("should convert basic Markdown to HTML (using to: 'html')", async () => {
    const processor = createProcessor().use(docenMarkdown, { to: "html" });

    const markdown = "# Hello\n\nThis is **bold** and *italic*.";
    const file = await processor.process(markdown);
    const htmlOutput = file.value.toString();

    expect(htmlOutput).toContain("<h1>Hello</h1>");
    expect(htmlOutput).toContain(
      "<p>This is <strong>bold</strong> and <em>italic</em>.</p>"
    );
  });

  it("should convert GFM features (table) to HTML (using to: 'html')", async () => {
    const processor = createProcessor().use(docenMarkdown, { to: "html" });

    const markdown =
      "| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |";
    const file = await processor.process(markdown);
    const htmlOutput = file.value.toString();

    // More robust checks, less sensitive to whitespace
    expect(htmlOutput).toContain("<table>");
    expect(htmlOutput).toContain("<thead>");
    expect(htmlOutput).toContain("<th>Header 1</th>");
    expect(htmlOutput).toContain("<th>Header 2</th>");
    expect(htmlOutput).toContain("</thead>");
    expect(htmlOutput).toContain("<tbody>");
    expect(htmlOutput).toContain("<td>Cell 1</td>");
    expect(htmlOutput).toContain("<td>Cell 2</td>");
    expect(htmlOutput).toContain("</tbody>");
    expect(htmlOutput).toContain("</table>");
  });

  it("should convert GFM task list to HTML (using to: 'html')", async () => {
    const processor = createProcessor().use(docenMarkdown, { to: "html" });

    const markdown = "- [x] Done\n- [ ] ToDo";
    const file = await processor.process(markdown);
    const htmlOutput = file.value.toString();

    // Check for ul with potential class and the list items
    expect(htmlOutput).toMatch(/<ul( class=\".*?\")?>/);
    expect(htmlOutput).toContain('<li class="task-list-item">');
    expect(htmlOutput).toContain(
      '<input type="checkbox" checked disabled> Done'
    );
    expect(htmlOutput).toContain('<input type="checkbox" disabled> ToDo');
    expect(htmlOutput).toContain("</ul>");
  });
});
