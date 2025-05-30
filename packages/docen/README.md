# docen

Universal document conversion and processing library that works in any JavaScript runtime.

## Overview

The `docen` package is the main entry point for the Docen ecosystem. It provides a **unified API** for document processing and container-based collaboration, combining all format packages into a single, easy-to-use interface.

**Key Features**: Unified API, CLI tools, container-based collaboration, and universal runtime support.

## Quick Start

### Installation

```bash
npm install docen
# or
pnpm add docen
# or
yarn add docen
```

### Basic Usage

```typescript
import { docen } from "docen";

// Process documents (collaboration-free)
const processor = docen("markdown");
const result = await processor.process(
  "# Hello World\n\nThis is **bold** text.",
);

// Create collaborative containers
const container = docen.containers("document");
await container.create({
  content: result.toString(),
  metadata: { title: "My Document" },
});

// Start collaboration
const ydoc = container.getYDoc();
const ytext = ydoc.getText("content");
ytext.insert(0, "UPDATED: ");
```

## Format Processing

### Document Processing (.mdcx)

```typescript
// Markdown processing
const markdown = docen("markdown");
const mdResult = await markdown.process("# Title\n\n- Item 1\n- Item 2");

// HTML processing
const html = docen("html");
const htmlResult = await html.process("<h1>Title</h1><p>Content</p>");

// Bidirectional conversion
const toHtml = docen("markdown").use(docen.plugins.markdownToHtml);
const htmlOutput = await toHtml.process("# Markdown Title");
```

### Data Processing (.dtcx)

```typescript
// JSON processing
const json = docen("json");
const jsonResult = await json.process('{"name": "John", "age": 30}');

// CSV processing
const csv = docen("csv");
const csvResult = await csv.process("name,age\nJohn,30\nJane,25");

// YAML processing
const yaml = docen("yaml");
const yamlResult = await yaml.process("name: John\nage: 30");

// XML processing
const xml = docen("xml");
const xmlResult = await xml.process(
  "<person><name>John</name><age>30</age></person>",
);
```

### Office Document Processing

```typescript
// DOCX processing
const docx = docen("docx");
const docxResult = await docx.process(docxBuffer);

// PDF processing
const pdf = docen("pdf");
const pdfResult = await pdf.process(pdfBuffer);

// Office formats are converted to OOXML AST
console.log(docxResult.data.ast); // OOXML AST structure
```

### Media Processing

```typescript
// Image processing
const image = docen("image");
const imageResult = await image.process(imageBuffer, {
  format: "jpeg",
  quality: 80,
  resize: { width: 800 },
});

// Audio processing
const audio = docen("audio");
const audioResult = await audio.process(audioBuffer, {
  format: "mp3",
  bitrate: 128,
});

// Video processing
const video = docen("video");
const videoResult = await video.process(videoBuffer, {
  format: "mp4",
  codec: "h264",
});
```

## Container-Based Collaboration

### Document Containers (.mdcx)

```typescript
// Create document container
const docContainer = docen.containers("document");
await docContainer.create({
  content: "# Collaborative Document\n\nStart editing...",
  metadata: {
    title: "Team Document",
    authors: ["Alice", "Bob"],
  },
});

// Real-time collaboration
const ydoc = docContainer.getYDoc();
const ytext = ydoc.getText("content");

// Listen for changes
ytext.observe((event) => {
  console.log("Document changed:", event.changes);
});

// Make collaborative edits
ytext.insert(ytext.length, "\n\n## New Section");
```

### Data Containers (.dtcx)

```typescript
// Create data container
const dataContainer = docen.containers("data");
await dataContainer.create({
  data: [
    { id: 1, name: "Alice", role: "Developer" },
    { id: 2, name: "Bob", role: "Designer" },
  ],
  schema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        role: { type: "string" },
      },
    },
  },
});

// Collaborative data editing
const ydoc = dataContainer.getYDoc();
const yarray = ydoc.getArray("data");

// Add new record
yarray.push([{ id: 3, name: "Charlie", role: "Manager" }]);
```

### Presentation Containers (.ptcx)

```typescript
// Create presentation container
const presentationContainer = docen.containers("presentation");
await presentationContainer.create({
  slides: [
    {
      id: "slide-1",
      content: "# Welcome\n\nIntroduction to our project",
      layout: { type: "title", theme: "corporate" },
    },
    {
      id: "slide-2",
      content: "## Features\n\n- Real-time collaboration\n- Universal formats",
      layout: { type: "content", theme: "corporate" },
    },
  ],
  metadata: {
    title: "Project Presentation",
    theme: "corporate",
  },
});

// Collaborative slide editing
const ydoc = presentationContainer.getYDoc();
const slide1Content = ydoc.getText("slide-1-content");
const slide1Layout = ydoc.getMap("slide-1-layout");

// Update slide content
slide1Content.insert(slide1Content.length, "\n\n*Live collaboration enabled*");
slide1Layout.set("backgroundColor", "#f8f9fa");
```

