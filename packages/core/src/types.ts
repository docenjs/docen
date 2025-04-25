/**
 * Core Type Definitions for Docen
 * This file consolidates shared types across the core package.
 */

import type {
  Plugin as UnifiedPlugin,
  Processor as UnifiedProcessor,
} from "unified";
import type { Node as UnistNode, Parent as UnistParent } from "unist";
import type { VFileData } from "vfile";
import type * as Y from "yjs";
import type { YjsAdapterOptions } from "./yjs/types";

// --- Base AST Nodes (from ast/types) ---

export interface Node extends UnistNode {
  collaborationMetadata?: CollaborationMetadata;
}

export interface Parent extends Node, UnistParent {
  children: Node[];
}

export interface TextNode extends Node {
  type: "text";
  value: string;
}

export interface DocenRoot extends Parent {
  type: "root";
  children: Node[];
  metadata?: Record<string, unknown>;
}

export interface DocenNode extends Node {
  id?: string;
}

// --- Document Schema & Validation (from ast/types) ---

export interface DocumentSchema {
  nodeTypes: Record<string, NodeTypeDefinition>;
  validationRules: ValidationRule[];
  onValidationError?: (error: ValidationError) => "ignore" | "fix" | "reject";
}

export interface NodeTypeDefinition {
  required?: string[];
  properties?: Record<
    string,
    {
      type: "string" | "number" | "boolean" | "object" | "array";
      items?: NodeTypeDefinition; // Recursive definition
    }
  >;
  allowedChildren?: string[];
  bindingStrategy?: "deep" | "shallow" | "lazy"; // Reference string type
}

export interface ValidationError {
  message: string;
  node: Node;
  ruleId?: string;
  severity?: "error" | "warning";
}

export interface ValidationRule {
  selector: string | ((node: Node) => boolean);
  validate: (node: Node) => boolean | ValidationError;
}

// --- Collaboration & Yjs Core Types ---

/** Defines the collaboration metadata added to a Node */
export interface CollaborationMetadata {
  createdBy?: string;
  createdAt?: number;
  modifiedBy?: string;
  modifiedAt?: number;
  lastModifiedTimestamp?: number;
  version?: number;
  origin?: string;
}

/** Defines the structure added to a Node when bound to Yjs */
export interface YjsBinding {
  type: Y.AbstractType<any>;
  path: (string | number)[];
  observe(callback: (event: Y.YEvent<any>) => void): () => void;
  update(newValue: any): void;
}

/** Node extended with collaborative capabilities */
export interface CollaborativeNode extends Node {
  binding?: YjsBinding;
  collaborationMetadata?: CollaborationMetadata;
}

/** Interface for cursor position using relative positions */
export interface CursorPosition {
  relativePosition: Y.RelativePosition;
  // Optional range for selection, start/end using relative positions
  range?: { start: Y.RelativePosition; end: Y.RelativePosition } | null;
}

/** Interface for user awareness state */
export interface AwarenessState {
  user: {
    id: string; // ID is required
    name?: string;
    color?: string;
    avatar?: string;
    [key: string]: unknown;
  };
  cursor?: CursorPosition | null;
  status?: "online" | "away" | "offline";
  [key: string]: unknown;
}

/** Node binding strategy interface */
export interface NodeBindingStrategy<N extends Node = Node> {
  toYjs(node: N): Y.AbstractType<any>;
  fromYjs(yType: Y.AbstractType<any>): N;
  observe(
    node: N,
    yType: Y.AbstractType<any>,
    callback: (event: Y.YEvent<any>) => void,
  ): () => void;
}

// --- Synchronization Types ---

/** Interface for handling synchronization conflicts */
export interface SyncConflict {
  localNode: Node;
  remoteNode: Node;
  localTimestamp: number;
  remoteTimestamp: number;
  path: (string | number)[];
}

/** Resolved node from conflict resolution */
export interface ResolvedNode {
  node: Node;
  origin: "local" | "remote" | "merged"; // Specific origins
}

/** Type for sync strategy */
export type SyncStrategy = "timestamp" | "intent-based" | "custom";

/** Handler for sync conflicts */
export type SyncHandler = (conflict: SyncConflict) => ResolvedNode;

// --- Document & Processor Core Types ---

