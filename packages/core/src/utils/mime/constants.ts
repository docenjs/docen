import type { MimeMapping } from "./types";

/**
 * MIME type mappings
 */
export const MIME_MAPPINGS: MimeMapping[] = [
  // Text formats
  {
    mimeType: "text/plain",
    extensions: ["txt"],
    category: "text",
    description: "Plain text file",
    isBinary: false,
  },
  {
    mimeType: "text/markdown",
    extensions: ["md", "markdown"],
    category: "text",
    description: "Markdown document",
    isBinary: false,
  },
  {
    mimeType: "text/html",
    extensions: ["html", "htm"],
    category: "text",
    description: "HTML document",
    isBinary: false,
  },
  {
    mimeType: "text/xml",
    extensions: ["xml"],
    category: "text",
    description: "XML document",
    isBinary: false,
  },
  {
    mimeType: "text/css",
    extensions: ["css"],
    category: "text",
    description: "CSS stylesheet",
    isBinary: false,
  },
  {
    mimeType: "text/javascript",
    extensions: ["js", "mjs"],
    category: "text",
    description: "JavaScript source code",
    isBinary: false,
  },

  // Document formats
  {
    mimeType: "application/pdf",
    extensions: ["pdf"],
    category: "document",
    description: "Portable Document Format",
    isBinary: true,
  },
  {
    mimeType: "application/msword",
    extensions: ["doc"],
    category: "document",
    description: "Microsoft Word document",
    isBinary: true,
  },
  {
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    extensions: ["docx"],
    category: "document",
    description: "Microsoft Word Open XML document",
    isBinary: true,
  },
  {
    mimeType: "application/rtf",
    extensions: ["rtf"],
    category: "document",
    description: "Rich Text Format",
    isBinary: true,
  },
  {
    mimeType: "application/vnd.oasis.opendocument.text",
    extensions: ["odt"],
    category: "document",
    description: "OpenDocument Text Document",
    isBinary: true,
  },

  // Spreadsheet formats
  {
    mimeType: "text/csv",
    extensions: ["csv"],
    category: "spreadsheet",
    description: "Comma-separated values",
    isBinary: false,
  },
  {
    mimeType: "application/vnd.ms-excel",
    extensions: ["xls"],
    category: "spreadsheet",
    description: "Microsoft Excel spreadsheet",
    isBinary: true,
  },
  {
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extensions: ["xlsx"],
    category: "spreadsheet",
    description: "Microsoft Excel Open XML spreadsheet",
    isBinary: true,
  },
  {
    mimeType: "application/vnd.oasis.opendocument.spreadsheet",
    extensions: ["ods"],
    category: "spreadsheet",
    description: "OpenDocument Spreadsheet",
    isBinary: true,
  },

  // Presentation formats
  {
    mimeType: "application/vnd.ms-powerpoint",
    extensions: ["ppt"],
    category: "presentation",
    description: "Microsoft PowerPoint presentation",
    isBinary: true,
  },
  {
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    extensions: ["pptx"],
    category: "presentation",
    description: "Microsoft PowerPoint Open XML presentation",
    isBinary: true,
  },
  {
    mimeType: "application/vnd.oasis.opendocument.presentation",
    extensions: ["odp"],
    category: "presentation",
    description: "OpenDocument Presentation",
    isBinary: true,
  },

  // Data formats
  {
    mimeType: "application/json",
    extensions: ["json"],
    category: "data",
    description: "JSON data",
    isBinary: false,
  },
  {
    mimeType: "application/yaml",
    extensions: ["yaml", "yml"],
    category: "data",
    description: "YAML data",
    isBinary: false,
  },
  {
    mimeType: "application/xml",
    extensions: ["xml"],
    category: "data",
    description: "XML data",
    isBinary: false,
  },

  // Image formats
  {
    mimeType: "image/jpeg",
    extensions: ["jpg", "jpeg"],
    category: "image",
    description: "JPEG image",
    isBinary: true,
  },
  {
    mimeType: "image/png",
    extensions: ["png"],
    category: "image",
    description: "PNG image",
    isBinary: true,
  },
  {
    mimeType: "image/gif",
    extensions: ["gif"],
    category: "image",
    description: "GIF image",
    isBinary: true,
  },
  {
    mimeType: "image/svg+xml",
    extensions: ["svg"],
    category: "image",
    description: "SVG vector image",
    isBinary: false,
  },
  {
    mimeType: "image/webp",
    extensions: ["webp"],
    category: "image",
    description: "WebP image",
    isBinary: true,
  },
  {
    mimeType: "image/bmp",
    extensions: ["bmp"],
    category: "image",
    description: "BMP image",
    isBinary: true,
  },
  {
    mimeType: "image/tiff",
    extensions: ["tiff", "tif"],
    category: "image",
    description: "TIFF image",
    isBinary: true,
  },

  // Audio formats
  {
    mimeType: "audio/mpeg",
    extensions: ["mp3"],
    category: "audio",
    description: "MP3 audio",
    isBinary: true,
  },
  {
    mimeType: "audio/wav",
    extensions: ["wav"],
    category: "audio",
    description: "WAV audio",
    isBinary: true,
  },
  {
    mimeType: "audio/ogg",
    extensions: ["ogg"],
    category: "audio",
    description: "OGG audio",
    isBinary: true,
  },
  {
    mimeType: "audio/midi",
    extensions: ["mid", "midi"],
    category: "audio",
    description: "MIDI audio",
    isBinary: true,
  },

  // Video formats
  {
    mimeType: "video/mp4",
    extensions: ["mp4"],
    category: "video",
    description: "MP4 video",
    isBinary: true,
  },
  {
    mimeType: "video/webm",
    extensions: ["webm"],
    category: "video",
    description: "WebM video",
    isBinary: true,
  },
  {
    mimeType: "video/x-msvideo",
    extensions: ["avi"],
    category: "video",
    description: "AVI video",
    isBinary: true,
  },
  {
    mimeType: "video/quicktime",
    extensions: ["mov", "qt"],
    category: "video",
    description: "QuickTime video",
    isBinary: true,
  },

  // Archive formats
  {
    mimeType: "application/zip",
    extensions: ["zip"],
    category: "archive",
    description: "ZIP archive",
    isBinary: true,
  },
  {
    mimeType: "application/x-rar-compressed",
    extensions: ["rar"],
    category: "archive",
    description: "RAR archive",
    isBinary: true,
  },
  {
    mimeType: "application/x-7z-compressed",
    extensions: ["7z"],
    category: "archive",
    description: "7-Zip archive",
    isBinary: true,
  },
  {
    mimeType: "application/x-tar",
    extensions: ["tar"],
    category: "archive",
    description: "TAR archive",
    isBinary: true,
  },
  {
    mimeType: "application/gzip",
    extensions: ["gz"],
    category: "archive",
    description: "Gzip compressed file",
    isBinary: true,
  },
  {
    mimeType: "application/epub+zip",
    extensions: ["epub"],
    category: "archive",
    description: "Electronic Publication",
    isBinary: true,
  },

  // Font formats
  {
    mimeType: "font/ttf",
    extensions: ["ttf"],
    category: "font",
    description: "TrueType font",
    isBinary: true,
  },
  {
    mimeType: "font/otf",
    extensions: ["otf"],
    category: "font",
    description: "OpenType font",
    isBinary: true,
  },
  {
    mimeType: "font/woff",
    extensions: ["woff"],
    category: "font",
    description: "Web Open Font Format",
    isBinary: true,
  },
  {
    mimeType: "font/woff2",
    extensions: ["woff2"],
    category: "font",
    description: "Web Open Font Format 2.0",
    isBinary: true,
  },

  // 3D Model formats
  {
    mimeType: "model/stl",
    extensions: ["stl"],
    category: "model",
    description: "Stereolithography 3D model",
    isBinary: true,
  },
  {
    mimeType: "model/obj",
    extensions: ["obj"],
    category: "model",
    description: "Wavefront 3D model",
    isBinary: false,
  },
  {
    mimeType: "model/gltf-binary",
    extensions: ["glb"],
    category: "model",
    description: "GL Transmission Format Binary",
    isBinary: true,
  },
  {
    mimeType: "model/gltf+json",
    extensions: ["gltf"],
    category: "model",
    description: "GL Transmission Format JSON",
    isBinary: false,
  },
];

/**
 * Create a Map for quick MIME type lookup by extension
 */
export const MIME_BY_EXTENSION = new Map<string, string>();

/**
 * Create a Map for quick extension lookup by MIME type
 */
export const EXTENSION_BY_MIME = new Map<string, string>();

/**
 * Create a Map for quick MIME info lookup by MIME type
 */
export const MIME_INFO = new Map<string, MimeMapping>();

// Initialize the maps
for (const mapping of MIME_MAPPINGS) {
  for (const ext of mapping.extensions) {
    MIME_BY_EXTENSION.set(ext.toLowerCase(), mapping.mimeType);
  }
  EXTENSION_BY_MIME.set(mapping.mimeType.toLowerCase(), mapping.extensions[0]);
  MIME_INFO.set(mapping.mimeType.toLowerCase(), mapping);
}
