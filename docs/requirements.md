# Docen Project Requirements

## Project Overview

Docen is a universal document conversion and processing library that supports parsing, transformation, and serialization of multiple file formats with built-in collaborative editing. It integrates the unified.js ecosystem for content transformation with Yjs for real-time collaboration, designed to run in any JavaScript runtime environment, including browsers, Node.js, Deno, Cloudflare Workers, and Edge Functions.

## Architecture Design

### Core Philosophy: Collaboration-First

Docen follows a collaboration-first approach, with Yjs as the foundation for real-time document collaboration integrated with unified.js processing pipeline:

```
| ........................ collaborative process ........................... |
| ... parse ... | ... transform(async) ... | ... stringify ... | ... sync ... |

          +--------+                 +----------+        +----------+
Input ->- | Parser | -> AST -> | -> | Compiler | -> | -> |   Yjs    | -> Collaborative
          +--------+     |          +----------+     |    | Provider |    Document
                         |                           |    +----------+
                   +--------------+            +--------------+
                   | Transformers |            | Synchronizers |
                   +--------------+            +--------------+
```

### Modular Structure

The project follows a modular design that maintains strict compatibility with unified.js while adding collaborative capabilities:

1. **Core Module (@docen/core)**

   - Provides a processor interface that extends unified.js
   - Implements unified-compatible plugin system
   - Creates bidirectional bindings between AST and Yjs
   - Uses unist/unified types with minimal extensions
   - Leverages unified.js utilities (unist-util-\*)
   - Follows unified.js architectural patterns

2. **Document Processing (@docen/document)**

   - Directly uses remark and rehype processors
   - Provides adapters for various syntax trees (mdast, hast, etc.)
   - Enables collaborative editing for text documents
   - Maintains compatibility with existing unified.js plugins
   - Implements specialized processors for different formats
   - Preserves document structure during collaboration

3. **Data Processing (@docen/data)**

   - Integrates with xast for XML processing
   - Provides collaborative data structure editing
   - Implements unified-based transformation pipelines
   - Supports bidirectional format conversion
   - Preserves data schemas in collaborative context
   - Extends unified for structured data processing

4. **Media Processing (@docen/media)**

   - Extends unified processing to binary content
   - Implements specialized media node types
   - Provides collaborative annotation capabilities
   - Uses chunked binary data handling
   - Integrates with Yjs for real-time updates
   - Maintains unified.js architectural patterns

5. **Office Document Processing (@docen/office)**

   - Handles PDF documents using unpdf from UnJS
   - Processes Office formats (DOCX, XLSX, PPTX)
   - Provides document conversion between formats
   - Implements AST representations for Office documents
   - Enables collaborative editing of Office documents
   - Integrates with Yjs for real-time document updates
   - Maintains cross-platform compatibility

6. **Providers (@docen/providers)**

   - Implements standard Yjs providers
   - Supports subdocument synchronization
   - Handles connection lifecycle and recovery
   - Implements awareness for collaborative presence
   - Provides offline capabilities
   - Creates unified interfaces for different backends

7. **Main Package (docen)**
   - Provides unified.js-compatible factory functions
   - Integrates all modules with consistent APIs
   - Implements automatic processor configuration
   - Supports unified.js plugin discovery
   - Handles cross-platform compatibility
   - Exposes both unified and collaborative interfaces

### Code Organization

Each package follows standard unified.js project structure:

```
packages/[package-name]/
├── src/
│   ├── ast/             # AST type definitions extending unist
│   │   ├── nodes.ts     # Node type definitions aligned with unified.js
│   │   ├── schema.ts    # AST schema validation
│   │   └── index.ts     # Type exports
│   ├── processor/       # unified-compatible processors
│   │   ├── [format].ts  # Format-specific processor
│   │   └── index.ts
│   ├── plugins/         # unified-compatible plugins
│   │   ├── [plugin].ts
│   │   └── index.ts
│   ├── yjs/             # Yjs integration adapters
│   │   ├── binding.ts   # AST-Yjs binding strategies
│   │   ├── sync.ts      # Synchronization utilities
│   │   └── index.ts
│   ├── utils/           # Utilities leveraging unist-util-*
│   └── index.ts         # Main entry point
├── test/                # Tests
├── README.md            # Documentation
└── package.json         # Package metadata
```

## Core Types and Interfaces

### Processor Interface

```typescript
import { Processor as UnifiedProcessor, Plugin } from "unified";
import { VFile } from "vfile";
import * as Y from "yjs";

// Processor extension for collaborative features
export interface DocenProcessor extends UnifiedProcessor {
  // Collaborative processing aligned with unified API patterns
  use(plugin: Plugin): this;
  process(
    fileOrDoc: VFile | CollaborativeDocument,
    done?: ProcessCallback,
  ): Promise<VFile & { collaborativeDocument?: CollaborativeDocument }>;

  // Yjs integration
  useCollaboration(options?: CollaborationOptions): this;
  observeChanges(callback: (changes: Change[]) => void): () => void;
}

// Collaboration options interface
export interface CollaborationOptions {
  ydoc?: Y.Doc;
  syncStrategy?: "timestamp" | "intent-based" | "custom";
  undoManager?: boolean;
  fragmentOptions?: {
    enabled: boolean;
    threshold?: number;
    maxFragments?: number;
  };
  // Custom sync strategy implementation
  customSyncHandler?: (conflict: SyncConflict) => ResolvedNode;
}

// Conflict definition for sync strategies
export interface SyncConflict {
  localNode: Node;
  remoteNode: Node;
  localTimestamp: number;
  remoteTimestamp: number;
  path: (string | number)[];
}

// Factory function that creates a docen processor
export function docen(): DocenProcessor;

// Factory function for creating a processor with a specific adapter
export function createProcessor(options?: {
  adapter?: "remark" | "rehype" | "retext" | "recma";
  collaborative?: boolean;
  syncStrategy?: "timestamp" | "intent-based" | "custom";
  customSyncHandler?: (conflict: SyncConflict) => ResolvedNode;
}): DocenProcessor {
  // Implementation...
}
```

### AST Structure

The AST structure follows unist specifications with minimal collaboration extensions:

```typescript
import { Node as UnistNode, Parent as UnistParent } from "unist";

// Base node interface extends unist Node
export interface Node extends UnistNode {
  // Optional collaboration metadata
  collaborationMetadata?: {
    createdBy?: string;
    createdAt?: number;
    modifiedBy?: string;
    modifiedAt?: number;
    version?: number;
    // Timestamp for synchronization conflict resolution
    lastModifiedTimestamp?: number;
  };
}

// Parent node with children
export interface Parent extends Node, UnistParent {
  children: Node[];
}

// Root document node
export interface DocenRoot extends Parent {
  type: "root";
  children: Node[];
  metadata?: Record<string, unknown>;
}
```

### Yjs Integration

The Yjs integration will use a simplified adapter pattern with timestamp-based synchronization strategy by default:

