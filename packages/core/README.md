# Docen Core

The core module for Docen, providing collaborative document processing capabilities.

## Code Organization

The codebase is organized into the following structure:

```
packages/core/src/
├── ast/              # AST-related code
│   ├── index.ts      # Node utility functions
│   └── types.ts      # AST type definitions
├── yjs/              # Yjs integration
│   ├── index.ts      # Yjs adapter and exports
│   ├── binding.ts    # Node binding strategies
│   ├── sync.ts       # Synchronization utilities
│   ├── awareness.ts  # Awareness implementation
│   └── types.ts      # Yjs-related type definitions
├── document/         # Document implementation
│   ├── index.ts      # Core document class
│   └── types.ts      # Document type definitions
├── processor/        # Document processor
│   ├── index.ts      # Processor implementation
│   └── types.ts      # Event and processor types
├── plugins/          # Plugin system
│   ├── index.ts      # Plugin discovery and core plugins
│   └── types.ts      # Plugin interface definitions
├── utils/            # Utility functions
│   ├── index.ts      # General utilities
│   ├── vfile.ts      # VFile extensions
│   ├── collaborative.ts # Collaborative editing utilities
│   └── types.ts      # Utility type definitions
├── errors.ts         # Error definitions
├── types.ts          # Type re-exports
└── index.ts          # Main entry point
```

## Module Dependencies

The dependency graph follows this pattern:

- `ast` - Base definitions with no dependencies
- `utils` - Depends on ast
- `yjs` - Depends on ast
- `document` - Depends on ast, yjs, utils
- `processor` - Depends on ast, document, yjs, utils
- `plugins` - Depends on ast, processor

## Type System

Each module has its own `types.ts` file that defines the types specific to that module. The root `types.ts` re-exports all these types for convenience.

## Main Exports

The main `index.ts` exports:

- `createDocument()` - Create a collaborative document
- `createProcessor()` - Create a document processor
- Type definitions from all modules
