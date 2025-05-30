# @docen/office

Office document format detection and routing hub with unified.js compatibility.

## Overview

The `@docen/office` package serves as a **format detection and routing hub** for office document formats. It identifies document types and routes them to appropriate specialized processors without handling the actual processing itself.

**Architecture Role**: This package acts as a **smart router** - it detects office formats (PDF, DOCX, XLSX, PPTX) and delegates processing to the appropriate format-specific packages.

## Features

### 📄 Office Format Processing

- **DOCX**: WordprocessingML document processing and transformation
- **XLSX**: SpreadsheetML spreadsheet processing (via routing)
- **PPTX**: PresentationML presentation processing (via routing)
- **PDF**: PDF document processing and conversion to OOXML AST

### 🔄 OOXML AST Transformation

- **Unified AST**: Convert office formats to unified OOXML AST
- **Plugin System**: Extensible transformation plugins
- **Format Conversion**: Transform between different office formats
- **Structure Preservation**: Maintain document structure and formatting

### 🛠️ Built on Unified.js

- **Processor Interface**: Standard unified.js processor patterns
- **Plugin Architecture**: Modular transformation plugins
- **Type Safe**: Full TypeScript support with OOXML AST types
- **AST Utilities**: Rich utilities for OOXML manipulation

## Architecture

```
packages/office/src/
├── ast/              # Office document AST definitions
│   ├── shared.ts     # Shared base types and utilities
│   ├── wml.ts        # WordprocessingML (DOCX) types
│   ├── sml.ts        # SpreadsheetML (XLSX) types
│   ├── pml.ts        # PresentationML (PPTX) types
│   ├── dml.ts        # DrawingML types
│   ├── vml.ts        # Vector Markup Language types
│   ├── pdf.ts        # PDF document types
│   └── index.ts      # AST exports
├── processor/        # Unified processor implementation
│   └── index.ts      # Office processor factory
├── plugins/          # Office format plugins
│   ├── docx-to-ooxml.ts  # DOCX to OOXML transformation
│   ├── pdf-to-ooxml.ts   # PDF to OOXML transformation
│   └── index.ts      # Plugin exports
├── utils/            # Office utilities
│   ├── cleanup.ts    # AST cleanup and optimization
│   ├── validation.ts # OOXML validation utilities
│   └── index.ts      # Utility exports
└── index.ts          # Main exports
```

## Usage

### Basic DOCX Processing

```typescript
import { createDocxProcessor } from "@docen/office";

// Process DOCX files to OOXML AST
const processor = createDocxProcessor();
const result = await processor.process(docxBuffer);

// Access the OOXML AST
console.log(result.data.ast); // OOXML AST structure
console.log(result.data.metadata); // Document metadata
```

### PDF to OOXML Conversion

```typescript
import { createPdfProcessor } from "@docen/office";

// Convert PDF to OOXML AST
const pdfProcessor = createPdfProcessor();
const result = await pdfProcessor.process(pdfBuffer);

// The resulting AST is in OOXML format
console.log(result.data.ast); // OOXML AST from PDF
console.log(result.data.pages); // Page information
```

### Using Transformation Plugins

```typescript
import {
  createDocxProcessor,
  docxToOoxmlAst,
  cleanupPlugin,
} from "@docen/office";

// Create processor with plugins
const processor = createDocxProcessor()
  .use(docxToOoxmlAst) // Transform DOCX to OOXML AST
  .use(cleanupPlugin); // Clean up and optimize AST

const result = await processor.process(docxBuffer);
```

### Working with OOXML AST

```typescript
import { createDocxProcessor } from "@docen/office";
import { visit } from "unist-util-visit";

const processor = createDocxProcessor();
const result = await processor.process(docxBuffer);

// Traverse and modify the OOXML AST
visit(result.data.ast, "paragraph", (node) => {
  // Process paragraph nodes
  console.log("Found paragraph:", node);
});
```

## Supported Features

### DOCX Processing

