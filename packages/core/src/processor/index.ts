/**
 * Core processor interface extending unified.js
 * Adds collaborative capabilities to the unified processor
 */
import { type Plugin, type Processor, unified } from "unified";
import { VFile } from "vfile";
import * as Y from "yjs";
import type { RelativePosition } from "yjs";
import type { Node } from "../ast";
import { DocenError } from "../errors";
import {
  type AwarenessState,
  type ChangeEvent,
  ChangeEventType,
  type CollaborationOptions,
  type CollaborativeDocument,
  type DocenProcessor,
  type DocenProcessorOptions,
  type DocumentFragment,
  type FragmentManager,
  type ResolvedNode,
  type SyncConflict,
} from "../types";
import {
  createRelativePositionFromPath,
  getAwarenessCursors,
} from "../utils/collaborative";
import {
  getCollaborativeDocument,
  setCollaborativeDocument,
} from "../utils/vfile";
import { type NodeBindingStrategy, createYjsAdapter } from "../yjs";
import { Awareness } from "../yjs/awareness";

// Define a transformer type that works with our Node type
type DocenTransformer = (node: Node) => Promise<Node> | Node;

// Extended change event with optional error field
interface ExtendedChangeEvent extends ChangeEvent {
  error?: DocenError;
}

/**
 * Extended change event with metadata
 */
interface EnhancedChangeEvent extends ExtendedChangeEvent {
  metadata?: {
    cursorPosition?: { path: (string | number)[]; offset: number };
    selection?: {
      anchor: { path: (string | number)[]; offset: number };
      head: { path: (string | number)[]; offset: number };
    };
    [key: string]: unknown;
  };
}

/**
 * Internal implementation for fragment data structure
 */
interface FragmentData {
  /**
   * Path to the fragment in the parent document
   */
  path: (string | number)[];

  /**
   * The collaborative document for this fragment
   */
  doc: CollaborativeDocument;

  /**
   * Metadata about this fragment
   */
  metadata: {
    /**
     * When the fragment was created
     */
    createdAt: number;

    /**
     * Last time the fragment was accessed
     */
    lastAccessed: number;

    /**
     * Size of the fragment
     */
    size?: number;

    /**
     * Custom metadata
     */
    [key: string]: unknown;
  };
}

// Extended processor interface with our custom methods
interface ExtendedProcessor extends Omit<Processor, "process" | "run"> {
  useCollaboration?: (options?: CollaborationOptions) => ExtendedProcessor;
  observeChanges?: (
    callback: (changes: Array<ChangeEvent>) => void
  ) => () => void;
  getDocument?: () => CollaborativeDocument | null;
  handleConflict?: (conflict: SyncConflict) => ResolvedNode;
  useCollaborativeTransformer?: (
    transformer: DocenTransformer
  ) => ExtendedProcessor;
  setCursor?: (position: {
    path: (string | number)[];
    offset: number;
  }) => ExtendedProcessor;
  setSelection?: (range: {
    anchor: { path: (string | number)[]; offset: number };
    head: { path: (string | number)[]; offset: number };
  }) => ExtendedProcessor;
  getCursors?: () => Array<{
    clientId: number;
    user: Record<string, unknown>;
    cursor: Y.AbsolutePosition | null;
    selection: { anchor: Y.AbsolutePosition; head: Y.AbsolutePosition } | null;
  }>;
  getSubdocument?: (path: (string | number)[]) => CollaborativeDocument | null;
  getFragmentManager?: () => FragmentManager;
  context?: any;
  createSubprocessor?: (doc: Y.Doc) => CollaborativeDocument | null;
  // Add the methods with correct signatures
  run: (node: Node) => Promise<Node>;
  process: (file: VFile | string | CollaborativeDocument) => Promise<VFile>;
}

/**
 * Factory function to create a Docen processor
 */