```typescript
import * as Y from "yjs";
import { visit } from "unist-util-visit";
import { map } from "unist-util-map";
import { filter } from "unist-util-filter";
import { findAndReplace } from "mdast-util-find-and-replace";

// Define node binding strategy interface for optimized bindings
export interface NodeBindingStrategy {
  toYjs: (node: Node) => Y.AbstractType<any>;
  fromYjs: (yType: Y.AbstractType<any>) => Node;
  observe: (
    node: Node,
    yType: Y.AbstractType<any>,
    callback: (event: any) => void,
  ) => () => void;
}

// Create adapter with granular binding strategies and sync options
export function createYjsAdapter(
  doc: Y.Doc,
  options?: {
    // Mapping configurations
    nodeTypeMappings?: Record<string, "map" | "array" | "text">;
    bindingStrategies?: Record<string, NodeBindingStrategy>;

    // Sync strategy options
    syncStrategy?: "timestamp" | "intent-based" | "custom";
    customSyncHandler?: (conflict: SyncConflict) => ResolvedNode;

    // Undo support
    undoEnabled?: boolean;
    undoTrackOrigin?: string[];
  },
) {
  const rootMap = doc.getMap("root");

  // Setup timestamp-based synchronization by default
  const resolveConflict = (conflict: SyncConflict): ResolvedNode => {
    if (options?.syncStrategy === "custom" && options.customSyncHandler) {
      return options.customSyncHandler(conflict);
    }

    // Default timestamp-based resolution
    if (conflict.localTimestamp >= conflict.remoteTimestamp) {
      return { node: conflict.localNode, origin: "local" };
    } else {
      return { node: conflict.remoteNode, origin: "remote" };
    }
  };

  // Setup UndoManager if enabled
  const undoManager = options?.undoEnabled
    ? new Y.UndoManager(rootMap, {
        trackedOrigins: new Set(options.undoTrackOrigin || ["user"]),
      })
    : null;

  // Use observeDeep for more efficient change observation
  const observeChanges = (callback) => {
    const observer = (events, transaction) => {
      callback(events, transaction);
    };

    rootMap.observeDeep(observer);
    return () => rootMap.unobserveDeep(observer);
  };

  // Binding implementation
  // ...

  return {
    undoManager,
    observeChanges,
    resolveConflict,
    // Other adapter methods...
  };
}

// Example usage with unified tools
export function transformAst(ast: Node) {
  // Use syntax-tree utilities for AST transformations

  // Visit and modify nodes efficiently
  visit(ast, "paragraph", (node) => {
    // Update node properties
    node.data = node.data || {};
    node.data.modified = true;

    // Update collaboration metadata with timestamp
    node.collaborationMetadata = node.collaborationMetadata || {};
    node.collaborationMetadata.modifiedAt = Date.now();
    node.collaborationMetadata.lastModifiedTimestamp = Date.now();
  });

  // Filter nodes
  const filteredAst = filter(ast, (node) => node.type !== "comment");

  // Find and replace content
  if (ast.type === "root") {
    findAndReplace(ast, [[/pattern/, "replacement"]]);
  }

  return filteredAst;
}
```

### Collaborative Document

```typescript
// Core collaborative document interface aligned with unified terminology
export interface CollaborativeDocument {
  // Underlying Yjs document
  ydoc: Y.Doc;

  // Document identity
  id: string;

  // Convert to/from AST (aligned with unified.js terminology)
  parse(input: string): Promise<Node>;
  stringify(tree: Node): Promise<string>;
  run(tree: Node): Promise<Node>;

  // Unified-style process method
  process(input: string | Node): Promise<{ tree: Node; value: string }>;

  // Transaction handling
  transact<T>(fn: () => T, origin?: string): T;

  // Enhanced undo/redo capability with origin tracking
  undoManager: {
    undo(): void;
    redo(): void;
    canUndo(): boolean;
    canRedo(): boolean;
    // Track and group operations
    stopCapturing(): void;
    startCapturing(options?: { captureTimeout?: number }): void;
    // Event handling
    on(
      event: "stack-item-added" | "stack-item-popped",
      callback: Function,
    ): () => void;
  };

  // Synchronization strategy configuration
  setSyncStrategy(
    strategy: "timestamp" | "intent-based" | "custom",
    handler?: (conflict: SyncConflict) => ResolvedNode,
  ): void;

  // Advanced change observation
  observeChanges(
    path: string[] | ((event: Y.YEvent, transaction: Y.Transaction) => boolean),
    callback: (event: Y.YEvent, transaction: Y.Transaction) => void,
  ): () => void;

  // Enhanced version control
  getStateVector(): Uint8Array;
  encodeStateAsUpdate(): Uint8Array;
  applyUpdate(update: Uint8Array): void;

  // Synchronization
  sync(provider: SyncProvider): () => void;

  // User awareness
  awareness: Awareness;

  // Document fragment management
  fragmentManager: FragmentManager;

  // Subdocument management for large documents
  getSubdocument(path: string[]): CollaborativeDocument;
  releaseSubdocument(path: string[]): void;

  // Collaborative node creation
  createCollaborativeNode(
    nodeType: string,
    initialData?: Record<string, any>,
  ): Node & CollaborativeNode;

  // Clean up resources
  destroy(): void;
}

// Synchronization conflict resolution type
export interface ResolvedNode {
  node: Node;
  origin: "local" | "remote" | "merged";
}

// Extended node interface with collaboration capabilities
export interface CollaborativeNode extends Node {
  // Collaboration metadata with timestamp
  collaborationMetadata: {
    createdBy?: string;
    createdAt?: number;
    modifiedBy?: string;
    modifiedAt?: number;
    lastModifiedTimestamp: number; // Used for timestamp-based synchronization
    version?: number;
    origin?: string;
  };

  // Yjs binding information
  binding?: {
    type: Y.AbstractType<any>;
    path: (string | number)[];
    observe(callback: (event: Y.YEvent) => void): () => void;
    update(newValue: any): void;
  };
}

// Factory function for document creation with sync strategy options
export function createDocument(
  content?: string | Node | Uint8Array,
  options?: {
    id?: string;
    type?: string;
    collaborative?: boolean;
    // Synchronization strategy configuration
    syncStrategy?: "timestamp" | "intent-based" | "custom";
    customSyncHandler?: (conflict: SyncConflict) => ResolvedNode;
    // Undo manager settings
    undoManagerOptions?: {
      enabled?: boolean;
      trackedOrigins?: Set<string>;
      captureTimeout?: number;
    };
    bindingStrategy?: "deep" | "shallow" | "lazy";
    schema?: DocumentSchema;
    fragmentOptions?: {
      enableAutoFragmentation?: boolean;
      threshold?: number;
      nodeTypes?: string[];
    };
  },
): CollaborativeDocument {
  // Implementation would support timestamp-based synchronization by default
  // ...
}

// Enhanced UndoManager factory
export function createUndoManager(
  doc: CollaborativeDocument,
  options?: {
    trackedOrigins?: Set<string>;
    captureTimeout?: number;
    trackedRoots?: Array<Y.AbstractType<any>>;
  },
) {
  const undoManager = new Y.UndoManager(
    options?.trackedRoots || [doc.ydoc.getMap("root")],
    {
      trackedOrigins: options?.trackedOrigins || new Set(["user-edit"]),
      captureTimeout: options?.captureTimeout || 500,
    },
  );

  return {
    undo() {
      undoManager.undo();
    },
    redo() {
      undoManager.redo();
    },
    canUndo() {
      return undoManager.canUndo();
    },
    canRedo() {
      return undoManager.canRedo();
    },
    stopCapturing() {
      undoManager.stopCapturing();
    },
    startCapturing(opts) {
      undoManager.stopCapturing();
      undoManager.captureTimeout = opts?.captureTimeout || 500;
    },
    on(event, callback) {
      undoManager.on(event, callback);
      return () => {
        undoManager.off(event, callback);
      };
    },
  };
}

// Schema validation for documents
export interface DocumentSchema {
  // Node type definitions
  nodeTypes: Record<string, NodeTypeDefinition>;
  // Validation rules
  validationRules: ValidationRule[];
  // Error handling configuration
  onValidationError?: (error: ValidationError) => "ignore" | "fix" | "reject";
}

export interface NodeTypeDefinition {
  // Required properties
  required?: string[];
  // Property types
  properties?: Record<
    string,
    {
      type: "string" | "number" | "boolean" | "object" | "array";
      items?: NodeTypeDefinition;
    }
  >;
  // Allowed child node types
  allowedChildren?: string[];
  // Binding strategy override
  bindingStrategy?: "deep" | "shallow" | "lazy";
}

export interface ValidationRule {
  // Node selector (type or path)
  selector: string | ((node: Node) => boolean);
  // Validation function
  validate: (node: Node) => boolean | ValidationError;
}

export interface ValidationError {
  node: Node;
  path: (string | number)[];
  message: string;
  code: string;
  severity: "warning" | "error";
  suggestions?: Array<{
    message: string;
    fix: () => void;
  }>;
}
```

