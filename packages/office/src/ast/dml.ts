// ast/dml.ts
// Defines DrawingML (DML) types and interfaces
// Based on Office Open XML DrawingML specification
// DrawingML is used for graphics in Word, Excel, and PowerPoint

// No imports needed currently for DML types

// --- DML Specific OOXML Types (String Literals) ---
// These define the possible values for data.ooxmlType based on DrawingML specification

// Core drawing types
export type DmlDrawingType = "drawing"; // <w:drawing> or <xdr:wsDr> drawing wrapper
export type DmlInlineType = "inline"; // <wp:inline> inline drawing
export type DmlAnchorType = "anchor"; // <wp:anchor> anchored drawing
export type DmlGraphicType = "graphic"; // <a:graphic> graphic container
export type DmlGraphicDataType = "graphicData"; // <a:graphicData> graphic data

// Positioning and sizing types
export type DmlPositionalTabType = "positionalTab"; // <a:pTab> positional tab
export type DmlExtentType = "extent"; // <wp:extent> extent/size
export type DmlEffectExtentType = "effectExtent"; // <wp:effectExtent> effect extent
export type DmlOffsetType = "offset"; // <a:off> offset position
export type DmlTransform2DType = "transform2D"; // <a:xfrm> transform
export type DmlExtentsType = "extents"; // <a:ext> extents

// Shape and object types
export type DmlShapeType = "shape"; // <a:sp> or <p:sp> shape
export type DmlShapePropertiesType = "shapeProperties"; // <a:spPr> or <p:spPr> shape properties
export type DmlPresetGeometryType = "presetGeometry"; // <a:prstGeom> preset geometry
export type DmlCustomGeometryType = "customGeometry"; // <a:custGeom> custom geometry
export type DmlShapeStyleType = "shapeStyle"; // <a:style> shape style

// Picture and image types
export type DmlPictureType = "picture"; // <pic:pic> picture
export type DmlBlipType = "blip"; // <a:blip> binary large image or picture
export type DmlBlipFillType = "blipFill"; // <pic:blipFill> blip fill
export type DmlStretchType = "stretch"; // <a:stretch> stretch
export type DmlFillRectangleType = "fillRectangle"; // <a:fillRect> fill rectangle

// Text and formatting types
export type DmlTextBodyType = "textBody"; // <a:txBody> or <p:txBody> text body
export type DmlBodyPropertiesType = "bodyProperties"; // <a:bodyPr> body properties
export type DmlListStyleType = "listStyle"; // <a:lstStyle> list style
export type DmlParagraphType = "paragraph"; // <a:p> paragraph in DrawingML
export type DmlRunType = "run"; // <a:r> run in DrawingML
export type DmlTextType = "text"; // <a:t> text in DrawingML
export type DmlRunPropertiesType = "runProperties"; // <a:rPr> run properties
export type DmlParagraphPropertiesType = "paragraphProperties"; // <a:pPr> paragraph properties
export type DmlEndParagraphRunPropertiesType = "endParagraphRunProperties"; // <a:endParaRPr> end paragraph run properties

// Color and fill types
export type DmlSolidFillType = "solidFill"; // <a:solidFill> solid fill
export type DmlGradientFillType = "gradientFill"; // <a:gradFill> gradient fill
export type DmlPatternFillType = "patternFill"; // <a:pattFill> pattern fill
export type DmlNoFillType = "noFill"; // <a:noFill> no fill
export type DmlSchemeColorType = "schemeColor"; // <a:schemeClr> scheme color
export type DmlRgbColorType = "rgbColor"; // <a:srgbClr> RGB color
export type DmlSystemColorType = "systemColor"; // <a:sysClr> system color

// Effect types
export type DmlOutlineType = "outline"; // <a:ln> outline/line
export type DmlShadowType = "shadow"; // <a:shadow> shadow effect
export type DmlReflectionType = "reflection"; // <a:reflection> reflection effect
export type DmlGlowType = "glow"; // <a:glow> glow effect
export type DmlSoftEdgeType = "softEdge"; // <a:softEdge> soft edge effect

// Chart types (embedded in DrawingML)
export type DmlChartType = "chart"; // <c:chart> chart
export type DmlChartReferenceType = "chartReference"; // <c:chartReference> chart reference
export type DmlChartSpaceType = "chartSpace"; // <c:chartSpace> chart space

// Table types (in DrawingML context)
export type DmlTableType = "table"; // <a:tbl> table
export type DmlTableRowType = "tableRow"; // <a:tr> table row
export type DmlTableCellType = "tableCell"; // <a:tc> table cell
export type DmlTablePropertiesType = "tableProperties"; // <a:tblPr> table properties
export type DmlTableStyleType = "tableStyle"; // <a:tblStyle> table style

