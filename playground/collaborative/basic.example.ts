/**
 * Basic collaborative document example
 *
 * This example demonstrates the creation of a collaborative document
 * and basic operations that can be performed on it.
 */

import { TextAdapter, createCollaborativeDocument } from "@docen/collaborative";
import * as Y from "yjs";

// Create a sample document
const document = {
  id: "example-doc",
  title: "Example Document",
  metadata: {
    author: "Docen User",
    created: new Date(),
  },
  content: {
    type: "root" as const,
    children: [
      {
        type: "paragraph" as const,
        children: [
          {
            type: "text" as const,
            value: "This is a collaborative document example.",
          },
        ],
      },
    ],
  },
};

// Create collaborative document
const collabDoc = createCollaborativeDocument(document, {
  documentId: "example-doc-1",
  enableUndo: true,
});

console.log("Created collaborative document:", {
  metadata: collabDoc.metadata,
  content: collabDoc.content,
});

// Get the Yjs document
const ydoc = collabDoc.ydoc;
const ymap = ydoc.getMap("docen");
const ytext = ymap.get("content") as Y.Text;

// Display current text content
console.log("\nInitial content:");
console.log(ytext.toString());

// Make a change to the content
console.log("\nMaking a change...");
ytext.insert(ytext.length, " Edits are automatically synced.");

// Create another Yjs document (simulating a remote user)
console.log("\nSimulating a second user...");
const ydocRemote = new Y.Doc();
const ymapRemote = ydocRemote.getMap("docen");
const ytextRemote = new Y.Text();
ytextRemote.insert(0, "This is a change from another user.");
ymapRemote.set("content", ytextRemote);

// Exchange updates between docs (simulating network sync)
console.log("\nSynchronizing between users...");
const update1 = Y.encodeStateAsUpdate(ydoc);
Y.applyUpdate(ydocRemote, update1);

const update2 = Y.encodeStateAsUpdate(ydocRemote);
Y.applyUpdate(ydoc, update2);

// Show merged content
console.log("\nFinal content after synchronization:");
console.log(ytext.toString());

// Use TextAdapter to convert back to AST node
const textAdapter = new TextAdapter();
const textNode = textAdapter.toAST(ytext);
console.log("\nText node from Yjs:", textNode);

// Use undo manager if enabled
if (collabDoc.undoManager) {
  console.log("\nTesting undo functionality...");
  console.log("Current content:", ytext.toString());

  // Perform an edit
  ytext.insert(ytext.length, " This text will be undone.");
  console.log("After edit:", ytext.toString());

  // Undo the edit
  collabDoc.undoManager.undo();
  console.log("After undo:", ytext.toString());

  // Redo the edit
  collabDoc.undoManager.redo();
  console.log("After redo:", ytext.toString());
}

// Clean up
console.log("\nCleaning up...");
collabDoc.disconnect();
console.log("Document disconnected.");

console.log("\nExample completed successfully!");
