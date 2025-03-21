# @docen/document

![npm version](https://img.shields.io/npm/v/@docen/document)
![npm downloads](https://img.shields.io/npm/dw/@docen/document)
![npm license](https://img.shields.io/npm/l/@docen/document)

> Document processing module for Docen - Handles text-based document formats

## Overview

`@docen/document` is the document processing module of the Docen document processing library, specifically designed for handling text-based document formats. Currently, it supports PDF format with plans to add support for DOCX, Markdown, HTML and other formats in the future. This module provides parsing, conversion, and content extraction capabilities for document formats.

## Features

- 📄 **Multi-format Support**: Process PDF documents (with DOCX, Markdown, HTML planned for future releases)
- 🔄 **Format Conversion**: Convert between different document formats
- 📝 **Text Extraction**: Extract plain text content from documents
- 📊 **Metadata Retrieval**: Extract document metadata information
- 🔍 **Content Analysis**: Analyze document structure and content

## Installation

```bash
# npm
$ npm install @docen/document

# yarn
$ yarn add @docen/document

# pnpm
$ pnpm add @docen/document
```

## Usage

### PDF Processing

```ts
// Import PDF parser and generator
import { PDFParser, PDFGenerator } from "@docen/document";

// Create PDF parser
const parser = new PDFParser();

// Parse PDF document
const document = await parser.parse(pdfData);

// Create PDF generator
const generator = new PDFGenerator();

// Generate PDF from document
const result = await generator.generate(document);
```

## Supported Formats

| Format   | Read | Write | Text Extraction | Metadata |
| -------- | ---- | ----- | --------------- | -------- |
| PDF      | ✅   | ✅    | ✅              | ✅       |
| DOCX     | 🔄   | 🔄    | 🔄              | 🔄       |
| Markdown | 🔄   | 🔄    | 🔄              | 🔄       |
| HTML     | 🔄   | 🔄    | 🔄              | 🔄       |
| TXT      | 🔄   | 🔄    | 🔄              | 🔄       |

✅ - Supported | 🔄 - Planned for future releases

## API Reference

### Processors

- `PDFParser` - PDF document parser
- `PDFGenerator` - PDF document generator

### Common Methods

#### Parser Methods

- `parse(source, options)` - Parse document into AST
- `canParse(source, mimeType, extension)` - Check if parser can handle the source

#### Generator Methods

- `generate(document, options)` - Generate output from document AST
- `canGenerate(mimeType, extension)` - Check if generator can produce the requested format

## License

- [MIT](../../LICENSE) &copy; [Demo Macro](https://imst.xyz/)
