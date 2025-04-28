/**
 * Binding strategies for Yjs and AST nodes
 * Handles the bidirectional mappings between syntax trees and Yjs data structures
 */
import * as Y from "yjs";
import type {
  CollaborationMetadata,
  CollaborativeNode,
  Node,
  NodeBindingStrategy,
  YjsBinding,
} from "../types";

/**
 * Deep binding strategy that recursively binds all node properties and children
 */
export const deepBindingStrategy: NodeBindingStrategy = {
  toYjs(node: Node): Y.AbstractType<any> {
    if (!node) return new Y.Map();

    // Create a Yjs map to represent the node
    const yNode = new Y.Map();

    // Set all properties except children and internal props
    for (const [key, value] of Object.entries(node)) {
      if (
        key === "children" ||
        key === "binding" ||
        key === "collaborationMetadata"
      )
        continue;

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

    // Set all properties except children and internal props
    for (const [key, value] of Object.entries(node)) {
      if (
        key === "children" ||
        key === "binding" ||
        key === "collaborationMetadata"
      )
        continue;
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
    // Exclude binding/metadata from stringification
    const { binding, collaborationMetadata, ...rest } =
      node as CollaborativeNode;
    yNode.set("_jsonData", JSON.stringify(rest));

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
 * This function now correctly attaches the YjsBinding and CollaborationMetadata
 */
export function bindNodeToYjs(
  node: Node,
  strategy: NodeBindingStrategy = deepBindingStrategy
): Node & CollaborativeNode {
  // Convert the node to Yjs representation
  const yType = strategy.toYjs(node);

  // Create the binding information
  const binding: YjsBinding = {
    type: yType,
    path: [], // Path should be set by the caller context (e.g., adapter)
    observe(callback: (event: Y.YEvent<any>) => void): () => void {
      // Pass node context if needed by the strategy's observe
      return strategy.observe(node, yType, callback);
    },
    update(newValue: any): void {
      if (yType instanceof Y.Map) {
        const currentKeys = Array.from(yType.keys());
        // Update/add new properties
        for (const [key, value] of Object.entries(newValue)) {
          if (
            key !== "children" &&
            key !== "binding" &&
            key !== "collaborationMetadata" &&
            key !== "type"
          ) {
            yType.set(key, value);
          }
        }
        // Remove old properties not in newValue (excluding internal/managed ones)
        for (const key of currentKeys) {
          if (
            key !== "children" &&
            key !== "binding" &&
            key !== "collaborationMetadata" &&
            key !== "type" &&
            !(key in newValue)
          ) {
            yType.delete(key);
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
            // Efficiently update children (more complex logic needed for granular updates)
            yChildren.delete(0, yChildren.length);
            for (const child of newValue.children) {
              // Recursively bind child - ensure strategy is passed if needed
              const boundChild = bindNodeToYjs(child, strategy);
              // Only push the Yjs type associated with the bound child
              if (boundChild.binding) {
                yChildren.push([boundChild.binding.type]);
              }
            }
          }
        } else if (yType.has("children") && !("children" in newValue)) {
          // Remove children if they are no longer present
          yType.delete("children");
        }
      } else if (yType instanceof Y.Text && typeof newValue === "string") {
        // Handle Text updates
        yType.delete(0, yType.length);
        yType.insert(0, newValue);
      }
      // Add handling for other types like Y.Array if needed
    },
  };

  // Create metadata
  const collaborationMetadata: CollaborationMetadata = {
    createdAt: Date.now(),
    lastModifiedTimestamp: Date.now(),
    version: 1,
  };

  // Return extended node, ensuring properties are correctly typed
  return {
    ...node,
    binding,
    collaborationMetadata,
  } as Node & CollaborativeNode;
}

/**
 * Utility to check if a node is already collaboratively bound
 * Checks for the presence and correct structure of binding and metadata
 */
export function isCollaborativeNode(node: any): node is CollaborativeNode {
  return (
    node !== null &&
    typeof node === "object" &&
    "type" in node && // Ensure it conforms to base Node
    "binding" in node &&
    typeof node.binding === "object" &&
    node.binding !== null &&
    "type" in node.binding &&
    "collaborationMetadata" in node &&
    typeof node.collaborationMetadata === "object" &&
    node.collaborationMetadata !== null
  );
}
