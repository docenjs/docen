/**
 * Main entry point for the @docen/document package.
 * Exports plugins and utilities for document processing (Markdown, HTML).
 */

export { docenMarkdown } from "./plugins/markdown";
export type { DocenMarkdownOptions } from "./plugins/markdown";

export { docenHtml } from "./plugins/html";
export type { DocenHtmlOptions } from "./plugins/html";

// Export core AST types re-exported from @docen/core if needed by consumers
// export type { Node, Parent, TextNode, DocenRoot } from "@docen/core";

// Export conversion utilities or other functions as they are developed.
