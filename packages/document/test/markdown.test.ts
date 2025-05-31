import { describe, expect, it } from "vitest";
import { createMarkdownProcessor } from "../src/processors";

describe("@docen/document Markdown Processing", () => {
  // --- Basic Markdown Parsing/Stringification Tests ---
  it("should parse and stringify basic Markdown", async () => {
    const processor = createMarkdownProcessor("markdown");
    const markdown = "# Hello\n\nThis is **bold**.";
    const file = await processor.process(markdown);
    expect(file.value.toString().trim()).toBe(markdown);
  });

  it("should handle GFM features (e.g., tables)", async () => {
    const processor = createMarkdownProcessor("markdown", { gfm: true });
    const markdown =
      "| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |";
    const file = await processor.process(markdown);
    const stringified = file.value.toString();
    // Check essential parts, allowing for minor formatting differences
    expect(stringified).toMatch(/\|\s*Header 1\s*\|\s*Header 2\s*\|/);
    expect(stringified).toMatch(/\|\s*-+\s*\|\s*-+\s*\|/); // Accept varying dash counts and spacing
    expect(stringified).toMatch(/\|\s*Cell 1\s*\|\s*Cell 2\s*\|/);
  });

  it("should handle GFM strikethrough", async () => {
    const processor = createMarkdownProcessor("markdown", { gfm: true });
    const markdown = "This is ~~deleted~~ text.";
    const file = await processor.process(markdown);
    expect(file.value.toString().trim()).toBe(markdown);
  });

  it("should handle GFM task lists", async () => {
    const processor = createMarkdownProcessor("markdown", { gfm: true });
    const markdown = "- [x] Completed task\n- [ ] Incomplete task";
    const file = await processor.process(markdown);
    const stringified = file.value.toString();
    expect(stringified).toContain("[x] Completed task");
    expect(stringified).toContain("[ ] Incomplete task");
    expect(stringified).toMatch(/^[*\-] /m);
  });

  // --- Markdown to HTML Conversion Tests ---

  it("should convert basic Markdown to HTML", async () => {
    const processor = createMarkdownProcessor("html", { gfm: true });
    const markdown = "# Hello\n\nThis is **bold** and *italic*.";
    const file = await processor.process(markdown);
    const htmlOutput = file.value.toString();

    expect(htmlOutput).toContain("<h1>Hello</h1>");
    expect(htmlOutput).toContain(
      "<p>This is <strong>bold</strong> and <em>italic</em>.</p>"
    );
  });

  it("should convert GFM features (table) to HTML", async () => {
    const processor = createMarkdownProcessor("html", { gfm: true });
    const markdown =
      "| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |";
    const file = await processor.process(markdown);
    const htmlOutput = file.value.toString();

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

  it("should convert GFM task list to HTML", async () => {
    const processor = createMarkdownProcessor("html", { gfm: true });
    const markdown = "- [x] Done\n- [ ] ToDo";
    const file = await processor.process(markdown);
    const htmlOutput = file.value.toString();

    expect(htmlOutput).toMatch(/<ul( class=".*?")?>/);
    expect(htmlOutput).toContain('<li class="task-list-item">');
    expect(htmlOutput).toContain(
      '<input type="checkbox" checked disabled> Done'
    );
    expect(htmlOutput).toContain('<input type="checkbox" disabled> ToDo');
    expect(htmlOutput).toContain("</ul>");
  });

  // --- AST Export Tests ---

  it("should export AST for analysis", async () => {
    const processor = createMarkdownProcessor("ast");
    const markdown = "# Hello World";
    const file = await processor.process(markdown);
    const ast = JSON.parse(file.value.toString());

    expect(ast.type).toBe("root");
    expect(ast.children).toHaveLength(1);
    expect(ast.children[0].type).toBe("heading");
    expect(ast.children[0].depth).toBe(1);
  });
});
