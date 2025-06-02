/**
 * DOCX Template system exports
 * Unified entry point for template functionality
 */

// Core template building blocks and composition
export {
  createPageLayout,
  createTypography,
  createMetadata,
  createTableOfContents,
  createNumbering,
  composeDocxTemplate,
} from "./templates";

// Template loading and configuration (core functionality)
export { loadDocxTemplate } from "./loader";

// Type exports
export type {
  DocxTemplateConfig,
  DocxStyleDefinition,
  DocxSectionConfig,
  DocxHeaderFooterConfig,
  DocxNumberingConfig,
  DocxNumberingLevel,
  DocxTOCConfig,
  DocxBorderDefinition,
  DocxTemplateLoaderOptions,
  DocxTemplateResult,
  VFileDocxContext,
} from "./types";
