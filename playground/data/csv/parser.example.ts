import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CSVParser } from "@docen/data";

async function main() {
  // Create CSV parser
  const parser = new CSVParser();

  // Read CSV file
  const csvContent = readFileSync(join(__dirname, "example.csv"), "utf-8");

  try {
    // Parse CSV content
    const document = await parser.parse(csvContent, {
      delimiter: ",",
      hasHeader: true,
      quote: '"',
      escape: "\\",
      detectBOM: true,
    });

    // Write parsed content to JSON file for inspection
    writeFileSync(
      join(__dirname, "output.draft.json"),
      JSON.stringify(document, null, 2),
    );
  } catch (error) {
    console.error("Error parsing CSV:", error);
  }
}

main();