## Cursor and Selection Tracking

Docen provides robust cursor and selection tracking capabilities using Yjs relative positions:

```typescript
import * as Y from "yjs";
import {
  createRelativePositionFromTypeIndex,
  createAbsolutePositionFromRelativePosition,
  RelativePosition,
  AbsolutePosition,
} from "yjs";

// Types for cursor and selection positions
export interface CursorPosition {
  // Store positions as Yjs relative positions that automatically
  // adapt to document changes
  anchor: RelativePosition;
  head?: RelativePosition; // For selections
}

// Extended awareness interface for collaborative editing
export interface CollaborativeAwareness {
  // Standard Yjs awareness methods
  setLocalState(state: Record<string, any>): void;
  getLocalState(): Record<string, any> | null;
  getStates(): Map<number, Record<string, any>>;
  on(
    event: "change",
    callback: (changes: {
      added: number[];
      updated: number[];
      removed: number[];
    }) => void,
  ): void;
  off(event: "change", callback: Function): void;

  // Enhanced cursor tracking methods
  setCursor(position: { path: (string | number)[]; offset: number }): void;
  setSelection(range: {
    anchor: { path: (string | number)[]; offset: number };
    head: { path: (string | number)[]; offset: number };
  }): void;

  // Get all user cursors/selections with absolute positions
  getCursors(): Array<{
    clientId: number;
    user: any;
    cursor: AbsolutePosition | null;
    selection: { anchor: AbsolutePosition; head: AbsolutePosition } | null;
  }>;
}

// Helper functions for cursor tracking
export const cursorUtils = {
  // Create a relative position from a path and offset
  createRelativePosition(
    doc: Y.Doc,
    path: (string | number)[],
    offset: number,
  ): RelativePosition {
    return createRelativePositionFromTypeIndex(doc, path, offset);
  },

  // Convert a relative position to an absolute position
  createAbsolutePosition(
    relPos: RelativePosition,
    doc: Y.Doc,
  ): AbsolutePosition | null {
    return createAbsolutePositionFromRelativePosition(relPos, doc);
  },

  // Convert absolute position to path and offset
  absolutePositionToPathOffset(
    absPos: AbsolutePosition,
  ): { path: (string | number)[]; offset: number } | null {
    if (!absPos) return null;
    return {
      path: absPos.type ? [absPos.type.nodeName] : [],
      offset: absPos.index,
    };
  },

  // Map unified AST positions to Yjs positions
  astPositionToYjsPosition(
    node: Node,
    offset: number,
    doc: Y.Doc,
  ): RelativePosition {
    // Traverse AST to find the path to the node
    const path = this.findNodePath(doc.getMap("root"), node);
    if (path) {
      return this.createRelativePosition(doc, [...path, "value"], offset);
    }
    throw new Error("Cannot find node in Yjs document");
  },
};

// Example usage of cursor tracking
function setupCursorTracking(doc: CollaborativeDocument) {
  // Set local cursor when user clicks/selects
  function onCursorChange(position: {
    path: (string | number)[];
    offset: number;
  }) {
    doc.awareness.setCursor(position);
  }

  // Listen for remote cursor changes
  doc.awareness.on("change", (changes) => {
    const cursors = doc.awareness.getCursors();

    // Render remote cursors in the interface
    for (const { clientId, user, cursor } of cursors) {
      if (clientId !== doc.awareness.getLocalState()?.clientId) {
        // Render cursor at position
        const position = cursorUtils.absolutePositionToPathOffset(cursor);
        if (position) {
          console.log(`User ${user.name} cursor at:`, position);
          // Render cursor in UI...
        }
      }
    }
  });

  return {
    disconnect() {
      // Clean up event listeners
      doc.awareness.off("change", () => {});
    },
  };
}
```

## Enhanced Awareness and Presence

Docen extends the Yjs awareness system with rich presence information and VFile integration:

