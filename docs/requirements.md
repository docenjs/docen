# Docen Project Requirements

## Project Overview

Docen is a universal document conversion and processing library that supports parsing, transformation, and serialization of multiple file formats with built-in collaborative editing. It integrates the unified.js ecosystem for content transformation with Yjs for real-time collaboration, designed to run in any JavaScript runtime environment, including browsers, Node.js, Deno, Cloudflare Workers, and Edge Functions.

## Architecture Design

### Core Philosophy: Collaboration-First

Docen follows a collaboration-first approach, with Yjs as the foundation for real-time document collaboration integrated with unified.js processing pipeline:

```
| ........................ collaborative process ........................... |
| ... parse ... | ... transform(async) ... | ... stringify ... | ... sync ... |

          +--------+                 +----------+        +----------+
Input ->- | Parser | -> AST -> | -> | Compiler | -> | -> |   Yjs    | -> Collaborative
          +--------+     |          +----------+     |    | Provider |    Document
                         |                           |    +----------+
                   +--------------+            +--------------+
                   | Transformers |            | Synchronizers |
                   +--------------+            +--------------+
```

### Modular Structure

The project follows a modular design that maintains strict compatibility with unified.js while adding collaborative capabilities:

1. **Core Module (@docen/core)**

   - Provides a processor interface that extends unified.js
   - Implements unified-compatible plugin system
   - Creates bidirectional bindings between AST and Yjs
   - Uses unist/unified types with minimal extensions
   - Leverages unified.js utilities (unist-util-\*)
   - Follows unified.js architectural patterns

2. **Document Processing (@docen/document)**

   - Directly uses remark and rehype processors
   - Provides adapters for various syntax trees (mdast, hast, etc.)
   - Enables collaborative editing for text documents
   - Maintains compatibility with existing unified.js plugins
   - Implements specialized processors for different formats
   - Preserves document structure during collaboration
   - _Note: The core `DocenDocument` class and related logic reside within this package._

3. **Data Processing (@docen/data)**

   - Integrates with xast for XML processing
   - Provides collaborative data structure editing
   - Implements unified-based transformation pipelines
   - Supports bidirectional format conversion
   - Preserves data schemas in collaborative context
   - Extends unified for structured data processing

4. **Media Processing (@docen/media)**

   - Extends unified processing to binary content
   - Implements specialized media node types
   - Provides collaborative annotation capabilities
   - Uses chunked binary data handling
   - Integrates with Yjs for real-time updates
   - Maintains unified.js architectural patterns

5. **Office Document Processing (@docen/office)**

   - Handles PDF documents using unpdf from UnJS
   - Processes Office formats (DOCX, XLSX, PPTX)
   - Provides document conversion between formats
   - Implements AST representations for Office documents
   - Enables collaborative editing of Office documents
   - Integrates with Yjs for real-time document updates
   - Maintains cross-platform compatibility

6. **Custom Editor (@docen/editor)**

   - Provides a custom collaborative editor built entirely on Yjs
   - Implements DOM rendering without external editor dependencies
   - Handles input processing, cursor management, and user interactions
   - Supports real-time collaboration with awareness and presence
   - Offers extensible plugin architecture for customization
   - Maintains high performance with large documents and many users

7. **MDOC Format (@docen/mdoc)**

   - Implements enhanced Markdown container format (.mdoc)
   - Uses ZIP-based containers with embedded media support
   - Leverages frontmatter for metadata instead of separate files
   - Provides seamless integration with unified.js ecosystem
   - Supports collaborative editing of container documents
   - Enables bidirectional conversion with standard Markdown

8. **Providers (@docen/providers)**

   - Implements standard Yjs providers
   - Supports subdocument synchronization
   - Handles connection lifecycle and recovery
   - Implements awareness for collaborative presence
   - Provides offline capabilities
   - Creates unified interfaces for different backends

9. **Main Package (docen)**
   - Provides unified.js-compatible factory functions
   - Integrates all modules with consistent APIs
   - Implements automatic processor configuration
   - Supports unified.js plugin discovery
   - Handles cross-platform compatibility
   - Exposes both unified and collaborative interfaces

### Code Organization

Each package follows standard unified.js project structure:

