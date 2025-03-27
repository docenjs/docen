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

import type { List } from "./list";
import type { Image, InlineImage, Link, Shape } from "./media";
import type {
  BlockQuote,
  Code,
  Comment,
  Field,
  Section,
  ThematicBreak,
} from "./structure";
// Import types for type definitions
import type { Heading, Paragraph, Text, Inline as TextInline } from "./text";

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
  | Comment
  | Field
  | Shape;

/**
 * Extended inline content that includes both text inlines and media inlines
 */
export type Inline = TextInline | Link | InlineImage;

/**
 * All document content types
 *
 * This union type combines all document content types, used for uniform processing in processors
 */
export type DocumentContent = Block | Inline;

// Override the Inline type from text.ts with our extended version
declare module "./text" {
  interface Paragraph {
    children: Inline[];
  }
  interface Heading {
    children: Inline[];
  }
  interface Emphasis {
    children: Inline[];
  }
  interface Strong {
    children: Inline[];
  }
}
