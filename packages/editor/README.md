# @docen/editor

Container-aware collaborative editor with format-specific UI components.

## Overview

The `@docen/editor` package provides a unified editing interface for Docen containers. It connects to `@docen/containers` for collaboration and provides format-specific editing experiences for .mdcx, .dtcx, and .ptcx files.

**Key Architecture**: This editor only depends on `@docen/containers` for collaboration - all format processing is handled by the container layer.

## Features

### 📝 Container-Aware Editing

- **Document Editor**: Rich text editing for .mdcx files
- **Data Editor**: Table/form editing for .dtcx files
- **Presentation Editor**: Slide editing for .ptcx files
- **Auto-Detection**: Automatically loads appropriate editor for container type

### 🤝 Real-time Collaboration

- **Unified Collaboration**: All collaboration through @docen/containers
- **Live Cursors**: Real-time cursor positions for all users
- **Conflict Resolution**: Automatic CRDT-based conflict resolution
- **Presence Awareness**: See who's editing what in real-time

### ⌨️ Rich Editing Experience

- **Keyboard Shortcuts**: Full hotkey support for efficient editing
- **Multi-format**: Seamlessly switch between different content types
- **Plugin Architecture**: Extensible with custom editing components
- **Cross-platform**: Works in browsers, desktop, and mobile

## Usage

### Basic Editor Setup

```typescript
import { createEditor } from "@docen/editor";
import { loadContainer } from "@docen/containers";

// Load a container
const container = await loadContainer(containerBuffer);

// Create editor for the container
const editor = createEditor({
  container,
  target: document.getElementById("editor"),
  mode: "collaborative", // or 'readonly'
});

// Start collaborative editing
await editor.connect();
```

### Document Editing (.mdcx)

```typescript
import { createDocumentEditor } from "@docen/editor";

const documentEditor = createDocumentEditor({
  container: mdcxContainer,
  features: {
    toolbar: true,
    lineNumbers: true,
    preview: true,
    outline: true,
  },
});

// Listen for changes
documentEditor.on("change", ({ content, cursor }) => {
  console.log("Document updated:", content);
  console.log("Cursor position:", cursor);
});
```

### Data Editing (.dtcx)

```typescript
import { createDataEditor } from "@docen/editor";

const dataEditor = createDataEditor({
  container: dtcxContainer,
  features: {
    grid: true,
    sorting: true,
    filtering: true,
    formView: true,
  },
});

// Handle data changes
dataEditor.on("rowChange", ({ rowIndex, data }) => {
  console.log(`Row ${rowIndex} updated:`, data);
});

dataEditor.on("columnAdd", ({ column }) => {
  console.log("New column:", column);
});
```

### Presentation Editing (.ptcx)

```typescript
import { createPresentationEditor } from "@docen/editor";

const presentationEditor = createPresentationEditor({
  container: ptcxContainer,
  features: {
    slideNavigation: true,
    masterSlides: true,
    animations: true,
    presenter: true,
  },
});

// Handle slide changes
presentationEditor.on("slideChange", ({ slideId, content }) => {
  console.log(`Slide ${slideId} updated:`, content);
});

presentationEditor.on("slideAdd", ({ slide, position }) => {
  console.log("New slide added:", slide, "at position:", position);
});
```

### Multi-Container Workspace

```typescript
import { createWorkspace } from "@docen/editor";

// Create workspace with multiple containers
const workspace = createWorkspace({
  containers: [
    { id: "doc1", container: documentContainer },
    { id: "data1", container: dataContainer },
    { id: "presentation1", container: presentationContainer },
  ],
});

// Switch between containers
workspace.switchTo("doc1");
workspace.splitView(["doc1", "data1"]); // Side-by-side editing
```

## Editor Modes

### Document Editor Features

- **Rich Text**: WYSIWYG editing with Markdown support
- **Live Preview**: Real-time Markdown rendering
- **Outline View**: Document structure navigation
- **Search & Replace**: Full-text search and replacement
- **Version History**: Container-level version tracking

### Data Editor Features

- **Grid View**: Spreadsheet-like data editing
- **Form View**: Record-by-record editing
- **Schema Validation**: Real-time data validation
- **Import/Export**: CSV, JSON data exchange
- **Filtering & Sorting**: Advanced data manipulation

### Presentation Editor Features

- **Slide Deck**: Visual slide management
- **Master Slides**: Template-based layouts
- **Rich Content**: Text, images, charts support
- **Presenter Mode**: Full-screen presentation
- **Animation Timeline**: Slide transition management

## Keyboard Shortcuts

### Universal Shortcuts

- `Ctrl/Cmd + S`: Save container
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Y`: Redo
- `Ctrl/Cmd + F`: Find/Search
- `Ctrl/Cmd + Shift + P`: Command palette

### Document Editor Shortcuts

- `Ctrl/Cmd + B`: Bold text
- `Ctrl/Cmd + I`: Italic text
- `Ctrl/Cmd + K`: Insert link
- `Ctrl/Cmd + Shift + M`: Toggle preview

### Data Editor Shortcuts

- `Tab`: Move to next cell
- `Shift + Tab`: Move to previous cell
- `Enter`: Edit cell
- `Escape`: Cancel edit
- `Ctrl/Cmd + Plus`: Add row
- `Ctrl/Cmd + Minus`: Delete row

### Presentation Editor Shortcuts

- `Ctrl/Cmd + M`: New slide
- `Ctrl/Cmd + D`: Duplicate slide
- `Delete`: Delete slide
- `F5`: Start presentation
- `Page Up/Down`: Navigate slides

## Dependencies

### Production Dependencies

- `@docen/containers`: **THE ONLY COLLABORATION DEPENDENCY** (workspace:\*)
- `eventemitter3`: Event emitter implementation (v5.0.1)
- `hotkeys-js`: Keyboard shortcuts handling (v3.13.7)

### Architecture Benefits

**Clean Dependencies**: The editor only depends on containers for collaboration, keeping the architecture simple and focused.

```typescript
// Clean dependency flow
@docen/editor
└── @docen/containers (collaboration)
    ├── yjs (collaborative editing)
    └── format packages (content processing)
```

## Integration

The editor integrates seamlessly with other Docen packages:

- **@docen/containers**: Source of collaborative documents
- **@docen/providers**: Transport layer for real-time sync
- **Format Packages**: Content processing happens in containers
- **@docen/core**: Shared utilities and types

## Design Principles

### 1. Container-Centric Architecture

- **Single Source**: All content comes from containers
- **Format Agnostic**: Editor adapts to container content type
- **Collaboration First**: Built for real-time editing

### 2. Minimal Dependencies

- **Focused**: Only depends on containers for collaboration
- **Lightweight**: Minimal external dependencies
- **Performance**: Fast loading and responsive editing

### 3. Extensible Design

- **Plugin System**: Custom editor components
- **Theme Support**: Customizable UI themes
- **Hook System**: Extensible with custom behaviors

### 4. Cross-Platform

- **Universal**: Works in any JavaScript environment
- **Responsive**: Adapts to different screen sizes
- **Accessible**: Full accessibility support

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
