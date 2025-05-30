import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHtmlProcessor } from "@docen/document";

// Get current directory using import.meta.url for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define paths relative to the current file
const samplesDir = join(__dirname, "../samples");
const inputFile = join(samplesDir, "sample.html"); // Changed to .html for HTML input
const outputDir = join(__dirname, "..", "..", "drafts");
const outputFile = join(outputDir, "html_to_markdown.draft.md");

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

async function convertHtmlToMarkdown() {
  console.log(
    "\nRunning: HTML -> Markdown Example (Using createHtmlProcessor)",
  );

  try {
    const htmlContent = readFileSync(inputFile, "utf-8");
    console.log(`Read input from: ${inputFile}`);

    // Use the new HTML processor with Markdown output and GFM support
    const processor = createHtmlProcessor("markdown", { gfm: true });

    const result = await processor.process(htmlContent);

    console.log(`Conversion result type: ${typeof result.value}`);
    console.log(
      `Conversion result value (first 100 chars): ${(result.value as string)?.substring(0, 100)}...`,
    );

    writeFileSync(outputFile, result.value as string);
    console.log(`Successfully wrote Markdown output to: ${outputFile}`);
  } catch (error) {
    console.error(`Error during HTML to Markdown conversion in ${inputFile}:`);
    console.error(error);
    throw error;
  }
}

export default convertHtmlToMarkdown;
