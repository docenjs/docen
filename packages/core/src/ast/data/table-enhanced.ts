/**
 * Enhanced table-related AST node definitions
 *
 * This file contains definitions for enhanced table structures.
 */

import type { Node } from "../base";
import type { Table, TableCell, TableRow } from "./table";

/**
 * Table header node
 */
export interface TableHeader extends Node {
  type: "tableHeader";
  /** Header rows */
  rows: TableRow[];
  /** Header style */
  style?: {
    /** Background color */
    backgroundColor?: string;
    /** Text color */
    textColor?: string;
    /** Font weight */
    fontWeight?: string;
    /** Font style */
    fontStyle?: string;
    /** Text alignment */
    textAlign?: "left" | "center" | "right";
    /** Vertical alignment */
    verticalAlign?: "top" | "middle" | "bottom";
    /** Sticky header */
    sticky?: boolean;
  };
}

/**
 * Table footer node
 */
export interface TableFooter extends Node {
  type: "tableFooter";
  /** Footer rows */
  rows: TableRow[];
  /** Footer style */
  style?: {
    /** Background color */
    backgroundColor?: string;
    /** Text color */
    textColor?: string;
    /** Font weight */
    fontWeight?: string;
    /** Font style */
    fontStyle?: string;
    /** Text alignment */
    textAlign?: "left" | "center" | "right";
    /** Vertical alignment */
    verticalAlign?: "top" | "middle" | "bottom";
    /** Sticky footer */
    sticky?: boolean;
  };
}

/**
 * Table group node
 */
export interface TableGroup extends Node {
  type: "tableGroup";
  /** Group name */
  name: string;
  /** Group rows */
  rows: TableRow[];
  /** Group style */
  style?: {
    /** Background color */
    backgroundColor?: string;
    /** Text color */
    textColor?: string;
    /** Font weight */
    fontWeight?: string;
    /** Font style */
    fontStyle?: string;
    /** Text alignment */
    textAlign?: "left" | "center" | "right";
    /** Vertical alignment */
    verticalAlign?: "top" | "middle" | "bottom";
    /** Collapsible group */
    collapsible?: boolean;
    /** Initially collapsed */
    collapsed?: boolean;
  };
}

/**
 * Table caption node
 */
export interface TableCaption extends Node {
  type: "tableCaption";
  /** Caption text */
  text: string;
  /** Caption position */
  captionPosition?: "top" | "bottom";
  /** Caption style */
  style?: {
    /** Font size */
    fontSize?: string;
    /** Font weight */
    fontWeight?: string;
    /** Font style */
    fontStyle?: string;
    /** Text color */
    textColor?: string;
    /** Text alignment */
    textAlign?: "left" | "center" | "right";
  };
}

/**
 * Table note node
 */
export interface TableNote extends Node {
  type: "tableNote";
  /** Note text */
  text: string;
  /** Note author */
  author?: string;
  /** Note date */
  date?: Date;
  /** Note style */
  style?: {
    /** Background color */
    backgroundColor?: string;
    /** Text color */
    textColor?: string;
    /** Font size */
    fontSize?: string;
    /** Font weight */
    fontWeight?: string;
    /** Font style */
    fontStyle?: string;
  };
}

/**
 * Table style node
 */
export interface TableStyle extends Node {
  type: "tableStyle";
  /** Style name */
  name: string;
  /** Style properties */
  properties: {
    /** Table style */
    tableStyle?: {
      /** Background color */
      backgroundColor?: string;
      /** Border */
      border?: {
        style?: string;
        width?: number;
        color?: string;
      };
    };
    /** Header style */
    headerStyle?: {
      /** Background color */
      backgroundColor?: string;
      /** Text color */
      textColor?: string;
      /** Font weight */
      fontWeight?: string;
      /** Font style */
      fontStyle?: string;
      /** Text alignment */
      textAlign?: "left" | "center" | "right";
      /** Vertical alignment */
      verticalAlign?: "top" | "middle" | "bottom";
    };
    /** Row style */
    rowStyle?: {
      /** Background color */
      backgroundColor?: string;
      /** Text color */
      textColor?: string;
      /** Font weight */
      fontWeight?: string;
      /** Font style */
      fontStyle?: string;
      /** Text alignment */
      textAlign?: "left" | "center" | "right";
      /** Vertical alignment */
      verticalAlign?: "top" | "middle" | "bottom";
    };
    /** Alternating row style */
    alternatingRowStyle?: {
      /** Background color */
      backgroundColor?: string;
      /** Text color */
      textColor?: string;
      /** Font weight */
      fontWeight?: string;
      /** Font style */
      fontStyle?: string;
      /** Text alignment */
      textAlign?: "left" | "center" | "right";
      /** Vertical alignment */
      verticalAlign?: "top" | "middle" | "bottom";
    };
  };
}

/**
 * Table theme node
 */
export interface TableTheme extends Node {
  type: "tableTheme";
  /** Theme name */
  name: string;
  /** Theme colors */
  colors: {
    /** Primary color */
    primary: string;
    /** Secondary color */
    secondary: string;
    /** Accent color */
    accent: string;
    /** Background color */
    background: string;
    /** Text color */
    text: string;
    /** Border color */
    border: string;
  };
  /** Theme fonts */
  fonts: {
    /** Heading font */
    heading: string;
    /** Body font */
    body: string;
  };
}

/**
 * Enhanced table node
 */
export interface TableEnhanced extends Omit<Table, "caption"> {
  type: "table";
  /** Table header */
  header?: TableHeader;
  /** Table footer */
  footer?: TableFooter;
  /** Table groups */
  groups?: TableGroup[];
  /** Table caption (enhanced) */
  caption?: TableCaption;
  /** Table notes */
  notes?: TableNote[];
  /** Table theme */
  theme?: TableTheme;
  /** Table styles */
  tableStyle?: TableStyle;
}
