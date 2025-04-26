import type {
  CollaborativeNode,
  YjsAdapter as CoreYjsAdapter,
  Node,
  NodeBindingStrategy,
  ResolvedNode,
  SyncConflict,
  YjsAdapterOptions, // Import options from core
} from "@docen/core";
import * as Y from "yjs";
// import { OoxmlNode } from '../ast'; // Not strictly needed here yet

// TODO: Define specific binding strategies for OOXML nodes
const defaultBindingStrategies: Record<string, NodeBindingStrategy> = {
  default: {
    // Fallback strategy
    toYjs(node: Node): Y.Map<any> {
      const ymap = new Y.Map();
      for (const [key, value] of Object.entries(node)) {
        if (key !== "children" && key !== "type") {
          try {
            // Basic serialization (might need refinement for complex types)
            const serializedValue =
              typeof value === "object"
                ? JSON.parse(JSON.stringify(value))
                : value;
            ymap.set(key, serializedValue);
          } catch (e) {
            console.warn(
              `Skipping non-serializable property ${key} in default binding:`,
              e,
            );
          }
        }
      }
      ymap.set("__type", node.type);
      return ymap;
    },
    fromYjs(yType: Y.AbstractType<any>): Node {
      if (!(yType instanceof Y.Map)) {
        throw new Error("Default fromYjs expects Y.Map");
      }
      const node: Record<string, any> = {
        type: yType.get("__type") || "unknown",
      };
      yType.forEach((value, key) => {
        if (key !== "__type") {
          node[key] = value;
        }
      });
      return node as Node;
    },
    observe(
      node: Node,
      yType: Y.AbstractType<any>,
      callback: (event: Y.YEvent<any>) => void,
    ): () => void {
      if (!(yType instanceof Y.Map)) {
        throw new Error("Default observe expects Y.Map");
      }
      // Use correct event type for Y.Map observe
      const observer = (event: Y.YMapEvent<any>, transaction: Y.Transaction) =>
        callback(event);
      yType.observe(observer);
      return () => yType.unobserve(observer);
    },
  },
};

export class OfficeYjsAdapter implements CoreYjsAdapter {
  doc: Y.Doc;
  rootMap: Y.Map<any>;
  undoManager: Y.UndoManager | null;
  bindingStrategies: Record<string, NodeBindingStrategy>;

  constructor(ydoc?: Y.Doc, options: YjsAdapterOptions = {}) {
    this.doc = ydoc || new Y.Doc();
    this.rootMap = this.doc.getMap("office-content");

    // Correctly access UndoManager options
    const undoOptions = options.undoManagerOptions ?? {};

    // Handle trackedOrigins correctly whether it's an array or a Set
    let trackedOriginsSet: Set<any> | undefined;
    if (undoOptions.trackedOrigins) {
      if (undoOptions.trackedOrigins instanceof Set) {
        trackedOriginsSet = undoOptions.trackedOrigins;
      } else {
        // It must be string[]
        trackedOriginsSet = new Set(undoOptions.trackedOrigins);
      }
    } else {
      trackedOriginsSet = new Set(["local-update"]); // Default
    }

    // Construct final options explicitly, excluding trackedOrigins from original object
    const { trackedOrigins, ...otherUndoOptions } = undoOptions;
    const finalUndoManagerOptions = {
      ...otherUndoOptions, // Spread other options
      trackedOrigins: trackedOriginsSet, // Add the correctly typed Set
      captureTimeout: undoOptions.captureTimeout ?? 500, // Ensure captureTimeout is present
    };

    this.undoManager =
      undoOptions.enabled !== false
        ? new Y.UndoManager(this.rootMap, finalUndoManagerOptions)
        : null;

    this.bindingStrategies = {
      ...defaultBindingStrategies,
      ...(options.bindingStrategies || {}),
    };

    console.log("OfficeYjsAdapter initialized.");
  }

  bindNode(node: Node): Node & CollaborativeNode {
    console.warn("OfficeYjsAdapter.bindNode not fully implemented.");
    const strategy =
      this.bindingStrategies[node.type] || this.bindingStrategies.default;
    if (!strategy) {
      throw new Error(`No binding strategy found for node type: ${node.type}`);
    }
    const collaborativeNode = node as Node & CollaborativeNode;
    // TODO: Implement real binding
    collaborativeNode.binding = {
      type: new Y.Map(),
      path: [],
      observe: () => () => {},
      update: () => {},
    };
    return collaborativeNode;
  }

  unbindNode(node: Node & CollaborativeNode): Node {
    console.warn("OfficeYjsAdapter.unbindNode not implemented.");
    // Avoid delete operator
    if ("binding" in node) {
      node.binding = undefined;
    }
    return node;
  }

  resolveConflict(conflict: SyncConflict): ResolvedNode {
    console.warn(
      "OfficeYjsAdapter.resolveConflict not implemented. Defaulting to timestamp/remote wins.",
    );
    const localTime =
      conflict.localNode.collaborationMetadata?.lastModifiedTimestamp || 0;
    const remoteTime =
      conflict.remoteNode.collaborationMetadata?.lastModifiedTimestamp || 0;
    // Removed redundant else
    if (remoteTime >= localTime) {
      return { node: conflict.remoteNode, origin: "remote" };
    }
    return { node: conflict.localNode, origin: "local" };
  }

  transact<T>(fn: () => T, origin?: any): T {
    let result: T | undefined = undefined; // Initialize result
    this.doc.transact((transaction) => {
      result = fn();
    }, origin);
    // Check if result was assigned (it should be)
    if (result === undefined) {
      throw new Error("Transaction function did not return a value.");
    }
    return result;
  }

  observeChanges(
    callback: (
      events: Array<Y.YEvent<any>>,
      transaction: Y.Transaction,
    ) => void,
  ): () => void {
    // Correct the listener signature for 'updateV2'
    const listener = (
      update: Uint8Array,
      origin: any,
      doc: Y.Doc,
      transaction: Y.Transaction,
    ) => {
      // We need to get the events from the transaction if possible
      // Accessing transaction.changed is complex; maybe observe rootMap directly is simpler?
      // For now, let's call the callback but acknowledge event details are missing.
      console.warn(
        "Observing updateV2, but detailed events are not directly available in this handler.",
      );
      // Call the callback with an empty events array as a placeholder
      callback([], transaction);
    };
    this.doc.on("updateV2", listener);
    console.log("OfficeYjsAdapter observing changes (updateV2).");

    return () => {
      console.log("OfficeYjsAdapter stopping observation (updateV2).");
      this.doc.off("updateV2", listener); // Use the same listener function reference
    };
  }

  // --- Undo/Redo ---
  undo(): void {
    this.undoManager?.undo();
  }

  redo(): void {
    this.undoManager?.redo();
  }

  canUndo(): boolean {
    // Correct check for > 0 and avoid unnecessary ??
    return (this.undoManager?.undoStack.length ?? 0) > 0;
  }

  canRedo(): boolean {
    // Correct check for > 0 and avoid unnecessary ??
    return (this.undoManager?.redoStack.length ?? 0) > 0;
  }
}

/**
 * Factory function to create an OfficeYjsAdapter.
 */
export function createOfficeYjsAdapter(
  ydoc?: Y.Doc,
  options: YjsAdapterOptions = {},
): CoreYjsAdapter {
  return new OfficeYjsAdapter(ydoc, options);
}
