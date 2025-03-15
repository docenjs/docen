/**
 * Utility functions for Docen core
 *
 * This file provides common utility functions used across the Docen ecosystem.
 */

/**
 * Detect MIME type from file extension
 *
 * @param extension File extension (with or without leading dot)
 * @returns MIME type or undefined if unknown
 */
export function getMimeTypeFromExtension(
  extension: string,
): string | undefined {
  // Normalize extension by removing leading dot if present
  const ext = extension.startsWith(".") ? extension.substring(1) : extension;

  // Common document formats
  const mimeTypes: Record<string, string> = {
    // Text formats
    txt: "text/plain",
    md: "text/markdown",
    markdown: "text/markdown",
    html: "text/html",
    htm: "text/html",
    xml: "application/xml",
    rtf: "application/rtf",

    // Document formats
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Spreadsheet formats
    csv: "text/csv",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // Presentation formats
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Data formats
    json: "application/json",
    yaml: "application/yaml",
    yml: "application/yaml",

    // Image formats
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    svg: "image/svg+xml",
    webp: "image/webp",

    // Audio formats
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",

    // Video formats
    mp4: "video/mp4",
    webm: "video/webm",
    avi: "video/x-msvideo",

    // Archive formats
    zip: "application/zip",
    rar: "application/vnd.rar",
    epub: "application/epub+zip",
  };

  return mimeTypes[ext.toLowerCase()];
}

/**
 * Get file extension from MIME type
 *
 * @param mimeType MIME type
 * @returns File extension (without leading dot) or undefined if unknown
 */
export function getExtensionFromMimeType(mimeType: string): string | undefined {
  // Common MIME types
  const extensions: Record<string, string> = {
    // Text formats
    "text/plain": "txt",
    "text/markdown": "md",
    "text/html": "html",
    "application/xml": "xml",
    "application/rtf": "rtf",

    // Document formats
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",

    // Spreadsheet formats
    "text/csv": "csv",
    "application/vnd.ms-excel": "xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",

    // Presentation formats
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",

    // Data formats
    "application/json": "json",
    "application/yaml": "yaml",

    // Image formats
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/webp": "webp",

    // Audio formats
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",

    // Video formats
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/x-msvideo": "avi",

    // Archive formats
    "application/zip": "zip",
    "application/vnd.rar": "rar",
    "application/epub+zip": "epub",
  };

  return extensions[mimeType.toLowerCase()];
}

/**
 * Detect file type from file extension or MIME type
 *
 * @param input File extension or MIME type
 * @returns Normalized file type category
 */
export function detectFileType(input: string): string {
  // Normalize input
  const normalized = input.toLowerCase();

  // Text formats
  const textFormats = [
    "text/plain",
    "text/markdown",
    "text/html",
    "text/xml",
    "application/xml",
    "txt",
    "md",
    "markdown",
    "html",
    "htm",
    "xml",
  ];

  // Document formats
  const documentFormats = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/rtf",
    "pdf",
    "doc",
    "docx",
    "rtf",
  ];

  // Spreadsheet formats
  const spreadsheetFormats = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "csv",
    "xls",
    "xlsx",
  ];

  // Presentation formats
  const presentationFormats = [
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "ppt",
    "pptx",
  ];

  // Data formats
  const dataFormats = [
    "application/json",
    "application/yaml",
    "json",
    "yaml",
    "yml",
  ];

  // Image formats
  const imageFormats = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "image/webp",
    "jpg",
    "jpeg",
    "png",
    "gif",
    "svg",
    "webp",
  ];

  // Audio formats
  const audioFormats = [
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
    "mp3",
    "wav",
    "ogg",
  ];

  // Video formats
  const videoFormats = [
    "video/mp4",
    "video/webm",
    "video/x-msvideo",
    "mp4",
    "webm",
    "avi",
  ];

  // Archive formats
  const archiveFormats = [
    "application/zip",
    "application/vnd.rar",
    "application/epub+zip",
    "zip",
    "rar",
    "epub",
  ];

  // Check which category the input belongs to
  if (textFormats.includes(normalized)) return "text";
  if (documentFormats.includes(normalized)) return "document";
  if (spreadsheetFormats.includes(normalized)) return "spreadsheet";
  if (presentationFormats.includes(normalized)) return "presentation";
  if (dataFormats.includes(normalized)) return "data";
  if (imageFormats.includes(normalized)) return "image";
  if (audioFormats.includes(normalized)) return "audio";
  if (videoFormats.includes(normalized)) return "video";
  if (archiveFormats.includes(normalized)) return "archive";

  // Default to unknown
  return "unknown";
}

/**
 * Export all utilities from undio library
 *
 * Undio provides type-safe utilities for converting between various JavaScript data types:
 * - ArrayBuffer, Base64, Blob, DataView, Number Array
 * - ReadableStream, NodeStream, Response, Text, Uint8Array
 *
 * Features include:
 * - Type-safe usage with runtime-type safety assertion
 * - Auto type detection and conversion
 * - Tree-shakable and compact build
 */
export * from "undio";
