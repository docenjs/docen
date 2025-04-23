/**
 * Yjs integration for Docen
 * Provides adapters and utilities for collaborative editing
 */
import * as Y from "yjs";
import {
  AbstractType,
  RelativePosition,
  type Transaction,
  Array as YArray,
  type Doc as YDoc,
  type YEvent,
  Map as YMap,
  Text as YText,
  XmlElement as YXmlElement,
  XmlFragment as YXmlFragment,
  XmlText as YXmlText,
  UndoManager as YjsUndoManager,
} from "yjs";
import type { Node, Parent, TextNode } from "../ast";
import { isParent } from "../ast";
import type {
  ChangeEvent,
  CollaborativeDocument,
  CollaborativeNode,
  DocumentOptions,
  ResolvedNode,
  SyncConflict,
  SyncHandler,
  SyncStrategy,
} from "../types";
import { Awareness } from "./awareness";
import {
  NodeBindingStrategy as BindingStrategy,
  bindNodeToYjs,
  deepBindingStrategy,
  isCollaborativeNode,
} from "./binding";
import {
  createSyncHandler,
  createSyncManager,
  mergeNodes,
  resolveIntentBased,
  resolveTimestampBased,
} from "./sync";

// Re-export modules
export {
  // Awareness
  Awareness,
  // Binding strategies
  bindNodeToYjs,
  isCollaborativeNode,
  deepBindingStrategy,
  BindingStrategy,
  // Sync utilities
  createSyncHandler,
  resolveTimestampBased,
  resolveIntentBased,
  createSyncManager,
  mergeNodes,
};

/**
 * Interface for node binding strategy
 */
export interface NodeBindingStrategy {
  /**
   * Convert a Yjs structure to an AST node
   */
  yjsToAst(yjs: AbstractType<any>, path?: (string | number)[]): Node;

  /**
   * Convert an AST node to a Yjs structure
   */
  astToYjs(node: Node, parent?: AbstractType<any>): AbstractType<any>;
}

/**
 * Options for creating a Yjs adapter
 */
export interface YjsAdapterOptions {
  /**
   * Document ID
   */
  id?: string;

  /**
   * The binding strategy to use
   */
  bindingStrategy?: NodeBindingStrategy;

  /**
   * Whether to enable undo/redo functionality
   */
  undoEnabled?: boolean;

  /**
   * Custom capture scope for undo manager
   */
  undoScope?: string;

  /**
   * Callback for when changes are observed
   */
  onObserveChanges?: (
    events: Array<YEvent<any>>,
    transaction: Transaction
  ) => void;
}

/**
 * Options for creating a document from Yjs
 */
export interface YjsDocumentOptions {
  /**
   * Document ID
   */
  id?: string;

  /**
   * Whether to enable undo functionality
   */
  undoEnabled?: boolean;

  /**
   * Custom binding strategy
   */
  bindingStrategy?: NodeBindingStrategy;
}

/**
 * Default binding strategy that maps AST nodes to Yjs structures
 */
