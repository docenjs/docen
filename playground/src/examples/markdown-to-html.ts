import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createProcessor } from "@docen/core";
import { docenMarkdown } from "@docen/document"; // Use the wrapper plugin

// Get current directory using import.meta.url for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const samplesDir = join(__dirname, "../samples");
const inputFile = join(samplesDir, "sample.md");
const outputFile = join(__dirname, "markdown-to-html.draft.html"); // Output in examples dir

async function convertMarkdownToHtml() {
  console.log("Running: Markdown -> HTML Example (Using docenMarkdown)");

  try {
    const markdownContent = readFileSync(inputFile, "utf-8");
    console.log(`Read input from: ${inputFile}`);

    // Use the docenMarkdown plugin with the 'to' option
    const processor = createProcessor().use(docenMarkdown, { to: "html" });

    const result = await processor.process(markdownContent);

    console.log(`Conversion result type: ${typeof result.value}`);
    console.log(
      `Conversion result value (first 100 chars): ${(result.value as string)?.substring(0, 100)}...`,
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
