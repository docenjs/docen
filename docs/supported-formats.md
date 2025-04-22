# Docen Supported File Formats

This document outlines the file formats supported by each Docen package.

## @docen/document

The document package handles text-based document formats with unified.js processors.

### Supported Formats

| Format           | Extension      | Read | Write | Description                                    |
| ---------------- | -------------- | ---- | ----- | ---------------------------------------------- |
| Markdown         | .md, .markdown | ✅   | ✅    | Standard Markdown and GitHub Flavored Markdown |
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

### Key AST Types

| AST Type | Description                          | Used For                 |
| -------- | ------------------------------------ | ------------------------ |
| mdast    | Markdown Abstract Syntax Tree        | Markdown processing      |
| hast     | HTML Abstract Syntax Tree            | HTML processing          |
| xast     | XML Abstract Syntax Tree             | XML, data formats        |
| ooxast   | Office Open XML Abstract Syntax Tree | DOCX, XLSX, PPTX formats |
| unist    | Universal Syntax Tree                | Base for all AST types   |

All document transformations in Docen leverage these AST types with unified.js processors to maintain document structure and formatting during conversion.
