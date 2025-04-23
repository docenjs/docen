import { map } from "unist-util-map";
import { CONTINUE, EXIT, visit } from "unist-util-visit";
import * as Y from "yjs";
/**
 * Utility functions for working with ASTs and collaborative documents
 */
import type { Node, Parent, TextNode } from "../ast";
import { isParent } from "../ast";
import { Node as AstNode, Parent as AstParent } from "../ast/types";

/**
 * Find a node in the tree by predicate
 *
 * @param tree The AST to search
 * @param predicate Function to determine if node matches
 * @returns The found node or undefined
 */
export function findNode<T extends Node = Node>(
  tree: Node,
  predicate: (node: Node) => node is T
): T | undefined;
export function findNode(
  tree: Node,
  predicate: (node: Node) => boolean
): Node | undefined;
export function findNode(
  tree: Node,
  predicate: (node: Node) => boolean
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
  node: Node
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
 * Used in synchronization
 *
 * @param node The node to get timestamp for
 * @returns The timestamp or current time
 */
export function getNodeTimestamp(node: Node): number {
  return (
    node.collaborationMetadata?.lastModifiedTimestamp ??
    node.collaborationMetadata?.modifiedAt ??
    Date.now()
  );
}

/**
 * Set timestamp for a node
 * Used in synchronization
 *
 * @param node The node to update
 * @param timestamp The timestamp to set (defaults to current time)
 * @returns The updated node
 */
export function setNodeTimestamp(
  node: Node,
  timestamp: number = Date.now()
): Node {
  if (!node.collaborationMetadata) {
    node.collaborationMetadata = {};
  }

  node.collaborationMetadata.lastModifiedTimestamp = timestamp;
  node.collaborationMetadata.modifiedAt = timestamp;

  return node;
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
  transform: (node: Node) => Node
): Node {
  return map(tree, (node) => {
    if (typeof test === "string" ? node.type === test : test(node)) {
      return transform(node);
    }
    return node;
  });
}

/**
 * Helper to create Yjs shared type from node
 *
 * @param node The node to convert
 * @param ydoc Optional Yjs document to attach the types to
 * @returns A Yjs shared type
 */
export function nodeToYjs(
  node: Node,
  ydoc?: Y.Doc
): Y.Map<unknown> | Y.Text | Y.Array<unknown> {
  // Create a temporary doc if none provided to ensure proper Yjs type initialization
  const doc = ydoc || new Y.Doc();

  if (isParent(node)) {
    // Create map in the document context
    const yMap = new Y.Map<unknown>();

    // Add all properties except children
    for (const [key, value] of Object.entries(node)) {
      if (key !== "children") {
        yMap.set(key, value);
      }
    }

    // Add children as array
    const yChildren = new Y.Array<Y.Map<unknown> | Y.Text | Y.Array<unknown>>();
    for (const child of node.children) {
      yChildren.push([nodeToYjs(child, doc)]);
    }
    yMap.set("children", yChildren);

    return yMap;
  }

  // Handle text nodes
  if ("value" in node && typeof node.value === "string") {
    const textNode = node as TextNode;
    const yText = new Y.Text(textNode.value);
    return yText;
  }

  // Generic node as map
  const yMap = new Y.Map<unknown>();
  for (const [key, value] of Object.entries(node)) {
    yMap.set(key, value);
  }
  return yMap;
}

/**
 * Helper to create node from Yjs shared type
 *
 * @param yType The Yjs shared type to convert
 * @returns An AST node
 */
export function yjsToNode(
  yType: Y.Map<unknown> | Y.Text | Y.Array<unknown>
): Node {
  try {
    if (yType instanceof Y.Map) {
      const type = (yType.get("type") as string) ?? "unknown";
      const nodeData: Record<string, unknown> = { type };

      // Get all properties
      for (const [key, value] of Object.entries(yType)) {
        if (key !== "children") {
          nodeData[key] = value;
        }
      }

      // Handle children if present
      const yChildren = yType.get("children");
      if (yChildren instanceof Y.Array) {
        const children = yChildren.toArray().map((item) => {
          if (
            item instanceof Y.Map ||
            item instanceof Y.Text ||
            item instanceof Y.Array
          ) {
            return yjsToNode(item);
          }
          // Fallback for unexpected types
          return { type: "unknown" } as Node;
        });

        // Create parent node with children
        const result: Parent = {
          type: nodeData.type as string,
          children,
        };

        // Copy other properties
        for (const [key, value] of Object.entries(nodeData)) {
          if (key !== "type" && key !== "children") {
            (result as any)[key] = value;
          }
        }

        return result;
      }

      // Ensure the nodeData has at least a type property to satisfy Node interface
      return {
        type: nodeData.type as string,
        ...Object.fromEntries(
          Object.entries(nodeData).filter(([key]) => key !== "type")
        ),
      };
    }

    if (yType instanceof Y.Text) {
      // Create a text node
      return {
        type: "text",
        value: yType.toString(),
      } as TextNode;
    }

    if (yType instanceof Y.Array) {
      // Create parent node from array
      const children = yType.toArray().map((item) => {
        if (
          item instanceof Y.Map ||
          item instanceof Y.Text ||
          item instanceof Y.Array
        ) {
          return yjsToNode(item);
        }
        // Fallback for unexpected types
        return { type: "unknown" } as Node;
      });

      return {
        type: "array",
        children,
      } as Parent;
    }
  } catch (error) {
    console.error("Error converting Yjs type to node:", error);
  }

  // This should never happen as we've covered all possible types
  return { type: "unknown" } as Node;
}
