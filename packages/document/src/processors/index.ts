/**
 * Document processors using unified.js
 * Pure format processing with bottom-level utilities
 */

import { createProcessor } from "@docen/core";
import type { DocenProcessor, DocenRoot } from "@docen/core";
import type { DocumentProcessorOptions } from "../types";

import { fromHtml } from "hast-util-from-html";
import { toHtml } from "hast-util-to-html";
import { toMdast } from "hast-util-to-mdast";
// Bottom-level utilities for better compatibility
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { toMarkdown } from "mdast-util-to-markdown";

import { gfmFromMarkdown, gfmToMarkdown } from "mdast-util-gfm";
// GFM support
import { gfm } from "micromark-extension-gfm";

import type { Root as HastRoot } from "hast";
import type { Root as MdastRoot } from "mdast";

/**
 * Create a Markdown processor with GFM support
 */
export function createMarkdownProcessor(
  options: Partial<DocumentProcessorOptions> = {},
): DocenProcessor {
  const processor = createProcessor();

  // Configure for markdown processing
  processor.parser = (doc: string) => {
    const extensions = options.gfm ? [gfm()] : [];
    const mdastExtensions = options.gfm ? [gfmFromMarkdown()] : [];

    return fromMarkdown(doc, {
      extensions,
      mdastExtensions,
    });
  };

  processor.compiler = (tree: DocenRoot) => {
    const mdastExtensions = options.gfm ? [gfmToMarkdown()] : [];

    return toMarkdown(tree as MdastRoot, {
      extensions: mdastExtensions,
      bullet: "-",
      emphasis: "_",
      strong: "*",
    });
  };

  return processor;
}

/**
 * Create an HTML processor
 */
export function createHtmlProcessor(
  options: Partial<DocumentProcessorOptions> = {},
): DocenProcessor {
  const processor = createProcessor();

  // Configure for HTML processing
  processor.parser = (doc: string) => fromHtml(doc, { fragment: true });

  processor.compiler = (tree: DocenRoot) => toHtml(tree as HastRoot);

  return processor;
}

/**
 * Create a Markdown-to-HTML processor
 */
export function createMarkdownToHtmlProcessor(
  options: Partial<DocumentProcessorOptions> = {},
): DocenProcessor {
  const processor = createProcessor();

  processor.parser = (doc: string) => {
    const extensions = options.gfm ? [gfm()] : [];
    const mdastExtensions = options.gfm ? [gfmFromMarkdown()] : [];

    return fromMarkdown(doc, {
      extensions,
      mdastExtensions,
    });
  };

  processor.compiler = (tree: DocenRoot) => {
    const hast = toHast(tree as MdastRoot);
    return toHtml(hast);
  };

  return processor;
}

/**
 * Create an HTML-to-Markdown processor
 */
export function createHtmlToMarkdownProcessor(
  options: Partial<DocumentProcessorOptions> = {},
): DocenProcessor {
  const processor = createProcessor();

  processor.parser = (doc: string) => fromHtml(doc, { fragment: true });

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

  return processor;
}

/**
 * Auto-detect format and create appropriate processor
 */
export function createDocumentProcessor(
  format: "markdown" | "html" | "markdown-to-html" | "html-to-markdown",
  options: Partial<DocumentProcessorOptions> = {},
): DocenProcessor {
  switch (format) {
    case "markdown":
      return createMarkdownProcessor(options);
    case "html":
      return createHtmlProcessor(options);
    case "markdown-to-html":
      return createMarkdownToHtmlProcessor(options);
    case "html-to-markdown":
      return createHtmlToMarkdownProcessor(options);
    default:
      throw new Error(`Unsupported document format: ${format}`);
  }
}
