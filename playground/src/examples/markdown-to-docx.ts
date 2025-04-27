import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify"; // For demonstration if needed
import { unified } from "unified";
import { VFile } from "vfile";

// --- Placeholder for the actual DOCX generation logic ---
// In a real scenario, this might be a dedicated plugin in the unified chain
// (e.g., `ooxml-stringify-docx`) or an external library call.
async function generateDocx(markdownContent: string): Promise<Buffer> {
  console.log(
    "Simulating DOCX generation for Markdown. Replace with actual implementation.",
  );
  // Replace this with actual DOCX generation logic (e.g., using pandoc, mammoth, or a custom OOXML serializer)
  // For now, just return a buffer containing the Markdown for demonstration.
  return Buffer.from(
    `This is a placeholder DOCX buffer for:\n\n${markdownContent}`,
  );
}
// ---------------------------------------------------------

async function convertMarkdownToDocx(
  markdownInput: string,
  outputPath: string,
) {
  console.log("--- Starting Markdown to DOCX Conversion ---");

  // 1. Setup unified processor to parse Markdown
  const processor = unified().use(remarkParse); // Add other remark plugins here if needed

  // 2. Parse the Markdown into an AST (MDAST)
  const file = new VFile({ value: markdownInput, path: "input.md" });
  const mdast = processor.parse(file);
  console.log("Markdown parsed into MDAST:");
  // console.log(JSON.stringify(mdast, null, 2)); // Uncomment to see the AST

  // --- Future steps for a pure unified pipeline (Requires new plugins) ---
  // const ooxmlAst = await unified()
  //   .use(remarkParse)
  //   .use(remarkToOoxml) // Hypothetical: MDAST -> OOXML AST
  //   .run(mdast);
  //
  // const docxBuffer = await unified()
  //   .use(ooxmlStringifyDocx) // Hypothetical: OOXML AST -> DOCX Buffer
  //   .stringify(ooxmlAst);
  // -----------------------------------------------------------------------

  // 3. Generate DOCX (using placeholder/external function for now)
  // We pass the original markdown content here, but could pass processed content
  const docxBuffer = await generateDocx(markdownInput);
  console.log(
    `Generated DOCX buffer (placeholder content). Size: ${docxBuffer.length} bytes`,
  );

  // 4. Write the DOCX buffer to a file
  try {
    writeFileSync(outputPath, docxBuffer);
    console.log(`Successfully wrote DOCX to: ${outputPath}`);
  } catch (error) {
    console.error(`Error writing DOCX file to ${outputPath}:`, error);
  }

  console.log("--- Markdown to DOCX Conversion Finished ---");
}

// --- Example Usage ---
const sampleMarkdown = `
# Sample Markdown Document

This is a paragraph with **bold** and *italic* text.

- Item 1
- Item 2
  - Sub-item 2.1

\`\`\`javascript
function greet() {
  console.log('Hello, DOCX!');
}
\`\`\`
`;

const outputFilePath = join(
  __dirname,
  "..",
  "..",
  "drafts",
  "sample_markdown.docx",
);

// Ensure output directory exists
mkdirSync(dirname(outputFilePath), { recursive: true });

convertMarkdownToDocx(sampleMarkdown, outputFilePath);
