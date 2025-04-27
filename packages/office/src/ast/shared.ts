// ast/shared.ts
// Defines shared properties, types, and interfaces used across different OOXML schemas (WML, SML, PML, DML)
// Also includes base OOXML AST node definitions aligned with unist and xast.

// Import specific node types from xast directly
import type {
  Attributes as XastAttributes,
  Cdata as XastCdata,
  Comment as XastComment,
  Data as XastData,
  Doctype as XastDoctype,
  Element as XastElement,
  ElementContent as XastElementContent,
  Instruction as XastInstruction,
  Node as XastNode,
  Parent as XastParent,
  Root as XastRoot,
  Text as XastText,
} from "xast";

// Ensure CollaborationMetadata is imported or defined if not already
import type { CollaborationMetadata } from "@docen/core"; // Import from core

// Define the OOXML Data enrichment interface
export interface OoxmlData extends XastData {
  ooxmlType?: string; // Semantic OOXML type (e.g., 'paragraph', 'textRun')
  properties?: Record<string, any>; // Parsed OOXML properties
  relationId?: string;
  collaborationMetadata?: CollaborationMetadata; // Use specific type
}

// Define a specific data type for the Root node
export interface OoxmlRootData extends OoxmlData {
  sharedResources?: SharedResources;
  metadata?: Record<string, any>; // Add optional metadata field
  // Add other root-specific metadata if needed
}

// --- Utility Types ---

/** Represents boolean-like values often found in OOXML ('on', 'off', '1', '0', true, false, or omitted). */
export type OnOffValue = boolean | "on" | "off" | "1" | "0";

/** Represents a measurement value with its unit. */
export type MeasurementUnit =
  | "dxa" // Twentieths of a point (Word)
  | "pt" // Points
  | "in" // Inches
  | "cm" // Centimeters
  | "mm" // Millimeters
  | "emu" // English Metric Units (DrawingML)
  | "pct" // Percentage (often for table widths)
  | "auto"; // Automatic sizing

export interface Measurement {
  value: number;
  unit: MeasurementUnit;
}

/** Represents a value that can be a specific measurement or 'auto'. */
export type MeasurementOrAuto = Measurement | "auto";

/** Represents a value that can be a measurement or a percentage. */
export type MeasurementOrPercent = Measurement | { value: number; unit: "pct" };

// --- OOXML Extended Node Types ---

// Base OoxmlNode interface extending original XastNode
export interface OoxmlNode extends XastNode {
  data?: OoxmlData;
}

// Specific Ooxml types extending original Xast types
export interface OoxmlElement extends XastElement {
  data?: OoxmlData;
  children: OoxmlElementContent[];
}

export interface OoxmlText extends XastText {
  data?: OoxmlData;
}

export interface OoxmlRoot extends XastRoot {
  data?: OoxmlData;
  children: OoxmlElementContent[];
}

export interface OoxmlInstruction extends XastInstruction {
  data?: OoxmlData;
}
export interface OoxmlComment extends XastComment {
  data?: OoxmlData;
}
export interface OoxmlDoctype extends XastDoctype {
  data?: OoxmlData;
}
export interface OoxmlCdata extends XastCdata {
  data?: OoxmlData;
}

// OoxmlParent extending original XastParent
export interface OoxmlParent extends XastParent {
  data?: OoxmlData;
  children: OoxmlElementContent[];
}

// Union type for any Ooxml node
export type AnyOoxmlNode =
  | OoxmlRoot
  | OoxmlElement
  | OoxmlText
  | OoxmlComment
  | OoxmlInstruction
  | OoxmlDoctype
  | OoxmlCdata;

// Define Ooxml-specific type aliases
export type OoxmlAttributes = XastAttributes; // Alias for clarity
export type OoxmlElementContent = XastElementContent;

// --- Shared Formatting Properties (Consolidated from common-types.ts and shared.ts) --- //

/**
 * Defines comprehensive font properties based on common-types.ts.
 */
