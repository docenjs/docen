import type { Plugin } from "unified";
import type { VFile } from "vfile";
/**
 * Processor types for Docen
 * Defining types for document processing and change events
 */
import type * as Y from "yjs";
import type { Node } from "../ast/types";
import {
  type CollaborationOptions,
  type CollaborativeDocument,
  DocumentFragment,
  type FragmentManager,
} from "../document/types";
import type { ResolvedNode, SyncConflict } from "../yjs/types";

/**
 * Base change event interface
 */
export interface ChangeEvent {
  type: ChangeEventType;
  timestamp: number;
  source?: "local" | "remote" | "plugin" | "system";
  path?: string[];
  id?: string;
}

/**
 * Types of document change events
 */
export enum ChangeEventType {
  // Yjs events
  YJS_TEXT = "yjs-text",
  YJS_MAP = "yjs-map",
  YJS_ARRAY = "yjs-array",
  YJS_XML = "yjs-xml",

  // unified.js events
  UNIFIED_PARSE = "unified-parse",
  UNIFIED_TRANSFORM = "unified-transform",
  UNIFIED_COMPILE = "unified-compile",
  UNIFIED_PROCESS = "unified-process",

  // Synchronization events
  SYNC_APPLIED = "sync-applied",
  SYNC_CONFLICT = "sync-conflict",
  SYNC_RESOLVED = "sync-resolved",
}

/**
 * Event listener type for change events
 */
export type ChangeEventListener = (event: ChangeEvent) => void;

/**
 * Yjs text change event
 */
export interface YjsTextChangeEvent extends ChangeEvent {
  type: ChangeEventType.YJS_TEXT;
  yEvent: Y.YTextEvent;
  delta?: Array<{
    insert?: string;
    delete?: number;
    retain?: number;
    attributes?: Record<string, unknown>;
  }>;
}

/**
 * Yjs map change event
 */
export interface YjsMapChangeEvent extends ChangeEvent {
  type: ChangeEventType.YJS_MAP;
  yEvent: Y.YMapEvent<unknown>;
  changes?: Map<
    string,
    {
      action: "add" | "update" | "delete";
      oldValue: unknown;
      newValue: unknown;
    }
  >;
}

/**
 * Yjs array change event
 */
export interface YjsArrayChangeEvent extends ChangeEvent {
  type: ChangeEventType.YJS_ARRAY;
  yEvent: Y.YArrayEvent<unknown>;
  changes?: Array<{
    action: "add" | "delete" | "update";
    index: number;
    values?: unknown[];
    oldValues?: unknown[];
  }>;
}

/**
 * Unified parse event
 */
export interface UnifiedParseEvent extends ChangeEvent {
  type: ChangeEventType.UNIFIED_PARSE;
  input?: string;
  output?: Node;
}

/**
 * Unified transform event
 */
export interface UnifiedTransformEvent extends ChangeEvent {
  type: ChangeEventType.UNIFIED_TRANSFORM;
  node?: Node;
  transformerName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Unified compile event
 */
export interface UnifiedCompileEvent extends ChangeEvent {
  type: ChangeEventType.UNIFIED_COMPILE;
  node?: Node;
  output?: string;
}

/**
 * Sync conflict event
 */
export interface SyncConflictEvent extends ChangeEvent {
  type: ChangeEventType.SYNC_CONFLICT;
  conflicts: Array<{
    localNode: Node;
    remoteNode: Node;
    localTimestamp: number;
    remoteTimestamp: number;
    path: (string | number)[];
  }>;
}

/**
 * Sync resolved event
 */
export interface SyncResolvedEvent extends ChangeEvent {
  type: ChangeEventType.SYNC_RESOLVED;
  resolvedNodes: Array<{
    node: Node;
    origin: "local" | "remote" | "merged";
  }>;
}

/**
 * Sync applied event
 */
export interface SyncAppliedEvent extends ChangeEvent {
  type: ChangeEventType.SYNC_APPLIED;
  appliedChanges: Array<{ path: string[]; node: Node }>;
}

/**
 * Union type for all change events
 */
export type DocenChangeEvent =
  | YjsTextChangeEvent
  | YjsMapChangeEvent
  | YjsArrayChangeEvent
  | UnifiedParseEvent
  | UnifiedTransformEvent
  | UnifiedCompileEvent
  | SyncConflictEvent
  | SyncResolvedEvent
  | SyncAppliedEvent;

/**
 * DocenProcessor extends the standard unified processor
 * with collaborative features
 */
export interface DocenProcessor {
  /**
   * Enable collaboration features for real-time editing
   */
  useCollaboration(options?: CollaborationOptions): DocenProcessor;

