import type { Node } from "@docen/core"; // Assuming Node is exported from core
import type { Schema } from "hast-util-sanitize";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import type { Plugin, Processor } from "unified";

/**
 * Options for the docenHtml plugin.
 */
export interface DocenHtmlOptions {
  /**
   * Configuration for rehype-parse.
   * Set to `true` (default) to parse HTML fragments,
   * set to `false` to parse as a full document.
   * @default true
   */
  fragment?: boolean;
  /**
   * Configuration for rehype-sanitize.
   * Set to `false` to disable sanitization,
   * or provide a custom schema object.
   * @default defaultSchema
   */
  sanitize?: Schema | false;
  /**
   * Specify the target output format.
   * 'html': Output as HTML string (default).
   * 'markdown': Output as Markdown string.
   * @default 'html'
   */
  to?: "html" | "markdown";
}

/**
 * A unified plugin that configures the processor for HTML handling,
 * including parsing, sanitization, and conversion to the specified format.
 */
export const docenHtml: Plugin<
  [DocenHtmlOptions?],
  any,
  Node | string // Output can be AST or string
> = function (options = {}) {
  const processor = this as Processor;
  const { fragment = true, sanitize = defaultSchema, to = "html" } = options;

  // 1. Parsing & Sanitization
  processor.use(rehypeParse, { fragment });
  if (sanitize !== false) {
    processor.use(rehypeSanitize, sanitize);
  }

  // 2. Conditionally add transformation and the *correct* final stringifier
  if (to === "markdown") {
    processor.use(rehypeRemark); // hast -> mdast
    processor.use(remarkGfm); // Add GFM support for stringification
    processor.use(remarkStringify); // mdast -> markdown string
  }
  // Only add rehypeStringify if the target is explicitly html (default)
  else if (to === "html") {
    processor.use(rehypeStringify); // hast -> html string
  }
  // If 'to' is something else or invalid, no stringifier is added by default.

  // Collaboration integration handled by core processor.
};
