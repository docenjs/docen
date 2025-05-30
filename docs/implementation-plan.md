# Docen Implementation Plan

This document outlines the implementation plan for the Docen project based on the container-level collaboration architecture specified in `requirements.md`.

## Core Architecture Principle

**Key Insight**: Yjs integration is simple enough (Y.Text, Y.Array, Y.Map) that complex package-level collaboration mechanisms are unnecessary. Instead, packages focus on format processing while containers handle collaboration.

## Phase 1: Project Setup and Infrastructure

- [x] Initialize project workspace

  - [x] Set up monorepo structure with pnpm
  - [x] Configure TypeScript for all packages
  - [x] Set up Biome and Prettier configurations
  - [x] Configure testing framework (Vitest)
  - [ ] Set up CI/CD pipeline

- [x] Create package structure

  - [x] @docen/core - Basic types, no collaboration
  - [x] @docen/document - Pure format processing
  - [x] @docen/data - Pure data processing
  - [x] @docen/media - Independent processing
  - [x] @docen/office - Format routing
  - [ ] @docen/containers - **Only package with Yjs code**
  - [ ] @docen/editor - Container-aware editor
  - [x] @docen/providers - Transport layer
  - [x] docen - Main package

- [ ] Set up shared configurations
  - [x] Shared TypeScript types
  - [ ] Shared testing utilities
  - [x] Shared build configurations

## Phase 2: Core Module (@docen/core) - Pure Unified.js

- [x] Implement core interfaces

  - [x] Define DocenProcessor interface extending UnifiedProcessor
  - [x] Implement Node and Parent interfaces extending unist
  - [ ] Add format detection utilities

- [ ] Pure unified.js functionality
  - [x] Extend unified processor
  - [ ] Implement format detection and processor creation
  - [ ] Create plugin adaptation system
  - [ ] Integration with vfile for virtual file handling

**Key Point**: No collaboration code in core - pure unified.js compatibility.

## Phase 3: Document Processing (@docen/document) - Pure AST Processing

- [ ] Integrate with remark and rehype

  - [x] Create adapters for mdast
  - [x] Create adapters for hast
  - [ ] Ensure compatibility with existing plugins

- [ ] Pure document processing
  - [ ] Document transformation utilities
  - [ ] Format conversion (markdown ↔ HTML)
  - [ ] Schema validation for text document formats

**Key Point**: No Yjs dependencies - pure unified.js text processing only. No presentation support.

## Phase 4: Data Processing (@docen/data) - Pure Data Formats

- [ ] Standard unified.js data processing

  - [ ] Implement pure data format parsing (JSON, YAML, CSV, XML)
  - [ ] Create standard unified.js processors for each format
  - [ ] Implement bidirectional format conversion
  - [ ] Add data schema validation

- [ ] Integrate with xast for XML processing
  - [ ] Create standard XastNodeAdapter
  - [ ] Implement XML processing
  - [ ] Ensure compatibility with unified XML plugins

**Key Point**: No collaboration features - standard unified.js data processing.

## Phase 5: Media Processing (@docen/media) - Independent Processing

- [ ] Independent media processing toolkit

  - [ ] Implement browser-compatible processing with jimp-compact
  - [ ] Add Sharp-WASM integration for high-performance processing
  - [ ] Create FFmpeg-WASM integration for video processing
  - [ ] Implement optimization pipeline

- [ ] Metadata and analysis

  - [ ] Comprehensive metadata extraction (EXIF, XMP, IPTC)
  - [ ] File type detection and validation
  - [ ] Content-aware optimization

- [ ] Unified.js integration (pipeline compatibility only)
  - [ ] Create unified plugin for media processing
  - [ ] Implement media node types for AST compatibility

**Key Point**: No collaboration features - independent processing toolkit only.

## Phase 6: Office Document Processing (@docen/office) - Format Routing

- [ ] Format detection and routing

  - [ ] Implement automatic format detection
  - [ ] Route DOCX/RTF/ODT → @docen/document
  - [ ] Route XLSX/ODS → @docen/data
  - [ ] Route PPTX/ODP → @docen/document (presentations)
  - [ ] Handle PDF documents locally

- [ ] Office format processing
  - [x] Integrate with unpdf for PDF handling
  - [ ] Implement DOCX processing with docx.js
  - [ ] Add Excel file processing for routing to data package
  - [ ] Support legacy format reading (DOC/XLS/PPT)

**Key Point**: No collaboration code - pure format detection and routing.

## Phase 7: Container Formats (@docen/containers) - **ONLY COLLABORATION PACKAGE**

- [ ] **Simple Yjs Integration**

  - [ ] Implement Y.Text for document containers (.mdcx)
  - [ ] Implement Y.Array/Y.Map for data containers (.dtcx)
  - [ ] Implement Y.Text + Y.Map for presentation containers (.ptcx)
  - [ ] Create unified container API

