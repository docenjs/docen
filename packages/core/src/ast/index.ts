/**
 * AST (Abstract Syntax Tree) exports
 *
 * This file exports all AST node types from the various modules.
 */

// Export base types
export * from "./base";

// Export document-related types
export * from "./document";

// Export media-related types
export * from "./media";

// Export data-related types
export * from "./data";

// Export archive-related types
export * from "./archive";

// Export presentation-related types
export * from "./presentation";

import type { ContainerContent } from "./archive";
import type { DataContent } from "./data";
// Import types for the Content union
import type { DocumentContent } from "./document";
import type { MediaContent } from "./media";
import type { PresentationContent } from "./presentation";

// Redefine Content as the union of all content types
export type Content =
  | DocumentContent
  | MediaContent
  | DataContent
  | ContainerContent
  | PresentationContent;
