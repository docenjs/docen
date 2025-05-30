# Docen Supported File Formats

This document outlines the file formats supported by each Docen package based on the container-level collaboration architecture.

## Architecture Overview

Docen follows a three-layer architecture:

**Layer 1: Format Processing (Pure AST)**

- Format packages handle pure parsing/transformation
- Compatible with standard unified.js ecosystem

**Layer 2: Container Formats (Collaboration Integration)**

- @docen/containers: The only package with Yjs code
- Handles .mdcx/.dtcx/.ptcx collaborative containers

**Layer 3: Editor (Container-Based)**

- @docen/editor: Container-aware collaborative editing

## @docen/core

### Core Functionality

| Feature             | Support | Description                      |
| ------------------- | ------- | -------------------------------- |
| Processor Interface | ✅      | Extends unified.js processor     |
| Type Definitions    | ✅      | Base types for all packages      |
| Factory Functions   | ✅      | Format detection and creation    |
| Cross-platform      | ✅      | Works in all JavaScript runtimes |

### Dependencies

- `unified`: Core unified.js processing pipeline
- `vfile`: Virtual file handling
- `unist`: Universal Syntax Tree utilities

## @docen/document - Pure Text Document Processing

**Architecture**: Uses bottom-level unified.js utilities (`mdast-util-*`, `hast-util-*`) for maximum compatibility and performance, avoiding higher-level remark/rehype abstractions.

### Supported Formats

| Format   | Extension      | Read | Write | AST Type | Description                         |
| -------- | -------------- | ---- | ----- | -------- | ----------------------------------- |
| Markdown | .md, .markdown | ✅   | ✅    | mdast    | Standard Markdown with optional GFM |
| HTML     | .html, .htm    | ✅   | ✅    | hast     | HTML documents with DOM structure   |

### Processing Modes

| Input Format | Output Formats      | Use Case                      |
| ------------ | ------------------- | ----------------------------- |
| Markdown     | markdown, html, ast | Parse, convert, or export AST |
| HTML         | html, markdown, ast | Parse, convert, or export AST |

### Processor Functions

| Function                    | Input    | Output                    | Description                     |
| --------------------------- | -------- | ------------------------- | ------------------------------- |
| `createMarkdownProcessor()` | Markdown | markdown/html/ast         | Configurable markdown processor |
| `createHtmlProcessor()`     | HTML     | html/markdown/ast         | Configurable HTML processor     |
| `createDocumentProcessor()` | Any      | Based on format parameter | Auto-detect format and process  |

### Output Formats

| Format       | Description            | Example Usage                         |
| ------------ | ---------------------- | ------------------------------------- |
| `"markdown"` | Standard markdown text | `createMarkdownProcessor("markdown")` |
| `"html"`     | HTML markup            | `createMarkdownProcessor("html")`     |
| `"ast"`      | JSON-serialized AST    | `createMarkdownProcessor("ast")`      |

### Features

- **Flexible Output**: Single input format can produce multiple outputs
- **AST Export**: Access to structured abstract syntax tree
- **Bottom-Level Processing**: Direct use of `mdast-util-*` and `hast-util-*` for maximum performance
- **GFM Support**: Optional GitHub Flavored Markdown support via micromark extensions
- **Bidirectional Conversion**: Seamless conversion between markdown and HTML
- **Pure AST Processing**: No collaboration code, standard unified.js compatible
- **Plugin Compatible**: Works with unified.js ecosystem plugins

### Usage Examples

```typescript
// Markdown to HTML conversion
const mdToHtml = createMarkdownProcessor("html", { gfm: true });
const html = await mdToHtml.process("# Hello World");

// HTML to markdown conversion
const htmlToMd = createHtmlProcessor("markdown", { gfm: true });
const markdown = await htmlToMd.process("<h1>Hello World</h1>");

// Export AST for analysis
const mdToAst = createMarkdownProcessor("ast");
const ast = JSON.parse(await mdToAst.process("# Hello World"));

// Using the auto-detect processor
const processor = createDocumentProcessor("markdown");
const result = await processor.process("# Hello World");
```

### Dependencies

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

## @docen/data

The data package handles structured data formats with pure processing.

### Supported Formats

