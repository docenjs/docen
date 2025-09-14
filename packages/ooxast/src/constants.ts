/**
 * OOXML namespace constants used across the ecosystem.
 *
 * These constants provide standardized namespace URIs for different
 * OOXML schema components, ensuring consistency across all OOXML packages.
 */

/**
 * Main OOXML namespaces
 */
export const NAMESPACES = {
  /**
   * DrawingML namespace - used for pictures, shapes, and other visual elements
   */
  DRAWINGML: "http://schemas.openxmlformats.org/drawingml/2006/main",

  /**
   * DrawingML picture namespace
   */
  DRAWINGML_PICTURE: "http://schemas.openxmlformats.org/drawingml/2006/picture",

  /**
   * Wordprocessing drawing namespace
   */
  WORDPROCESSING_DRAWING:
    "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",

  /**
   * Spreadsheet drawing namespace
   */
  SPREADSHEET_DRAWING:
    "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",

  /**
   * Chart namespace
   */
  CHART: "http://schemas.openxmlformats.org/drawingml/2006/chart",

  /**
   * Diagram namespace
   */
  DIAGRAM: "http://schemas.openxmlformats.org/drawingml/2006/diagram",

  /**
   * Microsoft Word processing shapes namespace
   */
  WORDPROCESSING_SHAPES:
    "http://schemas.microsoft.com/office/word/2010/wordprocessingShape",

  /**
   * DrawingML relationship namespace
   */
  DRAWINGML_RELATIONSHIPS:
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships",

  /**
   * Office Document relationship namespace
   */
  OFFICE_DOCUMENT:
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships",

  /**
   * Package relationship namespace
   */
  PACKAGE_RELATIONSHIPS:
    "http://schemas.openxmlformats.org/package/2006/relationships",

  /**
   * Core properties namespace
   */
  CORE_PROPERTIES:
    "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",

  /**
   * Dublin Core terms namespace
   */
  DUBLIN_CORE_TERMS: "http://purl.org/dc/terms/",

  /**
   * Dublin Core elements namespace
   */
  DUBLIN_CORE_ELEMENTS: "http://purl.org/dc/elements/1.1/",

  /**
   * Extended properties namespace
   */
  EXTENDED_PROPERTIES:
    "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties",

  /**
   * Custom properties namespace
   */
  CUSTOM_PROPERTIES:
    "http://schemas.openxmlformats.org/officeDocument/2006/custom-properties",

  /**
   * XML schema instance namespace
   */
  XML_SCHEMA_INSTANCE: "http://www.w3.org/2001/XMLSchema-instance",

  /**
   * XML schema namespace
   */
  XML_SCHEMA: "http://www.w3.org/2001/XMLSchema",
} as const;

/**
 * Geometry preset types for DrawingML shapes
 */
