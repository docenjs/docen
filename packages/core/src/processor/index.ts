/**
 * Processor module entry point
 *
 * This file exports all processor-related types, interfaces, and classes.
 */

// Re-export all interfaces
export * from "./interfaces";

// Re-export abstract implementations
export * from "./abstract";

// Export FullProcessor type that combines Parser and Generator capabilities
import type { Generator, Parser } from "./interfaces";

/**
 * Full processor interface that combines parsing and generation capabilities
 */
export interface FullProcessor extends Parser, Generator {}
