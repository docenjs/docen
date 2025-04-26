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
- 🛠️ **Rich Functionality**
  - Format conversion
  - Text extraction
  - Metadata retrieval
  - Collaborative editing support
  - Real-time synchronization
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
- **[@docen/archive](./packages/archive)**: Archive and container format processing module (OOXML, ZIP, EPUB)
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

## 🧩 Architecture

Docen uses a universal Abstract Syntax Tree (AST) to represent document content, allowing seamless conversion between different formats. The architecture consists of:

1. **Core AST**: A unified representation of document structure
2. **Processors**: Format-specific parsers and generators
3. **Registry**: System for managing available processors
4. **Pipeline**: Conversion workflow from input to output
5. **Collaborative**: Real-time synchronization using Yjs

## 📄 License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