export const PRESET_GEOMETRY_TYPES = {
  // Basic shapes
  RECTANGLE: "rect",
  ROUND_RECTANGLE: "roundRect",
  ELLIPSE: "ellipse",
  TRIANGLE: "triangle",
  RT_TRIANGLE: "rtTriangle",
  PARALLELOGRAM: "parallelogram",
  TRAPEZOID: "trapezoid",
  DIAMOND: "diamond",
  PENTAGON: "pentagon",
  HEXAGON: "hexagon",
  HEPTAGON: "heptagon",
  OCTAGON: "octagon",
  DECAGON: "decagon",

  // Line shapes
  LINE: "line",
  STRAIGHT_CONNECTOR_1: "straightConnector1",
  BENT_CONNECTOR_2: "bentConnector2",
  BENT_CONNECTOR_3: "bentConnector3",
  BENT_CONNECTOR_4: "bentConnector4",
  BENT_CONNECTOR_5: "bentConnector5",
  CURVED_CONNECTOR_2: "curvedConnector2",
  CURVED_CONNECTOR_3: "curvedConnector3",
  CURVED_CONNECTOR_4: "curvedConnector4",
  CURVED_CONNECTOR_5: "curvedConnector5",

  // Arrows
  RIGHT_ARROW: "rightArrow",
  LEFT_ARROW: "leftArrow",
  UP_ARROW: "upArrow",
  DOWN_ARROW: "downArrow",
  LEFT_RIGHT_ARROW: "leftRightArrow",
  UP_DOWN_ARROW: "upDownArrow",
  STRIPED_RIGHT_ARROW: "stripedRightArrow",
  NOTCHED_RIGHT_ARROW: "notchedRightArrow",
  HOME_PLATE: "homePlate",
  CHEVRON: "chevron",
  RIGHT_ARROW_CALLOUT: "rightArrowCallout",
  LEFT_ARROW_CALLOUT: "leftArrowCallout",
  UP_ARROW_CALLOUT: "upArrowCallout",
  DOWN_ARROW_CALLOUT: "downArrowCallout",
  LEFT_RIGHT_ARROW_CALLOUT: "leftRightArrowCallout",
  UP_DOWN_ARROW_CALLOUT: "upDownArrowCallout",
  QUAD_ARROW_CALLOUT: "quadArrowCallout",
  CIRCULAR_ARROW: "circularArrow",

  // Flowchart shapes
  FLOW_CHART_PROCESS: "flowChartProcess",
  FLOW_CHART_DECISION: "flowChartDecision",
  FLOW_CHART_INPUT_OUTPUT: "flowChartInputOutput",
  FLOW_CHART_PREDEFINED_PROCESS: "flowChartPredefinedProcess",
  FLOW_CHART_INTERNAL_STORAGE: "flowChartInternalStorage",
  FLOW_CHART_DOCUMENT: "flowChartDocument",
  FLOW_CHART_MULTIDOCUMENT: "flowChartMultidocument",
  FLOW_CHART_TERMINATOR: "flowChartTerminator",
  FLOW_CHART_PREPARATION: "flowChartPreparation",
  FLOW_CHART_MANUAL_INPUT: "flowChartManualInput",
  FLOW_CHART_MANUAL_OPERATION: "flowChartManualOperation",
  FLOW_CHART_CONNECTOR: "flowChartConnector",
  FLOW_CHART_PUNCHED_CARD: "flowChartPunchedCard",
  FLOW_CHART_PUNCHED_TAPE: "flowChartPunchedTape",
  FLOW_CHART_SUMMING_JUNCTION: "flowChartSummingJunction",
  FLOW_CHART_OR: "flowChartOr",
  FLOW_CHART_COLLATE: "flowChartCollate",
  FLOW_CHART_SORT: "flowChartSort",
  FLOW_CHART_EXTRACT: "flowChartExtract",
  FLOW_CHART_MERGE: "flowChartMerge",
  FLOW_CHART_OFFLINE_STORAGE: "flowChartOfflineStorage",
  FLOW_CHART_ONLINE_STORAGE: "flowChartOnlineStorage",
  FLOW_CHART_MAGNETIC_TAPE: "flowChartMagneticTape",
  FLOW_CHART_MAGNETIC_DISK: "flowChartMagneticDisk",
  FLOW_CHART_MAGNETIC_DRUM: "flowChartMagneticDrum",
  FLOW_CHART_DISPLAY: "flowChartDisplay",

  // Stars and banners
  STAR_4: "star4",
  STAR_5: "star5",
  STAR_6: "star6",
  STAR_7: "star7",
  STAR_8: "star8",
  STAR_10: "star10",
  STAR_12: "star12",
  STAR_16: "star16",
  STAR_24: "star24",
  STAR_32: "star32",
  UP_RIIGHT_DOWN_PARALLELOGRAM: "upRightDownParallelogram",
  EXPLOSION_1: "explosion1",
  EXPLOSION_2: "explosion2",
  IRREGULAR_SEAL_1: "irregularSeal1",
  IRREGULAR_SEAL_2: "irregularSeal2",

  // Callout shapes
  ROUNDED_RECTANGLE_CALLOUT: "roundedRectangleCallout",
  OVAL_CALLOUT: "ovalCallout",
  CLOUD_CALLOUT: "cloudCallout",

  // Other shapes
  HEART: "heart",
  LIGHTNING_BOLT: "lightningBolt",
  SUN: "sun",
  MOON: "moon",
  CLOUD: "cloud",
  ARC: "arc",
  BENT_ARROW: "bentArrow",
  UTURN_ARROW: "uturnArrow",
  CURVED_RIGHT_ARROW: "curvedRightArrow",
  CURVED_LEFT_ARROW: "curvedLeftArrow",
  CURVED_UP_ARROW: "curvedUpArrow",
  CURVED_DOWN_ARROW: "curvedDownArrow",
  STRIPE_ARROW: "swishArrow",
  PIE: "pie",
  PIE_WEDGE: "pieWedge",
  BLOCK_ARC: "blockArc",
  DONUT: "donut",
  NO_SMOKING: "noSmoking",
  PLUS: "plus",
  MINUS: "minus",
  MULTIPLY: "multiply",
  DIVIDE: "divide",
  EQUALS_BEAM: "equalsBeam",
  VERTICAL_SCROLL: "verticalScroll",
  HORIZONTAL_SCROLL: "horizontalScroll",
  WAVE: "wave",
  DOUBLE_WAVE: "doubleWave",
} as const;

export type PresetGeometryType =
  (typeof PRESET_GEOMETRY_TYPES)[keyof typeof PRESET_GEOMETRY_TYPES];

/**
 * Fill types for DrawingML
 */
export const FILL_TYPES = {
  NO_FILL: "noFill",
  SOLID_FILL: "solidFill",
  GRADIENT_FILL: "gradFill",
  PATTERN_FILL: "pattFill",
  BLIP_FILL: "blipFill",
  GROUP_FILL: "grpFill",
} as const;

export type FillType = (typeof FILL_TYPES)[keyof typeof FILL_TYPES];

/**
 * Gradient types
 */
export const GRADIENT_TYPES = {
  LINEAR: "linear",
  PATH: "path",
} as const;

export type GradientType = (typeof GRADIENT_TYPES)[keyof typeof GRADIENT_TYPES];

/**
 * Pattern types
 */
export const PATTERN_TYPES = {
  // Percentage patterns
  PERCENT_5: "pct5",
  PERCENT_10: "pct10",
  PERCENT_20: "pct20",
  PERCENT_25: "pct25",
  PERCENT_30: "pct30",
  PERCENT_40: "pct40",
  PERCENT_50: "pct50",
  PERCENT_60: "pct60",
  PERCENT_70: "pct70",
  PERCENT_75: "pct75",
  PERCENT_80: "pct80",
  PERCENT_90: "pct90",

  // Basic patterns
  HORIZONTAL: "horz",
  VERTICAL: "vert",
  DIAGONAL_LEFT: "diagLt",
  DIAGONAL_RIGHT: "diagRt",
  CROSS: "cross",
  DIAGONAL_CROSS: "diagCross",

  // Grid patterns
  SMALL_GRID: "smGrid",
  LARGE_GRID: "lgGrid",
  SMALL_CHECKER_BOARD: "smChecker",
  LARGE_CHECKER_BOARD: "lgChecker",

  // Diamond patterns
  OUTLINED_DIAMOND: "openDmnd",
  FILLED_DIAMOND: "solidDmnd",
  DOTTED_DIAMOND: "dotDmnd",

  // Diagonal patterns
  DARK_DOWN_DIAGONAL: "dkDnDiag",
  LIGHT_DOWN_DIAGONAL: "ltDnDiag",
  DOWN_DIAGONAL: "dnDiag",
  DARK_UP_DIAGONAL: "dkUpDiag",
  LIGHT_UP_DIAGONAL: "ltUpDiag",
  UP_DIAGONAL: "upDiag",
  WIDE_DOWN_DIAGONAL: "wdDnDiag",
  WIDE_UP_DIAGONAL: "wdUpDiag",

  // Line patterns
  DARK_HORIZONTAL: "dkHorz",
  LIGHT_HORIZONTAL: "ltHorz",
  DARK_VERTICAL: "dkVert",
  LIGHT_VERTICAL: "ltVert",
  NARROW_HORIZONTAL: "narHor",
  NARROW_HORIZONTAL_Z: "narHorz",
  NARROW_VERTICAL: "narVert",

  // Dashed patterns
  DASH_DOWN_DIAGONAL: "dashDnDiag",
  DASH_HORIZONTAL: "dashHorz",
  DASH_UP_DIAGONAL: "dashUpDiag",
  DASH_VERTICAL: "dashVert",

  // Brick patterns
  HORIZONTAL_BRICK: "horzBrick",
  DIAGONAL_BRICK: "diagBrick",

  // Other patterns
  DIVOT: "divot",
  DIAGONAL_CROSS_HATCH: "diagCross",
  HORIZONTAL_CROSS_HATCH: "cross",
  LARGE_CONFETTI: "lgConfetti",
  SMALL_CONFETTI: "smConfetti",
  PLAID: "plaid",
  SHINGLE: "shingle",
  SPHERE: "sphere",
  TRELLIS: "trellis",
  WAVE: "wave",
  WEAVE: "weave",
  ZIG_ZAG: "zigZag",
} as const;

