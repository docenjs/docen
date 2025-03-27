# Docen Project Requirements

## Project Overview

Docen is a universal document conversion and processing library that supports parsing, conversion, and processing of multiple file formats. It is designed to run in any JavaScript runtime environment, including browsers, Node.js, Deno, Cloudflare Workers, and Edge Functions.

## Architecture Design

### Modular Structure

The project follows a modular design organized by content essence and user needs:

1. **Core Module (@docen/core)**

   - Defines universal AST (Abstract Syntax Tree) structure
     - Contains only common, universally applicable node types
     - Provides extension mechanisms for specialized node types
   - Implements processor interfaces and abstract classes
   - Defines registry for managing processors and other components
   - Defines file types and MIME handling
   - Provides AST traversal and manipulation utilities

2. **Document Processing (@docen/document)**

   - Handles text-based documents: TXT, DOCX, RTF, PDF, Markdown, HTML
   - Converts between different text formats
   - Extracts metadata and content
   - Extends core AST with document-specific node types

3. **Data Processing (@docen/data)**

   - Processes structured data: XLSX, CSV, JSON, YAML, XML
   - Converts between different data formats
   - Provides data transformation utilities
   - Extends core AST with data-specific node types

4. **Image Processing (@docen/image)**

   - Handles image files
   - Provides OCR capabilities
   - Supports metadata extraction
   - Extends core AST with image-specific node types

5. **Audio Processing (@docen/audio)**

   - Processes audio files
   - Extracts metadata
   - Provides format conversion
   - Extends core AST with audio-specific node types

6. **Video Processing (@docen/video)**

   - Handles video files
   - Extracts metadata and frames
   - Supports format conversion
   - Extends core AST with video-specific node types

7. **Presentation & Graphics (@docen/presentation)**

   - Processes PPTX, PPT, charts
   - Converts to other formats
   - Extracts content and structure
   - Extends core AST with presentation-specific node types

8. **Archive & Container (@docen/archive)**

   - Handles ZIP, RAR, EPUB, OOXML
   - Extracts contents
   - Provides navigation utilities
   - Extends core AST with archive-specific node types

9. **Main Package (docen)**
   - Serves as the entry point for the entire library
   - Provides unified API
   - Implements CLI functionality
   - Manages package dependencies

### Code Organization

Each package should maintain a consistent internal structure:

```
packages/[package-name]/
├── src/
│   ├── ast/             # AST extensions specific to this package
│   │   ├── [format1]/   # AST nodes for specific format
│   │   └── [format2]/
│   ├── processors/      # Format-specific processors
│   │   ├── [format1]/   # Processors for specific format
│   │   │   ├── parser.ts
│   │   │   ├── generator.ts
│   │   │   └── index.ts
│   │   └── [format2]/
│   ├── utils/           # Utility functions specific to this package
│   └── index.ts         # Main entry point
├── test/                # Tests
├── README.md            # Package documentation
└── package.json         # Package metadata
```

For the core package, the structure should be:

```
packages/core/
├── src/
│   ├── ast/             # Core AST definitions
│   │   ├── base.ts      # Base node types
│   │   ├── document/    # Common document node types
│   │   ├── index.ts     # Re-exports and type definitions
│   │   └── README.md    # AST documentation
│   ├── processor/       # Processor interfaces and implementations
│   │   ├── interfaces.ts
│   │   ├── abstract.ts
│   │   └── index.ts
│   ├── registry/        # Registry system for component management
│   │   ├── interfaces.ts
│   │   ├── processor-registry.ts
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── mime/        # MIME type handling
│   │   ├── stream/      # Stream processing
│   │   └── visitor/     # Node visitor pattern
│   └── index.ts         # Main entry point
├── test/                # Tests
├── README.md            # Package documentation
└── package.json         # Package metadata
```

### Universal AST Design

The universal AST should be designed to represent any document's content in a structured, traversable format that can be transformed between different document types. The core AST should focus on common node types, while specialized node types should be defined in their respective packages.

#### Core AST Node Types

