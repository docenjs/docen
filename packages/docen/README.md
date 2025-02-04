# docen

![npm version](https://img.shields.io/npm/v/docen)
![npm downloads](https://img.shields.io/npm/dw/docen)
![npm license](https://img.shields.io/npm/l/docen)

> Universal document conversion and processing library that works in any JavaScript runtime, powered by Demo Macro

## Features

- 🌐 Runtime Agnostic
  - Works in Browsers
  - Works in Node.js
  - Works in Deno
  - Works in Cloudflare Workers
  - Works in Edge Functions
  - Same API everywhere
- 📄 Multiple Format Support
  - PDF: Extract text and metadata
  - DOCX: Convert to text, extract metadata
  - XLSX: Convert to CSV/text, extract metadata
  - CSV: Convert to JSON/text, extract metadata
  - Image: OCR text extraction, metadata
  - JSON/JSONP: Format conversion, metadata
- 🛠️ Rich Functionality
  - Format conversion
  - Text extraction
  - Metadata retrieval
  - OCR capabilities
- 🔧 Highly Configurable
  - Format-specific options
  - Customizable output
  - Extensible architecture

## Installation

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

## Usage

### Data Processing

```ts
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

### Format-Specific Options

```ts
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
  $ docen metadata -s image.jpg
```

## Runtime Compatibility

### Common Features

- Pure data processing
- No file system dependencies
- Runtime agnostic APIs
- Consistent behavior across platforms
- Automatic format detection
- Streaming support where possible

### Supported Input Types

- ArrayBuffer
- Uint8Array
- Base64 string
- Blob (browser)
- File (browser)
- Buffer (Node.js)
- Response (Web)
- ReadableStream
- URL string (CLI only)

## License

- [MIT](LICENSE) &copy; [Demo Macro](https://imst.xyz/)
