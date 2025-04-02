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

### Creating a Collaborative Document

```ts
import { createCollaborativeDocument } from "@docen/collaborative";
import { Document } from "@docen/core";

// Start with a Document instance
const document: Document = {
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
};

// Create a collaborative version of the document
const collabDoc = createCollaborativeDocument(document, {
  documentId: "unique-doc-id",
  enableUndo: true,
});

// Access the underlying Yjs document
const ydoc = collabDoc.ydoc;

// When done, disconnect
collabDoc.disconnect();
```

### Implementing Network Synchronization

```ts
import { createCollaborativeDocument } from "@docen/collaborative";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";

// Create collaborative document
const collabDoc = createCollaborativeDocument(document, {
  documentId: "unique-doc-id",
  enableUndo: true,
});

// Connect to a WebSocket provider (example)
const wsProvider = new WebsocketProvider(
  "wss://your-server.com",
  collabDoc.documentId,
  collabDoc.ydoc,
);

// Handle connection status
wsProvider.on("status", (event: { status: string }) => {
  console.log("Connection status:", event.status);
});

// Disconnect when done
function cleanup() {
  wsProvider.disconnect();
  collabDoc.disconnect();
}
```

## API Reference

### Main Functions

- `createCollaborativeDocument(document, options)` - Creates a collaborative document from a regular Docen document

### Interfaces

#### CollaborativeOptions

Configuration options for collaborative documents:

- `documentId` - Unique identifier for the document
- `enableUndo` - Whether to enable undo/redo functionality (default: false)

#### CollaborativeDocument

Interface extending the standard Document interface with collaboration features:

- `ydoc` - The underlying Yjs document instance
- `undoManager` - Yjs UndoManager instance (if enabled)
- `disconnect()` - Method to clean up resources and disconnect

#### YjsASTAdapter

Interface for adapters that convert between Docen AST nodes and Yjs shared types:

- `fromAST(node)` - Converts a Docen AST node to a Yjs shared type
- `toAST(yType)` - Converts a Yjs shared type to a Docen AST node
- `observeChanges(yType, callback)` - Sets up change observation on a Yjs type

### Adapters

- `TextAdapter` - Adapter for converting between Text nodes and Yjs Text type

## Integration with Unifiedjs

The collaborative module is designed to work with the Docen document model, which is Unifiedjs-compatible. This allows for seamless integration with Unifiedjs processing pipelines while adding real-time collaboration capabilities.

## License

- [MIT](../../LICENSE) &copy; [Demo Macro](https://imst.xyz/)