/** Core collaborative document interface */
export interface CollaborativeDocument {
  readonly ydoc: Y.Doc;
  readonly awareness: Awareness; // Use Awareness type (defined below or imported)
  readonly id: string; // Make ID readonly as it shouldn't change after creation
  transact<T>(fn: () => T, origin?: string): T;
  setSyncStrategy(strategy: SyncStrategy, handler?: SyncHandler): void; // Keep? Or should this be via Adapter? Likely Adapter.
  getStateVector(): Uint8Array;
  encodeStateAsUpdate(): Uint8Array;
  applyUpdate(update: Uint8Array): void;
  destroy(): void;
  // Undo/Redo methods - These are often tied to the adapter/Yjs UndoManager
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  // Awareness methods remain relevant to the document state container
  getAwarenessStates(): Map<number, AwarenessState>;
  setLocalCursor(position: CursorPosition | null): void;
  setLocalUser(user: AwarenessState["user"]): void;
}

/** Document options interface (from document/types) - May need renaming or merging */
// Keeping this for potential non-Yjs specific document metadata/config if needed
export interface DocumentOptions {
  id?: string;
  type?: string; // Document type (e.g., 'markdown', 'docx') - useful metadata
}

export interface CollaborationOptions {
  // Perhaps only for enabling/disabling collaboration or passing an existing YDoc?
  enabled?: boolean; // Explicitly enable/disable
  ydoc?: Y.Doc; // Allow passing an existing YDoc
}

/** Document fragment for large document handling (from document/types) */
export interface DocumentFragment {
  path: (string | number)[];
  doc: CollaborativeDocument | null; // Use the main interface
  metadata?: {
    createdAt: number;
    lastAccessed: number;
    size?: number;
    [key: string]: unknown;
  };
}

/** Fragment manager interface (from document/types) */
export interface FragmentManager {
  createFragment(
    path: (string | number)[],
    options?: { metadata?: Record<string, unknown> },
  ): DocumentFragment;
  getFragment(path: (string | number)[]): DocumentFragment | null;
  hasFragment(path: (string | number)[]): boolean;
  listFragments(): DocumentFragment[];
  removeFragment(path: (string | number)[]): boolean;
}

// --- Processor Types (from processor/types) ---

/** Types of document change events */
export enum ChangeEventType {
  YJS_TEXT = "yjs-text",
  YJS_MAP = "yjs-map",
  YJS_ARRAY = "yjs-array",
  YJS_XML = "yjs-xml",
  UNIFIED_PARSE = "unified-parse",
  UNIFIED_TRANSFORM = "unified-transform",
  UNIFIED_COMPILE = "unified-compile",
  UNIFIED_PROCESS = "unified-process",
  SYNC_APPLIED = "sync-applied",
  SYNC_CONFLICT = "sync-conflict",
  SYNC_RESOLVED = "sync-resolved",
}

/** Base change event interface */
export interface ChangeEvent {
  type: ChangeEventType;
  timestamp: number;
  source?: "local" | "remote" | "plugin" | "system";
  path?: string[];
  id?: string;
  error?: Error; // Added optional error field
  metadata?: Record<string, unknown>; // Added generic metadata
}

// Specific change event interfaces can be defined here if needed,
// or kept internal to the processor/event system.

/** Event listener type for change events */
export type ChangeEventListener = (event: ChangeEvent) => void;

/** Collaborative transformer function type */
export type CollaborativeTransformer = (node: Node) => Promise<Node> | Node;

/** DocenProcessor extends the standard unified processor */
export interface DocenProcessor extends UnifiedProcessor {
  // Add Docen specific methods
  observeChanges(callback: (changes: Array<ChangeEvent>) => void): () => void;
  getDocument(): CollaborativeDocument | null;
  setCursor(position: { path: (string | number)[]; offset: number }): this;
  setSelection(range: {
    anchor: { path: (string | number)[]; offset: number };
    head: { path: (string | number)[]; offset: number };
  }): this;
  getCursors(): Array<{
    clientId: number;
    user: AwarenessState["user"];
    cursor: CursorPosition | null;
  }>;
  getYjsAdapter(): YjsAdapter | null;

  // Add context if needed internally (though direct access might be discouraged)
  // context?: any;
}

