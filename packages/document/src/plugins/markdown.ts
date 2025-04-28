import type { Node } from "@docen/core"; // Assuming Node is exported from core
import type { Root as MdastRoot } from "mdast"; // Import MdastRoot
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm"; // Import GFM plugin
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkStringify from "remark-stringify";
import type { Plugin, Processor } from "unified";

/**
 * Options for the docenMarkdown plugin.
 */
export interface DocenMarkdownOptions {
  /**
   * Specify the target output format.
   * 'markdown': Output as Markdown string (default).
   * 'html': Output as HTML string.
   * @default 'markdown'
   */
  to?: "markdown" | "html";
  // Add other remark/gfm options here if needed in the future
}

/**
 * A unified plugin that configures the processor for Markdown handling.
 * NOTE: Uses internal .use calls, which is non-standard.
 * Signature adjusted to primarily declare MdastRoot output for type compatibility.
 */
export const docenMarkdown: Plugin<
  [DocenMarkdownOptions?],
  string, // Input should be string for a parser-centric plugin
  MdastRoot // Declare MdastRoot as the primary AST output
> = function (options = {}) {
  const processor = this as Processor;
  const { to = "markdown" } = options;

  // Internal .use calls (still non-standard but kept as requested)
  processor.use(remarkParse);
  processor.use(remarkGfm);

  // Conditional stringifiers
  if (to === "html") {
    processor.use(remarkRehype);
    processor.use(rehypeStringify);
  } else if (to === "markdown") {
    processor.use(remarkStringify);
  }
  // If neither, the output *is* MdastRoot

  // Collaboration integration (Yjs binding) should still be handled
  // by the core DocenProcessor if enabled.
};
