# @docen/media

Media processing toolkit for images, audio, video with unified.js compatibility.

## Overview

The `@docen/media` package provides **pure media processing** capabilities using unified.js patterns. It focuses on media file analysis, metadata extraction, and format conversion without any collaboration features.

**Architecture**: Uses specialized media processing libraries with unified.js processor wrappers for consistent media handling across all supported formats.

## Features

### 🖼️ Image Formats

- **Raster Images**: JPEG, PNG, WebP, GIF, TIFF, BMP
- **Vector Images**: SVG with DOM tree processing
- **Metadata**: EXIF, IPTC, XMP metadata extraction
- **Transformations**: Resize, crop, rotate, format conversion

### 🎵 Audio Formats

- **Audio Files**: MP3, WAV, FLAC, OGG, M4A
- **Metadata**: ID3 tags, album art, duration
- **Processing**: Format conversion, basic audio analysis

### 🎬 Video Formats

- **Video Files**: MP4, WebM, AVI, MOV, MKV
- **Metadata**: Video properties, thumbnails, duration
- **Processing**: Frame extraction, basic video analysis

### 🛠️ Built on Unified.js

- **Standard Processors**: Unified.js processors for each media type
- **Metadata Extraction**: Comprehensive metadata parsing
- **Format Detection**: Automatic format detection and validation
- **Type Safe**: Full TypeScript support with media types

## Architecture

```
packages/media/src/
├── ast/              # Media AST definitions
│   ├── image.ts      # Image AST types
│   ├── audio.ts      # Audio AST types
│   ├── video.ts      # Video AST types
│   └── index.ts      # AST exports
├── processors/       # Media processors
│   ├── image.ts      # Image processor
│   ├── audio.ts      # Audio processor
│   ├── video.ts      # Video processor
│   └── index.ts      # Processor exports
├── utils/            # Media utilities
│   ├── detection.ts  # Format detection
│   ├── metadata.ts   # Metadata extraction
│   └── index.ts      # Utility exports
└── index.ts          # Main exports
```

## Usage

### Image Processing

```typescript
import { createImageProcessor } from "@docen/media";

// Process images
const imageProcessor = createImageProcessor();
const result = await imageProcessor.process(imageBuffer);

// Access image metadata
console.log(result.data.metadata); // EXIF, dimensions, format
console.log(result.data.format); // 'jpeg', 'png', 'webp', etc.
console.log(result.data.width); // Image width
console.log(result.data.height); // Image height
```

### Image Transformations

```typescript
import { createImageProcessor } from "@docen/media";

const processor = createImageProcessor({
  transformations: [
    { type: "resize", width: 800, height: 600 },
    { type: "format", format: "webp", quality: 80 },
    { type: "optimize", level: "medium" },
  ],
});

const result = await processor.process(imageBuffer);
const transformedBuffer = result.data.buffer;
```

### Audio Processing

```typescript
import { createAudioProcessor } from "@docen/media";

// Process audio files
const audioProcessor = createAudioProcessor();
const result = await audioProcessor.process(audioBuffer);

// Access audio metadata
console.log(result.data.metadata); // ID3 tags, title, artist, album
console.log(result.data.format); // 'mp3', 'wav', 'flac', etc.
console.log(result.data.duration); // Duration in seconds
console.log(result.data.bitrate); // Audio bitrate
console.log(result.data.sampleRate); // Sample rate
```

### Video Processing

```typescript
import { createVideoProcessor } from "@docen/media";

// Process video files
const videoProcessor = createVideoProcessor();
const result = await videoProcessor.process(videoBuffer);

// Access video metadata
console.log(result.data.metadata); // Video metadata
console.log(result.data.format); // 'mp4', 'webm', 'avi', etc.
console.log(result.data.duration); // Duration in seconds
console.log(result.data.width); // Video width
console.log(result.data.height); // Video height
console.log(result.data.frameRate); // Frame rate
```

### SVG Processing

```typescript
import { createSvgProcessor } from "@docen/media";

// Process SVG with DOM tree
const svgProcessor = createSvgProcessor({
  parseDOM: true,
  extractText: true,
  optimizations: ["removeComments", "removeEmptyElements"],
});

const result = await svgProcessor.process(svgString);
console.log(result.data.ast); // SVG DOM tree
console.log(result.data.textContent); // Extracted text
console.log(result.data.viewBox); // SVG viewBox
```

### Format Detection

```typescript
import { detectMediaFormat, validateMediaType } from "@docen/media";

// Automatic format detection
const format = await detectMediaFormat(buffer);
console.log(format); // { type: 'image', format: 'jpeg', mimeType: 'image/jpeg' }

// Validate media type
const isValid = await validateMediaType(buffer, "image/jpeg");
console.log(isValid); // true/false
```

### Metadata Extraction