```
packages/[package-name]/
├── src/
│   ├── ast/             # AST type definitions extending unist
│   │   ├── nodes.ts     # Node type definitions aligned with unified.js
│   │   ├── schema.ts    # AST schema validation
│   │   └── index.ts     # Type exports
│   ├── processor/       # unified-compatible processors
│   │   ├── [format].ts  # Format-specific processor
│   │   └── index.ts
│   ├── plugins/         # unified-compatible plugins
│   │   ├── [plugin].ts  # Collaboration implemented as plugins
│   │   └── index.ts
│   ├── yjs/             # Yjs integration adapters
│   │   ├── binding.ts   # AST-Yjs binding strategies
│   │   ├── sync.ts      # Synchronization utilities
│   │   └── index.ts
│   ├── utils/           # Utilities leveraging unist-util-*
│   └── index.ts         # Main entry point
├── test/                # Tests
├── README.md            # Documentation
└── package.json         # Package metadata
```

## Custom Editor Architecture (@docen/editor)

### Core Design Principles

The editor is built entirely from scratch using Yjs as the foundation, without dependencies on existing editor frameworks like ProseMirror or Quill.

```typescript
// Core editor architecture
interface DocenEditor {
  // Core lifecycle
  mount(container: HTMLElement): void;
  unmount(): void;
  destroy(): void;

  // Document management
  loadDocument(doc: Y.Doc): Promise<void>;
  saveDocument(): Promise<Uint8Array>;

  // Editing operations
  insertText(text: string, position?: Position): void;
  deleteRange(range: Range): void;
  formatText(range: Range, formatting: TextFormatting): void;

  // Collaborative features
  setUser(user: UserInfo): void;
  getCursors(): CursorInfo[];
  setProvider(provider: Provider): void;

  // Event system
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, data: any): void;
}

// Editor configuration
interface EditorConfig {
  // Document type support
  format: "markdown" | "mdoc" | "html" | "plaintext";

  // Collaborative settings
  collaborative: boolean;
  ydoc?: Y.Doc;
  awareness?: Awareness;

  // UI configuration
  toolbar?: boolean | ToolbarConfig;
  statusbar?: boolean | StatusbarConfig;
  theme?: string | ThemeConfig;

  // Plugin system
  plugins?: EditorPlugin[];

  // Performance settings
  virtualScrolling?: boolean;
  lazyLoading?: boolean;
  debounceMs?: number;
}
```

### Editor Component Architecture

```typescript
// Main editor class
class DocenEditor {
  // Core components
  private renderer: DOMRenderer;
  private inputHandler: InputHandler;
  private selectionManager: SelectionManager;
  private commandManager: CommandManager;
  private pluginManager: PluginManager;

  // Collaborative components
  private yjsAdapter: YjsAdapter;
  private awarenessManager: AwarenessManager;
  private cursorManager: CursorManager;

  // UI components
  private toolbar?: Toolbar;
  private statusbar?: Statusbar;
  private contextMenu?: ContextMenu;
}

// DOM rendering system
interface DOMRenderer {
  render(root: Node, container: HTMLElement): void;
  update(changes: ChangeEvent[]): void;
  getElementAtPosition(position: Position): HTMLElement | null;
  getPositionFromElement(element: HTMLElement): Position | null;
}

// Input handling system
interface InputHandler {
  handleKeydown(event: KeyboardEvent): boolean;
  handleInput(event: InputEvent): boolean;
  handleComposition(event: CompositionEvent): boolean;
  handlePaste(event: ClipboardEvent): boolean;
  handleDrop(event: DragEvent): boolean;
}

// Selection management
interface SelectionManager {
  getSelection(): Selection | null;
  setSelection(selection: Selection): void;
  updateCursor(position: Position): void;
  selectRange(range: Range): void;
  selectAll(): void;
}
```

### Editor Plugin System

```typescript
interface EditorPlugin {
  name: string;
  version: string;

  // Lifecycle hooks
  init?(editor: DocenEditor): void;
  destroy?(): void;

  // Command registration
  commands?: Record<string, Command>;

  // Key bindings
  keymap?: Record<string, string | Command>;

  // UI extensions
  toolbar?: ToolbarExtension[];
  contextMenu?: ContextMenuExtension[];

  // Event handlers
  onSelectionChange?(selection: Selection): void;
  onDocumentChange?(changes: ChangeEvent[]): void;
  onCursorMove?(cursor: CursorInfo): void;
}

// Example plugin implementations
const BoldPlugin: EditorPlugin = {
  name: "bold",
  version: "1.0.0",
  commands: {
    toggleBold: (editor) =>
      editor.formatText(editor.getSelection(), { bold: true }),
  },
  keymap: {
    "Ctrl+B": "toggleBold",
    "Cmd+B": "toggleBold",
  },
  toolbar: [
    {
      id: "bold",
      title: "Bold",
      icon: "bold-icon",
      command: "toggleBold",
    },
  ],
};
```

