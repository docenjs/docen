/**
 * Docen Core
 * A collaborative document processor with rich editing capabilities
 */

// Import main processor for re-export and default export
import { createDocenProcessor, docen } from "./processor";

// Re-export main processor
export * from "./processor";

// Export all types except conflicting ones
export * from "./types";

// Export all errors
export * from "./errors";

// Export core utilities
export * from "./utils";

// Export document-related functionality
export * from "./document";

// Export AST utilities
export * from "./ast";

// Export Yjs integration
export * from "./yjs";

// Export plugin system
export * from "./plugins";

// Default export
export default {
  createDocenProcessor,
  docen,
};
