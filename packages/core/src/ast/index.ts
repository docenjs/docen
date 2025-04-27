/**
 * AST module for Docen
 * Provides utilities for working with Abstract Syntax Tree
 */
import type {
  CollaborationMetadata,
  CollaborativeNode,
  DocenRoot,
  Node,
  Parent,
  TextNode,
} from "../types";

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
      node.type &&
      typeof (node as TextNode).value === "string",
  );
}

/**
 * Check if a node is a root node
 */
export function isRoot(node: Node): node is DocenRoot {
  return Boolean(node && typeof node === "object" && node.type === "root");
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
 * Create a root node
 */
export function createRoot(children: Node[] = []): DocenRoot {
  return {
    type: "root",
    children,
  };
}

/**
 * Create a node with collaboration metadata
 * Explicitly returns CollaborativeNode
 */
export function createCollaborativeNode(
  type: string,
  props: Partial<
    Omit<CollaborativeNode, "type" | "collaborationMetadata" | "binding">
  > = {},
  metadata: Partial<CollaborationMetadata> = {},
): CollaborativeNode {
  const node: CollaborativeNode = {
    type,
    ...props,
    collaborationMetadata: {
      createdBy: metadata.createdBy,
      createdAt: metadata.createdAt ?? Date.now(),
      modifiedBy: metadata.modifiedBy,
      modifiedAt: metadata.modifiedAt,
      lastModifiedTimestamp: metadata.lastModifiedTimestamp ?? Date.now(),
      version: metadata.version,
      origin: metadata.origin,
    },
  };
  return node;
}