## MDOC Format Specification (@docen/mdoc)

### Container Structure

The MDOC format uses a ZIP-based container with the following structure:

```
document.mdoc (ZIP archive)
├── content.md           # Main Markdown content with frontmatter
├── media/               # Embedded media directory
│   ├── images/          # Image files
│   │   ├── cover.jpg
│   │   └── diagram.svg
│   ├── videos/          # Video files
│   │   └── demo.mp4
│   └── attachments/     # Other attachments
│       └── data.json
└── styles.css           # Optional custom styles
```

### Frontmatter Schema

MDOC uses YAML frontmatter embedded in content.md for metadata:

```yaml
---
# Document metadata
title: "Document Title"
author:
  - "Primary Author"
  - "Secondary Author"
created: "2024-01-15T10:30:00Z"
modified: "2024-01-15T15:45:00Z"
version: "1.2.0"
language: "en"

# Content metadata
description: "Brief document description"
keywords: ["keyword1", "keyword2"]
tags: ["tag1", "tag2"]
category: "documentation"

# MDOC specific
mdoc:
  version: "1.0"
  generator: "docen@1.0.0"
  compression: "deflate"

# Custom fields
custom:
  project: "Project Name"
  status: "draft"
  reviewers: ["reviewer1", "reviewer2"]
---
# Document Content

Your Markdown content here...
```

### Media Reference System

```typescript
interface MediaReference {
  // Standard markdown image/link syntax
  path: string; // Relative path within container
  alt?: string; // Alt text for images
  title?: string; // Title attribute

  // MDOC enhancements
  optimize?: boolean; // Auto-optimize media files
  thumbnail?: string; // Thumbnail path for videos
  metadata?: MediaMetadata;
}

interface MediaMetadata {
  size: number; // File size in bytes
  checksum: string; // File integrity hash
  mimeType: string; // MIME type
  dimensions?: {
    // For images/videos
    width: number;
    height: number;
  };
  duration?: number; // For audio/video (seconds)
}
```

### MDOC Processing Pipeline

```typescript
// MDOC parser
interface MdocParser {
  parse(zipData: Uint8Array): Promise<MdocDocument>;
  parseFromPath(filePath: string): Promise<MdocDocument>;

  // Streaming for large files
  parseStream(stream: ReadableStream): Promise<MdocDocument>;
}

// MDOC stringifier
interface MdocStringifier {
  stringify(doc: MdocDocument): Promise<Uint8Array>;
  stringifyToPath(doc: MdocDocument, filePath: string): Promise<void>;

  // Streaming for large outputs
  stringifyStream(doc: MdocDocument): ReadableStream;
}

// MDOC document representation
interface MdocDocument {
  metadata: MdocMetadata;
  content: string; // Markdown content
  media: Map<string, MediaFile>;
  styles?: string; // CSS styles

  // Processing context
  ast?: Node; // Unified AST representation
  ydoc?: Y.Doc; // Yjs document for collaboration
}

interface MdocMetadata {
  // Core fields
  title?: string;
  author?: string | string[];
  created?: Date;
  modified?: Date;
  version?: string;

  // Content fields
  description?: string;
  keywords?: string[];
  tags?: string[];
  language?: string;

  // MDOC specific
  mdoc: {
    version: string;
    generator?: string;
    compression?: "store" | "deflate";
  };

  // Extensible custom fields
  custom?: Record<string, unknown>;
}
```

## Core Types and Interfaces

### Integration with unified.js Flow

Docen integrates collaborative features into the unified.js flow through a combination of processor extensions and plugins. Following the unified.js pattern, collaboration capabilities are primarily exposed through plugins and VFile extensions.

