/**
 * Spreadsheet-related AST node definitions
 *
 * This file contains definitions for spreadsheet-specific structures.
 */

import type { Node } from "../base";
import type { Comment } from "../document/structure";

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
  /** Cell data type */
  dataType?: "string" | "number" | "boolean" | "date" | "error" | "blank";
  /** Cell style */
  style?: {
    /** Background color */
    backgroundColor?: string;
    /** Text color */
    textColor?: string;
    /** Font */
    font?: string;
    /** Font size */
    fontSize?: number;
    /** Font weight */
    fontWeight?: string;
    /** Font style */
    fontStyle?: string;
    /** Text alignment */
    textAlign?: "left" | "center" | "right" | "justify";
    /** Vertical alignment */
    verticalAlign?: "top" | "middle" | "bottom";
    /** Text wrap */
    textWrap?: boolean;
    /** Text rotation */
    textRotation?: number;
    /** Border */
    border?: {
      top?: {
        style?: string;
        width?: number;
        color?: string;
      };
      right?: {
        style?: string;
        width?: number;
        color?: string;
      };
      bottom?: {
        style?: string;
        width?: number;
        color?: string;
      };
      left?: {
        style?: string;
        width?: number;
        color?: string;
      };
    };
    /** Number format */
    numberFormat?: string;
  };
  /** Cell comments */
  comments?: Comment[];
  /** Cell hyperlink */
  hyperlink?: string;
  /** Cell validation */
  validation?: {
    /** Validation type */
    type?: "list" | "number" | "date" | "time" | "text" | "custom";
    /** Validation criteria */
    criteria?: string;
    /** Validation minimum */
    minimum?: number | Date;
    /** Validation maximum */
    maximum?: number | Date;
    /** Validation list */
    list?: string[];
    /** Error message */
    errorMessage?: string;
  };
  /** Cell protection */
  protection?: {
    /** Cell is locked */
    locked?: boolean;
    /** Cell formula is hidden */
    formulaHidden?: boolean;
  };
  /** Cell merged across multiple cells */
  merged?: boolean;
  /** Cell merge range */
  mergeRange?: string;
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
  /** Row hidden */
  hidden?: boolean;
  /** Row style */
  style?: {
    /** Background color */
    backgroundColor?: string;
    /** Text color */
    textColor?: string;
    /** Font */
    font?: string;
    /** Font size */
    fontSize?: number;
  };
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
  /** Column hidden */
  hidden?: boolean;
  /** Column style */
  style?: {
    /** Background color */
    backgroundColor?: string;
    /** Text color */
    textColor?: string;
    /** Font */
    font?: string;
    /** Font size */
    fontSize?: number;
    /** Text alignment */
    textAlign?: "left" | "center" | "right" | "justify";
  };
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
  /** Sheet protection */
  protection?: {
    /** Sheet is protected */
    protected?: boolean;
    /** Password hash */
    passwordHash?: string;
    /** Allow select locked cells */
    selectLockedCells?: boolean;
    /** Allow select unlocked cells */
    selectUnlockedCells?: boolean;
    /** Allow format cells */
    formatCells?: boolean;
    /** Allow format columns */
    formatColumns?: boolean;
    /** Allow format rows */
    formatRows?: boolean;
    /** Allow insert columns */
    insertColumns?: boolean;
    /** Allow insert rows */
    insertRows?: boolean;
    /** Allow insert hyperlinks */
    insertHyperlinks?: boolean;
    /** Allow delete columns */
    deleteColumns?: boolean;
    /** Allow delete rows */
    deleteRows?: boolean;
    /** Allow sort */
    sort?: boolean;
    /** Allow filter */
    filter?: boolean;
    /** Allow use pivot tables */
    usePivotTables?: boolean;
  };
  /** Sheet gridlines shown */
  gridlinesVisible?: boolean;
  /** Sheet zoom level */
  zoom?: number;
  /** Sheet content */
  children: (Row | Column)[];
  /** Sheet metadata */
  metadata?: {
    /** Sheet title */
    title?: string;
    /** Sheet subject */
    subject?: string;
    /** Sheet author */
    author?: string;
    /** Sheet manager */
    manager?: string;
    /** Sheet company */
    company?: string;
    /** Sheet category */
    category?: string;
    /** Sheet keywords */
    keywords?: string[];
    /** Sheet comments */
    comments?: string;
    /** Sheet status */
    status?: string;
  };
}
