import type { VFile } from "vfile";
/**
 * Document implementation for Docen
 * Provides the core collaborative document functionality
 */
import * as Y from "yjs";
import { createRoot } from "../ast";
import type { Node, Parent } from "../ast/types";
import { DocenError } from "../errors";
import { createDocumentFromYjs, createYjsAdapter } from "../yjs";
import { Awareness } from "../yjs/awareness";
import type {
  CollaborativeNode,
  SyncHandler,
  SyncStrategy,
} from "../yjs/types";
import {
  type CollaborativeDocument,
  DocumentFragment,
  type DocumentOptions,
  FragmentManager,
} from "./types";

// Forward declaration for DocenProcessor to avoid circular dependency
interface DocenProcessor {
  useCollaboration(options?: any): DocenProcessor;
  run(tree: Node): Promise<Node>;
  runSync(tree: Node): Node;
  parse(file: VFile): Node;
  stringify(tree: Node): VFile;
}

// Utility function to convert Yjs type to Node
function yjsToNode(yjsType: any): Node {
  // Simplified implementation - in a real case, this would do proper conversion
  if (typeof yjsType !== "object" || yjsType === null) {
    return { type: "unknown" };
  }

  const node: any = { type: yjsType.type || "unknown" };

  if (yjsType.children && Array.isArray(yjsType.children)) {
    node.children = yjsType.children.map((child: any) => yjsToNode(child));
  }

  // Copy other properties
  for (const key in yjsType) {
    if (key !== "children" && key !== "type") {
      node[key] = yjsType[key];
    }
  }

  return node;
}

/**
 * Collaborative Document implementation
 * Bridges unified.js and Yjs for collaborative editing
 */
export class DocenDocument implements CollaborativeDocument {
  /**
   * Document ID
   */
  public readonly id: string;

  /**
   * Document type
   */
  public readonly type: string;

  /**
   * Underlying Yjs document
   */
  public readonly ydoc: Y.Doc;

  /**
   * Root Yjs map
   */
  private readonly rootMap: Y.Map<any>;

  /**
   * Processor for parsing and stringifying
   */
  private processor: DocenProcessor;

  /**
   * Synchronization strategy
   */
  private syncStrategy: SyncStrategy = "timestamp";

  /**
   * Custom sync handler
   */
  private customSyncHandler?: SyncHandler;

  /**
   * User awareness
   */
  public readonly awareness: Awareness;

  /**
   * Undo manager
   */
  public readonly undoManager: {
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    stopCapturing(): void;
    startCapturing(options?: { captureTimeout?: number }): void;
    on(
      event: "stack-item-added" | "stack-item-popped",
      callback: (
        event: Y.YEvent<Y.AbstractType<unknown>>,
        transaction: Y.Transaction
      ) => void
    ): () => void;
  };

  /**
   * Map of node paths to Yjs shared types
   */
  private nodeMap = new Map<string, Y.AbstractType<any>>();

  /**
   * Root node of the document
   */
  private rootNode: Node | null = null;