```typescript
import { unified } from "unified";
import { docenCollaboration } from "@docen/core/plugins";

// Create a unified processor with collaborative capabilities
const processor = unified()
  .use(remarkParse)
  .use(docenCollaboration, {
    // Collaboration options
  })
  .use(remarkRehype)
  .use(rehypeStringify);

// The processor now has collaboration capabilities
// with minimal changes to the unified.js API
```

### VFile Extensions

Following unified.js patterns, Docen extends VFile to carry collaboration data through the pipeline:

```typescript
import { VFile } from "vfile";
import * as Y from "yjs";

// Extend VFile with collaboration capabilities
declare module "vfile" {
  interface VFile {
    // Attached Yjs document
    ydoc?: Y.Doc;

    // Collaborative document adapter
    collaborativeDocument?: CollaborativeDocument;

    // Awareness for user presence
    awareness?: Awareness;
  }
}
```

### Processor Interface

````typescript
import { Processor as UnifiedProcessor, Plugin } from "unified";
import { VFile } from "vfile";
import * as Y from "yjs";

// Processor extension for collaborative features
export interface DocenProcessor extends UnifiedProcessor {
  // Collaborative processing aligned with unified API patterns
  use(plugin: Plugin): this;
  process(
    fileOrDoc: VFile | CollaborativeDocument,
    done?: ProcessCallback,
  ): Promise<VFile & { collaborativeDocument?: CollaborativeDocument }>;

  // Yjs integration - leveraging unified's data() for storing state
  useCollaboration(options?: CollaborationOptions): this;
  observeChanges(callback: (changes: Change[]) => void): () => void;
}

// Collaboration options interface
export interface CollaborationOptions {
  ydoc?: Y.Doc;
  syncStrategy?: "timestamp" | "intent-based" | "custom";
  undoManager?: boolean;
  fragmentOptions?: {
    enabled: boolean;
    threshold?: number;
    maxFragments?: number;
  };
  // Custom sync strategy implementation
  customSyncHandler?: SyncHandler;
}

// Conflict definition for sync strategies
export interface SyncConflict {
  localNode: Node;
  remoteNode: Node;
  localTimestamp: number;
  remoteTimestamp: number;
  path: (string | number)[];
}

// Factory function that creates a docen processor
export function docen(): DocenProcessor;

// Factory function for creating a processor with a specific adapter
export function createProcessor(options?: {
  adapter?: "remark" | "rehype" | "retext" | "recma";
  collaborative?: boolean;
  syncStrategy?: "timestamp" | "intent-based" | "custom";
  customSyncHandler?: SyncHandler;
}): DocenProcessor {
  // Implementation creates a unified processor with collaboration
  // capabilities, following unified.js patterns
  const processor = unified();

  // Attach collaborative functionality via processor.data()
  // to maintain unified.js patterns
  if (options?.collaborative) {
    processor.data('ydoc', options.ydoc || new Y.Doc());
    processor.data('collaborationEnabled', true);
    processor.data('syncStrategy', options.syncStrategy || 'timestamp');

    if (options.customSyncHandler) {
      processor.data('customSyncHandler', options.customSyncHandler);
    }
  }

  return processor as DocenProcessor;
}

// Collaboration plugin follows unified.js plugin pattern
export function docenCollaboration(options?: CollaborationOptions): Plugin {
  return (tree: Node, file: VFile) => {
    // Access processor from transformer context
    const processor = this;
    const ydoc = processor.data('ydoc') || options?.ydoc || new Y.Doc();

    // Create and attach collaborative adapter to the file
    file.collaborativeDocument = createYjsAdapter(ydoc, {
      syncStrategy: processor.data('syncStrategy') || options?.syncStrategy,
      customSyncHandler: processor.data('customSyncHandler') || options?.customSyncHandler,
      // Other options
    });

    // Return the tree (following unified.js transformer pattern)
    return tree;
  };
}

### CollaborativeDocument Interface

This interface defines the structure for managing a document with collaborative features, typically implemented alongside the YjsAdapter.

