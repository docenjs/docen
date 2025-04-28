/**
 * Core processor interface extending unified.js
 * Adds collaborative capabilities to the unified processor
 */
import { unified } from "unified";
import * as Y from "yjs";
import type {
  AwarenessState,
  ChangeEvent,
  CollaborativeDocument as CoreCollaborativeDocument,
  CursorPosition,
  DocenProcessor,
  DocenProcessorOptions,
  YjsAdapter,
} from "../types";
import { createRelativePositionFromPath } from "../utils/collaborative";
import { createYjsAdapter } from "../yjs";
import { Awareness } from "../yjs/awareness";

/**
 * Factory function to create a Docen processor
 */
export function createProcessor(
  options: DocenProcessorOptions = {}
): DocenProcessor {
  // 1. Create the base processor WITHOUT initial cast
  const baseProcessor = unified();

  // 2. Apply initial plugins FIRST to let unified handle type inference
  if (options.plugins) {
    for (const plugin of options.plugins) {
      baseProcessor.use(plugin);
    }
  }

  // 3. Setup Docen context separately
  const ydoc = options?.collaborative ? options.ydoc || new Y.Doc() : undefined;
  let initialAdapter: YjsAdapter | undefined;
  if (options.collaborative && ydoc) {
    try {
      initialAdapter = createYjsAdapter(ydoc, options.yjsAdapterOptions);
    } catch (e) {
      console.error("Failed to initialize YjsAdapter:", e);
      initialAdapter = undefined;
    }
  }

  const context: {
    _yjsAdapter: YjsAdapter | undefined;
    ydoc: Y.Doc | undefined;
    doc: CoreCollaborativeDocument | undefined;
    observers: Set<(changes: Array<ChangeEvent>) => void>;
    awareness: Awareness | undefined;
    // Add other context fields as needed (e.g., fragment manager, options)
    // Ensure these fields match what the custom methods below expect
  } = {
    _yjsAdapter: initialAdapter,
    ydoc,
    doc: undefined,
    observers: new Set(),
    awareness: ydoc && initialAdapter ? new Awareness(ydoc) : undefined,
    // Initialize other fields
  };

  // 4. Define Docen custom methods as functions accessing context
  const observeChanges = (
    callback: (changes: Array<ChangeEvent>) => void
  ): (() => void) => {
    context.observers.add(callback);
    // TODO: Connect this to actual Yjs observation
    return () => {
      context.observers.delete(callback);
    };
  };

  const getYjsAdapter = (): YjsAdapter | null => {
    return context._yjsAdapter ?? null;
  };

  const getDocument = (): CoreCollaborativeDocument | null => {
    if (!context._yjsAdapter || !context.ydoc || !context.awareness) {
      return null;
    }
    if (!context.doc) {
      const adapter = context._yjsAdapter;
      context.doc = {
        id: context.ydoc?.guid ?? "unknown-doc-id",
        ydoc: context.ydoc,
        awareness: context.awareness,
        transact: adapter.transact.bind(adapter),
        getStateVector: () => {
          if (!context.ydoc) throw new Error("Y.Doc is not initialized.");
          return Y.encodeStateVector(context.ydoc);
        },
        encodeStateAsUpdate: () => {
          if (!context.ydoc) throw new Error("Y.Doc is not initialized.");
          return Y.encodeStateAsUpdate(context.ydoc);
        },
        applyUpdate: (update) => {
          if (!context.ydoc) throw new Error("Y.Doc is not initialized.");
          Y.applyUpdate(context.ydoc, update);
        },
        destroy: () => {
          /* No-op */
        },
        undo: () => adapter.undoManager?.undo(),
        redo: () => adapter.undoManager?.redo(),
        canUndo: () => adapter.undoManager?.canUndo() ?? false,
        canRedo: () => adapter.undoManager?.canRedo() ?? false,
        getAwarenessStates: () => context.awareness?.getStates() ?? new Map(),
        setLocalCursor: (pos) =>
          context.awareness?.setLocalStateField("cursor", pos),
        setLocalUser: (user) =>
          context.awareness?.setLocalStateField("user", user),
        // Add missing setSyncStrategy to match interface
        setSyncStrategy: (strategy, handler?) => {
          console.warn(
            "setSyncStrategy called on document object, but not implemented."
          );
        },
      } as CoreCollaborativeDocument; // Keep assertion
    }
    return context.doc;
  };

  const setCursor = (position: {
    path: (string | number)[];
    offset: number;
  }) => {
    if (context.awareness && context.ydoc) {
      try {
        const rp = createRelativePositionFromPath(
          context.ydoc,
          position.path,
          position.offset
        );
        context.awareness.setLocalStateField("cursor", {
          relativePosition: rp,
          range: null,
        } as CursorPosition);
      } catch (e) {
        console.error("Error setting cursor:", e);
      }
    }
    // Need to return `this` (the processor) but `this` here is undefined
    // We will assign this function to the processor later.
    // Returning the processor instance requires access to it, handled by Object.assign.
  };

  const setSelection = (range: {
    anchor: { path: (string | number)[]; offset: number };
    head: { path: (string | number)[]; offset: number };
  }) => {
    if (context.awareness && context.ydoc) {
      try {
        const anchorRelPos = createRelativePositionFromPath(
          context.ydoc,
          range.anchor.path,
          range.anchor.offset
        );
        const headRelPos = createRelativePositionFromPath(
          context.ydoc,
          range.head.path,
          range.head.offset
        );
        context.awareness.setLocalStateField("cursor", {
          relativePosition: headRelPos,
          range: { start: anchorRelPos, end: headRelPos },
        } as CursorPosition);
      } catch (e) {
        console.error("Error setting selection:", e);
      }
    }
    // Need to return `this` (the processor)
  };

  const getCursors = () => {
    if (!context.awareness) return [];
    const states = context.awareness.getStates();
    const cursors: Array<{
      clientId: number;
      user: AwarenessState["user"];
      cursor: CursorPosition | null;
    }> = [];
    states.forEach((state, clientId) => {
      if (state?.user) {
        cursors.push({
          clientId,
          user: state.user,
          cursor: state.cursor ?? null,
        });
      }
    });
    return cursors;
  };

  // 5. Assign custom methods to the baseProcessor
  // Need to cast baseProcessor to `any` temporarily to assign properties
  // Then cast the final result to DocenProcessor.
  // Note: setCursor and setSelection need modification to return the processor instance.

  const finalProcessor = Object.assign(baseProcessor, {
    observeChanges,
    getDocument,
    // Modify setCursor and setSelection to return the processor instance
    setCursor: function (position: {
      path: (string | number)[];
      offset: number;
    }) {
      setCursor(position); // Call the logic function
      return this; // `this` will refer to finalProcessor
    },
    setSelection: function (range: {
      anchor: { path: (string | number)[]; offset: number };
      head: { path: (string | number)[]; offset: number };
    }) {
      setSelection(range); // Call the logic function
      return this; // `this` will refer to finalProcessor
    },
    getCursors,
    getYjsAdapter,
    // Add context property if it needs to be accessible (discouraged)
    // context: context,
  });

  // --- Finalize Setup (e.g., start Yjs observation) ---
  if (context._yjsAdapter) {
    // Start observing Yjs changes to trigger callbacks
    const unsubscribeYjs = context._yjsAdapter.observeChanges((events, tx) => {
      // Map Yjs events to Docen ChangeEvent[] (implement mapping logic)
      const changes: ChangeEvent[] = []; // Placeholder
      if (changes.length > 0) {
        for (const callback of context.observers) {
          callback(changes);
        }
      }
    });
    // Store unsubscribe function if needed (e.g., in context)
    // context.unsubscribeFunctions.add(unsubscribeYjs);
  }

  // 6. Return the modified processor with the final cast
  return finalProcessor as DocenProcessor;
}

// You might need ChangeEventType definition if it's used in observation mapping
// import { ChangeEventType } from "../types";