export interface FontProperties {
  name?: string; // Font name (e.g., 'Calibri') <w:rFonts w:ascii=".." w:hAnsi=".." w:cs=".." w:eastAsia=".."/>
  size?: Measurement; // Font size (usually half-points, e.g., { value: 24, unit: 'pt' } for 12pt) <w:sz w:val="24"/>
  color?: ColorDefinition; // <w:color w:val="auto|hex" w:themeColor="..." w:themeTint="..." w:themeShade="..."/>
  bold?: OnOffValue; // <w:b/> or <w:b w:val="false|true|0|1"/>
  italic?: OnOffValue; // <w:i/>
  underline?: {
    // <w:u w:val="..." w:color="..." w:themeColor="..."/>
    style?: string; // OOXML underline types: single, double, thick, dotted, dashed, wave, etc.
    color?: ColorDefinition;
  };
  strike?: OnOffValue; // Single strikethrough <w:strike/>
  doubleStrike?: OnOffValue; // Double strikethrough <w:dstrike/>
  vertAlign?: "baseline" | "superscript" | "subscript"; // <w:vertAlign w:val="..."/>
  language?: string; // e.g., 'en-US' <w:lang w:val="en-US"/>
  highlight?: string | ColorDefinition; // Highlight color <w:highlight w:val="yellow|green|..."/>
  effect?: // <w:effect w:val="..."/>
  | "shadow"
    | "outline"
    | "emboss"
    | "engrave"
    | "smallCaps" // <w:smallCaps/>
    | "allCaps" // <w:caps/>
    | "vanish" // <w:vanish/>
    | "webHidden"; // <w:webHidden/>
  // Add other common font properties:
  spacing?: Measurement; // Character spacing adjustment <w:spacing w:val="..."/> (twips)
  kerning?: Measurement; // Minimum font size for kerning <w:kern w:val="..."/> (half-points)
  position?: Measurement; // Raised/lowered text <w:position w:val="..."/> (half-points)
  fitText?: {
    // <w:fitText w:val="..." w:id="..."/>
    width: Measurement;
    id?: number;
  };
  styleId?: string; // Reference to a character style <w:rStyle w:val="..."/>
  // TODO: Add more effects like reflection, glow, textFill, outline properties from DML?
}

/**
 * Defines comprehensive paragraph formatting properties.
 */
export interface ParagraphFormatting {
  alignment?: // <w:jc w:val="..."/>
  | "left"
    | "center"
    | "right"
    | "justify"
    | "start" // Logical left
    | "end" // Logical right
    | "distribute"
    | "both"; // Justified (legacy)
  indentation?: IndentationProperties; // <w:ind .../>
  spacing?: SpacingProperties; // <w:spacing .../>
  keepNext?: OnOffValue; // Keep with next paragraph <w:keepNext/>
  keepLines?: OnOffValue; // Keep lines together <w:keepLines/>
  widowControl?: OnOffValue; // <w:widowControl/>
  outlineLevel?: number; // Heading level <w:outlineLvl w:val="..."/>
  pageBreakBefore?: OnOffValue; // <w:pageBreakBefore/>
  styleId?: string; // Reference to a defined paragraph style <w:pStyle w:val="..."/>
  numbering?: NumberingProperties; // <w:numPr>...</w:numPr>
  borders?: ParagraphBorderProperties; // <w:pBdr>...</w:pBdr>
  shading?: ShadingProperties; // <w:shd .../> Paragraph background/shading
  tabs?: TabStop[]; // <w:tabs>...</w:tabs>
  runProperties?: FontProperties; // Default run properties for the paragraph <w:rPr> inside <w:pPr>
  textDirection?: "lrTb" | "tbRl" | "btLr" | "lrTbV" | "tbRlV" | "tbLrV"; // <w:textDirection w:val="..."/>
  thematicBreak?: boolean; // Added to represent a horizontal rule / thematic break
  // Add more: contextualSpacing, mirrorIndents, suppressAutoHyphens, etc.
}

/**
 * Defines indentation properties. All values are typically Measurements (e.g., Twips).
 */
export interface IndentationProperties {
  left?: MeasurementOrAuto; // <w:ind w:left="..." />
  right?: MeasurementOrAuto; // <w:ind w:right="..." />
  firstLine?: Measurement; // <w:ind w:firstLine="..." />
  hanging?: Measurement; // <w:ind w:hanging="..." />
  // Add start/end for logical directions if needed <w:ind w:start="..." w:end="..."/>
}

/**
 * Defines spacing properties. All values are typically Measurements (e.g., Twips or Points).
 */