```typescript
import * as Y from 'yjs';
import { Node } from 'unist';
import { Awareness } from 'y-protocols/awareness'; // Assuming Awareness type is defined elsewhere or imported

/**
 * Represents a document instance with collaborative capabilities.
 */
export interface CollaborativeDocument {
  /** Unique identifier for the document */
  id: string;

  /** The underlying Yjs document */
  ydoc: Y.Doc;

  /** The Yjs awareness protocol instance */
  awareness: Awareness;

  /** The root node of the document's AST */
  tree: Node; // This might be more specific, e.g., DocenRoot

  /** Binds an AST node to its Yjs representation */
  bindNode(node: Node): void;

  /** Unbinds an AST node from its Yjs representation */
  unbindNode(node: Node): void;

  /** Executes a function within a Yjs transaction */
  transact<T>(fn: () => T, origin?: string): T;

  /** Observe changes to the document */
  onChange(callback: (changes: any, origin: string) => void): void;

  /** Stop observing changes */
  offChange(callback: (changes: any, origin: string) => void): void;

  /** Observe changes to a specific node */
  observeNode(node: Node, callback: (event: any) => void): () => void;

  /** Destroy the collaborative document and clean up resources */
  destroy(): void;
}
````

### AST Structure

The AST structure follows unist specifications with minimal collaboration extensions:

```typescript
import { Node as UnistNode, Parent as UnistParent } from "unist";

// Base node interface extends unist Node
export interface Node extends UnistNode {
  // Optional collaboration metadata
  collaborationMetadata?: {
    createdBy?: string;
    createdAt?: number;
    modifiedBy?: string;
    modifiedAt?: number;
    version?: number;
    // Timestamp for synchronization conflict resolution
    lastModifiedTimestamp?: number;
  };
}

// Parent node with children
export interface Parent extends Node, UnistParent {
  children: Node[];
}

// Root document node
export interface DocenRoot extends Parent {
  type: "root";
  children: Node[];
  metadata?: Record<string, unknown>;
}
```

## Yjs Integration

Docen provides tight integration with Yjs for real-time collaboration capabilities, offering powerful synchronization abilities while maintaining high performance and a clean API surface. The Yjs integration implements both the `YjsAdapter` and `CollaborativeDocument` interfaces.

```typescript
import * as Y from "yjs";
import { Node } from "unist";
import { VFile } from "vfile";
import { Awareness } from "y-protocols/awareness";

/**
 * Strategy to bind a specific Node type to Yjs data structures.
 * Each strategy defines how to convert a specific node type to and from Yjs,
 * and how to observe changes to the corresponding Yjs data structure.
 */
export interface NodeBindingStrategy<N extends Node = Node> {
  /**
   * Converts a Node to a Yjs data structure
   * @param node The node to convert to a Yjs data structure
   * @returns A Yjs data structure representing the node
   */
  toYjs(node: N): Y.AbstractType<any>;

  /**
   * Converts a Yjs data structure back to a Node
   * @param yType The Yjs data structure to convert
   * @returns The corresponding Node
   */
  fromYjs(yType: Y.AbstractType<any>): N;

  /**
   * Observe changes to the Yjs representation of a Node
   * @param node The corresponding AST node (may be needed for context)
   * @param yType The Yjs data structure to observe
   * @param callback The callback function for changes
   * @returns A function to unobserve
   */
  observe(
    node: N,
    yType: Y.AbstractType<any>,
    callback: (event: Y.YEvent<any>) => void,
  ): () => void;
}

/**
 * Interface for managing a collaborative document with Yjs
 */
export interface YjsAdapter {
  /** The underlying Yjs document */
  doc: Y.Doc;

  /** Root map for document data */
  rootMap: Y.Map<any>;

  /** Undo manager (null if disabled) */
  undoManager: Y.UndoManager | null;

  /** Available binding strategies */
  bindingStrategies: Record<string, NodeBindingStrategy>;

  /** Bind a node to Yjs for real-time collaboration */
  bindNode(node: Node): Node & CollaborativeNode;

  /** Unbind a node from Yjs */
  unbindNode(node: Node & CollaborativeNode): Node;

  /** Resolve a conflict between concurrent edits */
  resolveConflict(conflict: SyncConflict): ResolvedNode;

  /** Execute a function within a Yjs transaction */
  transact<T>(fn: () => T, origin?: string): T;

  /** Observe changes in the Yjs document */
  observeChanges(
    callback: (
      events: Array<Y.YEvent<any>>,
      transaction: Y.Transaction,
    ) => void,
  ): () => void;
}

/**
 * Type representing the outcome of conflict resolution
 */
export interface ResolvedNode {
  /** The resolved node */
  node: Node;
  /** The origin of the resolved node */
  origin: "local" | "remote" | "merged";
}

