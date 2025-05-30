import { map } from "unist-util-map";
import { isParent } from "../ast";
import type { Node } from "../types";

/**
 * Re-export find from unist-util-find for compatibility
 */
export { find } from "unist-util-find";

/**
 * Find the path to a node in the tree
 *
 * @param tree The AST to search
 * @param node The node to find the path for
 * @returns The path or null if not found
 */
export function findNodePath(
  tree: Node,
  node: Node,
): (string | number)[] | null {
  // Early exit if tree is the node we're looking for
  if (tree === node) {
    return [];
  }

  // Search through children if this is a parent node
  if (isParent(tree)) {
    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];

      // If child is the node we're looking for
      if (child === node) {
        return ["children", i];
      }

      // Recursively search in child
      const childPath = findNodePath(child, node);
      if (childPath !== null) {
        return ["children", i, ...childPath];
      }
    }
  }

  // Node not found in this branch
  return null;
}

/**
 * Apply a transformation to specific nodes
 *
 * @param tree The AST to transform
 * @param test Predicate to select nodes
 * @param transform Function to transform matching nodes
 * @returns The transformed tree
 */
export function transform(
  tree: Node,
  test: string | ((node: Node) => boolean),
  transform: (node: Node) => Node,
): Node {
  return map(tree, (node) => {
    if (typeof test === "string" ? node.type === test : test(node)) {
      return transform(node);
    }
    return node;
  });
}
