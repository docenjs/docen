# @docen/document

Pure text document processing for Markdown and HTML with unified.js compatibility.

## Overview

The `@docen/document` package provides **pure format processing** for text documents using bottom-level unified.js utilities. It focuses on AST transformation and format conversion without any collaboration features.

**Architecture**: Uses bottom-level utilities (`mdast-util-*`, `hast-util-*`) for maximum compatibility and performance, avoiding higher-level remark/rehype abstractions.

## Features

### 📝 Text Document Formats

- **Markdown**: Standard Markdown with optional GFM support
- **HTML**: HTML documents with DOM structure
- **Plain Text**: Simple text without formatting

### 🔄 Processing Modes

- `markdown`: Parse, transform, serialize markdown
- `html`: Parse, transform, serialize HTML
- `markdown-to-html`: Convert markdown to HTML
- `html-to-markdown`: Convert HTML to markdown

### 🛠️ Built on Unified.js

- **Bottom-Level Processing**: Direct use of `mdast-util-*` and `hast-util-*`
- **GFM Support**: Optional GitHub Flavored Markdown via micromark extensions
- **Plugin Compatible**: Works with unified.js ecosystem plugins
- **Type Safe**: Full TypeScript support with AST types

## Architecture

```
packages/document/src/
├── ast/              # AST type definitions
│   ├── mdast.ts      # Markdown AST extensions
│   ├── hast.ts       # HTML AST extensions
│   └── index.ts      # Unified AST exports
├── processors/       # Format processors
│   ├── markdown.ts   # Markdown processor
│   ├── html.ts       # HTML processor
│   └── index.ts      # Processor exports
├── schema/           # Validation schemas
│   └── index.ts      # Document schema definitions
└── index.ts          # Main exports
```

## Usage

### Basic Document Processing

```typescript
import { createMarkdownProcessor, createHtmlProcessor } from "@docen/document";

// Process Markdown
const markdownProcessor = createMarkdownProcessor();
const mdResult = await markdownProcessor.process("# Hello World");

// Process HTML
const htmlProcessor = createHtmlProcessor();
const htmlResult = await htmlProcessor.process("<h1>Hello World</h1>");
```

### Format Conversion

```typescript
import {
  createMarkdownToHtmlProcessor,
  createHtmlToMarkdownProcessor,
} from "@docen/document";

// Markdown to HTML
const mdToHtml = createMarkdownToHtmlProcessor();
const htmlOutput = await mdToHtml.process("# Title\n\nParagraph");

// HTML to Markdown
const htmlToMd = createHtmlToMarkdownProcessor();
const mdOutput = await htmlToMd.process("<h1>Title</h1><p>Paragraph</p>");
```

### GFM Support

```typescript
import { createMarkdownProcessor } from "@docen/document";

// Enable GitHub Flavored Markdown
const processor = createMarkdownProcessor({
  gfm: true,
  extensions: ["tables", "strikethrough", "tasklist"],
});

const result = await processor.process(`
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |

~~strikethrough~~

- [x] Task 1
- [ ] Task 2
`);
```

### Integration with @docen/core

```typescript
import { createProcessor } from "@docen/core";
import { markdownPlugin } from "@docen/document";

// Use with core processor
const processor = createProcessor({
  adapter: "remark",
}).use(markdownPlugin);

const result = await processor.process("# Document");
```

## Supported Features

### Markdown Features

- **CommonMark**: Full CommonMark specification
- **GFM Extensions**: Tables, strikethrough, task lists, autolinks
- **Frontmatter**: YAML frontmatter parsing
- **Math**: Optional math expression support
- **Code**: Syntax highlighting preparation

### HTML Features

- **DOM Structure**: Full HTML DOM tree processing
- **Semantic Elements**: Article, section, nav, aside support
- **Embedded Content**: Images, videos, audio handling
- **Microformats**: Structured data preservation

### Conversion Features

- **Bidirectional**: Lossless round-trip conversion where possible
- **Configurable**: Control over conversion behavior
- **Extensible**: Plugin system for custom transformations

## Type System

### AST Types

```typescript
// Markdown AST (extends mdast)
interface MarkdownNode extends MdastNode {
  // Extended markdown node types
}

// HTML AST (extends hast)
interface HtmlNode extends HastNode {
  // Extended HTML node types
}

// Unified document root
interface DocumentRoot extends Parent {
  type: "root";
  children: MarkdownNode[] | HtmlNode[];
}
```

### Processor Options

```typescript
interface MarkdownProcessorOptions {
  gfm?: boolean;
  extensions?: string[];
  frontmatter?: boolean;
  math?: boolean;
}

interface HtmlProcessorOptions {
  fragment?: boolean;
  parseErrors?: boolean;
  whitespace?: "normal" | "pre";
}
```

## Dependencies

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `hast-util-from-html`: Parse HTML to HAST (v2.0.3)
- `hast-util-to-html`: Serialize HAST to HTML (v9.0.5)
- `hast-util-to-mdast`: Convert HAST to MDAST (v10.1.2)
- `mdast-util-from-markdown`: Parse Markdown to MDAST (v2.0.2)
- `mdast-util-to-hast`: Convert MDAST to HAST (v13.2.0)
- `mdast-util-to-markdown`: Serialize MDAST to Markdown (v2.1.2)
- `micromark-extension-gfm`: GitHub Flavored Markdown support (v3.0.0)
- `mdast-util-gfm`: MDAST utilities for GFM (v3.0.0)
- `unist-util-visit`: AST traversal utility (v5.0.0)
- `unist-util-find`: AST search utilities (v3.0.0)

This package follows the user rule to rely on low-level utilities (`mdast-util-*`, `hast-util-*`, `micromark-extension-*`) instead of higher-level remark/rehype processors.

## Design Principles

### 1. Pure Format Processing

- No collaboration features
- Focus on AST transformation only
- Standard unified.js patterns

### 2. Bottom-Level Utilities

- Direct use of `mdast-util-*` and `hast-util-*`
- Maximum performance and compatibility
- Avoid higher-level abstractions

### 3. Format Compatibility

- Lossless conversion where possible
- Preserve semantic structure
- Maintain formatting intent

### 4. Extensibility

- Plugin-based architecture
- Configurable processors
- Custom transformation support

## Integration

This package integrates with other Docen packages:

- **@docen/core**: Uses core processor interface and types
- **@docen/office**: Receives DOCX/RTF content for processing
- **@docen/containers**: Content processing for .mdcx containers

**Note**: Collaboration features are handled separately in `@docen/containers` - this package remains collaboration-free.

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
