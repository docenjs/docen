# Docen Core

The core module for Docen, providing collaborative document processing capabilities based on `unified.js` and `Yjs`.

## Code Organization

The codebase is organized into the following structure:

```
packages/core/src/
├── ast/              # AST-related code (based on unist)
│   └── index.ts      # Node utility functions
├── yjs/              # Yjs integration
│   ├── index.ts      # Yjs adapter implementation and factory (createYjsAdapter)
│   ├── binding.ts    # Default node binding strategies
│   ├── sync.ts       # Synchronization conflict handlers
│   ├── awareness.ts  # Awareness implementation (extends y-protocols)
│   └── types.ts      # Yjs-specific type definitions (e.g., YjsAdapterOptions)
├── processor/        # Document processor (extends unified.js Processor)
│   ├── index.ts      # Processor implementation (createProcessor)
├── plugins/          # Plugin system
│   ├── index.ts      # Core plugins and discovery logic
├── utils/            # Utility functions
│   └── collaborative.ts # Collaborative editing utilities (Yjs helpers)
├── errors.ts         # Custom error definitions
├── types.ts          # Consolidated core type definitions and re-exports
├── factory.ts        # Factory functions (e.g., re-exporting createProcessor)
└── index.ts          # Main entry point (re-exports main APIs)
```

## Module Dependencies

The dependency graph follows this pattern:

- `ast` - Base definitions with no dependencies
- `utils` - Depends on `ast`, `yjs`
- `yjs` - Depends on `ast`, `types`
- `processor` - Depends on `ast`, `yjs`, `utils`, `types`
- `plugins` - Depends on `ast`, `processor`

## Type System

Core type definitions are consolidated in `src/types.ts`. Specific modules like `yjs` may have their own `types.ts` for internal or adapter-specific types (`yjs/types.ts`). The main `src/types.ts` re-exports important types for the public API.

## Main Exports

The main `index.ts` exports:

- `createProcessor()` - The primary function to create a Docen processor, potentially configured for collaboration.
- Core type definitions from `types.ts`.
- Utility functions from `ast/index.ts` and `utils/index.ts`.

## Basic Usage

```typescript
import { createProcessor } from "@docen/core";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";

// Create a basic processor (no collaboration)
const processor = createProcessor({
  plugins: [remarkParse, remarkStringify],
});

const result = await processor.process("# Hello");
console.log(String(result)); // Output: # Hello

// Create a collaborative processor
const collaborativeProcessor = createProcessor({
  collaborative: true, // Enable collaboration
  plugins: [remarkParse, remarkStringify],
  yjsAdapterOptions: {
    // Configure Yjs adapter
    undoManagerOptions: { enabled: true },
    syncStrategy: "timestamp",
  },
});

// Get the Yjs Adapter (if needed)
const adapter = collaborativeProcessor.getYjsAdapter();
if (adapter) {
  // adapter.doc (Y.Doc)
  // adapter.rootMap (Y.Map)
  // adapter.observeChanges(...)
}

// Process content (underlying Yjs state will be updated/used)
const collabResult = await collaborativeProcessor.process(
  "# Hello Collaborators!",
);
```
