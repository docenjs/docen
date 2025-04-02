import type { Document, Root, Text } from "@docen/core";
import * as Y from "yjs";
import { TextAdapter } from "./adapters/base";
import { createAwareness } from "./awareness";
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

  // Setup awareness if enabled
  let awareness = undefined;
  if (options.enableAwareness) {
    awareness = createAwareness(ydoc, options.initialAwareness);
  }

  // Create collaborative document
  const collaborativeDoc: CollaborativeDocument = {
    ...document,
    ydoc,
    undoManager,
    awareness,
    disconnect: () => {
      if (awareness) {
        awareness.destroy();
      }
      ydoc.destroy();
    },
  };

  return collaborativeDoc;
}