export interface SpacingProperties {
  before?: MeasurementOrAuto; // <w:spacing w:before="..."/>
  after?: MeasurementOrAuto; // <w:spacing w:after="..."/>
  line?: MeasurementOrPercent; // <w:spacing w:line="..." /> (Line spacing value, e.g., 240 = single, 360 = 1.5 lines, 480 = double)
  lineRule?: "auto" | "exact" | "atLeast"; // <w:spacing w:lineRule="..." />
  beforeAutospacing?: OnOffValue; // <w:spacing w:beforeAutospacing="..."/>
  afterAutospacing?: OnOffValue; // <w:spacing w:afterAutospacing="..."/>
}

/**
 * Defines numbering properties reference used in ParagraphFormatting.
 * Based on common-types.ts NumberingProperties.
 */
export interface NumberingProperties {
  id: string; // ID of the numbering definition (numId in OOXML)
  level: number; // Indentation level (ilvl in OOXML)
}

/**
 * Defines comprehensive border style properties.
 * Based on common-types.ts BorderStyleProperties.
 */
export interface BorderStyleProperties {
  style?: string; // OOXML border styles: single, double, dotted, dashed, thick, wave, etc. <w:bdr w:val="..."/>
  size?: Measurement; // Width (e.g., in 1/8 points) <w:bdr w:sz="..."/>
  color?: ColorDefinition; // <w:bdr w:color="..." w:themeColor="..."/>
  space?: Measurement; // Space between border and content (points) <w:bdr w:space="..."/>
  shadow?: OnOffValue; // <w:bdr w:shadow="..."/>
  frame?: OnOffValue; // <w:bdr w:frame="..."/>
}

/**
 * Defines border properties for paragraphs (top, bottom, left, right, between).
 */
export interface ParagraphBorderProperties {
  top?: BorderStyleProperties; // <w:top .../>
  bottom?: BorderStyleProperties; // <w:bottom .../>
  left?: BorderStyleProperties; // <w:left .../>
  right?: BorderStyleProperties; // <w:right .../>
  between?: BorderStyleProperties; // <w:between .../> (Border between paragraphs with same settings)
  bar?: BorderStyleProperties; // <w:bar .../> (Vertical bar on the outside edge)
}

/**
 * Defines border properties for tables/cells (includes insideH, insideV).
 */
export interface TableBorderProperties extends ParagraphBorderProperties {
  insideH?: BorderStyleProperties; // Horizontal inner borders <w:insideH .../>
  insideV?: BorderStyleProperties; // Vertical inner borders <w:insideV .../>
  // Diagonals for cells
  tl2br?: BorderStyleProperties; // Top-left to bottom-right <w:tl2br .../>
  tr2bl?: BorderStyleProperties; // Top-right to bottom-left <w:tr2bl .../>
}

/**
 * Defines shading/fill properties. Similar to FillProperties but may be context-specific.
 * Used for paragraph, table, cell backgrounds. <w:shd w:val="..." w:color="..." w:fill="..."/>
 */
export interface ShadingProperties {
  pattern?: string; // e.g., 'clear', 'solid', 'pct10', 'diagStripe' etc. (w:val)
  color?: ColorDefinition; // Foreground color (w:color)
  fillColor?: ColorDefinition; // Background color (w:fill)
  // Theme colors can be part of ColorDefinition
}

/** @deprecated Use ShadingProperties instead for clarity in WML context. */
export interface FillProperties extends ShadingProperties {} // Keep for potential compatibility? Re-evaluate later.

/**
 * Defines color properties (can be simple hex or theme-based).
 * Based on shared.ts ColorDefinition.
 */
export interface ColorDefinition {
  value?: string; // Hex value (e.g., 'FF0000')
  themeColor?: string; // e.g., 'accent1', 'dark1'
  themeTint?: number; // 0-1 range usually
  themeShade?: number; // 0-1 range usually
}

/**
 * Defines positional properties for DrawingML objects.
 * Based on common-types.ts PositionalProperties.
 */
export interface PositionalProperties {
  positionH?: {
    relativeTo: "page" | "margin" | "column" | "character" | "inline";
    align?: "left" | "center" | "right" | "inside" | "outside";
    offset?: number | string;
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
    width: number | string;
    height: number | string;
  };
  wrap?: {
    type:
      | "square"
      | "tight"
      | "through"
      | "topAndBottom"
      | "behindText"
      | "inFrontOfText"
      | "inline";
    side?: "both" | "left" | "right" | "largest";
    distance?: { top?: number; bottom?: number; left?: number; right?: number };
  } | null;
  zIndex?: number;
  locked?: boolean;
  layoutInCell?: boolean;
}

