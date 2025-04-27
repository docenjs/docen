// ast/vml.ts
// Defines AST nodes specific to Vector Markup Language (VML)
// Note: VML is a legacy format, often used for shapes/drawings in older Office versions or for specific features like comments.

import type {
  OoxmlData,
  OoxmlNode,
  OoxmlParent,
  // Import shared formatting types if needed
} from "./shared";

// --- VML Specific Element Types --- //

/*
Example VML node structure (placeholders):

// Represents a VML shape (<v:shape>)
export interface OoxmlVmlShape extends XastElement {
  // VML elements are typically just XastElements with specific names/attributes
  // type: "element", name: "v:shape" (or other v: tag)
  data?: OoxmlData & {
    ooxmlType: "vmlShape";
    properties?: { // Extracted from attributes or sub-elements
      style?: string;
      fillColor?: string;
      strokeColor?: string;
      // ... other VML specific properties
    };
    // VML often contains embedded content like text boxes (<v:textbox>)
    // which might contain WML content.
    // This relation needs careful modeling if required.
  };
}

// Represents a VML textbox content area (<v:textbox> -> <w:txbxContent>)
// This might contain WML block content.
export interface OoxmlVmlTextboxContent extends OoxmlParent {
    type: "element";
    name: "vmlTextboxContent"; // Custom name for the abstraction
    children: import("./wml").OoxmlBlockContent[];
    data?: OoxmlData & { ooxmlType: "vmlTextboxContent" };
}

*/

// --- VML Content Union Types (if needed) --- //
// export type VmlContent = OoxmlVmlShape | ...;
