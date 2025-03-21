# @docen/archive

Archive and container format processing module for Docen.

## Features

- Process archive formats like ZIP, RAR
- Handle container formats like EPUB, OOXML
- Extract contents from archives
- Navigate through archive structures

## Supported Formats

- OOXML (Office Open XML)
- ZIP
- EPUB
- RAR (planned)

## Usage

```typescript
import { OOXMLProcessor } from "@docen/archive";

// Parse OOXML document
const processor = new OOXMLProcessor();
const document = await processor.parse(source);

// Generate output
const result = await processor.generate(document, { targetFormat: "json" });
```

## License

MIT
