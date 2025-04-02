export * from "./document";
export * from "./types";
export * from "./adapters/base";

// Re-export Yjs types for convenience
export type { Doc, Text, Map, Array, UndoManager } from "yjs";

// Export all adapters
export * from "./adapters";

// Export awareness module
export * from "./awareness";
