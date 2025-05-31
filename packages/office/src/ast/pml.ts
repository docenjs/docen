// ast/pml.ts
// Defines PresentationML (PML) types and interfaces
// Based on Office Open XML PresentationML specification
// PresentationML is used for PowerPoint presentation documents

// --- PML Specific OOXML Types (String Literals) ---
// These define the possible values for data.ooxmlType based on PresentationML specification

// Core presentation structure types
export type PmlPresentationType = "presentation"; // <p:presentation> root element
export type PmlSlideIdListType = "slideIdList"; // <p:sldIdLst> slide ID list
export type PmlSlideIdType = "slideId"; // <p:sldId> slide ID
export type PmlSlideMasterIdListType = "slideMasterIdList"; // <p:sldMasterIdLst> slide master ID list
export type PmlSlideMasterIdType = "slideMasterId"; // <p:sldMasterId> slide master ID
export type PmlSlideLayoutIdListType = "slideLayoutIdList"; // <p:sldLayoutIdLst> slide layout ID list
export type PmlSlideLayoutIdType = "slideLayoutId"; // <p:sldLayoutId> slide layout ID
export type PmlNotesMasterIdListType = "notesMasterIdList"; // <p:notesMasterIdLst> notes master ID list
export type PmlNotesMasterIdType = "notesMasterId"; // <p:notesMasterId> notes master ID
export type PmlHandoutMasterIdListType = "handoutMasterIdList"; // <p:handoutMasterIdLst> handout master ID list
export type PmlHandoutMasterIdType = "handoutMasterId"; // <p:handoutMasterId> handout master ID

// Slide types
export type PmlSlideType = "slide"; // <p:sld> slide
export type PmlSlideMasterType = "slideMaster"; // <p:sldMaster> slide master
export type PmlSlideLayoutType = "slideLayout"; // <p:sldLayout> slide layout
export type PmlNotesSlideType = "notesSlide"; // <p:notes> notes slide
export type PmlNotesMasterType = "notesMaster"; // <p:notesMaster> notes master
export type PmlHandoutMasterType = "handoutMaster"; // <p:handoutMaster> handout master

// Common slide content types
export type PmlCommonSlideDataType = "commonSlideData"; // <p:cSld> common slide data
export type PmlShapeTreeType = "shapeTree"; // <p:spTree> shape tree
export type PmlNonVisualGroupShapePropertiesType =
  "nonVisualGroupShapeProperties"; // <p:nvGrpSpPr> non-visual group shape properties
export type PmlGroupShapePropertiesType = "groupShapeProperties"; // <p:grpSpPr> group shape properties

// Shape types
export type PmlShapeType = "shape"; // <p:sp> shape
export type PmlConnectionShapeType = "connectionShape"; // <p:cxnSp> connection shape
export type PmlGroupShapeType = "groupShape"; // <p:grpSp> group shape
export type PmlGraphicFrameType = "graphicFrame"; // <p:graphicFrame> graphic frame
export type PmlPictureType = "picture"; // <p:pic> picture

// Shape properties and content types
export type PmlNonVisualShapePropertiesType = "nonVisualShapeProperties"; // <p:nvSpPr> non-visual shape properties
export type PmlShapePropertiesType = "shapeProperties"; // <p:spPr> shape properties
export type PmlTextBodyType = "textBody"; // <p:txBody> text body
export type PmlNonVisualDrawingPropertiesType = "nonVisualDrawingProperties"; // <p:cNvPr> non-visual drawing properties
export type PmlNonVisualShapeDrawingPropertiesType =
  "nonVisualShapeDrawingProperties"; // <p:cNvSpPr> non-visual shape drawing properties
export type PmlApplicationNonVisualDrawingPropertiesType =
  "applicationNonVisualDrawingProperties"; // <p:nvPr> application non-visual drawing properties

// Placeholder types
export type PmlPlaceholderType = "placeholder"; // <p:ph> placeholder
export type PmlPlaceholderShapeType = "placeholderShape"; // Placeholder shape

// Text and content types
export type PmlBodyPropertiesType = "bodyProperties"; // <a:bodyPr> body properties (DrawingML in PML context)
export type PmlListStyleType = "listStyle"; // <a:lstStyle> list style (DrawingML in PML context)
export type PmlParagraphType = "paragraph"; // <a:p> paragraph (DrawingML in PML context)
export type PmlRunType = "run"; // <a:r> run (DrawingML in PML context)
export type PmlTextType = "text"; // <a:t> text (DrawingML in PML context)

