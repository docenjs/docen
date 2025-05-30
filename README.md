# Docen

![GitHub](https://img.shields.io/github/license/docenjs/docen)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)

> Universal document conversion and processing library that works in any JavaScript runtime, powered by Demo Macro

## 🌟 Features

- 🌐 **Runtime Agnostic**
  - Works in Browsers
  - Works in Node.js
  - Works in Deno
  - Works in Cloudflare Workers
  - Works in Edge Functions
  - Same API everywhere
- 📄 **Multiple Format Support**
  - PDF: Extract text and metadata
  - DOCX: Convert to text, extract metadata
  - XLSX: Convert to CSV/text, extract metadata
  - CSV: Convert to JSON/text, extract metadata
  - JSON/JSONP: Format conversion, metadata
  - Markdown: Convert to HTML/text
  - HTML: Convert to Markdown/text
  - MDOC: Enhanced Markdown container format
- 🛠️ **Rich Functionality**
  - Format conversion
  - Text extraction
  - Metadata retrieval
  - Collaborative editing support
  - Real-time synchronization
  - Custom editor implementation
- 🔧 **Highly Configurable**
  - Format-specific options
  - Customizable output
  - Extensible architecture
  - Type-safe APIs

## 📦 Packages

Docen follows a modular design organized by content essence and user needs:

- **[@docen/core](./packages/core)**: Core module defining universal AST structure, processor interfaces, and registry system
- **[@docen/document](./packages/document)**: Document processing module for text-based formats (PDF, DOCX, Markdown, HTML)
- **[@docen/data](./packages/data)**: Data processing module for structured formats (XLSX, CSV, JSON, YAML, XML)
- **[@docen/office](./packages/office)**: Office document processing module (DOCX, XLSX, PPTX, PDF with OOXML support)
- **[@docen/media](./packages/media)**: Media processing module for images, audio, and video content
- **[@docen/editor](./packages/editor)**: Custom collaborative editor built on Yjs without external editor dependencies
- **[@docen/mdoc](./packages/mdoc)**: Enhanced Markdown container format (.mdoc) with media embedding and frontmatter metadata
- **[@docen/providers](./packages/providers)**: Synchronization and collaboration providers for real-time editing
- **[docen](./packages/docen)**: Main package providing a unified API and CLI for all functionality

## 🚀 Installation

```bash
# npm
$ npm install docen

# yarn
$ yarn add docen

# pnpm
$ pnpm add docen

# deno
import { docen } from "https://esm.sh/docen"
```

## 📝 Usage

### Basic Document Processing

```typescript
import { docen } from "docen";

// Convert markdown to HTML
const result = await docen()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeStringify)
  .process("# Hello World");

console.log(String(result)); // <h1>Hello World</h1>
```

### Collaborative Editing

```typescript
import { DocenEditor } from "@docen/editor";
import { WebsocketProvider } from "@docen/providers";

// Create collaborative editor
const editor = new DocenEditor({
  container: document.getElementById("editor"),
  provider: new WebsocketProvider("ws://localhost:1234", "doc-room"),
});

editor.mount();
```

### MDOC Format

```typescript
import { mdocParser, mdocStringifier } from "@docen/mdoc";

// Parse .mdoc file
const doc = await mdocParser.parse(mdocFileContent);

// Create .mdoc file
const mdocFile = await mdocStringifier.stringify(document);
```

## 🧩 Architecture

Docen uses a universal Abstract Syntax Tree (AST) to represent document content, allowing seamless conversion between different formats. The architecture consists of:

1. **Core AST**: A unified representation of document structure
2. **Processors**: Format-specific parsers and generators
3. **Registry**: System for managing available processors
4. **Pipeline**: Conversion workflow from input to output
5. **Collaborative**: Real-time synchronization using Yjs
6. **Editor**: Custom editor implementation for collaborative editing
7. **MDOC**: Enhanced Markdown format with container capabilities

### Editor Development Philosophy

The `@docen/editor` package implements a completely custom editor built directly on Yjs without dependencies on existing editor frameworks. This approach provides:

- **Pure Yjs Integration**: Direct use of Y.Text, Y.Map, and Y.Array for document structure
- **Custom DOM Rendering**: Lightweight DOM manipulation optimized for collaborative editing
- **Minimal Dependencies**: Only essential packages (Yjs, DOM types, utilities)
- **Full Control**: Complete control over editing behavior and performance
- **Extensible Architecture**: Plugin system for customization without external constraints

The editor handles all aspects of text editing from scratch:

- Input processing (keyboard, mouse, touch)
- Selection and cursor management
- DOM rendering and updates
- Collaborative awareness and presence
- Undo/redo functionality
- Plugin and command systems

## 📄 License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