/**
 * Function type for handling synchronization conflicts
 */
export type SyncHandler = (conflict: SyncConflict) => ResolvedNode;

/**
 * Options for configuring collaboration features
 */
export interface YjsAdapterOptions {
  /**
   * Whether to enable undo functionality (default: true)
   */
  enableUndo?: boolean;

  /**
   * Origins to track for undo operations (default: ['update'])
   */
  undoTrackOrigins?: Array<string>;

  /**
   * Strategy for resolving conflicts (default: timestamp-based)
   */
  conflictResolutionStrategy?: ConflictResolutionStrategy;

  /**
   * Custom binding strategies to use (will be merged with defaults)
   */
  bindingStrategies?: Record<string, NodeBindingStrategy>;
}

/**
 * Creates a Yjs adapter with the given options
 * Note: In a full unified integration, this adapter would typically be created
 * and attached to the VFile via a plugin.
 */
export function createYjsAdapter(
  doc: Y.Doc = new Y.Doc(),
  options: YjsAdapterOptions = {},
): YjsAdapter {
  const rootMap = doc.getMap<any>("content");
  const undoManager =
    options.enableUndo !== false
      ? new Y.UndoManager(rootMap, {
          trackedOrigins: new Set(options.undoTrackOrigins || ["local-update"]),
        })
      : null;

  // Define the default binding strategies
  const defaultBindingStrategies: Record<string, NodeBindingStrategy> = {
    // Text binding strategy
    text: {
      toYjs(node) {
        const ytext = new Y.Text();
        // Assuming TextNode has a 'value' property based on unist
        if (node.type === "text" && typeof node.value === "string") {
          ytext.insert(0, node.value);
        }
        return ytext;
      },
      fromYjs(data) {
        if (!(data instanceof Y.Text)) {
          throw new Error("Expected Y.Text for text node conversion");
        }
        return { type: "text", value: data.toString() } as Node; // Cast necessary?
      },
      observe(node, yType, callback) {
        if (!(yType instanceof Y.Text)) {
          throw new Error("Expected Y.Text for observation");
        }
        yType.observe(callback);
        return () => yType.unobserve(callback);
      },
    },

    // Map binding strategy (Generic fallback for object-like nodes)
    map: {
      toYjs(node) {
        const ymap = new Y.Map();
        for (const [key, value] of Object.entries(node)) {
          if (key !== "type" && key !== "children") {
            // Simple property setting, could be enhanced for nested structures
            ymap.set(key, value);
          }
        }
        ymap.set("type", node.type); // Store the original node type
        return ymap;
      },
      fromYjs(data) {
        if (!(data instanceof Y.Map)) {
          throw new Error("Expected Y.Map for map node conversion");
        }
        const node: Record<string, any> = { type: data.get("type") || "map" };
        data.forEach((value, key) => {
          if (key !== "type") node[key] = value;
        });
        return node as Node;
      },
      observe(node, yType, callback) {
        if (!(yType instanceof Y.Map)) {
          throw new Error("Expected Y.Map for observation");
        }
        yType.observe(callback);
        return () => yType.unobserve(callback);
      },
    },

    // Array binding strategy (Generic for parent nodes with children)
    array: {
      toYjs(node) {
        const yarray = new Y.Array();
        // Using type guard for children access
        if (isParent(node)) {
          node.children.forEach((child) => {
            // Recursively convert children using the appropriate strategy
            const childStrategy =
              bindingStrategies[child.type] || defaultBindingStrategy;
            const yChild = childStrategy.toYjs(child);
            yarray.push([yChild]);
          });
        }
        return yarray;
      },
      fromYjs(data) {
        if (!(data instanceof Y.Array)) {
          throw new Error("Expected Y.Array for array node conversion");
        }
        const children: Node[] = [];
        for (let i = 0; i < data.length; i++) {
          const yChild = data.get(i);
          if (yChild instanceof Y.AbstractType) {
            // Determine type for recursive conversion
            const type =
              yChild instanceof Y.Map
                ? yChild.get("type")
                : yChild instanceof Y.Text
                  ? "text"
                  : "unknown";
            const childStrategy =
              bindingStrategies[type as string] || defaultBindingStrategy;
            children.push(childStrategy.fromYjs(yChild));
          }
        }
        // Assumes the parent node type should be inferred or handled elsewhere
        return { type: "array-parent", children } as Node;
      },
      observe(node, yType, callback) {
        if (!(yType instanceof Y.Array)) {
          throw new Error("Expected Y.Array for observation");
        }
        // Use observeDeep for arrays to capture changes within children
        yType.observeDeep((events) => {
          events.forEach((event) => callback(event));
        });
        return () => yType.unobserveDeep(callback); // Needs adjustment for unobserveDeep
      },
    },
  };

  // Default strategy uses map or specific type if available
  const defaultBindingStrategy: NodeBindingStrategy = {
    toYjs(node) {
      const strategy =
        defaultBindingStrategies[node.type] || defaultBindingStrategies.map;
      return strategy.toYjs(node);
    },
    fromYjs(data) {
      let type = "unknown";
      if (data instanceof Y.Map) type = data.get("type") || "map";
      else if (data instanceof Y.Text) type = "text";
      else if (data instanceof Y.Array) type = "array-parent"; // Assuming array represents children

      const strategy =
        defaultBindingStrategies[type] || defaultBindingStrategies.map;
      return strategy.fromYjs(data);
    },
    observe(node, yType, callback) {
      let type = "unknown";
      if (yType instanceof Y.Map) type = yType.get("type") || "map";
      else if (yType instanceof Y.Text) type = "text";
      else if (yType instanceof Y.Array) type = "array-parent";

      const strategy =
        defaultBindingStrategies[type] || defaultBindingStrategies.map;
      // Correctly call observe with only (node, yType, callback)
      return strategy.observe(node, yType, callback);
    },
  };

  // Merge custom binding strategies with defaults
  const bindingStrategies = {
    ...defaultBindingStrategies,
    ...(options.bindingStrategies || {}),
  };

  // Default conflict resolution based on timestamps
  const defaultConflictStrategy: ConflictResolutionStrategy = {
    resolve(local, remote, origin) {
      // Simple timestamp-based resolution (higher timestamp wins)
      const localTime = local.timestamp || 0;
      const remoteTime = remote.timestamp || 0;
      return remoteTime > localTime ? remote : local;
    },
  };

  // Use provided conflict strategy or default
  const conflictStrategy =
    options.conflictResolutionStrategy || defaultConflictStrategy;

  // The adapter implements the YjsAdapter interface.
  // Note: Awareness is typically managed by the CollaborativeDocument or processor context,
  // not directly part of the adapter interface itself in this design.
  const adapter: YjsAdapter = {
    doc,
    rootMap,
    undoManager,
    bindingStrategies,
    // awareness is not directly on the adapter interface, see CollaborativeDocument
    resolveConflict: conflictStrategy.resolve,

    bindNode(node) {
      const strategy = bindingStrategies[node.type] || defaultBindingStrategy;
      const yNode = strategy.toYjs(node);
      // Simplified binding logic example
      rootMap.set(node.id || "root", yNode);
      // In a real implementation, would return Node & CollaborativeNode
      return node as Node & CollaborativeNode;
    },

    unbindNode(node) {
      rootMap.delete(node.id || "root");
      return node;
    },

    transact(fn, origin) {
      let result: any;
      doc.transact(() => {
        result = fn();
      }, origin);
      return result;
    },

    onChange(callback) {
      // Simplified onChange logic
      rootMap.observeDeep((events) => {
        callback(events, events[0]?.transaction.origin || "unknown");
      });
    },

    offChange(callback) {
      // This needs a way to map the wrapped callback to the original
      // rootMap.unobserveDeep(callback);
    },

    observe(node, callback) {
      // Simplified observe logic
      const yNode = rootMap.get(node.id || "root");
      if (yNode) {
        const strategy = bindingStrategies[node.type] || defaultBindingStrategy;
        return strategy.observe(node, yNode, callback);
      }
      return () => {}; // Return no-op unobserve if node not found
    },

    // ... (CollaborativeDocument methods implementation) ...
  };

  return adapter as YjsAdapter;
}
```

## Cursor and Selection Tracking

Docen utilizes Yjs relative positions for cursor and selection tracking in collaborative editing. This enables real-time visualization of cursor positions and selections across multiple users.

```typescript
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";

