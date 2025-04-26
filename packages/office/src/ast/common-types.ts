import type { Node } from "unist";
// Import specific node types from xast directly
import type {
  Cdata,
  Comment,
  Doctype,
  Element,
  Instruction,
  Root,
  Text,
  Parent as XastParentType,
} from "xast";

/**
 * Common styling and property interfaces for OOXML AST nodes.
 */

// Removed the manually added XAST types. We will rely on @types/xast instead.

// --- Base Types ---
// Re-export imported xast types with aliases for clarity
export type {
  Element as XastElement,
  Text as XastText,
  Root as XastRoot,
  Instruction as XastInstruction,
  Doctype as XastDoctype,
  Comment as XastComment,
  Cdata as XastCdata,
  XastParentType as XastParent, // Re-export the xast Parent type
};

// Define the XastNode union type locally using imported types (use original names)
export type XastNode =
  | Root
  | Element
  | Text
  | Instruction
  | Doctype
  | Comment
  | Cdata;

// Base OOXML node, extending unist Node.
// Primarily intended for custom OOXML nodes (List, ListItem, Image, etc.)
// that don't directly extend XastElement/XastText.
export interface OoxmlNode extends Node {
  properties?: Record<string, any>; // Keep for non-data properties on custom nodes?
  collaborationMetadata?: {
    createdBy?: string;
    createdAt?: number;
    modifiedBy?: string;
    modifiedAt?: number;
    version?: number;
    lastModifiedTimestamp?: number;
  };
  data?: Node["data"] & {
    // Ensure custom nodes can also have ooxmlType/properties in data
    ooxmlType?: string;
    properties?: Record<string, any>;
  };
}

export interface FontProperties {
  name?: string; // Font name (e.g., 'Calibri')
  size?: number; // Font size (e.g., in points or half-points depending on source)
  color?: string; // Hex color (e.g., 'FF0000') or theme color reference
  bold?: boolean;
  italic?: boolean;
  underline?:
    | "single"
    | "double"
    | "dotted"
    | "dashed"
    | "wave"
    | "none"
    | string; // OOXML supports many underline types
  strike?: boolean; // Single strikethrough
  doubleStrike?: boolean; // Double strikethrough
  verticalAlign?: "baseline" | "superscript" | "subscript";
  language?: string; // e.g., 'en-US'
  highlight?: string; // Highlight color
  effect?:
    | "shadow"
    | "outline"
    | "emboss"
    | "engrave"
    | "smallCaps"
    | "allCaps"
    | "vanish"
    | "webHidden"; // Simplified representation
  // Add other properties like character spacing, kerning etc. if needed
}

export interface IndentationProperties {
  left?: number | string; // Value and unit (e.g., { value: 720, unit: 'dxa' } or string '1in') - Need to decide on representation
  right?: number | string;
  firstLine?: number | string;
  hanging?: number | string;
}

export interface SpacingProperties {
  before?: number | string; // Value and unit
  after?: number | string;
  line?: number | string; // Line spacing value
  lineRule?: "auto" | "exact" | "atLeast"; // Line spacing rule
}

export interface NumberingProperties {
  id: string; // ID of the numbering definition (numId in OOXML)
  level: number; // Indentation level (ilvl in OOXML)
}

export interface ParagraphFormatting {
  alignment?:
    | "left"
    | "center"
    | "right"
    | "justify"
    | "start"
    | "end"
    | "distribute";
  indentation?: IndentationProperties;
  spacing?: SpacingProperties;
  keepNext?: boolean; // Keep with next paragraph
  keepLines?: boolean; // Keep lines together
  widowControl?: boolean;
  outlineLevel?: number; // Heading level
  pageBreakBefore?: boolean;
  styleId?: string; // Reference to a defined paragraph style
  numbering?: NumberingProperties; // Reference to list numbering
  borders?: BorderProperties; // Paragraph borders (distinct from table/cell borders)
  fill?: FillProperties; // Paragraph shading
  // Add tabs, text direction etc.
}

export interface BorderStyleProperties {
  style?:
    | "single"
    | "double"
    | "dotted"
    | "dashed"
    | "thick"
    | "inset"
    | "outset"
    | "nil"
    | string; // OOXML has many border styles
  size?: number; // Width (e.g., in 1/8 points)
  color?: string; // Hex color or theme color reference
  space?: number; // Space between border and content
}

export interface BorderProperties {
  top?: BorderStyleProperties;
  bottom?: BorderStyleProperties;
  left?: BorderStyleProperties;
  right?: BorderStyleProperties;
  insideH?: BorderStyleProperties; // Horizontal inner borders (tables)
  insideV?: BorderStyleProperties; // Vertical inner borders (tables)
  // Diagonal borders for cells?
  // diagonalUp?: boolean | BorderStyleProperties;
  // diagonalDown?: boolean | BorderStyleProperties;
}

