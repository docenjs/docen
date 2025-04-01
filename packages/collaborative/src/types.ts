import type { Document, Node } from "@docen/core";
import type * as Y from "yjs";

/**
 * Interface for converting between Docen AST nodes and Yjs shared types
 */
export interface YjsASTAdapter<T extends Node> {
  /**
   * Convert from Docen AST node to Yjs shared type
   */
  fromAST(node: T): Y.AbstractType<Y.YTextEvent>;

  /**
   * Convert from Yjs shared type to Docen AST node
   */
  toAST(yType: Y.AbstractType<Y.YTextEvent>): T;

  /**
   * Observe changes to a Yjs shared type
   */
  observeChanges(
    yType: Y.AbstractType<Y.YTextEvent>,
    callback: (node: T) => void,
  ): () => void;
}

/**
 * Options for collaborative document
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
}

/**
 * Collaborative document interface
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
   * Disconnect from collaboration
   */
  disconnect: () => void;
}