// Layout and design types
export type PmlColorMapType = "colorMap"; // <p:clrMap> color map
export type PmlColorMapOverrideType = "colorMapOverride"; // <p:clrMapOvr> color map override
export type PmlMasterColorMappingType = "masterColorMapping"; // <a:masterClrMapping> master color mapping
export type PmlTextStylesType = "textStyles"; // <p:txStyles> text styles
export type PmlTitleStyleType = "titleStyle"; // <p:titleStyle> title style
export type PmlBodyStyleType = "bodyStyle"; // <p:bodyStyle> body style
export type PmlOtherStyleType = "otherStyle"; // <p:otherStyle> other style

// Animation and timing types
export type PmlTimingType = "timing"; // <p:timing> timing
export type PmlTimeNodeListType = "timeNodeList"; // <p:tnLst> time node list
export type PmlParallelTimeNodeType = "parallelTimeNode"; // <p:par> parallel time node
export type PmlSequenceTimeNodeType = "sequenceTimeNode"; // <p:seq> sequence time node
export type PmlCommonTimeNodeType = "commonTimeNode"; // <p:cTn> common time node
export type PmlTransitionType = "transition"; // <p:transition> transition

// Presentation properties and settings types
export type PmlPresentationPropertiesType = "presentationProperties"; // <p:presentationPr> presentation properties
export type PmlSlideSizeType = "slideSize"; // <p:sldSz> slide size
export type PmlNotesSizeType = "notesSize"; // <p:notesSz> notes size
export type PmlDefaultTextStyleType = "defaultTextStyle"; // <p:defaultTextStyle> default text style
export type PmlEmbeddedFontListType = "embeddedFontList"; // <p:embeddedFontLst> embedded font list
export type PmlCustomShowListType = "customShowList"; // <p:custShowLst> custom show list
export type PmlCustomShowType = "customShow"; // <p:custShow> custom show

// Comments types
export type PmlCommentListType = "commentList"; // <p:cmLst> comment list
export type PmlCommentType = "comment"; // <p:cm> comment
export type PmlCommentAuthorListType = "commentAuthorList"; // <p:cmAuthorLst> comment author list
export type PmlCommentAuthorType = "commentAuthor"; // <p:cmAuthor> comment author

// Drawing and chart types (in presentation context)
export type PmlDrawingType = "drawing"; // Drawing reference in presentation context
export type PmlChartType = "chart"; // Chart in presentation context

// Union of all PML semantic types
export type PmlOoxmlType =
  // Core presentation structure
  | PmlPresentationType
  | PmlSlideIdListType
  | PmlSlideIdType
  | PmlSlideMasterIdListType
  | PmlSlideMasterIdType
  | PmlSlideLayoutIdListType
  | PmlSlideLayoutIdType
  | PmlNotesMasterIdListType
  | PmlNotesMasterIdType
  | PmlHandoutMasterIdListType
  | PmlHandoutMasterIdType
  // Slide types
  | PmlSlideType
  | PmlSlideMasterType
  | PmlSlideLayoutType
  | PmlNotesSlideType
  | PmlNotesMasterType
  | PmlHandoutMasterType
  // Common slide content
  | PmlCommonSlideDataType
  | PmlShapeTreeType
  | PmlNonVisualGroupShapePropertiesType
  | PmlGroupShapePropertiesType
  // Shapes
  | PmlShapeType
  | PmlConnectionShapeType
  | PmlGroupShapeType
  | PmlGraphicFrameType
  | PmlPictureType
  // Shape properties and content
  | PmlNonVisualShapePropertiesType
  | PmlShapePropertiesType
  | PmlTextBodyType
  | PmlNonVisualDrawingPropertiesType
  | PmlNonVisualShapeDrawingPropertiesType
  | PmlApplicationNonVisualDrawingPropertiesType
  // Placeholders
  | PmlPlaceholderType
  | PmlPlaceholderShapeType
  // Text and content
  | PmlBodyPropertiesType
  | PmlListStyleType
  | PmlParagraphType
  | PmlRunType
  | PmlTextType
  // Layout and design
  | PmlColorMapType
  | PmlColorMapOverrideType
  | PmlMasterColorMappingType
  | PmlTextStylesType
  | PmlTitleStyleType
  | PmlBodyStyleType
  | PmlOtherStyleType
  // Animation and timing
  | PmlTimingType
  | PmlTimeNodeListType
  | PmlParallelTimeNodeType
  | PmlSequenceTimeNodeType
  | PmlCommonTimeNodeType
  | PmlTransitionType
  // Presentation properties
  | PmlPresentationPropertiesType
  | PmlSlideSizeType
  | PmlNotesSizeType
  | PmlDefaultTextStyleType
  | PmlEmbeddedFontListType
  | PmlCustomShowListType
  | PmlCustomShowType
  // Comments
  | PmlCommentListType
  | PmlCommentType
  | PmlCommentAuthorListType
  | PmlCommentAuthorType
  // Drawing and charts
  | PmlDrawingType
  | PmlChartType;