```typescript
import * as Y from "yjs";
import { VFile } from "vfile";

/**
 * Types of user events
 */
export enum UserEventType {
  USER_JOINED = "user-joined",
  USER_LEFT = "user-left",
  USER_UPDATED = "user-updated",
  CURSOR_MOVED = "cursor-moved",
  SELECTION_CHANGED = "selection-changed",
  FOCUS_SECTION = "focus-section",
  USER_IDLE = "user-idle",
  USER_ACTIVE = "user-active",
  USER_TYPING = "user-typing",
}

/**
 * Event listener type for user events
 */
export type UserEventListener = (event: UserEvent) => void;

/**
 * Base user event interface
 */
export interface UserEvent {
  type: UserEventType;
  timestamp: number;
  userId: string;
}

/**
 * User joined event
 */
export interface UserJoinedEvent extends UserEvent {
  type: UserEventType.USER_JOINED;
  userInfo: UserInfo;
}

/**
 * User left event
 */
export interface UserLeftEvent extends UserEvent {
  type: UserEventType.USER_LEFT;
}

/**
 * User updated event
 */
export interface UserUpdatedEvent extends UserEvent {
  type: UserEventType.USER_UPDATED;
  userInfo: UserInfo;
}

/**
 * Cursor moved event
 */
export interface CursorMovedEvent extends UserEvent {
  type: UserEventType.CURSOR_MOVED;
  position: {
    path: string[];
    offset: number;
  };
}

/**
 * Selection changed event
 */
export interface SelectionChangedEvent extends UserEvent {
  type: UserEventType.SELECTION_CHANGED;
  selection: {
    start: {
      path: string[];
      offset: number;
    };
    end: {
      path: string[];
      offset: number;
    };
  };
}

/**
 * Focus section event
 */
export interface FocusSectionEvent extends UserEvent {
  type: UserEventType.FOCUS_SECTION;
  sectionId: string;
}

/**
 * User idle event
 */
export interface UserIdleEvent extends UserEvent {
  type: UserEventType.USER_IDLE;
  idleTime: number;
}

/**
 * User active event
 */
export interface UserActiveEvent extends UserEvent {
  type: UserEventType.USER_ACTIVE;
}

/**
 * User typing event
 */
export interface UserTypingEvent extends UserEvent {
  type: UserEventType.USER_TYPING;
  position: {
    path: string[];
    offset: number;
  };
}

/**
 * Union type for all user events
 */
export type DocenUserEvent =
  | UserJoinedEvent
  | UserLeftEvent
  | UserUpdatedEvent
  | CursorMovedEvent
  | SelectionChangedEvent
  | FocusSectionEvent
  | UserIdleEvent
  | UserActiveEvent
  | UserTypingEvent;

/**
 * User information
 */
export interface UserInfo {
  id: string;
  name: string;
  color?: string;
  avatar?: string;
  status?: "online" | "idle" | "offline" | "busy";
  lastActive?: number;
  customData?: Record<string, any>;
}

/**
 * Enhanced awareness system
 */
export class EnhancedAwareness {
  private awareness: Y.Awareness;
  private localUser: UserInfo;
  private eventListeners: Map<UserEventType, Set<UserEventListener>> =
    new Map();
  private idleTimeout: number = 60000; // 1 minute
  private idleTimer: NodeJS.Timeout | null = null;
  private typingDebounceTimer: NodeJS.Timeout | null = null;

  constructor(awareness: Y.Awareness, localUser: UserInfo) {
    this.awareness = awareness;
    this.localUser = localUser;

    // Initialize awareness with local user
    this.setLocalUserInfo(localUser);

    // Set up awareness change handler
    this.awareness.on("change", this.handleAwarenessChange.bind(this));
  }

  /**
   * Get all connected users
   */
  getAllUsers(): UserInfo[] {
    const states = this.awareness.getStates();
    const users: UserInfo[] = [];

    states.forEach((state, clientId) => {
      if (state.user) {
        users.push(state.user as UserInfo);
      }
    });

    return users;
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): UserInfo | null {
    const states = this.awareness.getStates();

    for (const [clientId, state] of states.entries()) {
      if (state.user && state.user.id === userId) {
        return state.user as UserInfo;
      }
    }

    return null;
  }

  /**
   * Set local user info
   */
  setLocalUserInfo(userInfo: Partial<UserInfo>): void {
    // Update local user info
    this.localUser = { ...this.localUser, ...userInfo };

    // Update awareness state
    const currentState = this.awareness.getLocalState() || {};
    this.awareness.setLocalState({
      ...currentState,
      user: this.localUser,
      lastActive: Date.now(),
    });

    // Emit user updated event
    this.emitEvent({
      type: UserEventType.USER_UPDATED,
      timestamp: Date.now(),
      userId: this.localUser.id,
      userInfo: this.localUser,
    });

    // Reset idle timer
    this.resetIdleTimer();
  }

  /**
   * Set user cursor position
   */
  setCursorPosition(path: string[], offset: number): void {
    const cursorEvent: CursorMovedEvent = {
      type: UserEventType.CURSOR_MOVED,
      timestamp: Date.now(),
      userId: this.localUser.id,
      position: {
        path,
        offset,
      },
    };

    // Update awareness state
    const currentState = this.awareness.getLocalState() || {};
    this.awareness.setLocalState({
      ...currentState,
      cursor: cursorEvent.position,
      lastActive: Date.now(),
    });

    // Emit cursor moved event
    this.emitEvent(cursorEvent);

    // Also emit typing event with debounce
    this.debouncedEmitTyping(path, offset);

    // Reset idle timer
    this.resetIdleTimer();
  }

  /**
   * Set user selection
   */
  setSelection(
    startPath: string[],
    startOffset: number,
    endPath: string[],
    endOffset: number,
  ): void {
    const selectionEvent: SelectionChangedEvent = {
      type: UserEventType.SELECTION_CHANGED,
      timestamp: Date.now(),
      userId: this.localUser.id,
      selection: {
        start: {
          path: startPath,
          offset: startOffset,
        },
        end: {
          path: endPath,
          offset: endOffset,
        },
      },
    };

    // Update awareness state
    const currentState = this.awareness.getLocalState() || {};
    this.awareness.setLocalState({
      ...currentState,
      selection: selectionEvent.selection,
      lastActive: Date.now(),
    });

    // Emit selection changed event
    this.emitEvent(selectionEvent);

    // Reset idle timer
    this.resetIdleTimer();
  }

  /**
   * Focus a specific section
   */
  focusSection(sectionId: string): void {
    const focusEvent: FocusSectionEvent = {
      type: UserEventType.FOCUS_SECTION,
      timestamp: Date.now(),
      userId: this.localUser.id,
      sectionId,
    };

    // Update awareness state
    const currentState = this.awareness.getLocalState() || {};
    this.awareness.setLocalState({
      ...currentState,
      focusedSection: sectionId,
      lastActive: Date.now(),
    });

    // Emit focus section event
    this.emitEvent(focusEvent);

    // Reset idle timer
    this.resetIdleTimer();
  }

  /**
   * Add an event listener
   */
  on(
    eventType: UserEventType | UserEventType[],
    callback: UserEventListener,
  ): () => void {
    const types = Array.isArray(eventType) ? eventType : [eventType];
    const cleanups: Array<() => void> = [];

    types.forEach((type) => {
      if (!this.eventListeners.has(type)) {
        this.eventListeners.set(type, new Set());
      }

      this.eventListeners.get(type)!.add(callback);

      cleanups.push(() => {
        const listeners = this.eventListeners.get(type);
        if (listeners) {
          listeners.delete(callback);
        }
      });
    });

    // Return unsubscribe function
    return () => cleanups.forEach((cleanup) => cleanup());
  }

  /**
   * Emit an event
   */
  private emitEvent(event: DocenUserEvent): void {
    // Notify listeners for the specific event type
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }

    // Also notify listeners for all events
    const allEventListeners = this.eventListeners.get("all" as any);
    if (allEventListeners) {
      allEventListeners.forEach((listener) => listener(event));
    }
  }

  /**
   * Handle awareness changes
   */
  private handleAwarenessChange(changes: {
    added: number[];
    updated: number[];
    removed: number[];
  }): void {
    const states = this.awareness.getStates();
    const timestamp = Date.now();

    // Handle added users
    changes.added.forEach((clientId) => {
      const state = states.get(clientId);
      if (state && state.user) {
        const userInfo = state.user as UserInfo;
        this.emitEvent({
          type: UserEventType.USER_JOINED,
          timestamp,
          userId: userInfo.id,
          userInfo,
        });
      }
    });

    // Handle updated users
    changes.updated.forEach((clientId) => {
      const state = states.get(clientId);
      if (state && state.user) {
        const userInfo = state.user as UserInfo;
        this.emitEvent({
          type: UserEventType.USER_UPDATED,
          timestamp,
          userId: userInfo.id,
          userInfo,
        });
      }
    });

    // Handle removed users
    changes.removed.forEach((clientId) => {
      // Note: we can't get the state here as it's already removed
      // We need to use the client ID as best effort
      this.emitEvent({
        type: UserEventType.USER_LEFT,
        timestamp,
        userId: `client-${clientId}`,
      });
    });
  }

  /**
   * Reset the idle timer
   */
  private resetIdleTimer(): void {
    // Clear existing timer
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
    }

    // Set new timer
    this.idleTimer = setTimeout(() => {
      // Update awareness state
      const currentState = this.awareness.getLocalState() || {};
      this.awareness.setLocalState({
        ...currentState,
        status: "idle",
        lastActive: Date.now() - this.idleTimeout,
      });

      // Emit idle event
      this.emitEvent({
        type: UserEventType.USER_IDLE,
        timestamp: Date.now(),
        userId: this.localUser.id,
        idleTime: this.idleTimeout,
      });
    }, this.idleTimeout);

    // If previously idle, emit active event
    const currentState = this.awareness.getLocalState() || {};
    if (currentState.status === "idle") {
      // Update awareness state
      this.awareness.setLocalState({
        ...currentState,
        status: "online",
        lastActive: Date.now(),
      });

      // Emit active event
      this.emitEvent({
        type: UserEventType.USER_ACTIVE,
        timestamp: Date.now(),
        userId: this.localUser.id,
      });
    }
  }

  /**
   * Emit typing event with debounce
   */
  private debouncedEmitTyping(path: string[], offset: number): void {
    // Clear existing timer
    if (this.typingDebounceTimer !== null) {
      clearTimeout(this.typingDebounceTimer);
    }

    // Set new timer
    this.typingDebounceTimer = setTimeout(() => {
      this.emitEvent({
        type: UserEventType.USER_TYPING,
        timestamp: Date.now(),
        userId: this.localUser.id,
        position: {
          path,
          offset,
        },
      });
      this.typingDebounceTimer = null;
    }, 300);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Clear all timers
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
    }

    if (this.typingDebounceTimer !== null) {
      clearTimeout(this.typingDebounceTimer);
    }

    // Remove awareness listeners
    this.awareness.off("change", this.handleAwarenessChange.bind(this));

    // Clear event listeners
    this.eventListeners.clear();
  }
}

/**
 * AwarenessVFile interface to integrate with unified.js
 */
export interface AwarenessVFile extends VFile {
  awareness: {
    instance: EnhancedAwareness;

    // Get all users
    getUsers(): UserInfo[];

    // Get a specific user
    getUser(id: string): UserInfo | null;

    // Update local user
    updateUser(info: Partial<UserInfo>): void;

    // Set cursor position
    setCursor(path: string[], offset: number): void;

    // Set selection
    setSelection(
      startPath: string[],
      startOffset: number,
      endPath: string[],
      endOffset: number,
    ): void;

    // Focus a section
    focusSection(sectionId: string): void;

    // Observe user events
    observe(
      type: UserEventType | UserEventType[],
      callback: UserEventListener,
    ): () => void;
  };
}

/**
 * Create AwarenessVFile to integrate with unified.js
 */
export function createAwarenessVFile(
  content: string,
  doc: Y.Doc,
  userInfo: UserInfo,
): AwarenessVFile {
  const vfile = new VFile(content) as AwarenessVFile;
  const awareness = new Y.Awareness(doc);
  const enhancedAwareness = new EnhancedAwareness(awareness, userInfo);

  // Add awareness to VFile
  vfile.awareness = {
    instance: enhancedAwareness,

    getUsers(): UserInfo[] {
      return enhancedAwareness.getAllUsers();
    },

    getUser(id: string): UserInfo | null {
      return enhancedAwareness.getUserById(id);
    },

    updateUser(info: Partial<UserInfo>): void {
      enhancedAwareness.setLocalUserInfo(info);
    },

    setCursor(path: string[], offset: number): void {
      enhancedAwareness.setCursorPosition(path, offset);
    },

    setSelection(
      startPath: string[],
      startOffset: number,
      endPath: string[],
      endOffset: number,
    ): void {
      enhancedAwareness.setSelection(
        startPath,
        startOffset,
        endPath,
        endOffset,
      );
    },

    focusSection(sectionId: string): void {
      enhancedAwareness.focusSection(sectionId);
    },

    observe(
      type: UserEventType | UserEventType[],
      callback: UserEventListener,
    ): () => void {
      return enhancedAwareness.on(type, callback);
    },
  };

  return vfile;
}

/**
 * Example usage with unified integration
 */
function setupCollaborativeAwareness(
  content: string,
  processor: DocenProcessor,
) {
  const doc = new Y.Doc();

  // Create user info
  const userInfo: UserInfo = {
    id: "user1",
    name: "User 1",
    color: "#ff0000",
    status: "online",
  };

  // Create awareness VFile
  const vfile = createAwarenessVFile(content, doc, userInfo);

  // Process content with unified and Yjs integration
  processor
    .useCollaboration({ ydoc: doc, syncStrategy: "timestamp" })
    .process(vfile)
    .then((file) => {
      console.log("Processing complete");

      // Get all users
      console.log("Connected users:", file.awareness.getUsers());

      // Update user info
      file.awareness.updateUser({ status: "busy" });

      // Set cursor position
      file.awareness.setCursor(["root", "children", "0"], 5);

      // Subscribe to user events
      const unsubscribe = file.awareness.observe(
        UserEventType.USER_JOINED,
        (event) => {
          console.log("User joined:", event);
        },
      );

      return {
        file,
        cleanup: () => {
          unsubscribe();
        },
      };
    });

  return vfile;
}
```

