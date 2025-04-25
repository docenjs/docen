/**
 * Yjs related types for Docen
 * Defining types for collaborative editing with Yjs
 */
import type * as Y from "yjs";
// Import Node from the consolidated core types
import type { Node } from "../types";
// Import shared types from the core types definition
import type {
  AwarenessState,
  CollaborativeNode,
  CursorPosition,
  NodeBindingStrategy,
  ResolvedNode,
  SyncConflict,
  SyncHandler,
  SyncStrategy,
  YjsAdapter,
} from "../types";

/**
 * Configuration options for the Yjs adapter - UPDATED
 */
export interface YjsAdapterOptions {
  /**
   * Document ID (optional, adapter doesn't strictly need it, but can be useful)
   */
  id?: string;

  /**
   * Options for the Yjs Undo Manager
   */
  undoManagerOptions?: {
    /**
     * Whether to enable the undo manager.
     * @default true
     */
    enabled?: boolean;
    /**
     * Transaction origins to track.
     * @default ['local-update'] - Changed default to align with code usage
     */
    trackedOrigins?: string[];
    /**
     * Timeout for capturing operations into a single undo stack item.
     * @default 500
     */
    captureTimeout?: number;
    /**
     * Other options compatible with Y.UndoManager constructor.
     * @see https://docs.yjs.dev/api/undo-manager#constructor
     */
    [key: string]: any; // Allow other standard Y.UndoManager options
  };

  /**
   * Strategy for resolving synchronization conflicts.
   * @default 'timestamp'
   */
  syncStrategy?: SyncStrategy;

  /**
   * Custom handler function for resolving conflicts when syncStrategy is 'custom'.
   */
  customSyncHandler?: SyncHandler;

  /**
   * Custom binding strategies, merged with defaults.
   */
  bindingStrategies?: Record<string, NodeBindingStrategy>;

  /**
   * Default binding strategy key to use if a specific type strategy is not found.
   * @default 'map' // Defaulting to 'map' might be safer than 'text'
   */
  defaultBindingStrategy?: string;
}

// Define Yjs specific conflict/resolved types using core types
// These aliases can help clarify usage within the yjs/* scope
export type YjsSyncConflict = SyncConflict;
export type YjsResolvedNode = ResolvedNode;
export type YjsSyncHandler = SyncHandler;
