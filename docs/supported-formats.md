# Docen Supported File Formats

This document outlines the file formats supported by each Docen package.

## @docen/document

The document package handles text-based document formats with unified.js processors.

### Supported Formats

| Format           | Extension      | Read | Write | Description                                    |
| ---------------- | -------------- | ---- | ----- | ---------------------------------------------- |
| Markdown         | .md, .markdown | ✅   | ✅    | Standard Markdown and GitHub Flavored Markdown |
| Markdown+        | .mdx           | ✅   | ✅    | Markdown with JSX and React components         |
| HTML             | .html, .htm    | ✅   | ✅    | HTML documents with full DOM structure         |
| Plain Text       | .txt           | ✅   | ✅    | Simple text documents without formatting       |
| ReStructuredText | .rst           | ✅   | ✅    | Python documentation format                    |
| AsciiDoc         | .adoc          | ✅   | ✅    | Lightweight markup format                      |

## @docen/office

The office package handles office document formats with specialized processors.

### Supported Formats

| Format                    | Extension | Read | Write | Description                                    |
| ------------------------- | --------- | ---- | ----- | ---------------------------------------------- |
| PDF                       | .pdf      | ✅   | ✅    | Portable Document Format files                 |
| Word Document             | .docx     | ✅   | ✅    | Microsoft Word Open XML documents              |
| Excel Spreadsheet         | .xlsx     | ✅   | ✅    | Microsoft Excel Open XML spreadsheets          |
| PowerPoint                | .pptx     | ✅   | ✅    | Microsoft PowerPoint Open XML presentations    |
| Rich Text Format          | .rtf      | ✅   | ✅    | Highly portable cross-platform document format |
| Legacy Word               | .doc      | ✅   | ❌    | Legacy Microsoft Word Binary File Format       |
| Legacy Excel              | .xls      | ✅   | ❌    | Legacy Microsoft Excel Binary File Format      |
| Legacy PowerPoint         | .ppt      | ✅   | ❌    | Legacy Microsoft PowerPoint Binary File Format |
| OpenDocument Text         | .odt      | ✅   | ✅    | OpenDocument text documents                    |
| OpenDocument Spreadsheet  | .ods      | ✅   | ✅    | OpenDocument spreadsheets                      |
| OpenDocument Presentation | .odp      | ✅   | ✅    | OpenDocument presentations                     |

## @docen/data

The data package handles structured data formats with data-specific processors.

### Supported Formats

| Format        | Extension   | Read | Write | Description                               |
| ------------- | ----------- | ---- | ----- | ----------------------------------------- |
| JSON          | .json       | ✅   | ✅    | JavaScript Object Notation                |
| JSON5         | .json5      | ✅   | ✅    | Extended JSON with comments and more      |
| YAML          | .yml, .yaml | ✅   | ✅    | Human-readable data serialization format  |
| XML           | .xml        | ✅   | ✅    | Extensible Markup Language                |
| CSV           | .csv        | ✅   | ✅    | Comma-separated values                    |
| TSV           | .tsv        | ✅   | ✅    | Tab-separated values                      |
| Excel as Data | .xlsx       | ✅   | ✅    | Excel spreadsheets treated as data tables |

## @docen/media

The media package handles binary media formats.

### Supported Formats

| Format | Extension   | Read | Write | Description                        |
| ------ | ----------- | ---- | ----- | ---------------------------------- |
| JPEG   | .jpg, .jpeg | ✅   | ✅    | JPEG images                        |
| PNG    | .png        | ✅   | ✅    | Portable Network Graphics images   |
| GIF    | .gif        | ✅   | ✅    | Graphics Interchange Format images |
| SVG    | .svg        | ✅   | ✅    | Scalable Vector Graphics           |
| WebP   | .webp       | ✅   | ✅    | Modern image format for the web    |
| AVIF   | .avif       | ✅   | ✅    | AV1 Image File Format              |
| MP3    | .mp3        | ✅   | ❌    | Audio files with metadata support  |
| MP4    | .mp4        | ✅   | ❌    | Video files with metadata support  |

## @docen/mdoc

The mdoc package handles the enhanced Markdown container format.

### Supported Formats

| Format         | Extension | Read | Write | Description                                        |
| -------------- | --------- | ---- | ----- | -------------------------------------------------- |
| MDOC Container | .mdoc     | ✅   | ✅    | Enhanced Markdown with embedded media and metadata |

### MDOC Format Specification

The MDOC format is a ZIP-based container that extends Markdown with the following features:

#### Container Structure

```
document.mdoc (ZIP file)
├── content.md          # Main Markdown content
├── media/              # Embedded media files
│   ├── image1.png
│   ├── video1.mp4
│   └── audio1.mp3
└── styles.css          # Optional custom styles
```

#### Frontmatter Metadata

MDOC files use YAML frontmatter in the content.md file for metadata:

```yaml
---
title: "Document Title"
author: "Author Name"
created: "2024-01-15T10:30:00Z"
modified: "2024-01-15T15:45:00Z"
version: "1.0"
tags: ["tag1", "tag2"]
description: "Document description"
language: "en"
custom:
  project: "Project Name"
  status: "draft"
---
```

#### Media References

Media files are referenced using relative paths within the Markdown content:

```markdown
![Image description](media/image1.png)
[Video link](media/video1.mp4)
```

#### Features

- **Embedded Media**: All referenced media files are automatically embedded
- **Version Control**: Built-in versioning and compatibility tracking
- **Cross-References**: Internal link management and validation
- **Collaborative Editing**: Full Yjs integration for real-time collaboration
- **Compression**: Efficient ZIP compression for smaller file sizes

## @docen/editor

The editor package provides collaborative editing capabilities for supported formats.

### Editor Features

| Feature                 | Markdown | MDOC | HTML | Office | Status  |
| ----------------------- | -------- | ---- | ---- | ------ | ------- |
| Real-time Collaboration | ✅       | ✅   | ✅   | 🔄     | Ready   |
| Cursor Synchronization  | ✅       | ✅   | ✅   | 🔄     | Ready   |
| Live Preview            | ✅       | ✅   | ✅   | ❌     | Ready   |
| Media Insertion         | ✅       | ✅   | ✅   | 🔄     | Ready   |
| Table Editing           | ✅       | ✅   | ✅   | 🔄     | Ready   |
| Formula Support         | 🔄       | ✅   | 🔄   | ❌     | Planned |
| Comments & Annotations  | 🔄       | ✅   | 🔄   | 🔄     | Planned |

Legend: ✅ Supported | 🔄 Planned | ❌ Not Planned

### Key AST Types

| AST Type | Description                          | Used For                 |
| -------- | ------------------------------------ | ------------------------ |
| mdast    | Markdown Abstract Syntax Tree        | Markdown processing      |
| hast     | HTML Abstract Syntax Tree            | HTML processing          |
| xast     | XML Abstract Syntax Tree             | XML, data formats        |
| ooxast   | Office Open XML Abstract Syntax Tree | DOCX, XLSX, PPTX formats |
| unist    | Universal Syntax Tree                | Base for all AST types   |
| mdocast  | MDOC Abstract Syntax Tree            | MDOC format processing   |

All document transformations in Docen leverage these AST types with unified.js processors to maintain document structure and formatting during conversion and collaborative editing.
