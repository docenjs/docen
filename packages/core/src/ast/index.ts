/**
 * AST module for Docen
 * Provides utilities for working with Abstract Syntax Tree
 */
import type { DocenRoot, Node, Parent, TextNode } from "../types";

/**
 * Check if a node is a parent node
 */
export function isParent(node: Node): node is Parent {
  return Boolean(
    node &&
      typeof node === "object" &&
      Array.isArray((node as Parent).children),
  );
}

/**
 * Check if a node is a text node
 */
export function isTextNode(node: Node): node is TextNode {
  return Boolean(
    node &&
      typeof node === "object" &&
      node.type === "text" &&
      typeof (node as TextNode).value === "string",
  );
}

/**
 * Check if a node is a root node
 */
export function isRoot(node: Node): node is DocenRoot {
  return Boolean(
    node &&
      typeof node === "object" &&
      node.type === "root" &&
      Array.isArray((node as DocenRoot).children),
  );
}

/**
 * Create a new node with the given type
 */
export function createNode<T extends Node>(
  type: string,
  props: Partial<T> = {},
): T {
  return {
    type,
    ...props,
  } as T;
}

/**
 * Create a new text node
 */
export function createTextNode(value: string): TextNode {
  return {
    type: "text",
    value,
  };
}

/**
 * Create a parent node with the given children
 */
export function createParent<T extends Parent>(
  type: string,
  children: Node[] = [],
  props: Partial<Omit<T, "type" | "children">> = {},
): T {
  return {
    type,
    children,
    ...props,
  } as T;
}

/**
 * Create a new root node
 */
export function createRoot(children: Node[] = []): DocenRoot {
  return {
    type: "root",
    children,
  };
}

// --- Re-exported unist utilities ---

export { visit, SKIP, EXIT, CONTINUE } from "unist-util-visit";
export { visitParents } from "unist-util-visit-parents"; // Note: visitParents also exports SKIP, EXIT, CONTINUE
export { filter } from "unist-util-filter";
export { map } from "unist-util-map";
export { remove } from "unist-util-remove";
export { select, selectAll } from "unist-util-select";
export { is } from "unist-util-is";
export { assert, parent, literal, wrap } from "unist-util-assert";

// Re-export specific types if needed, though usually direct usage from unist/xast is preferred
// export type { Node, Parent, Literal, Point, Position } from 'unist';
// export type { Test } from 'unist-util-is';
// export type { Visitor, BuildVisitor } from 'unist-util-visit';
