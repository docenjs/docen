import * as fs from "node:fs/promises";
import path from "node:path";
import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFString,
  StandardFonts,
  rgb,
} from "pdf-lib";

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

async function savePdf(doc: PDFDocument, filename: string) {
  const pdfBytes = await doc.save();
  const filepath = path.join(fixturesDir, filename);
  await fs.writeFile(filepath, pdfBytes);
  console.log(`Generated: ${filepath}`);
}

async function generatePdfFixtures() {
  await ensureFixturesDir();

  // --- Simple Paragraph ---
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("This is a simple paragraph.", {
      x: 50,
      y: 700,
      font,
      size: 16,
    });
    await savePdf(doc, "simple_paragraph.pdf");
  }

  // --- Styled Text ---
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);
    const y = 700;
    page.drawText("This text is ", { x: 50, y, font, size: 16 });
    page.drawText("bold", { x: 140, y, font: fontBold, size: 16 });
    page.drawText(", this text is ", { x: 180, y, font, size: 16 });
    page.drawText("italic", { x: 300, y, font: fontOblique, size: 16 });
    page.drawText(", and this is ", { x: 350, y, font, size: 16 });
    page.drawText("both", { x: 450, y, font: fontBold, size: 16 });
    page.drawText(".", { x: 490, y, font, size: 16 });
    await savePdf(doc, "styled_text.pdf");
  }

  // --- Bullet List ---
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const y = 700;
    const items = ["Item 1", "Item 2", "Item 3"];
    items.forEach((item, i) => {
      page.drawText("•", { x: 50, y: y - i * 24, font, size: 16 });
      page.drawText(item, { x: 70, y: y - i * 24, font, size: 16 });
    });
    await savePdf(doc, "bullet_list.pdf");
  }

  // --- Numbered List ---
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const y = 700;
    const items = ["First item", "Second item", "Third item"];
    items.forEach((item, i) => {
      page.drawText(`${i + 1}.`, { x: 50, y: y - i * 24, font, size: 16 });
      page.drawText(item, { x: 80, y: y - i * 24, font, size: 16 });
    });
    await savePdf(doc, "numbered_list.pdf");
  }

  // --- Simple Table ---
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage([300, 200]);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    // Draw table grid
    const startX = 50;
    const startY = 150;
    const cellW = 80;
    const cellH = 40;
    for (let i = 0; i <= 2; i++) {
      page.drawLine({
        start: { x: startX, y: startY - i * cellH },
        end: { x: startX + 2 * cellW, y: startY - i * cellH },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }
    for (let j = 0; j <= 2; j++) {
      page.drawLine({
        start: { x: startX + j * cellW, y: startY },
        end: { x: startX + j * cellW, y: startY - 2 * cellH },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
    }
    // Draw cell text
    page.drawText("Cell A1", {
      x: startX + 10,
      y: startY - 30,
      font,
      size: 14,
    });
    page.drawText("Cell B1", {
      x: startX + cellW + 10,
      y: startY - 30,
      font,
      size: 14,
    });
    page.drawText("Cell A2", {
      x: startX + 10,
      y: startY - cellH - 30,
      font,
      size: 14,
    });
    page.drawText("Cell B2", {
      x: startX + cellW + 10,
      y: startY - cellH - 30,
      font,
      size: 14,
    });
    await savePdf(doc, "simple_table.pdf");
  }

  // --- Hyperlink ---
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const text = "hyperlink";
    const url = "https://example.com";
    const x = 130;
    const y = 700;
    const size = 16;
    const textWidth = font.widthOfTextAtSize(text, size);
    const textHeight = font.heightAtSize(size);

    page.drawText("This is a ", { x: 50, y: y, font, size });

    page.drawText(text, {
      x: x,
      y: y,
      font: font,
      size: size,
      color: rgb(0, 0, 1),
    });

    const context = doc.context;
    const rect = [x, y, x + textWidth, y + textHeight];

    // Create the URI Action Dictionary - Use PDFString.of()
    const uriActionDict = context.obj({
      Type: "Action",
      S: "URI",
      URI: PDFString.of(url), // Correct way to create PDF string
    });

    // Create the Link Annotation Dictionary
    const linkAnnotationDict = context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: context.obj(rect),
      Border: context.obj([0, 0, 0]),
      A: uriActionDict,
    });

    let annotsArray = page.node.lookup(PDFName.of("Annots"), PDFArray);
    if (!annotsArray) {
      annotsArray = context.obj([]);
      page.node.set(PDFName.of("Annots"), annotsArray);
    }
    annotsArray.push(linkAnnotationDict);

    page.drawText(".", { x: x + textWidth + 2, y: y, font, size });
    await savePdf(doc, "hyperlink.pdf");
  }

  // --- Image ---
  {
    let imageBytes: Uint8Array | undefined;
    try {
      imageBytes = await fs.readFile(
        path.resolve(fixturesDir, "placeholder.png"),
      );
    } catch (e) {
      console.error(
        "Placeholder image not found. Skipping image fixture generation.",
        e,
      );
      imageBytes = undefined;
    }
    if (imageBytes) {
      const doc = await PDFDocument.create();
      const page = doc.addPage();
      const png = await doc.embedPng(imageBytes);
      page.drawImage(png, { x: 50, y: 600, width: 100, height: 100 });
      await savePdf(doc, "image.pdf");
    }
  }

  // --- Bookmark (simulated with text marker) ---
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("This text is bookmarked. [BOOKMARK]", {
      x: 50,
      y: 700,
      font,
      size: 16,
    });
    await savePdf(doc, "bookmark.pdf");
  }

  // --- Comment (simulated with text marker) ---
  {
    const doc = await PDFDocument.create();
    const page = doc.addPage();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    page.drawText("This text has a [COMMENT] associated with it.", {
      x: 50,
      y: 700,
      font,
      size: 16,
    });
    await savePdf(doc, "comment.pdf");
  }

  console.log("PDF fixture generation complete.");
}

generatePdfFixtures().catch((err) => {
  console.error("Error generating PDF fixtures:", err);
  process.exit(1);
});