/** Options for creating a Docen processor */
export interface DocenProcessorOptions {
  source?: string; // Keep source VFile option
  plugins?: UnifiedPlugin[]; // Keep plugins
  adapter?: "remark" | "rehype" | "retext" | "recma"; // Keep adapter hint
  collaborative?: boolean; // Keep flag to enable collaboration mode
  ydoc?: Y.Doc; // Allow passing initial Y.Doc
  // Add yjsAdapterOptions to group all Yjs specific configs
  yjsAdapterOptions?: YjsAdapterOptions;
  // Keep fragmentOptions at processor level if it affects processing logic
  fragmentOptions?: {
    enabled: boolean;
    threshold?: number;
    maxFragments?: number;
    nodeTypes?: string[];
  };
  // Plugin Discovery might remain a processor-level option
  pluginDiscovery?: {
    enabled: boolean;
    paths?: string[];
  };
}

// --- Plugin Types (from plugins/types) ---

/** Plugin metadata interface */
export interface PluginMeta {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  dependencies?: string[];
  formats?: string[];
  configSchema?: Record<string, unknown>;
}

/** Plugin definition for Docen */
export interface DocenPlugin extends UnifiedPlugin {
  meta?: PluginMeta;
  defaultEnabled?: boolean;
  priority?: number;
  phase?: "parse" | "transform" | "compile" | "all";
}

/** Plugin options for Docen processor */
export interface PluginOptions {
  discoveryPath?: string;
  enabledPlugins?: string[];
  disabledPlugins?: string[];
  pluginSettings?: Record<string, Record<string, unknown>>;
}

// --- Utility Types (from utils/types) ---

/** Extended data for VFile that includes collaborative properties */
export interface CollaborativeVFileData extends VFileData {
  collaborativeDocument?: CollaborativeDocument;
  awareness?: {
    clientId: number;
    cursor?: { index: number; length: number; path: (string | number)[] };
    user?: { name?: string; id?: string; color?: string };
  };
  processing?: {
    startTime?: number;
    endTime?: number;
    stats?: Record<string, unknown>;
  };
}

/** Path in a document */
export type DocPath = (string | number)[];

/** A unique ID for a document or fragment */
export type DocId = string;

/** Timestamp used for tracking modifications */
export type Timestamp = number;

/** User info for awareness and collaboration */
export interface UserInfo {
  id: string;
  name?: string;
  avatar?: string;
  color?: string;
  [key: string]: unknown;
}

// --- Yjs Adapter Specific Types (Keep in yjs/types) ---
// Import YjsAdapterOptions from yjs/types when needed elsewhere
// Define YjsAdapter interface here as it's a core concept
export interface YjsAdapter {
  doc: Y.Doc;
  rootMap: Y.Map<any>;
  undoManager: Y.UndoManager | null;
  bindingStrategies: Record<string, NodeBindingStrategy>;
  bindNode(node: Node): Node & CollaborativeNode;
  unbindNode(node: Node & CollaborativeNode): Node;
  resolveConflict(conflict: SyncConflict): ResolvedNode;
  transact<T>(fn: () => T, origin?: string): T;
  observeChanges(
    callback: (
      events: Array<Y.YEvent<any>>,
      transaction: Y.Transaction,
    ) => void,
  ): () => void;
}

// --- Awareness type (needs definition) ---
// Forward declare Awareness or import from ./yjs/awareness
// Needs to be defined before CollaborativeDocument uses it.
export interface Awareness {
  readonly clientID: number;
  doc: Y.Doc;
  getLocalState(): AwarenessState | null;
  setLocalState(state: Partial<AwarenessState> | null): void;
  setLocalStateField(field: string, value: any): void;
  getStates(): Map<number, AwarenessState>;
  on(
    event: "change" | "update",
    cb: (
      changes: { added: number[]; updated: number[]; removed: number[] },
      origin: any,
    ) => void,
  ): void;
  off(
    event: "change" | "update",
    cb: (
      changes: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown,
    ) => void,
  ): void;
  destroy(): void;
}

// --- Yjs Adapter Options Import/Export ---
// Keep YjsAdapterOptions defined in yjs/types, but re-export it from here
// if it should be part of the core package's public API.
export type { YjsAdapterOptions } from "./yjs/types";
