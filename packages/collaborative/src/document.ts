import type { Document, Root, Text } from "@docen/core";
import * as Y from "yjs";
import { TextAdapter } from "./adapters/base";
import type { CollaborativeDocument, CollaborativeOptions } from "./types";

/**
 * Create a collaborative document wrapper
 */
export function createCollaborativeDocument(
  document: Document,
  options: CollaborativeOptions,
): CollaborativeDocument {
  const ydoc = new Y.Doc();
  const ymap = ydoc.getMap("docen");

  // Initialize document content
  const textAdapter = new TextAdapter();
  const root = document.content as Root;
  const textNode: Text = {
    type: "text",
    value: root.children
      .map((child) => (child.type === "text" ? (child as Text).value : ""))
      .join(""),
  };
  const ytext = textAdapter.fromAST(textNode);
  ymap.set("content", ytext);

  // Setup undo manager if enabled
  let undoManager: Y.UndoManager | undefined;
  if (options.enableUndo) {
    undoManager = new Y.UndoManager([ytext]);
  }

  // Create collaborative document
  const collaborativeDoc: CollaborativeDocument = {
    ...document,
    ydoc,
    undoManager,
    disconnect: () => {
      ydoc.destroy();
    },
  };

  return collaborativeDoc;
}
