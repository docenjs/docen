/**
 * Factory functions for creating Docen processors and documents
 */
import { unified } from "unified";
import * as Y from "yjs";
import type { Node } from "./ast";
import type { DocenProcessor } from "./processor/types";
import type {
  ChangeEvent,
  CollaborationOptions,
  CollaborativeDocument,
  ResolvedNode,
  SyncConflict,
} from "./types";
import { createYjsAdapter } from "./yjs";

/**
 * Extensions for Docen processor
 */
interface DocenProcessorExtensions {
  useCollaboration(options?: CollaborationOptions): DocenProcessor;
  observeChanges(callback: (changes: Array<ChangeEvent>) => void): () => void;
  getDocument(): CollaborativeDocument | null;
}

/**
 * Factory function that creates a Docen processor
 *
 * @returns A new Docen processor instance
 */
export function docen(): DocenProcessor {
  // Start with a unified processor
  const processor = unified() as unknown as DocenProcessor;

  // Create collaborative extensions
  const extensions: DocenProcessorExtensions = {
    useCollaboration: (options?: CollaborationOptions) => {
      // Implementation would set up collaboration here
      return processor as DocenProcessor;
    },

    observeChanges: (callback: (changes: Array<ChangeEvent>) => void) => {
      // Implementation would set up change observation here
      return () => {
        // Return cleanup function
      };
    },

    getDocument: () => {
      // Return associated document
      return null;
    },
  };

  // Combine processor with extensions
  return Object.assign(processor, extensions);
}

/**
 * Create a processor with a specific adapter
 *
 * @param options Configuration options
 * @returns A new Docen processor
 */
export function createProcessor(options?: {
  adapter?: "remark" | "rehype" | "retext" | "recma";
  collaborative?: boolean;
  syncStrategy?: "timestamp" | "intent-based" | "custom";
  customSyncHandler?: (conflict: SyncConflict) => ResolvedNode;
}): DocenProcessor {
  // Create base processor
  const processor = docen();

  // Apply adapter-specific configuration
  switch (options?.adapter) {
    case "remark":
      // Would configure for Markdown processing
      break;
    case "rehype":
      // Would configure for HTML processing
      break;
    case "retext":
      // Would configure for natural language processing
      break;
    case "recma":
      // Would configure for JavaScript/ECMAScript processing
      break;
    default:
      // No specific adapter
      break;
  }

  // Enable collaboration if requested
  if (options?.collaborative) {
    processor.useCollaboration({
      syncStrategy: options.syncStrategy,
      customSyncHandler: options.customSyncHandler,
    });
  }

  return processor;
}

/**
 * Create a collaborative document
 *
 * @param content Initial content
 * @param options Configuration options
 * @returns A new collaborative document
 */
export function createDocument(
  content?: string | Node | Uint8Array,
  options?: {
    id?: string;
    type?: string;
    collaborative?: boolean;
    syncStrategy?: "timestamp" | "intent-based" | "custom";
    customSyncHandler?: (conflict: SyncConflict) => ResolvedNode;
    undoManagerOptions?: {
      enabled?: boolean;
      trackedOrigins?: Set<string>;
      captureTimeout?: number;
    };
    bindingStrategy?: "deep" | "shallow" | "lazy";
    fragmentOptions?: {
      enableAutoFragmentation?: boolean;
      threshold?: number;
      nodeTypes?: string[];
    };
  }
) {
  // Create Yjs document
  const ydoc = new Y.Doc();

  // Generate document ID if not provided
  const id =
    options?.id || `doc-${Math.random().toString(36).substring(2, 11)}`;

  // Create Yjs adapter
  const adapter = createYjsAdapter(ydoc, {
    undoEnabled: options?.undoManagerOptions?.enabled !== false,
    undoScope: options?.undoManagerOptions?.trackedOrigins
      ? Array.from(options.undoManagerOptions.trackedOrigins).join(",")
      : undefined,
  });

  // This is a placeholder implementation
  // A full implementation would include all the methods
  // defined in the CollaborativeDocument interface
  return {
    ydoc,
    id,
    adapter,

    parse: async (input: string) => {
      // Parse input to AST
      return { type: "root", children: [] };
    },

    stringify: async (tree: Node) => {
      // Convert AST to string
      return "";
    },

    run: async (tree: Node) => {
      // Run transformers
      return tree;
    },

    process: async (input: string | Node) => {
      // Complete processing pipeline
      const tree = { type: "root", children: [] };
      return { tree, value: "" };
    },

    transact: <T>(fn: () => T, origin?: string) => {
      // Execute within transaction
      return ydoc.transact(fn, origin);
    },

    destroy: () => {
      // Clean up resources
      ydoc.destroy();
    },
  };
}
