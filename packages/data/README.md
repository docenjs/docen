# @docen/data

![npm version](https://img.shields.io/npm/v/@docen/data)
![npm downloads](https://img.shields.io/npm/dw/@docen/data)
![npm license](https://img.shields.io/npm/l/@docen/data)

> Data processing module for Docen - Handles data formats like CSV, JSON, YAML, and XML

## Overview

`@docen/data` is the data processing module of the Docen document processing library, specifically designed for handling structured data formats such as CSV, JSON, YAML, and XML. This module provides parsing, conversion, and content extraction capabilities for these data formats.

## Features

- 📊 **Multi-format Support**: Process structured data formats like CSV, JSON, YAML, and XML
- 🔄 **Format Conversion**: Convert between different data formats
- 📝 **Data Extraction**: Extract data content from supported formats
- 📈 **Data Transformation**: Provide data transformation and processing tools
- 🔍 **Content Analysis**: Analyze data structure and content
- 🎯 **Type Safety**: Full TypeScript support with strict type checking
- ⚡ **Performance**: Optimized for large data sets
- 🔒 **Error Handling**: Comprehensive error handling and validation

## Installation

```bash
# npm
$ npm install @docen/data

# yarn
$ yarn add @docen/data

# pnpm
$ pnpm add @docen/data
```

## Usage

### CSV Processing

```ts
import { CSVParser, CSVGenerator } from "@docen/data";

// Create CSV parser
const parser = new CSVParser();

// Parse CSV document
const document = await parser.parse(csvData, {
  delimiter: ",",
  hasHeader: true,
  quote: '"',
  escape: "\\",
  detectBOM: true,
});

// Convert to JSON using generator
const generator = new CSVGenerator();
const result = await generator.generate(document, {
  delimiter: ",",
  quote: '"',
  escape: "\\",
  includeHeader: true,
});
```

### JSON Processing

```ts
import { JSONParser, JSONGenerator } from "@docen/data";

// Create JSON parser
const parser = new JSONParser();

// Parse JSON document
const document = await parser.parse(jsonData, {
  preserveComments: true,
  handleSpecialValues: true,
});

// Generate JSON output
const generator = new JSONGenerator();
const result = await generator.generate(document, {
  pretty: true,
  indentSize: 2,
  handleSpecialValues: true,
});
```

### YAML Processing

```ts
import { YAMLParser, YAMLGenerator } from "@docen/data";

// Create YAML parser
const parser = new YAMLParser();

// Parse YAML document
const document = await parser.parse(yamlData, {
  preserveComments: true,
  handleSpecialValues: true,
});

// Generate YAML output
const generator = new YAMLGenerator();
const result = await generator.generate(document, {
  preserveComments: true,
  handleSpecialValues: true,
  indentSize: 2,
});
```

### XML Processing

```ts
import { XMLParser, XMLGenerator } from "@docen/data";

// Create XML parser
const parser = new XMLParser();

// Parse XML document
const document = await parser.parse(xmlData, {
  preserveComments: true,
  preserveAttributes: true,
});

// Generate XML output
const generator = new XMLGenerator();
const result = await generator.generate(document, {
  pretty: true,
  indentSize: 2,
  preserveComments: true,
});
```

## Supported Formats

| Format | Read | Write | Conversion Targets | Metadata | Features                      |
| ------ | ---- | ----- | ------------------ | -------- | ----------------------------- |
| CSV    | ✅   | ✅    | JSON, YAML, XML    | ✅       | Delimiter, Quote, Escape, BOM |
| JSON   | ✅   | ✅    | CSV, YAML, XML     | ✅       | Comments, Special Values      |
| YAML   | ✅   | ✅    | CSV, JSON, XML     | ✅       | Comments, Special Values      |
| XML    | ✅   | ✅    | CSV, JSON, YAML    | ✅       | Comments, Attributes          |

## API Reference

### Processors

#### CSV Processor

- `CSVParser` - CSV data parser with support for custom delimiters, quotes, and escape characters
- `CSVGenerator` - CSV data generator with formatting options

#### JSON Processor

- `JSONParser` - JSON data parser with support for comments and special values
- `JSONGenerator` - JSON data generator with pretty printing options

#### YAML Processor

- `YAMLParser` - YAML data parser with support for comments and special values
- `YAMLGenerator` - YAML data generator with formatting options

#### XML Processor

- `XMLParser` - XML data parser with support for comments and attributes
- `XMLGenerator` - XML data generator with pretty printing options

### Common Methods

#### Parser Interface

- `canParse(source, mimeType, extension)` - Check if processor can handle the source
- `parse(source, options)` - Parse data into AST
- `supportedInputTypes` - List of supported input MIME types
- `supportedInputExtensions` - List of supported input file extensions

#### Generator Interface

- `canGenerate(mimeType, extension)` - Check if processor can generate the target format
- `generate(document, options)` - Generate data from AST
- `supportedOutputTypes` - List of supported output MIME types
- `supportedOutputExtensions` - List of supported output file extensions

### Common Options

#### Parser Options

- `preserveComments` - Whether to preserve comments in the parsed data
- `handleSpecialValues` - Whether to handle special values (NaN, Infinity, etc.)
- `preserveAttributes` - Whether to preserve XML attributes
- `detectBOM` - Whether to detect and handle BOM in CSV files

#### Generator Options

- `pretty` - Whether to format output with proper indentation
- `indentSize` - Number of spaces for indentation
- `includeHeader` - Whether to include header row in CSV output
- `delimiter` - Field delimiter for CSV output
- `quote` - Quote character for CSV output
- `escape` - Escape character for CSV output

## Examples

### Converting CSV to JSON

```ts
import { CSVParser, JSONGenerator } from "@docen/data";

const csvParser = new CSVParser();
const jsonGenerator = new JSONGenerator();

// Parse CSV
const document = await csvParser.parse(csvData, {
  hasHeader: true,
  delimiter: ",",
  quote: '"',
});

// Generate JSON
const result = await jsonGenerator.generate(document, {
  pretty: true,
  indentSize: 2,
});
```

### Converting JSON to YAML

```ts
import { JSONParser, YAMLGenerator } from "@docen/data";

const jsonParser = new JSONParser();
const yamlGenerator = new YAMLGenerator();

// Parse JSON
const document = await jsonParser.parse(jsonData, {
  preserveComments: true,
});

// Generate YAML
const result = await yamlGenerator.generate(document, {
  preserveComments: true,
  indentSize: 2,
});
```

## Error Handling

All processors include comprehensive error handling:

```ts
try {
  const document = await parser.parse(data);
} catch (error) {
  console.error("Parsing error:", error);
  // Handle error appropriately
}
```

## License

- [MIT](../../LICENSE) &copy; [Demo Macro](https://imst.xyz/)