export type PatternType = (typeof PATTERN_TYPES)[keyof typeof PATTERN_TYPES];

/**
 * Text anchor types
 */
export const TEXT_ANCHOR_TYPES = {
  TOP: "t",
  CENTER: "ctr",
  BOTTOM: "b",
  JUSTIFY: "just",
  LEFT: "l",
  RIGHT: "r",
  DISTRIBUTED: "dist",
} as const;

export type TextAnchorType =
  (typeof TEXT_ANCHOR_TYPES)[keyof typeof TEXT_ANCHOR_TYPES];

/**
 * Font alignment types
 */
export const FONT_ALIGNMENT_TYPES = {
  AUTO: "auto",
  BOTTOM: "b",
  BASE: "base",
  CENTER: "ctr",
  TOP: "t",
} as const;

export type FontAlignmentType =
  (typeof FONT_ALIGNMENT_TYPES)[keyof typeof FONT_ALIGNMENT_TYPES];

/**
 * Text wrap types
 */
export const TEXT_WRAP_TYPES = {
  NONE: "none",
  SQUARE: "square",
  TIGHT: "tight",
  THROUGH: "through",
  TOP_AND_BOTTOM: "topAndBottom",
} as const;

export type TextWrapType =
  (typeof TEXT_WRAP_TYPES)[keyof typeof TEXT_WRAP_TYPES];

/**
 * Vertical text types
 */
export const VERTICAL_TEXT_TYPES = {
  HORIZONTAL: "horz",
  VERTICAL: "vert",
  VERTICAL_270: "vert270",
  WORD_ART_VERTICAL: "wordArtVert",
  EAST_ASIAN_VERTICAL: "eaVert",
  MONGOLIAN_VERTICAL: "mongolianVert",
} as const;

export type VerticalTextType =
  (typeof VERTICAL_TEXT_TYPES)[keyof typeof VERTICAL_TEXT_TYPES];

/**
 * Text overflow types
 */
export const TEXT_OVERFLOW_TYPES = {
  OVERFLOW: "overflow",
  CLIP: "clip",
  ELLIPSIS: "ellipsis",
} as const;

export type TextOverflowType =
  (typeof TEXT_OVERFLOW_TYPES)[keyof typeof TEXT_OVERFLOW_TYPES];

/**
 * Text warp presets
 */
export const TEXT_WARP_PRESETS = {
  TEXT_ARCH_UP: "textArchUp",
  TEXT_ARCH_DOWN: "textArchDown",
  TEXT_CIRCLE: "textCircle",
  TEXT_BUTTON: "textButton",
  TEXT_CURVE_UP: "textCurveUp",
  TEXT_CURVE_DOWN: "textCurveDown",
  TEXT_CAN_UP: "textCanUp",
  TEXT_CAN_DOWN: "textCanDown",
  TEXT_WAVE_1: "textWave1",
  TEXT_WAVE_2: "textWave2",
  TEXT_WAVE_3: "textWave3",
  TEXT_WAVE_4: "textWave4",
  TEXT_DOUBLE_WAVE_1: "textDoubleWave1",
  TEXT_DOUBLE_WAVE_2: "textDoubleWave2",
  TEXT_INFLATE: "textInflate",
  TEXT_DEFLATE: "textDeflate",
  TEXT_INFLATE_BOTTOM: "textInflateBottom",
  TEXT_DEFLATE_BOTTOM: "textDeflateBottom",
  TEXT_INFLATE_TOP: "textInflateTop",
  TEXT_DEFLATE_TOP: "textDeflateTop",
  TEXT_DEFLATE_INFLATE: "textDeflateInflate",
  TEXT_DEFLATE_INFLATE_DEFLATE: "textDeflateInflateDeflate",
  TEXT_FADE_RIGHT: "textFadeRight",
  TEXT_FADE_LEFT: "textFadeLeft",
  TEXT_FADE_UP: "textFadeUp",
  TEXT_FADE_DOWN: "textFadeDown",
  TEXT_SLANT_UP: "textSlantUp",
  TEXT_SLANT_DOWN: "textSlantDown",
  TEXT_CASCADE_UP: "textCascadeUp",
  TEXT_CASCADE_DOWN: "textCascadeDown",
  TEXT_ARCH_UP_POUR: "textArchUpPour",
  TEXT_ARCH_DOWN_POUR: "textArchDownPour",
  TEXT_CIRCLE_POUR: "textCirclePour",
  TEXT_BUTTON_POUR: "textButtonPour",
  TEXT_CURVE_UP_POUR: "textCurveUpPour",
  TEXT_CURVE_DOWN_POUR: "textCurveDownPour",
  TEXT_CAN_UP_POUR: "textCanUpPour",
  TEXT_CAN_DOWN_POUR: "textCanDownPour",
  TEXT_INFLATE_POUR: "textInflatePour",
  TEXT_DEFLATE_POUR: "textDeflatePour",
  TEXT_INFLATE_BOTTOM_POUR: "textInflateBottomPour",
  TEXT_DEFLATE_BOTTOM_POUR: "textDeflateBottomPour",
  TEXT_INFLATE_TOP_POUR: "textInflateTopPour",
  TEXT_DEFLATE_TOP_POUR: "textDeflateTopPour",
  TEXT_DEFLATE_INFLATE_POUR: "textDeflateInflatePour",
  TEXT_DEFLATE_INFLATE_DEFLATE_POUR: "textDeflateInflateDeflatePour",
  TEXT_FADE_RIGHT_POUR: "textFadeRightPour",
  TEXT_FADE_LEFT_POUR: "textFadeLeftPour",
  TEXT_FADE_UP_POUR: "textFadeUpPour",
  TEXT_FADE_DOWN_POUR: "textFadeDownPour",
  TEXT_SLANT_UP_POUR: "textSlantUpPour",
  TEXT_SLANT_DOWN_POUR: "textSlantDownPour",
  TEXT_CASCADE_UP_POUR: "textCascadeUpPour",
  TEXT_CASCADE_DOWN_POUR: "textCascadeDownPour",
  TEXT_STOP: "textStop",
} as const;

