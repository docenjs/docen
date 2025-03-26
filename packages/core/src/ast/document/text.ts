/**
 * Text-related AST node definitions
 *
 * This file contains definitions for textual content nodes such as
 * paragraphs, headings, and inline text elements.
 */

import type { Node } from "../base";

/**
 * Paragraph node
 */
export interface Paragraph extends Node {
  type: "paragraph";
  /** Inline content within the paragraph */
  children: Inline[];
}

/**
 * Heading node
 */
export interface Heading extends Node {
  type: "heading";
  /** Heading level (1-6) */
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  /** Inline content within the heading */
  children: Inline[];
  /** Anchor ID for linking */
  id?: string;
  /** Is this heading collapsible */
  collapsible?: boolean;
  /** Is this heading collapsed by default */
  collapsed?: boolean;
}

/**
 * Text node representing plain text content
 */
export interface Text extends Node {
  type: "text";
  /** Text content */
  value: string;
}

/**
 * Emphasis (italic) node
 */
export interface Emphasis extends Node {
  type: "emphasis";
  /** Emphasized content */
  children: Inline[];
}

/**
 * Strong (bold) node
 */
export interface Strong extends Node {
  type: "strong";
  /** Strong content */
  children: Inline[];
}

/**
 * Line break node
 */
export interface LineBreak extends Node {
  type: "break";
}

/**
 * Inline code node
 */
export interface InlineCode extends Node {
  type: "inlineCode";
  /** Code content */
  value: string;
}

/**
 * Type for all inline content
 */
export type Inline = Text | Emphasis | Strong | InlineCode | LineBreak;
