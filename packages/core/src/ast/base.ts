/**
 * AST (Abstract Syntax Tree) base types and interfaces
 *
 * This file defines the core AST structure and base interfaces
 * that all other node types extend.
 */

/**
 * Base node types enumeration
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
  | "audio" // New type for audio content
  | "video" // New type for video content
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
  | "custom"
  | "math"
  | "mathBlock"
  | "mathInline"
  | "chartBar"
  | "chartLine"
  | "chartPie"
  | "chartScatter"
  | "chartArea"
  | "chartRadar"
  | "smartArtOrgChart"
  | "smartArtProcess"
  | "smartArtCycle"
  | "smartArtPyramid"
  | "smartArtMatrix"
  | "smartArtVenn"
  | "tableHeader"
  | "tableFooter"
  | "tableGroup"
  | "tableCaption"
  | "tableNote"
  | "tableFormula"
  | "tableConditionalFormat"
  | "tablePivotTable"
  | "tableChart"
  | "tableFilter"
  | "tableSort"
  | "tableValidation"
  | "tableProtection"
  | "tableStyle"
  | "tableTheme"
  | "tableTemplate"
  | "tableCustom"
  | "container" // Generic container
  | "archiveContainer" // Archive file container
  | "epubContainer" // EPUB file container
  | "ooxmlContainer"; // OOXML file container

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
  style?: Record<string, unknown>;
  /** Language information */
  lang?: string;
  /** Custom attributes */
  attributes?: Record<string, string>;
  /** Localization properties */
  localization?: {
    /** ISO language code */
    language?: string;
    /** Text direction */
    direction?: "ltr" | "rtl";
    /** Regional format */
    region?: string;
  };
}

/**
 * Parent node interface for nodes that can contain children
 */
export interface Parent extends Node {
  /** Child nodes */
  children: Node[];
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
export interface Root extends Parent {
  type: "root";
  /** Child nodes */
  children: Content[];
  /** Document version information */
  version?: string;
  /** Metadata for the root */
  metadata?: Record<string, unknown>;
}

/**
 * Content node types that can appear as children of various containers
 */
export type Content = Node; // This will be refined in index.ts with union types

/**
 * Metadata interface for document metadata
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
  /** Document version */
  version?: string;
  /** Document identifier */
  identifier?: string;
  /** Document publisher */
  publisher?: string;
  /** Document license */
  license?: string;
  /** Document security information */
  security?: {
    /** Is the document encrypted */
    encrypted?: boolean;
    /** Access rights */
    accessRights?: string[];
    /** Digital signature information */
    signature?: {
      /** Signature method */
      method?: string;
      /** Signature date */
      date?: Date;
      /** Signature author */
      author?: string;
    };
  };
  /** Additional metadata fields */
  [key: string]: unknown;
}

/**
 * Document interface representing a complete document
 */
export interface Document {
  /** Document metadata */
  metadata: Metadata;
  /** Document content */
  content: Root;
}