export function createDocenProcessor(
  options: DocenProcessorOptions = {}
): DocenProcessor {
  // Use the appropriate adapter
  let baseProcessor: ExtendedProcessor;

  switch (options?.adapter) {
    case "remark":
      try {
        const remark = require("remark");
        baseProcessor = remark();
      } catch (error) {
        baseProcessor = unified() as unknown as ExtendedProcessor;
      }
      break;
    case "rehype":
      try {
        const rehype = require("rehype");
        baseProcessor = rehype();
      } catch (error) {
        baseProcessor = unified() as unknown as ExtendedProcessor;
      }
      break;
    case "retext":
      try {
        const retext = require("retext");
        baseProcessor = retext();
      } catch (error) {
        baseProcessor = unified() as unknown as ExtendedProcessor;
      }
      break;
    case "recma":
      try {
        const recma = require("recma");
        baseProcessor = recma();
      } catch (error) {
        baseProcessor = unified() as unknown as ExtendedProcessor;
      }
      break;
    default:
      // Default to a basic unified processor if no adapter specified
      baseProcessor = unified() as unknown as ExtendedProcessor;
  }

  // Create a Y.Doc if collaborative mode is enabled and no doc was provided
  const ydoc = options?.collaborative ? options.ydoc || new Y.Doc() : undefined;

  // Store collaborative context
  const context = {
    ydoc,
    doc: options.document,
    observers: new Set<(changes: Array<ChangeEvent>) => void>(),
    unsubscribeFunctions: new Set<() => void>(),
    collaborativeTransformers: [] as DocenTransformer[],
    syncStrategy: options?.syncStrategy || "timestamp",
    customSyncHandler: options?.customSyncHandler,
    fragments: new Map<string, FragmentData>(),
    awareness: ydoc ? new Awareness(ydoc) : undefined,
    bindingStrategies: new Map<string, NodeBindingStrategy>(),
    fragmentManager: undefined as FragmentManager | undefined,
    fragmentOptions: {
      enabled: options?.fragmentOptions?.enabled || false,
      threshold: options?.fragmentOptions?.threshold || 1000,
      maxFragments: options?.fragmentOptions?.maxFragments || 100,
      nodeTypes: options?.fragmentOptions?.nodeTypes || ["section", "chapter"],
    },
  };

  // Attach context to the processor
  baseProcessor.context = context;

  // Add custom plugins
  if (options.plugins) {
    for (const plugin of options.plugins) {
      baseProcessor.use(plugin);
    }
  }

  // Auto-discover plugins if configured
  if (options.pluginDiscovery?.enabled) {
    try {
      // Get discovered plugins based on the configured paths
      const discoveredPlugins = discoverPlugins(
        options.pluginDiscovery?.paths || []
      );
      for (const plugin of discoveredPlugins) {
        baseProcessor.use(plugin);
      }
    } catch (error) {
      console.warn("Plugin discovery failed:", error);
    }
  }

  // Implement useCollaboration method
  baseProcessor.useCollaboration = function (
    collaborationOptions?: CollaborationOptions
  ) {
    // If a custom doc is provided in options, use it
    if (collaborationOptions?.ydoc) {
      context.ydoc = collaborationOptions.ydoc;
    } else if (!context.ydoc) {
      // Create a new doc if none exists
      context.ydoc = new Y.Doc();
    }

    // Set synchronization strategy
    if (collaborationOptions?.syncStrategy) {
      context.syncStrategy = collaborationOptions.syncStrategy;
    }

    if (collaborationOptions?.customSyncHandler) {
      context.customSyncHandler = collaborationOptions.customSyncHandler;
    }

    // Set fragment options if provided
    if (collaborationOptions?.fragmentOptions) {
      context.fragmentOptions = {
        ...context.fragmentOptions,
        ...collaborationOptions.fragmentOptions,
      };
    }

    // Set up collaboration plugins and features
    if (context.ydoc) {
      // Initialize awareness if not already created
      if (!context.awareness) {
        context.awareness = new Awareness(context.ydoc);
      }

      // Set up Yjs integration
      const adapter = createYjsAdapter(context.ydoc, {
        undoEnabled: collaborationOptions?.undoManager !== false,
        onObserveChanges: (events, transaction) => {
          // Map Yjs events to our change event format with improved typing
          const mappedEvents: Array<ChangeEvent> = events.map(
            (event: Y.YEvent<Y.AbstractType<unknown>>) => {
              let eventType = ChangeEventType.YJS_MAP;

              // Determine the correct event type based on the Yjs event
              if (event.target instanceof Y.Text) {
                eventType = ChangeEventType.YJS_TEXT;
              } else if (event.target instanceof Y.Array) {
                eventType = ChangeEventType.YJS_ARRAY;
              } else if (
                event.target._item &&
                event.target._item.content instanceof Y.XmlElement
              ) {
                eventType = ChangeEventType.YJS_XML;
              }

              // Extract path information if available
              const path = Array.isArray(event.path)
                ? event.path.map((segment) => String(segment))
                : [];

              return {
                type: eventType,
                timestamp: Date.now(),
                source: transaction?.origin === "remote" ? "remote" : "local",
                // Include path information if available
                path,
                // Include the raw Yjs event for advanced processing
                yEvent: event,
              };
            }
          );

          // Notify all registered observers
          for (const observer of context.observers) {
            observer(mappedEvents);
          }

          // Emit unified events for the same changes
          if (context.doc) {
            emitUnifiedEvents(mappedEvents, context.doc);
          }
        },
      });

      // Store the adapter's unsubscribe function if it exists
      if (adapter.destroy) {
        context.unsubscribeFunctions.add(adapter.destroy);
      }
    }

    return this;
  };

  // Implement observeChanges method
  baseProcessor.observeChanges = (
    callback: (changes: Array<ChangeEvent>) => void
  ) => {
    context.observers.add(callback);

    return () => {
      context.observers.delete(callback);
    };
  };

  // Implement getDocument method
  baseProcessor.getDocument = () => context.doc || null;

  // Implement handleConflict method
  baseProcessor.handleConflict = (conflict: SyncConflict): ResolvedNode => {
    // If a custom handler is provided, use it
    if (context.customSyncHandler) {
      return context.customSyncHandler(conflict);
    }

    // Default resolution strategy based on configuration
    if (context.syncStrategy === "timestamp") {
      // Use timestamp-based resolution
      if (conflict.localTimestamp >= conflict.remoteTimestamp) {
        return { node: conflict.localNode, origin: "local" };
      }
      return { node: conflict.remoteNode, origin: "remote" };
    }
    if (context.syncStrategy === "intent-based") {
      // Intent-based resolution (simplified version)
      // In a real implementation, this would analyze the changes to determine intent
      return mergeNodes(conflict.localNode, conflict.remoteNode);
    }

    // Fallback to timestamp-based strategy
    if (conflict.localTimestamp >= conflict.remoteTimestamp) {
      return { node: conflict.localNode, origin: "local" };
    }
    return { node: conflict.remoteNode, origin: "remote" };
  };

  // Implement useCollaborativeTransformer method
  baseProcessor.useCollaborativeTransformer = function (
    transformer: DocenTransformer
  ) {
    context.collaborativeTransformers.push(transformer);
    return this;
  };

  // Implement cursor/selection methods
  baseProcessor.setCursor = function (position: {
    path: (string | number)[];
    offset: number;
  }) {
    if (context.awareness && context.ydoc) {
      try {
        // Create a relative position that can handle document changes
        const relPos = createRelativePositionFromPath(
          context.ydoc,
          position.path,
          position.offset
        );

        // Get current state or create new state
        const currentState =
          context.awareness.getLocalState() || ({} as AwarenessState);

        // Update state with new cursor position
        context.awareness.setLocalState({
          ...currentState,
          cursor: relPos,
          lastActive: Date.now(),
        });

        // Emit cursor movement event
        emitUnifiedEvent({
          type: ChangeEventType.UNIFIED_TRANSFORM,
          timestamp: Date.now(),
          source: "local",
          metadata: {
            cursorPosition: position,
          },
        } as EnhancedChangeEvent);
      } catch (error) {
        console.warn("Failed to set cursor position:", error);
      }
    }

    return this;
  };

  baseProcessor.setSelection = function (range: {
    anchor: { path: (string | number)[]; offset: number };
    head: { path: (string | number)[]; offset: number };
  }) {
    if (context.awareness && context.ydoc) {
      try {
        // Create relative positions for anchor and head
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

        // Get current state or create new state
        const currentState =
          context.awareness.getLocalState() || ({} as AwarenessState);

        // Update state with new selection
        context.awareness.setLocalState({
          ...currentState,
          selection: {
            anchor: anchorRelPos,
            head: headRelPos,
          },
          lastActive: Date.now(),
        });

        // Emit selection change event
        emitUnifiedEvent({
          type: ChangeEventType.UNIFIED_TRANSFORM,
          timestamp: Date.now(),
          source: "local",
          metadata: {
            selection: range,
          },
        } as EnhancedChangeEvent);
      } catch (error) {
        console.warn("Failed to set selection range:", error);
      }
    }

    return this;
  };

  baseProcessor.getCursors = () => {
    if (context.awareness && context.ydoc) {
      return getAwarenessCursors(context.awareness);
    }

    return [];
  };

  // Implement fragment management methods
  baseProcessor.getFragmentManager = function (): FragmentManager {
    if (!this.context.fragmentManager) {
      this.context.fragmentManager = initFragmentManager.call(this);
    }
    return this.context.fragmentManager;
  };

  // Implement subdocument method
  baseProcessor.getSubdocument = function (
    path: (string | number)[]
  ): CollaborativeDocument | null {
    if (!this.getFragmentManager) {
      return null;
    }

    const fragmentManager = this.getFragmentManager();

    // Convert path elements to strings before passing to fragment methods
    const stringPath = path.map((p) => String(p));

    // Check if fragment exists
    if (fragmentManager.hasFragment(stringPath)) {
      const fragment = fragmentManager.getFragment(stringPath);
      return fragment ? fragment.doc : null;
    }

    // Create new fragment if not exists
    const fragment = fragmentManager.createFragment(stringPath);
    return fragment?.doc || null;
  };

  // Cache the original process and run methods
  const originalProcess = baseProcessor.process;
  const originalRun = baseProcessor.run;

  // Override the run method to include collaborative transformers
  const extendedRun = async function (
    this: ExtendedProcessor,
    node: Node
  ): Promise<Node> {
    // First run the standard unified transformers
    const transformedNode = await originalRun.call(this, node);

    // Then apply collaborative transformers if any
    if (context.collaborativeTransformers.length > 0) {
      let result = transformedNode;

      for (const transformer of context.collaborativeTransformers) {
        const transformedResult = await transformer(result);
        if (transformedResult) {
          result = transformedResult;
        }
      }

      return result;
    }

    return transformedNode;
  };

  // Replace the original run method
  baseProcessor.run = extendedRun;

  // Override the process method to handle collaborative documents
  const extendedProcess = function (
    this: ExtendedProcessor,
    file: VFile | string | CollaborativeDocument
  ): Promise<VFile> {
    // Handle no arguments or undefined/null - use empty VFile
    if (!file) {
      return originalProcess.call(this, new VFile());
    }

    // Handle collaborative document
    if (typeof file === "object" && "ydoc" in file) {
      const collaborativeDoc = file as CollaborativeDocument;

      // Store the document in context for later reference
      context.doc = collaborativeDoc;

      // Create processing pipeline for collaborative document
      const processCollabDoc = async (): Promise<VFile> => {
        try {
          // Get content from collaborative document
          const content = await collaborativeDoc.stringify({} as Node);

          // Create VFile
          const vfile = new VFile(content);

          // Store reference to collaborative document
          setCollaborativeDocument(vfile, collaborativeDoc);

          // Emit processing start event
          emitUnifiedEvent({
            type: ChangeEventType.UNIFIED_PROCESS,
            timestamp: Date.now(),
            source: "system",
          });

          // Process with the original method
          const result = await originalProcess.call(this, vfile);

          // Propagate changes back to the collaborative document if needed
          await synchronizeVFileWithCollaborativeDoc(result, collaborativeDoc);

          return result;
        } catch (error) {
          const docenError = new DocenError(
            "Failed to process collaborative document",
            {
              error: error instanceof Error ? error : new Error(String(error)),
            }
          );

          // Emit error as a change event for observers
          emitUnifiedEvent({
            type: ChangeEventType.UNIFIED_PROCESS,
            timestamp: Date.now(),
            source: "system",
            error: docenError,
          } as ExtendedChangeEvent);

          throw docenError;
        }
      };

      return processCollabDoc();
    }

    // Normal unified processing for VFile or string
    return originalProcess.call(this, file);
  };

  // Replace the original process method
  baseProcessor.process = extendedProcess;

  // Helper function to emit unified events
  function emitUnifiedEvent(event: ChangeEvent | ExtendedChangeEvent) {
    for (const observer of context.observers) {
      observer([event]);
    }
  }

  // Helper function to emit multiple unified events from Yjs events
  function emitUnifiedEvents(
    events: ChangeEvent[],
    doc: CollaborativeDocument
  ) {
    // This would map Yjs events to unified lifecycle events
    // Simplified implementation
    const unifiedEvents = events.map((event) => {
      // Map to equivalent unified event type based on the Yjs event
      return {
        type: ChangeEventType.UNIFIED_TRANSFORM,
        timestamp: Date.now(),
        source: event.source,
        path: event.path,
      };
    });

    // Notify observers of unified events
    for (const observer of context.observers) {
      observer(unifiedEvents);
    }
  }

  // Helper to synchronize VFile back to collaborative document
  async function synchronizeVFileWithCollaborativeDoc(
    file: VFile,
    doc: CollaborativeDocument
  ): Promise<void> {
    // This is a placeholder for the real implementation
    // In practice, you would extract the AST from the VFile
    // and update the collaborative document accordingly

    // Get the collaborative document already associated with the VFile
    const associatedDoc = getCollaborativeDocument(file);

    // Only proceed if the document matches
    if (associatedDoc && associatedDoc === doc) {
      // In a real implementation, you'd get the AST and update the document
      // This is a simplified version
      const content = String(file);

      if (content) {
        doc.transact(() => {
          // Update the document content
          // This is simplified - you'd actually update the AST structure
        }, "unified-processor");
      }
    }
  }

  // Helper function to discover plugins
  function discoverPlugins(paths: string[]): Plugin[] {
    // This would implement plugin discovery logic
    // Scan for plugins in node_modules and specified paths

    const builtinPluginDirectories = [
      "./plugins",
      "../plugins",
      "../../node_modules",
    ];

    // Combine builtin and user-specified paths
    const allPaths = [...builtinPluginDirectories, ...paths];

    try {
      // In a full implementation, this would scan directories
      // and load plugins dynamically

      // For now returning an empty array as this is just the structure
      return [];
    } catch (error) {
      console.warn("Plugin discovery error:", error);
      return [];
    }
  }

  // Helper function to merge nodes for intent-based resolution
  function mergeNodes(localNode: Node, remoteNode: Node): ResolvedNode {
    // This is a simplified placeholder
    // In a real implementation, you would implement a proper merging strategy
    // that understands the structure of the nodes and can merge them
    // based on the semantic intent of the changes

    // For now, we'll just use the most recently modified node
    const localTimestamp =
      localNode.collaborationMetadata?.lastModifiedTimestamp || 0;
    const remoteTimestamp =
      remoteNode.collaborationMetadata?.lastModifiedTimestamp || 0;

    if (localTimestamp >= remoteTimestamp) {
      return { node: localNode, origin: "local" };
    }
    return { node: remoteNode, origin: "remote" };
  }

  // Helper function to get node at a specific path in the Yjs document
  function getNodeAtPath(
    rootMap: Y.Map<unknown>,
    path: (string | number)[]
  ): Y.AbstractType<unknown> | undefined {
    // Use type assertion for the initial value since Y.Map extends AbstractType
    let current: Y.AbstractType<unknown> | undefined =
      rootMap as Y.AbstractType<unknown>;

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

  // Add helper function for position creation
  /**
   * Creates a relative position that can track a location in the document
   */
  function createRelativePosition(
    path: (string | number)[],
    offset: number,
    doc: Y.Doc
  ): RelativePosition {
    // First get the shared type at the given path
    const sharedType = getNodeAtPath(doc.getMap("root"), path);

    if (!sharedType) {
      throw new Error(`Cannot find shared type at path: ${path.join(".")}`);
    }

    // Now create the relative position using the shared type
    return Y.createRelativePositionFromTypeIndex(sharedType, offset);
  }

  // Initialize the fragment manager
  function initFragmentManager(this: ExtendedProcessor): FragmentManager {
    // Store fragments in a Map with path strings as keys
    const fragments = new Map<string, DocumentFragment>();
    // Maximum number of fragments allowed
    const maxFragments = this.context?.fragmentOptions?.maxFragments || 100;

    // Helper function to create a sub-processor for fragments
    const createSubProcessor = (ydoc: Y.Doc): CollaborativeDocument | null => {
      // This would create a new collaborative document with the given Y.Doc
      // Implementation depends on the actual CollaborativeDocument construction
      try {
        // TODO: Implement actual sub-processor creation
        return null;
      } catch (e) {
        console.error("Failed to create sub-processor:", e);
        return null;
      }
    };

    return {
      createFragment: (path: string[], options = {}) => {
        const pathKey = JSON.stringify(path);

        // Create subdocument
        const ydoc = new Y.Doc();

        // Create fragment
        const fragment: DocumentFragment = {
          path,
          doc: this.createSubprocessor
            ? this.createSubprocessor(ydoc)
            : createSubProcessor(ydoc),
          metadata: {
            createdAt: Date.now(),
            lastAccessed: Date.now(),
            size: 0,
            ...options.metadata,
          },
        };

        // Check if we need to remove old fragments
        if (fragments.size >= maxFragments) {
          // Find oldest fragment
          let oldestKey = pathKey;
          let oldestAccessed = fragment.metadata?.lastAccessed || Date.now();

          fragments.forEach((frag, key) => {
            const accessed = frag.metadata?.lastAccessed || Date.now();
            if (accessed < oldestAccessed) {
              oldestAccessed = accessed;
              oldestKey = key;
            }
          });

          // Remove oldest if not the current one
          if (oldestKey !== pathKey) {
            fragments.delete(oldestKey);
          }
        }

        fragments.set(pathKey, fragment);
        return fragment;
      },

      getFragment: (path: string[]) => {
        const pathKey = JSON.stringify(path);
        const fragment = fragments.get(pathKey) || null;

        // Update last accessed time
        if (fragment?.metadata) {
          fragment.metadata.lastAccessed = Date.now();
        }

        return fragment;
      },

      hasFragment: (path: string[]) => {
        const pathKey = JSON.stringify(path);
        return fragments.has(pathKey);
      },

      listFragments: () => {
        return Array.from(fragments.values());
      },

      removeFragment: (path: string[]) => {
        const pathKey = JSON.stringify(path);
        return fragments.delete(pathKey);
      },
    };
  }

  return baseProcessor as unknown as DocenProcessor;
}

/**
 * Main factory function to create a docen processor (shorthand)
 */
export function docen(options?: {
  adapter?: "remark" | "rehype" | "retext" | "recma";
  collaborative?: boolean;
  syncStrategy?: "timestamp" | "intent-based" | "custom";
  document?: CollaborativeDocument;
  fragmentOptions?: {
    enabled: boolean;
    threshold?: number;
    maxFragments?: number;
    nodeTypes?: string[];
  };
}): DocenProcessor {
  return createDocenProcessor(options);
}