| Format | Extension   | Read | Write | AST Type | Description                 |
| ------ | ----------- | ---- | ----- | -------- | --------------------------- |
| JSON   | .json       | ✅   | ✅    | dataast  | JavaScript Object Notation  |
| JSON5  | .json5      | ✅   | ✅    | dataast  | Extended JSON with comments |
| YAML   | .yml, .yaml | ✅   | ✅    | dataast  | Human-readable data format  |
| XML    | .xml        | ✅   | ✅    | xast     | Extensible Markup Language  |
| CSV    | .csv        | ✅   | ✅    | dataast  | Comma-separated values      |
| TSV    | .tsv        | ✅   | ✅    | dataast  | Tab-separated values        |

### Features

- **Pure Data Processing**: No collaboration features
- **Format Conversion**: Bidirectional conversion between formats
- **Schema Validation**: Data structure validation
- **Unified.js Compatibility**: Standard processors

### Dependencies

- `xast`: XML AST utilities
- `papaparse`: CSV parser
- `yaml`: YAML parser
- `json5`: JSON5 parser

## @docen/media

The media package provides independent processing toolkit.

### Supported Formats

| Format | Extension   | Read | Write | Processing   | Description       |
| ------ | ----------- | ---- | ----- | ------------ | ----------------- |
| JPEG   | .jpg, .jpeg | ✅   | ✅    | Optimization | JPEG images       |
| PNG    | .png        | ✅   | ✅    | Optimization | PNG images        |
| WebP   | .webp       | ✅   | ✅    | Optimization | Modern web format |
| AVIF   | .avif       | ✅   | ✅    | Optimization | AV1 image format  |
| GIF    | .gif        | ✅   | ✅    | Optimization | Animated images   |
| SVG    | .svg        | ✅   | ✅    | Optimization | Vector graphics   |
| MP4    | .mp4        | ✅   | ❌    | Thumbnails   | Video files       |
| MP3    | .mp3        | ✅   | ❌    | Metadata     | Audio files       |

### Features

- **Independent Processing**: No collaboration features
- **Browser Compatible**: Works with jimp-compact, sharp-wasm
- **Optimization Pipeline**: Multi-format output generation
- **Metadata Extraction**: EXIF, XMP, IPTC support

### Dependencies

- `jimp-compact`: Browser image processing
- `sharp-wasm`: High-performance processing (when available)
- `ffmpeg-wasm`: Video processing
- `image-meta`: Metadata extraction

## @docen/office

The office package handles format detection and routing.

### Supported Formats

| Format                    | Extension | Read | Write | Route To         | Description              |
| ------------------------- | --------- | ---- | ----- | ---------------- | ------------------------ |
| PDF                       | .pdf      | ✅   | ✅    | Local processing | Portable Document Format |
| Word Document             | .docx     | ✅   | ✅    | @docen/document  | Microsoft Word documents |
| Excel Spreadsheet         | .xlsx     | ✅   | ✅    | @docen/data      | Excel spreadsheets       |
| PowerPoint                | .pptx     | ✅   | ✅    | Local processing | PowerPoint presentations |
| Rich Text                 | .rtf      | ✅   | ✅    | @docen/document  | Cross-platform documents |
| OpenDocument Text         | .odt      | ✅   | ✅    | @docen/document  | OpenDocument text        |
| OpenDocument Spreadsheet  | .ods      | ✅   | ✅    | @docen/data      | OpenDocument data        |
| OpenDocument Presentation | .odp      | ✅   | ✅    | Local processing | OpenDocument slides      |

### Features

- **Format Detection**: Automatic format identification
- **Conversion Hub**: Routes to appropriate packages
- **Legacy Support**: Read-only for DOC/XLS/PPT formats

### Dependencies

- `unpdf`: PDF processing utilities
- `docx`: Modern DOCX generation
- `xml2js`: OOXML parsing
- `jszip`: Office document manipulation

## @docen/containers

**The only package with Yjs collaboration code.**

### Container Formats

| Format                 | Extension | Content Type        | Collaboration  | Description                 |
| ---------------------- | --------- | ------------------- | -------------- | --------------------------- |
| Document Container     | .mdcx     | Text documents      | Y.Text         | Collaborative markdown/HTML |
| Data Container         | .dtcx     | Structured data     | Y.Array/Y.Map  | Collaborative data editing  |
| Presentation Container | .ptcx     | Slide presentations | Y.Text + Y.Map | Collaborative slides        |

### Container Structure

All containers are ZIP-based with embedded collaboration metadata:

