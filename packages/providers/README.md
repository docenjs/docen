# @docen/collaborative

![npm version](https://img.shields.io/npm/v/@docen/collaborative)
![npm downloads](https://img.shields.io/npm/dw/@docen/collaborative)
![npm license](https://img.shields.io/npm/l/@docen/collaborative)

> Real-time collaboration support for Docen using Yjs

## Overview

`@docen/collaborative` is the real-time collaboration module for the Docen document processing library, built on top of the Yjs CRDT library. This module provides the ability to synchronize document edits across multiple users, enabling collaborative editing experiences similar to Google Docs or Figma.

## Features

- 🔄 **Real-time Synchronization**: Seamless document synchronization across multiple users
- 🧩 **CRDT-based**: Built on Yjs, the fastest CRDT implementation for conflict-free document merging
- ⚡ **Network Agnostic**: Works with any network provider (WebSocket, WebRTC, etc.)
- 📜 **History Management**: Built-in undo/redo functionality
- 🔌 **Extensible**: Adapter system for different node types
- 🌳 **AST Compatible**: Full integration with Docen's AST structure

## Installation

```bash
# npm
$ npm install @docen/collaborative

# yarn
$ yarn add @docen/collaborative

# pnpm
$ pnpm add @docen/collaborative
```

## Usage

### Basic Document Collaboration

```ts
import { createCollaborativeDocument } from "@docen/collaborative";
import { Document } from "@docen/core";

// Create a collaborative document
const collabDoc = createCollaborativeDocument(
  {
    id: "example-doc",
    title: "Example Document",
    content: {
      type: "root",
      children: [
        {
          type: "text",
          value: "Hello, collaborative world!",
        },
      ],
    },
  },
  {
    documentId: "unique-doc-id",
    enableUndo: true,
  },
);

// Access the underlying Yjs document
const ydoc = collabDoc.ydoc;

// When done, disconnect
collabDoc.disconnect();
```

### Working with Arrays

The `ArrayAdapter` provides type-safe array operations for collaborative data structures:

```ts
import * as Y from "yjs";
import { ArrayAdapter } from "@docen/collaborative";

// Create a Yjs document
const ydoc = new Y.Doc();

// Create a shared array for tags
const ytags = ydoc.getArray<string>("tags");

// Create an array adapter
const tagAdapter = new ArrayAdapter<string>();

// Initialize with data
const initialTags = ["docen", "collaborative", "typescript"];
ytags.insert(0, initialTags);

// Observe changes
const cleanup = tagAdapter.observeChanges(ytags, (node) => {
  console.log("Tags updated:", node.data?.items);
});

// Collaborative operations
ytags.insert(ytags.length, ["javascript"]);
ytags.insert(ytags.length, ["react"]);
ytags.delete(0, 1);

// Clean up
cleanup();
```

### Network Synchronization

```ts
import { createCollaborativeDocument } from "@docen/collaborative";
import { WebsocketProvider } from "y-websocket";

// Create collaborative document
const collabDoc = createCollaborativeDocument(document, {
  documentId: "unique-doc-id",
  enableUndo: true,
});

// Connect to WebSocket provider
const wsProvider = new WebsocketProvider(
  "wss://your-server.com",
  collabDoc.documentId,
  collabDoc.ydoc,
);

// Handle connection status
wsProvider.on("status", (event: { status: string }) => {
  console.log("Connection status:", event.status);
});

// Cleanup
function cleanup() {
  wsProvider.disconnect();
  collabDoc.disconnect();
}
```

## API Reference

### Core Functions

#### `createCollaborativeDocument(document, options)`

Creates a collaborative document from a regular Docen document.

```ts
function createCollaborativeDocument(
  document: Document,
  options: CollaborativeOptions,
): CollaborativeDocument;
```

### Interfaces

#### `CollaborativeOptions`

Configuration options for collaborative documents.

```ts
interface CollaborativeOptions {
  documentId: string;
  enableUndo?: boolean;
}
```

#### `CollaborativeDocument`

Interface extending the standard Document interface with collaboration features.

```ts
interface CollaborativeDocument extends Document {
  ydoc: Y.Doc;
  undoManager?: Y.UndoManager;
  disconnect(): void;
}
```

### Adapters

#### `TextAdapter`

Handles conversion between Text nodes and Yjs Text type.

```ts
class TextAdapter implements YjsASTAdapter<TextNode, string> {
  fromAST(node: TextNode): Y.Text;
  toAST(yType: Y.Text): TextNode;
  observeChanges(yType: Y.Text, callback: (node: TextNode) => void): () => void;
}
```

#### `ArrayAdapter<T>`

Handles array data with type-safe operations.

```ts
class ArrayAdapter<T> implements YjsASTAdapter<Node, T> {
  fromAST(node: Node): Y.Array<T>;
  toAST(yType: Y.Array<T>): Node;
  observeChanges(yType: Y.Array<T>, callback: (node: Node) => void): () => void;
}
```

Features:

- Generic type support for type-safe operations
- Automatic synchronization of changes
- Support for nested structures
- CRDT-based conflict resolution

#### `ParentAdapter`

Handles nodes with children, providing a flexible way to manage complex document structures.

```ts
class ParentAdapter implements YjsASTAdapter<Parent> {
  constructor(childAdapters: Map<NodeType, YjsASTAdapter<Node>>);
  fromAST(node: Parent): YjsSharedType;
  toAST(yType: YjsSharedType): Parent;
  observeChanges(
    yType: YjsSharedType,
    callback: (node: Parent) => void,
  ): () => void;
}
```

Features:

- Recursive child node handling
- Type-safe child adapter mapping
- Automatic child node synchronization
- Support for nested document structures

#### `RootAdapter`

Specialized adapter for handling document root nodes, extending ParentAdapter functionality.

```ts
class RootAdapter implements YjsASTAdapter<Parent> {
  constructor(childAdapters: Map<NodeType, YjsASTAdapter<Node>>);
  fromAST(node: Parent): YjsSharedType;
  toAST(yType: YjsSharedType): Parent;
  observeChanges(
    yType: YjsSharedType,
    callback: (node: Parent) => void,
  ): () => void;
}
```

Features:

- Document root-specific handling
- Inherits all ParentAdapter capabilities
- Optimized for root-level operations
- Seamless integration with child adapters

## Integration with Unifiedjs

The collaborative module integrates seamlessly with Docen's document model, which is Unifiedjs-compatible. This allows for:

- Real-time collaboration in Unifiedjs processing pipelines
- Type-safe node transformations
- Efficient CRDT-based synchronization
- Flexible adapter system for different node types

## License

- [MIT](../../LICENSE) &copy; [Demo Macro](https://imst.xyz/)
