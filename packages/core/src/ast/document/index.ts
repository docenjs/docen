/**
 * Document AST node exports
 *
 * This file exports all document-related node types.
 */

// Re-export all document-related types
export * from "./text";
export * from "./list";
export * from "./media";
export * from "./structure";

// Import types for type definitions
import type {
  Emphasis,
  Heading,
  Inline,
  InlineCode,
  LineBreak,
  Paragraph,
  Strong,
  Text,
} from "./text";

import type { List, ListItem } from "./list";

import type { Image, InlineImage, Link, Shape } from "./media";

import type {
  BlockQuote,
  Code,
  Comment,
  Field,
  Section,
  ThematicBreak,
} from "./structure";

/**
 * Block-level content
 */
export type Block =
  | Paragraph
  | Heading
  | List
  | Code
  | BlockQuote
  | ThematicBreak
  | Image
  | Section
  | Comment;

/**
 * All document content types
 */
export type DocumentContent = Block | Inline;
