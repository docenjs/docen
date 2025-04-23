/**
 * Synchronization utilities for Yjs integration
 * Provides strategies for resolving conflicts during document synchronization
 */
import * as Y from "yjs";
import type { Node } from "../ast";
import type {
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
  // Simple case: same node type and non-conflicting properties
  if (conflict.localNode.type === conflict.remoteNode.type) {
    // Create a merged node with properties from both sources
    const mergedNode: Record<string, any> = {
      type: conflict.localNode.type,
    };

    // Get all property keys from both nodes
    const allKeys = new Set([
      ...Object.keys(conflict.localNode),
      ...Object.keys(conflict.remoteNode),
    ]);

    // For each property, decide which value to use
    for (const key of allKeys) {
      if (key === "children") continue; // Handle children separately

      const localValue = (conflict.localNode as any)[key];
      const remoteValue = (conflict.remoteNode as any)[key];

      if (localValue === undefined) {
        // Property only exists in remote
        mergedNode[key] = remoteValue;
      } else if (remoteValue === undefined) {
        // Property only exists in local
        mergedNode[key] = localValue;
      } else if (localValue === remoteValue) {
        // Same value in both
        mergedNode[key] = localValue;
      } else {
        // Conflict: prefer the one with more recent timestamp
        mergedNode[key] =
          conflict.localTimestamp >= conflict.remoteTimestamp
            ? localValue
            : remoteValue;
      }
    }

    // Handle children if present in both nodes
    if ("children" in conflict.localNode && "children" in conflict.remoteNode) {
      const localChildren = (conflict.localNode as any).children as Node[];
      const remoteChildren = (conflict.remoteNode as any).children as Node[];

      // Simple merge: longer children array wins
      if (localChildren.length >= remoteChildren.length) {
        mergedNode.children = localChildren;
      } else {
        mergedNode.children = remoteChildren;
      }
    } else if ("children" in conflict.localNode) {
      // Only local has children
      mergedNode.children = (conflict.localNode as any).children;
    } else if ("children" in conflict.remoteNode) {
      // Only remote has children
      mergedNode.children = (conflict.remoteNode as any).children;
    }

    return {
      node: mergedNode as Node,
      origin: "merged",
    };
  }

  // Different node types: fallback to timestamp-based resolution
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

  if (strategy === "intent-based") {
    return resolveIntentBased;
  }

  // Default to timestamp-based strategy
  return resolveTimestampBased;
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
