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
- **[@docen/collaborative](./packages/collaborative)**: Collaborative editing support with Yjs integration
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
import { extractText } from "https://esm.sh/docen"
```

## 📝 Usage

### Basic Document Processing

```js
import { extractText, convert, getMetadata } from "docen";

// Extract text from any supported format
const text = await extractText(sourceData);

// Convert between formats
const result = await convert(sourceData, "txt", {
  preserveFormatting: true,
});

// Get document metadata
const metadata = await getMetadata(sourceData);
```

### Collaborative Editing

```js
import { createCollaborativeDocument } from "@docen/collaborative";

// Create a collaborative document
const doc = await createCollaborativeDocument({
  type: "text",
  content: "Hello, world!",
});

// Observe changes
doc.observe((event) => {
  console.log("Document updated:", event);
});

// Make changes
doc.update((content) => {
  content.push("New line");
});
```

### Format-Specific Options

```js
import { convert } from "docen";

// CSV Options
const jsonData = await convert(csvData, "json", {
  csv: {
    header: true,
    delimiter: ",",
    quotechar: '"',
  },
});

// XLSX Options
const csvData = await convert(xlsxData, "csv", {
  xlsx: {
    sheets: ["Sheet1"],
    includeFormulas: true,
  },
});

// Image OCR Options
const textData = await convert(imageData, "txt", {
  ocr: true,
  language: "eng",
});
```

### CLI

```bash
Usage: docen [command] [options]

Commands:
  convert     Convert document to target format
  extract     Extract text from document
  metadata    Get document metadata

Options:
  -s, --source          Source file
  -t, --target          Target file
  -f, --format          Target format
  -o, --options         Format-specific options (JSON string)
  -v, --version         Show version number
  -h, --help            Show help

Examples:
  $ docen convert -s input.pdf -t output.txt
  $ docen extract -s document.docx
  $ docen metadata -s data.xlsx
```

## 🧩 Architecture

Docen uses a universal Abstract Syntax Tree (AST) to represent document content, allowing seamless conversion between different formats. The architecture consists of:

1. **Core AST**: A unified representation of document structure
2. **Processors**: Format-specific parsers and generators
3. **Registry**: System for managing available processors
4. **Pipeline**: Conversion workflow from input to output
5. **Collaborative**: Real-time synchronization using Yjs

## 📄 License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
