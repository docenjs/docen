/**
 * Registry module for Docen
 *
 * This file exports all registry-related types and implementations.
 */

// Export interfaces
export * from "./interfaces";

// Export implementations
export * from "./processor-registry";

// Import the processor registry implementation
import { ProcessorRegistryImpl } from "./processor-registry";

/**
 * Global default processor registry instance
 */
export const defaultRegistry = new ProcessorRegistryImpl();