export type TextWarpPreset =
  (typeof TEXT_WARP_PRESETS)[keyof typeof TEXT_WARP_PRESETS];

/**
 * Scheme color names
 */
export const SCHEME_COLOR_NAMES = {
  PHONG_COLOR: "phClr",
  DARK_1: "dk1",
  LIGHT_1: "lt1",
  DARK_2: "dk2",
  LIGHT_2: "lt2",
  ACCENT_1: "accent1",
  ACCENT_2: "accent2",
  ACCENT_3: "accent3",
  ACCENT_4: "accent4",
  ACCENT_5: "accent5",
  ACCENT_6: "accent6",
  HYPERLINK: "hlink",
  FOLLOWED_HYPERLINK: "folHlink",
} as const;

export type SchemeColorName =
  (typeof SCHEME_COLOR_NAMES)[keyof typeof SCHEME_COLOR_NAMES];

/**
 * Preset colors
 */
export const PRESET_COLORS = {
  ALICE_BLUE: "aliceBlue",
  ANTIQUE_WHITE: "antiqueWhite",
  AQUA: "aqua",
  AQUAMARINE: "aquamarine",
  AZURE: "azure",
  BEIGE: "beige",
  BISQUE: "bisque",
  BLACK: "black",
  BLANCHED_ALMOND: "blanchedAlmond",
  BLUE: "blue",
  BLUE_VIOLET: "blueViolet",
  BROWN: "brown",
  BURLY_WOOD: "burlyWood",
  CADET_BLUE: "cadetBlue",
  CHARTREUSE: "chartreuse",
  CHOCOLATE: "chocolate",
  CORAL: "coral",
  CORNFLOWER_BLUE: "cornflowerBlue",
  CORNSILK: "cornsilk",
  CRIMSON: "crimson",
  CYAN: "cyan",
  DARK_BLUE: "darkBlue",
  DARK_CYAN: "darkCyan",
  DARK_GOLDENROD: "darkGoldenrod",
  DARK_GRAY: "darkGray",
  DARK_GREEN: "darkGreen",
  DARK_GREY: "darkGrey",
  DARK_KHAKI: "darkKhaki",
  DARK_MAGENTA: "darkMagenta",
  DARK_OLIVE_GREEN: "darkOliveGreen",
  DARK_ORANGE: "darkOrange",
  DARK_ORCHID: "darkOrchid",
  DARK_RED: "darkRed",
  DARK_SALMON: "darkSalmon",
  DARK_SEA_GREEN: "darkSeaGreen",
  DARK_SLATE_BLUE: "darkSlateBlue",
  DARK_SLATE_GRAY: "darkSlateGray",
  DARK_SLATE_GREY: "darkSlateGrey",
  DARK_TURQUOISE: "darkTurquoise",
  DARK_VIOLET: "darkViolet",
  DEEP_PINK: "deepPink",
  DEEP_SKY_BLUE: "deepSkyBlue",
  DIM_GRAY: "dimGray",
  DIM_GREY: "dimGrey",
  DODGER_BLUE: "dodgerBlue",
  FIREBRICK: "firebrick",
  FLORAL_WHITE: "floralWhite",
  FOREST_GREEN: "forestGreen",
  FUCHSIA: "fuchsia",
  GAINSBORO: "gainsboro",
  GHOST_WHITE: "ghostWhite",
  GOLD: "gold",
  GOLDENROD: "goldenrod",
  GRAY: "gray",
  GREEN: "green",
  GREEN_YELLOW: "greenYellow",
  GREY: "grey",
  HONEYDEW: "honeydew",
  HOT_PINK: "hotPink",
  INDIAN_RED: "indianRed",
  INDIGO: "indigo",
  IVORY: "ivory",
  KHAKI: "khaki",
  LAVENDER: "lavender",
  LAVENDER_BLUSH: "lavenderBlush",
  LAWN_GREEN: "lawnGreen",
  LEMON_CHIFFON: "lemonChiffon",
  LIGHT_BLUE: "lightBlue",
  LIGHT_CORAL: "lightCoral",
  LIGHT_CYAN: "lightCyan",
  LIGHT_GOLDENROD_YELLOW: "lightGoldenrodYellow",
  LIGHT_GRAY: "lightGray",
  LIGHT_GREEN: "lightGreen",
  LIGHT_GREY: "lightGrey",
  LIGHT_PINK: "lightPink",
  LIGHT_SALMON: "lightSalmon",
  LIGHT_SEA_GREEN: "lightSeaGreen",
  LIGHT_SKY_BLUE: "lightSkyBlue",
  LIGHT_SLATE_GRAY: "lightSlateGray",
  LIGHT_SLATE_GREY: "lightSlateGrey",
  LIGHT_STEEL_BLUE: "lightSteelBlue",
  LIGHT_YELLOW: "lightYellow",
  LIME: "lime",
  LIME_GREEN: "limeGreen",
  LINEN: "linen",
  MAGENTA: "magenta",
  MAROON: "maroon",
  MEDIUM_AQUAMARINE: "mediumAquamarine",
  MEDIUM_BLUE: "mediumBlue",
  MEDIUM_ORCHID: "mediumOrchid",
  MEDIUM_PURPLE: "mediumPurple",
  MEDIUM_SEA_GREEN: "mediumSeaGreen",
  MEDIUM_SLATE_BLUE: "mediumSlateBlue",
  MEDIUM_SPRING_GREEN: "mediumSpringGreen",
  MEDIUM_TURQUOISE: "mediumTurquoise",
  MEDIUM_VIOLET_RED: "mediumVioletRed",
  MIDNIGHT_BLUE: "midnightBlue",
  MINT_CREAM: "mintCream",
  MISTY_ROSE: "mistyRose",
  MOCCASIN: "moccasin",
  NAVAJO_WHITE: "navajoWhite",
  NAVY: "navy",
  OLD_LACE: "oldLace",
  OLIVE: "olive",
  OLIVE_DRAB: "oliveDrab",
  ORANGE: "orange",
  ORANGE_RED: "orangeRed",
  ORCHID: "orchid",
  PALE_GOLDENROD: "paleGoldenrod",
  PALE_GREEN: "paleGreen",
  PALE_TURQUOISE: "paleTurquoise",
  PALE_VIOLET_RED: "paleVioletRed",
  PAPAYA_WHIP: "papayaWhip",
  PEACH_PUFF: "peachPuff",
  PERU: "peru",
  PINK: "pink",
  PLUM: "plum",
  POWDER_BLUE: "powderBlue",
  PURPLE: "purple",
  RED: "red",
  ROSY_BROWN: "rosyBrown",
  ROYAL_BLUE: "royalBlue",
  SADDLE_BROWN: "saddleBrown",
  SALMON: "salmon",
  SANDY_BROWN: "sandyBrown",
  SEA_GREEN: "seaGreen",
  SEA_SHELL: "seaShell",
  SIENNA: "sienna",
  SILVER: "silver",
  SKY_BLUE: "skyBlue",
  SLATE_BLUE: "slateBlue",
  SLATE_GRAY: "slateGray",
  SLATE_GREY: "slateGrey",
  SNOW: "snow",
  SPRING_GREEN: "springGreen",
  STEEL_BLUE: "steelBlue",
  TAN: "tan",
  TEAL: "teal",
  THISTLE: "thistle",
  TOMATO: "tomato",
  TURQUOISE: "turquoise",
  VIOLET: "violet",
  WHEAT: "wheat",
  WHITE: "white",
  WHITE_SMOKE: "whiteSmoke",
  YELLOW: "yellow",
  YELLOW_GREEN: "yellowGreen",
} as const;

