# Docen Package Dependencies

This document outlines the dependencies required for each package in the Docen project.

## @docen/core

### Production Dependencies

- `unified`: Core unified.js processing pipeline
- `yjs`: Collaborative editing framework
- `vfile`: Virtual file handling
- `unist`: Universal Syntax Tree utilities
- `unist-util-visit`: AST traversal utility

## @docen/document

### Production Dependencies

- `@docen/core`: Core Docen functionality
- `remark`: Markdown processor
- `remark-parse`: Markdown parser
- `remark-stringify`: Markdown serializer
- `remark-rehype`: Markdown to HTML transformer
- `rehype`: HTML processor
- `rehype-parse`: HTML parser
- `rehype-stringify`: HTML serializer
- `rehype-remark`: HTML to Markdown transformer
- `mdast`: Markdown AST types and utilities
- `hast`: HTML AST types and utilities

### Custom Implementations

- Additional processors for specialized document formats

### Development Dependencies

- Sample markdown and html files for testing

## @docen/office

### Production Dependencies

- `@docen/core`: Core Docen functionality
- `unpdf`: Utilities to work with PDFs in Node.js, browser and workers
- `pdf-lib`: Pure JavaScript PDF manipulation library (browser-compatible)
- `docx`: Modern DOCX generation library
- `undio`: Type conversion utilities from UnJS
- `unified-engine`: Unified processing engine
- `pathe`: Cross-platform path utilities from UnJS
- `std-env`: Runtime detection from UnJS

### Custom Implementations

The following formats will be implemented without external dependencies:

- **RTF (Rich Text Format)**: Custom parser and generator using AST transformations
- **PowerPoint (.pptx/.ppt)**: Custom implementation for presentation formats
- **OOXML AST (ooxast)**: Custom AST implementation for OOXML formats with unified.js integration
- **OpenDocument formats (.odt/.ods/.odp)**: Custom implementation for OpenDocument support
- **Legacy Office formats (.doc/.xls/.ppt)**: Partial support for reading legacy formats

### Development Dependencies

- Sample office document files for testing

## @docen/data

### Production Dependencies

- `@docen/core`: Core Docen functionality
- `xast`: XML AST types and utilities
- `xast-util-from-xml`: Create xast from XML
- `xast-util-to-xml`: Create XML from xast
- `unified-engine`: Unified processing engine
- `ofetch`: Better fetch API from UnJS (for data fetching)
- `papaparse`: Cross-platform CSV parser (works in browser and Node.js)
- `yaml`: YAML parser and serializer
- `json5`: JSON5 parser and serializer

### Development Dependencies

- Sample data files in various formats for testing

## @docen/media

### Production Dependencies

- `@docen/core`: Core Docen functionality
- `undio`: Data type conversion utilities from UnJS (for binary handling)
- `pathe`: Cross-platform path utilities from UnJS
- `image-meta`: Image type and size detection from UnJS (pure JS implementation)
- `file-type`: Detect file types (browser-compatible version)
- `mime-db`: MIME type database (instead of node-specific mime)
- `y-protocols`: Additional Yjs protocols
- `std-env`: Runtime detection from UnJS
- `sharp`: High-performance image processing (optional, Node.js only)
- `ffmpeg-wasm`: FFmpeg WebAssembly binaries

### Custom Implementations

- Custom handlers for specific image format transformations
- Media stream processing for audio/video formats

### Development Dependencies

- Sample media files for testing

## @docen/providers

### Production Dependencies

- `@docen/core`: Core Docen functionality
- `yjs`: Collaborative editing framework
- `y-websocket`: WebSocket provider for Yjs
- `y-indexeddb`: IndexedDB provider for Yjs
- `y-webrtc`: WebRTC provider for Yjs
- `y-protocols`: Yjs communication protocols
- `lib0`: Utility functions used by Yjs
- `crossws`: Cross-platform WebSocket implementation from UnJS
- `std-env`: Runtime detection from UnJS
- `ofetch`: Better fetch API from UnJS (for HTTP fallback)
- `unstorage`: Universal storage utilities from UnJS
- `hookable`: Extends objects with hooks from UnJS

### Development Dependencies

- Sample provider files for testing

## docen (main package)

### Production Dependencies

- `@docen/core`: Core functionality
- `@docen/document`: Document processing
- `@docen/office`: Office document processing
- `@docen/data`: Data processing
- `@docen/media`: Media processing
- `@docen/providers`: Synchronization providers
- `pathe`: Cross-platform path utils from UnJS
- `std-env`: Runtime detection from UnJS
- `magic-regexp`: Type-safe, readable RegExp alternative from UnJS
- `unplugin`: Unified plugin system from UnJS
- `unenv`: Runtime environment utilities from UnJS

### Development Dependencies

- `size-limit`: Check bundle size
- `vitest`: Cross-platform testing framework

## Shared Development Dependencies (Workspace Root)

- `typescript`: TypeScript compiler
- `vitest`: Testing framework
- `c8`: Code coverage
- `biome`: Linting and formatting
- `unbuild`: Unified build tool for JavaScript/TypeScript projects
- `@funish/githooks`: Git hooks management
- `@funish/lint`: Code and commit message linting
- `changeset`: Version and publish management
- `@types/node`: Node.js type definitions
- `unenv`: Runtime environment utilities for cross-platform compatibility