## Collaboration & Sync

### Providers

```typescript
import { docen } from "docen";

// WebSocket provider
const wsProvider = docen.providers.websocket({
  url: "ws://localhost:3000",
  room: "document-123",
});

// WebRTC provider
const webrtcProvider = docen.providers.webrtc({
  room: "document-123",
  signaling: ["ws://localhost:4444"],
});

// IndexedDB provider (local persistence)
const idbProvider = docen.providers.indexeddb({
  name: "docen-documents",
});

// Connect container to providers
await container.connect([wsProvider, webrtcProvider, idbProvider]);
```

### Editor Integration

```typescript
import { docen } from "docen";

// Load container
const container = await docen.containers.load(containerBuffer);

// Create editor
const editor = docen.editor.create({
  container,
  target: document.getElementById("editor"),
  mode: "collaborative",
});

// Start editing
await editor.connect();

// Editor automatically adapts to container type:
// - .mdcx → Document editor (rich text)
// - .dtcx → Data editor (tables/forms)
// - .ptcx → Presentation editor (slides)
```

## CLI Usage

### Installation

```bash
npm install -g docen
```

### Document Conversion

```bash
# Convert between formats
docen convert input.md output.html
docen convert data.csv data.json
docen convert document.docx document.md

# Process with plugins
docen process input.md --plugin markdown-to-html --output output.html

# Create containers
docen container create document input.md output.mdcx
docen container create data input.csv output.dtcx
```

### Container Operations

```bash
# Extract from container
docen container extract document.mdcx extracted/

# Merge containers
docen container merge doc1.mdcx doc2.mdcx merged.mdcx

# Container info
docen container info document.mdcx
```

### Collaboration Server

```bash
# Start collaboration server
docen serve --port 3000 --room-capacity 10

# Serve specific container
docen serve document.mdcx --port 3000
```

## Architecture

Docen uses a **three-layer architecture**:

### Layer 1: Format Processing (Pure unified.js)

- **@docen/core**: Core unified.js processor interface
- **@docen/document**: Text document processing (Markdown, HTML)
- **@docen/data**: Structured data processing (JSON, YAML, CSV, XML)
- **@docen/media**: Media processing (images, audio, video)
- **@docen/office**: Office document processing (DOCX, PDF)

### Layer 2: Container Collaboration (Yjs-based)

- **@docen/containers**: 🔥 THE ONLY PACKAGE WITH YJS CODE 🔥
  - .mdcx containers for documents
  - .dtcx containers for data
  - .ptcx containers for presentations

### Layer 3: Transport & Editing

- **@docen/providers**: Synchronization providers (WebSocket, WebRTC, IndexedDB)
- **@docen/editor**: Container-aware collaborative editor

## Dependencies

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

## Supported Formats

### Documents

- **Markdown**: `.md`, `.mdx`
- **HTML**: `.html`, `.htm`
- **Office**: `.docx`, `.pdf`
- **Containers**: `.mdcx` (collaborative documents)

### Data

- **JSON**: `.json`, `.json5`
- **YAML**: `.yaml`, `.yml`
- **CSV**: `.csv`, `.tsv`
- **XML**: `.xml`
- **Containers**: `.dtcx` (collaborative data)

### Presentations

- **Containers**: `.ptcx` (collaborative presentations)

### Media

- **Images**: `.jpg`, `.png`, `.gif`, `.svg`, `.webp`
- **Audio**: `.mp3`, `.wav`, `.ogg`, `.m4a`
- **Video**: `.mp4`, `.avi`, `.mov`, `.webm`

## Runtime Support

Docen works in all JavaScript runtimes:

- **Node.js**: Full feature support
- **Browsers**: Client-side processing and collaboration
- **Deno**: Cross-platform compatibility
- **Bun**: High-performance processing
- **Workers**: Background processing support
- **React Native**: Mobile app integration

## Design Principles

### 1. Universal Compatibility

- **Runtime Agnostic**: Works everywhere JavaScript runs
- **Format Flexibility**: Support for all major document formats
- **Plugin Ecosystem**: Compatible with unified.js plugins

### 2. Collaboration First

- **Container-Based**: Collaborative editing at the container level
- **Real-time**: Instant synchronization across all clients
- **Conflict-Free**: CRDT-based conflict resolution

### 3. Developer Experience

- **Unified API**: Single interface for all operations
- **Type Safety**: Full TypeScript support
- **Zero Config**: Works out of the box

### 4. Performance

- **Streaming**: Efficient processing of large documents
- **Memory Efficient**: Optimized for resource constraints
- **Fast Sync**: Minimal bandwidth for collaboration

## Examples

Check out our examples in the [`playground`](../../playground) directory:

- **Basic Processing**: Document conversion examples
- **Collaboration**: Real-time editing examples
- **CLI Usage**: Command-line tool examples
- **Plugin Development**: Custom plugin examples

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
