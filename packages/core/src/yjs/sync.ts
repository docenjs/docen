/**
 * Synchronization utilities for Yjs integration
 * Provides strategies for resolving conflicts during document synchronization
 */
import * as Y from "yjs";
import type {
  Node,
  ResolvedNode,
  SyncConflict,
  SyncHandler,
  SyncStrategy,
} from "../types";

/**
 * Timestamp-based conflict resolution strategy
 * Chooses the version with the most recent timestamp
 */
export function resolveTimestampBased(conflict: SyncConflict): ResolvedNode {
  if (conflict.localTimestamp >= conflict.remoteTimestamp) {
    return { node: conflict.localNode, origin: "local" };
  }
  return { node: conflict.remoteNode, origin: "remote" };
}

/**
 * Intent-based conflict resolution
 * Tries to merge changes based on the semantic intent of each change
 */
export function resolveIntentBased(conflict: SyncConflict): ResolvedNode {
  console.warn(
    "Intent-based conflict resolution is not fully implemented. Falling back to timestamp."
  );
  return resolveTimestampBased(conflict);
}

/**
 * Create a synchronization handler based on the specified strategy
 */
export function createSyncHandler(
  strategy: SyncStrategy = "timestamp",
  customHandler?: SyncHandler
): SyncHandler {
  if (strategy === "custom" && customHandler) {
    return customHandler;
  }
  switch (strategy) {
    case "timestamp":
      return resolveTimestampBased;
    case "intent-based":
      return resolveIntentBased;
    default:
      throw new Error(`Unsupported strategy: ${strategy}`);
  }
}

/**
 * Apply updates between two Yjs documents with conflict handling
 */
export function applySyncUpdate(
  targetDoc: Y.Doc,
  update: Uint8Array,
  syncHandler: SyncHandler = resolveTimestampBased
): void {
  // Start a transaction for atomic updates
  targetDoc.transact(() => {
    // Apply the update normally
    Y.applyUpdate(targetDoc, update);

    // Note: In a real implementation, we would intercept conflicts
    // during the update and apply the sync handler to resolve them.
    // This would require deeper integration with Yjs internals.
  });
}

/**
 * Create a synchronization manager for a Yjs document
 */
export function createSyncManager(
  doc: Y.Doc,
  options: {
    strategy?: SyncStrategy;
    customHandler?: SyncHandler;
    onConflict?: (conflict: SyncConflict) => void;
    onResolved?: (resolved: ResolvedNode) => void;
  } = {}
) {
  // Create the sync handler based on the strategy
  const syncHandler = createSyncHandler(
    options.strategy,
    options.customHandler
  );

  // Return the sync manager API
  return {
    /**
     * Apply updates from another document
     */
    applyUpdate(update: Uint8Array): void {
      applySyncUpdate(doc, update, syncHandler);
    },

    /**
     * Apply updates by merging with another document
     */
    mergeUpdatesFrom(otherDoc: Y.Doc): void {
      const update = Y.encodeStateAsUpdate(otherDoc);
      this.applyUpdate(update);
    },

    /**
     * Get the current document state as update
     */
    getStateAsUpdate(): Uint8Array {
      return Y.encodeStateAsUpdate(doc);
    },

    /**
     * Change the synchronization strategy
     */
    setStrategy(strategy: SyncStrategy, custom?: SyncHandler): void {
      options.strategy = strategy;
      if (custom) {
        options.customHandler = custom;
      }
    },

    /**
     * Clean up resources
     */
    destroy(): void {
      // No cleanup needed for now
    },
  };
}

/**
 * Merge two nodes according to the given conflict resolution strategy
 */
export function mergeNodes(
  local: Node,
  remote: Node,
  strategy: SyncStrategy = "timestamp",
  customHandler?: SyncHandler
): Node {
  // Create a conflict object
  const conflict: SyncConflict = {
    localNode: local,
    remoteNode: remote,
    localTimestamp:
      (local as any).collaborationMetadata?.lastModifiedTimestamp || 0,
    remoteTimestamp:
      (remote as any).collaborationMetadata?.lastModifiedTimestamp || 0,
    path: [],
  };

  // Resolve using the appropriate strategy
  const handler = createSyncHandler(strategy, customHandler);
  const resolved = handler(conflict);

  // Return the resolved node
  return resolved.node;
}
