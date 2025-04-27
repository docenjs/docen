import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createProcessor } from "@docen/core";
import { docenHtml } from "@docen/document"; // Use the wrapper plugin

// Get current directory using import.meta.url for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const samplesDir = join(__dirname, "../samples");
const inputFile = join(samplesDir, "sample.html");
const outputFile = join(__dirname, "html-to-markdown.draft.md"); // Output in examples dir

async function convertHtmlToMarkdown() {
  console.log("\nRunning: HTML -> Markdown Example (Using docenHtml)");

  try {
    const htmlContent = readFileSync(inputFile, "utf-8");
    console.log(`Read input from: ${inputFile}`);

    // Use the docenHtml plugin with the 'to' option
    const processor = createProcessor().use(docenHtml, { to: "markdown" });

    const result = await processor.process(htmlContent);

    console.log(`Conversion result type: ${typeof result.value}`);
    console.log(
      `Conversion result value (first 100 chars): ${(result.value as string)?.substring(0, 100)}...`
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
