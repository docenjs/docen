import type * as Hast from "hast";
import type { Properties } from "hast";
import * as Y from "yjs";
import type { HastYjsMapping } from "./types"; // Import from the new types file

/**
 * Defines how specific hast node types map to Yjs XML types.
 * This configuration will be used by the core YjsAdapter.
 */

// Helper function to stringify HAST properties to Yjs attributes
function stringifyProperties(
  properties: Properties | undefined,
): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (!properties) {
    return attrs;
  }

  for (const [key, value] of Object.entries(properties)) {
    if (key === "className" && Array.isArray(value)) {
      attrs.class = value.join(" ");
    } else if (key === "style" && typeof value === "string") {
      // Directly pass style string
      attrs.style = value;
    } else if (typeof value === "string") {
      attrs[key] = value;
    } else if (typeof value === "number") {
      attrs[key] = String(value);
    } else if (typeof value === "boolean") {
      // HTML boolean attributes: presence means true
      if (value) {
        attrs[key] = ""; // Or standardized to key name? Usually empty string is fine.
      }
      // If false, the attribute should not exist, so we don't add it.
    } else if (Array.isArray(value)) {
      // Handle other array properties if needed (e.g., data attributes?)
      // For now, join with space as a basic fallback
      attrs[key] = value.map(String).join(" ");
    }
    // Ignore null/undefined/objects/functions
  }
  return attrs;
}

// Mapping: hast element -> Y.XmlElement
export const hastElementMapping: HastYjsMapping = {
  type: "element",
  yjsType: Y.XmlElement,
  yjsTagName: (node: Hast.Element) => node.tagName,
  attributes: (node: Hast.Element) => stringifyProperties(node.properties),
  childrenBinding: "recursive",
};

// Mapping: hast text -> Y.XmlText
export const hastTextMapping: HastYjsMapping = {
  type: "text",
  yjsType: Y.XmlText,
  value: (node: Hast.Text) => node.value,
};

// Mapping: hast emphasis (em) -> Y.XmlElement named 'em'
// This is technically covered by hastElementMapping, but shown for clarity
// If specific handling is needed, a more specific mapping could be added.
// export const hastEmphasisMapping: HastYjsMapping = {
//   type: "element",
//   match: (node: Hast.Element) => node.tagName === 'em',
//   yjsType: Y.XmlElement,
//   yjsTagName: "em",
//   childrenBinding: "recursive",
// };

// TODO: Define mappings for other hast types: root, comment, doctype?

// Interface moved to types.ts
// export interface HastYjsMapping { ... }

// This array will hold all the default mappings
export const defaultHastMappings: HastYjsMapping[] = [
  hastElementMapping, // General element mapping
  hastTextMapping,
  // hastEmphasisMapping, // Add if specific handling needed
  // ... add other mappings here
];
