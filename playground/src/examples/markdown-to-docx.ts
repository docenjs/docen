import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type OoxmlElement,
  type OoxmlRoot,
  mdastToOoxml,
  ooxmlToDocx,
} from "@docen/office";
import { Document, Packer } from "docx";
import remarkParse from "remark-parse";
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
  console.log("--- Starting Markdown to DOCX Conversion (via OOXML AST) --- ");

  let markdownContent: string;
  try {
    markdownContent = readFileSync(inputFile, "utf-8");
    console.log(`Read content from: ${inputFile}`);
  } catch (error) {
    console.error(`Error reading input file ${inputFile}:`, error);
    throw error; // Re-throw to be caught by index.ts
  }

  const vfile = new VFile({ value: markdownContent, path: "input.md" });

  try {
    // Step 1: Markdown to MDAST
    const parser = unified().use(remarkParse);
    const mdastTree = parser.parse(vfile);
    console.log("Parsed MDAST.");

    // Step 2: MDAST to OOXML AST
    const ooxmlProcessor = unified().use(mdastToOoxml);
    // Run the transform - the result should be on vfile.result
    await ooxmlProcessor.run(mdastTree, vfile);
    // Get the OOXML AST from vfile.result
    const ooxmlRoot = vfile.result as OoxmlRoot;
    vfile.result = undefined; // Clear result before next processor
    console.log("Converted MDAST to OOXML AST from vfile.result.");

    // --- Log the input tree for the next step ---
    console.log(
      `[markdown-to-docx] ooxmlRoot type: ${ooxmlRoot?.type}, children count: ${ooxmlRoot?.children?.length}`,
    );
    if (!ooxmlRoot) {
      console.error(
        "[markdown-to-docx] Failed to get ooxmlRoot from mdastToOoxml result!",
      );
      throw new Error("mdastToOoxml did not produce a result on vfile.result");
    }
    // Log first child ooxmlType if exists
    if (
      ooxmlRoot?.children?.length > 0 &&
      ooxmlRoot.children[0].type === "element"
    ) {
      const firstChildData = (ooxmlRoot.children[0] as OoxmlElement).data;
      console.log(
        `[markdown-to-docx] First child ooxmlType: ${firstChildData?.ooxmlType}`,
      );
    }
    // ---------------------------------------------

    // Step 3: OOXML AST to docx.Document
    if (ooxmlRoot.type !== "root") {
      // Simpler check now
      throw new Error(
        "mdastToOoxml plugin did not produce a valid OOXML AST Root object on vfile.result.",
      );
    }

    const docxProcessor = unified().use(ooxmlToDocx);
    // console.log(`[markdown-to-docx] Processor after use(ooxmlToDocx):`, docxProcessor); // Keep logs minimal now

    // console.log(`[markdown-to-docx] Before run: typeof vfile.value = ${typeof vfile.value}, vfile.result =`, vfile.result);

    // Run the processor. Input is ooxmlRoot, result (Document) will be on vfile.result
    await docxProcessor.run(ooxmlRoot, vfile);

    // console.log(`[markdown-to-docx] After run: typeof vfile.value = ${typeof vfile.value}`);
    console.log(
      `[markdown-to-docx] After run: typeof vfile.result = ${typeof vfile.result}, result instanceof Document: ${vfile.result instanceof Document}`,
    );

    // Step 4: Get the Document from vfile.result, Pack, and Write
    const docxDocument = vfile.result as Document;

    // Check if the result is actually a Document object
    if (docxDocument instanceof Document) {
      console.log(
        "[markdown-to-docx] Received Document object from plugin via result.",
      );
      // Use Packer here
      const buffer = await Packer.toBuffer(docxDocument);
      console.log(
        `[markdown-to-docx] Packed document to buffer. Size: ${buffer.length} bytes`,
      );
      writeFileSync(outputFilePath, buffer);
      console.log(`Successfully wrote DOCX to: ${outputFilePath}`);
    } else {
      // Throw error if the plugin didn't produce a Document on vfile.result
      throw new Error(
        `ooxmlToDocx plugin did not produce a Document object on vfile.result. Got: ${typeof docxDocument}`,
      );
    }

    console.log("--- Markdown to DOCX Conversion Finished --- ");
  } catch (error) {
    console.error("Error during Markdown to DOCX pipeline:", error);
    throw error; // Re-throw the error to be caught by the main runner
  }
}

// Default export the main function
export default convertMarkdownToDocx;