const defaultBindingStrategy: NodeBindingStrategy = {
  yjsToAst(yjs: AbstractType<any>, path: (string | number)[] = []): Node {
    if (yjs instanceof YMap) {
      // Map YMap to object node
      const nodeMap = yjs as YMap<any>;
      const type = nodeMap.get("type") as string;

      if (!type) {
        throw new Error("Node type is missing");
      }

      const node: any = { type };

      // Convert all properties
      for (const [key, value] of Object.entries(nodeMap)) {
        if (key === "type") continue;

        if (value instanceof AbstractType) {
          node[key] = this.yjsToAst(value, [...path, key]);
        } else {
          node[key] = value;
        }
      }

      // Handle children separately
      if (nodeMap.has("children")) {
        const children = nodeMap.get("children");
        if (children instanceof YArray) {
          node.children = [];
          for (let i = 0; i < children.length; i++) {
            const child = children.get(i);
            if (child instanceof AbstractType) {
              node.children.push(
                this.yjsToAst(child, [...path, "children", i])
              );
            } else {
              node.children.push(child);
            }
          }
        }
      }

      return node as Node;
    }
    if (yjs instanceof YArray) {
      // Map YArray to array of nodes
      const nodeArray = yjs as YArray<any>;
      const result: any = [];

      for (let i = 0; i < nodeArray.length; i++) {
        const item = nodeArray.get(i);
        if (item instanceof AbstractType) {
          result.push(this.yjsToAst(item, [...path, i]));
        } else {
          result.push(item);
        }
      }

      return result as unknown as Node;
    }
    if (yjs instanceof YText) {
      // Map YText to text node
      const textNode = yjs as YText;
      return {
        type: "text",
        value: textNode.toString(),
      } as TextNode;
    }

    throw new Error(`Unsupported Yjs type: ${yjs.constructor.name}`);
  },

  astToYjs(node: Node, parent?: AbstractType<any>): AbstractType<any> {
    if (!node) {
      throw new Error("Node is null or undefined");
    }

    if (typeof node !== "object") {
      throw new Error(`Node must be an object, got ${typeof node}`);
    }

    // Create a YMap for this node
    const ymap = new YMap<any>();

    // Set type
    ymap.set("type", node.type);

    // Handle properties
    for (const [key, value] of Object.entries(node)) {
      if (key === "type") continue; // Already set

      if (key === "children" && Array.isArray(value)) {
        // Handle children array
        const yarray = new YArray();
        for (const child of value) {
          if (typeof child === "object" && child !== null) {
            const childYjs = this.astToYjs(child);
            yarray.push([childYjs]);
          } else {
            yarray.push([child]);
          }
        }
        ymap.set("children", yarray);
      } else if (value !== null && typeof value === "object") {
        // Handle nested objects
        const nestedYjs = this.astToYjs(value as Node);
        ymap.set(key, nestedYjs);
      } else {
        // Handle primitive values
        ymap.set(key, value);
      }
    }

    return ymap;
  },
};

/**
 * Create a Yjs adapter for collaborative editing
 */
