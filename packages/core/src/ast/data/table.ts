/**
 * Table-related AST node definitions
 *
 * This file contains definitions for basic table structures.
 */

import type { Node } from "../base";
import type { Inline } from "../document/text";

/**
 * Table node
 */
export interface Table extends Node {
  type: "table";
  /** Table alignment for each column */
  align?: Array<"left" | "right" | "center" | null>;
  /** Table rows */
  children: TableRow[];
  /** Table caption */
  caption?: string;
  /** Table ID */
  id?: string;
}

/**
 * Table row node
 */
export interface TableRow extends Node {
  type: "tableRow";
  /** Table cells in this row */
  children: TableCell[];
  /** Row height */
  height?: number;
}

/**
 * Table cell node
 */
export interface TableCell extends Node {
  type: "tableCell";
  /** Cell content */
  children: Inline[];
  /** Is this a header cell */
  isHeader?: boolean;
  /** Column span */
  colspan?: number;
  /** Row span */
  rowspan?: number;
  /** Cell background color */
  backgroundColor?: string;
  /** Cell text color */
  textColor?: string;
  /** Cell alignment */
  align?: "left" | "center" | "right";
  /** Cell vertical alignment */
  verticalAlign?: "top" | "middle" | "bottom";
  /** Cell width */
  width?: number;
  /** Cell border */
  border?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
    color?: string;
    width?: number;
    style?: "solid" | "dashed" | "dotted";
  };
}
