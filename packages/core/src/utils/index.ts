/**
 * Utility functions for Docen core
 *
 * This file provides common utility functions used across the Docen ecosystem.
 */

export * from "./mime";

/**
 * Export all utilities from undio library
 *
 * Undio provides type-safe utilities for converting between various JavaScript data types:
 * - ArrayBuffer, Base64, Blob, DataView, Number Array
 * - ReadableStream, NodeStream, Response, Text, Uint8Array
 *
 * Features include:
 * - Type-safe usage with runtime-type safety assertion
 * - Auto type detection and conversion
 * - Tree-shakable and compact build
 */
export * from "undio";
