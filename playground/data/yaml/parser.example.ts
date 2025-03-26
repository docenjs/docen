import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { YAMLParser } from "@docen/data";

async function main() {
  // Create YAML parser
  const parser = new YAMLParser();

  // Read YAML file
  const yamlContent = readFileSync(join(__dirname, "example.yaml"), "utf-8");

  try {
    // Parse YAML content
    const document = await parser.parse(yamlContent, {
      preserveComments: true,
      handleSpecialValues: true,
    });

    // Write parsed content to JSON file for inspection
    writeFileSync(
      join(__dirname, "output.draft.json"),
      JSON.stringify(document, null, 2)
    );
  } catch (error) {
    console.error("Error parsing YAML:", error);
  }
}

main();
