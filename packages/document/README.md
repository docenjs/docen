# @docen/document

Pure document processing for text-based formats like Markdown and HTML using unified.js.

## Features

- **Flexible Processing**: Convert between markdown, HTML, and AST formats
- **GFM Support**: GitHub Flavored Markdown extensions
- **AST Output**: Export abstract syntax tree for further processing
- **Type-Safe**: Full TypeScript support
- **Extensible**: Built on unified.js ecosystem

## Installation

```bash
npm install @docen/document
```

## Quick Start

### Basic Usage

```typescript
import {
  createMarkdownProcessor,
  createHtmlProcessor,
  createDocumentProcessor,
} from "@docen/document";

// Parse markdown to HTML
const mdToHtml = createMarkdownProcessor("html", { gfm: true });
const html = await mdToHtml.process("# Hello World");

// Parse HTML to markdown
const htmlToMd = createHtmlProcessor("markdown", { gfm: true });
const markdown = await htmlToMd.process("<h1>Hello World</h1>");

// Export AST for analysis
const mdToAst = createMarkdownProcessor("ast");
const ast = await mdToAst.process("# Hello World");
console.log(JSON.parse(ast)); // Pretty-printed AST
```

### Unified API

```typescript
// Auto-detect and use appropriate processor
const processor = createDocumentProcessor("markdown", { gfm: true });
const result = await processor.process("# Hello World");
```

## API Reference

### `createMarkdownProcessor(output?, options?)`

Create a markdown processor with configurable output format.

**Parameters:**

- `output`: Output format (`"markdown"` | `"html"` | `"ast"`) - default: `"markdown"`
- `options`: Processing options

```typescript
// Parse and reformat markdown
const mdProcessor = createMarkdownProcessor("markdown", { gfm: true });

// Convert markdown to HTML
const mdToHtml = createMarkdownProcessor("html", { gfm: true });

// Export markdown as AST
const mdToAst = createMarkdownProcessor("ast");
```

### `createHtmlProcessor(output?, options?)`

Create an HTML processor with configurable output format.

**Parameters:**

- `output`: Output format (`"html"` | `"markdown"` | `"ast"`) - default: `"html"`
- `options`: Processing options

```typescript
// Parse and reformat HTML
const htmlProcessor = createHtmlProcessor("html");

// Convert HTML to markdown
const htmlToMd = createHtmlProcessor("markdown", { gfm: true });

// Export HTML as AST
const htmlToAst = createHtmlProcessor("ast");
```

### `createDocumentProcessor(format, options?)`

Auto-detect format and create appropriate processor.

**Parameters:**

- `format`: Processing mode (`"markdown"` | `"html"`)
- `options`: Processing options

### Processing Options

```typescript
interface DocumentProcessorOptions {
  gfm?: boolean; // GitHub Flavored Markdown support
  frontmatter?: boolean; // YAML frontmatter support
  math?: boolean; // Math notation support
  footnotes?: boolean; // Footnote support
}
```

## Examples

### Convert Blog Posts

```typescript
import { createMarkdownProcessor } from "@docen/document";

const processor = createMarkdownProcessor("html", {
  gfm: true,
  frontmatter: true,
});

const blogPost = `---
title: My Blog Post
date: 2024-01-01
---

# Hello World

This is a **bold** statement with a [link](https://example.com).

\`\`\`javascript
console.log("Hello, World!");
\`\`\`
`;

const html = await processor.process(blogPost);
console.log(html); // Full HTML output
```

### AST Analysis

```typescript
import { createMarkdownProcessor } from "@docen/document";

const astProcessor = createMarkdownProcessor("ast");
const ast = JSON.parse(
  await astProcessor.process("# Title\n\nParagraph text."),
);

// Walk the AST
function walkAST(node, depth = 0) {
  console.log("  ".repeat(depth) + node.type);
  if (node.children) {
    node.children.forEach((child) => walkAST(child, depth + 1));
  }
}

walkAST(ast);
// Output:
// root
//   heading
//     text
//   paragraph
//     text
```

### Format Conversion Pipeline

```typescript
import { createHtmlProcessor, createMarkdownProcessor } from "@docen/document";

// HTML → AST → Markdown pipeline
const htmlParser = createHtmlProcessor("ast");
const markdownGenerator = createMarkdownProcessor("markdown");

const htmlContent = "<h1>Title</h1><p>Content</p>";
const ast = JSON.parse(await htmlParser.process(htmlContent));
const markdown = await markdownGenerator.process(JSON.stringify(ast));
console.log(markdown); // # Title\n\nContent
```

## Advanced Usage

### Custom Processing Pipeline

```typescript
import { createProcessor } from "@docen/core";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHtml } from "hast-util-to-html";
import { toHast } from "mdast-util-to-hast";

// Custom processor with specific transformations
const customProcessor = createProcessor();

customProcessor.parser = (doc: string) => fromMarkdown(doc);
customProcessor.compiler = (tree: any) => {
  const hast = toHast(tree);
  return toHtml(hast, {
    allowDangerousHtml: false,
    closeSelfClosing: true,
  });
};

const result = await customProcessor.process("# Custom Processing");
```

## Integration

### With Next.js

```typescript
// pages/api/convert.ts
import { createMarkdownProcessor } from "@docen/document";

const processor = createMarkdownProcessor("html", { gfm: true });

export default async function handler(req, res) {
  const { markdown } = req.body;
  const html = await processor.process(markdown);
  res.json({ html });
}
```

### With Express

```typescript
import express from "express";
import { createDocumentProcessor } from "@docen/document";

const app = express();
const processor = createDocumentProcessor("markdown", { gfm: true });

app.post("/convert", async (req, res) => {
  const result = await processor.process(req.body.markdown);
  res.json({ result });
});
```

## Related Packages

- `@docen/core` - Core processing engine
- `@docen/collaborative` - Real-time collaborative editing
- `@docen/office` - Office document support

## License

MIT

// Legacy API (still supported)
const legacyProcessor = createDocumentProcessor("markdown");
