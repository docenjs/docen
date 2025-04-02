import type { Document, Node, Root, Text } from "@docen/core";
import * as Y from "yjs";
import { TextAdapter } from "./adapters/base";
import { createAwareness } from "./awareness";
import type {
  CollaborativeDocument,
  CollaborativeOptions,
  YjsEventType,
} from "./types";

/**
 * Error thrown when document structure is invalid
 */
export class InvalidDocumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidDocumentError";
  }
}

/**
 * Extended options for collaborative document
 */
interface ExtendedCollaborativeOptions extends CollaborativeOptions {
  /**
   * Error handler for document operations
   */
  onError?: (error: Error) => void;
}

/**
 * Extended collaborative document interface
 */
interface ExtendedCollaborativeDocument extends CollaborativeDocument {
  /**
   * Document version
   */
  version: number;

  /**
   * Observe document changes
   */
  observe: (callback: (event: YjsEventType) => void) => void;

  /**
   * Update document content
   */
  update: (updater: (content: Y.Text) => void) => void;

  /**
   * Get current document state
   */
  getState: () => {
    content: Node;
    version: number;
  };
}

/**
 * Create a collaborative document wrapper
 */
export function createCollaborativeDocument(
  document: Document,
  options: ExtendedCollaborativeOptions
): ExtendedCollaborativeDocument {
  // Validate document structure
  if (!document.content || !document.content.children) {
    throw new InvalidDocumentError("Document must have content with children");
  }

  const ydoc = new Y.Doc();
  const ymap = ydoc.getMap("docen");

  // Initialize document content
  const textAdapter = new TextAdapter();
  const root = document.content as Root;

  // Convert document structure to Yjs format
  const ytext = convertToYjs(root, textAdapter) as Y.Text;
  ymap.set("content", ytext);

  // Setup undo manager if enabled
  let undoManager: Y.UndoManager | undefined;
  if (options.enableUndo) {
    undoManager = new Y.UndoManager([ytext]);
  }

  // Setup awareness if enabled
  let awareness = undefined;
  if (options.enableAwareness) {
    awareness = createAwareness(ydoc, options.initialAwareness);
  }

  // Setup document version tracking
  const version = (ymap.get("version") as number) || 1;
  ymap.set("version", version);

  // Create collaborative document
  const collaborativeDoc: ExtendedCollaborativeDocument = {
    ...document,
    ydoc,
    undoManager,
    awareness,
    version,

    // Observe changes and update AST
    observe: (callback: (event: YjsEventType) => void) => {
      ytext.observe((event) => {
        try {
          const updatedContent = textAdapter.toAST(ytext);
          document.content = updatedContent as unknown as Root;
          callback(event);
        } catch (error) {
          console.error("Failed to update document:", error);
          if (options.onError) {
            options.onError(error as Error);
          }
        }
      });
    },

    // Update document content
    update: (updater: (content: Y.Text) => void) => {
      try {
        updater(ytext);
      } catch (error) {
        console.error("Failed to update document:", error);
        if (options.onError) {
          options.onError(error as Error);
        }
      }
    },

    // Get current document state
    getState: () => {
      return {
        content: textAdapter.toAST(ytext),
        version: ymap.get("version") as number,
      };
    },

    // Cleanup resources
    disconnect: () => {
      if (awareness) {
        awareness.destroy();
      }
      ydoc.destroy();
    },
  };

  return collaborativeDoc;
}

/**
 * Convert document AST to Yjs format
 */
function convertToYjs(root: Root, adapter: TextAdapter): Y.Text {
  try {
    // Handle different node types
    if (root.type === "root") {
      // For root nodes, concatenate all text content
      const textContent = root.children
        .map((child) => {
          if (child.type === "text") {
            return (child as Text).value;
          }
          // Recursively handle nested nodes
          if ("children" in child) {
            return convertToYjs(child as Root, adapter).toString();
          }
          return "";
        })
        .join("");

      const textNode: Text = {
        type: "text",
        value: textContent,
      };

      return adapter.fromAST(textNode) as Y.Text;
    }

    // Default case: convert to text
    const textNode: Text = {
      type: "text",
      value: root.children
        .map((child) => (child.type === "text" ? (child as Text).value : ""))
        .join(""),
    };

    return adapter.fromAST(textNode) as Y.Text;
  } catch (error) {
    console.error("Failed to convert document to Yjs:", error);
    // Return empty text as fallback
    return new Y.Text();
  }
}
