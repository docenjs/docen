/**
 * Yjs integration for Docen
 * Provides adapters and utilities for collaborative editing
 */
import * as Y from "yjs";
import {
  type AbstractType,
  type Transaction,
  Array as YArray,
  type Doc as YDoc,
  type YEvent,
  Map as YMap,
  Text as YText,
} from "yjs";
import { isParent } from "../ast";
// Import Node from the consolidated core types
import type {
  CollaborativeNode,
  DocenNode,
  Node,
  NodeBindingStrategy,
  Parent,
  TextNode,
  YjsAdapter,
  YjsAdapterOptions,
  YjsBinding,
} from "../types";
import { resolveIntentBased } from "./sync";
import type { YjsResolvedNode, YjsSyncConflict, YjsSyncHandler } from "./types";

/**
 * Creates a Yjs adapter for collaborative editing
 *
 * @param doc Optional Yjs document to use, creates a new one if not provided
 * @param options Configuration options for the adapter using YjsAdapterOptions
 */
export function createYjsAdapter(
  doc: YDoc = new Y.Doc(),
  options: YjsAdapterOptions = {},
): YjsAdapter {
  const rootMap = doc.getMap<any>("content");

  // Configure undo manager based on undoManagerOptions
  const undoManagerOptions = options.undoManagerOptions ?? {};
  const undoEnabled = undoManagerOptions.enabled !== false; // Default to true
  const trackedOrigins = new Set(
    undoManagerOptions.trackedOrigins ?? ["local-update"],
  ); // Default origin
  const captureTimeout = undoManagerOptions.captureTimeout ?? 500; // Default timeout

  const undoManager = undoEnabled
    ? new Y.UndoManager(rootMap, {
        ...undoManagerOptions, // Pass through other compatible options
        trackedOrigins,
        captureTimeout,
      })
    : null;

  // Define the default binding strategies (ensure NodeBindingStrategy is imported/defined)
  const defaultBindingStrategies: Record<string, NodeBindingStrategy> = {
    text: {
      toYjs(node: Node): AbstractType<any> {
        const yText = new YText();
        if (
          node.type === "text" &&
          typeof (node as TextNode).value === "string"
        ) {
          yText.insert(0, (node as TextNode).value);
        }
        return yText;
      },
      fromYjs(data: Y.AbstractType<any>): TextNode {
        if (!(data instanceof YText)) {
          throw new Error("Expected Y.Text");
        }
        return {
          type: "text",
          value: data.toString(),
        };
      },
      observe(
        node: Node,
        yType: Y.AbstractType<any>,
        callback: (event: Y.YEvent<any>) => void,
      ): () => void {
        if (!(yType instanceof YText)) {
          throw new Error("Expected Y.Text for observation");
        }
        const handler = (event: YEvent<YText>) => callback(event);
        yType.observe(handler);
        return () => yType.unobserve(handler);
      },
    },
    map: {
      toYjs(node: Node): AbstractType<any> {
        const yMap = new YMap();
        for (const [key, value] of Object.entries(node)) {
          // Exclude non-serializable properties and internal ones
          if (
            key !== "type" &&
            key !== "children" &&
            key !== "position" && // Unist position info is not typically synced
            key !== "data" && // Specific handling might be needed for data
            key !== "collaborationMetadata" && // Internal metadata
            key !== "binding" && // Internal binding info
            value !== undefined &&
            !(value instanceof Function) &&
            !(value instanceof Y.AbstractType) // Avoid double-wrapping Y types
          ) {
            try {
              // Attempt to handle different value types
              if (typeof value === "object" && value !== null) {
                // Basic object/array check, might need deeper inspection or specific strategies
                // Avoid circular references - simple JSON stringify/parse check
                // WARNING: This is a basic check and might not cover all cases.
                // Consider using a library for robust cycle detection if needed.
                try {
                  JSON.stringify(value);
                  // If stringify works, assume it's serializable for now
                  yMap.set(key, value);
                } catch (e) {
                  if (
                    e instanceof TypeError &&
                    e.message.includes("circular structure")
                  ) {
                    console.warn(`Skipping circular structure in key: ${key}`);
                  } else {
                    console.warn(
                      `Skipping potentially problematic value for key ${key}:`,
                      value,
                      e,
                    );
                  }
                }
              } else {
                // Handle primitives directly
                yMap.set(key, value);
              }
            } catch (e) {
              console.warn(`Error setting Yjs Map key '${key}':`, e);
            }
          }
        }
        // Always set the node type
        yMap.set("type", node.type);
        // Store ID if available (useful for tracking)
        if ((node as DocenNode).id) {
          yMap.set("id", (node as DocenNode).id);
        }
        return yMap;
      },
      fromYjs(data: Y.AbstractType<any>): Node {
        if (!(data instanceof YMap)) {
          throw new Error("Expected Y.Map");
        }
        const nodeData: Record<string, any> = {
          type: data.get("type") || "map", // Default type if missing
        };
        data.forEach((value, key) => {
          if (key !== "type") {
            if (value instanceof Y.AbstractType) {
              // Recursively convert nested Yjs types back to Nodes
              nodeData[key] = yjsToNode(value);
            } else {
              // Assume other values are primitives/plain objects
              nodeData[key] = value;
            }
          }
        });
        return nodeData as Node;
      },
      observe(
        node: Node,
        yType: Y.AbstractType<any>,
        callback: (event: Y.YEvent<any>) => void,
      ): () => void {
        if (!(yType instanceof YMap)) {
          throw new Error("Expected Y.Map for observation");
        }
        const handler = (event: YEvent<YMap<any>>) => callback(event);
        yType.observe(handler);
        return () => yType.unobserve(handler);
      },
    },
    array: {
      toYjs(node: Node): AbstractType<any> {
        const yArray = new YArray();
        if (isParent(node)) {
          for (const child of node.children) {
            // Find the appropriate strategy for the child node
            const childStrategy =
              adapterInternal.bindingStrategies[child.type] ||
              // Access defaultBindingStrategy from options, fallback to 'map'
              adapterInternal.bindingStrategies[
                options.defaultBindingStrategy || "map"
              ];
            const childYjs = childStrategy.toYjs(child);
            yArray.push([childYjs]);
          }
        }
        return yArray;
      },
      fromYjs(data: Y.AbstractType<any>): Parent {
        if (!(data instanceof YArray)) {
          throw new Error("Expected Y.Array");
        }
        const children: Node[] = [];
        for (let i = 0; i < data.length; i++) {
          const item = data.get(i);
          if (item instanceof Y.AbstractType) {
            children.push(yjsToNode(item));
          } else {
            // Assuming non-AbstractType items are simple nodes or primitives
            // This might need refinement based on actual usage
            children.push(item as Node);
          }
        }
        // Determine parent type dynamically if possible, otherwise use a default
        return {
          type: "array-parent", // Consider making this configurable or dynamic
          children,
        };
      },
      observe(
        node: Node,
        yType: Y.AbstractType<any>,
        callback: (event: Y.YEvent<any>) => void,
      ): () => void {
        if (!(yType instanceof YArray)) {
          throw new Error("Expected YArray for array node observation");
        }
        // Use observeDeep for arrays
        const handler = (
          events: Array<YEvent<any>>,
          transaction: Transaction,
        ) => {
          // Process each event in the deep observation
          // Use for...of instead of forEach
          for (const event of events) {
            callback(event);
          }
        };
        yType.observeDeep(handler);
        // Return the unobserve function
        return () => yType.unobserveDeep(handler);
      },
    },
  };

  // Final binding strategies merging defaults with provided options
  const bindingStrategies: Record<string, NodeBindingStrategy> = {
    ...defaultBindingStrategies,
    ...(options.bindingStrategies || {}),
  };
  // Determine the default strategy to use if a specific type is not found
  const defaultStrategyKey = options.defaultBindingStrategy || "map"; // Default to map
  const fallbackStrategy =
    bindingStrategies[defaultStrategyKey] || bindingStrategies.map;

  // Helper function to convert any Yjs type back to Node using the determined strategy
  function yjsToNode(data: Y.AbstractType<any>): Node {
    let typeKey = "unknown";
    if (data instanceof YText) typeKey = "text";
    else if (data instanceof YArray) typeKey = "array";
    else if (data instanceof YMap && data.has("type"))
      typeKey = data.get("type") as string;
    else if (data instanceof YMap) typeKey = "map";

    // Use the specific strategy or the chosen fallback
    const strategy = bindingStrategies[typeKey] || fallbackStrategy;

    if (!strategy || !strategy.fromYjs) {
      console.error(
        `No valid 'fromYjs' binding strategy found for Yjs type:`,
        data,
        `(TypeKey: ${typeKey}, Fallback: ${defaultStrategyKey})`,
      );
      throw new Error(
        `No valid 'fromYjs' strategy for ${typeKey || "unknown type"}`,
      );
    }
    try {
      return strategy.fromYjs(data);
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      console.error(
        `Error in fromYjs for strategy '${typeKey}':`,
        error.message,
        data,
      );
      throw new Error(`Conversion failed for ${typeKey}: ${error.message}`);
    }
  }

  // Default timestamp-based conflict resolution - MODIFIED
  function defaultTimestampStrategy(
    conflict: YjsSyncConflict,
  ): YjsResolvedNode {
    // Use timestamps directly from the conflict object as provided
    const localTimestamp = conflict.localTimestamp;
    const remoteTimestamp = conflict.remoteTimestamp;

    // Keep local if timestamp is greater or equal
    if (localTimestamp >= remoteTimestamp) {
      return { node: conflict.localNode, origin: "local" };
    }
    // Otherwise, keep remote
    return { node: conflict.remoteNode, origin: "remote" };
  }

  // Intent-based conflict resolution (implementation likely in ./sync)
  function intentBasedStrategy(conflict: YjsSyncConflict): YjsResolvedNode {
    // Assuming resolveIntentBased is correctly implemented and imported
    return resolveIntentBased(conflict);
  }

  // Choose sync strategy based on options
  let resolveConflictHandler: YjsSyncHandler;
  switch (options.syncStrategy) {
    case "custom":
      // Use custom handler if provided, otherwise fallback to timestamp
      resolveConflictHandler = options.customSyncHandler
        ? (options.customSyncHandler as YjsSyncHandler) // Cast if necessary, ensure type compatibility
        : defaultTimestampStrategy;
      break;
    case "intent-based":
      resolveConflictHandler = intentBasedStrategy;
      break;
    default:
      // Default to timestamp strategy
      resolveConflictHandler = defaultTimestampStrategy;
      break;
  }

  // Cache for node bindings to improve performance and avoid redundant conversions
  const nodeBindingCache = new Map<string, AbstractType<any>>();

  // Map for observeChanges handlers to manage listeners correctly
  const changeHandlers = new Map<
    (events: Array<Y.YEvent<any>>, transaction: Y.Transaction) => void,
    (events: Array<Y.YEvent<any>>, transaction: Y.Transaction) => void
  >();

  // Create the internal adapter object including methods
  const adapterInternal: YjsAdapter & {
    _observeNode: <N extends Node>(
      node: N,
      callback: (event: Y.YEvent<any>) => void,
    ) => () => void;
  } = {
    doc,
    rootMap,
    undoManager, // Assign the configured undoManager (can be null)
    bindingStrategies, // Assign the final merged strategies

    bindNode(node: Node): Node & CollaborativeNode {
      // Ensure node has an ID for binding
      const docenNode = node as DocenNode;
      const nodeId = docenNode?.id;
      if (!nodeId) {
        console.warn(
          "Attempted to bind a node without an ID. Returning original node.",
          node,
        );
        // Return the node cast to the expected type, but without binding
        return node as Node & CollaborativeNode;
      }

      // Check cache first
      if (nodeBindingCache.has(nodeId)) {
        // Node is already bound, potentially update metadata if needed?
        // For now, return the node as is (it should already be CollaborativeNode)
        return node as Node & CollaborativeNode;
      }

      // Determine the binding strategy
      const strategy = bindingStrategies[node.type] || fallbackStrategy;
      if (!strategy || !strategy.toYjs) {
        console.warn(
          `No valid 'toYjs' binding strategy found for node type: ${node.type}. Using fallback: ${defaultStrategyKey}. Skipping bind.`,
        );
        return node as Node & CollaborativeNode;
      }

      // Convert node to Yjs type
      let yType: AbstractType<any>;
      try {
        yType = strategy.toYjs(node);
      } catch (e) {
        console.error(`Error in toYjs for strategy '${node.type}':`, e, node);
        return node as Node & CollaborativeNode;
      }

      // Add Yjs type to the document within a transaction (trackable by undo)
      adapterInternal.transact(() => {
        rootMap.set(nodeId, yType);
      }, "local-update"); // Use a consistent, trackable origin

      // Store in cache
      nodeBindingCache.set(nodeId, yType);

      // Create the binding object for the node
      const binding: YjsBinding = {
        type: yType,
        path: [nodeId], // Simple path for root-level binding
        observe: (callback) => {
          if (adapterInternal._observeNode) {
            return adapterInternal._observeNode(node, callback);
          }
          console.warn("_observeNode not available on adapterInternal.");
          return () => {}; // No-op unsubscribe
        },
        update: (newValue) => {
          // Implement update logic based on yType, wrap in transaction
          console.warn(
            "Binding update function called (Implementation needed)",
            { nodeId, newValue },
          );
          adapterInternal.transact(() => {
            // Example: Update logic for YText (needs robust implementation for others)
            if (yType instanceof YText && typeof newValue === "string") {
              yType.delete(0, yType.length);
              yType.insert(0, newValue);
            } else {
              console.error(
                "Update logic not implemented for this Yjs type in binding.",
                yType,
              );
            }
          }, "local-update");
        },
      };

      // Return the node augmented with binding and metadata
      const boundNode: Node & CollaborativeNode = {
        ...node,
        binding: binding,
        // Ensure collaborationMetadata exists, merge if node already had some
        collaborationMetadata: {
          lastModifiedTimestamp: Date.now(), // Set initial timestamp
          ...(node as Partial<CollaborativeNode>).collaborationMetadata, // Merge existing
        },
      };
      return boundNode;
    },

    unbindNode(node: Node & CollaborativeNode): Node {
      const nodeId = (node as DocenNode)?.id;
      if (nodeId && nodeBindingCache.has(nodeId)) {
        nodeBindingCache.delete(nodeId);
        // Remove from Yjs document within a transaction
        if (rootMap.has(nodeId)) {
          adapterInternal.transact(() => {
            rootMap.delete(nodeId);
          }, "local-update");
        }
      }

      // Remove binding and metadata from the node
      const { binding, collaborationMetadata, ...originalNode } = node;
      return originalNode as Node;
    },

    transact<T>(fn: () => T, origin?: string): T {
      // Ensure a default origin is used if none provided, align with undo tracking
      return doc.transact(fn, origin ?? trackedOrigins.values().next().value); // Use first default tracked origin
    },

    // Assign the chosen conflict handler
    resolveConflict: resolveConflictHandler,

    observeChanges(
      callback: (
        events: Array<Y.YEvent<any>>,
        transaction: Y.Transaction,
      ) => void,
    ): () => void {
      // Wrap the callback to ensure it's stored correctly in the map
      const handler = (
        events: Array<YEvent<any>>,
        transaction: Transaction,
      ) => {
        try {
          callback(events, transaction);
        } catch (e) {
          console.error("Error in observeChanges callback:", e);
        }
      };
      changeHandlers.set(callback, handler);
      // Observe deep changes on the root map
      rootMap.observeDeep(handler);

      // Return an unobserve function
      return () => {
        const storedHandler = changeHandlers.get(callback);
        if (storedHandler) {
          try {
            rootMap.unobserveDeep(storedHandler);
          } catch (e) {
            // Catch potential errors during unobserve, e.g., if doc is destroyed
            console.error("Error during rootMap.unobserveDeep:", e);
          }
          changeHandlers.delete(callback);
        }
      };
    },

    // Internal helper method for observing specific nodes (not part of public API)
    _observeNode<N extends Node>(
      node: N,
      callback: (event: Y.YEvent<any>) => void,
    ): () => void {
      const nodeId = (node as DocenNode)?.id;
      let yType = nodeId ? nodeBindingCache.get(nodeId) : undefined;

      if (!yType && nodeId) {
        yType = rootMap.get(nodeId) as AbstractType<any> | undefined;
        if (yType) {
          nodeBindingCache.set(nodeId, yType);
        } else {
          console.warn(
            `Cannot observe node: Yjs type not found in cache or rootMap for node ID: ${nodeId}`,
          );
          return () => {}; // No-op unsubscribe
        }
      } else if (!yType) {
        console.warn(
          "Cannot observe node: No Yjs type found (no node ID or not in cache/rootMap).",
        );
        return () => {}; // No-op unsubscribe
      }

      // Determine the strategy based on the actual Yjs type
      let typeKey = "unknown";
      if (yType instanceof YText) typeKey = "text";
      else if (yType instanceof YArray) typeKey = "array";
      else if (yType instanceof YMap && yType.has("type"))
        typeKey = yType.get("type") as string;
      else if (yType instanceof YMap) typeKey = "map";

      const strategy = bindingStrategies[typeKey] || fallbackStrategy;
      if (!strategy || !strategy.observe) {
        console.warn(
          `No observe implementation in strategy for type: ${typeKey}. Cannot observe.`,
        );
        return () => {}; // No-op unsubscribe
      }

      // Delegate observation to the specific strategy
      try {
        return strategy.observe(node, yType, callback);
      } catch (e) {
        console.error(
          `Error calling observe on strategy for type ${typeKey}:`,
          e,
        );
        return () => {}; // No-op unsubscribe on error
      }
    },
  };

  // Return the public adapter interface, excluding internal methods like _observeNode
  const { _observeNode, ...publicAdapter } = adapterInternal;
  // Ensure the returned publicAdapter conforms to the YjsAdapter interface
  return publicAdapter as YjsAdapter;
}