```typescript
import { extractMetadata } from "@docen/media";

// Extract comprehensive metadata
const metadata = await extractMetadata(buffer, "image");

// Image metadata
if (metadata.type === "image") {
  console.log(metadata.exif); // EXIF data
  console.log(metadata.iptc); // IPTC data
  console.log(metadata.xmp); // XMP data
  console.log(metadata.colorSpace); // Color space info
}

// Audio metadata
if (metadata.type === "audio") {
  console.log(metadata.id3); // ID3 tags
  console.log(metadata.albumArt); // Album art buffer
  console.log(metadata.lyrics); // Lyrics if available
}
```

## Supported Features

### Image Features

- **Format Support**: JPEG, PNG, WebP, GIF, TIFF, BMP, SVG
- **Metadata**: Complete EXIF, IPTC, XMP metadata extraction
- **Transformations**: Resize, crop, rotate, format conversion
- **Optimization**: Lossless and lossy compression
- **Color Analysis**: Color space, histogram, dominant colors

### Audio Features

- **Format Support**: MP3, WAV, FLAC, OGG, M4A, AAC
- **Metadata**: ID3v1/ID3v2 tags, Vorbis comments, APE tags
- **Analysis**: Duration, bitrate, sample rate, channels
- **Album Art**: Embedded image extraction

### Video Features

- **Format Support**: MP4, WebM, AVI, MOV, MKV, FLV
- **Metadata**: Video properties, codec information
- **Analysis**: Duration, frame rate, resolution, bitrate
- **Thumbnails**: Frame extraction at specified timestamps

### SVG Features

- **DOM Processing**: Full SVG DOM tree parsing
- **Text Extraction**: Extract text content from SVG
- **Optimization**: Remove unnecessary elements and attributes
- **Validation**: SVG structure and syntax validation

## Type System

### Media AST Types

```typescript
// Generic media node
interface MediaNode extends Node {
  type: "media";
  mediaType: "image" | "audio" | "video";
  format: string;
  metadata: MediaMetadata;
}

// Image-specific types
interface ImageNode extends MediaNode {
  mediaType: "image";
  width: number;
  height: number;
  colorSpace: string;
  exif?: ExifData;
}

// Audio-specific types
interface AudioNode extends MediaNode {
  mediaType: "audio";
  duration: number;
  bitrate: number;
  sampleRate: number;
  channels: number;
  id3?: ID3Tags;
}

// Video-specific types
interface VideoNode extends MediaNode {
  mediaType: "video";
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  codecs: VideoCodecs;
}
```

### Processor Options

```typescript
interface ImageProcessorOptions {
  extractMetadata?: boolean;
  parseExif?: boolean;
  transformations?: ImageTransformation[];
  outputFormat?: ImageFormat;
  quality?: number;
}

interface AudioProcessorOptions {
  extractMetadata?: boolean;
  parseID3?: boolean;
  extractAlbumArt?: boolean;
  analyzeDuration?: boolean;
}

interface VideoProcessorOptions {
  extractMetadata?: boolean;
  generateThumbnail?: boolean;
  thumbnailTimestamp?: number;
  analyzeCodecs?: boolean;
}
```

## Dependencies

### Production Dependencies

- `@docen/core`: Core Docen functionality (workspace:\*)
- `ffmpeg-static`: Static FFmpeg binaries (v5.2.0)
- `file-type`: File type detection (v20.4.1)
- `fluent-ffmpeg`: FFmpeg wrapper (v2.1.3)
- `image-size`: Image dimensions detection (v2.0.2)
- `image-type`: Image type detection (v5.2.0)
- `jimp`: Pure JavaScript image processing (v1.6.0)
- `media-typer`: MIME type parsing (v1.1.0)
- `music-metadata`: Audio metadata extraction (v11.2.1)
- `sharp`: High-performance image processing (v0.34.1)
- `svgo`: SVG optimization (v3.3.2)

### Optional Dependencies

- `node-canvas`: Canvas rendering for image generation
- `imagemin`: Image optimization

## Design Principles

### 1. Pure Media Processing

- No collaboration features
- Focus on media analysis and transformation
- Standard unified.js patterns

### 2. Format Agnostic

- Consistent API across all media types
- Unified media AST representation
- Automatic format detection

### 3. Metadata Rich

- Comprehensive metadata extraction
- Preserve original metadata where possible
- Type-safe metadata access

### 4. Performance Optimized

- Stream-based processing where possible
- Memory-efficient buffer handling
- Configurable processing options

## Integration

This package integrates with other Docen packages:

- **@docen/core**: Uses core processor interface and types
- **@docen/document**: Processes embedded media in documents
- **@docen/containers**: Media processing for all container types

**Note**: Collaboration features are handled separately in `@docen/containers` - this package remains collaboration-free.

## License

MIT &copy; [Demo Macro](https://imst.xyz/)
