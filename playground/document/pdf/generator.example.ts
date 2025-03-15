import { writeFileSync } from "node:fs";
import { type Document, toDataView } from "@docen/core";
import { PDFGenerator } from "@docen/document";

// Parse PDF document
const document: Document = {
  metadata: {
    title: "My PDF Document",
    author: "John Doe",
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
            value: "This is a heading",
          },
        ],
      },
      {
        type: "heading",
        depth: 2,
        children: [
          {
            type: "text",
            value: "This is a subheading",
          },
        ],
      },
      {
        type: "paragraph",
        children: [
          {
            type: "text",
            value: "Hello, world!",
          },
        ],
      },
    ],
  },
};

// Create PDF generator
const generator = new PDFGenerator();

// Generate PDF from document
const result = await generator.generate(document);

writeFileSync("generator.draft.pdf", toDataView(result.content));