export type PresetColorName =
  (typeof PRESET_COLORS)[keyof typeof PRESET_COLORS];

/**
 * System colors
 */
export const SYSTEM_COLORS = {
  SCROLL_BAR: "scrollBar",
  BACKGROUND: "background",
  ACTIVE_CAPTION: "activeCaption",
  INACTIVE_CAPTION: "inactiveCaption",
  MENU: "menu",
  WINDOW: "window",
  WINDOW_FRAME: "windowFrame",
  MENU_TEXT: "menuText",
  WINDOW_TEXT: "windowText",
  CAPTION_TEXT: "captionText",
  ACTIVE_BORDER: "activeBorder",
  INACTIVE_BORDER: "inactiveBorder",
  APP_WORKSPACE: "appWorkspace",
  HIGHLIGHT: "highlight",
  HIGHLIGHT_TEXT: "highlightText",
  BTN_FACE: "btnFace",
  BTN_SHADOW: "btnShadow",
  GRAY_TEXT: "grayText",
  BTN_TEXT: "btnText",
  INACTIVE_CAPTION_TEXT: "inactiveCaptionText",
  BTN_HIGHLIGHT: "btnHighlight",
  THREE_D_DARK_SHADOW: "3dDkShadow",
  THREE_D_LIGHT: "3dLight",
  INFO_TEXT: "infoText",
  INFO_BK: "infoBk",
  HOT_LIGHT: "hotLight",
  GRADIENT_ACTIVE_CAPTION: "gradientActiveCaption",
  GRADIENT_INACTIVE_CAPTION: "gradientInactiveCaption",
  MENU_HIGHLIGHT: "menuHighlight",
  MENU_BAR: "menuBar",
} as const;

export type SystemColorName =
  (typeof SYSTEM_COLORS)[keyof typeof SYSTEM_COLORS];

/**
 * Compression states for images
 */
export const COMPRESSION_STATES = {
  EMAIL: "email",
  HQ_PRINT: "hqprint",
  NONE: "none",
  PRINT: "print",
  SCREEN: "screen",
} as const;

export type CompressionState =
  (typeof COMPRESSION_STATES)[keyof typeof COMPRESSION_STATES];

/**
 * Effect types
 */
export const EFFECT_TYPES = {
  // Shadow effects
  OUTER_SHADOW: "outerShdw",
  INNER_SHADOW: "innerShdw",
  PERSPECTIVE_SHADOW: "perspectiveShdw",
  PRESET_SHADOW: "prstShdw",

  // Blur effects
  BLUR: "blur",

  // Fill effects
  FILL_OVERLAY: "fillOverlay",

  // Glow effects
  GLOW: "glow",
  SOFT_EDGE: "softEdge",

  // 3D effects
  BEVEL: "bevel",
  THREE_D_ROTATION: "rotation3d",
  THREE_D_EXTRUSION: "extrusion",
  THREE_D_CONTOUR: "contour",

  // Other effects
  REFLECTION: "reflection",
} as const;