// Interface for cursor position
export interface CursorPosition {
  // Relative position in the Yjs document (allows for stable position tracking during edits)
  relativePosition: Y.RelativePosition;

  // Selection range (null if no selection, just cursor position)
  range?: {
    start: Y.RelativePosition;
    end: Y.RelativePosition;
  } | null;
}

// Interface for user awareness state
export interface AwarenessState {
  // User information
  user: {
    id: string;
    name: string;
    color?: string;
    avatar?: string;
  };

  // Current cursor position (null if not available)
  cursor: CursorPosition | null;
}

// Interface for collaborative awareness management
// Matches the definition in packages/core/src/types.ts
export interface Awareness {
  /** The underlying Yjs awareness instance */
  readonly awareness: YAwareness;

  /** Get the local client ID */
  readonly clientID: number;

  /** Get the current local state */
  getLocalState(): AwarenessState | null;

  /** Set the entire local state */
  setLocalState(state: Partial<AwarenessState> | null): void;

  /** Set a specific field in the local state */
  setLocalStateField<K extends keyof AwarenessState>(
    field: K,
    value: AwarenessState[K],
  ): void;

  /** Get all states from awareness */
  getStates(): Map<number, AwarenessState>;

  /** Register an event listener */
  on(event: "change" | "update", callback: (...args: any[]) => void): void;

