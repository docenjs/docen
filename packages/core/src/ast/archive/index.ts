/**
 * Archive and container-related AST node exports
 *
 * This file exports all archive and container-related node types.
 */

// Re-export all archive-related types
export * from "./container";

// Import types for type definitions
import type {
  ArchiveContainer,
  Container,
  EPUBContainer,
  OOXMLContainer,
} from "./container";

/**
 * All container content types
 */
export type ContainerContent =
  | Container
  | ArchiveContainer
  | EPUBContainer
  | OOXMLContainer;
