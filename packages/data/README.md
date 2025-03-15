# @docen/data

![npm version](https://img.shields.io/npm/v/@docen/data)
![npm downloads](https://img.shields.io/npm/dw/@docen/data)
![npm license](https://img.shields.io/npm/l/@docen/data)

> Data processing module for Docen - Handles data formats like XLSX, CSV, JSON, YAML, and XML

## Overview

`@docen/data` is the data processing module of the Docen document processing library, specifically designed for handling structured data formats such as XLSX, CSV, JSON, YAML, and XML. This module provides parsing, conversion, and content extraction capabilities for various data formats.

## Features

- 📊 **Multi-format Support**: Process structured data formats like XLSX, CSV, JSON, YAML, XML
- 🔄 **Format Conversion**: Convert between different data formats
- 📝 **Data Extraction**: Extract data content from various formats
- 📈 **Data Transformation**: Provide data transformation and processing tools
- 🔍 **Content Analysis**: Analyze data structure and content

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

### XLSX Processing

```ts
import { XLSXProcessor } from "@docen/data";

// Create XLSX processor
const processor = new XLSXProcessor();

// Parse XLSX document
const document = await processor.parse(xlsxData);

// Convert to CSV
const result = await processor.convert(xlsxData, "output.csv");

// Get metadata
const metadata = await processor.getMetadata(xlsxData);
```

### CSV Processing

```ts
import { CSVProcessor } from "@docen/data";

// Create CSV processor
const processor = new CSVProcessor();

// Parse CSV document
const document = await processor.parse(csvData, {
  delimiter: ",",
  header: true,
});

// Convert to JSON
const result = await processor.convert(csvData, "output.json");
```

### JSON Processing

```ts
import { JSONProcessor } from "@docen/data";

// Create JSON processor
const processor = new JSONProcessor();

// Parse JSON document
const document = await processor.parse(jsonData);

// Convert to YAML
const result = await processor.convert(jsonData, "output.yaml");
```

## Supported Formats

| Format | Read | Write | Conversion Targets | Metadata |
| ------ | ---- | ----- | ------------------ | -------- |
| XLSX   | ✅   | ✅    | CSV, JSON          | ✅       |
| CSV    | ✅   | ✅    | JSON, XLSX         | ✅       |
| JSON   | ✅   | ✅    | CSV, YAML, XML     | ✅       |
| YAML   | ✅   | ✅    | JSON, XML          | ✅       |
| XML    | ✅   | ✅    | JSON, YAML         | ✅       |

## API Reference

### Processors

- `XLSXProcessor` - XLSX data processor
- `CSVProcessor` - CSV data processor
- `JSONProcessor` - JSON data processor
- `YAMLProcessor` - YAML data processor
- `XMLProcessor` - XML data processor

### Common Methods

- `parse(source, options)` - Parse data into AST
- `stringify(document, options)` - Convert AST to string
- `convert(source, target, options)` - Convert data format
- `getMetadata(source, options)` - Get data metadata

## License

- [MIT](../../LICENSE) &copy; [Demo Macro](https://imst.xyz/)
