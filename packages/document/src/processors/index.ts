/**
 * Document processors using unified.js
 * Flexible input/output format processing
 */

import { createProcessor } from "@docen/core";
import type { DocenProcessor, DocenRoot } from "@docen/core";
import type { DocumentProcessorOptions, HastRoot, MdastRoot } from "../types";

import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { toMdast } from "hast-util-to-mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { toMarkdown } from "mdast-util-to-markdown";

import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";

/**
 * Create a markdown processor with configurable output
 */
export function createMarkdownProcessor(
  output: "markdown" | "html" | "ast" = "markdown",
  options: Partial<DocumentProcessorOptions> = {},
): DocenProcessor {
  const processor = createProcessor();

  // Configure for markdown parsing
  processor.parser = (doc: string) => {
    const extensions = options.gfm ? [gfm()] : [];
    const mdastExtensions = options.gfm ? [gfmFromMarkdown()] : [];

    return fromMarkdown(doc, {
      extensions,
      mdastExtensions,
    });
  };

  // Configure output based on format
  switch (output) {
    case "markdown":
      processor.compiler = (tree: DocenRoot) => {
        const mdastExtensions = options.gfm ? [gfmToMarkdown()] : [];

        return toMarkdown(tree as MdastRoot, {
          extensions: mdastExtensions,
          bullet: "-",
          emphasis: "_",
          strong: "*",
        });
      };
      break;

    case "html":
      processor.compiler = (tree: DocenRoot) => {
        const hast = toHast(tree as MdastRoot);
        return toHtml(hast);
      };
      break;

    case "ast":
      processor.compiler = (tree: DocenRoot) => {
        return JSON.stringify(tree, null, 2);
      };
      break;
  }

  return processor;
}

/**
 * Create an HTML processor with configurable output
 */
export function createHtmlProcessor(
  output: "html" | "markdown" | "ast" = "html",
  options: Partial<DocumentProcessorOptions> = {},
): DocenProcessor {
  const processor = createProcessor();

  // Configure for HTML parsing
  processor.parser = (doc: string) => fromHtml(doc, { fragment: true });

  // Configure output based on format
  switch (output) {
    case "html":
      processor.compiler = (tree: DocenRoot) => toHtml(tree as HastRoot);
      break;

    case "markdown":
      processor.compiler = (tree: DocenRoot) => {
        const mdast = toMdast(tree as HastRoot);
        const mdastExtensions = options.gfm ? [gfmToMarkdown()] : [];

        return toMarkdown(mdast, {
          extensions: mdastExtensions,
          bullet: "-",
          emphasis: "_",
          strong: "*",
        });
      };
      break;

    case "ast":
      processor.compiler = (tree: DocenRoot) => {
        return JSON.stringify(tree, null, 2);
      };
      break;
  }

  return processor;
}

/**
 * Auto-detect format and create appropriate processor
 */
export function createDocumentProcessor(
  format: "markdown" | "html",
  options: Partial<DocumentProcessorOptions> = {},
): DocenProcessor {
  switch (format) {
    case "markdown":
      return createMarkdownProcessor("markdown", options);
    case "html":
      return createHtmlProcessor("html", options);
    default:
      throw new Error(`Unsupported document format: ${format}`);
  }
}
