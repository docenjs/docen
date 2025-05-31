// ast/vml.ts
// Defines Vector Markup Language (VML) types and interfaces
// Based on Office Open XML VML specification
// VML is a legacy drawing format still used in Office documents

// --- VML Specific OOXML Types (String Literals) ---
// These define the possible values for data.ooxmlType based on VML specification

// Core VML shape types
export type VmlShapeType = "vmlShape"; // <v:shape> vector shape
export type VmlGroupType = "vmlGroup"; // <v:group> shape group
export type VmlLineType = "vmlLine"; // <v:line> line shape
export type VmlOvalType = "vmlOval"; // <v:oval> oval/circle shape
export type VmlRectType = "vmlRect"; // <v:rect> rectangle shape
export type VmlRoundRectType = "vmlRoundRect"; // <v:roundrect> rounded rectangle
export type VmlPolyLineType = "vmlPolyLine"; // <v:polyline> polyline shape
export type VmlCurveType = "vmlCurve"; // <v:curve> curve shape
export type VmlArcType = "vmlArc"; // <v:arc> arc shape
export type VmlImageType = "vmlImage"; // <v:image> image shape

// VML content types
export type VmlTextBoxType = "vmlTextBox"; // <v:textbox> text container
export type VmlTextBoxContentType = "vmlTextBoxContent"; // Content within textbox
export type VmlFormulasType = "vmlFormulas"; // <v:formulas> shape formulas
export type VmlHandlesType = "vmlHandles"; // <v:handles> adjustment handles
export type VmlPathType = "vmlPath"; // <v:path> shape path definition

// VML fill and stroke types
export type VmlFillType = "vmlFill"; // <v:fill> fill properties
export type VmlStrokeType = "vmlStroke"; // <v:stroke> stroke properties
export type VmlShadowType = "vmlShadow"; // <v:shadow> shadow effect
export type VmlSkewType = "vmlSkew"; // <v:skew> skew transformation
export type VmlExtrusionType = "vmlExtrusion"; // <v:extrusion> 3D extrusion

// VML behavior types
export type VmlCalloutType = "vmlCallout"; // <v:callout> callout properties
export type VmlLockType = "vmlLock"; // <v:lock> locking properties
export type VmlWrapType = "vmlWrap"; // <v:wrap> text wrapping

// Union of all VML semantic types
export type VmlOoxmlType =
  // Core shapes
  | VmlShapeType
  | VmlGroupType
  | VmlLineType
  | VmlOvalType
  | VmlRectType
  | VmlRoundRectType
  | VmlPolyLineType
  | VmlCurveType
  | VmlArcType
  | VmlImageType
  // Content and structure
  | VmlTextBoxType
  | VmlTextBoxContentType
  | VmlFormulasType
  | VmlHandlesType
  | VmlPathType
  // Appearance
  | VmlFillType
  | VmlStrokeType
  | VmlShadowType
  | VmlSkewType
  | VmlExtrusionType
  // Behavior
  | VmlCalloutType
  | VmlLockType
  | VmlWrapType;

// --- Interfaces for complex properties within data.properties ---

// Basic VML shape properties
export interface VmlShapeProperties {
  id?: string; // Shape ID
  style?: string; // CSS-style positioning and sizing
  coordsize?: string; // Coordinate space size
  coordorigin?: string; // Coordinate space origin
  path?: string; // Shape path data
  type?: string; // Shape type reference
  adj?: string; // Adjustment values
  href?: string; // Hyperlink reference
  target?: string; // Hyperlink target
  title?: string; // Shape title/tooltip
  alt?: string; // Alternative text
}

// VML positioning and sizing
export interface VmlPositionProperties {
  position?: "static" | "absolute" | "relative"; // CSS position
  left?: string; // Left position
  top?: string; // Top position
  width?: string; // Width
  height?: string; // Height
  marginLeft?: string; // Left margin
  marginTop?: string; // Top margin
  marginRight?: string; // Right margin
  marginBottom?: string; // Bottom margin
  zIndex?: number; // Z-order
  rotation?: number; // Rotation angle
  flipH?: boolean; // Horizontal flip
  flipV?: boolean; // Vertical flip
}

// VML fill properties
export interface VmlFillProperties {
  on?: boolean; // Fill enabled
  color?: string; // Fill color
  color2?: string; // Secondary color (for gradients)
  type?: "solid" | "gradient" | "gradientRadial" | "tile" | "pattern" | "frame"; // Fill type
  opacity?: string; // Fill opacity
  angle?: number; // Gradient angle
  focus?: string; // Gradient focus
  focusPosition?: string; // Gradient focus position
  focusSize?: string; // Gradient focus size
  method?: "none" | "linear" | "sigma" | "any"; // Gradient method
  src?: string; // Image source for pattern/tile fills
}

