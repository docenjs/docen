/**
 * XML processor for Docen
 *
 * This file exports the XML processor functionality.
 */

// Export parser and generator
export * from "./parser";
export * from "./generator";
export * from "./register";

/**
 * Parse XML string into DOM Document
 */
export function parseXML(content: string): XMLDocument {
  if (typeof window === "undefined") {
    throw new Error("XML parsing is only supported in browser environments");
  }
  const parser = new DOMParser();
  return parser.parseFromString(content, "text/xml");
}
