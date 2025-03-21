/**
 * AST (Abstract Syntax Tree) definitions for Docen
 *
 * This file defines the core AST structure that represents various document types
 * in a unified format, allowing for consistent processing across different formats.
 */

/**
 * Base node types
 */
export type NodeType =
  | "root"
  | "paragraph"
  | "heading"
  | "text"
  | "emphasis"
  | "strong"
  | "link"
  | "list"
  | "listItem"
  | "table"
  | "tableRow"
  | "tableCell"
  | "code"
  | "inlineCode"
  | "blockquote"
  | "thematicBreak"
  | "break"
  | "image"
  | "inlineImage"
  | "media"
  | "section"
  | "comment"
  | "field"
  | "shape"
  | "chart"
  | "smartArt"
  | "equation"
  | "cell"
  | "row"
  | "column"
  | "sheet"
  | "slide"
  | "slideLayout"
  | "slideMaster"
  | "theme"
  | "style"
  | "template"
  | "custom";

/**
 * Base node interface that all AST nodes must implement
 */
export interface Node {
  /** Type of the node */
  type: NodeType;
  /** Position information (optional) */
  position?: Position;
  /** Custom data that can be attached to the node */
  data?: Record<string, unknown>;
  /** Style information */
  style?: Record<string, string>;
  /** Language information */
  lang?: string;
  /** Custom attributes */
  attributes?: Record<string, string>;
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
export type Content =
  | Block
  | Inline
  | Section
  | Comment
  | Field
  | Shape
  | Chart
  | SmartArt
  | Equation
  | Cell
  | Row
  | Column
  | Sheet
  | Slide;

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
 * Media node
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
}

/**
 * Section node for document sections
 */
export interface Section extends Node {
  type: "section";
  /** Section properties */
  properties?: {
    pageSize?: {
      width: number;
      height: number;
      orientation?: "portrait" | "landscape";
    };
    margins?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
      header: number;
      footer: number;
      gutter: number;
    };
    columns?: {
      count: number;
      space?: number;
      equalWidth?: boolean;
    };
  };
  /** Section content */
  children: Content[];
}

/**
 * Comment node for document comments
 */
export interface Comment extends Node {
  type: "comment";
  /** Comment author */
  author?: string;
  /** Comment date */
  date?: Date;
  /** Comment content */
  children: Content[];
}

/**
 * Field node for document fields
 */
export interface Field extends Node {
  type: "field";
  /** Field type */
  fieldType: string;
  /** Field properties */
  properties?: Record<string, string>;
  /** Field content */
  children: Content[];
}

/**
 * Shape node for drawings and shapes
 */
export interface Shape extends Node {
  type: "shape";
  /** Shape type */
  shapeType: string;
  /** Shape properties */
  properties?: {
    width?: number;
    height?: number;
    position?: {
      x: number;
      y: number;
    };
    rotation?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
  /** Shape content */
  children: Content[];
}

/**
 * Chart node for charts
 */
export interface Chart extends Node {
  type: "chart";
  /** Chart type */
  chartType: string;
  /** Chart data */
  data?: Record<string, unknown>;
  /** Chart options */
  options?: Record<string, unknown>;
}

/**
 * SmartArt node for SmartArt graphics
 */
export interface SmartArt extends Node {
  type: "smartArt";
  /** SmartArt type */
  smartArtType: string;
  /** SmartArt data */
  data?: Record<string, unknown>;
}

/**
 * Equation node for mathematical equations
 */
export interface Equation extends Node {
  type: "equation";
  /** Equation content */
  content: string;
  /** Equation format */
  format?: string;
}

/**
 * Cell node for spreadsheet cells
 */
export interface Cell extends Node {
  type: "cell";
  /** Cell reference (e.g., A1, B2) */
  reference?: string;
  /** Cell value */
  value?: string | number | boolean | Date;
  /** Cell formula */
  formula?: string;
  /** Cell format */
  format?: string;
  /** Cell comments */
  comments?: Comment[];
}

/**
 * Row node for spreadsheet rows
 */
export interface Row extends Node {
  type: "row";
  /** Row number */
  number?: number;
  /** Row height */
  height?: number;
  /** Row cells */
  children: Cell[];
}

/**
 * Column node for spreadsheet columns
 */
export interface Column extends Node {
  type: "column";
  /** Column letter */
  letter?: string;
  /** Column width */
  width?: number;
}

/**
 * Sheet node for spreadsheet sheets
 */
export interface Sheet extends Node {
  type: "sheet";
  /** Sheet name */
  name: string;
  /** Sheet visibility */
  visibility?: "visible" | "hidden" | "veryHidden";
  /** Sheet content */
  children: (Row | Column)[];
}

/**
 * Slide node for presentation slides
 */
export interface Slide extends Node {
  type: "slide";
  /** Slide number */
  number?: number;
  /** Slide layout */
  layout?: string;
  /** Slide notes */
  notes?: string;
  /** Slide content */
  children: Content[];
}

/**
 * Metadata interface
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
 * Document interface
 */
export interface Document {
  /** Document metadata */
  metadata: Metadata;
  /** Document content */
  content: Root;
}
