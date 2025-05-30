# Docen Package Dependencies

This document outlines the dependencies required for each package in the Docen project based on the container-level collaboration architecture.

## Architecture Overview

**Key Principle**: Only @docen/containers contains Yjs collaboration code. All other packages focus on pure format processing.

## @docen/core

### Production Dependencies

- `unified`: Core unified.js processing pipeline (v11.0.5)
- `vfile`: Virtual file handling (v6.0.3)
- `unist`: Universal Syntax Tree base types (v0.0.1)
- `unist-builder`: AST node creation utilities (v4.0.0)
- `unist-util-assert`: AST validation utilities (v4.0.0)
- `unist-util-filter`: AST filtering utilities (v5.0.1)
- `unist-util-find`: AST search utilities (v3.0.0)
- `unist-util-is`: AST type checking utilities (v6.0.0)
- `unist-util-map`: AST transformation utilities (v4.0.0)
- `unist-util-remove`: AST node removal utilities (v4.0.0)
- `unist-util-select`: CSS-like AST selection utilities (v5.1.0)
- `unist-util-visit`: AST traversal utility (v5.0.0)
- `unist-util-visit-parents`: AST traversal with parent tracking (v6.0.1)

### Development Dependencies

- `@types/unist`: TypeScript definitions for unist (v3.0.3)

### Custom Implementations

- **Core Interfaces**: DocenProcessor extending UnifiedProcessor
- **Factory Functions**: Format detection and processor creation
- **Type Definitions**: Shared types across all packages (Node, Parent, TextNode, DocenRoot)
- **AST Utilities**: Node creation, validation, and traversal helpers
- **Plugin System**: Basic plugin discovery and metadata management
- **Error Handling**: Comprehensive error types (DocenError, ParseError, TransformError, ValidationError, PluginError)
- **No Collaboration Code**: Pure unified.js compatibility

### Key Point

**No Yjs dependencies** - Pure unified.js core functionality only.

## @docen/document

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `hast-util-from-html`: Parse HTML to HAST (v2.0.3)
- `hast-util-to-html`: Serialize HAST to HTML (v9.0.5)
- `hast-util-to-mdast`: Convert HAST to MDAST (v10.1.2)
- `mdast-util-from-markdown`: Parse Markdown to MDAST (v2.0.2)
- `mdast-util-to-hast`: Convert MDAST to HAST (v13.2.0)
- `mdast-util-to-markdown`: Serialize MDAST to Markdown (v2.1.2)
- `micromark-extension-gfm`: GitHub Flavored Markdown support (v3.0.0)
- `mdast-util-gfm`: MDAST utilities for GFM (v3.1.0)
- `unist-util-visit`: AST traversal utility (v5.0.0)
- `unist-util-find`: AST search utilities (v3.0.0)

### Custom Implementations

- **Pure Format Processing**: Text documents using bottom-level utilities
- **GFM Support**: GitHub Flavored Markdown processing
- **Bidirectional Conversion**: Markdown ↔ HTML conversion
- **Plugin Compatibility**: Works with existing mdast/hast plugins

### Key Point

**No Yjs dependencies** - Pure unified.js text processing using low-level utilities.

## @docen/data

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `json5`: JSON5 parser and serializer (v2.2.3)
- `ofetch`: Better fetch API from UnJS (v1.4.1)
- `papaparse`: CSV parser and serializer (v5.5.2)
- `unified-engine`: Unified.js processing engine (v11.2.2)
- `xast`: XML AST types (v0.1.217)
- `xast-util-from-xml`: Create xast from XML (v4.0.0)
- `xast-util-to-xml`: Create XML from xast (v4.0.0)
- `yaml`: YAML parser and serializer (v2.7.1)

### Custom Implementations

- **Pure Data Processing**: Standard unified.js data processing
- **Format Conversion**: Bidirectional conversion between data formats
- **Data AST**: Unified AST for all data formats (JSON, YAML, CSV, XML)
- **Schema Validation**: Data structure validation

### Key Point

**No Yjs dependencies** - Pure unified.js data processing only.

