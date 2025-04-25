# @docen/document

Provides document processing capabilities for Docen, focusing initially on Markdown and HTML.

This package integrates with `@docen/core` to leverage the unified processing pipeline and collaborative features.

## Features (Planned)

- Markdown parsing (`remark-parse`)
- Markdown serialization (`remark-stringify`)
- HTML parsing (`rehype-parse`)
- HTML serialization (`rehype-stringify`)
- Conversion between Markdown and HTML (`remark-rehype`, `rehype-remark`)
- Integration with Yjs binding for collaborative editing
- Document schema validation
- Collaborative cursor tracking support

## Usage

```typescript
// Example usage (details TBD)
import { createProcessor } from "@docen/core";
import { docenDocument } from "@docen/document"; // Assuming an export like this

const processor = createProcessor().use(docenDocument);

const result = await processor.process("# Hello\n\nWorld!");
console.log(result.value);
```
