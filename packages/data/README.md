# @docen/data

Pure structured data processing for JSON, YAML, CSV, XML with unified.js compatibility.

## Overview

The `@docen/data` package provides **pure format processing** for structured data formats using unified.js patterns. It focuses on data transformation and format conversion without any collaboration features.

**Architecture**: Uses standard unified.js processors with format-specific adapters for consistent data processing across all supported formats.

## Features

### 📊 Data Formats

- **JSON**: JavaScript Object Notation with schema validation
- **JSON5**: Extended JSON with comments and flexible syntax
- **YAML**: Human-readable data serialization
- **XML**: Extensible Markup Language with xast integration
- **CSV**: Comma-separated values with configurable delimiters
- **TSV**: Tab-separated values

### 🔄 Processing Modes

- `json`: Parse, transform, serialize JSON
- `yaml`: Parse, transform, serialize YAML
- `csv`: Parse, transform, serialize CSV/TSV
- `xml`: Parse, transform, serialize XML with xast

### 🛠️ Built on Unified.js

- **Standard Processors**: Unified.js processors for each format
- **Format Conversion**: Bidirectional conversion between data formats
- **Schema Validation**: Data structure validation and type checking
- **Type Safe**: Full TypeScript support with data types

## Architecture

```
packages/data/src/
├── ast/              # Data AST definitions
│   ├── data.ts       # Generic data AST types
│   ├── xast.ts       # XML AST extensions
│   └── index.ts      # AST exports
├── processors/       # Format processors
│   ├── json.ts       # JSON processor
│   ├── yaml.ts       # YAML processor
│   ├── csv.ts        # CSV/TSV processor
│   ├── xml.ts        # XML processor
│   └── index.ts      # Processor exports
├── schema/           # Validation schemas
│   └── index.ts      # Data schema definitions
└── index.ts          # Main exports
```

## Usage

### Basic Data Processing

```typescript
import {
  createJsonProcessor,
  createYamlProcessor,
  createCsvProcessor,
} from "@docen/data";

// Process JSON
const jsonProcessor = createJsonProcessor();
const jsonResult = await jsonProcessor.process('{"name": "John", "age": 30}');

// Process YAML
const yamlProcessor = createYamlProcessor();
const yamlResult = await yamlProcessor.process("name: John\nage: 30");

// Process CSV
const csvProcessor = createCsvProcessor();
const csvResult = await csvProcessor.process("name,age\nJohn,30");
```

### Format Conversion

```typescript
import {
  createJsonToYamlProcessor,
  createCsvToJsonProcessor,
  createYamlToXmlProcessor,
} from "@docen/data";

// JSON to YAML
const jsonToYaml = createJsonToYamlProcessor();
const yamlOutput = await jsonToYaml.process('{"name": "John"}');

// CSV to JSON
const csvToJson = createCsvToJsonProcessor();
const jsonOutput = await csvToJson.process("name,age\nJohn,30\nJane,25");

// YAML to XML
const yamlToXml = createYamlToXmlProcessor();
const xmlOutput = await yamlToXml.process("name: John\nage: 30");
```

### Schema Validation

```typescript
import { createJsonProcessor } from "@docen/data";

const processor = createJsonProcessor({
  schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      age: { type: "number", minimum: 0 },
    },
    required: ["name", "age"],
  },
  validateOnParse: true,
});

// Validation happens automatically during processing
const result = await processor.process('{"name": "John", "age": 30}');
```

### CSV Configuration

```typescript
import { createCsvProcessor } from "@docen/data";

const csvProcessor = createCsvProcessor({
  delimiter: ";",
  quote: '"',
  escape: "\\",
  headers: true,
  skipEmptyLines: true,
});

const result = await csvProcessor.process("name;age\nJohn;30\nJane;25");
```

### XML with XAST

```typescript
import { createXmlProcessor } from "@docen/data";

const xmlProcessor = createXmlProcessor({
  namespace: true,
  preserveComments: true,
  preserveWhitespace: false,
});

const result = await xmlProcessor.process(`
<root xmlns="http://example.com">
  <item id="1">Value</item>
</root>
`);
```

## Supported Features

### JSON Features

- **Standard JSON**: Full JSON specification support
- **JSON5**: Comments, trailing commas, unquoted keys
- **Schema Validation**: JSON Schema validation
- **Type Coercion**: Automatic type conversion

### YAML Features

- **YAML 1.2**: Full YAML specification
- **Multi-document**: Support for document separators
- **Comments**: Preserve comments during processing
- **Custom Tags**: Support for custom YAML tags

### CSV Features

- **Configurable Delimiters**: Comma, semicolon, tab, custom
- **Header Detection**: Automatic header row detection
- **Quote Handling**: Proper quote and escape handling
- **Type Inference**: Automatic data type detection

### XML Features

- **Namespace Support**: Full XML namespace handling
- **XAST Integration**: Uses xast for XML processing
- **Comment Preservation**: Optional comment preservation
- **Validation**: DTD and schema validation support

## Type System

### Data AST Types

```typescript
// Generic data AST
interface DataNode extends Node {
  type: "data";
  format: "json" | "yaml" | "csv" | "xml";
  value: unknown;
}

// CSV-specific types
interface CsvRow extends Node {
  type: "csvRow";
  cells: CsvCell[];
}

interface CsvCell extends Node {
  type: "csvCell";
  value: string | number | boolean | null;
}

// XML uses standard xast types
```

### Processor Options

```typescript
interface JsonProcessorOptions {
  schema?: JSONSchema;
  validateOnParse?: boolean;
  allowJSON5?: boolean;
  reviver?: (key: string, value: unknown) => unknown;
}

interface CsvProcessorOptions {
  delimiter?: string;
  quote?: string;
  escape?: string;
  headers?: boolean | string[];
  skipEmptyLines?: boolean;
}

interface YamlProcessorOptions {
  schema?: string;
  allowDuplicateKeys?: boolean;
  version?: "1.1" | "1.2";
  customTags?: YamlTag[];
}
```

## Dependencies

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `json5`: JSON5 parser and serializer (v2.2.3)
- `ofetch`: Better fetch API from UnJS (v1.4.1)
- `papaparse`: CSV parser and serializer (v5.5.2)
- `unified-engine`: Unified.js processing engine (v11.2.2)
- `xast`: XML AST types (v0.1.217)
- `xast-util-from-xml`: Create xast from XML (v4.0.0)
- `xast-util-to-xml`: Create XML from xast (v4.0.0)
- `yaml`: YAML parser and serializer (v2.7.1)

### Optional Dependencies

- `ajv`: JSON Schema validation
- `xml2js`: Alternative XML processing

## Design Principles

### 1. Pure Data Processing

- No collaboration features
- Focus on data transformation only
- Standard unified.js patterns

### 2. Format Agnostic

- Consistent API across all data formats
- Unified data AST representation
- Easy format conversion

### 3. Schema-Driven

- Optional schema validation
- Type-safe data handling
- Automatic type inference

### 4. Performance Optimized

- Streaming parsers where possible
- Memory-efficient processing
- Configurable validation

## Integration

This package integrates with other Docen packages:

- **@docen/core**: Uses core processor interface and types
- **@docen/office**: Receives XLSX/ODS content for processing
- **@docen/containers**: Content processing for .dtcx containers

**Note**: Collaboration features are handled separately in `@docen/containers` - this package remains collaboration-free.

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
