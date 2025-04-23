/**
 * Document types for Docen
 * Defining types for collaborative documents and fragments
 */
import type * as Y from "yjs";
import type { Node } from "../ast/types";
import type { Awareness } from "../yjs/awareness";
import type { SyncHandler, SyncStrategy } from "../yjs/types";

/**
 * Collaboration options interface
 */
export interface CollaborationOptions {
  /**
   * Optional existing Yjs document instance
   */
  ydoc?: Y.Doc;

  /**
   * Synchronization strategy
   * @default 'timestamp'
   */
  syncStrategy?: SyncStrategy;

  /**
   * Whether to enable undo/redo functionality
   * @default true
   */
  undoManager?: boolean;

  /**
   * Fragment options for large document handling
   */
  fragmentOptions?: {
    /**
     * Whether to enable automatic document fragmentation
     * @default false
     */
    enabled: boolean;

    /**
     * Size threshold for splitting fragments
     * @default 1000
     */
    threshold?: number;

    /**
     * Maximum number of fragments allowed
     * @default 100
     */
    maxFragments?: number;
  };

  /**
   * Custom sync strategy implementation
   */
  customSyncHandler?: SyncHandler;
}

/**
 * Core collaborative document interface
 */
export interface CollaborativeDocument {
  /**
   * Underlying Yjs document
   */
  ydoc: Y.Doc;

  /**
   * Document identity
   */
  id: string;

  /**
   * Convert string to AST
   */
  parse(input: string): Promise<Node>;

  /**
   * Convert AST to string
   */
  stringify(tree: Node): Promise<string>;

  /**
   * Run unified transformations
   */
  run(tree: Node): Promise<Node>;

  /**
   * Full processing pipeline (parse + transform + stringify)
   */
  process(input: string | Node): Promise<{ tree: Node; value: string }>;

  /**
   * Run operations in a transaction
   */
  transact<T>(fn: () => T, origin?: string): T;

  /**
   * Undo/redo manager
   */
  undoManager: {
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
   * Configure synchronization strategy
   */
  setSyncStrategy(strategy: SyncStrategy, handler?: SyncHandler): void;

  /**
   * Observe changes to the document
   */
  observeChanges(
    path:
      | string[]
      | ((
          event: Y.YEvent<Y.AbstractType<unknown>>,
          transaction: Y.Transaction
        ) => boolean),
    callback: (
      event: Y.YEvent<Y.AbstractType<unknown>>,
      transaction: Y.Transaction
    ) => void
  ): () => void;

  /**
   * Get document state vector
   */
  getStateVector(): Uint8Array;

  /**
   * Encode document state as update
   */
  encodeStateAsUpdate(): Uint8Array;

  /**
   * Apply update to document
   */
  applyUpdate(update: Uint8Array): void;

  /**
   * User awareness
   */
  awareness: Awareness;

  /**
   * Create a collaborative node
   */
  createCollaborativeNode(
    nodeType: string,
    initialData?: Record<string, unknown>
  ): Node;

  /**
   * Clean up resources
   */
  destroy(): void;

  /**
   * Custom plugins to use with the processor
   */
  plugins?: any[];
}

/**
 * Document fragment for large document handling
 */
export interface DocumentFragment {
  /**
   * Path to the fragment in the parent document
   */
  path: (string | number)[];

  /**
   * The collaborative document for this fragment
   */
  doc: CollaborativeDocument | null;

  /**
   * Metadata about this fragment
   */
  metadata?: {
    /**
     * When the fragment was created
     */
    createdAt: number;

    /**
     * Last time the fragment was accessed
     */
    lastAccessed: number;

    /**
     * Size of the fragment
     */
    size?: number;

    /**
     * Custom metadata
     */
    [key: string]: unknown;
  };
}

/**
 * Fragment manager interface
 */
export interface FragmentManager {
  /**
   * Create a new fragment for a subdocument
   */
  createFragment(
    path: (string | number)[],
    options?: {
      metadata?: Record<string, unknown>;
    }
  ): DocumentFragment;

  /**
   * Get a fragment at a specific path
   */
  getFragment(path: (string | number)[]): DocumentFragment | null;

  /**
   * Check if a fragment exists
   */
  hasFragment(path: (string | number)[]): boolean;

  /**
   * List all fragments
   */
  listFragments(): DocumentFragment[];

  /**
   * Remove a fragment
   */
  removeFragment(path: (string | number)[]): boolean;
}

/**
 * Document options interface
 */
export interface DocumentOptions {
  /**
   * Document identifier
   * @default randomly generated ID
   */
  id?: string;

  /**
   * Document type
   * @default 'generic'
   */
  type?: string;

  /**
   * Existing Yjs document
   */
  ydoc?: Y.Doc;

  /**
   * Synchronization strategy
   * @default 'timestamp'
   */
  syncStrategy?: SyncStrategy;

  /**
   * Custom sync handler for resolving conflicts
   */
  customSyncHandler?: SyncHandler;

  /**
   * Options for the undo manager
   */
  undoManagerOptions?: {
    /**
     * Whether to enable the undo manager
     * @default true
     */
    enabled?: boolean;

    /**
     * Origins to track for undo operations
     * @default ['user']
     */
    trackedOrigins?: Set<string>;

    /**
     * Timeout for capturing operations
     * @default 500
     */
    captureTimeout?: number;
  };

  /**
   * Strategy for binding AST nodes to Yjs
   * @default 'shallow'
   */
  bindingStrategy?: "deep" | "shallow" | "lazy";

  /**
   * Options for fragmenting large documents
   */
  fragmentOptions?: {
    /**
     * Whether to enable auto-fragmentation
     * @default false
     */
    enableAutoFragmentation?: boolean;

    /**
     * Size threshold for fragmentation
     * @default 1000
     */
    threshold?: number;

    /**
     * Node types to consider for fragmentation
     * @default ['section', 'chapter']
     */
    nodeTypes?: string[];
  };

  /**
   * Custom plugins to use with the processor
   */
  plugins?: any[];
}