```
document.mdcx (ZIP archive)
├── content.md           # Main content
├── media/              # Embedded media
├── .collab/            # Collaboration metadata
│   ├── yjs-state.bin   # Yjs document state
│   └── metadata.json   # Container metadata
└── manifest.json       # File manifest
```

### Collaboration Features

- **Simple Yjs Integration**: Y.Text, Y.Array, Y.Map only
- **Unified Interface**: Same API for all container types
- **Cross-format Support**: Works with any format package
- **Offline Support**: Full offline capabilities

### Dependencies

- `yjs`: Collaborative editing framework
- `y-protocols`: Yjs communication protocols
- `fflate`: ZIP compression
- `pathe`: Path utilities

## @docen/editor

Container-aware collaborative editor.

### Editor Modes by Container

| Container | UI Mode         | Collaboration  | Features                |
| --------- | --------------- | -------------- | ----------------------- |
| .mdcx     | Document Editor | Y.Text         | Rich text, live preview |
| .dtcx     | Data Editor     | Y.Array/Y.Map  | Tables, formulas        |
| .ptcx     | Slide Editor    | Y.Text + Y.Map | Slides, layout          |

### Features

- **Format Detection**: Automatic UI based on container type
- **Unified Collaboration**: All collaboration via @docen/containers
- **Multi-format Rendering**: Different UIs for different content types

### Dependencies

- `@docen/containers`: Collaboration layer
- `eventemitter3`: Event handling
- `hotkeys-js`: Keyboard shortcuts

## @docen/providers

Transport layer for Yjs collaboration.

### Supported Providers

| Provider  | Description       | Use Case                 |
| --------- | ----------------- | ------------------------ |
| WebSocket | Server-based sync | Multi-user collaboration |
| WebRTC    | Peer-to-peer sync | Direct user connections  |
| IndexedDB | Local persistence | Offline capabilities     |

### Features

- **Container Agnostic**: Works with any Yjs document
- **Connection Management**: Automatic recovery and lifecycle
- **Offline Support**: Local persistence and sync

### Dependencies

- `y-websocket`: WebSocket provider
- `y-webrtc`: WebRTC provider
- `y-indexeddb`: IndexedDB provider

## docen (Main Package)

Unified entry point and integration.

### API Design

```typescript
// Format processing: docen(format)
import { docen } from "docen";

const processor = docen("markdown");
const result = await processor.process(file);

// Collaboration: docen.containers(type)
const container = docen.containers("document"); // .mdcx
const dataContainer = docen.containers("data"); // .dtcx
const slideContainer = docen.containers("presentation"); // .ptcx
```

### Integration Features

- **Automatic Configuration**: Format detection and processor setup
- **Plugin Discovery**: Compatible with unified.js plugins
- **Cross-platform**: Works in all JavaScript environments

## Format Processing vs Collaboration

### Format Processing (Packages: core, document, data, media, office)

- **Purpose**: Pure AST parsing and transformation
- **Collaboration**: None - standard unified.js processing
- **Compatibility**: Full unified.js ecosystem compatibility
- **Dependencies**: Minimal, focused on format handling

### Collaboration (Package: containers only)

- **Purpose**: Container-level collaboration via Yjs
- **Integration**: Simple Y.Text, Y.Array, Y.Map usage
- **Containers**: .mdcx (documents), .dtcx (data), .ptcx (presentations)
- **Benefits**: Unified collaboration interface, format independence

### Editor Integration (Package: editor)

- **Purpose**: Container-aware collaborative editing
- **UI**: Format-specific interfaces based on container type
- **Collaboration**: Unified via @docen/containers package
- **Experience**: Seamless switching between content types

## Performance Characteristics

### Format Processing

- **Parsing**: Optimized per format type
- **Memory**: Minimal overhead, standard unified.js performance
- **Scalability**: Handles large documents efficiently

### Container Collaboration

- **Text Containers (.mdcx)**: Character-level collaboration, ~50ms latency
- **Data Containers (.dtcx)**: Structural collaboration, efficient for tables
- **Presentation Containers (.ptcx)**: Hybrid text + layout collaboration

### Cross-format Benefits

- **Unified API**: Same collaboration interface for all formats
- **Simplified Codebase**: Single collaboration implementation
- **Better Maintenance**: Fewer packages, clearer responsibilities

This architecture provides optimal performance for different content types while maintaining a simple, unified collaboration interface across all formats.
