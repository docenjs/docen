import { MIME_BY_EXTENSION, MIME_INFO } from "./constants";
import type { MimeDetectionOptions, MimeInfo } from "./types";
import { validateMimeType } from "./validators";

/**
 * Get MIME type from file extension
 * @param extension File extension (with or without leading dot)
 * @param options Detection options
 * @returns MIME type or undefined if unknown
 */
export function getMimeTypeFromExtension(
  extension: string,
  options: MimeDetectionOptions = {}
): string | undefined {
  // Normalize extension
  const normalized = extension.toLowerCase().replace(/^\./, "");

  // Check custom mappings first
  if (options.customMappings?.[normalized]) {
    const mimeType = options.customMappings[normalized];
    // Validate custom MIME type
    const validation = validateMimeType(mimeType);
    if (!validation.isValid) {
      return undefined;
    }
    return mimeType;
  }

  // Check our known mappings
  return MIME_BY_EXTENSION.get(normalized);
}

/**
 * Get file extension from MIME type
 * @param mimeType MIME type
 * @returns File extension (without leading dot) or undefined if unknown
 */
export function getExtensionFromMimeType(mimeType: string): string | undefined {
  const normalized = mimeType.toLowerCase();
  const info = MIME_INFO.get(normalized);
  return info?.extensions[0];
}

/**
 * Get MIME type information
 * @param mimeType MIME type
 * @returns MIME type information or undefined if unknown
 */
export function getMimeInfo(mimeType: string): MimeInfo | undefined {
  const normalized = mimeType.toLowerCase();
  const info = MIME_INFO.get(normalized);
  if (!info) return undefined;

  return {
    mimeType: info.mimeType,
    category: info.category,
    extensions: info.extensions,
    description: info.description,
    isBinary: info.isBinary,
  };
}

/**
 * Detect MIME type from file content
 * @param content File content buffer
 * @param options Detection options
 * @returns MIME type or undefined if unknown
 */
export function detectMimeTypeFromContent(
  content: Buffer,
  options: MimeDetectionOptions = {}
): string | undefined {
  // Check file signatures
  const signatures = [
    // PDF
    { signature: [0x25, 0x50, 0x44, 0x46], mimeType: "application/pdf" },
    // PNG
    { signature: [0x89, 0x50, 0x4e, 0x47], mimeType: "image/png" },
    // JPEG
    { signature: [0xff, 0xd8, 0xff], mimeType: "image/jpeg" },
    // GIF
    { signature: [0x47, 0x49, 0x46], mimeType: "image/gif" },
    // ZIP
    { signature: [0x50, 0x4b, 0x03, 0x04], mimeType: "application/zip" },
    // RAR
    {
      signature: [0x52, 0x61, 0x72, 0x21],
      mimeType: "application/x-rar-compressed",
    },
    // 7Z
    {
      signature: [0x37, 0x7a, 0xbc, 0xaf],
      mimeType: "application/x-7z-compressed",
    },
    // MP3
    { signature: [0x49, 0x44, 0x33], mimeType: "audio/mpeg" },
    // WAV
    { signature: [0x52, 0x49, 0x46, 0x46], mimeType: "audio/wav" },
    // MP4
    { signature: [0x66, 0x74, 0x79, 0x70], mimeType: "video/mp4" },
  ];

  for (const { signature, mimeType } of signatures) {
    if (content.length >= signature.length) {
      const matches = signature.every((byte, index) => content[index] === byte);
      if (matches) {
        // Validate detected MIME type
        const validation = validateMimeType(mimeType);
        if (!validation.isValid) {
          continue;
        }
        return mimeType;
      }
    }
  }

  // Check text encoding
  try {
    const text = content.toString("utf-8");
    if (text.startsWith("<?xml")) {
      const mimeType = "application/xml";
      const validation = validateMimeType(mimeType);
      if (validation.isValid) {
        return mimeType;
      }
    }
    if (text.startsWith("{")) {
      try {
        JSON.parse(text);
        const mimeType = "application/json";
        const validation = validateMimeType(mimeType);
        if (validation.isValid) {
          return mimeType;
        }
      } catch {
        // Not valid JSON
      }
    }
    if (text.startsWith("---")) {
      const mimeType = "application/yaml";
      const validation = validateMimeType(mimeType);
      if (validation.isValid) {
        return mimeType;
      }
    }
  } catch {
    // Not valid UTF-8
  }

  return undefined;
}

/**
 * Detect MIME type from file
 * @param file File object with name and content
 * @param options Detection options
 * @returns MIME type or undefined if unknown
 */
export function detectMimeType(
  file: { name: string; content: Buffer },
  options: MimeDetectionOptions = {}
): string | undefined {
  // Get extension from filename
  const extension = file.name.split(".").pop();
  if (!extension) return undefined;

  // Try to get MIME type from extension first
  const mimeType = getMimeTypeFromExtension(extension, options);
  if (mimeType) {
    // If strict mode is enabled, verify the content matches
    if (options.strict) {
      const contentMimeType = detectMimeTypeFromContent(file.content, options);
      if (contentMimeType && contentMimeType !== mimeType) {
        // Validate content-detected MIME type
        const validation = validateMimeType(contentMimeType);
        if (validation.isValid) {
          return contentMimeType;
        }
      }
    }
    return mimeType;
  }

  // If content checking is enabled, try to detect from content
  if (options.checkContent) {
    return detectMimeTypeFromContent(file.content, options);
  }

  return undefined;
}