export type EffectType = (typeof EFFECT_TYPES)[keyof typeof EFFECT_TYPES];

/**
 * Effect blend modes
 */
export const EFFECT_BLEND_MODES = {
  DARKEN: "darken",
  LIGHTEN: "lighten",
  MULTIPLY: "mult",
  OVER: "over",
  SCREEN: "screen",
} as const;

export type EffectBlendMode =
  (typeof EFFECT_BLEND_MODES)[keyof typeof EFFECT_BLEND_MODES];

/**
 * Preset shadow types
 */
export const PRESET_SHADOW_TYPES = {
  SHADOW_1: "shdw1",
  SHADOW_2: "shdw2",
  SHADOW_3: "shdw3",
  SHADOW_4: "shdw4",
  SHADOW_5: "shdw5",
  SHADOW_6: "shdw6",
  SHADOW_7: "shdw7",
  SHADOW_8: "shdw8",
  SHADOW_9: "shdw9",
  SHADOW_10: "shdw10",
  SHADOW_11: "shdw11",
  SHADOW_12: "shdw12",
  SHADOW_13: "shdw13",
  SHADOW_14: "shdw14",
  SHADOW_15: "shdw15",
  SHADOW_16: "shdw16",
  SHADOW_17: "shdw17",
  SHADOW_18: "shdw18",
  SHADOW_19: "shdw19",
  SHADOW_20: "shdw20",
} as const;

export type PresetShadowType =
  (typeof PRESET_SHADOW_TYPES)[keyof typeof PRESET_SHADOW_TYPES];

/**
 * Rectangle relative modes
 */
export const RECTANGLE_RELATIVE_MODES = {
  TOP: "t",
  TOP_LEFT: "tl",
  TOP_RIGHT: "tr",
  BOTTOM: "b",
  BOTTOM_LEFT: "bl",
  BOTTOM_RIGHT: "br",
  CENTER: "ctr",
  LEFT: "l",
  RIGHT: "r",
} as const;

export type RectangleRelativeMode =
  (typeof RECTANGLE_RELATIVE_MODES)[keyof typeof RECTANGLE_RELATIVE_MODES];

/**
 * Line cap types
 */
export const LINE_CAP_TYPES = {
  FLAT: "flat",
  SQUARE: "sq",
  ROUND: "rnd",
} as const;

export type LineCapType = (typeof LINE_CAP_TYPES)[keyof typeof LINE_CAP_TYPES];

/**
 * Line compound types
 */
export const LINE_COMPOUND_TYPES = {
  SINGLE: "sng",
  DOUBLE: "dbl",
  THICK_THIN: "thickThin",
  THIN_THICK: "thinThick",
  TRIPLE: "tri",
} as const;

export type LineCompoundType =
  (typeof LINE_COMPOUND_TYPES)[keyof typeof LINE_COMPOUND_TYPES];

/**
 * Line dash types
 */
export const LINE_DASH_TYPES = {
  SOLID: "solid",
  DOT: "dot",
  DASH: "dash",
  LONG_DASH: "lgDash",
  DASH_DOT: "dashDot",
  LONG_DASH_DOT: "lgDashDot",
  LONG_DASH_DOT_DOT: "lgDashDotDot",
  SYSTEM_DASH: "sysDash",
  SYSTEM_DOT: "sysDot",
  SYSTEM_DASH_DOT: "sysDashDot",
  SYSTEM_DASH_DOT_DOT: "sysDashDotDot",
} as const;

export type LineDashType =
  (typeof LINE_DASH_TYPES)[keyof typeof LINE_DASH_TYPES];

/**
 * Line alignment types
 */
export const LINE_ALIGNMENT_TYPES = {
  CENTER: "ctr",
  INSET: "in",
} as const;

export type LineAlignmentType =
  (typeof LINE_ALIGNMENT_TYPES)[keyof typeof LINE_ALIGNMENT_TYPES];

/**
 * Preset line dash types
 */
export const PRESET_LINE_DASH_TYPES = {
  SOLID: "solid",
  DOT: "dot",
  DASH: "dash",
  LONG_DASH: "lgDash",
  DASH_DOT: "dashDot",
  LONG_DASH_DOT: "lgDashDot",
  LONG_DASH_DOT_DOT: "lgDashDotDot",
} as const;

export type PresetLineDashType =
  (typeof PRESET_LINE_DASH_TYPES)[keyof typeof PRESET_LINE_DASH_TYPES];

/**
 * Text underline types
 */
export const TEXT_UNDERLINE_TYPES = {
  NONE: "none",
  SINGLE: "single",
  DOUBLE: "dbl",
  HEAVY: "heavy",
  DOTTED: "dotted",
  DOTTED_HEAVY: "dottedHeavy",
  DASH: "dash",
  DASH_HEAVY: "dashHeavy",
  DASH_LONG: "dashLong",
  DASH_LONG_HEAVY: "dashLongHeavy",
  DOT_DASH: "dotDash",
  DOT_DASH_HEAVY: "dotDashHeavy",
  TWO_DOT_DASH: "dotDotDash",
  TWO_DOT_DASH_HEAVY: "dotDotDashHeavy",
  WAVE: "wave",
  WAVE_HEAVY: "waveHeavy",
  WAVE_DOUBLE: "wavyDbl",
} as const;

export type TextUnderlineType =
  (typeof TEXT_UNDERLINE_TYPES)[keyof typeof TEXT_UNDERLINE_TYPES];

/**
 * Text strike types
 */
export const TEXT_STRIKE_TYPES = {
  NONE: "noStrike",
  SINGLE_STRIKE: "strike",
  DOUBLE_STRIKE: "dblStrike",
} as const;

