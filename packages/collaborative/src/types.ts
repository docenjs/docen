import type { Document, Node } from "@docen/core";
import type * as Y from "yjs";

/**
 * Base Yjs shared type that can be used in adapters
 */
export type YjsSharedType<T = unknown> = Y.Map<T> | Y.Array<T> | Y.Text;

/**
 * Type for Yjs events that can be observed
 */
export type YjsEventType<T = unknown> =
  | Y.YMapEvent<T>
  | Y.YArrayEvent<T>
  | Y.YTextEvent;

/**
 * Interface for adapters that convert between Docen AST nodes and Yjs shared types
 */
export interface YjsASTAdapter<T extends Node, YT = unknown> {
  /**
   * Convert from Docen AST node to Yjs shared type
   */
  fromAST(node: T): YjsSharedType<YT>;

  /**
   * Convert from Yjs shared type to Docen AST node
   */
  toAST(yType: YjsSharedType<YT>): T;

  /**
   * Observe changes to a Yjs shared type
   */
  observeChanges(
    yType: YjsSharedType<YT>,
    callback: (node: T) => void
  ): () => void;
}

/**
 * User awareness state for collaborative documents
 */
export interface AwarenessState {
  /**
   * User identifier
   */
  id: string;

  /**
   * User name
   */
  name: string;

  /**
   * User's cursor position or selection
   */
  cursor?: {
    index: number;
    length: number;
  };

  /**
   * Custom user data
   */
  userData?: Record<string, unknown>;
}

/**
 * Options for creating a collaborative document
 */
export interface CollaborativeOptions {
  /**
   * Unique document identifier
   */
  documentId: string;

  /**
   * Enable undo/redo functionality
   */
  enableUndo?: boolean;

  /**
   * Enable awareness (user presence)
   */
  enableAwareness?: boolean;

  /**
   * Initial awareness state for the local user
   */
  initialAwareness?: Partial<AwarenessState>;

  /**
   * Options for the undo manager
   */
  undoManagerOptions?: {
    captureTimeout?: number;
    trackedOrigins?: Set<unknown>;
  };
}

/**
 * Interface extending the standard Document with collaboration features
 */
export interface CollaborativeDocument extends Document {
  /**
   * Underlying Yjs document
   */
  ydoc: Y.Doc;

  /**
   * Undo manager if enabled
   */
  undoManager?: Y.UndoManager;

  /**
   * Awareness instance if enabled
   */
  awareness?: {
    /**
     * Get the current state of all users
     */
    getStates: () => Map<number, AwarenessState>;

    /**
     * Set local state
     */
    setLocalState: (state: Partial<AwarenessState>) => void;

    /**
     * Get local state
     */
    getLocalState: () => AwarenessState | undefined;

    /**
     * Observe changes to awareness
     */
    observe: (
      callback: (changes: {
        added: number[];
        updated: number[];
        removed: number[];
      }) => void
    ) => () => void;
  };

  /**
   * Disconnect from collaboration
   */
  disconnect: () => void;
}
