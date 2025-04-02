import * as Y from "yjs";
import { ArrayAdapter } from "../../packages/collaborative/src/adapters/array";

// Create a Yjs document
const ydoc = new Y.Doc();

// Create a shared array for tags and add it to the document
const ytags = ydoc.getArray<string>("tags");

// Create an array adapter for tags
const tagAdapter = new ArrayAdapter<string>();

// Create initial tags
const initialTags = ["docen", "collaborative", "typescript"];

// Add initial tags to the Yjs array
ytags.insert(0, initialTags);

// Observe changes to the array
const cleanup = tagAdapter.observeChanges(ytags, (node) => {
  console.log("Tags updated:", node.data?.items);
});

// Simulate collaborative editing
// User 1 adds a tag
ytags.insert(ytags.length, ["javascript"]);

// User 2 adds a tag
ytags.insert(ytags.length, ["react"]);

// User 1 removes a tag
ytags.delete(0, 1);

// Clean up observer
cleanup();