export type TextStrikeType =
  (typeof TEXT_STRIKE_TYPES)[keyof typeof TEXT_STRIKE_TYPES];

/**
 * Text case types
 */
export const TEXT_CASE_TYPES = {
  NONE: "none",
  UPPER: "all",
  LOWER: "small",
  TITLE: "caps",
} as const;

export type TextCaseType =
  (typeof TEXT_CASE_TYPES)[keyof typeof TEXT_CASE_TYPES];

/**
 * Text font scheme types
 */
export const TEXT_FONT_SCHEME_TYPES = {
  NONE: "none",
  MAJOR: "major",
  MINOR: "minor",
} as const;

export type TextFontSchemeType =
  (typeof TEXT_FONT_SCHEME_TYPES)[keyof typeof TEXT_FONT_SCHEME_TYPES];

/**
 * Bullet types
 */
export const BULLET_TYPES = {
  NONE: "none",
  BULLET_AUTO_NUMBERING: "autoNum",
  BULLET_CHARACTER: "bullet",
  BULLET_PICTURE: "bulletBlip",
} as const;

export type BulletType = (typeof BULLET_TYPES)[keyof typeof BULLET_TYPES];

/**
 * Text auto numbering schemes
 */
export const TEXT_AUTO_NUMBERING_SCHEMES = {
  ARABIC_PLAIN: "arabicPlain",
  ARABIC_PERIOD: "arabicPeriod",
  ARABIC_PAREN_RIGHT: "arabicParenR",
  ARABIC_PAREN_BOTH: "arabicParenBoth",
  ALPHA_UPPER_PLAIN: "alphaUcPlain",
  ALPHA_UPPER_PERIOD: "alphaUcPeriod",
  ALPHA_UPPER_PAREN_RIGHT: "alphaUcParenR",
  ALPHA_UPPER_PAREN_BOTH: "alphaUcParenBoth",
  ALPHA_LOWER_PLAIN: "alphaLcPlain",
  ALPHA_LOWER_PERIOD: "alphaLcPeriod",
  ALPHA_LOWER_PAREN_RIGHT: "alphaLcParenR",
  ALPHA_LOWER_PAREN_BOTH: "alphaLcParenBoth",
  ROMAN_UPPER_PLAIN: "romanUcPlain",
  ROMAN_UPPER_PERIOD: "romanUcPeriod",
  ROMAN_UPPER_PAREN_RIGHT: "romanUcParenR",
  ROMAN_UPPER_PAREN_BOTH: "romanUcParenBoth",
  ROMAN_LOWER_PLAIN: "romanLcPlain",
  ROMAN_LOWER_PERIOD: "romanLcPeriod",
  ROMAN_LOWER_PAREN_RIGHT: "romanLcParenR",
  ROMAN_LOWER_PAREN_BOTH: "romanLcParenBoth",
  CIRCLE_NUM: "circleNum",
  CIRCLE_NUM_DB_PLAIN: "circleNumDbPlain",
  CIRCLE_NUM_DB_WD_PLAIN: "circleNumDbWdPlain",
  CIRCLE_NUM_WD_BLACK_PLAIN: "circleNumWdBlackPlain",
  CIRCLE_NUM_WD_WHITE_PLAIN: "circleNumWdWhitePlain",
} as const;

export type TextAutoNumberingScheme =
  (typeof TEXT_AUTO_NUMBERING_SCHEMES)[keyof typeof TEXT_AUTO_NUMBERING_SCHEMES];

/**
 * Tab stop types
 */
export const TAB_STOP_TYPES = {
  CENTER: "ctr",
  DECIMAL: "dec",
  LEFT: "l",
  RIGHT: "r",
  BAR: "bar",
  CLEAR: "clear",
  NUM: "num",
} as const;

export type TabStopType = (typeof TAB_STOP_TYPES)[keyof typeof TAB_STOP_TYPES];

/**
 * Bevel types
 */
export const BEVEL_TYPES = {
  ANGLE: "angle",
  ART_DECO: "artDeco",
  CIRCLE: "circle",
  CONE: "cone",
  COOL_SLANT: "coolSlant",
  CROSS: "cross",
  DIVOT: "divot",
  HARD_EDGE: "hardEdge",
  RELAXED_INSET: "relaxedInset",
  RIBBON: "ribbon",
  SLOPE: "slope",
  SOFT_ROUND: "softRound",
} as const;

export type BevelType = (typeof BEVEL_TYPES)[keyof typeof BEVEL_TYPES];

/**
 * Light rig types
 */
export const LIGHT_RIG_TYPES = {
  FLAT_TOP: "flatTop",
  LEGACY_FLAT_1: "legacyFlat1",
  LEGACY_FLAT_2: "legacyFlat2",
  LEGACY_FLAT_3: "legacyFlat3",
  LEGACY_FLAT_4: "legacyFlat4",
  LEGACY_HARSH_1: "legacyHarsh1",
  LEGACY_HARSH_2: "legacyHarsh2",
  LEGACY_HARSH_3: "legacyHarsh3",
  LEGACY_HARSH_4: "legacyHarsh4",
  LEGACY_NORMAL_1: "legacyNormal1",
  LEGACY_NORMAL_2: "legacyNormal2",
  LEGACY_NORMAL_3: "legacyNormal3",
  LEGACY_NORMAL_4: "legacyNormal4",
  THREE_PT_BALANCED: "threePtBalanced",
  THREE_PT_CONTRASTING: "threePtContrasting",
  BRIGHT_ROOM: "brightRoom",
  CHILLY: "chilly",
  FREEZING: "freezing",
  GLOW: "glow",
  HARSH: "harsh",
  MORNING: "morning",
  MORNING_VERTICAL: "morningVertical",
  SUNSET: "sunset",
  SUNSET_VERTICAL: "sunsetVertical",
  SURGE: "surge",
  TWO_PT_BALANCED: "twoPtBalanced",
  TWO_PT_CONTRASTING: "twoPtContrasting",
} as const;

