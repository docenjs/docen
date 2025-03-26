/**
 * List-related AST node definitions
 *
 * This file contains definitions for list and list item nodes.
 */

import type { Node } from "../base";
// Use forward references for circular dependencies
// This works because TypeScript only needs the names for type checking
type Block = import("./index").Block;
import type { Inline } from "./text";

/**
 * List node (ordered or unordered)
 */
export interface List extends Node {
  type: "list";
  /** Whether the list is ordered */
  ordered: boolean;
  /** Starting number for ordered lists */
  start?: number;
  /** List style */
  listStyle?:
    | "disc"
    | "circle"
    | "square"
    | "decimal"
    | "lower-alpha"
    | "upper-alpha"
    | "lower-roman"
    | "upper-roman";
  /** Is this a task list */
  isTaskList?: boolean;
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
  /** List item level (for nested lists) */
  level?: number;
  /** List item content */
  children: (Block | Inline)[];
}
