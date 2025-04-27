import type {
  AwarenessState,
  CollaborativeDocument,
  Awareness as CoreAwareness, // Use alias for core Awareness type
  CursorPosition,
  Node,
  SyncHandler,
  SyncStrategy,
  YjsAdapter,
} from "@docen/core";
import { createYjsAdapter } from "@docen/core";
import type { Awareness as YProtocolsAwareness } from "y-protocols/awareness"; // Use alias
import { Awareness as YjsAwareness } from "y-protocols/awareness";
import * as Y from "yjs";
import { defaultHastMappings } from "../yjs/adapters/hast";
import { defaultMdastMappings } from "../yjs/adapters/mdast";
import type { HastYjsMapping, MdastYjsMapping } from "../yjs/adapters/types"; // Import from correct path
import { DocenAwarenessAdapter } from "./awareness"; // Import the wrapper

export interface DocenCollabDocumentOptions {
  id?: string;
  ydoc?: Y.Doc;
  awareness?: YProtocolsAwareness; // Accept y-protocols Awareness
  initialValue?: Node; // Root node
  adapterType?: "mdast" | "hast"; // Hint for which mappings to use
  // Potentially pass YjsAdapterOptions here too
}

/**
 * Implementation of the CollaborativeDocument interface for @docen/document.
 * Manages the Yjs document, awareness, and the binding to the AST.
 */
export class DocenCollabDocument implements CollaborativeDocument {
  readonly ydoc: Y.Doc;
  // Use the CoreAwareness type from the interface, implemented by our adapter
  readonly awareness: CoreAwareness;
  readonly id: string;
  private adapter: YjsAdapter;
  private rootNode: Node | null = null; // Store the root AST node

  constructor(options: DocenCollabDocumentOptions = {}) {
    this.id = options.id || `docen-${Date.now().toString(36)}`;
    this.ydoc = options.ydoc || new Y.Doc({ guid: this.id });
    // Create the y-protocols awareness instance
    const yAwareness = options.awareness || new YjsAwareness(this.ydoc);
    // Wrap it with our adapter to conform to the CoreAwareness interface
    this.awareness = new DocenAwarenessAdapter(yAwareness);

    // Determine which mappings to use
    // TODO: This is a temporary fix. Mappings should ideally be registered
    // with the core adapter based on the document type/processor used.
    const mappings: Array<MdastYjsMapping | HastYjsMapping> =
      options.adapterType === "hast"
        ? defaultHastMappings
        : defaultMdastMappings;

    // TODO: Need to adapt createYjsAdapter to accept mappings
    // This requires modification in @docen/core
    this.adapter = createYjsAdapter(this.ydoc, {
      // bindingStrategies: this.createBindingStrategiesFromMappings(mappings)
    });

    if (options.initialValue) {
      this.initializeContent(options.initialValue);
    }
  }

  private initializeContent(root: Node): void {
    this.rootNode = root;
    // TODO: Implement initial binding logic
    // this.adapter.transact(() => {
    //   this.adapter.bindNode(this.rootNode);
    // });
  }

  // --- CollaborativeDocument Interface Implementation ---

  transact<T>(fn: () => T, origin?: string): T {
    return this.ydoc.transact(fn, origin);
  }

  // setSyncStrategy is likely handled by the adapter now
  // setSyncStrategy(strategy: SyncStrategy, handler?: SyncHandler): void {
  //   // Delegate to adapter?
  // }

  getStateVector(): Uint8Array {
    return Y.encodeStateVector(this.ydoc);
  }

  encodeStateAsUpdate(): Uint8Array {
    return Y.encodeStateAsUpdate(this.ydoc);
  }

  applyUpdate(update: Uint8Array): void {
    Y.applyUpdate(this.ydoc, update);
  }

  destroy(): void {
    this.awareness.destroy(); // Calls the wrapper's destroy
    this.ydoc.destroy();
    // TODO: Unbind nodes? Adapter might handle this.
  }

  setSyncStrategy(strategy: SyncStrategy, handler?: SyncHandler): void {
    // Delegate to the internal YjsAdapter
    // TODO: Check if YjsAdapter exposes a method like this, or if it must be set at creation.
    if (
      this.adapter &&
      typeof (this.adapter as any).setSyncStrategy === "function"
    ) {
      (this.adapter as any).setSyncStrategy(strategy, handler);
    } else {
      console.warn(
        "Setting sync strategy after document creation is not supported by the current adapter."
      );
      // Or potentially throw an error
    }
  }

  undo(): void {
    this.adapter.undoManager?.undo();
  }

  redo(): void {
    this.adapter.undoManager?.redo();
  }

  canUndo(): boolean {
    // Handle potential null undoManager
    return (this.adapter.undoManager?.undoStack.length ?? 0) > 0;
  }

  canRedo(): boolean {
    // Handle potential null undoManager
    return (this.adapter.undoManager?.redoStack.length ?? 0) > 0;
  }

  // Cast the result to satisfy the core interface type
  getAwarenessStates(): Map<number, AwarenessState> {
    // Now calls the wrapper method, which performs the cast
    return this.awareness.getStates();
  }

  setLocalCursor(position: CursorPosition | null): void {
    // Calls the wrapper method
    this.awareness.setLocalStateField("cursor", position);
  }

  // Ensure the user object conforms to AwarenessState['user']
  setLocalUser(user: AwarenessState["user"]): void {
    // Calls the wrapper method
    this.awareness.setLocalStateField("user", user);
  }

  // --- Additional Methods (Potentially needed) ---

  /** Returns the current root AST node */
  getAst(): Node | null {
    // TODO: How to get the AST back from Yjs representation via adapter?
    return this.rootNode;
  }

  // Maybe observe changes at this level?
  // onChange(callback: ...) {
  //   // observe adapter changes?
  // }
}