## @docen/media

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `ffmpeg-static`: Static FFmpeg binaries (v5.2.0)
- `file-type`: File type detection (v20.4.1)
- `fluent-ffmpeg`: FFmpeg wrapper (v2.1.3)
- `image-size`: Image dimensions detection (v2.0.2)
- `image-type`: Image type detection (v5.2.0)
- `jimp`: Pure JavaScript image processing (v1.6.0)
- `media-typer`: MIME type parsing (v1.1.0)
- `music-metadata`: Audio metadata extraction (v11.2.1)
- `sharp`: High-performance image processing (v0.34.1)
- `svgo`: SVG optimization (v3.3.2)

### Custom Implementations

- **Independent Processing Pipeline**: Media optimization
- **Format Conversion Engine**: Multi-format image/video conversion
- **Metadata Extraction**: Comprehensive media metadata support
- **Unified.js Integration**: Media nodes for pipeline compatibility

### Key Point

**No collaboration features** - Independent processing toolkit only.

## @docen/office

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `docx`: Modern DOCX generation library (v9.4.1)
- `fflate`: Fast ZIP compression/decompression (v0.8.2)
- `image-meta`: Image metadata extraction (v0.2.1)
- `ofetch`: Better fetch API from UnJS (v1.4.1)
- `pathe`: Cross-platform path utilities (v2.0.3)
- `pdf-lib`: Pure JavaScript PDF manipulation (v1.17.1)
- `std-env`: Runtime detection from UnJS (v3.9.0)
- `undio`: Data type conversion utilities from UnJS (v0.2.0)
- `unified-engine`: Unified.js processing engine (v11.2.2)
- `unpdf`: PDF utilities for all runtimes (v0.12.1)
- `vfile`: Virtual file handling (v6.0.3)
- `xast-util-from-xml`: Create xast from XML (v4.0.0)
- `xast-util-to-string`: Extract text from xast (v3.0.0)
- `xast-util-to-xml`: Create XML from xast (v4.0.0)
- `xastscript`: Create xast nodes (v4.0.0)

### Development Dependencies

- `@types/xast`: TypeScript definitions for xast (v2.0.4)

### Custom Implementations

- **OOXML AST Focus**: Convert office formats to unified OOXML AST
- **Format Processing**: DOCX and PDF processing and transformation
- **Plugin System**: Extensible transformation pipeline
- **Cross-platform**: Works in Node.js, browsers, and workers

### Key Point

**No collaboration code** - Pure format detection and OOXML transformation only.

## @docen/containers

**🔥 THE ONLY PACKAGE WITH YJS COLLABORATION CODE 🔥**

### Production Dependencies

- `yjs`: Collaborative editing framework (v13.6.26)
- `y-protocols`: Yjs communication protocols (v1.0.6)
- `lib0`: Yjs utility functions (v0.2.97)
- `fflate`: Fast ZIP compression/decompression (v0.8.2)
- `pathe`: Cross-platform path utilities (v2.0.3)
- `mime-db`: MIME type database (v1.52.0)
- `file-type`: File type detection (v19.5.0)

### Custom Implementations

- **Container Specifications**: .mdcx (documents), .dtcx (data), .ptcx (presentations)
- **Simple Yjs Integration**: Only Y.Text, Y.Array, Y.Map usage
- **Unified ZIP Handler**: Shared base implementation for all container types
- **Collaboration API**: Unified interface for all document collaboration
- **Metadata Management**: Version control and compatibility handling
- **Cross-format Integration**: Works with any format package

### Collaboration Strategies

```typescript
// Simple Yjs integration patterns used by containers
interface ContainerCollaboration {
  // Text documents (.mdcx)
  textContent: Y.Text;

  // Data documents (.dtcx)
  tableData: Y.Array<Y.Map<any>>;

  // Presentations (.ptcx)
  slideContent: Y.Text; // Text content
  slideLayout: Y.Map<any>; // Layout properties
}
```

### Key Point

**Only collaboration package** - All other packages are collaboration-free.

## @docen/providers

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

### Custom Implementations

- **Transport Layer**: Handles Yjs document transport only
- **Container Agnostic**: Works with any Yjs document from @docen/containers
- **Connection Management**: Lifecycle and recovery for Yjs providers
- **Provider Selection**: Automatic optimal provider choice

### Key Point

**Transport only** - No container-specific logic, pure Yjs transport.

## @docen/editor

### Production Dependencies

