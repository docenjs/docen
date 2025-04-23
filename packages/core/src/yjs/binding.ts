/**
 * Binding strategies for Yjs and AST nodes
 * Handles the bidirectional mappings between syntax trees and Yjs data structures
 */
import * as Y from "yjs";
import type { Node } from "../ast";
import type { CollaborativeNode } from "../types";

/**
 * Node binding strategy interface for optimized bindings
 */
export interface NodeBindingStrategy {
  /**
   * Convert a Node to a Yjs data structure
   */
  toYjs: (node: Node) => Y.AbstractType<any>;

  /**
   * Convert a Yjs data structure back to a Node
   */
  fromYjs: (yType: Y.AbstractType<any>) => Node;

  /**
   * Observe changes to the Yjs representation of a Node
   */
  observe: (
    node: Node,
    yType: Y.AbstractType<any>,
    callback: (event: Y.YEvent<any>) => void
  ) => () => void;
}

/**
 * Deep binding strategy that recursively binds all node properties and children
 */
export const deepBindingStrategy: NodeBindingStrategy = {
  toYjs(node: Node): Y.AbstractType<any> {
    if (!node) return new Y.Map();

    // Create a Yjs map to represent the node
    const yNode = new Y.Map();

    // Set all properties except children
    for (const [key, value] of Object.entries(node)) {
      if (key === "children") continue;

      if (typeof value === "string" && value.length > 100) {
        // Use YText for long string values
        const yText = new Y.Text(value);
        yNode.set(key, yText);
      } else {
        // Use regular values for other properties
        yNode.set(key, value);
      }
    }

    // Handle children recursively if this is a parent node
    if ("children" in node && Array.isArray((node as any).children)) {
      const children = (node as any).children as Node[];
      const yChildren = new Y.Array();

      for (const child of children) {
        yChildren.push([this.toYjs(child)]);
      }

      yNode.set("children", yChildren);
    }

    return yNode;
  },

  fromYjs(yType: Y.AbstractType<any>): Node {
    if (!(yType instanceof Y.Map)) {
      throw new Error("Expected Y.Map for node conversion");
    }

    const node: Record<string, any> = {};

    // Convert all primitive properties
    yType.forEach((value, key) => {
      if (key === "children") return;

      if (value instanceof Y.Text) {
        node[key] = value.toString();
      } else {
        node[key] = value;
      }
    });

    // Handle children recursively
    const yChildren = yType.get("children");
    if (yChildren instanceof Y.Array) {
      node.children = [];

      for (let i = 0; i < yChildren.length; i++) {
        const yChild = yChildren.get(i);
        if (yChild) {
          node.children.push(this.fromYjs(yChild));
        }
      }
    }

    return node as Node;
  },

  observe(
    node: Node,
    yType: Y.AbstractType<any>,
    callback: (event: Y.YEvent<any>) => void
  ): () => void {
    if (!(yType instanceof Y.Map)) {
      throw new Error("Expected Y.Map for node observation");
    }

    // Observe the node itself
    yType.observe(callback);

    // Also observe children deeply
    const unobserveCallbacks: Array<() => void> = [
      () => yType.unobserve(callback),
    ];

    const yChildren = yType.get("children");
    if (yChildren instanceof Y.Array && "children" in node) {
      const children = (node as any).children as Node[];

      // Observe the children array
      yChildren.observe(callback);
      unobserveCallbacks.push(() => yChildren.unobserve(callback));

      // Observe each child recursively
      for (let i = 0; i < Math.min(yChildren.length, children.length); i++) {
        const yChild = yChildren.get(i);
        const child = children[i];

        if (yChild && child) {
          const childUnobserve = this.observe(child, yChild, callback);
          unobserveCallbacks.push(childUnobserve);
        }
      }
    }

    // Return a function that unobserves everything
    return () => {
      for (const fn of unobserveCallbacks) {
        fn();
      }
    };
  },
};

/**
 * Shallow binding strategy that only binds the top-level node properties
 */
export const shallowBindingStrategy: NodeBindingStrategy = {
  toYjs(node: Node): Y.AbstractType<any> {
    if (!node) return new Y.Map();

    // Create a Yjs map to represent the node
    const yNode = new Y.Map();

    // Set all properties except children
    for (const [key, value] of Object.entries(node)) {
      if (key === "children") continue;
      yNode.set(key, value);
    }

    // For children, just store the array directly
    if ("children" in node && Array.isArray((node as any).children)) {
      const children = (node as any).children as Node[];
      yNode.set("children", children);
    }

    return yNode;
  },

  fromYjs(yType: Y.AbstractType<any>): Node {
    if (!(yType instanceof Y.Map)) {
      throw new Error("Expected Y.Map for node conversion");
    }

    const node: Record<string, any> = {};

    // Convert all properties
    yType.forEach((value, key) => {
      node[key] = value;
    });

    return node as Node;
  },

  observe(
    node: Node,
    yType: Y.AbstractType<any>,
    callback: (event: Y.YEvent<any>) => void
  ): () => void {
    if (!(yType instanceof Y.Map)) {
      throw new Error("Expected Y.Map for node observation");
    }

    // Only observe the node itself, not deep structures
    yType.observe(callback);

    return () => yType.unobserve(callback);
  },
};

