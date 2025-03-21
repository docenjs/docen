/**
 * MIME type related type definitions
 */

/**
 * MIME type category
 */
export type MimeCategory =
  | "text"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "data"
  | "image"
  | "audio"
  | "video"
  | "archive"
  | "font"
  | "model"
  | "application"
  | "unknown";

/**
 * MIME type validation result
 */
export interface MimeValidationResult {
  isValid: boolean;
  category?: MimeCategory;
  suggestedMimeType?: string;
  error?: string;
}

/**
 * MIME type detection options
 */
export interface MimeDetectionOptions {
  /**
   * Whether to check file content for MIME type detection
   * @default false
   */
  checkContent?: boolean;

  /**
   * Whether to use strict validation
   * @default false
   */
  strict?: boolean;

  /**
   * Custom MIME type mappings
   */
  customMappings?: Record<string, string>;
}

/**
 * MIME type information
 */
export interface MimeInfo {
  mimeType: string;
  category: MimeCategory;
  extensions: string[];
  description: string;
  isBinary: boolean;
}

/**
 * MIME type mapping entry
 */
export interface MimeMapping {
  mimeType: string;
  extensions: string[];
  category: MimeCategory;
  description: string;
  isBinary: boolean;
}
