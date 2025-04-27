// ast/dml.ts
// Defines types related to DrawingML

import type {
  PositionalProperties,
  // Keep XastElement if used later, e.g., for VML
  // XastElement
} from "./shared";

// Possible DrawingML ooxmlType values
export type DmlDrawingType = "drawing";
export type DmlImageType = "image"; // Maybe needed?

// Union of DML types
export type DmlOoxmlType = DmlDrawingType | DmlImageType;

// Properties for a Drawing element (placeholder structure)
export interface DmlDrawingProperties {
  relationId?: string;
  fileName?: string;
  title?: string;
  description?: string;
  position?: PositionalProperties; // Reusing shared position properties
  size?: { width: number | string; height: number | string }; // Reusing shared size
}

// Placeholder for Image properties if needed separately
export interface DmlImageProperties {
  relationId: string;
  fileName?: string;
  // ... other image specific props
}

// REMOVED DmlDrawing, DmlImage interfaces
// Use XastElement with data.ooxmlType = 'drawing'/'image'
