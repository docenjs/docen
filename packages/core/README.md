# @docen/core

Core unified.js processor interface, types, and utilities for the Docen ecosystem.

## Overview

The `@docen/core` package provides the foundation for all Docen format processing packages. It extends the unified.js ecosystem with shared types, interfaces, and utilities while maintaining full compatibility with the unified.js plugin ecosystem.

**Key Principle**: This package contains **no collaboration code** - it focuses purely on unified.js compatibility and format processing infrastructure.

## Architecture

```
packages/core/src/
├── ast/              # Standard unist utilities re-exports
│   └── index.ts      # Re-exports u, visit, is, find, etc. from unist ecosystem
├── processor/        # Unified.js processor extensions
│   └── index.ts      # DocenProcessor interface and factory
├── plugins/          # Plugin system
│   └── index.ts      # Core plugins and utilities
├── errors.ts         # Error types and handling
├── types.ts          # Core type definitions extending unist
└── index.ts          # Main exports
```

## Core Features

### 🔧 Unified.js Extensions

- **DocenProcessor**: Enhanced unified processor interface
- **Plugin System**: Core plugins for document processing
- **Error Handling**: Structured error types for document processing

### 🌳 Standard Unist Utilities

- **Pure Re-exports**: Standard unist ecosystem tools (u, visit, is, find, etc.)
- **No Custom Wrappers**: Direct access to unist-util-\* functions
- **Type Safety**: Full TypeScript support with unist types

### 🛠️ Plugin System

- **Core Plugins**: Built-in plugins for validation, metadata, change tracking
- **Plugin Creation**: Helper functions for creating compliant plugins
- **Plugin Registration**: Simple plugin registration system

## Usage

### Basic Processor Creation

```typescript
import { createProcessor } from "@docen/core";

// Create a basic processor
const processor = createProcessor({
  adapter: "remark", // or "rehype", "retext", "recma"
  plugins: [
    // Standard unified.js plugins
  ],
});

const result = await processor.process("# Hello World");
```

### AST Utilities

```typescript
import { is, u, visit, find } from "@docen/core";
import type { Node, Parent } from "@docen/core";

// Type checking with standard unist-util-is
const isParagraph = is(node, "paragraph");
const hasChildren = is(node, { type: "*", children: [] });

// Node creation with unist-builder
const paragraph = u("paragraph", [u("text", "Hello world")]);

// Tree traversal with unist-util-visit
visit(tree, "paragraph", (node) => {
  console.log("Found paragraph:", node);
});

// Find nodes with unist-util-find
const firstHeading = find(tree, "heading");
```

### Error Handling

```typescript
import {
  DocenError,
  ParseError,
  ensureDocenError,
  tryCatch,
} from "@docen/core";

// Structured error handling
const result = await tryCatch(async () => {
  return await processor.process(content);
});

if (!result.success) {
  console.error("Processing failed:", result.error);
}
```

### Plugin Development

```typescript
import { createPlugin, validationPlugin, metadataPlugin } from "@docen/core";

// Use built-in core plugins
const processor = createProcessor({
  adapter: "remark",
  plugins: [
    validationPlugin(), // Basic AST validation
    metadataPlugin(), // Processing metadata
  ],
});

// Create custom plugins
const myPlugin = createPlugin(
  function () {
    return (tree, file) => {
      // Plugin implementation
      return tree;
    };
  },
  {
    name: "my-plugin",
    description: "Example plugin",
    version: "1.0.0",
  },
);
```

### Built-in Plugins

```typescript
import {
  validationPlugin,
  metadataPlugin,
  changeTrackingPlugin,
  fragmentationPlugin,
  cursorTrackingPlugin,
} from "@docen/core";

// Validation plugin - validates AST structure
const validation = validationPlugin();

// Metadata plugin - adds processing metadata
const metadata = metadataPlugin();

// Change tracking plugin - tracks document changes
const changeTracking = changeTrackingPlugin();

// Fragmentation plugin - enables document fragmentation
const fragmentation = fragmentationPlugin({
  threshold: 1000,
  maxFragments: 100,
  nodeTypes: ["section", "chapter"],
});

// Cursor tracking plugin - enables cursor position tracking
const cursorTracking = cursorTrackingPlugin();
```

## Type System

### Core Types

```typescript
// Extends unist types
interface Node extends UnistNode {
  // Pure unist node, no collaboration metadata
}

interface Parent extends Node, UnistParent {
  children: Node[];
}

// Processor interface
interface DocenProcessor extends UnifiedProcessor {
  // Enhanced unified processor
}

// Plugin metadata
interface PluginMeta {
  name: string;
  description?: string;
  version?: string;
}
```

### Error Types

- **DocenError**: Base error class with context
- **ParseError**: Parsing-specific errors with position info
- **TransformError**: Transformation errors with node context
- **ValidationError**: Schema validation errors
- **PluginError**: Plugin execution errors

## Dependencies

The core package uses minimal, focused dependencies:

- `unified`: Core unified.js processing pipeline (v11.0.5)
- `vfile`: Virtual file handling (v6.0.3)
- `unist`: Universal Syntax Tree base types (v0.0.1)
- `unist-builder`: AST node creation utilities (v4.0.0) - **Standard u() function**
- `unist-util-filter`: AST filtering utilities (v5.0.1)
- `unist-util-find`: AST search utilities (v3.0.0)
- `unist-util-is`: AST type checking utilities (v6.0.0) - **Use is(node, 'type')**
- `unist-util-map`: AST transformation utilities (v4.0.0)
- `unist-util-remove`: AST node removal utilities (v4.0.0)
- `unist-util-select`: CSS-like AST selection utilities (v5.1.0)
- `unist-util-visit`: AST traversal utility (v5.0.0)
- `unist-util-visit-parents`: AST traversal with parent tracking (v6.0.1)

**Development Dependencies:**

- `@types/unist`: TypeScript definitions for unist (v3.0.3)

## Design Principles

### 1. Pure Unified.js Compatibility

- Extends standard unified.js patterns
- Compatible with existing unified.js plugins
- No proprietary abstractions or lock-in

### 2. Type Safety First

- Full TypeScript support throughout
- Comprehensive type definitions
- Runtime type validation where needed

### 3. Minimal Surface Area

- Focused on core functionality only
- No collaboration or format-specific code
- Clear separation of concerns

### 4. Extensibility

- Plugin-based architecture
- Configurable processors
- Open for extension, closed for modification

## Integration

The core package serves as the foundation for all format packages:

- **@docen/document**: Uses core types and processors for text formats
- **@docen/data**: Uses core infrastructure for data formats
- **@docen/media**: Uses core plugin system for media processing
- **@docen/office**: Uses core for format detection and routing

Collaboration features are handled separately in `@docen/containers` - the core package remains collaboration-free.

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