export function createYjsAdapter(
  ydoc: YDoc,
  options: YjsAdapterOptions = {}
): CollaborativeDocument {
  // Root map stores all nodes
  const rootMap = ydoc.getMap("docen");

  // Use provided binding strategy or default
  const bindingStrategy = options.bindingStrategy || defaultBindingStrategy;

  // Set up undo manager if enabled
  let undoManager: YjsUndoManager | null = null;
  if (options.undoEnabled) {
    undoManager = new YjsUndoManager([rootMap], {
      captureTimeout: 500,
      trackedOrigins: new Set(["user"]),
      ...(options.undoScope ? { scope: options.undoScope } : {}),
    });
  }

  // Create awareness instance for this document
  const awareness = new Awareness(ydoc);

  /**
   * Convert Yjs to AST
   */
  const yjsToAst = (): Parent => {
    const root = rootMap.get("root");
    if (!root) {
      return { type: "root", children: [] } as Parent;
    }

    return bindingStrategy.yjsToAst(root as AbstractType<any>) as Parent;
  };

  /**
   * Convert AST to Yjs
   */
  const astToYjs = (node: Node): void => {
    ydoc.transact(() => {
      const yjsNode = bindingStrategy.astToYjs(node);
      rootMap.set("root", yjsNode);
    }, "user");
  };

  /**
   * Setup observer for changes
   */
  const observeChanges = (
    callback: (events: Array<YEvent<any>>, transaction: Transaction) => void
  ): (() => void) => {
    const handler = (events: Array<YEvent<any>>, tr: Transaction) => {
      callback(events, tr);
    };

    rootMap.observeDeep(handler);

    // Return unobserve function
    return () => {
      rootMap.unobserveDeep(handler);
    };
  };

  // Create collaborative document
  const collaborativeDoc: CollaborativeDocument = {
    // Core document methods
    id: options.id || `ydoc-${Date.now().toString(36)}`,

    parse: async (content: string): Promise<Parent> => {
      // Convert string to AST
      const parsedAst = JSON.parse(content) as Parent;

      // Update Yjs document with AST
      astToYjs(parsedAst);

      return parsedAst;
    },

    stringify: async (tree: Node): Promise<string> => {
      // Convert AST to string
      return JSON.stringify(tree);
    },

    run: async (tree: Node): Promise<Node> => {
      // Simple pass-through as we don't run transformations here
      return tree;
    },

    process: async (
      input: string | Node
    ): Promise<{ tree: Node; value: string }> => {
      // Process input into AST and string
      const tree =
        typeof input === "string"
          ? await collaborativeDoc.parse(input)
          : ((isParent(input)
              ? input
              : { type: "root", children: [input] }) as Parent);

      const value = await collaborativeDoc.stringify(tree);

      return { tree, value };
    },

    transact: <T>(fn: () => T, origin?: string): T => {
      return ydoc.transact(fn, origin || "user");
    },

    setSyncStrategy: (strategy: SyncStrategy, handler?: SyncHandler): void => {
      // Not implemented in this adapter
    },

    getStateVector: (): Uint8Array => {
      return Y.encodeStateVector(ydoc);
    },

    encodeStateAsUpdate: (): Uint8Array => {
      return Y.encodeStateAsUpdate(ydoc);
    },

    applyUpdate: (update: Uint8Array): void => {
      Y.applyUpdate(ydoc, update);
    },

    createCollaborativeNode: (
      nodeType: string,
      initialData?: Record<string, unknown>
    ): Node => {
      const node: any = { type: nodeType, ...initialData };
      if (!node.collaborationMetadata) {
        node.collaborationMetadata = {};
      }
      node.collaborationMetadata.createdAt = Date.now();
      node.collaborationMetadata.lastModifiedTimestamp = Date.now();
      return node;
    },

    // Yjs specific methods
    ydoc,
    awareness,
    undoManager: {
      undo: () => {
        if (undoManager) undoManager.undo();
      },
      redo: () => {
        if (undoManager) undoManager.redo();
      },
      canUndo: () => !!undoManager?.canUndo(),
      canRedo: () => !!undoManager?.canRedo(),
      stopCapturing: () => {
        if (undoManager) undoManager.stopCapturing();
      },
      startCapturing: (options?: { captureTimeout?: number }) => {
        if (undoManager) {
          undoManager.stopCapturing();
          undoManager.captureTimeout = options?.captureTimeout || 500;
        }
      },
      on: (event, callback) => {
        if (undoManager) {
          undoManager.on(event, callback as any);
          return () => undoManager.off(event, callback as any);
        }
        return () => {};
      },
    },

    // Observer methods
    observeChanges: (
      path:
        | string[]
        | ((
            event: YEvent<AbstractType<unknown>>,
            transaction: Transaction
          ) => boolean),
      callback: (
        event: YEvent<AbstractType<unknown>>,
        transaction: Transaction
      ) => void
    ): (() => void) => {
      if (Array.isArray(path)) {
        // Path-based observation not implemented in this adapter
        return () => {};
      }
      // Use the predicate-based observer
      const predicateFn = path;
      const handler = (events: Array<YEvent<any>>, tr: Transaction) => {
        for (const event of events) {
          if (predicateFn(event, tr)) {
            callback(event, tr);
          }
        }
      };

      rootMap.observeDeep(handler);
      return () => rootMap.unobserveDeep(handler);
    },

    // Cleanup
    destroy: (): void => {
      if (undoManager) undoManager.destroy();
      awareness.destroy();
      ydoc.destroy();
    },
  };

  return collaborativeDoc;
}

/**
 * Create a CollaborativeDocument from a Yjs Doc
 */
export function createDocumentFromYjs(
  ydoc: YDoc,
  options: YjsDocumentOptions = {}
): CollaborativeDocument {
  // Create and return a collaborative document using the adapter
  return createYjsAdapter(ydoc, {
    undoEnabled: options.undoEnabled,
    bindingStrategy: options.bindingStrategy,
  });
}