```typescript
// Core AST node types
type NodeType =
  // Essential node types
  | "root" // Document root
  | "section" // Document section
  | "paragraph" // Text paragraph
  | "heading" // Heading with level
  | "text" // Plain text content
  | "list" // Ordered or unordered list
  | "listItem" // List item
  | "table" // Basic table structure
  | "tableRow" // Table row
  | "tableCell" // Table cell
  | "image" // Basic image
  | "link" // Hyperlink
  | "code" // Code block
  | "inlineCode" // Inline code
  | "blockquote" // Quoted content
  | "thematicBreak" // Horizontal rule
  | "emphasis" // Emphasized text
  | "strong" // Strong text
  | "break" // Line break
  | "comment"; // Comment

// Base node interface
interface Node {
  type: NodeType;
  data?: Record<string, unknown>; // Custom data
  position?: Position; // Source position information
  style?: Record<string, unknown>; // Style information
  lang?: string; // Language information
  attributes?: Record<string, string>; // HTML-like attributes
}

// Position tracking for source mapping
interface Position {
  start: Point;
  end: Point;
  source?: string; // Source identifier
}

interface Point {
  line: number; // 1-indexed line number
  column: number; // 1-indexed column number
  offset?: number; // 0-indexed character offset
}

// Parent node with children
interface Parent extends Node {
  children: Node[];
}

// Root document node
interface Root extends Parent {
  type: "root";
  metadata?: Record<string, unknown>; // Document metadata
}
```

#### AST Extension Mechanism

Specialized packages should extend the core AST with package-specific node types:

```typescript
// In @docen/data
import type { NodeType as CoreNodeType, Node } from "@docen/core";

// Extend the core NodeType
export type DataNodeType =
  | CoreNodeType
  | "dataTable"
  | "dataRow"
  | "dataCell"
  | "spreadsheet";

// Extend the core Node type
export interface DataNode extends Node {
  type: DataNodeType;
}
```

### Processor Interface

Processors should follow a consistent interface for parsing, transforming, and generating content:

```typescript
interface Processor {
  // Processor identification
  id: string;
  name: string;

  // Format support
  supportedInputTypes: string[];
  supportedOutputTypes: string[];
  supportedInputExtensions: string[];
  supportedOutputExtensions: string[];

  // Unsupported node handling
  handleUnsupportedNode(
    node: Node,
    context?: Record<string, unknown>,
  ): UnsupportedNodeHandling;
}

enum UnsupportedNodeHandling {
  IGNORE = "ignore", // Ignore the node completely
  KEEP_AS_IS = "keep-as-is", // Keep the node but don't process its content
  CONVERT = "convert", // Try to convert to a supported type
  REPLACE = "replace", // Replace with a placeholder
  ERROR = "error", // Throw an error
}

interface Parser extends Processor {
  // Parse content into AST
  parse(source: Source, options?: ProcessorOptions): Promise<Document>;

  // Check if this parser can handle the given source
  canParse(
    source: Source,
    mimeType?: string,
    extension?: string,
  ): Promise<boolean>;

  // Optionally parse only a specific node type
  parseNodeType?(
    source: Source,
    nodeType: string,
    options?: ProcessorOptions,
  ): Promise<Node | null>;

  // Support for streaming parsing
  createIncrementalParser?(options?: ProcessorOptions): {
    input: WritableStream<Source>;
    output: ReadableStream<Node>;
  };
}

interface Generator extends Processor {
  // Generate output from AST
  generate(
    document: Document,
    options?: ProcessorOptions,
  ): Promise<ConversionResult>;

  // Check if this generator can produce the requested format
  canGenerate(mimeType?: string, extension?: string): boolean;

  // Optionally generate output from a specific node
  generateFromNode?(
    node: Node,
    options?: ProcessorOptions,
  ): Promise<ConversionResult | null>;

  // Support for streaming generation
  createIncrementalGenerator?(options?: ProcessorOptions): {
    input: WritableStream<Node>;
    output: ReadableStream<Uint8Array | string>;
  };
}

// Full processor that combines Parser and Generator capabilities
interface FullProcessor extends Parser, Generator {}

// Source and output types
type Source = Uint8Array | string;

interface ConversionResult {
  content: Uint8Array | string;
  mimeType?: string;
  extension?: string;
}

// Processor options
interface ProcessorOptions {
  [key: string]: unknown;
}

// Common processor options
interface CommonProcessorOptions extends ProcessorOptions {
  onProgress?: ProgressCallback;
  preservePosition?: boolean;
  preserveFormat?: boolean;
  extractMetadata?: boolean;
  extractImages?: boolean;
  mode?: "sync" | "async" | "streaming";
}

// Progress reporting
interface ProgressInfo {
  progress: number;
  totalTime?: number;
  status?: string;
  operation?: string;
}

type ProgressCallback = (info: ProgressInfo) => void;

// Document representation
interface Document {
  metadata: Record<string, unknown>;
  content: Root;
}
```

### Registry System

The registry system provides a way to discover and manage processors and other components:

```typescript
interface Registry<T> {
  // Register a component
  register(component: T): void;

  // Get all registered components
  getAll(): T[];

  // Clear all registered components
  clear(): void;
}

interface ProcessorRegistry extends Registry<Processor> {
  // Register a parser
  registerParser(parser: Parser): void;

  // Register a generator
  registerGenerator(generator: Generator): void;

  // Register a full processor
  registerProcessor(processor: FullProcessor): void;

  // Find parser for a specific source
  findParser(
    source: Source,
    mimeType?: string,
    extension?: string,
  ): Promise<Parser | undefined>;

  // Find generator for a specific format
  findGenerator(mimeType?: string, extension?: string): Generator | undefined;

  // Find a full processor for conversion
  findFullProcessor(
    source: Source,
    sourceMimeType?: string,
    sourceExtension?: string,
    targetMimeType?: string,
    targetExtension?: string,
  ): Promise<FullProcessor | undefined>;

  // Get all registered parsers
  getParsers(): Parser[];

  // Get all registered generators
  getGenerators(): Generator[];

  // Get all registered full processors
  getFullProcessors(): FullProcessor[];
}
```

### Abstract Processor Classes

Abstract classes should provide common functionality:

```typescript
abstract class AbstractProcessor implements Processor {
  abstract id: string;
  abstract name: string;
  abstract supportedInputTypes: string[];
  abstract supportedOutputTypes: string[];
  abstract supportedInputExtensions: string[];
  abstract supportedOutputExtensions: string[];

  // Protected cache for performance optimization
  protected cache = new Map<string, any>();

  // Default progress callback
  protected defaultProgressCallback: ProgressCallback = () => {};

  // Handle unsupported nodes
  handleUnsupportedNode(
    node: Node,
    context?: Record<string, unknown>,
  ): UnsupportedNodeHandling {
    return UnsupportedNodeHandling.CONVERT;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Helper for progress reporting
  protected reportProgress(
    progress: number,
    callback: ProgressCallback,
    status?: string,
    operation?: string,
  ): void {
    callback({
      progress,
      status,
      operation,
    });
  }
}

abstract class AbstractParser extends AbstractProcessor implements Parser {
  // Abstract method that must be implemented
  abstract parse(source: Source, options?: ProcessorOptions): Promise<Document>;

  // Default implementation
  async canParse(
    source: Source,
    mimeType?: string,
    extension?: string,
  ): Promise<boolean> {
    // Check MIME type and extension, then try to detect format
    if (mimeType && this.supportedInputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedInputExtensions.includes(extension)) {
      return true;
    }

    return this.detectFormat(source);
  }

  // Default implementation for parseNodeType
  async parseNodeType(
    source: Source,
    nodeType: string,
    options?: ProcessorOptions,
  ): Promise<Node | null> {
    const document = await this.parse(source, options);
    // Find node with the requested type
    return this.findNodeByType(document.content, nodeType);
  }

  // Content format detection
  protected abstract detectFormat(source: Source): Promise<boolean>;

  // Helper for finding nodes by type
  protected findNodeByType(node: Node, nodeType: string): Node | null {
    if (node.type === nodeType) {
      return node;
    }

    if ("children" in node && Array.isArray((node as any).children)) {
      for (const child of (node as any).children) {
        const found = this.findNodeByType(child, nodeType);
        if (found) {
          return found;
        }
      }
    }

    return null;
  }
}

abstract class AbstractGenerator
  extends AbstractProcessor
  implements Generator
{
  // Abstract method that must be implemented
  abstract generate(
    document: Document,
    options?: ProcessorOptions,
  ): Promise<ConversionResult>;

  // Default implementation
  canGenerate(mimeType?: string, extension?: string): boolean {
    if (mimeType && this.supportedOutputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedOutputExtensions.includes(extension)) {
      return true;
    }

    return false;
  }

  // Default implementation for generateFromNode
  async generateFromNode(
    node: Node,
    options?: ProcessorOptions,
  ): Promise<ConversionResult | null> {
    // Create a minimal document containing just this node
    const document: Document = {
      metadata: {},
      content: {
        type: "root",
        children: [node as any],
      },
    };

    // Generate from the minimal document
    return this.generate(document, options);
  }

  // Helper for converting unsupported nodes
  protected convertNode(
    node: Node,
    targetType: string,
    context?: Record<string, unknown>,
  ): Node | null {
    // Default implementation: conversion not supported
    return null;
  }
}
```

### Conversion Pipeline

The conversion pipeline should handle the flow from input to output:

```typescript
interface ConversionPipeline {
  // Add processors to the pipeline
  use(processor: Processor): this;

  // Process a source through the pipeline
  process(
    source: Source,
    options?: ProcessorOptions,
  ): Promise<ConversionResult>;

  // Get the intermediate AST (for debugging)
  getAST(): Document | null;

  // Stream processing support
  createReadStream(source: Source, options?: ProcessorOptions): ReadableStream;
  createWriteStream(options?: ProcessorOptions): WritableStream;
}
```

### Testing Strategy

To ensure reliability, each package should have:

1. **Unit Tests**

   - Test each processor independently
   - Verify AST transformations
   - Check error handling

2. **Integration Tests**

   - Test conversion pipelines
   - Verify format compatibility
   - Test across different environments

3. **Property-Based Tests**

   - Test with randomly generated content
   - Verify round-trip conversion (parse -> generate -> parse)
   - Test with edge cases and unusual inputs

4. **Performance Tests**
   - Benchmark large document processing
   - Measure memory usage
   - Test streaming capabilities

## Implementation Guidelines

### Code Quality & Standards

1. **TypeScript**

   - Use strict typing throughout the codebase
   - Avoid `any` type except when absolutely necessary
   - Use generics for flexible, type-safe code
   - Always provide proper type declarations for exported items

2. **Code Organization**

   - Use consistent directory structure
   - Modularize code into small, cohesive files
   - Use clear, descriptive names for files, types, and functions
   - Keep related functionality together

3. **Code Style**

   - Follow Biome configuration rules
   - Use English for all code and comments
   - Maintain consistent naming conventions
   - Write clear, concise documentation

4. **Dependencies**

   - Minimize third-party dependencies to reduce complexity and security risks
   - Prefer existing dependencies in the codebase
   - Consult before adding new dependencies
   - Implement core functionality using native APIs when possible

5. **Error Handling**

   - Use specific error types with meaningful messages
   - Include context in error objects
   - Provide graceful fallbacks when possible
   - Log detailed error information for debugging

6. **Performance**
   - Design for minimal memory footprint
   - Support streaming processing for large documents
   - Implement lazy loading where beneficial
   - Optimize critical paths

## CLI Tool Design

The CLI tool should provide a user-friendly interface for document conversion:

```typescript
// CLI command structure
interface CLICommand {
  name: string;
  description: string;
  options: CLIOption[];
  action: (args: Record<string, unknown>) => Promise<void>;
}

interface CLIOption {
  name: string;
  alias?: string;
  description: string;
  type: "string" | "boolean" | "number";
  default?: unknown;
  required?: boolean;
}
```

Example CLI usage:

```bash
# Convert PDF to Markdown
docen convert input.pdf output.md

# Extract text from DOCX
docen extract --format=text input.docx > output.txt

# Get metadata from image
docen metadata image.jpg

# Convert Excel to JSON with options
docen convert input.xlsx output.json --sheet=Sheet1 --headers
```

## Development Roadmap

1. **Phase 1: Core Infrastructure**

   - Implement core AST structure
   - Define processor interfaces
   - Create registry system
   - Create basic conversion pipeline
   - Set up project structure and build system

2. **Phase 2: Essential Processors**

   - Implement document processors (PDF, DOCX, Markdown)
   - Implement data processors (JSON, CSV, XLSX)
   - Create basic CLI functionality

3. **Phase 3: Extended Functionality**

   - Add image processing with OCR
   - Implement archive handling
   - Enhance CLI capabilities
   - Add streaming support

4. **Phase 4: Advanced Features**
   - Implement audio/video processors
   - Add presentation processors
   - Create plugin system for custom processors
   - Optimize performance

## AI Development Instructions

When requesting AI assistance for Docen development, use the following structured approach:

```
Task: [Specific development task]
Module: [Target module name]
Context: [Relevant background information]
Requirements:
- [Requirement 1]
- [Requirement 2]
...
Constraints:
- [Constraint 1]
- [Constraint 2]
...
Expected Output: [Description of expected deliverables]
```

Example:

```
Task: Implement PDF to Markdown converter
Module: @docen/document
Context: We need to extract text content from PDF files and convert it to structured Markdown
Requirements:
- Use unpdf for PDF parsing
- Preserve headings, lists, and basic formatting
- Extract and include metadata
- Handle multi-column layouts appropriately
Constraints:
- Must work in both Node.js and browser environments
- Should handle documents up to 100MB
- Must follow the processor interface defined in @docen/core
Expected Output: Complete implementation of PDFProcessor with parse and generate methods
```

This structured approach will help AI understand exactly what needs to be developed and how it fits into the overall Docen architecture.