- [ ] **Container Format Implementation**

  - [ ] Design .mdcx/.dtcx/.ptcx ZIP-based containers
  - [ ] Implement container parser and stringifier
  - [ ] Add collaboration metadata management
  - [ ] Create version control and compatibility handling

- [ ] **Cross-format Integration**
  - [ ] Integration with @docen/document for content processing
  - [ ] Integration with @docen/data for data processing
  - [ ] Integration with @docen/media for embedded files
  - [ ] Unified collaboration interface for all container types

**Key Point**: This is the ONLY package with Yjs code. All collaboration happens here.

## Phase 8: Custom Editor (@docen/editor) - Container-Aware Editing

- [ ] **Container-based editor architecture**

  - [ ] Create DocenEditor class that loads containers from @docen/containers
  - [ ] Implement format detection based on container type
  - [ ] Build format-specific UI components (.mdcx/.dtcx/.ptcx)
  - [ ] Create unified editing interface

- [ ] **Editor UI by container type**

  - [ ] Document editor for .mdcx (rich text, live preview)
  - [ ] Data editor for .dtcx (tables, formulas)
  - [ ] Slide editor for .ptcx (slides, layout)
  - [ ] Unified collaboration features across all modes

- [ ] **Core editor functionality**
  - [ ] DOM rendering without external editor dependencies
  - [ ] Input handling and event management
  - [ ] Cursor and selection management
  - [ ] Real-time collaboration via @docen/containers

**Key Point**: All collaboration through @docen/containers package only.

## Phase 9: Providers (@docen/providers) - Transport Layer

- [ ] **Yjs transport providers**

  - [ ] WebSocket provider for server-based sync
  - [ ] IndexedDB persistence provider
  - [ ] WebRTC provider for peer-to-peer collaboration

- [ ] **Provider management**
  - [ ] Connection lifecycle and recovery
  - [ ] Automatic provider selection
  - [ ] Offline capabilities with sync

**Key Point**: Transport only - no container-specific logic, pure Yjs transport.

## Phase 10: Main Package (docen) - Unified Interface

- [ ] **Unified API design**

  - [ ] Implement `docen(format)` for format processing
  - [ ] Implement `docen.containers(type)` for collaboration
  - [ ] Create automatic processor configuration
  - [ ] Build plugin discovery mechanism

- [ ] **Cross-platform integration**
  - [ ] Test in Node.js, browsers, Deno, Edge environments
  - [ ] Ensure WASM component compatibility
  - [ ] Optimize bundle sizes for different platforms

**Key Point**: Clear separation between processing and collaboration APIs.

## Phase 11: Testing and Documentation

- [ ] **Comprehensive testing**

  - [ ] Unit tests for all packages
  - [ ] Integration tests for format processing
  - [ ] Collaboration tests for container functionality
  - [ ] Cross-platform compatibility tests

- [ ] **Performance optimization**

  - [ ] Benchmark format processing performance
  - [ ] Optimize collaboration latency
  - [ ] Memory usage optimization
  - [ ] Bundle size optimization

- [ ] **Documentation**
  - [ ] API reference for all packages
  - [ ] Format processing examples
  - [ ] Collaboration integration guides
  - [ ] Plugin development documentation

## Implementation Priorities

### Critical Path: Container-Level Collaboration

1. **Phase 7 (@docen/containers)** - The core innovation

   - Simple Yjs integration patterns
   - Container format specification
   - Unified collaboration API

2. **Phase 8 (@docen/editor)** - Container-aware editing

   - Format-specific UIs based on container type
   - All collaboration via containers package

3. **Phase 3-6 (Format packages)** - Pure processing
   - Can be developed in parallel
   - No collaboration dependencies
   - Standard unified.js patterns

### Architecture Validation

Before implementation, validate:

1. **Yjs Simplicity**: Confirm Y.Text/Y.Array/Y.Map patterns are sufficient
2. **Container Format**: Validate ZIP-based container performance
3. **Cross-format Integration**: Test container integration with format packages
4. **Bundle Size**: Ensure reasonable bundle sizes with WASM components
5. **Performance**: Test collaboration performance across container types

## Key Benefits of This Architecture

### 1. **Simplified Codebase**

- Only @docen/containers has collaboration complexity
- Format packages focus on pure AST processing
- Clear separation of concerns

### 2. **Better Maintenance**

- Collaboration bugs isolated to one package
- Format processing bugs isolated to specific packages
- Easier testing strategy

### 3. **Unified User Experience**

- Same collaboration interface for all formats
- Consistent API: `docen(format)` vs `docen.containers(type)`
- Seamless switching between content types

### 4. **Ecosystem Compatibility**

- Full unified.js ecosystem compatibility for format processing
- Standard Yjs collaboration patterns
- No vendor lock-in or proprietary protocols

This implementation plan focuses on the key insight that collaboration can be simple and unified while format processing remains pure and compatible with existing ecosystems.
