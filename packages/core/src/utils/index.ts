import { map } from "unist-util-map";
import { CONTINUE, EXIT, visit } from "unist-util-visit";
import { isParent } from "../ast";
import type { CollaborativeNode, Node } from "../types";

/**
 * Find a node in the tree by predicate
 *
 * @param tree The AST to search
 * @param predicate Function to determine if node matches
 * @returns The found node or undefined
 */
export function findNode<T extends Node = Node>(
  tree: Node,
  predicate: (node: Node) => node is T,
): T | undefined;
export function findNode(
  tree: Node,
  predicate: (node: Node) => boolean,
): Node | undefined;
export function findNode(
  tree: Node,
  predicate: (node: Node) => boolean,
): Node | undefined {
  let result: Node | undefined = undefined;

  visit(tree, (node) => {
    if (predicate(node)) {
      result = node;
      return EXIT;
    }
    return CONTINUE;
  });

  return result;
}

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
 * Get timestamp for a node from its metadata
 * Used in synchronization. Returns current time if no metadata.
 *
 * @param node The node to get timestamp for (can be any Node)
 * @returns The timestamp or current time
 */
export function getNodeTimestamp(node: Node): number {
  // Safely access optional collaborationMetadata
  const meta = (node as CollaborativeNode).collaborationMetadata;
  return (
    meta?.lastModifiedTimestamp ?? // Optional chaining
    meta?.modifiedAt ?? // Optional chaining
    Date.now()
  );
}

/**
 * Set timestamp for a node, potentially making it collaborative.
 * Used in synchronization.
 *
 * @param node The node to update (can be any Node, will add metadata if needed)
 * @param timestamp The timestamp to set (defaults to current time)
 * @returns The updated node (potentially now a CollaborativeNode)
 */
export function setNodeTimestamp<T extends Node>(
  node: T,
  timestamp: number = Date.now(),
): T & Partial<CollaborativeNode> {
  // Return type indicates metadata might be added
  // Ensure node is treated as potentially collaborative
  const collaborativeNode = node as T & Partial<CollaborativeNode>;

  // Ensure collaborationMetadata object exists before setting properties
  if (!collaborativeNode.collaborationMetadata) {
    collaborativeNode.collaborationMetadata = {};
  }

  // Set the timestamps
  collaborativeNode.collaborationMetadata.lastModifiedTimestamp = timestamp;
  collaborativeNode.collaborationMetadata.modifiedAt = timestamp;

  // Return the modified node
  return collaborativeNode;
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

export * from "./collaborative";
