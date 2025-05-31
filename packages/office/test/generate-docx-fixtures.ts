import * as fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  AlignmentType,
  Bookmark,
  CommentRangeEnd,
  CommentRangeStart,
  CommentReference,
  Document,
  ExternalHyperlink,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertInchesToTwip,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, "fixtures");

async function ensureFixturesDir() {
  try {
    await fs.mkdir(fixturesDir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") {
      throw error;
    }
  }
}

async function saveDocx(doc: Document, filename: string) {
  const buffer = await Packer.toBuffer(doc);
  const filepath = path.join(fixturesDir, filename);
  await fs.writeFile(filepath, buffer);
  console.log(`Generated: ${filepath}`);
}

async function generateFixtures() {
  await ensureFixturesDir();

  // --- Simple Paragraph ---
  const simpleParagraphDoc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [new TextRun("This is a simple paragraph.")],
          }),
        ],
      },
    ],
  });
  await saveDocx(simpleParagraphDoc, "simple_paragraph.docx");

  // --- Styled Text ---
  const styledTextDoc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun("This text is "),
              new TextRun({ text: "bold", bold: true }),
              new TextRun(", this text is "),
              new TextRun({ text: "italic", italics: true }),
              new TextRun({ text: "italics", italics: true }),
              new TextRun(", and this is "),
              new TextRun({ text: "both", bold: true, italics: true }),
              new TextRun({ text: "both", bold: true, italics: true }),
              new TextRun("."),
            ],
          }),
        ],
      },
    ],
  });
  await saveDocx(styledTextDoc, "styled_text.docx");

  // --- Bullet List ---
  const bulletListDoc = new Document({
    numbering: {
      config: [
        {
          reference: "bullet-points",
          levels: [
            {
              level: 0,
              format: "bullet",
              text: "\u2022", // Bullet character
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        children: [
          new Paragraph({
            text: "Item 1",
            numbering: { reference: "bullet-points", level: 0 },
          }),
          new Paragraph({
            text: "Item 2",
            numbering: { reference: "bullet-points", level: 0 },
          }),
          new Paragraph({
            text: "Item 3",
            numbering: { reference: "bullet-points", level: 0 },
          }),
        ],
      },
    ],
  });
  await saveDocx(bulletListDoc, "bullet_list.docx");

  // --- Numbered List ---
  const numberedListDoc = new Document({
    numbering: {
      config: [
        {
          reference: "numbered-list",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertInchesToTwip(0.5),
                    hanging: convertInchesToTwip(0.25),
                  },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        children: [
          new Paragraph({
            text: "First item",
            numbering: { reference: "numbered-list", level: 0 },
          }),
          new Paragraph({
            text: "Second item",
            numbering: { reference: "numbered-list", level: 0 },
          }),
          new Paragraph({
            text: "Third item",
            numbering: { reference: "numbered-list", level: 0 },
          }),
        ],
      },
    ],
  });
  await saveDocx(numberedListDoc, "numbered_list.docx");

  // --- Simple Table ---
  const simpleTableDoc = new Document({
    sections: [
      {
        children: [
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Cell A1")] }),
                  new TableCell({ children: [new Paragraph("Cell B1")] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Cell A2")] }),
                  new TableCell({ children: [new Paragraph("Cell B2")] }),
                ],
              }),
            ],
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
          }),
        ],
      },
    ],
  });
  await saveDocx(simpleTableDoc, "simple_table.docx");

  // --- Hyperlink ---
  const hyperlinkDoc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new TextRun("This is a "),
              new ExternalHyperlink({
                children: [
                  new TextRun({
                    text: "hyperlink",
                    style: "Hyperlink", // Use the default Hyperlink style
                  }),
                ],
                link: "https://example.com",
              }),
              new TextRun("."),
            ],
          }),
        ],
      },
    ],
  });
  await saveDocx(hyperlinkDoc, "hyperlink.docx");

  // --- Image --- (Requires an actual image file)
  // Let's assume a placeholder image 'placeholder.png' exists in the same directory as the script
  let imageData: Buffer;
  try {
    imageData = await fs.readFile(
      path.resolve(__dirname, "fixtures", "placeholder.png")
    );
  } catch (e) {
    console.error(
      "Placeholder image not found. Skipping image fixture generation."
    );
    imageData = Buffer.from(""); // Provide empty buffer to avoid crash
  }

  if (imageData.length > 0) {
    const imageDoc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                // @ts-ignore - Suppress potential type mismatch for Buffer data
                new ImageRun({
                  data: imageData,
                  transformation: {
                    width: 100,
                    height: 100,
                  },
                }),
              ],
            }),
          ],
        },
      ],
    });
    await saveDocx(imageDoc, "image.docx");
  }

  // --- Bookmark ---
  const bookmarkDoc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            children: [
              new Bookmark({
                id: "myBookmarkId",
                children: [new TextRun("This text is bookmarked.")],
              }),
            ],
          }),
        ],
      },
    ],
  });
  await saveDocx(bookmarkDoc, "bookmark.docx");

  // --- Comment ---
  const commentDoc = new Document({
    comments: {
      children: [
        {
          // Comment ID "0"
          id: 0,
          initials: "AI",
          author: "AI Assistant",
          date: new Date(),
          children: [],
        },
      ], // Keep empty or remove if not needed
    },
    sections: [
      // Sections contain the main content *including* comment ranges/refs
      // The comments' children array from above is implicitly placed here by docx.js
      // Let's explicitly add the paragraph with comment markers to the section
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun("This text has a "),
              new CommentRangeStart(0), // Use numeric ID
              new TextRun({ text: "comment", italics: true }), // Reverted based on linter error
              new CommentRangeEnd(0), // Use numeric ID
              new TextRun(" associated with it."),
              new CommentReference(0), // Use numeric ID
            ],
          }),
        ],
      },
    ],
  });

  await saveDocx(commentDoc, "comment.docx");

  console.log("Fixture generation complete.");
}

generateFixtures().catch((err) => {
  console.error("Error generating fixtures:", err);
  process.exit(1);
});