export interface FillProperties {
  type?: "solid" | "pattern" | "gradient" | "none";
  color?: string; // Foreground color (solid fill or pattern fg)
  patternType?: string; // e.g., 'solid', 'darkGray', 'mediumGray'
  patternColor?: string; // Background color for pattern
  // Add gradient properties if needed
}

export interface PositionalProperties {
  // Represents DrawingML positioning - complex topic
  // Simplified representation for now
  positionH?: {
    relativeTo: "page" | "margin" | "column" | "character" | "inline"; // Relative base
    align?: "left" | "center" | "right" | "inside" | "outside"; // Alignment relative to base
    offset?: number | string; // Absolute offset
  };
  positionV?: {
    relativeTo:
      | "page"
      | "margin"
      | "line"
      | "paragraph"
      | "topMargin"
      | "bottomMargin";
    align?: "top" | "center" | "bottom" | "inside" | "outside";
    offset?: number | string;
  };
  size: {
    // Extent
    width: number | string; // Value and unit (e.g., EMUs, inches, cm)
    height: number | string;
  };
  wrap?: {
    // Text wrapping
    type:
      | "square"
      | "tight"
      | "through"
      | "topAndBottom"
      | "behindText"
      | "inFrontOfText"
      | "inline";
    side?: "both" | "left" | "right" | "largest";
    distance?: { top?: number; bottom?: number; left?: number; right?: number }; // Distance from text
  } | null; // Null for inline
  zIndex?: number; // Stacking order (optional)
  locked?: boolean; // Anchor locked?
  layoutInCell?: boolean; // Relevant for tables
}

// --- Shared Resource Placeholder Interfaces (Enhanced for Numbering) ---

export interface SharedStyleDefinition {
  styleId: string;
  name?: string;
  basedOn?: string;
  isDefault?: boolean;
  type: "paragraph" | "character" | "table" | "numbering";
  paragraphProps?: ParagraphFormatting;
  runProps?: FontProperties;
  tableProps?: any;
}

// Represents a level definition within an abstract numbering scheme (<w:lvl> in <w:abstractNum>)
export interface SharedNumberingLevelDefinition {
  level: number;
  start?: number; // <w:start w:val="..."/>
  format?: string; // <w:numFmt w:val="..."/> (e.g., 'decimal', 'bullet', 'lowerLetter')
  text?: string; // <w:lvlText w:val="..."/> (e.g., '%1.')
  jc?: ParagraphFormatting["alignment"]; // <w:lvlJc w:val="..."/>
  pPr?: ParagraphFormatting; // Paragraph properties for this level <w:pPr>
  rPr?: FontProperties; // Run properties for the number/bullet itself <w:rPr>
}

// Represents an abstract numbering definition (<w:abstractNum>)
export interface SharedAbstractNumDefinition {
  abstractNumId: string; // <w:abstractNumId w:val="..."/>
  name?: string; // <w:name w:val="..."/>
  multiLevelType?: string; // <w:multiLevelType w:val="..."/> (e.g., 'multilevel', 'hybridMultilevel')
  levels: Record<number, SharedNumberingLevelDefinition>; // Keyed by level index
}

// Represents a concrete numbering instance (<w:num>)
export interface SharedNumInstanceDefinition {
  numId: string; // <w:numId w:val="..."/>
  abstractNumId: string; // <w:abstractNumId w:val="..."/> - Links to abstract definition
  levelOverrides?: {
    // Optional overrides for specific levels <w:lvlOverride>
    [level: number]: Partial<SharedNumberingLevelDefinition>;
  };
}

export interface SharedTheme {
  definition?: any;
}
export interface SharedFont {
  definition?: any;
}
export interface SharedDocumentDefaults {
  paragraph?: ParagraphFormatting;
  run?: FontProperties;
}

export interface SharedResources {
  styles?: Record<string, SharedStyleDefinition>; // Keyed by styleId
  defaults?: SharedDocumentDefaults;
  // Store both abstract definitions and concrete instances
  abstractNumbering?: Record<string, SharedAbstractNumDefinition>; // Keyed by abstractNumId
  numberingInstances?: Record<string, SharedNumInstanceDefinition>; // Keyed by numId
  themes?: SharedTheme[];
  fonts?: SharedFont[];
}

// --- Value types requiring specific units or parsing ---
// Example: could define a type for OOXML measurements like DXA, EMU, etc.
// type OoxmlMeasurement = { value: number; unit: 'dxa' | 'emu' | 'pt' | 'in' | 'cm' };