  /**
   * Observe changes to the document and its AST
   */
  observeChanges(callback: (changes: Array<ChangeEvent>) => void): () => void;

  /**
   * Standard unified processor methods with improved typing
   */
  use(plugin: Plugin): DocenProcessor;
  parse(file: VFile | string): Node;
  run(node: Node): Promise<Node>;
  runSync(node: Node): Node;
  stringify(node: Node): VFile;
  process(file: VFile | string | CollaborativeDocument): Promise<VFile>;
  processSync(file: VFile | string): VFile;

  /**
   * Get associated collaborative document
   */
  getDocument(): CollaborativeDocument | null;

  /**
   * Handle synchronization conflicts between local and remote changes
   */
  handleConflict(conflict: SyncConflict): ResolvedNode;

  /**
   * Register a transformer specifically for collaborative operations
   */
  useCollaborativeTransformer(
    transformer: (node: Node) => Promise<Node> | Node
  ): DocenProcessor;

  /**
   * Set cursor position for the local user
   */
  setCursor(position: {
    path: (string | number)[];
    offset: number;
  }): DocenProcessor;

  /**
   * Set selection range for the local user
   */
  setSelection(range: {
    anchor: { path: (string | number)[]; offset: number };
    head: { path: (string | number)[]; offset: number };
  }): DocenProcessor;

  /**
   * Get all user cursors in the document
   */
  getCursors(): Array<{
    clientId: number;
    user: Record<string, unknown>;
    cursor: Y.AbsolutePosition | null;
    selection: { anchor: Y.AbsolutePosition; head: Y.AbsolutePosition } | null;
  }>;

  /**
   * Create a subdocument from a specific path
   */
  getSubdocument(path: (string | number)[]): CollaborativeDocument | null;

  /**
   * Get fragment manager for large document handling
   */
  getFragmentManager(): FragmentManager;
}

/**
 * Options for creating a Docen processor
 */
export interface DocenProcessorOptions {
  /**
   * Document source
   */
  source?: string;

  /**
   * Document instance to use
   */
  document?: CollaborativeDocument;

  /**
   * Custom plugins to use with the processor
   */
  plugins?: Plugin[];

  /**
   * Adapter to use (remark, rehype, etc)
   */
  adapter?: "remark" | "rehype" | "retext" | "recma";

  /**
   * Enable collaborative features
   */
  collaborative?: boolean;

  /**
   * Existing Yjs document
   */
  ydoc?: Y.Doc;

  /**
   * Synchronization strategy
   */
  syncStrategy?: "timestamp" | "intent-based" | "custom";

  /**
   * Custom sync handler
   */
  customSyncHandler?: (conflict: SyncConflict) => ResolvedNode;

  /**
   * Plugin discovery options
   */
  pluginDiscovery?: {
    /**
     * Enable automatic plugin discovery
     */
    enabled: boolean;

    /**
     * Additional plugin search paths
     */
    paths?: string[];
  };

  /**
   * Document fragmentation options for large documents
   */
  fragmentOptions?: {
    /**
     * Enable document fragmentation
     */
    enabled: boolean;

    /**
     * Size threshold for creating fragments
     */
    threshold?: number;

    /**
     * Maximum number of fragments
     */
    maxFragments?: number;

    /**
     * Node types to consider for fragmentation
     */
    nodeTypes?: string[];
  };

  /**
   * Undo/redo manager options
   */
  undoOptions?: {
    /**
     * Enable undo/redo functionality
     */
    enabled: boolean;

    /**
     * Origins to track for undo operations
     */
    trackedOrigins?: string[];

    /**
     * Timeout for capturing operations
     */
    captureTimeout?: number;
  };
}

/**
 * Extended processor interface with fragment management capabilities
 */
export interface ExtendedProcessor extends DocenProcessor {
  context?: {
    fragmentOptions?: {
      maxFragments?: number;
    };
  };
  createSubprocessor?: (doc: Y.Doc) => CollaborativeDocument | null;
}