// Group and connector types
export type DmlGroupShapeType = "groupShape"; // <a:grpSp> group shape
export type DmlConnectorType = "connector"; // <a:cxnSp> connector shape
export type DmlConnectionShapeType = "connectionShape"; // Connection shape

// Non-visual properties types
export type DmlNonVisualDrawingPropertiesType = "nonVisualDrawingProperties"; // <pic:cNvPr> non-visual drawing properties
export type DmlNonVisualPicturePropertiesType = "nonVisualPictureProperties"; // <pic:cNvPicPr> non-visual picture properties
export type DmlNonVisualGraphicFramePropertiesType =
  "nonVisualGraphicFrameProperties"; // <a:cNvGraphicFramePr> non-visual graphic frame properties
export type DmlDocPropertiesType = "docProperties"; // <wp:docPr> document properties

// Union of all DML semantic types
export type DmlOoxmlType =
  // Core drawing
  | DmlDrawingType
  | DmlInlineType
  | DmlAnchorType
  | DmlGraphicType
  | DmlGraphicDataType
  // Positioning and sizing
  | DmlPositionalTabType
  | DmlExtentType
  | DmlEffectExtentType
  | DmlOffsetType
  | DmlTransform2DType
  | DmlExtentsType
  // Shapes and objects
  | DmlShapeType
  | DmlShapePropertiesType
  | DmlPresetGeometryType
  | DmlCustomGeometryType
  | DmlShapeStyleType
  // Pictures and images
  | DmlPictureType
  | DmlBlipType
  | DmlBlipFillType
  | DmlStretchType
  | DmlFillRectangleType
  // Text and formatting
  | DmlTextBodyType
  | DmlBodyPropertiesType
  | DmlListStyleType
  | DmlParagraphType
  | DmlRunType
  | DmlTextType
  | DmlRunPropertiesType
  | DmlParagraphPropertiesType
  | DmlEndParagraphRunPropertiesType
  // Colors and fills
  | DmlSolidFillType
  | DmlGradientFillType
  | DmlPatternFillType
  | DmlNoFillType
  | DmlSchemeColorType
  | DmlRgbColorType
  | DmlSystemColorType
  // Effects
  | DmlOutlineType
  | DmlShadowType
  | DmlReflectionType
  | DmlGlowType
  | DmlSoftEdgeType
  // Charts
  | DmlChartType
  | DmlChartReferenceType
  | DmlChartSpaceType
  // Tables
  | DmlTableType
  | DmlTableRowType
  | DmlTableCellType
  | DmlTablePropertiesType
  | DmlTableStyleType
  // Groups and connectors
  | DmlGroupShapeType
  | DmlConnectorType
  | DmlConnectionShapeType
  // Non-visual properties
  | DmlNonVisualDrawingPropertiesType
  | DmlNonVisualPicturePropertiesType
  | DmlNonVisualGraphicFramePropertiesType
  | DmlDocPropertiesType;

// --- Interfaces for complex properties within data.properties ---

// Transform properties for positioning and sizing
export interface DmlTransformProperties {
  offset?: {
    x?: number; // X coordinate in EMUs
    y?: number; // Y coordinate in EMUs
  };
  extents?: {
    cx?: number; // Width in EMUs
    cy?: number; // Height in EMUs
  };
  rotation?: number; // Rotation in 60000ths of a degree
  flipH?: boolean; // Horizontal flip
  flipV?: boolean; // Vertical flip
}

// Shape properties
export interface DmlShapeProperties {
  transform?: DmlTransformProperties;
  preset?: string; // Preset geometry type
  fill?: DmlFillProperties;
  outline?: DmlOutlineProperties;
  effects?: DmlEffectProperties[];
}

// Fill properties
export interface DmlFillProperties {
  type: "solid" | "gradient" | "pattern" | "picture" | "none";
  color?: string; // Color value
  alpha?: number; // Alpha transparency (0-100000)
  scheme?: string; // Color scheme reference
}

// Outline properties
export interface DmlOutlineProperties {
  width?: number; // Line width in EMUs
  cap?: "flat" | "round" | "square"; // Line cap style
  join?: "round" | "bevel" | "miter"; // Line join style
  dashType?:
    | "solid"
    | "dash"
    | "dot"
    | "dashDot"
    | "lgDash"
    | "lgDashDot"
    | "lgDashDotDot"
    | "sysDash"
    | "sysDot"
    | "sysDashDot"
    | "sysDashDotDot";
  fill?: DmlFillProperties;
}

// Effect properties
export interface DmlEffectProperties {
  type: "shadow" | "reflection" | "glow" | "softEdge" | "preset";
  distance?: number; // Effect distance in EMUs
  direction?: number; // Effect direction in degrees
  color?: string; // Effect color
  alpha?: number; // Effect alpha
  size?: number; // Effect size
  radius?: number; // Effect radius
}

