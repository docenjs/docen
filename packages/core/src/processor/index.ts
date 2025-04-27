/**
 * Core processor interface extending unified.js
 * Adds collaborative capabilities to the unified processor
 */
import { unified } from "unified";
import * as Y from "yjs";
import type {
  ChangeEvent,
  CollaborativeDocument as CoreCollaborativeDocument,
  CursorPosition,
  DocenProcessor,
  DocenProcessorOptions,
  FragmentManager,
  Node,
  YjsAdapter,
} from "../types";
import {
  createRelativePositionFromPath,
  getAwarenessCursors,
} from "../utils/collaborative";
import { createYjsAdapter } from "../yjs";
import { Awareness } from "../yjs/awareness";
import type { YjsAdapterOptions } from "../yjs/types";

// Define a transformer type that works with our Node type
type DocenTransformer = (node: Node) => Promise<Node> | Node;

// Internal implementation for fragment data structure - keep local
interface FragmentData {
  path: (string | number)[];
  doc: CoreCollaborativeDocument | null; // Use alias for core type, allow null
  metadata: {
    createdAt: number;
    lastAccessed: number;
    size?: number;
    [key: string]: unknown;
  };
  fragmentManager: FragmentManager | undefined; // Use FragmentManager from ../types
  fragmentOptions: {
    enabled: boolean;
    nodeTypes: string[];
  };
  // Internal adapter reference
  _yjsAdapter: YjsAdapter | undefined; // Use YjsAdapter from ../types
}

// Define ExtendedProcessor based on DocenProcessor from types
interface ExtendedProcessor extends DocenProcessor {
  context: any;
  // Add internal methods if needed
}

/**
 * Factory function to create a Docen processor
 */
