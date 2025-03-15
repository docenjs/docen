# Docen Project Requirements

## Project Overview

Docen is a universal document conversion and processing library that supports parsing, conversion, and processing of multiple file formats. It is designed to run in any JavaScript runtime environment, including browsers, Node.js, Deno, Cloudflare Workers, and Edge Functions.

## Architecture Design

### Modular Structure

The project follows a modular design organized by content essence and user needs:

1. **Core Module (@docen/core)**

   - Defines universal AST (Abstract Syntax Tree) structure
   - Implements processor interfaces
   - Defines file types
   - Provides compatibility with Unifiedjs ecosystem

2. **Document Processing (@docen/document)**

   - Handles text-based documents: TXT, DOCX, RTF, PDF, Markdown, HTML
   - Converts between different text formats
   - Extracts metadata and content

3. **Data Processing (@docen/data)**

   - Processes structured data: XLSX, CSV, JSON, YAML, XML
   - Converts between different data formats
   - Provides data transformation utilities

4. **Image Processing (@docen/image)**

   - Handles image files
   - Provides OCR capabilities
   - Supports metadata extraction

5. **Audio Processing (@docen/audio)**

   - Processes audio files
   - Extracts metadata
   - Provides format conversion

6. **Video Processing (@docen/video)**

   - Handles video files
   - Extracts metadata and frames
   - Supports format conversion

7. **Presentation & Graphics (@docen/presentation)**

   - Processes PPTX, PPT, charts
   - Converts to other formats
   - Extracts content and structure

8. **Archive & Container (@docen/archive)**

   - Handles ZIP, RAR, EPUB, OOXML
   - Extracts contents
   - Provides navigation utilities

9. **Main Package (docen)**
   - Serves as the entry point for the entire library
   - Provides unified API
   - Implements CLI functionality

### Universal AST Design

The universal AST should be designed to represent any document's content in a structured, traversable format that can be transformed between different document types.

```typescript
// Core AST node types
type NodeType =
  | "root" // Document root
  | "section" // Document section
  | "paragraph" // Text paragraph
  | "heading" // Heading with level
  | "text" // Plain text content
  | "list" // Ordered or unordered list
  | "listItem" // List item
  | "table" // Table structure
  | "tableRow" // Table row
  | "tableCell" // Table cell
  | "image" // Image with metadata
  | "link" // Hyperlink
  | "code" // Code block
  | "blockquote" // Quoted content
  | "thematicBreak" // Horizontal rule
  | "data" // Structured data
  | "media" // Audio/video content
  | "container" // Generic container
  | "custom"; // Custom node type

// Base node interface
interface Node {
  type: NodeType;
  data?: Record<string, unknown>;
  position?: Position;
  [key: string]: unknown;
}

// Position tracking for source mapping
interface Position {
  start: Point;
  end: Point;
  indent?: number[];
}

interface Point {
  line: number;
  column: number;
  offset?: number;
}

// Parent node with children
interface Parent extends Node {
  children: Node[];
}

// Root document node
interface Root extends Parent {
  type: "root";
  metadata?: Record<string, unknown>;
}
```

### Processor Interface

Processors should follow a consistent interface for parsing, transforming, and generating content:

```typescript
interface Processor<Options = Record<string, unknown>> {
  // Identify if this processor can handle the given file
  canProcess(file: File): boolean;

  // Parse content into AST
  parse(file: File, options?: Options): Promise<Root>;

  // Identify if this processor can generate the given format
  canGenerate(mimeType?: string, extension?: string): boolean;

  // Generate output from AST
  generate(ast: Root, options?: Options): Promise<File>;
}

// File representation
interface File {
  path?: string;
  name?: string;
  extension?: string;
  mimeType?: string;
  content: Buffer | string;
  metadata?: Record<string, unknown>;
}
```

### Conversion Pipeline

The conversion pipeline should handle the flow from input to output:

```typescript
interface ConversionPipeline {
  // Add a processor to the pipeline
  use(processor: Processor): this;

  // Process a file through the pipeline
  process(file: File, options?: Record<string, unknown>): Promise<File>;

  // Get the intermediate AST (for debugging or advanced usage)
  getAST(): Root | null;
}
```

## Implementation Guidelines

### Code Quality & Standards

1. **TypeScript**

   - Use strict typing throughout the codebase
   - Avoid `any` and `unknown` types
   - Define clear interfaces for all components

2. **Code Style**

   - Follow Biome configuration rules
   - Use English for all code comments
   - Maintain consistent naming conventions

3. **Dependencies**
   - Prefer existing dependencies in the codebase
   - Consult before adding new dependencies

### Testing Strategy

1. **Unit Tests**

   - Test each processor independently
   - Verify AST transformations
   - Check error handling

2. **Integration Tests**

   - Test conversion pipelines
   - Verify format compatibility
   - Test across different runtimes

3. **Performance Tests**
   - Benchmark large file processing
   - Measure memory usage
   - Test streaming capabilities

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
