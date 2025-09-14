/**
 * OOXML AST - Shared base package for OOXML document processing
 *
 * This package provides the foundation types and constants for working with
 * Office Open XML (OOXML) documents using the unified/unist ecosystem.
 * It extends xast to support DrawingML and other shared OOXML components.
 *
 * @module @docen/ooxast
 */

// Core type definitions
export * from "./types";

// DrawingML-specific types
export * from "./drawingml";

// Constants and namespaces
export * from "./constants";
