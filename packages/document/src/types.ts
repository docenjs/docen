/**
 * Document processing types
 * Re-exports standard mdast/hast types for convenience
 */

// --- Re-export standard AST types ---
export type {
  Root as MdastRoot,
  RootContent as MdastContent,
  Content as MdastNode,
} from "mdast";

export type {
  Root as HastRoot,
  RootContent as HastContent,
  Content as HastNode,
} from "hast";

// --- Format types ---
export type InputFormat = "markdown" | "html";
export type OutputFormat = "markdown" | "html" | "ast";

// --- Processor configuration ---
export interface DocumentProcessorOptions {
  gfm?: boolean;
  frontmatter?: boolean;
  math?: boolean;
  footnotes?: boolean;
}
