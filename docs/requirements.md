# Docen Project Requirements

## Project Overview

Docen is a universal document conversion and processing library that supports parsing, transformation, and serialization of multiple file formats with built-in collaborative editing. It integrates the unified.js ecosystem for content transformation with multiple collaboration strategies optimized for different data types, designed to run in any JavaScript runtime environment, including browsers, Node.js, Deno, Cloudflare Workers, and Edge Functions.

## Architecture Design

### Core Philosophy: Container-Level Collaboration with Format-Focused Processing

Docen follows a layered architecture where format processing and collaboration are clearly separated:

```
| ................... unified.js processing ................... |
| ... parse ... | ... transform ... | ... stringify ... |

          +--------+                 +----------+
Input ->- | Parser | -> AST -> | -> | Compiler | -> Standard Format
          +--------+     |          +----------+     (markdown, json, etc.)
                         |
                   +--------------+
                   | Transformers |
                   +--------------+

| ................... container collaboration ................... |
| ... wrap ... | ... collaborate ... | ... sync ... |

Standard Format -> Container -> Yjs Integration -> Collaborative Container
(.md, .json)       (.mdcx)     (Y.Text, Y.Array)   (real-time sync)
```

**Architecture Layers:**

- **Layer 1**: Format Processing - Pure AST parsing and transformation (unified.js standard)
- **Layer 2**: Container Formats - Collaboration integration at container level
- **Layer 3**: Editor - Multi-format collaborative editing based on containers

### Refined Modular Structure

The project follows a three-layer architecture with clear separation of concerns:

1. **Core Module (@docen/core)**
   - Provides basic processor interface that extends unified.js
   - Defines fundamental types and interfaces
   - Implements factory functions for processor creation
   - **No collaboration code** - pure unified.js compatibility
   - Uses unist/unified types with minimal extensions

2. **Document Processing (@docen/document)**
   - **Pure format processing**: Markdown and HTML text document parsing
   - Uses remark and rehype processors following unified.js patterns
   - Provides adapters for syntax trees (mdast, hast)
   - **No collaboration features** - focuses on AST transformation
   - Maintains compatibility with existing unified.js plugins
   - Handles linear text documents only (markdown, html, plain text)

3. **Data Processing (@docen/data)**
   - **Pure data format processing**: JSON, YAML, CSV, TSV, XML parsing
   - Integrates with xast for XML processing following unified.js patterns
   - Provides format conversion between supported data formats
   - **No collaboration features** - focuses on data AST transformation
   - Implements unified-based transformation pipelines
   - Consistent AST representation for all data formats

4. **Media Processing (@docen/media)**
   - **Independent media processing toolkit** (no collaboration)
   - Uses browser-compatible libraries (jimp-compact, sharp-wasm, ffmpeg-wasm)
   - Implements specialized media node types for unified.js pipeline integration
   - Provides media optimization and format conversion
   - Handles metadata extraction and manipulation

5. **Office Document Processing (@docen/office)**
   - **Format detection and conversion hub**
   - Handles PDF documents using unpdf from UnJS
   - Processes legacy Office formats (DOC, XLS, PPT) - read-only
   - **Format Routing**: Converts and routes to appropriate format packages
     - DOCX → @docen/document (convert to markdown/html)
     - XLSX → @docen/data (convert to JSON/CSV)
     - PPTX → local processing or container format (.ptcx)
   - **No collaboration code** - pure format conversion

6. **Container Formats (@docen/containers)**
   - **Collaboration integration layer** - the only package with Yjs code
   - **Container specifications**: `.mdcx` (documents), `.dtcx` (data), `.ptcx` (presentations)
   - ZIP-based containers with embedded collaboration metadata
   - **Simple Yjs integration**:
     - Text documents: Y.Text for content collaboration
     - Data documents: Y.Array/Y.Map for structural collaboration
     - Presentations: Y.Text (content) + Y.Map (layout) hybrid
   - Shared base implementation for all container types
   - Integrates with format packages for content processing

7. **Custom Editor (@docen/editor)**
   - **Container-aware collaborative editor**
   - Builds on container formats (.mdcx, .dtcx, .ptcx) for collaboration
   - **Format-specific UI**: Different interfaces for documents, data, presentations
   - Implements DOM rendering without external editor dependencies
   - **Unified collaboration interface**: All collaboration via containers package
   - Handles input processing and user interactions per format type

8. **Providers (@docen/providers)**
   - **Transport layer** for Yjs collaboration
   - Implements transport providers (WebSocket, WebRTC, IndexedDB)
   - **Container-agnostic**: Works with any Yjs document from containers
   - Handles connection lifecycle and recovery
   - Provides offline capabilities

9. **Main Package (docen)**
   - **Unified entry point**: `docen(format)` for processing, `docen.containers(type)` for collaboration
   - Integrates all modules with consistent APIs
   - Implements automatic processor configuration based on format
   - Supports unified.js plugin discovery
   - Handles cross-platform compatibility

