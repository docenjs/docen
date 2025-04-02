/**
 * Complex adapter example
 *
 * This example demonstrates working with more complex document structures
 * using the ParentAdapter and RootAdapter.
 *
 * Note: This example imports directly from source files because the complex
 * adapters are still in development and not fully exported from the main package.
 */

import { RootAdapter, TextAdapter } from "@docen/collaborative";
import type { Node, Parent, Root } from "@docen/core";
import * as Y from "yjs";

// Create a document with a nested structure
const document = {
  id: "complex-doc",
  title: "Complex Document",
  metadata: {
    author: "Docen User",
    created: new Date(),
  },
  content: {
    type: "root" as const,
    children: [
      {
        type: "heading" as const,
        data: { level: 1 },
        children: [
          {
            type: "text" as const,
            value: "Complex Document Example",
          },
        ],
      },
      {
        type: "paragraph" as const,
        children: [
          {
            type: "text" as const,
            value: "This document has a complex structure with ",
          },
          {
            type: "emphasis" as const,
            children: [
              {
                type: "text" as const,
                value: "different",
              },
            ],
          },
          {
            type: "text" as const,
            value: " node types.",
          },
        ],
      },
    ],
  },
};

console.log("Starting complex document example");

// Create a Yjs document
const ydoc = new Y.Doc();

// Use the RootAdapter to convert the document root
const rootAdapter = new RootAdapter();
const yroot = rootAdapter.fromAST(document.content);

// Store in the document
const ymap = ydoc.getMap("docen");
ymap.set("content", yroot);

console.log("\nConverted document to Yjs structure");

// Observe changes to the root
let changeCount = 0;
const unobserve = rootAdapter.observeChanges(yroot, (updatedRoot: Root) => {
  changeCount++;
  console.log(`\nDocument update #${changeCount} detected`);
  console.log("Updated root node:", {
    type: updatedRoot.type,
    childrenCount: updatedRoot.children.length,
  });
});

// Example of how to make changes
console.log("\nMaking changes to the document...");
const ymapRoot = yroot as Y.Map<unknown>;
const ychildren = ymapRoot.get("children") as Y.Array<unknown>;

if (ychildren) {
  // Add a new paragraph
  console.log("Adding a new paragraph");
  const textAdapter = new TextAdapter();
  const newText = textAdapter.fromAST({
    type: "text" as const,
    value: "This is a new paragraph added collaboratively.",
  });

  const newParagraph = new Y.Map();
  newParagraph.set("type", "paragraph");

  const paragraphChildren = new Y.Array();
  paragraphChildren.push([newText]);
  newParagraph.set("children", paragraphChildren);

  ychildren.push([newParagraph]);

  console.log("New paragraph added");
}

// Convert back to a document structure
console.log("\nConverting back to document structure");
const resultRoot = rootAdapter.toAST(yroot);
console.log("Result root:", JSON.stringify(resultRoot, null, 2));

// Clean up
console.log("\nCleaning up...");
unobserve();
ydoc.destroy();
console.log("Done!");

console.log("\nExample completed successfully!");