- `@docen/containers`: **THE ONLY COLLABORATION DEPENDENCY** (workspace:\*)
- `eventemitter3`: Event emitter implementation (v5.0.1)
- `hotkeys-js`: Keyboard shortcuts handling (v3.13.7)

### Custom Implementations

- **Container-aware Editor**: Editor interface based on container type
- **Format-specific UI**: Different UI components for .mdcx/.dtcx/.ptcx
- **Unified Collaboration**: All collaboration via @docen/containers only
- **Multi-format Rendering**: Documents, data tables, presentations

### Key Architecture

```typescript
// Editor only depends on containers for collaboration
interface EditorMode {
  '.mdcx': DocumentEditor;  // Text editing UI
  '.dtcx': DataEditor;      // Table editing UI
  '.ptcx': SlideEditor;     // Presentation editing UI
}

// All collaboration through containers package
editor.loadContainer(container: Container) // From @docen/containers
```

## docen (Main Package)

### Production Dependencies

- `@docen/core`: Core functionality (workspace:\*)
- `@docen/containers`: **COLLABORATION LAYER** (workspace:\*)
- `@docen/data`: Data processing (workspace:\*)
- `@docen/document`: Document processing (workspace:\*)
- `@docen/editor`: Collaborative editor (workspace:\*)
- `@docen/media`: Media processing (workspace:\*)
- `@docen/office`: Office document processing (workspace:\*)
- `@docen/providers`: Synchronization providers (workspace:\*)
- `magic-regexp`: Regular expression utilities (v0.10.0)
- `pathe`: Cross-platform path utilities (v2.0.3)
- `std-env`: Runtime detection from UnJS (v3.9.0)
- `unenv`: Universal environment polyfills (v1.10.0)
- `unplugin`: Universal plugin system (v2.3.2)

### Development Dependencies

- `size-limit`: Bundle size control (v11.2.0)
- `vitest`: Testing framework (v3.1.2)

### Unified API Design

```typescript
// Format processing: docen(format)
import { docen } from "docen";

const processor = docen("markdown"); // Uses @docen/document
const result = await processor.process(file);

// Collaboration: docen.containers(type)
const container = docen.containers("document"); // .mdcx
const dataContainer = docen.containers("data"); // .dtcx
const slideContainer = docen.containers("presentation"); // .ptcx
```

## Build and Development Tools

### Build System

- **Primary**: `unbuild` - Fast TypeScript bundler with dual CJS/ESM output
- **Configuration**: `build.config.ts` files using `defineBuildConfig`
- **Output**: `.mjs` (ESM), `.cjs` (CommonJS), `.d.ts` (types)

### Development Dependencies (Root Level Only)

All packages use shared development tools configured at the root level:

- `@biomejs/biome`: Fast linter and formatter
- `vitest`: Fast unit test framework
- `@vitest/ui`: Testing UI
- `unbuild`: Fast TypeScript bundler
- `typescript`: TypeScript compiler
- `@types/node`: Node.js type definitions
- `prettier`: Code formatter (fallback)

### Package Structure

```json
{
  "scripts": {
    "build": "unbuild",
    "dev": "unbuild --stub",
    "prepack": "pnpm build"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

## Key Architectural Benefits

### 1. Clear Separation of Concerns

- **Format Processing**: Packages focus purely on AST processing
- **Collaboration**: Only @docen/containers handles Yjs integration
- **Transport**: @docen/providers handles only Yjs document transport

### 2. Simplified Dependencies

- **Before**: Every package had collaboration dependencies and dev tools
- **After**: Only @docen/containers has Yjs dependencies, dev tools at root

### 3. Unified Collaboration Interface

- **Before**: Different collaboration strategies per format
- **After**: Simple Y.Text/Y.Array/Y.Map for all formats

### 4. Package Count Reduction

- **Before**: 11 packages with overlapping responsibilities
- **After**: 10 packages with clear, non-overlapping roles

### 5. Maintenance Benefits

- **Collaboration bugs**: Only need to fix @docen/containers
- **Format processing bugs**: Only need to fix specific format package
- **Build tools**: Centralized at root level, shared across all packages
- **Clear testing strategy**: Test format processing and collaboration separately

This architecture ensures that collaboration complexity is isolated in a single package while maintaining maximum compatibility with the unified.js ecosystem for format processing.