### Code Organization

Each package follows standard unified.js project structure:

```
packages/[package-name]/
├── src/
│   ├── ast/             # AST type definitions extending unist
│   │   ├── nodes.ts     # Node type definitions aligned with unified.js
│   │   ├── schema.ts    # AST schema validation
│   │   └── index.ts     # Type exports
│   ├── processor/       # unified-compatible processors
│   │   ├── [format].ts  # Format-specific processor
│   │   └── index.ts
│   ├── plugins/         # unified-compatible plugins
│   │   ├── [plugin].ts  # Collaboration implemented as plugins
│   │   └── index.ts
│   ├── yjs/             # Yjs integration adapters
│   │   ├── binding.ts   # AST-Yjs binding strategies
│   │   ├── sync.ts      # Synchronization utilities
│   │   └── index.ts
│   ├── utils/           # Utilities leveraging unist-util-*
│   └── index.ts         # Main entry point
├── test/                # Tests
├── README.md            # Documentation
└── package.json         # Package metadata
```

## Custom Editor Architecture (@docen/editor)

### Core Design Principles

The editor is built to handle multiple collaboration strategies depending on the document type:

```typescript
// Core editor architecture with format-aware collaboration
interface DocenEditor {
  // Core lifecycle
  mount(container: HTMLElement): void;
  unmount(): void;
  destroy(): void;

  // Document management with format detection
  loadDocument(doc: Y.Doc | Database, format?: DocumentFormat): Promise<void>;
  saveDocument(): Promise<Uint8Array | ArrayBuffer>;

  // Format-aware editing operations
  insertText(text: string, position?: Position): void;
  deleteRange(range: Range): void;
  formatText(range: Range, formatting: TextFormatting): void;

  // Data-specific operations (for spreadsheet-like editing)
  setCellValue?(cell: CellReference, value: any): void;
  executeFormula?(formula: string, context: FormulaContext): any;

  // Collaborative features (format-dependent)
  setUser(user: UserInfo): void;
  getCursors(): CursorInfo[];
  setProvider(provider: YjsProvider | ElectricProvider): void;

  // Event system
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data: any): void;
}

// Enhanced editor configuration
interface EditorConfig {
  // Document type support with collaboration strategy
  format: "markdown" | "mdoc" | "html" | "xlsx" | "csv" | "pptx" | "plaintext";

  // Collaboration strategy (auto-detected from format)
  collaborationStrategy?: "yjs" | "electric" | "hybrid" | "none";

  // Format-specific settings
  collaborative: boolean;
  ydoc?: Y.Doc; // For text-based formats
  database?: Database; // For data-based formats
  awareness?: Awareness;

  // UI configuration
  toolbar?: boolean | ToolbarConfig;
  statusbar?: boolean | StatusbarConfig;
  theme?: string | ThemeConfig;

  // Plugin system
  plugins?: EditorPlugin[];

  // Performance settings
  virtualScrolling?: boolean;
  lazyLoading?: boolean;
  debounceMs?: number;

  // Data-specific settings
  formulaEngine?: boolean;
  maxRows?: number;
  maxColumns?: number;
}
```

### Format-Specific Collaboration Strategies

```typescript
// Text document collaboration (Markdown, HTML, etc.)
interface TextCollaborationStrategy {
  type: "yjs";
  backend: Y.Doc;
  awareness: Awareness;
  textBinding: Y.Text;
  conflictResolution: "operational-transform";
}

// Data collaboration (CSV, XLSX, etc.)
interface DataCollaborationStrategy {
  type: "electric";
  backend: Database; // PGlite instance
  syncProvider: ElectricProvider;
  formulaEngine: ExcelFormulaEngine;
  conflictResolution: "database-constraints";
}

// Presentation collaboration (PPTX, etc.)
interface PresentationCollaborationStrategy {
  type: "hybrid";
  contentBackend: Y.Doc; // For text blocks
  layoutBackend: OperationalTransform; // For positioning
  awareness: Awareness;
  conflictResolution: "hybrid";
}

// Media processing (no real-time collaboration)
interface MediaProcessingStrategy {
  type: "none";
  processor: MediaProcessor;
  operations: MediaOperation[];
  conflictResolution: "last-write-wins";
}
```

## MDOC Format Specification (@docen/mdoc)

### Enhanced Container Structure

The MDOC format uses a ZIP-based container optimized for collaborative editing and media integration:

```
document.mdoc (ZIP archive)
├── content.md           # Main Markdown content with frontmatter
├── media/               # Embedded media directory (processed by @docen/media)
│   ├── images/          # Optimized image files
│   │   ├── cover.jpg    # Auto-optimized by media processor
│   │   ├── cover.webp   # Multiple formats for compatibility
│   │   └── diagram.svg
│   ├── videos/          # Video files with thumbnails
│   │   ├── demo.mp4
│   │   └── demo.thumb.jpg # Auto-generated thumbnail
│   └── attachments/     # Other attachments
│       ├── data.csv     # Can link to @docen/data for collaborative editing
│       └── presentation.pptx
├── styles.css           # Optional custom styles
└── .mdoc/               # MDOC metadata directory
    ├── collaboration.json # Collaboration settings
    └── media-manifest.json # Media file metadata and optimization info
```

### Enhanced Frontmatter Schema

```yaml
---
# Document metadata
title: "Document Title"
author:
  - "Primary Author"
  - "Secondary Author"
created: "2024-01-15T10:30:00Z"
modified: "2024-01-15T15:45:00Z"
version: "1.2.0"
language: "en"

# Content metadata
description: "Brief document description"
keywords: ["keyword1", "keyword2"]
tags: ["tag1", "tag2"]
category: "documentation"

# MDOC specific
mdoc:
  version: "1.0"
  generator: "docen@1.0.0"
  compression: "deflate"
  collaboration:
    strategy: "yjs" # Text content collaboration
    mediaStrategy: "processing" # Media processing only
    attachmentStrategy: "auto" # Auto-detect based on format

# Custom fields
custom:
  project: "Project Name"
  status: "draft"
  reviewers: ["reviewer1", "reviewer2"]
---
# Document Content

Your Markdown content here...

<!-- Data attachments can be collaborative -->
[Edit Spreadsheet](attachments/data.csv){.collaborative}

<!-- Media is processed but not collaborative -->
![Optimized Image](media/images/cover.jpg)
```

## Data Layer Architecture (@docen/data)

### PGlite + Electric SQL Integration

The data package now uses a completely different approach optimized for data collaboration:

```typescript
// Data collaboration using PGlite and Electric SQL
interface DataCollaborationAdapter {
  // Database backend
  database: PGlite; // WASM PostgreSQL
  electric: ElectricClient; // Sync provider

  // Excel compatibility layer
  formulaEngine: ExcelFormulaEngine;
  functionLibrary: ExcelFunctionLibrary;

  // Unified.js integration
  processor: UnifiedProcessor;

  // Data operations
  query(sql: string): Promise<QueryResult>;
  executeFormula(formula: string, context: CellContext): any;
  syncChanges(): Promise<void>;

  // Collaboration
  onDataChange(callback: (changes: DataChange[]) => void): () => void;
  resolveConflict(conflict: DataConflict): DataResolution;
}

// Excel formula compatibility
interface ExcelFormulaEngine {
  // Translate Excel formulas to SQL
  translateFormula(excelFormula: string): string;

  // Execute Excel-style functions
  executeFunction(name: string, args: any[]): any;

  // Supported function categories
  math: MathFunctions;
  text: TextFunctions;
  date: DateFunctions;
  lookup: LookupFunctions;
  logical: LogicalFunctions;
}

// Example: SUM(A1:A10) -> SELECT SUM(column_a) FROM sheet WHERE row_num BETWEEN 1 AND 10
interface FormulaTranslation {
  excel: string;
  sql: string;
  context: CellRange;
}
```

### Data Processing Pipeline

```typescript
// Data processing with database backend
const dataProcessor = unified()
  .use(csvParse)
  .use(dataCollaboration, {
    backend: "pglite",
    electric: electricConfig,
    formulaSupport: true,
  })
  .use(excelCompatibility)
  .use(csvStringify);

// Process data with collaboration
const result = await dataProcessor.process(csvFile);
```

## Media Processing Strategy (@docen/media)

### Independent Processing Toolkit

The media package is repositioned as a pure processing toolkit without real-time collaboration:

```typescript
// Media processing
interface MediaProcessor {
  // Core processing capabilities
  processImage(input: ImageInput): Promise<ProcessedImage>;
  processVideo(input: VideoInput): Promise<ProcessedVideo>;
  processAudio(input: AudioInput): Promise<ProcessedAudio>;

  // Optimization
  optimize(media: MediaFile, options: OptimizationOptions): Promise<MediaFile>;
  generateThumbnail(media: MediaFile): Promise<ThumbnailFile>;

  // Format conversion
  convert(media: MediaFile, targetFormat: string): Promise<MediaFile>;

  // Metadata
  extractMetadata(media: MediaFile): Promise<MediaMetadata>;

  // Integration with unified.js (for pipeline compatibility)
  createUnifiedPlugin(): UnifiedPlugin;
}

// Usage in MDOC documents
const mdocProcessor = unified()
  .use(remarkParse)
  .use(mdocMediaProcessor, {
    autoOptimize: true,
    generateThumbnails: true,
    outputFormats: ["webp", "avif", "jpg"],
  })
  .use(mdocStringify);
```