export function createProcessor(
  options: DocenProcessorOptions = {}
): DocenProcessor {
  const baseProcessor = unified() as unknown as ExtendedProcessor;

  const ydoc = options?.collaborative ? options.ydoc || new Y.Doc() : undefined;

  // Initialize YjsAdapter if collaboration is enabled
  let initialAdapter: YjsAdapter | undefined;
  if (options.collaborative && ydoc) {
    try {
      initialAdapter = createYjsAdapter(ydoc, options.yjsAdapterOptions);
    } catch (e) {
      console.error(
        "Failed to initialize YjsAdapter during processor creation:",
        e
      );
      // Decide handling: throw error, or proceed without adapter?
      // Proceeding without adapter for now, collaboration will be disabled.
      initialAdapter = undefined;
    }
  }

  // Define context structure clearly
  const context: {
    // Add type for adapter
    _yjsAdapter: YjsAdapter | undefined;
    ydoc: Y.Doc | undefined;
    doc: CoreCollaborativeDocument | undefined; // Use alias for core type
    observers: Set<(changes: Array<ChangeEvent>) => void>;
    unsubscribeFunctions: Set<() => void>;
    collaborativeTransformers: DocenTransformer[];
    fragments: Map<string, FragmentData>;
    awareness: Awareness | undefined;
    fragmentManager: FragmentManager | undefined; // Use FragmentManager from ../types
    fragmentOptions: {
      enabled: boolean;
      threshold: number;
      maxFragments: number;
      nodeTypes: string[];
    };
    // Store specific Yjs config options
    undoManagerOptions: YjsAdapterOptions["undoManagerOptions"];
    bindingStrategies: YjsAdapterOptions["bindingStrategies"];
    defaultBindingStrategy: YjsAdapterOptions["defaultBindingStrategy"];
  } = {
    _yjsAdapter: initialAdapter, // Store the created adapter
    ydoc,
    doc: undefined,
    observers: new Set(),
    unsubscribeFunctions: new Set(),
    collaborativeTransformers: [],
    fragments: new Map(),
    awareness: ydoc && initialAdapter ? new Awareness(ydoc) : undefined, // Only create awareness if adapter exists
    fragmentManager: undefined, // Will be initialized later if needed
    fragmentOptions: {
      enabled: options?.fragmentOptions?.enabled ?? false,
      threshold: options?.fragmentOptions?.threshold ?? 1000,
      maxFragments: options?.fragmentOptions?.maxFragments ?? 100,
      nodeTypes: options?.fragmentOptions?.nodeTypes ?? ["section", "chapter"],
    },
    // Store specific Yjs config options
    undoManagerOptions: options.yjsAdapterOptions?.undoManagerOptions,
    bindingStrategies: options.yjsAdapterOptions?.bindingStrategies,
    defaultBindingStrategy: options.yjsAdapterOptions?.defaultBindingStrategy,
  };
  baseProcessor.context = context;

  // Add custom plugins
  if (options.plugins) {
    for (const plugin of options.plugins) {
      baseProcessor.use(plugin);
    }
  }

  // --- Attach Docen Methods to Processor ---

  baseProcessor.observeChanges = (
    callback: (changes: Array<ChangeEvent>) => void
  ): (() => void) => {
    context.observers.add(callback);
    return () => {
      context.observers.delete(callback);
    };
  };

  // Add getYjsAdapter method
  baseProcessor.getYjsAdapter = function (): YjsAdapter | null {
    return this.context._yjsAdapter ?? null;
  };

  // Get Document Method - Returns a lightweight representation or null
  baseProcessor.getDocument = function (): CoreCollaborativeDocument | null {
    if (
      !this.context._yjsAdapter ||
      !this.context.ydoc ||
      !this.context.awareness
    ) {
      return null;
    }
    // Construct a CollaborativeDocument-like object on the fly if needed
    // This depends on the final definition of CollaborativeDocument
    // For now, returning a basic structure or potentially the context.doc if managed
    if (!this.context.doc) {
      // Lazily create a document representation if context.doc is not managed
      // This implementation needs refinement based on CollaborativeDocument final definition
      const adapter = this.context._yjsAdapter;
      this.context.doc = {
        id: this.context.ydoc?.guid ?? "unknown-doc-id",
        ydoc: this.context.ydoc,
        awareness: this.context.awareness,
        transact: adapter.transact.bind(adapter),
        getStateVector: () => {
          if (!this.context.ydoc) return new Uint8Array();
          return Y.encodeStateVector(this.context.ydoc);
        },
        encodeStateAsUpdate: () => {
          if (!this.context.ydoc) return new Uint8Array();
          return Y.encodeStateAsUpdate(this.context.ydoc);
        },
        applyUpdate: (update) => {
          if (!this.context.ydoc) return;
          Y.applyUpdate(this.context.ydoc, update);
        },
        destroy: () => {
          /* Should processor handle YDoc destroy? Maybe not */
        },
        undo: () => adapter.undoManager?.undo(),
        redo: () => adapter.undoManager?.redo(),
        canUndo: () => adapter.undoManager?.canUndo() ?? false,
        canRedo: () => adapter.undoManager?.canRedo() ?? false,
        getAwarenessStates: () => this.context.awareness?.getStates(),
        setLocalCursor: (pos) =>
          this.context.awareness?.setLocalStateField("cursor", pos),
        setLocalUser: (user) =>
          this.context.awareness?.setLocalStateField("user", user),
      } as CoreCollaborativeDocument;
    }
    return this.context.doc;
  };

  baseProcessor.setCursor = function (position) {
    if (this.context.awareness && this.context.ydoc) {
      try {
        const relPos = createRelativePositionFromPath(
          this.context.ydoc,
          position.path,
          position.offset
        );
        const cursorState: CursorPosition = {
          relativePosition: relPos,
          range: null,
        };
        this.context.awareness.setLocalStateField("cursor", cursorState);
      } catch (e) {
        console.error("Error setting cursor:", e);
      }
    }
    return this;
  };

  baseProcessor.setSelection = function (range) {
    if (this.context.awareness && this.context.ydoc) {
      try {
        const anchorRelPos = createRelativePositionFromPath(
          this.context.ydoc,
          range.anchor.path,
          range.anchor.offset
        );
        const headRelPos = createRelativePositionFromPath(
          this.context.ydoc,
          range.head.path,
          range.head.offset
        );
        const selectionState: CursorPosition = {
          relativePosition: headRelPos,
          range: { start: anchorRelPos, end: headRelPos },
        };
        this.context.awareness.setLocalStateField("cursor", selectionState);
      } catch (e) {
        console.error("Error setting selection:", e);
      }
    }
    return this;
  };

  baseProcessor.getCursors = function () {
    if (this.context.awareness) {
      return getAwarenessCursors(this.context.awareness);
    }
    return [];
  };

  // Ensure final return type matches DocenProcessor from ./types
  // Cast to DocenProcessor, relying on structural typing
  return baseProcessor as any as DocenProcessor;
}
