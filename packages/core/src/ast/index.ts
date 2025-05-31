/**
 * AST module for Docen
 * Re-exports standard unist utilities - no custom wrappers
 * Use standard unist ecosystem tools: is(), u(), visit(), find(), etc.
 */

// --- Re-export unist-builder for standard node creation ---
export { u } from "unist-builder";

// --- Re-export unist utilities for convenience ---
export { visit, SKIP, EXIT, CONTINUE } from "unist-util-visit";
export { visitParents } from "unist-util-visit-parents";
export { filter } from "unist-util-filter";
export { map } from "unist-util-map";
export { remove } from "unist-util-remove";
export { select, selectAll } from "unist-util-select";
export { is } from "unist-util-is";
export { find } from "unist-util-find";

// Examples of usage:
// - Type checking: is(node, 'paragraph') instead of isParagraph(node)
// - Node creation: u('paragraph', children) instead of createParagraph(children)
// - Tree traversal: visit(tree, visitor) or find(tree, condition)
