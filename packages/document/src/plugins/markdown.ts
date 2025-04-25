import type { Node } from "@docen/core"; // Assuming Node is exported from core
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
 * A unified plugin that configures the processor for Markdown handling,
 * including parsing, GFM support, and conversion to the specified format.
 */
export const docenMarkdown: Plugin<
  [DocenMarkdownOptions?],
  any,
  Node | string // Output can be AST (if no stringifier runs) or string
> = function (options = {}) {
  const processor = this as Processor;
  const { to = "markdown" } = options;

  // Always parse and add GFM support
  processor.use(remarkParse);
  processor.use(remarkGfm);

  // Conditionally add transformation and the *correct* final stringifier
  if (to === "html") {
    processor.use(remarkRehype); // mdast -> hast
    processor.use(rehypeStringify); // hast -> html string
  }
  // Only add remarkStringify if the target is explicitly markdown (default)
  else if (to === "markdown") {
    processor.use(remarkStringify); // mdast -> markdown string
  }
  // If 'to' is something else or invalid, no stringifier is added by default,
  // which might be desired if only AST processing is needed.

  // Collaboration integration (Yjs binding) should still be handled
  // by the core DocenProcessor if enabled.
};
