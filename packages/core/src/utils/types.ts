/**
 * Utility types for Docen
 * Defining common utility types and helpers
 */
import type { VFile, VFileData } from "vfile";
import * as Y from "yjs";
import type { Node } from "../ast/types";
import type { CollaborativeDocument } from "../document/types";
import type { Awareness } from "../yjs/awareness";
import type { AwarenessState } from "../yjs/types";

/**
 * Extended data for VFile that includes collaborative properties
 */
export interface CollaborativeVFileData extends VFileData {
  /**
   * Reference to the collaborative document
   */
  collaborativeDocument?: CollaborativeDocument;

  /**
   * Awareness information for the document
   */
  awareness?: {
    /**
     * The local client ID
     */
    clientId: number;

    /**
     * Current cursor position
     */
    cursor?: {
      index: number;
      length: number;
      path: (string | number)[];
    };

    /**
     * User information
     */
    user?: {
      name?: string;
      id?: string;
      color?: string;
    };
  };

  /**
   * Document processing metadata
   */
  processing?: {
    /**
     * Start time of processing
     */
    startTime?: number;

    /**
     * End time of processing
     */
    endTime?: number;

    /**
     * Processing statistics
     */
    stats?: {
      parseTime?: number;
      transformTime?: number;
      stringifyTime?: number;
      totalTime?: number;
      nodeCount?: number;
    };
  };
}

/**
 * Common utility types for Docen
 */

/**
 * Path in a document, can be strings or numbers for array indices
 */
export type DocPath = (string | number)[];

/**
 * A unique ID for a document or fragment
 */
export type DocId = string;

/**
 * Timestamp used for tracking modifications
 */
export type Timestamp = number;

/**
 * User info for awareness and collaboration
 */
export interface UserInfo {
  /**
   * User identifier
   */
  id: string;

  /**
   * Display name
   */
  name?: string;

  /**
   * Avatar URL or data URI
   */
  avatar?: string;

  /**
   * User's preferred color for UI elements
   */
  color?: string;

  /**
   * Additional user properties
   */
  [key: string]: unknown;
}

/**
 * Additional metadata that can be attached to nodes
 */
export interface NodeMetadata {
  /**
   * Creation timestamp
   */
  createdAt?: Timestamp;

  /**
   * User who created the node
   */
  createdBy?: string;

  /**
   * Last modification timestamp
   */
  modifiedAt?: Timestamp;

  /**
   * User who last modified the node
   */
  modifiedBy?: string;

  /**
   * Custom metadata
   */
  [key: string]: unknown;
}

/**
 * Result of parsing an error
 */
export interface ParseResult<T = Node> {
  /**
   * The resulting AST
   */
  tree: T;

  /**
   * Original source for reference
   */
  source?: string;

  /**
   * Any errors that occurred during parsing
   */
  errors?: Error[];

  /**
   * Additional metadata
   */
  meta?: Record<string, unknown>;
}