- **Full OOXML Support**: Complete WordprocessingML processing
- **AST Transformation**: Convert DOCX to unified OOXML AST
- **Structure Preservation**: Maintain document structure, formatting, and relationships
- **Plugin System**: Extensible transformation pipeline

### PDF Processing

- **PDF to OOXML**: Convert PDF documents to OOXML AST format
- **Text Extraction**: Extract and structure text content
- **Basic Formatting**: Preserve basic text formatting and structure
- **Page Handling**: Process multi-page PDF documents

### OOXML AST

- **Unified Structure**: Common AST format for all office documents
- **Type Safety**: Full TypeScript support for OOXML elements
- **Traversal**: Rich utilities for AST navigation and modification
- **Validation**: OOXML structure validation and cleanup

## Type System

### OOXML AST Types

```typescript
// Base OOXML node types
interface OOXMLNode extends Node {
  type: string;
  tagName?: string;
  attributes?: Record<string, string>;
  children?: OOXMLNode[];
}

// WordprocessingML specific types
interface WMLDocument extends OOXMLNode {
  type: "document";
  children: WMLElement[];
}

interface WMLParagraph extends OOXMLNode {
  type: "paragraph";
  children: WMLRun[];
}

interface WMLRun extends OOXMLNode {
  type: "run";
  properties?: RunProperties;
  children: WMLText[];
}

// PDF conversion types
interface PDFToOOXMLResult {
  ast: OOXMLNode;
  metadata: DocumentMetadata;
  pages: number;
}
```

### Processor Options

```typescript
interface DocxProcessorOptions {
  extractMetadata?: boolean;
  preserveComments?: boolean;
  includeDrawings?: boolean;
  cleanupAST?: boolean;
}

interface PdfProcessorOptions {
  extractMetadata?: boolean;
  preserveFormatting?: boolean;
  combineTextElements?: boolean;
  pageBreakHandling?: "preserve" | "remove" | "convert";
}
```

## Dependencies

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `docx`: Modern DOCX generation library (v9.4.1)
- `fflate`: Fast ZIP compression/decompression (v0.8.2)
- `image-meta`: Image metadata extraction (v0.2.1)
- `ofetch`: Better fetch API from UnJS (v1.4.1)
- `pathe`: Cross-platform path utilities (v2.0.3)
- `pdf-lib`: Pure JavaScript PDF manipulation (v1.17.1)
- `std-env`: Runtime detection from UnJS (v3.9.0)
- `undio`: Data type conversion utilities from UnJS (v0.2.0)
- `unified-engine`: Unified.js processing engine (v11.2.2)
- `unpdf`: PDF utilities for all runtimes (v0.12.1)
- `vfile`: Virtual file handling (v6.0.3)
- `xast-util-from-xml`: Create xast from XML (v4.0.0)
- `xast-util-to-string`: Extract text from xast (v3.0.0)
- `xast-util-to-xml`: Create XML from xast (v4.0.0)
- `xastscript`: Create xast nodes (v4.0.0)

### Development Dependencies

- `@types/xast`: TypeScript definitions for xast (v2.0.4)

## Design Principles

### 1. OOXML AST Focus

- Convert all office formats to unified OOXML AST
- Preserve document structure and formatting
- Enable cross-format transformations

### 2. Plugin Architecture

- Modular transformation pipeline
- Extensible processing capabilities
- Format-specific optimization plugins

### 3. Type Safety

- Full TypeScript support for OOXML elements
- Type-safe AST manipulation
- Compile-time validation of transformations

### 4. Performance

- Streaming processing where possible
- Memory-efficient AST handling
- Optimized XML parsing and transformation

## Integration

This package integrates with other Docen packages:

- **@docen/core**: Uses core processor interface and types
- **@docen/document**: Provides OOXML AST for text document processing
- **@docen/containers**: OOXML processing for office content in containers
- **@docen/presentation**: OOXML AST for presentation formats

**Note**: This package handles OOXML AST transformation - higher-level document operations are handled by other packages.

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