/**
 * Lazy binding strategy that only binds nodes when accessed
 */
export const lazyBindingStrategy: NodeBindingStrategy = {
  toYjs(node: Node): Y.AbstractType<any> {
    // Initially just store basic metadata and a flag for lazy loading
    const yNode = new Y.Map();

    // Store only essential properties
    yNode.set("type", node.type);
    yNode.set("_lazyLoaded", false);

    // If there's a key/id field, store that too
    if ("key" in node) {
      yNode.set("key", (node as any).key);
    }

    if ("id" in node) {
      yNode.set("id", (node as any).id);
    }

    // Store a JSON representation for lazy loading
    yNode.set("_jsonData", JSON.stringify(node));

    return yNode;
  },

  fromYjs(yType: Y.AbstractType<any>): Node {
    if (!(yType instanceof Y.Map)) {
      throw new Error("Expected Y.Map for node conversion");
    }

    // Check if we need to load the node data
    const isLazyLoaded = yType.get("_lazyLoaded");

    if (!isLazyLoaded) {
      // Load from the stored JSON representation
      const jsonData = yType.get("_jsonData");
      if (typeof jsonData === "string") {
        try {
          const nodeData = JSON.parse(jsonData);

          // Mark as loaded
          yType.set("_lazyLoaded", true);

          // Copy all properties to the Yjs map
          for (const [key, value] of Object.entries(nodeData)) {
            if (key !== "_lazyLoaded" && key !== "_jsonData") {
              yType.set(key, value);
            }
          }

          // Return the parsed node
          return nodeData;
        } catch (error) {
          console.error("Error parsing lazy-loaded node:", error);
        }
      }
    }

    // If already loaded or couldn't parse, build from Yjs map
    const node: Record<string, any> = {};

    yType.forEach((value, key) => {
      if (key !== "_lazyLoaded" && key !== "_jsonData") {
        node[key] = value;
      }
    });

    return node as Node;
  },

  observe(
    node: Node,
    yType: Y.AbstractType<any>,
    callback: (event: Y.YEvent<any>) => void
  ): () => void {
    if (!(yType instanceof Y.Map)) {
      throw new Error("Expected Y.Map for node observation");
    }

    // Ensure the node is fully loaded first
    this.fromYjs(yType);

    // Observe the node
    yType.observe(callback);

    return () => yType.unobserve(callback);
  },
};

/**
 * Bind a Node to a Yjs shared type using the specified strategy
 */
export function bindNodeToYjs(
  node: Node,
  strategy: NodeBindingStrategy = deepBindingStrategy
): Node & CollaborativeNode {
  // Convert the node to Yjs representation
  const yType = strategy.toYjs(node);

  // Create the binding information
  const binding = {
    type: yType,
    path: [], // Will be set by caller
    observe(callback: (event: Y.YEvent<any>) => void): () => void {
      return strategy.observe(node, yType, callback);
    },
    update(newValue: any): void {
      if (yType instanceof Y.Map) {
        yType.forEach((_, key) => {
          // Clear existing properties
          if (key !== "children") {
            yType.delete(key);
          }
        });

        // Update with new properties
        for (const [key, value] of Object.entries(newValue)) {
          if (key !== "children" && key !== "binding") {
            yType.set(key, value);
          }
        }

        // Update children if available
        if (
          "children" in newValue &&
          Array.isArray(newValue.children) &&
          yType.has("children")
        ) {
          const yChildren = yType.get("children");

          if (yChildren instanceof Y.Array) {
            // Clear and replace children
            yChildren.delete(0, yChildren.length);

            for (const child of newValue.children) {
              const boundChild = bindNodeToYjs(child, strategy);
              yChildren.push([boundChild.binding?.type]);
            }
          }
        }
      }
    },
  };

  // Create metadata
  const collaborationMetadata = {
    createdAt: Date.now(),
    lastModifiedTimestamp: Date.now(),
    version: 1,
  };

  // Return extended node
  return {
    ...node,
    binding,
    collaborationMetadata,
  };
}

/**
 * Utility to check if a node is already collaboratively bound
 */
export function isCollaborativeNode(node: Node): node is CollaborativeNode {
  return (
    node !== null &&
    typeof node === "object" &&
    "binding" in node &&
    "collaborationMetadata" in node
  );
}
