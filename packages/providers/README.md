# @docen/providers

![npm version](https://img.shields.io/npm/v/@docen/providers)
![npm downloads](https://img.shields.io/npm/dw/@docen/providers)
![npm license](https://img.shields.io/npm/l/@docen/providers)

> Transport layer for Yjs collaboration in Docen containers

## Overview

The `@docen/providers` package provides **transport layer services** for Yjs document synchronization. It works with collaborative containers from `@docen/containers` to enable real-time collaboration across different networks and storage backends.

**Architecture Role**: This package handles **only transport** - it doesn't contain container-specific logic and works with any Yjs document from `@docen/containers`.

## Features

### 🌐 Transport Providers

- **WebSocket**: Server-based real-time synchronization
- **WebRTC**: Peer-to-peer direct connections
- **IndexedDB**: Local persistence and offline support

### 🔄 Connection Management

- **Lifecycle Management**: Automatic connection/reconnection
- **Provider Selection**: Automatic optimal provider choice
- **Offline Support**: Queue changes when disconnected

### 🛡️ Reliability

- **Connection Recovery**: Automatic reconnection on network issues
- **Conflict Resolution**: Handled by Yjs at the document level
- **State Synchronization**: Efficient delta synchronization

## Architecture

```
packages/providers/src/
├── websocket/        # WebSocket provider implementation
│   ├── provider.ts   # WebSocket provider class
│   └── index.ts      # WebSocket exports
├── webrtc/           # WebRTC provider implementation
│   ├── provider.ts   # WebRTC provider class
│   └── index.ts      # WebRTC exports
├── indexeddb/        # IndexedDB persistence provider
│   ├── provider.ts   # IndexedDB provider class
│   └── index.ts      # IndexedDB exports
├── manager/          # Provider management
│   ├── selector.ts   # Automatic provider selection
│   └── lifecycle.ts  # Connection lifecycle management
└── index.ts          # Main exports
```

## Usage

### WebSocket Provider

```typescript
import { WebSocketProvider } from "@docen/providers";
import { createContainer } from "@docen/containers";

// Create a collaborative container
const container = createContainer("document");

// Connect via WebSocket
const wsProvider = new WebSocketProvider(
  "ws://localhost:8080",
  "room-id",
  container.yjsDoc,
);

// Provider automatically syncs the container
wsProvider.connect();
```

### WebRTC Provider

```typescript
import { WebRTCProvider } from "@docen/providers";
import { createContainer } from "@docen/containers";

const container = createContainer("data");

// Peer-to-peer collaboration
const webrtcProvider = new WebRTCProvider("room-id", container.yjsDoc, {
  signaling: ["wss://signaling.example.com"],
  password: "optional-room-password",
});

webrtcProvider.connect();
```

### IndexedDB Persistence

```typescript
import { IndexedDBProvider } from "@docen/providers";
import { createContainer } from "@docen/containers";

const container = createContainer("presentation");

// Local persistence
const idbProvider = new IndexedDBProvider("document-store", container.yjsDoc);

// Automatically saves changes locally
idbProvider.connect();
```

### Provider Manager

```typescript
import { ProviderManager } from "@docen/providers";
import { createContainer } from "@docen/containers";

const container = createContainer("document");

// Automatic provider selection and management
const manager = new ProviderManager(container.yjsDoc, {
  websocket: { url: "ws://localhost:8080", room: "doc-1" },
  webrtc: { room: "doc-1" },
  indexeddb: { name: "doc-store" },

  // Automatic provider selection
  autoSelect: true,
  fallbackOrder: ["websocket", "webrtc", "indexeddb"],
});

manager.connect();
```

### Multiple Providers

```typescript
import {
  WebSocketProvider,
  IndexedDBProvider,
  ProviderGroup,
} from "@docen/providers";

const container = createContainer("data");

// Use multiple providers simultaneously
const providers = new ProviderGroup([
  new WebSocketProvider("ws://server.com", "room", container.yjsDoc),
  new IndexedDBProvider("local-store", container.yjsDoc),
]);

// WebSocket for real-time sync + IndexedDB for persistence
providers.connect();
```

## Provider Types

### WebSocket Provider

```typescript
interface WebSocketProviderOptions {
  url: string;
  room: string;
  doc: Y.Doc;
  connect?: boolean;
  awareness?: Awareness;
  params?: Record<string, string>;
  headers?: Record<string, string>;
}
```

### WebRTC Provider

```typescript
interface WebRTCProviderOptions {
  room: string;
  doc: Y.Doc;
  signaling?: string[];
  password?: string;
  awareness?: Awareness;
  maxConns?: number;
  filterBcConns?: boolean;
}
```

### IndexedDB Provider

```typescript
interface IndexedDBProviderOptions {
  name: string;
  doc: Y.Doc;
  dbName?: string;
  version?: number;
  autoSave?: boolean;
  saveInterval?: number;
}
```

## Integration with Containers

### Container-Agnostic Design

```typescript
// Works with any container type
import { createContainer } from "@docen/containers";
import { WebSocketProvider } from "@docen/providers";

// Document container (.mdcx)
const docContainer = createContainer("document");
const docProvider = new WebSocketProvider(
  "ws://localhost:8080",
  "doc-room",
  docContainer.yjsDoc,
);

// Data container (.dtcx)
const dataContainer = createContainer("data");
const dataProvider = new WebSocketProvider(
  "ws://localhost:8080",
  "data-room",
  dataContainer.yjsDoc,
);

// Presentation container (.ptcx)
const slideContainer = createContainer("presentation");
const slideProvider = new WebSocketProvider(
  "ws://localhost:8080",
  "slide-room",
  slideContainer.yjsDoc,
);
```

### Awareness Support

```typescript
import { WebSocketProvider } from "@docen/providers";
import { Awareness } from "y-protocols/awareness";

const container = createContainer("document");
const awareness = new Awareness(container.yjsDoc);

// Provider handles awareness automatically
const provider = new WebSocketProvider(
  "ws://localhost:8080",
  "room-id",
  container.yjsDoc,
  { awareness },
);

// Track user presence
awareness.setLocalStateField("user", {
  name: "John Doe",
  color: "#ff0000",
});
```

## Connection Management

### Lifecycle Events

```typescript
import { WebSocketProvider } from "@docen/providers";

const provider = new WebSocketProvider(url, room, doc);

// Connection events
provider.on("status", (event) => {
  console.log("Connection status:", event.status);
  // 'connecting' | 'connected' | 'disconnected' | 'error'
});

provider.on("sync", (isSynced) => {
  console.log("Document synced:", isSynced);
});

provider.on("connection-error", (error) => {
  console.error("Connection error:", error);
});
```

### Automatic Reconnection

```typescript
const provider = new WebSocketProvider(url, room, doc, {
  autoReconnect: true,
  reconnectInterval: 2000,
  maxReconnectAttempts: 10,
});

// Provider automatically handles reconnection
provider.connect();
```

## Dependencies

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `crossws`: Cross-platform WebSocket implementation (v0.3.4)
- `hookable`: Hooks system (v5.5.3)
- `lib0`: Yjs utility functions (v0.2.104)
- `ofetch`: Better fetch API from UnJS (v1.4.1)
- `std-env`: Runtime detection from UnJS (v3.9.0)
- `unstorage`: Universal storage utilities (v1.15.0)
- `y-indexeddb`: IndexedDB provider for Yjs (v9.0.12)
- `y-protocols`: Yjs communication protocols (v1.0.6)
- `y-webrtc`: WebRTC provider for Yjs (v10.3.0)
- `y-websocket`: WebSocket provider for Yjs (v3.0.0)
- `yjs`: Collaborative editing framework (v13.6.26)

## Design Principles

### 1. Transport Only

- No container-specific logic
- Works with any Yjs document
- Pure transport layer abstraction

### 2. Provider Agnostic

- Consistent API across all providers
- Easy switching between transport methods
- Automatic fallback support

### 3. Connection Reliability

- Automatic reconnection handling
- Connection state management
- Error recovery mechanisms

### 4. Performance Optimized

- Efficient delta synchronization
- Minimal bandwidth usage
- Smart provider selection

## Integration

This package integrates with other Docen packages:

- **@docen/containers**: Provides Yjs documents for transport
- **@docen/editor**: Uses providers for real-time collaboration
- **@docen/core**: No direct integration (transport only)

**Note**: This package handles only transport - all document logic remains in `@docen/containers`.

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
