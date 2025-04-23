/**
 * Yjs related types for Docen
 * Defining types for collaborative editing with Yjs
 */
import type * as Y from "yjs";
import type { Node } from "../ast/types";

/**
 * Synchronization conflict definition for sync strategies
 */
export interface SyncConflict {
  localNode: Node;
  remoteNode: Node;
  localTimestamp: number;
  remoteTimestamp: number;
  path: (string | number)[];
}

/**
 * Resolved node after conflict resolution
 */
export interface ResolvedNode {
  node: Node;
  origin: "local" | "remote" | "merged";
}

/**
 * Types of synchronization strategies
 */
export type SyncStrategy = "timestamp" | "intent-based" | "custom";

/**
 * Custom sync handler function type
 */
export type SyncHandler = (conflict: SyncConflict) => ResolvedNode;

/**
 * Extended node interface with collaboration capabilities
 */
export interface CollaborativeNode extends Node {
  /**
   * Required collaboration metadata with timestamp
   */
  collaborationMetadata: {
    createdBy?: string;
    createdAt?: number;
    modifiedBy?: string;
    modifiedAt?: number;
    lastModifiedTimestamp: number;
    version?: number;
    origin?: string;
  };

  /**
   * Yjs binding information
   */
  binding?: {
    /**
     * Reference to the Yjs shared type
     */
    type: Y.AbstractType<unknown>;

    /**
     * Path to the node in the document
     */
    path: (string | number)[];

    /**
     * Method to observe changes to this node
     */
    observe(
      callback: (event: Y.YEvent<Y.AbstractType<unknown>>) => void
    ): () => void;

    /**
     * Method to update the node value
     */
    update(newValue: Node | string | number | boolean | null): void;
  };
}

/**
 * Cursor position for collaborative editing
 */
export interface CursorPosition {
  /**
   * Anchor position (start of selection or cursor position)
   */
  anchor: Y.RelativePosition;

  /**
   * Head position (end of selection if different from anchor)
   */
  head?: Y.RelativePosition;
}

/**
 * Cursor data for user awareness
 */
export interface CursorData {
  /**
   * Client ID of the user
   */
  clientId: number;

  /**
   * User information
   */
  user: Record<string, unknown>;

  /**
   * Current cursor position
   */
  cursor: Y.AbsolutePosition | null;

  /**
   * Current selection range
   */
  selection: {
    anchor: Y.AbsolutePosition;
    head: Y.AbsolutePosition;
  } | null;
}

/**
 * Awareness state structure
 */
export interface AwarenessState {
  /**
   * User information
   */
  user: {
    name?: string;
    id?: string;
    color?: string;
    avatar?: string;
    [key: string]: unknown;
  };

  /**
   * Current cursor position
   */
  cursor?: Y.RelativePosition;

  /**
   * Selection range
   */
  selection?: {
    anchor: Y.RelativePosition;
    head: Y.RelativePosition;
  };

  /**
   * Current status
   */
  status?: "online" | "away" | "offline";

  /**
   * Custom awareness data
   */
  [key: string]: unknown;
}
