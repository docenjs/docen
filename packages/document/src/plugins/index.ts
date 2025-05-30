/**
 * Document-specific utilities for unified.js
 * Pure format processing utilities without collaboration
 */

import type { Node, Parent } from "@docen/core";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

// Define specific node types for better type safety
interface ParagraphNode extends Parent {
  type: "paragraph";
  children: Node[];
}

/**
 * Plugin to handle frontmatter in documents
 */
export function frontmatterPlugin(): Plugin {
  return function transformer() {
    return (tree: Node) => {
      // Handle YAML frontmatter - placeholder implementation
      return tree;
    };
  };
}

/**
 * Plugin to enhance GFM support
 */
export function gfmPlugin(): Plugin {
  return function transformer() {
    return (tree: Node) => {
      // Enhanced GitHub Flavored Markdown support - placeholder implementation
      return tree;
    };
  };
}

/**
 * Plugin to clean up empty paragraphs
 */
export function cleanupPlugin(): Plugin {
  return function transformer() {
    return (tree: Node) => {
      visit(
        tree,
        "paragraph",
        (
          node: ParagraphNode,
          index: number | undefined,
          parent: Parent | undefined,
        ) => {
          // Remove empty paragraphs
          if (node.children && node.children.length === 0) {
            if (parent && typeof index === "number") {
              parent.children.splice(index, 1);
              return index;
            }
          }
        },
      );
      return tree;
    };
  };
}
