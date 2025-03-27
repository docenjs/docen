import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type BlockQuote,
  type Code,
  type Document,
  type Heading,
  type List,
  type ListItem,
  type Paragraph,
  type Root,
  type Table,
  type TableCell,
  type TableRow,
  type Text,
  toDataView,
} from "@docen/core";
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
            } as Text,
          ],
        } as Heading,
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value:
                "This is a comprehensive example of a PDF document generated using the Docen library. It demonstrates various document elements and formatting options.",
            } as Text,
          ],
        } as Paragraph,
        {
          type: "heading",
          depth: 2,
          children: [
            {
              type: "text",
              value: "Document Structure",
            } as Text,
          ],
        } as Heading,
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value:
                "The document is structured using a tree-like AST (Abstract Syntax Tree) format, which makes it easy to manipulate and transform the content.",
            } as Text,
          ],
        } as Paragraph,
        {
          type: "heading",
          depth: 3,
          children: [
            {
              type: "text",
              value: "Basic Elements",
            } as Text,
          ],
        } as Heading,
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
                } as Text,
              ],
            } as ListItem,
            {
              type: "listItem",
              children: [
                {
                  type: "text",
                  value: "Paragraphs with formatted text",
                } as Text,
              ],
            } as ListItem,
            {
              type: "listItem",
              children: [
                {
                  type: "text",
                  value: "Lists (ordered and unordered)",
                } as Text,
              ],
            } as ListItem,
          ],
        } as List,
        {
          type: "heading",
          depth: 2,
          children: [
            {
              type: "text",
              value: "Advanced Features",
            } as Text,
          ],
        } as Heading,
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
                    } as Text,
                  ],
                } as TableCell,
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Description",
                    } as Text,
                  ],
                } as TableCell,
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Example",
                    } as Text,
                  ],
                } as TableCell,
              ],
            } as TableRow,
            {
              type: "tableRow",
              children: [
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Tables",
                    } as Text,
                  ],
                } as TableCell,
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Structured data presentation",
                    } as Text,
                  ],
                } as TableCell,
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "This table",
                    } as Text,
                  ],
                } as TableCell,
              ],
            } as TableRow,
            {
              type: "tableRow",
              children: [
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Code Blocks",
                    } as Text,
                  ],
                } as TableCell,
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "Syntax highlighted code",
                    } as Text,
                  ],
                } as TableCell,
                {
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: "See below",
                    } as Text,
                  ],
                } as TableCell,
              ],
            } as TableRow,
          ],
        } as Table,
        {
          type: "heading",
          depth: 3,
          children: [
            {
              type: "text",
              value: "Code Example",
            } as Text,
          ],
        } as Heading,
        {
          type: "code",
          lang: "typescript",
          value: `import { PDFGenerator } from "@docen/document";

const generator = new PDFGenerator();
const result = await generator.generate(document);`,
        } as Code,
        {
          type: "heading",
          depth: 2,
          children: [
            {
              type: "text",
              value: "Conclusion",
            } as Text,
          ],
        } as Heading,
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value:
                "This example demonstrates the power and flexibility of the Docen library for generating PDF documents. The AST-based approach makes it easy to create, manipulate, and transform document content programmatically.",
            } as Text,
          ],
        } as Paragraph,
        {
          type: "blockquote",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "The best way to predict the future is to create it.",
                } as Text,
              ],
            } as Paragraph,
          ],
        } as BlockQuote,
      ],
    } as Root,
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