// Text properties specific to DrawingML
export interface DmlTextProperties {
  size?: number; // Font size in points * 100
  bold?: boolean;
  italic?: boolean;
  underline?:
    | "none"
    | "single"
    | "double"
    | "heavy"
    | "dotted"
    | "dottedHeavy"
    | "dash"
    | "dashHeavy"
    | "dashLong"
    | "dashLongHeavy"
    | "dotDash"
    | "dotDashHeavy"
    | "dotDotDash"
    | "dotDotDashHeavy"
    | "wavy"
    | "wavyHeavy"
    | "wavyDouble";
  strike?: "none" | "single" | "double";
  fontFamily?: string;
  color?: string;
  highlight?: string; // Highlight color
  spacing?: number; // Character spacing in points * 100
  baseline?: number; // Baseline offset
}

// Body properties for text containers
export interface DmlBodyProperties {
  wrap?: "none" | "square"; // Text wrapping
  anchor?: "t" | "ctr" | "b" | "just" | "dist"; // Vertical alignment
  anchorCtr?: boolean; // Anchor to center
  horzOverflow?: "clip" | "overflow"; // Horizontal overflow
  vertOverflow?: "clip" | "ellipsis" | "overflow"; // Vertical overflow
  autoFit?: boolean; // Auto-fit text
  fontScale?: number; // Font scale percentage
  lineSpaceReduction?: number; // Line space reduction percentage
  margins?: {
    left?: number; // Left margin in EMUs
    right?: number; // Right margin in EMUs
    top?: number; // Top margin in EMUs
    bottom?: number; // Bottom margin in EMUs
  };
  rotation?: number; // Text rotation
  compatibleLineSpacing?: boolean; // Compatible line spacing
  forceAntiAlias?: boolean; // Force anti-aliasing
  fromWordArt?: boolean; // From WordArt
  columns?: number; // Number of columns
  columnSpacing?: number; // Column spacing
}

// Picture properties
export interface DmlPictureProperties {
  blipEmbed?: string; // Relationship ID for embedded image
  blipLink?: string; // Relationship ID for linked image
  compression?: "email" | "hqprint" | "print" | "maximum" | "none"; // Compression state
  brightness?: number; // Brightness adjustment (-100000 to 100000)
  contrast?: number; // Contrast adjustment (-100000 to 100000)
  effects?: DmlEffectProperties[]; // Applied effects
  crop?: {
    left?: number; // Left crop percentage
    right?: number; // Right crop percentage
    top?: number; // Top crop percentage
    bottom?: number; // Bottom crop percentage
  };
}

// Chart properties
export interface DmlChartProperties {
  chartReference?: string; // Relationship ID to chart part
  title?: string; // Chart title
  legend?: {
    position?: "b" | "tr" | "l" | "r" | "t"; // Legend position
    overlay?: boolean; // Overlay on chart
  };
  plotArea?: {
    layout?: "manual" | "automatic"; // Layout type
  };
}

// Table properties specific to DrawingML
export interface DmlTableProperties {
  style?: string; // Table style reference
  firstRow?: boolean; // First row formatting
  lastRow?: boolean; // Last row formatting
  firstCol?: boolean; // First column formatting
  lastCol?: boolean; // Last column formatting
  bandRow?: boolean; // Banded rows
  bandCol?: boolean; // Banded columns
}

// Drawing properties (main drawing wrapper)
export interface DmlDrawingProperties {
  relationId?: string; // Relationship ID
  fileName?: string; // File name for linked content
  title?: string; // Drawing title
  description?: string; // Drawing description
  inline?: boolean; // Whether drawing is inline or anchored
  position?: {
    x?: number; // X position in EMUs
    y?: number; // Y position in EMUs
    relativeFrom?:
      | "page"
      | "margin"
      | "column"
      | "character"
      | "leftMargin"
      | "rightMargin"
      | "topMargin"
      | "bottomMargin"
      | "insideMargin"
      | "outsideMargin";
  };
  size?: {
    width?: number; // Width in EMUs
    height?: number; // Height in EMUs
  };
  wrapping?: {
    type?: "none" | "topAndBottom" | "square" | "tight" | "through"; // Text wrapping type
    side?: "both" | "left" | "right" | "largest"; // Text wrapping side
    distanceFromText?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
  };
  zOrder?: number; // Z-order for layering
  behindDocument?: boolean; // Whether drawing is behind document text
  locked?: boolean; // Whether drawing is locked
  layoutInCell?: boolean; // Whether drawing is laid out in table cell
  allowOverlap?: boolean; // Whether drawing allows overlap
}