// --- Interfaces for complex properties within data.properties ---

// Presentation properties
export interface PmlPresentationProperties {
  embedTrueTypeFonts?: boolean; // Embed TrueType fonts
  saveExternalLinksValues?: boolean; // Save external link values
  showSpecialPlaceHolders?: boolean; // Show special placeholders
  strictFirstAndLastChars?: boolean; // Strict first and last characters
  compatMode?: boolean; // Compatibility mode
  bookmarkIdSeed?: number; // Bookmark ID seed
  attrChartGuidSeed?: number; // Attribute chart GUID seed
  serverZoom?: number; // Server zoom
  firstSlideNumber?: number; // First slide number
  showComments?: boolean; // Show comments
}

// Slide properties
export interface PmlSlideProperties {
  id?: number; // Slide ID
  relationshipId?: string; // Relationship ID
  name?: string; // Slide name
  show?: boolean; // Show slide
  showMasterSp?: boolean; // Show master shapes
  showMasterPhAnim?: boolean; // Show master placeholder animations
}

// Slide master properties
export interface PmlSlideMasterProperties {
  id?: number; // Slide master ID
  relationshipId?: string; // Relationship ID
  preserve?: boolean; // Preserve
}

// Slide layout properties
export interface PmlSlideLayoutProperties {
  id?: number; // Slide layout ID
  relationshipId?: string; // Relationship ID
  matchingName?: string; // Matching name
  type?:
    | "title"
    | "twoColTx"
    | "tbl"
    | "tx"
    | "txAndChart"
    | "chartAndTx"
    | "dgm"
    | "chart"
    | "txAndClipArt"
    | "clipArtAndTx"
    | "titleOnly"
    | "blank"
    | "txAndObj"
    | "objAndTx"
    | "objOnly"
    | "obj"
    | "txAndMedia"
    | "mediaAndTx"
    | "objOverTx"
    | "txOverObj"
    | "txAndTwoObj"
    | "twoObjAndTx"
    | "twoObjOverTx"
    | "fourObj"
    | "vertTx"
    | "clipArtAndVertTx"
    | "vertTitleAndTx"
    | "vertTitleAndTxOverChart"
    | "twoObj"
    | "objTx"
    | "picTx"
    | "secHead"
    | "twoTxTwoObj"
    | "objOnly"
    | "cust"; // Layout type
  preserve?: boolean; // Preserve
  userDrawn?: boolean; // User drawn
}

// Shape properties
export interface PmlShapeProperties {
  id?: number; // Shape ID
  name?: string; // Shape name
  descr?: string; // Description
  title?: string; // Title
  hidden?: boolean; // Hidden
  type?: string; // Shape type
  macro?: string; // Macro
  fPublished?: boolean; // Published
  fLocksText?: boolean; // Lock text
}

// Placeholder properties
export interface PmlPlaceholderProperties {
  type?:
    | "title"
    | "body"
    | "ctrTitle"
    | "subTitle"
    | "dt"
    | "sldNum"
    | "ftr"
    | "hdr"
    | "obj"
    | "chart"
    | "tbl"
    | "clipArt"
    | "dgm"
    | "media"
    | "sldImg"
    | "pic"; // Placeholder type
  orient?: "horz" | "vert"; // Orientation
  sz?: "full" | "half" | "quarter"; // Size
  idx?: number; // Index
  hasCustomPrompt?: boolean; // Has custom prompt
}