## Syntax Tree Integration

Docen provides deep integration with the unified.js syntax tree utilities, leveraging them for collaborative document operations:

```typescript
import { Node, Parent } from "unist";
import { visit, SKIP, CONTINUE, EXIT } from "unist-util-visit";
import { map } from "unist-util-map";
import { filter } from "unist-util-filter";
import { select, selectAll } from "unist-util-select";
import { remove } from "unist-util-remove";
import { is } from "unist-util-is";
import { findAndReplace } from "mdast-util-find-and-replace";
import * as Y from "yjs";

/**
 * Extends unified-util-visit with collaborative capabilities
 */
export function visitCollaborative(
  tree: Node,
  test: string | object | ((node: Node) => boolean),
  visitor: (
    node: Node,
    index: number | null,
    parent: Parent | null,
    // Additional collaborative info
    yNode?: Y.AbstractType<any>,
    path?: (string | number)[],
  ) => void | boolean,
) {
  // Track the path to provide to visitor
  const path: (string | number)[] = [];

  // Track the Yjs mapping
  const yRoot = getYjsNodeForAst(tree);

  const wrappedVisitor = (
    node: Node,
    index: number | null,
    parent: Parent | null,
  ) => {
    // Update path
    if (parent && index !== null) {
      path.push("children", index);
    }

    // Get corresponding Yjs node
    const yNode = getYjsNodeAtPath(yRoot, path);

    // Call original visitor with collaborative info
    const result = visitor(node, index, parent, yNode, [...path]);

    // Reset path for siblings
    if (parent && index !== null) {
      path.pop(); // Remove index
      path.pop(); // Remove 'children'
    }

    return result;
  };

  // Use standard visit with our wrapped visitor
  return visit(tree, test, wrappedVisitor);
}

/**
 * Extends unist-util-map with collaborative capabilities
 */
export function mapCollaborative<T extends Node>(
  tree: T,
  iteratee: (
    node: Node,
    // Additional collaborative info
    yNode?: Y.AbstractType<any>,
    path?: (string | number)[],
  ) => Node,
): T {
  // Track the path
  const path: (string | number)[] = [];

  // Track the Yjs mapping
  const yRoot = getYjsNodeForAst(tree);

  const wrappedIteratee = (node: Node) => {
    // Get corresponding Yjs node
    const yNode = getYjsNodeAtPath(yRoot, path);

    // Call the original iteratee with collaborative info
    const result = iteratee(node, yNode, [...path]);

    // Update path for children
    if (isParent(node) && node.children.length > 0) {
      path.push("children");
      // Process children
      for (let i = 0; i < node.children.length; i++) {
        path.push(i);
        // Reset after each child
        path.pop();
      }
      path.pop(); // Remove 'children'
    }

    return result;
  };

  // Use standard map with our wrapped iteratee
  return map(tree, wrappedIteratee);
}

/**
 * Creates, updates, or removes nodes with automatic Yjs binding
 */
export function modifyAST(
  doc: Y.Doc,
  tree: Node,
  options: {
    select?: string | ((node: Node) => boolean);
    add?: (selected: Node[]) => Node[];
    update?: (node: Node) => Node;
    remove?: boolean;
  },
) {
  // Use the corresponding Yjs root
  const yRoot = doc.getMap("root");

  doc.transact(() => {
    // Handle selection
    let selectedNodes: Node[] = [];
    if (options.select) {
      if (typeof options.select === "string") {
        selectedNodes = selectAll(options.select, tree);
      } else if (typeof options.select === "function") {
        visit(tree, options.select, (node) => {
          selectedNodes.push(node);
        });
      }
    }

    // Handle removal
    if (options.remove) {
      remove(tree, (node) => selectedNodes.includes(node));

      // Also remove from Yjs
      selectedNodes.forEach((node) => {
        const path = findNodePath(tree, node);
        if (path) {
          removeYjsNodeAtPath(yRoot, path);
        }
      });
    }

    // Handle update
    if (options.update) {
      selectedNodes.forEach((node) => {
        const updated = options.update(node);
        Object.assign(node, updated);

        // Update in Yjs
        const path = findNodePath(tree, node);
        if (path) {
          updateYjsNodeAtPath(yRoot, path, updated);
        }
      });
    }

    // Handle add
    if (options.add) {
      const newNodes = options.add(selectedNodes);

      // For each selected node that will get new siblings/children
      selectedNodes.forEach((node, index) => {
        if (isParent(node)) {
          // Add to children
          const newChild = newNodes[index % newNodes.length];
          node.children.push(newChild);

          // Add to Yjs
          const path = findNodePath(tree, node);
          if (path) {
            const yNode = getYjsNodeAtPath(yRoot, path);
            if (yNode instanceof Y.Map) {
              const yChildren = yNode.get("children");
              if (yChildren instanceof Y.Array) {
                yChildren.push([createYjsNodeFromAst(newChild)]);
              }
            }
          }
        } else if (node.parent) {
          // Add as sibling
          const parent = node.parent;
          const newSibling = newNodes[index % newNodes.length];
          const nodeIndex = parent.children.indexOf(node);
          parent.children.splice(nodeIndex + 1, 0, newSibling);

          // Add to Yjs
          const parentPath = findNodePath(tree, parent);
          if (parentPath) {
            const yParent = getYjsNodeAtPath(yRoot, parentPath);
            if (yParent instanceof Y.Map) {
              const yChildren = yParent.get("children");
              if (yChildren instanceof Y.Array) {
                yChildren.insert(nodeIndex + 1, [
                  createYjsNodeFromAst(newSibling),
                ]);
              }
            }
          }
        }
      });
    }
  });

  return tree;
}

/**
 * Batch process nodes maintaining Yjs binding
 */
export function batchProcess(
  doc: Y.Doc,
  tree: Node,
  processFunction: (node: Node) => Node,
  nodeTypes: string[] | ((node: Node) => boolean),
) {
  return doc.transact(() => {
    visitCollaborative(tree, nodeTypes, (node, index, parent, yNode, path) => {
      const processed = processFunction(node);

      // Update AST
      Object.assign(node, processed);

      // Update Yjs
      if (yNode) {
        if (yNode instanceof Y.Map) {
          // Update map properties
          Object.entries(processed).forEach(([key, value]) => {
            if (key !== "children") {
              yNode.set(key, value);
            }
          });

          // Handle children separately for better performance
          if (processed.children && isParent(processed)) {
            const yChildren = yNode.get("children");
            if (yChildren instanceof Y.Array) {
              // Update children if needed
              // This is a simplified approach - a real implementation would
              // need to handle diffing and patch children more carefully
              if (node.children.length !== processed.children.length) {
                // Replace children
                yChildren.delete(0, yChildren.length);
                processed.children.forEach((child, i) => {
                  yChildren.insert(i, [createYjsNodeFromAst(child)]);
                });
              }
            }
          }
        } else if (yNode instanceof Y.Text && "value" in processed) {
          // Update text
          yNode.delete(0, yNode.length);
          yNode.insert(0, processed.value as string);
        }
      }

      return CONTINUE;
    });

    return tree;
  });
}

/**
 * Helper function to check if node is a Parent
 */
function isParent(node: Node): node is Parent {
  return "children" in node && Array.isArray((node as Parent).children);
}

/**
 * Helper to find node path
 */
function findNodePath(tree: Node, node: Node): (string | number)[] | null {
  const path: (string | number)[] = [];
  let found = false;

  visit(tree, (_node, index, parent) => {
    if (_node === node) {
      found = true;
      return EXIT;
    }

    if (parent) {
      if (index !== null) {
        path.push("children", index);
      }

      if (found) {
        // If found, remove the last path entries
        path.pop(); // Remove index
        path.pop(); // Remove 'children'
      }
    }

    return CONTINUE;
  });

  return found ? path : null;
}

/**
 * Helper to get Yjs node for AST node
 */
function getYjsNodeForAst(node: Node): Y.AbstractType<any> | undefined {
  return (node as any).binding?.type;
}

/**
 * Helper to get Yjs node at path
 */
function getYjsNodeAtPath(
  yRoot: Y.AbstractType<any> | undefined,
  path: (string | number)[],
): Y.AbstractType<any> | undefined {
  if (!yRoot) return undefined;

  let current = yRoot;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];

    if (current instanceof Y.Map) {
      if (typeof segment === "string") {
        current = current.get(segment);
      } else {
        return undefined;
      }
    } else if (current instanceof Y.Array) {
      if (typeof segment === "number") {
        current = current.get(segment);
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Helper to update Yjs node at path
 */
function updateYjsNodeAtPath(
  yRoot: Y.Map<any>,
  path: (string | number)[],
  node: Node,
): void {
  const yNode = getYjsNodeAtPath(yRoot, path);

  if (yNode instanceof Y.Map) {
    // Update properties
    Object.entries(node).forEach(([key, value]) => {
      if (key !== "children") {
        yNode.set(key, value);
      }
    });

    // Handle children
    if (isParent(node)) {
      const yChildren = yNode.get("children");
      if (yChildren instanceof Y.Array) {
        // Replace children for simplicity
        // A real implementation would handle diffing more carefully
        yChildren.delete(0, yChildren.length);
        node.children.forEach((child, i) => {
          yChildren.insert(i, [createYjsNodeFromAst(child)]);
        });
      }
    }
  } else if (yNode instanceof Y.Text && "value" in node) {
    // Update text
    yNode.delete(0, yNode.length);
    yNode.insert(0, node.value as string);
  }
}

/**
 * Helper to remove Yjs node at path
 */
function removeYjsNodeAtPath(
  yRoot: Y.Map<any>,
  path: (string | number)[],
): void {
  // Need parent and key/index to remove
  const parentPath = path.slice(0, -2);
  const key = path[path.length - 2];
  const index = path[path.length - 1];

  const yParent = getYjsNodeAtPath(yRoot, parentPath);

  if (yParent instanceof Y.Map && key === "children") {
    const yChildren = yParent.get("children");
    if (yChildren instanceof Y.Array && typeof index === "number") {
      yChildren.delete(index, 1);
    }
  }
}

/**
 * Helper to create Yjs node from AST node
 */
function createYjsNodeFromAst(node: Node): Y.AbstractType<any> {
  if (isParent(node)) {
    const yNode = new Y.Map();

    // Set scalar properties
    Object.entries(node).forEach(([key, value]) => {
      if (key !== "children") {
        yNode.set(key, value);
      }
    });

    // Handle children
    const yChildren = new Y.Array();
    node.children.forEach((child, i) => {
      yChildren.insert(i, [createYjsNodeFromAst(child)]);
    });
    yNode.set("children", yChildren);

    return yNode;
  } else if ("value" in node && typeof node.value === "string") {
    const yText = new Y.Text();
    yText.insert(0, node.value);
    return yText;
  } else {
    const yNode = new Y.Map();
    Object.entries(node).forEach(([key, value]) => {
      yNode.set(key, value);
    });
    return yNode;
  }
}

/**
 * Example usage with unified processor
 */
function processMdastWithYjs(
  processor: DocenProcessor,
  content: string,
  doc: Y.Doc,
) {
  // Parse content to AST
  processor.parse(content).then((tree) => {
    // Modify AST with Yjs binding
    modifyAST(doc, tree, {
      select: "paragraph",
      update: (node) => ({
        ...node,
        data: { ...node.data, modified: true },
      }),
    });

    // Batch process nodes
    batchProcess(
      doc,
      tree,
      (node) => {
        if (node.type === "heading") {
          return {
            ...node,
            data: { ...node.data, timestamp: Date.now() },
          };
        }
        return node;
      },
      "heading",
    );

    // Run unified transformers
    processor.run(tree).then((transformed) => {
      console.log("Processing complete");
    });
  });
}
```

