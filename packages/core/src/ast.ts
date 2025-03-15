/**
 * AST (Abstract Syntax Tree) definitions for Docen
 *
 * This file defines the core AST structure that represents various document types
 * in a unified format, allowing for consistent processing across different formats.
 */

/**
 * Base node interface that all AST nodes must implement
 */
export interface Node {
  /** Type of the node */
  type: string;
  /** Position information (optional) */
  position?: Position;
  /** Custom data that can be attached to the node */
  data?: Record<string, unknown>;
}

/**
 * Position information for a node in the source document
 */
export interface Position {
  /** Start position */
  start?: Point;
  /** End position */
  end?: Point;
  /** Source document identifier */
  source?: string;
}

/**
 * Point in a document (line and column)
 */
export interface Point {
  /** Line number (1-indexed) */
  line: number;
  /** Column number (1-indexed) */
  column: number;
  /** Character offset (0-indexed) */
  offset?: number;
}

/**
 * Root document node that contains all other nodes
 */
export interface Root extends Node {
  type: "root";
  /** Child nodes */
  children: Content[];
}

/**
 * Content node types that can appear as children of various containers
 */
export type Content = Block | Inline;

/**
 * Block-level content
 */
export type Block =
  | Paragraph
  | Heading
  | List
  | Table
  | Code
  | BlockQuote
  | ThematicBreak
  | Image
  | Media;

/**
 * Inline-level content
 */
export type Inline =
  | Text
  | Emphasis
  | Strong
  | Link
  | InlineCode
  | InlineImage
  | LineBreak;

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
 * Link node
 */
export interface Link extends Node {
  type: "link";
  /** Link URL */
  url: string;
  /** Link title (optional) */
  title?: string;
  /** Link content */
  children: Inline[];
}

/**
 * List node (ordered or unordered)
 */
export interface List extends Node {
  type: "list";
  /** Whether the list is ordered */
  ordered: boolean;
  /** Starting number for ordered lists */
  start?: number;
  /** List items */
  children: ListItem[];
}

/**
 * List item node
 */
export interface ListItem extends Node {
  type: "listItem";
  /** Whether the item is checked (for task lists) */
  checked?: boolean;
  /** List item content */
  children: (Block | Inline)[];
}

/**
 * Table node
 */
export interface Table extends Node {
  type: "table";
  /** Table alignment for each column */
  align?: Array<"left" | "right" | "center" | null>;
  /** Table rows */
  children: TableRow[];
}

/**
 * Table row node
 */
export interface TableRow extends Node {
  type: "tableRow";
  /** Table cells in this row */
  children: TableCell[];
}

/**
 * Table cell node
 */
export interface TableCell extends Node {
  type: "tableCell";
  /** Cell content */
  children: Inline[];
}

/**
 * Code block node
 */
export interface Code extends Node {
  type: "code";
  /** Programming language of the code */
  lang?: string;
  /** Additional metadata */
  meta?: string;
  /** Code content */
  value: string;
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
 * Block quote node
 */
export interface BlockQuote extends Node {
  type: "blockquote";
  /** Quote content */
  children: Block[];
}

/**
 * Thematic break (horizontal rule) node
 */
export interface ThematicBreak extends Node {
  type: "thematicBreak";
}

/**
 * Line break node
 */
export interface LineBreak extends Node {
  type: "break";
}

/**
 * Image node
 */
export interface Image extends Node {
  type: "image";
  /** Image URL */
  url: string;
  /** Image alt text */
  alt?: string;
  /** Image title */
  title?: string;
}

/**
 * Inline image node
 */
export interface InlineImage extends Node {
  type: "inlineImage";
  /** Image URL */
  url: string;
  /** Image alt text */
  alt?: string;
  /** Image title */
  title?: string;
}

/**
 * Media node (audio, video, etc.)
 */
export interface Media extends Node {
  type: "media";
  /** Media type (audio, video, etc.) */
  mediaType: string;
  /** Media URL */
  url: string;
  /** Media alt text */
  alt?: string;
  /** Media title */
  title?: string;
  /** Additional attributes */
  attributes?: Record<string, string>;
}

/**
 * Document metadata
 */
export interface Metadata {
  /** Document title */
  title?: string;
  /** Document authors */
  authors?: string[];
  /** Document creation date */
  created?: Date;
  /** Document last modified date */
  modified?: Date;
  /** Document description */
  description?: string;
  /** Document keywords */
  keywords?: string[];
  /** Document language */
  language?: string;
  /** Additional metadata fields */
  [key: string]: unknown;
}

/**
 * Complete document with metadata and content
 */
export interface Document {
  /** Document metadata */
  metadata: Metadata;
  /** Document content */
  content: Root;
}