  /**
   * Create a new collaborative document
   */
  constructor(options: DocumentOptions = {}) {
    this.id =
      options.id || `doc-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    this.type = options.type || "document";

    // Initialize Yjs document - either from options or create new
    this.ydoc = options.ydoc || new Y.Doc();
    this.rootMap = this.ydoc.getMap("root");
    this.awareness = new Awareness(this.ydoc);

    // Set sync strategy
    this.syncStrategy = options.syncStrategy || "timestamp";
    this.customSyncHandler = options.customSyncHandler;

    // Set up undo manager
    const yUndoManager =
      options.undoManagerOptions?.enabled !== false
        ? new Y.UndoManager(this.rootMap, {
            trackedOrigins:
              options.undoManagerOptions?.trackedOrigins || new Set(["user"]),
            captureTimeout: options.undoManagerOptions?.captureTimeout || 500,
          })
        : null;

    // Create undo manager API
    this.undoManager = {
      undo: () => yUndoManager?.undo(),
      redo: () => yUndoManager?.redo(),
      canUndo: () => !!yUndoManager?.canUndo(),
      canRedo: () => !!yUndoManager?.canRedo(),
      stopCapturing: () => yUndoManager?.stopCapturing(),
      startCapturing: (opts) => {
        if (yUndoManager) {
          yUndoManager.stopCapturing();
          yUndoManager.captureTimeout = opts?.captureTimeout || 500;
        }
      },
      on: (event, callback) => {
        if (yUndoManager) {
          yUndoManager.on(event, callback as any);
          return () => yUndoManager.off(event, callback as any);
        }
        return () => {};
      },
    };

    // Don't initialize processor here, will be set later by factory functions
    // This avoids circular dependency issues
    this.processor = {} as DocenProcessor;
  }

  /**
   * Parse input string to AST
   */
  async parse(input: string): Promise<Node> {
    try {
      // If input appears to be JSON, parse it directly
      if (input.trim().startsWith("{")) {
        try {
          // Parse JSON string to AST
          const parsedNode = JSON.parse(input.trim()) as Node;
          this.rootNode = parsedNode;
          return parsedNode;
        } catch (jsonError) {
          // If JSON parsing fails, fall back to text node
          console.error("JSON parse error:", jsonError);
        }
      }

      // For non-JSON input or if JSON parsing fails,
      // create a simple text node structure
      this.rootNode = {
        type: "root",
        children: input.trim() ? [{ type: "text", value: input.trim() }] : [],
      } as Node;

      return this.rootNode;
    } catch (error) {
      throw new DocenError("Error parsing document", {
        error: error instanceof Error ? error : new Error(String(error)),
        context: "parse",
      });
    }
  }

  /**
   * Stringify AST to string
   */
  async stringify(tree?: Node): Promise<string> {
    try {
      // If tree is not provided, use the root node
      const nodeToStringify = tree || this.getRoot();

      // Simple stringification for text nodes
      if (nodeToStringify.type === "text" && "value" in nodeToStringify) {
        return (nodeToStringify as any).value || "";
      }

      // If it's a parent node with children, stringify all children
      if ("children" in nodeToStringify) {
        const parent = nodeToStringify as Parent;
        let result = "";

        for (const child of parent.children || []) {
          if (child.type === "text" && "value" in child) {
            result += (child as any).value || "";
          } else if ("children" in child) {
            result += await this.stringify(child);
          }
        }

        return result;
      }

      return "";
    } catch (error) {
      throw new DocenError("Error stringifying document", {
        error: error instanceof Error ? error : new Error(String(error)),
        context: "stringify",
      });
    }
  }

  /**
   * Run transformations on AST
   */
  async run(tree: Node): Promise<Node> {
    try {
      // For now, return the tree unchanged
      // Later, the processor will handle transformations
      return tree;
    } catch (error) {
      throw new DocenError("Error transforming document", {
        error: error instanceof Error ? error : new Error(String(error)),
        context: "run",
      });
    }
  }

  /**
   * Process input (parse + transform + stringify)
   */
  async process(input: string | Node): Promise<{ tree: Node; value: string }> {
    try {
      // Parse input if string
      const tree = typeof input === "string" ? await this.parse(input) : input;

      // Run transformations
      const transformedTree = await this.run(tree);

      // Stringify to get output value
      const value = await this.stringify(transformedTree);

      return { tree: transformedTree, value };
    } catch (error) {
      throw new DocenError("Error processing document", {
        error: error instanceof Error ? error : new Error(String(error)),
        context: "process",
      });
    }
  }

  /**
   * Run operations in a transaction
   */
  transact<T>(fn: () => T, origin?: string): T {
    return this.ydoc.transact(() => fn(), origin);
  }

  /**
   * Set synchronization strategy
   */
  setSyncStrategy(strategy: SyncStrategy, handler?: SyncHandler): void {
    this.syncStrategy = strategy;

    if (handler) {
      this.customSyncHandler = handler;
    }
  }

  /**
   * Observe changes to the document
   */
  observeChanges(
    path:
      | string[]
      | ((event: Y.YEvent<any>, transaction: Y.Transaction) => boolean),
    callback: (event: Y.YEvent<any>, transaction: Y.Transaction) => void
  ): () => void {
    // Get the Yjs type to observe
    if (Array.isArray(path)) {
      const yType = this.getYjsTypeByPath(path);

      if (!yType) {
        throw new DocenError("Invalid path for observation", {
          context: "observeChanges",
        });
      }

      // Set up observer
      yType.observe(callback);
      return () => yType.unobserve(callback);
    }
    // Path is a filter function
    const filterFn = path;

    // Using observeDeep directly would cause a type error
    // So we'll create a wrapper function that applies the filter
    const handler = (events: Y.YEvent<any>[], transaction: Y.Transaction) => {
      for (const event of events) {
        if (filterFn(event, transaction)) {
          callback(event, transaction);
        }
      }
    };

    this.rootMap.observeDeep(handler);
    return () => this.rootMap.unobserveDeep(handler);
  }

  /**
   * Get document state vector
   */
  getStateVector(): Uint8Array {
    return Y.encodeStateVector(this.ydoc);
  }

  /**
   * Encode document state as update
   */
  encodeStateAsUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc);
  }

  /**
   * Apply update to document
   */
  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.ydoc, update);
  }

  /**
   * Create a collaborative node
   */
  createCollaborativeNode(
    nodeType: string,
    initialData?: Record<string, any>
  ): Node & CollaborativeNode {
    // Create base node with required metadata
    const node: CollaborativeNode = {
      type: nodeType,
      ...initialData,
      collaborationMetadata: {
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        lastModifiedTimestamp: Date.now(),
      },
    };

    // Create corresponding Yjs shared type
    const yType = this.createYjsNodeForType(nodeType, node);

    // Add binding information
    const path = [`node-${Date.now()}-${Math.floor(Math.random() * 10000)}`];
    node.binding = {
      type: yType,
      path,
      observe: (callback) => {
        yType.observe(callback);
        return () => yType.unobserve(callback);
      },
      update: (newValue) => {
        this.updateYjsType(yType, newValue);
      },
    };

    // Add to node map
    this.nodeMap.set(path.join("/"), yType);

    return node as Node & CollaborativeNode;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clean up awareness
    this.awareness.destroy();

    // Clean up Yjs document
    this.ydoc.destroy();

    // Clear node map
    this.nodeMap.clear();
  }

  /**
   * Helper to create a collaborative tree from AST
   */
  createCollaborativeTree(node: Node): Node {
    // Visit the tree recursively
    return this.visitTree(node, (currentNode) => {
      // Create collaborative node
      const collaborativeNode = this.createCollaborativeNode(
        currentNode.type,
        this.getNodeProperties(currentNode)
      );

      // Add children if present in the orignal node
      if (
        "children" in currentNode &&
        Array.isArray((currentNode as Parent).children)
      ) {
        const parent = currentNode as Parent;
        (collaborativeNode as any).children = parent.children.map((child) =>
          this.visitTree(child, (node) =>
            this.createCollaborativeNode(
              node.type,
              this.getNodeProperties(node)
            )
          )
        );
      }

      return collaborativeNode;
    });
  }

  /**
   * Helper to visit tree nodes
   */
  private visitTree<T extends Node>(node: Node, visitor: (node: Node) => T): T {
    return visitor(node);
  }

  /**
   * Helper to get node properties excluding children
   */
  private getNodeProperties(node: Node): Record<string, any> {
    const props: Record<string, any> = {};

    // Copy all properties except children
    for (const [key, value] of Object.entries(node)) {
      if (key !== "children") {
        props[key] = value;
      }
    }

    return props;
  }

  /**
   * Helper to create Yjs type for a node
   */
  private createYjsNodeForType(
    nodeType: string,
    node: Node
  ): Y.AbstractType<any> {
    // Text nodes use Y.Text
    if (
      nodeType === "text" &&
      "value" in node &&
      typeof node.value === "string"
    ) {
      const yText = new Y.Text();
      yText.insert(0, node.value);
      return yText;
    }

    // Parent nodes with children use Y.Map with nested Y.Array for children
    if ("children" in node && Array.isArray((node as Parent).children)) {
      const yMap = new Y.Map();

      // Set all properties except children
      for (const [key, value] of Object.entries(node)) {
        if (key !== "children") {
          yMap.set(key, value);
        }
      }

      // Create children array
      const yChildren = new Y.Array();
      const parent = node as Parent;

      if (parent.children?.length) {
        for (const child of parent.children) {
          const yChild = this.createYjsNodeForType(child.type, child);
          yChildren.push([yChild]);
        }
      }

      yMap.set("children", yChildren);
      return yMap;
    }

    // Default case: use Y.Map for all other node types
    const yMap = new Y.Map();

    for (const [key, value] of Object.entries(node)) {
      yMap.set(key, value);
    }

    return yMap;
  }

  /**
   * Helper to update a Yjs type with new values
   */
  private updateYjsType(yType: Y.AbstractType<any>, newValue: any): void {
    if (yType instanceof Y.Text && typeof newValue === "string") {
      // Update text
      yType.delete(0, yType.length);
      yType.insert(0, newValue);
    } else if (yType instanceof Y.Map && typeof newValue === "object") {
      // Update map properties
      for (const [key, value] of Object.entries(newValue)) {
        if (key !== "children") {
          yType.set(key, value);
        }
      }

      // Handle children separately
      if ("children" in newValue && Array.isArray(newValue.children)) {
        const yChildren = yType.get("children");

        if (yChildren instanceof Y.Array) {
          // Clear existing children
          yChildren.delete(0, yChildren.length);

          // Add new children
          for (const child of newValue.children) {
            const yChild = this.createYjsNodeForType(child.type, child);
            yChildren.push([yChild]);
          }
        }
      }
    } else if (yType instanceof Y.Array && Array.isArray(newValue)) {
      // Update array
      yType.delete(0, yType.length);

      for (const item of newValue) {
        if (typeof item === "object") {
          const yItem = this.createYjsNodeForType(item.type || "unknown", item);
          yType.push([yItem]);
        } else {
          yType.push([item]);
        }
      }
    }
  }

  /**
   * Helper to get Yjs type by path
   */
  private getYjsTypeByPath(path: string[]): Y.AbstractType<any> | null {
    if (path.length === 0) {
      return this.rootMap;
    }

    let current: Y.AbstractType<any> = this.rootMap;

    for (let i = 0; i < path.length; i++) {
      const segment = path[i];

      if (current instanceof Y.Map) {
        current = current.get(segment);
      } else if (current instanceof Y.Array && !Number.isNaN(Number(segment))) {
        current = current.get(Number(segment));
      } else {
        return null;
      }

      if (!current) {
        return null;
      }
    }

    return current;
  }

  /**
   * Get the root node of the document
   */
  getRoot(): Node {
    if (!this.rootNode) {
      const rootData = this.rootMap.toJSON();
      // Create a default root if none exists
      const defaultRoot = {
        type: "root",
        children: [],
      } as Parent;

      this.rootNode = rootData.root ? yjsToNode(rootData.root) : defaultRoot;
    }

    return this.rootNode;
  }

  /**
   * Synchronize with a provider
   */
  sync(provider: { connect(): void; disconnect(): void }): () => void {
    // Connect to provider
    provider.connect();

    // Return disconnect function
    return () => {
      provider.disconnect();
    };
  }
}

/**
 * Factory function to create a collaborative document
 */
export function createDocument(
  content?: string | Node | Uint8Array,
  options?: DocumentOptions
): CollaborativeDocument {
  const doc = new DocenDocument(options);

  // Initialize document with content if provided
  if (content) {
    if (typeof content === "string") {
      // Parse string content
      doc.transact(async () => {
        await doc.parse(content as string);
      }, "init");
    } else if (content instanceof Uint8Array) {
      // Apply update from binary content
      doc.applyUpdate(content);
    } else {
      // Use existing node structure
      doc.transact(() => {
        doc.createCollaborativeTree(content as Node);
      }, "init");
    }
  }

  return doc;
}
