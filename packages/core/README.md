# @docen/core

![npm version](https://img.shields.io/npm/v/@docen/core)
![npm downloads](https://img.shields.io/npm/dw/@docen/core)
![npm license](https://img.shields.io/npm/l/@docen/core)

> Core module for Docen - Defines universal AST structure, processor interfaces, and registry system

## Overview

`@docen/core` is the core module of the Docen document processing library, which defines a unified abstract syntax tree (AST) structure, processor interfaces, and registration system, providing the foundation for all other Docen modules.

## Features

- 🌳 **Universal AST Structure**: Defines a unified document representation format that can describe various document types
- 🔌 **Processor Interfaces**: Provides standardized parser and generator interfaces
- 📋 **Registry System**: Manages available processors and provides lookup mechanisms
- 🛠️ **Utility Functions**: Provides common utility functions for document processing

## Installation

```bash
# npm
$ npm install @docen/core

# yarn
$ yarn add @docen/core

# pnpm
$ pnpm add @docen/core
```

## Usage

### AST Structure

```ts
import { Node, Root, Paragraph, Text } from "@docen/core";

// Create a simple document AST
const document: Root = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Hello, world!",
        },
      ],
    },
  ],
};
```

### Processor Interfaces

```ts
import { Parser, Generator, ProcessorOptions, Source } from "@docen/core";

// Implement a simple parser
class MyParser implements Parser {
  id = "my-parser";
  name = "My Parser";
  supportedInputTypes = ["text/plain"];
  supportedOutputTypes = [];
  supportedInputExtensions = ["txt"];
  supportedOutputExtensions = [];

  async parse(source: Source, options?: ProcessorOptions) {
    // Parsing logic
  }

  async canParse(source: Source, mimeType?: string, extension?: string) {
    // Check if can parse
    return true;
  }
}
```

### Registry System

```ts
import { ProcessorRegistry } from "@docen/core";

// Create registry
const registry = new ProcessorRegistry();

// Register processor
registry.registerParser(new MyParser());

// Find processor
const parser = await registry.findParser(source);
if (parser) {
  const document = await parser.parse(source);
}
```

## API Reference

### Core Types

- `Node` - Base interface for all AST nodes
- `Parent` - Interface for nodes that can have children
- `Root` - Root node of the document AST
- `Paragraph` - Paragraph node
- `Text` - Text node

### Processor Interfaces

- `Processor` - Base interface for all processors
- `Parser` - Interface for document parsers
- `Generator` - Interface for document generators
- `Converter` - Interface for format converters

### Registry

- `ProcessorRegistry` - Registry for managing processors

## License

- [MIT](../../LICENSE) &copy; [Demo Macro](https://imst.xyz/)
