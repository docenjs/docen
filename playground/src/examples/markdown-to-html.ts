import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createMarkdownProcessor } from "@docen/document";

// Get current directory using import.meta.url for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const samplesDir = join(__dirname, "../samples");
const inputFile = join(samplesDir, "sample.md");
const outputDir = join(__dirname, "..", "..", "drafts");
const outputFile = join(outputDir, "markdown_to_html.draft.html");

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

async function convertMarkdownToHtml() {
  console.log(
    "Running: Markdown -> HTML Example (Using createMarkdownProcessor)"
  );

  try {
    const markdownContent = readFileSync(inputFile, "utf-8");
    console.log(`Read input from: ${inputFile}`);

    // Use the new Markdown processor with HTML output and GFM support
    const processor = createMarkdownProcessor("html", { gfm: true });

    const result = await processor.process(markdownContent);

    console.log(`Conversion result type: ${typeof result.value}`);
    console.log(
      `Conversion result value (first 100 chars): ${(result.value as string)?.substring(0, 100)}...`
    );

    writeFileSync(outputFile, result.value as string);
    console.log(`Successfully wrote HTML output to: ${outputFile}`);
  } catch (error) {
    console.error(`Error during Markdown to HTML conversion in ${inputFile}:`);
    console.error(error);
    throw error;
  }
}

export default convertMarkdownToHtml;
