/**
 * Main types module for Docen
 * Consolidates and re-exports type definitions from all modules
 */

// Re-export all modular types
export * from "./ast/types";
export * from "./yjs/types";
export * from "./document/types";
export * from "./processor/types";
export * from "./plugins/types";
export * from "./utils/types";

// No duplicate type definitions here - all types are imported from their respective modules
