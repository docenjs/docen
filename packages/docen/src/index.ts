/**
 * Docen - Universal document conversion and processing library
 *
 * Main entry point providing unified API for:
 * - Format processing: docen(format)
 * - Collaboration: docen.containers(type)
 */

import type { Container } from "@docen/containers";
import { createProcessor } from "@docen/core";
import type { DocenProcessor } from "@docen/core";

/**
 * Create a format processor
 */
export function docen(format: string): DocenProcessor {
  // For now, create a basic processor
  // Format-specific logic will be implemented later
  return createProcessor();
}

/**
 * Container creation namespace
 */
docen.containers = {
  /**
   * Create a new container of the specified type
   */
  create(type: "document" | "data" | "presentation"): Container {
    // This will use @docen/containers when it's properly built
    throw new Error(`Container creation for "${type}" not yet implemented`);
  },

  /**
   * Load an existing container from data
   */
  load(data: Uint8Array): Container {
    // This will be implemented to parse container data
    throw new Error("Container loading not yet implemented");
  },

  /**
   * Save a container to data
   */
  save(container: Container): Uint8Array {
    // This will be implemented to serialize container
    throw new Error("Container saving not yet implemented");
  },
};

/**
 * Re-export key types from sub-packages
 */
export type { DocenProcessor } from "@docen/core";

/**
 * Default export
 */
export default docen;
