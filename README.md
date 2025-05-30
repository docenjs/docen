# Docen

![GitHub](https://img.shields.io/github/license/docenjs/docen)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](https://www.contributor-covenant.org/version/2/1/code_of_conduct/)

> Universal document conversion and processing library with container-level collaboration that works in any JavaScript runtime

## 🌟 Features

- 🌐 **Runtime Agnostic**
  - Works in Browsers, Node.js, Deno
  - Works in Cloudflare Workers and Edge Functions
  - Same API everywhere
- 📄 **Multiple Format Support**
  - **Documents**: Markdown, HTML, Plain Text
  - **Data**: JSON, YAML, CSV, TSV, XML
  - **Office**: PDF, DOCX, XLSX, PPTX
  - **Media**: Images, Audio, Video processing
  - **Containers**: .mdcx, .dtcx, .ptcx (collaborative formats)
- 🛠️ **Rich Functionality**
  - Pure format processing via unified.js
  - Container-level collaboration via Yjs
  - Real-time synchronization
  - Custom collaborative editor
- 🔧 **Highly Configurable**
  - Format-specific processors
  - Extensible plugin architecture
  - Type-safe APIs

## 📦 Architecture & Packages

Docen follows a **three-layer architecture** with clear separation of concerns:

### Layer 1: Format Processing (Pure AST)

- **[@docen/core](./packages/core)**: Core unified.js processor interface, types, and utilities
- **[@docen/document](./packages/document)**: Text document processing (Markdown, HTML)
- **[@docen/data](./packages/data)**: Structured data processing (JSON, YAML, CSV, XML)
- **[@docen/media](./packages/media)**: Media processing toolkit (images, video, audio)
- **[@docen/office](./packages/office)**: Office format detection and routing hub

### Layer 2: Container Collaboration (Yjs Integration)

- **[@docen/containers](./packages/containers)**: Container formats (.mdcx/.dtcx/.ptcx) with Yjs collaboration

### Layer 3: Collaborative Editing

- **[@docen/editor](./packages/editor)**: Container-aware collaborative editor
- **[@docen/providers](./packages/providers)**: Transport layer for Yjs synchronization

### Main Package

- **[docen](./packages/docen)**: Unified API entry point with CLI

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

### Format Processing

```typescript
import { docen } from "docen";

// Process documents - pure unified.js
const processor = docen("markdown");
const result = await processor.process("# Hello World");
console.log(String(result)); // Processed markdown
```

### Container Collaboration

```typescript
import { docen } from "docen";

// Create collaborative containers
const documentContainer = docen.containers("document"); // .mdcx
const dataContainer = docen.containers("data"); // .dtcx
const slideContainer = docen.containers("presentation"); // .ptcx

// Use with collaborative editor
import { DocenEditor } from "@docen/editor";
const editor = new DocenEditor({ container: documentContainer });
```

### Container Formats

```typescript
import {
  createContainer,
  documentInsertText,
  documentGetText,
} from "@docen/containers";

// Create and manipulate document containers
const container = createContainer("document");
documentInsertText(container, 0, "Hello World");
const content = documentGetText(container);
```

## 🧩 Architecture Philosophy

### Container-Level Collaboration

Docen uses a **container-level collaboration architecture** where:

- **Format packages** handle pure AST processing (unified.js standard)
- **Containers package** handles all collaboration via simple Yjs patterns
- **Editor** provides format-specific UIs based on container type

### Benefits

- **Simplified Codebase**: Only one package has collaboration complexity
- **Unified Experience**: Same collaboration interface for all formats
- **Ecosystem Compatibility**: Full unified.js ecosystem compatibility
- **Better Maintenance**: Clear separation of format vs collaboration concerns

### Container Types

- **.mdcx**: Document containers using Y.Text for text collaboration
- **.dtcx**: Data containers using Y.Array/Y.Map for structural collaboration
- **.ptcx**: Presentation containers using hybrid Y.Text + Y.Map

## 📄 License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
