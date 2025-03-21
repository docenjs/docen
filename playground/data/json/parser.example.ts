import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { JSONParser } from "@docen/data";

async function main() {
  // Create JSON parser
  const parser = new JSONParser();

  // Read JSON file
  const jsonContent = readFileSync(join(__dirname, "example.json"), "utf-8");

  try {
    // Parse JSON content
    const document = await parser.parse(jsonContent, {
      preserveComments: true,
      handleSpecialValues: true,
    });

    // Write parsed content to JSON file for inspection
    writeFileSync(
      join(__dirname, "output.draft.json"),
      JSON.stringify(document, null, 2),
    );
  } catch (error) {
    console.error("Error parsing JSON:", error);
  }
}

main();