// VML stroke properties
export interface VmlStrokeProperties {
  on?: boolean; // Stroke enabled
  color?: string; // Stroke color
  color2?: string; // Secondary stroke color
  weight?: string; // Stroke weight/width
  opacity?: string; // Stroke opacity
  lineStyle?: "single" | "thickThin" | "thinThick" | "thinThin"; // Line style
  dashStyle?:
    | "solid"
    | "shortDash"
    | "shortDot"
    | "shortDashDot"
    | "shortDashDotDot"
    | "dot"
    | "dash"
    | "longDash"
    | "dashDot"
    | "longDashDot"
    | "longDashDotDot"; // Dash pattern
  fillType?: "solid" | "tile" | "pattern" | "frame"; // Stroke fill type
  src?: string; // Pattern source
  imageAspect?: "ignore" | "atLeast" | "atMost"; // Image aspect ratio handling
  imageSize?: string; // Image size for pattern
  imageAlignShape?: boolean; // Align image to shape
  startArrow?: "none" | "block" | "classic" | "diamond" | "oval" | "open"; // Start arrow type
  endArrow?: "none" | "block" | "classic" | "diamond" | "oval" | "open"; // End arrow type
  startArrowWidth?: "narrow" | "medium" | "wide"; // Start arrow width
  endArrowWidth?: "narrow" | "medium" | "wide"; // End arrow width
  startArrowLength?: "short" | "medium" | "long"; // Start arrow length
  endArrowLength?: "short" | "medium" | "long"; // End arrow length
  joinStyle?: "round" | "bevel" | "miter"; // Line join style
  endCap?: "flat" | "square" | "round"; // Line end cap
}

// VML shadow properties
export interface VmlShadowProperties {
  on?: boolean; // Shadow enabled
  type?: "single" | "double" | "emboss" | "perspective"; // Shadow type
  color?: string; // Shadow color
  color2?: string; // Secondary shadow color
  opacity?: string; // Shadow opacity
  offset?: string; // Shadow offset
  offset2?: string; // Secondary shadow offset
  origin?: string; // Shadow origin
  matrix?: string; // Shadow transformation matrix
}

// VML 3D extrusion properties
export interface VmlExtrusionProperties {
  on?: boolean; // Extrusion enabled
  type?: "parallel" | "perspective"; // Extrusion type
  render?: "solid" | "wireFrame" | "boundingCube"; // Render mode
  viewpointOrigin?: string; // Viewpoint origin
  viewpoint?: string; // Viewpoint position
  plane?: "XY" | "ZX" | "YZ"; // Extrusion plane
  skewAngle?: number; // Skew angle
  skewAmount?: string; // Skew amount
  foredepth?: string; // Forward depth
  backdepth?: string; // Backward depth
  brightness?: string; // Brightness
  lightFace?: boolean; // Light face
  lightPosition?: string; // Light position
  lightPosition2?: string; // Secondary light position
  lightLevel?: string; // Light level
  lightLevel2?: string; // Secondary light level
  lightHarsh?: boolean; // Harsh lighting
  lightHarsh2?: boolean; // Secondary harsh lighting
  diffusity?: string; // Light diffusion
  specularity?: string; // Specular reflection
  metal?: boolean; // Metallic surface
  edge?: string; // Edge color
  facet?: string; // Facet size
  colorMode?: "auto" | "custom"; // Color mode
  rotationAngle?: string; // Rotation angle
  rotationCenter?: string; // Rotation center
}

// VML textbox properties
export interface VmlTextBoxProperties {
  style?: string; // CSS styling
  inset?: string; // Text inset margins
  fit?: "shape" | "false"; // Fit text to shape
  next?: string; // Link to next textbox
}

// VML path properties
export interface VmlPathProperties {
  v?: string; // Path data
  limo?: string; // Path limits
  textboxRect?: string; // Textbox rectangle
  fillOk?: boolean; // Allow fill
  strokeOk?: boolean; // Allow stroke
  shadowOk?: boolean; // Allow shadow
  arrowOk?: boolean; // Allow arrows
  gradientShapeOk?: boolean; // Allow gradient shape
  textPathOk?: boolean; // Allow text path
  insetPenOk?: boolean; // Allow inset pen
  connectType?: "none" | "rect" | "segments" | "custom"; // Connection type
  connectLocs?: string; // Connection locations
  connectAngles?: string; // Connection angles
}

// VML group properties
export interface VmlGroupProperties extends VmlShapeProperties {
  coordsize?: string; // Group coordinate size
  coordorigin?: string; // Group coordinate origin
  editas?:
    | "canvas"
    | "orgchart"
    | "radial"
    | "cycle"
    | "stacked"
    | "venn"
    | "bullseye"; // Edit mode
  tableProperties?: string; // Table properties
  tableLimits?: string; // Table limits
}

// VML lock properties
export interface VmlLockProperties {
  v_ext?: "edit"; // Extension mode
  selection?: boolean; // Allow selection
  grouping?: boolean; // Allow grouping
  ungrouping?: boolean; // Allow ungrouping
  rotation?: boolean; // Allow rotation
  cropping?: boolean; // Allow cropping
  vertices?: boolean; // Allow vertex editing
  adjustHandles?: boolean; // Allow adjustment handles
  text?: boolean; // Allow text editing
  aspectRatio?: boolean; // Lock aspect ratio
  position?: boolean; // Lock position
  shapeType?: boolean; // Lock shape type
}

// VML wrap properties
export interface VmlWrapProperties {
  type?: "topAndBottom" | "square" | "none" | "tight" | "through"; // Wrap type
  side?: "both" | "left" | "right" | "largest"; // Wrap side
  anchorx?: "margin" | "page" | "text"; // Horizontal anchor
  anchory?: "margin" | "page" | "text"; // Vertical anchor
  distance?: {
    left?: string; // Left distance
    top?: string; // Top distance
    right?: string; // Right distance
    bottom?: string; // Bottom distance
  };
}
