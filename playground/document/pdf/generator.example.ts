import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { type Document, toDataView } from "@docen/core";
import { PDFGenerator } from "@docen/document";

async function main() {
  // Create PDF generator
  const generator = new PDFGenerator();

  // Create a sample document AST
  const document: Document = {
    metadata: {
      title: "Sample PDF Document",
      author: "John Doe",
      date: new Date().toISOString(),
      description: "A comprehensive example of PDF document generation",
      keywords: ["PDF", "Document", "Example", "Markdown"],
    },
    content: {
      type: "root",
      children: [
        {
          type: "heading",
          depth: 1,
          children: [
            {
              type: "text",
              value: "Sample PDF Document",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value:
                "This is a comprehensive example of a PDF document generated using the Docen library. It demonstrates various document elements and formatting options.",
            },
          ],
        },
        {
          type: "heading",
          depth: 2,
          children: [
            {
              type: "text",
              value: "Document Structure",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value:
                "The document is structured using a tree-like AST (Abstract Syntax Tree) format, which makes it easy to manipulate and transform the content.",
            },
          ],
        },
        {
          type: "heading",
          depth: 3,
          children: [
            {
              type: "text",
              value: "Basic Elements",
            },
          ],
        },
        {
          type: "list",
          ordered: true,
          children: [
            {
              type: "listItem",
              children: [
                {
                  type: "text",
                  value: "Headings (H1, H2, H3)",
                },
              ],
            },
            {
              type: "listItem",
              children: [
                {
                  type: "text",
                  value: "Paragraphs with formatted text",
                },
              ],
            },
            {
              type: "listItem",
              children: [
                {
                  type: "text",
                  value: "Lists (ordered and unordered)",
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          depth: 2,
          children: [
            {
              type: "text",
              value: "Advanced Features",
            },
          ],
        },
        {
          type: "table",
          children: [
            {
              type: "tableRow",
              children: [
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Feature",
                    },
                  ],
                },
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Description",
                    },
                  ],
                },
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Example",
                    },
                  ],
                },
              ],
            },
            {
              type: "tableRow",
              children: [
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Tables",
                    },
                  ],
                },
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Structured data presentation",
                    },
                  ],
                },
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "This table",
                    },
                  ],
                },
              ],
            },
            {
              type: "tableRow",
              children: [
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Code Blocks",
                    },
                  ],
                },
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Syntax highlighted code",
                    },
                  ],
                },
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "See below",
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: "heading",
          depth: 3,
          children: [
            {
              type: "text",
              value: "Code Example",
            },
          ],
        },
        {
          type: "code",
          lang: "typescript",
          value: `import { PDFGenerator } from "@docen/document";

const generator = new PDFGenerator();
const result = await generator.generate(document);`,
        },
        {
          type: "heading",
          depth: 2,
          children: [
            {
              type: "text",
              value: "Conclusion",
            },
          ],
        },
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value:
                "This example demonstrates the power and flexibility of the Docen library for generating PDF documents. The AST-based approach makes it easy to create, manipulate, and transform document content programmatically.",
            },
          ],
        },
        {
          type: "blockquote",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "The best way to predict the future is to create it.",
                },
              ],
            },
          ],
        },
      ],
    },
  };

  try {
    // Generate PDF from document
    const result = await generator.generate(document);

    // Write to file
    writeFileSync(
      join(__dirname, "output.draft.pdf"),
      toDataView(result.content),
    );
    console.log("Successfully generated PDF file: output.draft.pdf");
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
}

main();