export type LightRigType =
  (typeof LIGHT_RIG_TYPES)[keyof typeof LIGHT_RIG_TYPES];

/**
 * Light rig directions
 */
export const LIGHT_RIG_DIRECTIONS = {
  TOP_LEFT: "tl",
  TOP: "t",
  TOP_RIGHT: "tr",
  LEFT: "l",
  RIGHT: "r",
  BOTTOM_LEFT: "bl",
  BOTTOM: "b",
  BOTTOM_RIGHT: "br",
} as const;

export type LightRigDirection =
  (typeof LIGHT_RIG_DIRECTIONS)[keyof typeof LIGHT_RIG_DIRECTIONS];

/**
 * Camera preset types
 */
export const CAMERA_PRESET_TYPES = {
  LEGACY_OBLIQUE_BOTTOM_LEFT: "legacyObliqueBottomLeft",
  LEGACY_OBLIQUE_BOTTOM_RIGHT: "legacyObliqueBottomRight",
  LEGACY_OBLIQUE_FRONT: "legacyObliqueFront",
  LEGACY_OBLIQUE_TOP_LEFT: "legacyObliqueTopLeft",
  LEGACY_OBLIQUE_TOP_RIGHT: "legacyObliqueTopRight",
  LEGACY_PERSPECTIVE_BOTTOM: "legacyPerspectiveBottom",
  LEGACY_PERSPECTIVE_BOTTOM_LEFT: "legacyPerspectiveBottomLeft",
  LEGACY_PERSPECTIVE_BOTTOM_RIGHT: "legacyPerspectiveBottomRight",
  LEGACY_PERSPECTIVE_FRONT: "legacyPerspectiveFront",
  LEGACY_PERSPECTIVE_TOP: "legacyPerspectiveTop",
  LEGACY_PERSPECTIVE_TOP_LEFT: "legacyPerspectiveTopLeft",
  LEGACY_PERSPECTIVE_TOP_RIGHT: "legacyPerspectiveTopRight",
  ISOMETRIC_BOTTOM_DOWN: "isometricBottomDown",
  ISOMETRIC_BOTTOM_UP: "isometricBottomUp",
  ISOMETRIC_LEFT_DOWN: "isometricLeftDown",
  ISOMETRIC_LEFT_UP: "isometricLeftUp",
  ISOMETRIC_OFF_AXIS_1_LEFT: "isometricOffAxis1Left",
  ISOMETRIC_OFF_AXIS_1_RIGHT: "isometricOffAxis1Right",
  ISOMETRIC_OFF_AXIS_1_TOP: "isometricOffAxis1Top",
  ISOMETRIC_OFF_AXIS_2_LEFT: "isometricOffAxis2Left",
  ISOMETRIC_OFF_AXIS_2_RIGHT: "isometricOffAxis2Right",
  ISOMETRIC_OFF_AXIS_2_TOP: "isometricOffAxis2Top",
  ISOMETRIC_OFF_AXIS_4_BOTTOM: "isometricOffAxis4Bottom",
  ISOMETRIC_OFF_AXIS_4_LEFT: "isometricOffAxis4Left",
  ISOMETRIC_OFF_AXIS_4_RIGHT: "isometricOffAxis4Right",
  ISOMETRIC_OFF_AXIS_4_TOP: "isometricOffAxis4Top",
  ISOMETRIC_ORTHOGONAL_TOP: "isometricOrthogonalTop",
  OBLIQUE_BOTTOM_LEFT: "obliqueBottomLeft",
  OBLIQUE_BOTTOM_RIGHT: "obliqueBottomRight",
  OBLIQUE_FRONT: "obliqueFront",
  OBLIQUE_TOP_LEFT: "obliqueTopLeft",
  OBLIQUE_TOP_RIGHT: "obliqueTopRight",
  PERSPECTIVE_BOTTOM: "perspectiveBottom",
  PERSPECTIVE_BOTTOM_LEFT: "perspectiveBottomLeft",
  PERSPECTIVE_BOTTOM_RIGHT: "perspectiveBottomRight",
  PERSPECTIVE_FRONT: "perspectiveFront",
  PERSPECTIVE_TOP: "perspectiveTop",
  PERSPECTIVE_TOP_LEFT: "perspectiveTopLeft",
  PERSPECTIVE_TOP_RIGHT: "perspectiveTopRight",
} as const;

export type CameraPresetType =
  (typeof CAMERA_PRESET_TYPES)[keyof typeof CAMERA_PRESET_TYPES];

/**
 * Field types
 */
export const FIELD_TYPES = {
  DATE: "datetime",
  SLIDE_NUMBER: "slidenum",
  NUMBER: "num",
  PICTURE: "pict",
} as const;

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES];

/**
 * Placeholder types
 */
export const PLACEHOLDER_TYPES = {
  TITLE: "title",
  BODY: "body",
  CENTERED_TITLE: "ctrTitle",
  SUBTITLE: "subTitle",
  OBJECT: "obj",
  CHART: "chart",
  TABLE: "tbl",
  CLIP_ART: "clipArt",
  DGM: "dgm",
  MEDIA: "media",
  SLIDE_IMAGE: "sldImg",
  FTR: "ftr",
  HDR: "hdr",
  DATE: "dt",
  SLIDE_NUMBER: "sldNum",
  FOOTER: "ftr",
  HEADER: "hdr",
} as const;

export type PlaceholderType =
  (typeof PLACEHOLDER_TYPES)[keyof typeof PLACEHOLDER_TYPES];

/**
 * Paragraph property types
 */
export const PARAGRAPH_PROPERTY_TYPES = {
  LATIN_LINE_BREAK: "latinLnBrk",
  HANGING_PUNCTUATION: "hangingPunct",
} as const;

export type ParagraphPropertyType =
  (typeof PARAGRAPH_PROPERTY_TYPES)[keyof typeof PARAGRAPH_PROPERTY_TYPES];
