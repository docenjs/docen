import type { Node } from "@docen/core"; // Assuming Node is exported from core
import type { Root as HastRoot } from "hast"; // Import HastRoot
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import rehypeSanitize, {
  defaultSchema,
  type Options as Schema,
} from "rehype-sanitize";
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
 * A unified plugin that configures the processor for HTML handling.
 * NOTE: Uses internal .use calls, which is non-standard.
 * Signature adjusted to primarily declare HastRoot output for type compatibility.
 */
export const docenHtml: Plugin<
  [DocenHtmlOptions?],
  string, // Input should be string for a parser-centric plugin
  HastRoot // Declare HastRoot as the primary AST output
> = function (options = {}) {
  const processor = this as Processor;
  const { fragment = true, sanitize = defaultSchema, to = "html" } = options;

  // Internal .use calls (still non-standard but kept as requested)
  processor.use(rehypeParse, { fragment });
  if (sanitize !== false) {
    processor.use(rehypeSanitize, sanitize);
  }

  // Conditional transformers/stringifiers
  if (to === "markdown") {
    processor.use(rehypeRemark);
    processor.use(remarkGfm);
    processor.use(remarkStringify);
  } else if (to === "html") {
    processor.use(rehypeStringify);
  }
  // If neither, the output *is* HastRoot

  // Collaboration integration handled by core processor.
};