// --- Shared Structural Definitions (Consolidated) --- //

/**
 * Represents a comment definition, potentially shared across OOXML types.
 */
export interface SharedCommentDefinition {
  id: string;
  author?: string;
  initials?: string;
  date?: string;
  // Children are processed XastNodes (Elements, Text, etc.)
  children?: OoxmlElementContent[];
}

/**
 * Represents a footnote definition.
 */
export interface SharedFootnoteDefinition {
  id: string;
  type?:
    | "normal"
    | "separator"
    | "continuationSeparator"
    | "continuationNotice"; // Optional w:type
  children: OoxmlElementContent[]; // Content of the footnote
}

/**
 * Represents an endnote definition.
 */
export interface SharedEndnoteDefinition {
  id: string;
  type?:
    | "normal"
    | "separator"
    | "continuationSeparator"
    | "continuationNotice"; // Optional w:type
  children: OoxmlElementContent[]; // Content of the endnote
}

/**
 * Represents shared resources like styles, numbering definitions, themes, comments.
 * Combines definitions from both files, favoring the more detailed common-types structure for numbering.
 */
export interface SharedResources {
  styles?: Record<string, SharedStyleDefinition>; // Keyed by styleId
  defaults?: SharedDocumentDefaults; // From common-types
  abstractNumbering?: Record<string, SharedAbstractNumDefinition>; // Keyed by abstractNumId
  numberingInstances?: Record<string, SharedNumInstanceDefinition>; // Keyed by numId
  themes?: SharedTheme[]; // From common-types (use specific type if defined later)
  fonts?: SharedFont[]; // From common-types (use specific type if defined later)
  settings?: any; // Placeholder from shared.ts
  comments?: Record<string, SharedCommentDefinition>; // Updated to use SharedCommentDefinition
  footnotes?: Record<string, SharedFootnoteDefinition>; // Use specific definition type
  endnotes?: Record<string, SharedEndnoteDefinition>; // Use specific definition type
  headers?: Record<string, OoxmlRoot>; // Keyed by relationId (rId), stores the parsed header content
  footers?: Record<string, OoxmlRoot>; // Keyed by relationId (rId), stores the parsed footer content
  media?: Record<string, any>; // Placeholder for image/media data (keyed by rId?)
  relationships?: RelationshipMap; // Top-level relationships? Or per-part?
  // Add other shared resources as needed
}

/**
 * Represents a style definition (paragraph, character, table, numbering).
 * Based on common-types.ts definition, adding 'next' and 'tableProperties' from shared.ts.
 */
export interface SharedStyleDefinition {
  styleId: string;
  type: "paragraph" | "character" | "table" | "numbering";
  name?: string;
  basedOn?: string; // ID of the parent style
  next?: string; // ID of the style for the next paragraph (from shared.ts)
  isDefault?: boolean;
  paragraphProperties?: ParagraphFormatting; // Renamed from paragraphProps
  runProperties?: FontProperties; // Renamed from runProps
  tableProperties?: any; // Placeholder for table style properties (from shared.ts)
  // Add other style properties (linked style, UI priority, etc.)
}

/**
 * Represents document default formatting.
 * From common-types.ts.
 */
export interface SharedDocumentDefaults {
  paragraph?: ParagraphFormatting;
  run?: FontProperties;
}

/**
 * Represents an abstract numbering definition (<w:abstractNum>).
 * Based on detailed common-types.ts definition.
 */
export interface SharedAbstractNumDefinition {
  abstractNumId: string; // <w:abstractNumId w:val="..."/>
  name?: string; // <w:name w:val="..."/>
  multiLevelType?: string; // <w:multiLevelType w:val="..."/> (e.g., 'multilevel', 'hybridMultilevel')
  levels: Record<number, SharedNumberingLevelDefinition>; // Keyed by level index (more precise than array)
  // Add other abstractNum properties (style links, etc.)
}

/**
 * Represents a numbering level definition within an abstractNum (<w:lvl>).
 * Based on detailed common-types.ts definition.
 */
