/**
 * Media-related AST node exports
 *
 * This file exports all media-related node types.
 */

// Re-export all media-related types
export * from "./audio";
export * from "./video";
export * from "./image";

// Import types for type definitions
import type { Audio, AudioTrack } from "./audio";

import type { Video, VideoTrack } from "./video";

import type { RichImage } from "./image";

/**
 * All media content types
 */
export type MediaContent = Audio | Video | RichImage;
