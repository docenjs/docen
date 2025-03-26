/**
 * Document structure AST node definitions
 *
 * This file contains definitions for document structural elements like
 * sections, blockquotes, code blocks, etc.
 */

import type { Node } from "../base";
import type { Block } from "./index";
import type { Inline } from "./text";

/**
 * Section node for document sections
 */
export interface Section extends Node {
  type: "section";
  /** Section ID */
  id?: string;
  /** Section title */
  title?: string;
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
    /** Section header */
    header?: {
      default?: boolean;
      firstPage?: boolean;
      evenPage?: boolean;
    };
    /** Section footer */
    footer?: {
      default?: boolean;
      firstPage?: boolean;
      evenPage?: boolean;
    };
  };
  /** Section content */
  children: Block[];
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
  /** Line numbers should be shown */
  showLineNumbers?: boolean;
  /** Highlight specific lines */
  highlightedLines?: number[];
  /** Additional annotations */
  annotations?: Array<{
    /** Line number */
    line: number;
    /** Annotation text */
    text: string;
    /** Annotation type */
    type?: "info" | "warning" | "error" | "note";
  }>;
}

/**
 * Block quote node
 */
export interface BlockQuote extends Node {
  type: "blockquote";
  /** Quote content */
  children: Block[];
  /** Quote attribution */
  attribution?: string;
  /** Quote source */
  source?: string;
}

/**
 * Thematic break (horizontal rule) node
 */
export interface ThematicBreak extends Node {
  type: "thematicBreak";
  /** Rule style - store as data property to avoid style conflict */
  data?: {
    lineStyle?: "solid" | "dashed" | "dotted" | "double";
  };
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
  /** Comment thread ID */
  threadId?: string;
  /** Is this comment resolved */
  resolved?: boolean;
  /** Comment content */
  children: Block[];
}

/**
 * Field node for document fields
 */
export interface Field extends Node {
  type: "field";
  /** Field type */
  fieldType: string;
  /** Field properties */
  properties?: Record<string, unknown>;
  /** Field content */
  children: (Block | Inline)[];
}
