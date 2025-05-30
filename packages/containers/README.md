# @docen/containers

**🔥 THE ONLY PACKAGE WITH YJS COLLABORATION CODE 🔥**

Container formats with Yjs collaboration - .mdcx, .dtcx, and .ptcx files.

## Overview

The `@docen/containers` package is the **only package in the Docen ecosystem** that contains Yjs collaboration code. It implements container formats (.mdcx, .dtcx, .ptcx) that combine format processing with real-time collaboration.

**Key Principle**: All other packages in the Docen ecosystem are collaboration-free and focus purely on format processing. Only this package handles collaborative editing through Yjs.

## Container Formats

### 📄 .mdcx - Document Containers

- **Purpose**: Text documents with collaborative editing
- **Content**: Markdown, HTML, and text-based documents
- **Collaboration**: Y.Text for collaborative text editing
- **Structure**: ZIP-based container with content and metadata

### 📊 .dtcx - Data Containers

- **Purpose**: Structured data with collaborative editing
- **Content**: JSON, YAML, CSV, XML data
- **Collaboration**: Y.Array<Y.Map> for collaborative data structures
- **Structure**: ZIP-based container with data and schema

### 🎯 .ptcx - Presentation Containers

- **Purpose**: Presentations with collaborative editing
- **Content**: Slide-based presentations and layouts
- **Collaboration**: Y.Text for content + Y.Map for layout properties
- **Structure**: ZIP-based container with slides and resources

## Features

### 🤝 Simple Yjs Integration

- **Y.Text**: For text content collaboration
- **Y.Array**: For list-based data collaboration
- **Y.Map**: For object-based data collaboration
- **Minimal Complexity**: Uses only basic Yjs types

### 📦 ZIP-based Containers

- **Cross-platform**: Works in Node.js, browsers, and workers
- **Efficient**: Fast compression with fflate
- **Extensible**: Metadata and versioning support
- **Portable**: Standard ZIP format for compatibility

### 🔄 Format Integration

- **Universal**: Works with any format package output
- **Seamless**: Transparent integration with @docen/document, @docen/data, etc.
- **Flexible**: Container metadata supports any content type

## Usage

### Creating Document Containers

```typescript
import { createDocumentContainer } from "@docen/containers";

// Create a new .mdcx document container
const container = await createDocumentContainer({
  content: "# Hello World\n\nThis is a collaborative document.",
  metadata: {
    title: "My Document",
    author: "John Doe",
    created: new Date(),
  },
});

// Access Yjs document for collaboration
const ydoc = container.getYDoc();
const ytext = ydoc.getText("content");

// Listen for changes
ytext.observe(() => {
  console.log("Document content changed");
});

// Make collaborative edits
ytext.insert(0, "UPDATED: ");
```

### Creating Data Containers

```typescript
import { createDataContainer } from "@docen/containers";

// Create a new .dtcx data container
const dataContainer = await createDataContainer({
  data: [
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 25 },
  ],
  schema: {
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "number" },
        name: { type: "string" },
        age: { type: "number" },
      },
    },
  },
});

// Access Yjs data for collaboration
const ydoc = dataContainer.getYDoc();
const yarray = ydoc.getArray("data");

// Collaborative data operations
yarray.push([{ id: 3, name: "Charlie", age: 35 }]);
```

### Creating Presentation Containers

```typescript
import { createPresentationContainer } from "@docen/containers";

// Create a new .ptcx presentation container
const presentationContainer = await createPresentationContainer({
  slides: [
    {
      id: "slide-1",
      content: "# Welcome\n\nIntroduction slide",
      layout: { type: "title", theme: "default" },
    },
  ],
  metadata: {
    title: "My Presentation",
    theme: "corporate",
  },
});

// Access Yjs for collaborative editing
const ydoc = presentationContainer.getYDoc();
const slideContent = ydoc.getText("slide-1-content");
const slideLayout = ydoc.getMap("slide-1-layout");

// Collaborative slide editing
slideContent.insert(
  slideContent.length,
  "\n\n- Bullet point 1\n- Bullet point 2",
);
slideLayout.set("backgroundColor", "#f0f0f0");
```

### Loading Existing Containers

```typescript
import { loadContainer } from "@docen/containers";

// Load any container type
const container = await loadContainer(containerBuffer);

// Detect container type
console.log(container.type); // 'document' | 'data' | 'presentation'

// Access content based on type
if (container.type === "document") {
  const content = container.getContent();
  const ydoc = container.getYDoc();
}
```

## Dependencies

### Production Dependencies

- `yjs`: Collaborative editing framework (v13.6.26)
- `y-protocols`: Yjs communication protocols (v1.0.6)
- `lib0`: Yjs utility functions (v0.2.97)
- `fflate`: Fast ZIP compression/decompression (v0.8.2)
- `pathe`: Cross-platform path utilities (v2.0.3)
- `mime-db`: MIME type database (v1.52.0)
- `file-type`: File type detection (v19.5.0)

**Note**: This is the ONLY package in the Docen ecosystem with Yjs dependencies.

## Architecture

### Container Structure

```
container.mdcx (ZIP file)
├── content.md          # Main content
├── metadata.json       # Container metadata
├── yjs-state.bin       # Yjs document state
└── resources/          # Embedded resources
    ├── images/
    └── attachments/
```

### Yjs Integration

```typescript
// Simple Yjs integration patterns
interface CollaborationStrategy {
  // Document containers (.mdcx)
  content: Y.Text;

  // Data containers (.dtcx)
  data: Y.Array<Y.Map<any>>;

  // Presentation containers (.ptcx)
  slides: Y.Array<Y.Map<any>>;
  layout: Y.Map<any>;
}
```

### Cross-Package Integration

```typescript
// Format packages provide content, containers add collaboration
import { docen } from "docen";

// 1. Process content with format packages (collaboration-free)
const processor = docen("markdown");
const result = await processor.process(markdownContent);

// 2. Create collaborative container (only here)
const container = await createDocumentContainer({
  content: result.toString(),
  metadata: result.data,
});

// 3. Collaboration happens only in this package
const ydoc = container.getYDoc();
```

## Design Principles

### 1. Isolation of Collaboration

- **Single Responsibility**: Only this package handles collaboration
- **Clear Boundaries**: Format processing vs collaboration are separate
- **Simple Integration**: Easy to add collaboration to any format

### 2. Minimal Yjs Usage

- **Basic Types Only**: Y.Text, Y.Array, Y.Map
- **No Complex Patterns**: Avoid deep nesting or complex structures
- **Performance First**: Efficient collaboration patterns

### 3. Universal Compatibility

- **Format Agnostic**: Works with any format package output
- **Cross-platform**: Node.js, browsers, and workers
- **Standard Formats**: ZIP-based for maximum compatibility

### 4. Zero Dependencies for Other Packages

- **Collaboration Optional**: Other packages work without containers
- **Clean Architecture**: Format processing remains pure
- **Performance**: No collaboration overhead when not needed

## Integration

This package serves as the collaboration layer for the entire Docen ecosystem:

- **@docen/document**: Document processing → .mdcx containers
- **@docen/data**: Data processing → .dtcx containers
- **@docen/office**: Office processing → .mdcx/.dtcx containers
- **@docen/media**: Media processing → embedded in containers
- **@docen/providers**: Transport layer for Yjs synchronization
- **@docen/editor**: UI layer for container editing

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
