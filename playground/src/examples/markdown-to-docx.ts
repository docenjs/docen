import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { docenMarkdown } from "@docen/document";
import { type OoxmlRoot, mdastToOoxml, ooxmlToDocx } from "@docen/office";
import { Document, Packer } from "docx";
import type { Root as MdastRoot } from "mdast";
import { unified } from "unified";
import { VFile } from "vfile";

// --- Log the imported plugin ---
console.log(
  `[markdown-to-docx] Imported ooxmlToDocx type: ${typeof ooxmlToDocx}`,
);
// ------------------------------

// Define paths relative to the current file
const samplesDir = join(__dirname, "../samples"); // Assume __dirname is defined elsewhere or adjust
const inputFile = join(samplesDir, "sample.md");
const outputDir = join(__dirname, "..", "..", "drafts");
mkdirSync(outputDir, { recursive: true });
const outputFilePath = join(outputDir, "markdown_to_docx.draft.docx"); // Renamed output file

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

// --- Main conversion function ---
async function convertMarkdownToDocx() {
  console.log(
    "--- Starting Markdown to DOCX Conversion (Single Pipeline) --- ",
  );

  let markdownContent: string;
  try {
    markdownContent = readFileSync(inputFile, "utf-8");
    console.log(`Read content from: ${inputFile}`);
  } catch (error) {
    console.error(`Error reading input file ${inputFile}:`, error);
    throw error; // Re-throw to be caught by index.ts
  }

  // Create a VFile with the markdown content
  const vfile = new VFile({ value: markdownContent, path: "input.md" });

  try {
    // Define the unified pipeline
    const processor = unified()
      .use(docenMarkdown) // Parser
      .use(mdastToOoxml) // MDAST -> OOXML AST transformer
      .use(ooxmlToDocx); // OOXML AST -> docx.Document transformer (attaches to result)

    // Process the VFile through the entire pipeline
    // .process executes parse, run, etc. and returns the processed VFile
    // Using 'as any' on process due to potential type issues
    const processedFile = await (processor.process as any)(vfile);

    // Get the final Document object from the result property of the processed file
    // Note: Depending on unified version/plugins, result might be on the original vfile or the returned one.
    // Let's assume it's on the returned processedFile for safety.
    const doc = processedFile.result as Document;

    // Check if the result is actually a docx.Document object
    if (!doc || !(doc instanceof Document)) {
      console.error("Unified pipeline result:", processedFile.result);
      throw new Error(
        "Unified pipeline failed to produce a valid Document object on vfile.result.",
      );
    }
    console.log("docx.Document object generated via single pipeline.");

    // Pack and Write
    const buffer = await Packer.toBuffer(doc);
    console.log(`Packed document to buffer. Size: ${buffer.length} bytes`);
    writeFileSync(outputFilePath, buffer);
    console.log(`Successfully wrote DOCX to: ${outputFilePath}`);

    console.log("--- Markdown to DOCX Conversion Finished --- ");
  } catch (error) {
    console.error("Error during Markdown to DOCX pipeline:", error);
    throw error;
  }
}

// Default export the main function
export default convertMarkdownToDocx;