// Text body properties (specific to PML context)
export interface PmlTextBodyProperties {
  wrap?: "none" | "square"; // Text wrapping
  lIns?: number; // Left inset
  tIns?: number; // Top inset
  rIns?: number; // Right inset
  bIns?: number; // Bottom inset
  numCol?: number; // Number of columns
  spcCol?: number; // Space between columns
  rtlCol?: boolean; // Right-to-left columns
  fromWordArt?: boolean; // From WordArt
  anchor?: "t" | "ctr" | "b" | "just" | "dist"; // Anchor
  anchorCtr?: boolean; // Anchor center
  horzOverflow?: "clip" | "overflow"; // Horizontal overflow
  vertOverflow?: "clip" | "ellipsis" | "overflow"; // Vertical overflow
  vert?:
    | "eaVert"
    | "horz"
    | "mongoVert"
    | "vert"
    | "vert270"
    | "wordArtVert"
    | "wordArtVertRtl"; // Text direction
  rot?: number; // Rotation
  spcFirstLastPara?: boolean; // Space first/last paragraph
  vertAnchor?: "t" | "ctr" | "b" | "just" | "dist"; // Vertical anchor
  upright?: boolean; // Upright
  compatLnSpc?: boolean; // Compatible line spacing
  prstTxWarp?: string; // Preset text warp
}

// Color map properties
export interface PmlColorMapProperties {
  bg1?: string; // Background 1
  tx1?: string; // Text 1
  bg2?: string; // Background 2
  tx2?: string; // Text 2
  accent1?: string; // Accent 1
  accent2?: string; // Accent 2
  accent3?: string; // Accent 3
  accent4?: string; // Accent 4
  accent5?: string; // Accent 5
  accent6?: string; // Accent 6
  hlink?: string; // Hyperlink
  folHlink?: string; // Followed hyperlink
}

// Slide size properties
export interface PmlSlideSizeProperties {
  cx?: number; // Width in EMUs
  cy?: number; // Height in EMUs
  type?:
    | "screen4x3"
    | "letterPaper"
    | "a4Paper"
    | "35mm"
    | "overhead"
    | "banner"
    | "custom"
    | "ledgerPaper"
    | "a3Paper"
    | "a5Paper"
    | "b4IsoPaper"
    | "b5IsoPaper"
    | "executivePaper"
    | "legalPaper"
    | "screen16x9"
    | "screen16x10"
    | "widescreen"; // Size type
}

// Animation timing properties
export interface PmlTimingProperties {
  nodeType?:
    | "tmRoot"
    | "mainSeq"
    | "interactiveSeq"
    | "clickEffect"
    | "withEffect"
    | "afterEffect"
    | "afterGroup"
    | "withGroup"; // Node type
  dur?: number | "indefinite"; // Duration
  restart?: "always" | "never" | "whenNotActive"; // Restart behavior
  repeatCount?: number | "indefinite"; // Repeat count
  repeatDur?: number | "indefinite"; // Repeat duration
  spd?: number; // Speed
  accel?: number; // Acceleration
  decel?: number; // Deceleration
  autoRev?: boolean; // Auto reverse
  id?: number; // ID
  fill?: "remove" | "freeze" | "hold" | "transition"; // Fill behavior
  syncBehavior?: "canSlip" | "locked"; // Sync behavior
  tmFilter?: string; // Time filter
  evtFilter?: string; // Event filter
  display?: boolean; // Display
  masterRel?: "sameClick" | "nextClick" | "lastClick"; // Master relationship
  bldLvl?: number; // Build level
  grpId?: number; // Group ID
  uiExpand?: boolean; // UI expand
  nodePh?: boolean; // Node placeholder
}

// Transition properties
export interface PmlTransitionProperties {
  spd?: "slow" | "med" | "fast"; // Speed
  advTm?: number; // Advance time
  advOnClick?: boolean; // Advance on click
  advAuto?: boolean; // Auto advance
  dur?: number; // Duration
}

// Comment properties
export interface PmlCommentProperties {
  authorId?: number; // Author ID
  dt?: string; // Date/time
  idx?: number; // Index
  pos?: {
    x?: number; // X position
    y?: number; // Y position
  };
  text?: string; // Comment text
}

// Comment author properties
export interface PmlCommentAuthorProperties {
  id?: number; // Author ID
  name?: string; // Author name
  initials?: string; // Author initials
  lastIdx?: number; // Last index
  clrIdx?: number; // Color index
}

// Custom show properties
export interface PmlCustomShowProperties {
  name?: string; // Show name
  id?: number; // Show ID
}
