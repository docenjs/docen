import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parseDocx, isRoot } from "../src/index";
import type { Root, Element } from "@docen/wmlast";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function dumpAst() {
  console.log("Parsing DOCX file...");

  const docxPath = join(__dirname, "fixtures", "sample.docx");
  const docxBuffer = readFileSync(docxPath);

  const result = await parseDocx(docxBuffer, {
    styles: true,
    comments: true,
    footnotes: true,
    numbering: true,
    theme: true,
    settings: true,
    coreProperties: true,
    appProperties: true,
    customProperties: true,
    contentTypes: true,
  });

  // Output complete AST JSON
  const outputPath = join(__dirname, "fixtures", "ast.json");
  writeFileSync(outputPath, JSON.stringify(result, null, 2));

  console.log("✅ AST output to:", outputPath);

  // Output all parsed component statistics
  const stats = {
    totalRoots: result.children.length,
    documentRoot: result.children.find(
      (root): root is Root =>
        isRoot(root) && root.data?.fileType === "document",
    ),
    stylesRoot: result.children.find(
      (root): root is Root => isRoot(root) && root.data?.fileType === "styles",
    ),
    commentsRoot: result.children.find(
      (root): root is Root =>
        isRoot(root) && root.data?.fileType === "comments",
    ),
    footnotesRoot: result.children.find(
      (root): root is Root =>
        isRoot(root) && root.data?.fileType === "footnotes",
    ),
    numberingRoot: result.children.find(
      (root): root is Root =>
        isRoot(root) && root.data?.fileType === "numbering",
    ),
    headers: result.children.filter(
      (root): root is Root => isRoot(root) && root.data?.fileType === "header",
    ),
    footers: result.children.filter(
      (root): root is Root => isRoot(root) && root.data?.fileType === "footer",
    ),
    themes: result.children.filter(
      (root): root is Root => isRoot(root) && root.data?.fileType === "theme",
    ),
    relationships: result.data.relationships.size,
    media: result.data.media.size,
  };

  console.log("📊 Parse statistics:");
  console.log(`   - Total Root nodes: ${stats.totalRoots}`);
  console.log(`   - Document Root: ${stats.documentRoot ? "✓" : "✗"}`);
  console.log(`   - Styles Root: ${stats.stylesRoot ? "✓" : "✗"}`);
  console.log(`   - Comments Root: ${stats.commentsRoot ? "✓" : "✗"}`);
  console.log(`   - Footnotes Root: ${stats.footnotesRoot ? "✓" : "✗"}`);
  console.log(`   - Numbering Root: ${stats.numberingRoot ? "✓" : "✗"}`);
  console.log(`   - Headers: ${stats.headers.length}`);
  console.log(`   - Footers: ${stats.footers.length}`);
  console.log(`   - Themes: ${stats.themes.length}`);
  console.log(`   - Relationship files: ${stats.relationships}`);
  console.log(`   - Media files: ${stats.media}`);

  // Show document root details
  if (stats.documentRoot) {
    const documentElement = stats.documentRoot.children.find(
      (child): child is Element =>
        child.type === "element" && child.name === "w:document",
    );
    if (documentElement && "children" in documentElement) {
      const bodyElement = documentElement.children.find(
        (child): child is Element =>
          child.type === "element" && child.name === "w:body",
      );
      if (bodyElement && "children" in bodyElement) {
        const paragraphs = bodyElement.children.filter(
          (child): child is Element =>
            child.type === "element" && child.name === "w:p",
        );
        console.log(`   - Document paragraphs: ${paragraphs.length}`);
      }
    }
  }

  // Show file paths
  console.log("📁 File paths:");
  result.children.forEach((root) => {
    if (isRoot(root) && root.data?.filePath) {
      console.log(`   - ${root.data.filePath} (${root.data.fileType})`);
    }
  });

  // Show relationships
  if (stats.relationships > 0) {
    console.log("🔗 Relationships:");
    result.data.relationships.forEach((rels, path) => {
      console.log(`   - ${path}: ${rels.length} relationships`);
      rels.forEach((rel) => {
        console.log(`     - ${rel.id}: ${rel.type} -> ${rel.target}`);
      });
    });
  }

  // If there are styles, output style count
  if (stats.stylesRoot) {
    const stylesElement = stats.stylesRoot.children.find(
      (child): child is Element =>
        child.type === "element" && child.name === "w:styles",
    );
    if (stylesElement && "children" in stylesElement) {
      const styleCount = stylesElement.children.filter(
        (child): child is Element =>
          child.type === "element" && child.name === "w:style",
      ).length;
      console.log(`   - Styles: ${styleCount}`);
    }
  }
}

dumpAst().catch(console.error);
