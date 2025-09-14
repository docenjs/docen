# OOXML AST Design Proposal

## Overview

This document describes the design proposal for an Office Open XML (OOXML) AST tool library based on the unified ecosystem, following the standard patterns and best practices of the unist ecosystem.

## Design Philosophy

### Core Principles

1. **Type Safety**: Provide complete type support based on TypeScript
2. **Single Responsibility**: Each package is responsible for only one specific function
3. **Composability**: Tool functions can be freely combined and used
4. **Standardized Interfaces**: Follow the unist ecosystem's API design patterns
5. **Don't Reinvent the Wheel**: Reuse existing unist toolkits as much as possible

### Reference Standards

- Based on [`xast`](https://github.com/syntax-tree/xast) XML AST specification
- Follow the type extension patterns of [`hast`](https://github.com/syntax-tree/hast)
- Compatible with [`unist-util-*`](https://github.com/syntax-tree/unist-util-visit) series of toolkits

## Architecture Design

### Package Structure

```
@docen/
├── ooxast/                     # Shared base AST package
│   ├── src/
│   │   ├── index.ts           # Main export
│   │   ├── types.ts           # Core type definitions (based on xast extensions)
│   │   ├── drawingml.ts       # DrawingML type definitions
│   │   └── constants.ts       # Shared constants
│   └── package.json
│
├── wmlast/                     # WordprocessingML AST
│   ├── src/
│   │   ├── index.ts           # Based on ooxast extension
│   │   ├── types.ts           # WML-specific types
│   │   └── constants.ts       # WML namespaces
│   └── package.json
│
├── smlast/                     # SpreadsheetML AST
│   ├── src/
│   │   ├── index.ts           # Based on ooxast extension
│   │   ├── types.ts           # SML-specific types
│   │   └── constants.ts       # SML namespaces
│   └── package.json
│
├── pmlast/                     # PresentationML AST
│   ├── src/
│   │   ├── index.ts           # Based on ooxast extension
│   │   ├── types.ts           # PML-specific types
│   │   └── constants.ts       # PML namespaces
│   └── package.json
│
└── *-util-*/                   # Tool packages
    ├── ooxast-util-is/         # Shared type checking (including DrawingML)
    ├── wmlast-util-is/         # WML type checking
    ├── wmlast-util-from-docx/  # DOCX parsing
    ├── wmlast-util-to-docx/    # DOCX generation
    ├── smlast-util-is/         # SML type checking
    ├── smlast-util-from-xlsx/  # XLSX parsing
    ├── smlast-util-to-xlsx/    # XLSX generation
    ├── pmlast-util-is/         # PML type checking
    ├── pmlast-util-from-pptx/  # PPTX parsing
    └── pmlast-util-to-pptx/    # PPTX generation
```

### Package Responsibilities

#### ooxast (Shared Base Package)

- **Responsibility**: Provide basic types and tools shared by all OOXML formats
- **Includes**:
  - DrawingML type definitions (pictures, shapes, tables, etc.)
  - Basic OOXML node types
  - Shared constants (namespaces, etc.)
  - ContentMap extension mechanism

#### wmlast (WordprocessingML)

- **Responsibility**: Word document-specific AST type definitions
- **Includes**:
  - Paragraphs (`w:p`)
  - Tables (`w:tbl`)
  - Text runs (`w:r`)
  - Style system
  - Headers and footers
  - Sections

#### smlast (SpreadsheetML)

- **Responsibility**: Excel document-specific AST type definitions
- **Includes**:
  - Worksheets
  - Rows and cells
  - Formulas
  - Styles

#### pmlast (PresentationML)

- **Responsibility**: PowerPoint document-specific AST type definitions
- **Includes**:
  - Slides (`p:sld`)
  - Masters
  - Layouts
  - Transition effects

#### Tool Packages

- **Naming Convention**: `[astname]-util-[function]`
- **Responsibility**: Provide tool functions for specific functionality
- **Principle**: Do one thing, and do it well

### API Design Principles

- Type checking functions use type predicates: `is[TypeName](node): node is TypeName`
- Conversion functions support Buffer and string input
- Compatible with all `unist-util-*` toolkits

## Type System Design

### ooxast Core Types

```typescript
// Based on xast extensions
export interface Node extends XastNode {
  data?: Data | undefined;
}

export interface Data extends XastData {}

// ContentMap mechanism
export interface RootContentMap extends XastRootContentMap {
  "pic:pic": DrawingMLPicture;
}

export type RootContent = RootContentMap[keyof RootContentMap];
```

### Specific ML Extensions

```typescript
// wmlast extension
export interface RootContentMap extends OoxastRootContentMap {
  "w:p": WMLParagraph;
  "w:tbl": WMLTable;
  "w:r": WMLRun;
  "w:t": WMLText;
}
```

## Tool Function Design

### Type Checking Tools

```typescript
// ooxast-util-is
export function isDrawingMLPicture(node: Node): node is DrawingMLPicture;
export function isDrawingMLShape(node: Node): node is DrawingMLShape;

// wmlast-util-is
export function isWmlParagraph(node: Node): node is WMLParagraph;
export function isWmlTable(node: Node): node is WMLTable;
```

### Format Conversion Tools

```typescript
// wmlast-util-from-docx
export function fromDocx(buffer: Buffer): OOXMLRoot;

// wmlast-util-to-docx
export function toDocx(tree: OOXMLRoot): Buffer;
```

## Usage Examples

### Basic Usage

```typescript
// Processing Word documents
import { fromDocx } from "wmlast-util-from-docx";
import { isWmlParagraph } from "wmlast-util-is";
import { isDrawingMLPicture } from "ooxast-util-is";
import { visit } from "unist-util-visit";

// Parse DOCX file
const docxTree = fromDocx(fileBuffer);

// Traverse and process nodes
visit(docxTree, (node) => {
  if (isWmlParagraph(node)) {
    // Process paragraph
  } else if (isDrawingMLPicture(node)) {
    // Process picture (from ooxast shared types)
  }
});
```

### Composite Tool Usage

```typescript
// Combining multiple tool packages
import { visit } from "unist-util-visit";
import { select } from "unist-util-select";
import { toString } from "ooxast-util-to-string";

// Find all tables and extract text
const tables = selectAll("w:tbl", docxTree);
tables.forEach((table) => {
  const text = toString(table);
  console.log("Table content:", text);
});
```

## Naming Conventions

### Package Naming

- **AST specification packages**: `[mlname]ast` (such as `wmlast`, `smlast`, `pmlast`)
- **Tool packages**: `[astname]-util-[function]` (such as `wmlast-util-from-docx`)
- **Shared base**: `ooxast`

### Function Naming

Follow the verb-oriented naming of the unist ecosystem:

- **Type checking**: `is[TypeName]` (such as `isWmlParagraph`)
- **Search functionality**: `find[Object]` (such as `findTables`)
- **Conversion functionality**: `from[Format]`/`to[Format]` (such as `fromDocx`)

## Compatibility

### unist Ecosystem

- ✅ Compatible with all `unist-util-*` toolkits
- ✅ Supports `unist-util-visit` traversal
- ✅ Supports `unist-util-select` selectors
- ✅ Supports `unist-util-find` search

### Type Safety

- ✅ Complete TypeScript type support
- ✅ Type extensions based on xast
- ✅ ContentMap type registration mechanism
- ✅ Generic type inference

## Tool Function Design

## References

- [unist ecosystem](https://github.com/syntax-tree/unist)
- [xast specification](https://github.com/syntax-tree/xast)
- [hast type definitions](https://github.com/syntax-tree/hast)
- [awesome-syntax-tree](https://github.com/syntax-tree/awesome-syntax-tree)
- [Office Open XML specification](http://officeopenxml.com/)

---

_This design document follows the design philosophy and best practices of the unified ecosystem, ensuring compatibility and extensibility with existing tools._
