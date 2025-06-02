import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { createMarkdownProcessor } from "@docen/document";
import { mdastToOoxast, ooxastToDocx } from "@docen/office";
import {
  type DocxTemplateConfig,
  type ToDocxOptions,
  composeDocxTemplate,
  createMetadata,
  createNumbering,
  createPageLayout,
  createTableOfContents,
  createTypography,
} from "@docen/office";
import { Document, Packer } from "docx";
import { VFile } from "vfile";

// Define paths relative to the current file
const samplesDir = join(__dirname, "../samples");
const inputFile = join(samplesDir, "sample.md");
const outputDir = join(__dirname, "..", "..", "drafts");
const outputFilePath = join(
  outputDir,
  "markdown_to_docx_with_template.draft.docx",
);

// Ensure output directory exists
mkdirSync(outputDir, { recursive: true });

// --- Template Configuration Functions ---

/**
 * Create an academic paper template
 */
function createAcademicTemplate(): DocxTemplateConfig {
  return composeDocxTemplate(
    createPageLayout({
      size: "A4",
      orientation: "portrait",
      margins: {
        top: 72, // 1 inch
        right: 72, // 1 inch
        bottom: 72, // 1 inch
        left: 72, // 1 inch
      },
    }),
    createTypography({
      bodyFont: "Times New Roman",
      headingFont: "Times New Roman",
      fontSize: 12,
      lineHeight: 2.0, // Double spacing for academic papers
    }),
    createMetadata({
      title: "Academic Paper",
      description: "A research paper formatted with academic standards",
      creator: "Docen Template System",
      keywords: ["academic", "research", "paper"],
      category: "Academic",
    }),
    createTableOfContents({
      title: "Table of Contents",
      styles: ["Heading1", "Heading2", "Heading3"],
      levels: 3,
      pageNumbers: true,
      hyperlinks: true,
    }),
    createNumbering({
      id: "academicList",
      type: "decimal",
      levels: 5,
    }),
  );
}

/**
 * Create a business report template
 */
function createBusinessTemplate(): DocxTemplateConfig {
  return composeDocxTemplate(
    createPageLayout({
      size: "Letter",
      orientation: "portrait",
      margins: {
        top: 54, // 0.75 inch
        right: 54, // 0.75 inch
        bottom: 54, // 0.75 inch
        left: 54, // 0.75 inch
      },
    }),
    createTypography({
      bodyFont: "Calibri",
      headingFont: "Calibri",
      fontSize: 11,
      lineHeight: 1.15, // Single spacing for business documents
    }),
    createMetadata({
      title: "Business Report",
      description: "A professional business report template",
      creator: "Docen Template System",
      keywords: ["business", "report", "professional"],
      category: "Business",
    }),
    createTableOfContents({
      title: "Contents",
      styles: ["Heading1", "Heading2"],
      levels: 2,
      pageNumbers: true,
      hyperlinks: true,
    }),
    createNumbering({
      id: "businessList",
      type: "bullet",
      levels: 3,
    }),
  );
}

/**
 * Create a creative document template
 */
function createCreativeTemplate(): DocxTemplateConfig {
  return composeDocxTemplate(
    createPageLayout({
      size: "A4",
      orientation: "portrait",
      margins: {
        top: 90, // 1.25 inch
        right: 54, // 0.75 inch
        bottom: 90, // 1.25 inch
        left: 90, // 1.25 inch
      },
    }),
    createTypography({
      bodyFont: "Georgia",
      headingFont: "Georgia",
      fontSize: 11,
      lineHeight: 1.5, // 1.5 spacing for readability
    }),
    createMetadata({
      title: "Creative Document",
      description: "A creatively formatted document template",
      creator: "Docen Template System",
      keywords: ["creative", "writing", "document"],
      category: "Creative",
    }),
    createTableOfContents({
      title: "Table of Contents",
      styles: ["Heading1", "Heading2", "Heading3"],
      levels: 3,
      pageNumbers: false, // No page numbers for creative docs
      hyperlinks: true,
    }),
    createNumbering({
      id: "creativeList",
      type: "outline",
      levels: 4,
    }),
  );
}

// --- Template Selection ---
const AVAILABLE_TEMPLATES = {
  academic: createAcademicTemplate,
  business: createBusinessTemplate,
  creative: createCreativeTemplate,
} as const;

type TemplateType = keyof typeof AVAILABLE_TEMPLATES;

