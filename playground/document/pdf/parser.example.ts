import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFParser } from "@docen/document";

async function main() {
  // Create PDF parser
  const parser = new PDFParser();

  // Read PDF file
  const pdfData = readFileSync(join(__dirname, "example.pdf"));

  try {
    // Parse PDF document
    const document = await parser.parse(pdfData);

    // Write parsed content to JSON file for inspection
    writeFileSync(
      join(__dirname, "output.draft.json"),
      JSON.stringify(document, null, 2),
    );
    console.log("Successfully parsed PDF file: output.draft.json");
  } catch (error) {
    console.error("Error parsing PDF:", error);
  }
}

main();
