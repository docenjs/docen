import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { XMLParser } from "@docen/data";

async function main() {
  // Create XML parser
  const parser = new XMLParser();

  // Read XML file
  const xmlContent = readFileSync(join(__dirname, "example.xml"), "utf-8");

  try {
    // Parse XML content
    const document = await parser.parse(xmlContent);

    // Write parsed content to JSON file for inspection
    writeFileSync(
      join(__dirname, "output.draft.json"),
      JSON.stringify(document, null, 2)
    );
  } catch (error) {
    console.error("Error parsing XML:", error);
  }
}

main();