// --- Main conversion function ---
async function convertMarkdownToDocxWithTemplate(
  templateType: TemplateType = "academic",
) {
  console.log(
    `--- Starting Markdown to DOCX Conversion with ${templateType} template ---`,
  );

  let markdownContent: string;
  try {
    markdownContent = readFileSync(inputFile, "utf-8");
    console.log(`Read content from: ${inputFile}`);
  } catch (error) {
    console.error(`Error reading input file ${inputFile}:`, error);
    throw error;
  }

  // Create a VFile with the markdown content
  const vfile = new VFile({ value: markdownContent, path: "input.md" });

  try {
    // Generate the selected template configuration
    const templateConfig = AVAILABLE_TEMPLATES[templateType]();
    console.log(`Generated ${templateType} template configuration`);

    // Configure template options
    const templateOptions: ToDocxOptions = {
      template: {
        config: templateConfig,
      },
      debug: true, // Enable debug logging
    };

    // Define the unified pipeline with template support
    const processor = createMarkdownProcessor("ast", { gfm: true })
      .use(mdastToOoxast) // MDAST -> OOXML AST transformer
      .use(ooxastToDocx, templateOptions); // OOXML AST -> docx.Document with template

    // Parse the markdown into an MDAST tree
    console.log("Parsing markdown content...");
    const tree = processor.parse(vfile);

    // Run the transformers on the tree
    console.log("Running transformation pipeline...");
    await processor.run(tree, vfile);

    // Get the final Document object from the result property of the VFile
    const doc = vfile.result as Document;

    // Validate the result
    if (!doc || !(doc instanceof Document)) {
      console.error("Pipeline result:", vfile.result);
      throw new Error("Pipeline failed to produce a valid Document object.");
    }
    console.log(`Document object generated with ${templateType} template.`);

    // Pack and Write
    console.log("Packing document to buffer...");
    const buffer = await Packer.toBuffer(doc);
    console.log(`Packed document to buffer. Size: ${buffer.length} bytes`);

    writeFileSync(outputFilePath, buffer);
    console.log(`Successfully wrote DOCX to: ${outputFilePath}`);

    // Log template configuration summary
    console.log("\n--- Template Configuration Summary ---");
    console.log(`Template Type: ${templateType}`);
    console.log(
      `Page Size: ${templateConfig.pageSettings?.width}x${templateConfig.pageSettings?.height} pts`,
    );
    console.log(
      `Body Font: ${templateConfig.styles?.paragraphStyles?.[0]?.run?.font}`,
    );
    console.log(
      `Font Size: ${templateConfig.styles?.paragraphStyles?.[0]?.run?.size}`,
    );
    console.log(`Document Title: ${templateConfig.metadata?.title}`);
    console.log(`Creator: ${templateConfig.metadata?.creator}`);
    if (templateConfig.tableOfContents) {
      console.log(`TOC Levels: ${templateConfig.tableOfContents.levels}`);
    }
    if (templateConfig.numbering) {
      console.log(`Numbering Styles: ${templateConfig.numbering.length}`);
    }

    console.log(
      `\n--- Markdown to DOCX Conversion with ${templateType} template finished ---`,
    );
  } catch (error) {
    console.error("Error during conversion pipeline:", error);
    throw error;
  }
}

// --- Demo function that creates multiple versions ---
async function createMultipleTemplateVersions() {
  console.log("=== Creating multiple template versions ===\n");

  const templates: TemplateType[] = ["academic", "business", "creative"];

  for (const templateType of templates) {
    try {
      // Modify output path for each template
      const templateOutputPath = outputFilePath.replace(
        ".draft.docx",
        `.${templateType}.draft.docx`,
      );

      console.log(`\nCreating ${templateType} version...`);

      // Read markdown content
      const markdownContent = readFileSync(inputFile, "utf-8");
      const vfile = new VFile({ value: markdownContent, path: "input.md" });

      // Generate template configuration
      const templateConfig = AVAILABLE_TEMPLATES[templateType]();

      const templateOptions: ToDocxOptions = {
        template: {
          config: templateConfig,
        },
        debug: false, // Reduce noise for batch processing
      };

      // Process with template
      const processor = createMarkdownProcessor("ast", { gfm: true })
        .use(mdastToOoxast)
        .use(ooxastToDocx, templateOptions);

      const tree = processor.parse(vfile);
      await processor.run(tree, vfile);

      const doc = vfile.result as Document;
      if (!doc || !(doc instanceof Document)) {
        throw new Error(`Failed to generate ${templateType} document`);
      }

      // Save the document
      const buffer = await Packer.toBuffer(doc);
      writeFileSync(templateOutputPath, buffer);

      console.log(`✓ ${templateType} template saved to: ${templateOutputPath}`);
    } catch (error) {
      console.error(`✗ Failed to create ${templateType} template:`, error);
    }
  }

  console.log("\n=== All template versions created ===");
}

// --- Interactive template selection ---
async function interactiveTemplateSelection() {
  const args = process.argv.slice(2);
  const templateArg = args[0];

  if (templateArg === "all") {
    await createMultipleTemplateVersions();
    return;
  }

  if (templateArg && templateArg in AVAILABLE_TEMPLATES) {
    await convertMarkdownToDocxWithTemplate(templateArg as TemplateType);
    return;
  }

  if (templateArg && !(templateArg in AVAILABLE_TEMPLATES)) {
    console.error(`Unknown template: ${templateArg}`);
    console.log(
      `Available templates: ${Object.keys(AVAILABLE_TEMPLATES).join(", ")}`,
    );
    process.exit(1);
  }

  // Default to academic template
  await convertMarkdownToDocxWithTemplate("academic");
}

// Export both the main function and demo function
export default convertMarkdownToDocxWithTemplate;
export { createMultipleTemplateVersions, interactiveTemplateSelection };

// --- CLI Usage ---
// Run this file directly to test template functionality
// Examples:
//   node markdown-to-docx-with-template.js academic
//   node markdown-to-docx-with-template.js business
//   node markdown-to-docx-with-template.js creative
//   node markdown-to-docx-with-template.js all

if (require.main === module) {
  interactiveTemplateSelection().catch(console.error);
}