## Unified Change Event System

Docen provides a unified change event system that integrates events from both Yjs and unified.js, creating a coherent stream of document changes:

```typescript
import * as Y from "yjs";
import { Node } from "unist";
import { VFile } from "vfile";

/**
 * Types of document change events
 */
export enum ChangeEventType {
  // Yjs events
  YJS_TEXT = "yjs-text",
  YJS_MAP = "yjs-map",
  YJS_ARRAY = "yjs-array",
  YJS_XML = "yjs-xml",

  // unified.js events (aligned with unified lifecycle)
  UNIFIED_PARSE = "unified-parse",
  UNIFIED_TRANSFORM = "unified-transform",
  UNIFIED_COMPILE = "unified-compile",
  UNIFIED_PROCESS = "unified-process",

  // Synchronization events
  SYNC_APPLIED = "sync-applied",
  SYNC_CONFLICT = "sync-conflict",
  SYNC_RESOLVED = "sync-resolved",

  // High-level semantic events
  PARAGRAPH_ADDED = "paragraph-added",
  PARAGRAPH_UPDATED = "paragraph-updated",
  PARAGRAPH_REMOVED = "paragraph-removed",
  HEADING_ADDED = "heading-added",
  HEADING_UPDATED = "heading-updated",
  HEADING_REMOVED = "heading-removed",
  LIST_ADDED = "list-added",
  LIST_UPDATED = "list-updated",
  LIST_REMOVED = "list-removed",
  CODE_BLOCK_ADDED = "code-block-added",
  CODE_BLOCK_UPDATED = "code-block-updated",
  CODE_BLOCK_REMOVED = "code-block-removed",

  // Document-level events
  DOCUMENT_LOADED = "document-loaded",
  DOCUMENT_SAVED = "document-saved",
  DOCUMENT_STRUCTURE_CHANGED = "document-structure-changed",
}

/**
 * Event listener type for change events
 */
export type ChangeEventListener = (event: DocenChangeEvent) => void;

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

// VFile integration for event handling
export interface CollaborativeVFile extends VFile {
  collaborative: {
    // Connect to Yjs document
    doc: Y.Doc;

    // Utility to emit change events
    emit(type: ChangeEventType, data: any): void;

    // Subscribe to change events
    on(
      type: ChangeEventType | ChangeEventType[],
      callback: ChangeEventListener,
    ): () => void;

    // Get all events
    getEventTypes(): ChangeEventType[];
  };
}

/**
 * Synchronization conflict event
 */
export interface SyncConflictEvent extends ChangeEvent {
  type: ChangeEventType.SYNC_CONFLICT;
  localNode: Node;
  remoteNode: Node;
  localTimestamp: number;
  remoteTimestamp: number;
  resolution?: "local" | "remote" | "merged";
}

/**
 * Synchronization resolved event
 */
export interface SyncResolvedEvent extends ChangeEvent {
  type: ChangeEventType.SYNC_RESOLVED;
  conflictEvent: SyncConflictEvent;
  resolvedNode: Node;
  strategy: "timestamp" | "intent-based" | "custom";
}

/**
 * Synchronization applied event
 */
export interface SyncAppliedEvent extends ChangeEvent {
  type: ChangeEventType.SYNC_APPLIED;
  update: Uint8Array;
  origin: "local" | "remote";
}

// ... other event types from before ...

/**
 * Union type for all change events
 */
export type DocenChangeEvent =
  | YjsTextChangeEvent
  | YjsMapChangeEvent
  | YjsArrayChangeEvent
  | YjsXmlChangeEvent
  | UnifiedParseEvent
  | UnifiedTransformEvent
  | UnifiedCompileEvent
  | SyncConflictEvent
  | SyncResolvedEvent
  | SyncAppliedEvent
  | NodeAddedEvent
  | NodeUpdatedEvent
  | NodeRemovedEvent
  | DocumentEvent;

/**
 * Unified change event system with VFile integration
 */
export class ChangeEventSystem {
  private eventListeners: Map<ChangeEventType, Set<ChangeEventListener>> =
    new Map();
  private doc: Y.Doc;
  private ast: Node | null = null;
  private observers = new Map<string, () => void>();
  private vfile: CollaborativeVFile | null = null;
  private pendingEvents: DocenChangeEvent[] = [];
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(doc: Y.Doc, vfile?: VFile) {
    this.doc = doc;

    // Setup VFile integration if provided
    if (vfile) {
      this.setupVFileIntegration(vfile);
    }
  }

  /**
   * Add an event listener
   */
  on(
    eventType: ChangeEventType | ChangeEventType[],
    callback: ChangeEventListener,
  ): () => void {
    const types = Array.isArray(eventType) ? eventType : [eventType];
    const cleanups: Array<() => void> = [];

    types.forEach((type) => {
      if (!this.eventListeners.has(type)) {
        this.eventListeners.set(type, new Set());
      }

      this.eventListeners.get(type)!.add(callback);

      cleanups.push(() => {
        const listeners = this.eventListeners.get(type);
        if (listeners) {
          listeners.delete(callback);
        }
      });
    });

    // Return unsubscribe function
    return () => cleanups.forEach((cleanup) => cleanup());
  }

  /**
   * Emit an event
   */
  emit(event: DocenChangeEvent): void {
    // Add to event queue
    this.pendingEvents.push(event);

    // Process immediately
    this.processEvent(event);

    // Also notify listeners for the specific event type
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }

    // Also notify listeners for all events
    const allEventListeners = this.eventListeners.get("all" as any);
    if (allEventListeners) {
      allEventListeners.forEach((listener) => listener(event));
    }
  }

  /**
   * Process an event
   */
  private processEvent(event: DocenChangeEvent): void {
    // In a real implementation, you might want to do more here,
    // like batching events or handling special cases
  }

  /**
   * Setup VFile integration
   */
  setupVFileIntegration(vfile: VFile): CollaborativeVFile {
    const collaborativeVFile = vfile as CollaborativeVFile;

    // Add collaborative features to VFile
    collaborativeVFile.collaborative = {
      doc: this.doc,

      emit: (type, data) => {
        const event = {
          type,
          timestamp: Date.now(),
          ...data,
        };
        this.emit(event as DocenChangeEvent);

        // Also add as VFile message for compatibility with unified ecosystem
        const severity = this.getSeverityFromEventType(type);
        collaborativeVFile.message(data, null, "docen:" + type).fatal =
          severity === "error";
      },

      on: (type, callback) => {
        return this.on(type, callback);
      },

      getEventTypes: () => {
        return Array.from(this.eventListeners.keys()) as ChangeEventType[];
      },
    };

    this.vfile = collaborativeVFile;
    return collaborativeVFile;
  }

  /**
   * Convert event type to VFile message severity
   */
  private getSeverityFromEventType(
    type: ChangeEventType,
  ): "info" | "warning" | "error" {
    if (type === ChangeEventType.SYNC_CONFLICT) {
      return "warning";
    }

    if (
      type === ChangeEventType.DOCUMENT_LOADED ||
      type === ChangeEventType.DOCUMENT_SAVED
    ) {
      return "info";
    }

    return "info";
  }

  /**
   * Initialize observation of a Yjs shared type
   */
  observeSharedType(
    sharedType: Y.AbstractType<any>,
    path: string[] = [],
  ): () => void {
    const pathKey = path.join("/");

    // If already observing this path, remove the old observer
    if (this.observers.has(pathKey)) {
      this.observers.get(pathKey)!();
    }

    const handleChange = (event: Y.YEvent) => {
      const timestamp = Date.now();
      const source = event.transaction.origin === "remote" ? "remote" : "local";

      // Create and emit appropriate event based on event type
      if (event instanceof Y.YTextEvent) {
        this.emit({
          type: ChangeEventType.YJS_TEXT,
          timestamp,
          source,
          path,
          yEvent: event,
          delta: event.delta,
        } as YjsTextChangeEvent);
      } else if (event instanceof Y.YMapEvent) {
        // Create map event
        const changes = new Map();
        event.keys.forEach((value, key) => {
          changes.set(key, {
            action: value.action,
            oldValue: value.oldValue,
            newValue: event.target.get(key),
          });
        });

        this.emit({
          type: ChangeEventType.YJS_MAP,
          timestamp,
          source,
          path,
          yEvent: event,
          changes,
        } as YjsMapChangeEvent);
      }
      // Similar handling for other Y.js event types...
    };

    // Set up the observer
    sharedType.observe(handleChange);

    // Store the cleanup function
    const cleanup = () => {
      sharedType.unobserve(handleChange);
      this.observers.delete(pathKey);
    };

    this.observers.set(pathKey, cleanup);

    return cleanup;
  }

  /**
   * Emit a synchronization conflict event
   */
  emitSyncConflictEvent(
    localNode: Node,
    remoteNode: Node,
    localTimestamp: number,
    remoteTimestamp: number,
    path: string[] = [],
  ): SyncConflictEvent {
    const event: SyncConflictEvent = {
      type: ChangeEventType.SYNC_CONFLICT,
      timestamp: Date.now(),
      source: "system",
      path,
      localNode,
      remoteNode,
      localTimestamp,
      remoteTimestamp,
    };

    this.emit(event);

    // Also add as VFile message if available
    if (this.vfile) {
      this.vfile.message(
        `Synchronization conflict at ${path.join(".")}`,
        null,
        "docen:sync-conflict",
      ).fatal = false;
    }

    return event;
  }

  /**
   * Emit a synchronization resolved event
   */
  emitSyncResolvedEvent(
    conflictEvent: SyncConflictEvent,
    resolvedNode: Node,
    strategy: "timestamp" | "intent-based" | "custom",
  ): void {
    const event: SyncResolvedEvent = {
      type: ChangeEventType.SYNC_RESOLVED,
      timestamp: Date.now(),
      source: "system",
      path: conflictEvent.path,
      conflictEvent,
      resolvedNode,
      strategy,
    };

    this.emit(event);

    // Also add as VFile message if available
    if (this.vfile) {
      this.vfile.message(
        `Conflict resolved using ${strategy} strategy`,
        null,
        "docen:sync-resolved",
      ).fatal = false;
    }
  }

  /**
   * Emit a synchronization applied event
   */
  emitSyncAppliedEvent(update: Uint8Array, origin: "local" | "remote"): void {
    const event: SyncAppliedEvent = {
      type: ChangeEventType.SYNC_APPLIED,
      timestamp: Date.now(),
      source: "system",
      update,
      origin,
    };

    this.emit(event);
  }

  /**
   * Get a debounced version of an event callback
   */
  debounced(
    key: string,
    callback: () => void,
    delay: number = 250,
  ): () => void {
    return () => {
      // Clear existing timer
      if (this.debounceTimers.has(key)) {
        clearTimeout(this.debounceTimers.get(key)!);
      }

      // Set new timer
      const timer = setTimeout(() => {
        callback();
        this.debounceTimers.delete(key);
      }, delay);

      this.debounceTimers.set(key, timer);
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    // Remove all observers
    for (const cleanup of this.observers.values()) {
      cleanup();
    }

    this.observers.clear();
    this.eventListeners.clear();

    // Clear debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
  }
}

/**
 * Create a collaborative VFile that integrates with unified and Yjs
 */
export function createCollaborativeVFile(
  content: string,
  doc: Y.Doc,
): CollaborativeVFile {
  const vfile = new VFile(content);
  const eventSystem = new ChangeEventSystem(doc);
  return eventSystem.setupVFileIntegration(vfile);
}

/**
 * Example usage with unified integration
 */
function setupCollaborativeProcessor(
  content: string,
  processor: DocenProcessor,
) {
  const doc = new Y.Doc();
  const vfile = createCollaborativeVFile(content, doc);

  // Process content with unified and Yjs integration
  processor
    .useCollaboration({ ydoc: doc, syncStrategy: "timestamp" })
    .process(vfile)
    .then((file) => {
      console.log("Processing complete");

      // Subscribe to sync conflict events
      const unsubscribe = file.collaborative.on(
        ChangeEventType.SYNC_CONFLICT,
        (event) => {
          console.log("Sync conflict detected:", event);
        },
      );

      // Access VFile messages (compatible with unified ecosystem)
      console.log("Messages:", file.messages);

      return {
        file,
        cleanup: () => {
          unsubscribe();
        },
      };
    });

  return vfile;
}
```
