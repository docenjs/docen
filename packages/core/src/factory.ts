/**
 * Factory functions for creating Docen processors and documents
 */
import * as Y from "yjs";
import type { Node, SyncHandler, YjsAdapterOptions } from "./types";
import type { AwarenessState, CursorPosition } from "./types";
import { createYjsAdapter } from "./yjs";
import { Awareness } from "./yjs/awareness";

/**
 * Create a collaborative document
 *
 * @param _content Initial content
 * @param options Configuration options
 * @returns A new collaborative document
 */
export function createDocument(
  _content?: string | Node | Uint8Array,
  options?: {
    id?: string;
    type?: string;
    collaborative?: boolean;
    syncStrategy?: "timestamp" | "intent-based" | "custom";
    customSyncHandler?: SyncHandler;
    undoManagerOptions?: {
      enabled?: boolean;
      trackedOrigins?: Set<string>;
    };
    bindingStrategy?: "deep" | "shallow" | "lazy";
    fragmentOptions?: {
      enableAutoFragmentation?: boolean;
      threshold?: number;
      nodeTypes?: string[];
    };
  }
) {
  const ydoc = new Y.Doc();
  const id =
    options?.id || `doc-${Math.random().toString(36).substring(2, 11)}`;

  // Prepare options using YjsAdapterOptions from ./yjs/index.ts
  const adapterOptions: YjsAdapterOptions = {
    id: id,
    undoManagerOptions: {
      enabled: options?.undoManagerOptions?.enabled !== false,
      ...(options?.undoManagerOptions ?? {}),
      trackedOrigins: options?.undoManagerOptions?.trackedOrigins
        ? Array.from(options.undoManagerOptions.trackedOrigins)
        : undefined,
    },
    syncStrategy: options?.syncStrategy,
    customSyncHandler: options?.customSyncHandler,
  };

  // Create Yjs adapter
  const adapter = createYjsAdapter(ydoc, adapterOptions);

  // Create Awareness instance
  const awareness = new Awareness(ydoc);

  // Return the placeholder document object
  // The structure doesn't fully match CollaborativeDocument yet
  // but includes core Yjs/Awareness functionality.
  return {
    ydoc,
    id,
    adapter, // Includes the correctly created adapter
    awareness,

    // Placeholder methods from original implementation
    parse: async (input: string) => {
      // Parse input to AST
      console.warn("createDocument().parse() is a placeholder.");
      return { type: "root", children: [] };
    },
    stringify: async (tree: Node) => {
      // Convert AST to string
      console.warn("createDocument().stringify() is a placeholder.");
      return "";
    },
    run: async (tree: Node) => {
      // Run transformers
      console.warn("createDocument().run() is a placeholder.");
      return tree;
    },
    process: async (input: string | Node) => {
      // Complete processing pipeline
      console.warn("createDocument().process() is a placeholder.");
      const tree = { type: "root", children: [] };
      return { tree, value: "" };
    },

    // Core CollaborativeDocument methods
    transact: <T>(fn: () => T, origin?: string) => {
      // Execute within transaction
      return ydoc.transact(fn, origin);
    },
    destroy: () => {
      // Clean up resources
      awareness.destroy(); // Destroy awareness first
      ydoc.destroy();
    },
    undo: () => adapter.undoManager?.undo(),
    redo: () => adapter.undoManager?.redo(),
    canUndo: () => adapter.undoManager?.canUndo() ?? false,
    canRedo: () => adapter.undoManager?.canRedo() ?? false,
    getAwarenessStates: () => awareness.getStates(),
    setLocalCursor: (pos: CursorPosition | null) =>
      awareness.setLocalStateField("cursor", pos),
    setLocalUser: (user: AwarenessState["user"]) =>
      awareness.setLocalStateField("user", user),

    // Note: Methods like bindNode, unbindNode, onChange, observeNode are intentionally
    // omitted here. They depend on the processor's context and AST management,
    // which are not handled by this standalone factory function.
    // These methods are typically accessed via the DocenProcessor instance.
  };
}
