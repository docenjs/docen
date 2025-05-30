/**
 * Document AST utilities
 * Pure unified.js compatible AST helpers for documents
 */

import type { Node } from "@docen/core";
import type {
  Blockquote,
  Code,
  DocumentNode,
  DocumentRoot,
  Emphasis,
  Heading,
  Image,
  InlineCode,
  Link,
  List,
  ListItem,
  Paragraph,
  PhraseContent,
  Strong,
  Text,
  ThematicBreak,
} from "../types";

/**
 * Check if a node is a document root
 */
export function isDocumentRoot(node: Node): node is DocumentRoot {
  return node.type === "root";
}

/**
 * Check if a node is a paragraph
 */
export function isParagraph(node: Node): node is Paragraph {
  return node.type === "paragraph";
}

/**
 * Check if a node is a heading
 */
export function isHeading(node: Node): node is Heading {
  return node.type === "heading";
}

/**
 * Check if a node is text
 */
export function isText(node: Node): node is Text {
  return node.type === "text";
}

/**
 * Check if a node is strong
 */
export function isStrong(node: Node): node is Strong {
  return node.type === "strong";
}

/**
 * Check if a node is emphasis
 */
export function isEmphasis(node: Node): node is Emphasis {
  return node.type === "emphasis";
}

/**
 * Check if a node is a code block
 */
export function isCode(node: Node): node is Code {
  return node.type === "code";
}

/**
 * Check if a node is inline code
 */
export function isInlineCode(node: Node): node is InlineCode {
  return node.type === "inlineCode";
}

/**
 * Check if a node is a link
 */
export function isLink(node: Node): node is Link {
  return node.type === "link";
}

/**
 * Check if a node is an image
 */
export function isImage(node: Node): node is Image {
  return node.type === "image";
}

/**
 * Check if a node is a list
 */
export function isList(node: Node): node is List {
  return node.type === "list";
}

/**
 * Check if a node is a list item
 */
export function isListItem(node: Node): node is ListItem {
  return node.type === "listItem";
}

/**
 * Check if a node is a blockquote
 */
export function isBlockquote(node: Node): node is Blockquote {
  return node.type === "blockquote";
}

/**
 * Check if a node is a thematic break
 */
export function isThematicBreak(node: Node): node is ThematicBreak {
  return node.type === "thematicBreak";
}

/**
 * Create a document root
 */
export function createDocumentRoot(
  children: DocumentNode[] = [],
): DocumentRoot {
  return {
    type: "root",
    children,
  };
}

/**
 * Create a paragraph
 */
export function createParagraph(children: PhraseContent[] = []): Paragraph {
  return {
    type: "paragraph",
    children,
  };
}

/**
 * Create a heading
 */
export function createHeading(
  depth: 1 | 2 | 3 | 4 | 5 | 6,
  children: PhraseContent[] = [],
): Heading {
  return {
    type: "heading",
    depth,
    children,
  };
}

/**
 * Create a text node
 */
export function createText(value: string): Text {
  return {
    type: "text",
    value,
  };
}

/**
 * Create a strong node
 */
export function createStrong(children: PhraseContent[] = []): Strong {
  return {
    type: "strong",
    children,
  };
}

/**
 * Create an emphasis node
 */
export function createEmphasis(children: PhraseContent[] = []): Emphasis {
  return {
    type: "emphasis",
    children,
  };
}

/**
 * Create a code block
 */
export function createCode(value: string, lang?: string, meta?: string): Code {
  return {
    type: "code",
    value,
    ...(lang && { lang }),
    ...(meta && { meta }),
  };
}

/**
 * Create inline code
 */
export function createInlineCode(value: string): InlineCode {
  return {
    type: "inlineCode",
    value,
  };
}
