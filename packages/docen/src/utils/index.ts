import { fileTypeFromBuffer } from "file-type";
import type { FileTypeResult } from "file-type";

/**
 * Detect file type from buffer
 * @param buffer File content buffer
 * @returns File type information
 */
export async function detectFileType(
  buffer: ArrayBuffer,
): Promise<FileTypeResult> {
  const result = await fileTypeFromBuffer(buffer);
  if (!result) {
    throw new Error("Could not detect file type");
  }
  return result;
}

/**
 * Get file extension from path
 * @param path File path
 * @returns File extension without dot
 */
export function getFileExtension(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  if (!ext) {
    throw new Error("Invalid file path");
  }
  return ext;
}

/**
 * Check if file extension is supported
 * @param ext File extension
 * @returns Whether the extension is supported
 */
export function isSupportedExtension(ext: string): boolean {
  const supportedExtensions = [
    "pdf",
    "docx",
    "xlsx",
    "csv",
    "json",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
  ];

  return supportedExtensions.includes(ext.toLowerCase());
}

/**
 * Get MIME type for file extension
 * @param ext File extension
 * @returns MIME type
 */
export function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    csv: "text/csv",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };

  const mime = mimeTypes[ext.toLowerCase()];
  if (!mime) {
    throw new Error(`Unsupported file extension: ${ext}`);
  }

  return mime;
}
