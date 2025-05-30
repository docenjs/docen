/**
 * Document processing types
 * Pure unified.js compatible types for text documents
 */

import type { Node } from "@docen/core";
import type { RootContent as HastContent, Root as HastRoot } from "hast";
import type { RootContent as MdastContent, Root as MdastRoot } from "mdast";

// --- Re-export standard AST types ---

export type { MdastRoot, MdastContent, HastRoot, HastContent };

// --- Input/Output format types ---

export type InputFormat = "markdown" | "html";
export type OutputFormat = "markdown" | "html" | "mdast" | "hast";

// --- Processor configuration ---

export interface ProcessorConfig {
  input: InputFormat;
  output: OutputFormat;
  gfm?: boolean;
  frontmatter?: boolean;
  math?: boolean;
  footnotes?: boolean;
}

export interface DocumentProcessorOptions {
  gfm?: boolean;
  frontmatter?: boolean;
  math?: boolean;
  footnotes?: boolean;
}

// --- Document root types for unified.js compatibility ---

export interface DocumentRoot extends Node {
  type: "root";
  children: MdastContent[] | HastContent[];
}
