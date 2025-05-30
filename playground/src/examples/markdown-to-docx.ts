import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createProcessor } from "@docen/core";
import { docenMarkdown } from "@docen/document";
import { mdastToOoxml, ooxmlToDocx } from "@docen/office";
import { Document, Packer } from "docx";
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
    const processor = createProcessor()
      .use(docenMarkdown) // Parser
      .use(mdastToOoxml) // MDAST -> OOXML AST transformer
      .use(ooxmlToDocx); // OOXML AST -> docx.Document transformer (attaches to result)

    // Parse the markdown into an MDAST tree
    const tree = processor.parse(vfile);

    // Run the transformers on the tree. ooxmlToDocx will attach the result to vfile.
    await processor.run(tree, vfile);

    // Get the final Document object from the result property of the VFile
    // The result should be on the original vfile instance after .run()
    const doc = vfile.result as Document;

    // Check if the result is actually a docx.Document object
    if (!doc || !(doc instanceof Document)) {
      console.error(
        "Unified pipeline result (from vfile.result after run):",
        vfile.result,
      );
      throw new Error(
        "Unified pipeline failed to produce a valid Document object on vfile.result after run.",
      );
    }
    console.log("docx.Document object generated via parse/run pipeline.");

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