  /** Unregister an event listener */
  off(event: "change" | "update", callback: (...args: any[]) => void): void;

  /** Clean up resources */
  destroy(): void;
}

// Helper functions for relative positions

/**
 * Creates a relative position from an absolute position in the document
 */
export function createRelativePosition(
  doc: Y.Doc,
  path: string[],
  offset: number,
): Y.RelativePosition {
  // Find the target Yjs text at the given path
  let target: Y.AbstractType<any> = doc.getMap("content");
  for (const key of path) {
    target = target.get(key);
  }

  // Create a relative position
  if (target instanceof Y.Text) {
    return Y.createRelativePositionFromTypeIndex(target, offset);
  } else {
    throw new Error("Target is not a Y.Text");
  }
}

/**
 * Resolves a relative position to an absolute position
 */
export function resolveRelativePosition(
  doc: Y.Doc,
  relativePosition: Y.RelativePosition,
): { path: string[]; offset: number } | null {
  const absPos = Y.createAbsolutePositionFromRelativePosition(
    relativePosition,
    doc,
  );
  if (!absPos) return null;

  // Extract path and offset from absolute position
  const path: string[] = [];
  let current: Y.AbstractType<any> | null = absPos.type;
  while (current && current !== doc.getMap("content")) {
    // In a real implementation, we'd need to traverse up the Yjs structure
    // This is a simplified example
    const parentAndKey = findParentAndKey(current, doc);
    if (parentAndKey) {
      path.unshift(parentAndKey.key);
      current = parentAndKey.parent;
    } else {
      break;
    }
  }

  return { path, offset: absPos.index };
}

/**
 * Helper to find parent and key for a Yjs type
 * Note: This is a simplified example, actual implementation would be more complex
 */
function findParentAndKey(
  type: Y.AbstractType<any>,
  doc: Y.Doc,
): { parent: Y.AbstractType<any>; key: string } | null {
  // Implementation would scan the doc for the parent of this type
  return null;
}

/**
 * Creates a test awareness state for development/testing
 */
export function createTestAwarenessState(userId: string): AwarenessState {
  return {
    user: {
      id: userId,
      name: `User ${userId}`,
      color: `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`,
    },
    cursor: null,
  };
}
```

## Performance Optimizations

To ensure optimal performance, Docen implements several optimizations:

1. **Batched Updates**: Using Yjs transactions to batch multiple changes
2. **Delayed Binding**: Only binding nodes to Yjs when necessary
3. **Update Throttling**: Limiting the frequency of awareness updates
4. **Incremental Updates**: Updating only changed parts of the document

```typescript
// Example of batched updates with transactions
adapter.transact(() => {
  // Multiple operations in a single transaction
  node1.value = "new value";
  node2.children.push(newChild);
  // ...more operations
}, "batch-update");

// Example of throttled cursor updates
const throttledCursorUpdate = throttle((position) => {
  adapter.setLocalCursor(position);
}, 50); // Update at most every 50ms

// Use throttled update instead of direct call
throttledCursorUpdate(newPosition);
```

These performance optimizations maintain the design principles while ensuring Docen performs well even with large documents and many concurrent users.
