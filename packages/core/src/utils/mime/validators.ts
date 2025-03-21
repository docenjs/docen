import { MIME_INFO } from "./constants";
import type { MimeValidationResult } from "./types";

/**
 * Validate a MIME type string
 * @param mimeType The MIME type to validate
 * @returns Validation result
 */
export function validateMimeType(mimeType: string): MimeValidationResult {
  // Normalize MIME type
  const normalized = mimeType.toLowerCase();

  // Check if MIME type is in our known types
  const info = MIME_INFO.get(normalized);
  if (info) {
    return {
      isValid: true,
      category: info.category,
    };
  }

  // Check if it's a valid MIME type format
  const mimeTypeRegex = /^[a-z0-9]+\/[a-z0-9-+\.]+$/i;
  if (!mimeTypeRegex.test(normalized)) {
    return {
      isValid: false,
      error: "Invalid MIME type format",
    };
  }

  // Check if it's a known category
  const [type, subtype] = normalized.split("/");
  const knownTypes = [
    "text",
    "image",
    "audio",
    "video",
    "application",
    "font",
    "model",
  ];
  if (!knownTypes.includes(type)) {
    return {
      isValid: false,
      error: "Unknown MIME type category",
    };
  }

  // If we get here, it's a valid MIME type format but unknown to us
  return {
    isValid: true,
    category: "unknown",
  };
}

/**
 * Validate a file extension
 * @param extension The file extension to validate
 * @returns Validation result
 */
export function validateExtension(extension: string): MimeValidationResult {
  // Normalize extension
  const normalized = extension.toLowerCase().replace(/^\./, "");

  // Check if extension is in our known types
  const mimeType = MIME_INFO.get(normalized);
  if (mimeType) {
    return {
      isValid: true,
      category: mimeType.category,
      suggestedMimeType: mimeType.mimeType,
    };
  }

  // Check if it's a valid extension format
  const extensionRegex = /^[a-z0-9]+$/i;
  if (!extensionRegex.test(normalized)) {
    return {
      isValid: false,
      error: "Invalid file extension format",
    };
  }

  // If we get here, it's a valid extension format but unknown to us
  return {
    isValid: true,
    category: "unknown",
  };
}

/**
 * Validate if a MIME type matches a file extension
 * @param mimeType The MIME type to check
 * @param extension The file extension to check
 * @returns Validation result
 */
export function validateMimeTypeExtensionMatch(
  mimeType: string,
  extension: string,
): MimeValidationResult {
  const normalizedMimeType = mimeType.toLowerCase();
  const normalizedExtension = extension.toLowerCase().replace(/^\./, "");

  // Get MIME info for both
  const mimeInfo = MIME_INFO.get(normalizedMimeType);
  const extensionMimeType = MIME_INFO.get(normalizedExtension);

  if (!mimeInfo || !extensionMimeType) {
    return {
      isValid: false,
      error: "Unknown MIME type or extension",
    };
  }

  if (mimeInfo.mimeType !== extensionMimeType.mimeType) {
    return {
      isValid: false,
      error: "MIME type does not match extension",
      category: mimeInfo.category,
      suggestedMimeType: extensionMimeType.mimeType,
    };
  }

  return {
    isValid: true,
    category: mimeInfo.category,
  };
}
