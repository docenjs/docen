/**
 * Presentation-related AST node exports
 *
 * This file exports all presentation-related node types.
 */

// Re-export all presentation-related types
export * from "./slide";
export * from "./theme";

// Import types for type definitions
import type { Slide, SlideLayout, SlideMaster } from "./slide";
import type { Theme } from "./theme";

/**
 * All presentation content types
 */
export type PresentationContent = Slide | SlideLayout | SlideMaster | Theme;