export interface SharedNumberingLevelDefinition {
  level: number;
  start?: number; // <w:start w:val="..."/>
  format?: string; // <w:numFmt w:val="..."/> (e.g., 'decimal', 'bullet', 'lowerLetter')
  text?: string; // <w:lvlText w:val="..."/> (e.g., '%1.')
  jc?: ParagraphFormatting["alignment"]; // <w:lvlJc w:val="..."/> (use alignment type)
  pPr?: ParagraphFormatting; // Paragraph properties for this level <w:pPr>
  rPr?: FontProperties; // Run properties for the number/bullet itself <w:rPr>
  // Add other level properties (suffix, picture bullets, etc.)
}

/**
 * Represents a concrete numbering instance (<w:num>).
 * Based on detailed common-types.ts definition.
 */
export interface SharedNumInstanceDefinition {
  numId: string; // <w:numId w:val="..."/>
  abstractNumId: string; // <w:abstractNumId w:val="..."/> - Links to abstract definition
  levelOverrides?: {
    // Optional overrides for specific levels <w:lvlOverride>
    [level: number]: Partial<
      SharedNumberingLevelDefinition & { startOverride?: number }
    >; // Combine level def with startOverride
  };
}

// Placeholders from common-types.ts, define properly if needed
export interface SharedTheme {
  definition?: any;
}
export interface SharedFont {
  definition?: any;
}

// --- Utility Shared Types --- //

/**
 * Represents a relationship defined in a .rels file.
 * From shared.ts.
 */
export interface Relationship {
  id: string;
  type: string;
  target: string;
  targetMode?: "External" | "Internal";
}

/**
 * Represents image dimensions.
 * From shared.ts.
 */
export interface Dimensions {
  width: number;
  height: number;
}

// Measurement type example (consider defining properly if used extensively)
// type OoxmlMeasurement = { value: number; unit: 'dxa' | 'emu' | 'pt' | 'in' | 'cm' };

export type RelationshipMap = Record<string, Relationship>; // Export RelationshipMap

/**
 * Defines a Tab Stop. <w:tab w:val="..." w:leader="..." w:pos="..."/>
 */
export interface TabStop {
  position: Measurement; // Position relative to left margin
  alignment: "left" | "center" | "right" | "decimal" | "bar" | "start" | "end"; // w:val
  leader?: "none" | "dot" | "hyphen" | "underscore" | "heavy" | "middleDot"; // w:leader
}

/**
 * Defines properties for a document section. <w:sectPr>...</w:sectPr>
 */
export interface SectionProperties {
  pageSize?: {
    // <w:pgSz w:w="..." w:h="..." w:orient="..."/>
    width: MeasurementOrAuto;
    height: MeasurementOrAuto;
    orientation?: "portrait" | "landscape";
  };
  pageMargins?: {
    // <w:pgMar w:top="..." w:right="..." w:bottom="..." w:left="..." w:header="..." w:footer="..." w:gutter="..."/>
    top: MeasurementOrAuto;
    right: MeasurementOrAuto;
    bottom: MeasurementOrAuto;
    left: MeasurementOrAuto;
    header: MeasurementOrAuto;
    footer: MeasurementOrAuto;
    gutter: MeasurementOrAuto;
  };
  columns?: {
    // <w:cols w:num="..." w:space="..." w:sep="..."/>
    count?: number;
    space?: Measurement;
    separator?: OnOffValue;
    // Add equalWidth, individual column definitions if needed
  };
  pageNumbering?: {
    // <w:pgNumType w:fmt="..." w:start="..."/>
    format?: string; // e.g., decimal, upperRoman, lowerLetter
    start?: number;
    // chapter separator, chapter style
  };
  headerReferences?: HeaderFooterReference[]; // <w:headerReference .../>
  footerReferences?: HeaderFooterReference[]; // <w:footerReference .../>
  type?: "nextPage" | "nextColumn" | "continuous" | "evenPage" | "oddPage"; // <w:type w:val="..."/> (Section break type)
  // Add more: line numbers, document grid, footnotes/endnotes properties etc.
}

/**
 * Defines a reference to a header or footer part. <w:headerReference|w:footerReference w:type="..." r:id="..."/>
 */
export interface HeaderFooterReference {
  type: "default" | "first" | "even"; // w:type
  relationId: string; // r:id linking to the actual header/footer part
}
