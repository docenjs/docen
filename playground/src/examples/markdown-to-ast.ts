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
const outputFile = join(outputDir, "markdown_ast_export.draft.json");

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

async function exportMarkdownAst() {
  console.log(
    "\nRunning: Markdown -> AST Export Example (Using createMarkdownProcessor)"
  );

  try {
    const markdownContent = readFileSync(inputFile, "utf-8");
    console.log(`Read input from: ${inputFile}`);

    // Use the Markdown processor with AST output
    const processor = createMarkdownProcessor("ast", { gfm: true });

    const result = await processor.process(markdownContent);
    const ast = JSON.parse(result.value as string);

    console.log(
      `AST exported with ${ast.children?.length || 0} top-level nodes`
    );
    console.log(`AST type: ${ast.type}`);

    // Pretty print the AST for better readability
    const prettyAst = JSON.stringify(ast, null, 2);
    writeFileSync(outputFile, prettyAst);
    console.log(`Successfully wrote AST output to: ${outputFile}`);

    // Show a brief analysis
    console.log("\n--- AST Analysis ---");
    analyzeAST(ast);
  } catch (error) {
    console.error(`Error during AST export for ${inputFile}:`);
    console.error(error);
    throw error;
  }
}

function analyzeAST(ast: Record<string, unknown>, depth = 0): void {
  const indent = "  ".repeat(depth);
  const type = ast.type as string;
  const tagName = ast.tagName as string | undefined;
  const value = ast.value as string | undefined;
  const valueDisplay = value
    ? ` - "${value.substring(0, 30)}${value.length > 30 ? "..." : ""}"`
    : "";

  console.log(
    `${indent}${type}${tagName ? ` (${tagName})` : ""}${valueDisplay}`
  );

  const children = ast.children as Record<string, unknown>[] | undefined;
  if (children && children.length > 0) {
    for (const child of children) {
      analyzeAST(child, depth + 1);
    }
  }
}

export default exportMarkdownAst;
