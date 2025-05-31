// ast/sml.ts
// Defines SpreadsheetML (SML) types and interfaces
// Based on Office Open XML SpreadsheetML specification
// SpreadsheetML is used for Excel spreadsheet documents

// --- SML Specific OOXML Types (String Literals) ---
// These define the possible values for data.ooxmlType based on SpreadsheetML specification

// Core document structure types
export type SmlWorkbookType = "workbook"; // <workbook> root element
export type SmlSheetsType = "sheets"; // <sheets> container for sheets
export type SmlSheetType = "sheet"; // <sheet> sheet reference
export type SmlWorksheetType = "worksheet"; // <worksheet> worksheet content
export type SmlSheetDataType = "sheetData"; // <sheetData> sheet data container

// Cell and row types
export type SmlRowType = "row"; // <row> row element
export type SmlCellType = "cell"; // <c> cell element
export type SmlCellValueType = "cellValue"; // <v> cell value
export type SmlCellFormulaType = "cellFormula"; // <f> cell formula
export type SmlInlineStringType = "inlineString"; // <is> inline string
export type SmlRichTextType = "richText"; // <r> rich text run in inline string

// Column and dimension types
export type SmlColumnsType = "columns"; // <cols> columns container
export type SmlColumnType = "column"; // <col> column definition
export type SmlDimensionType = "dimension"; // <dimension> worksheet dimensions
export type SmlMergeCellsType = "mergeCells"; // <mergeCells> merged cells container
export type SmlMergeCellType = "mergeCell"; // <mergeCell> merged cell

// Table types
export type SmlTableType = "table"; // <table> table definition
export type SmlTablePartsType = "tableParts"; // <tableParts> table parts container
export type SmlTablePartType = "tablePart"; // <tablePart> table part reference
export type SmlTableColumnsType = "tableColumns"; // <tableColumns> table columns
export type SmlTableColumnType = "tableColumn"; // <tableColumn> table column
export type SmlAutoFilterType = "autoFilter"; // <autoFilter> auto filter

// Chart types in spreadsheets
export type SmlChartType = "chart"; // Chart in spreadsheet context
export type SmlChartSheetType = "chartsheet"; // <chartsheet> chart sheet
export type SmlDrawingType = "drawing"; // <drawing> drawing reference

// Styles and formatting types
export type SmlStyleSheetType = "styleSheet"; // <styleSheet> styles root
export type SmlCellFormatsType = "cellFormats"; // <cellXfs> cell formats
export type SmlCellFormatType = "cellFormat"; // <xf> cell format
export type SmlFontsType = "fonts"; // <fonts> fonts collection
export type SmlFontType = "font"; // <font> font definition
export type SmlFillsType = "fills"; // <fills> fills collection
export type SmlFillType = "fill"; // <fill> fill definition
export type SmlBordersType = "borders"; // <borders> borders collection
export type SmlBorderType = "border"; // <border> border definition
export type SmlNumberFormatsType = "numberFormats"; // <numFmts> number formats
export type SmlNumberFormatType = "numberFormat"; // <numFmt> number format

// Shared strings types
export type SmlSharedStringsType = "sharedStrings"; // <sst> shared strings table
export type SmlSharedStringType = "sharedString"; // <si> shared string item

// View and display types
export type SmlSheetViewsType = "sheetViews"; // <sheetViews> sheet views
export type SmlSheetViewType = "sheetView"; // <sheetView> sheet view
export type SmlSelectionType = "selection"; // <selection> selection
export type SmlPaneType = "pane"; // <pane> pane information
export type SmlSheetFormatPropertiesType = "sheetFormatProperties"; // <sheetFormatPr> format properties

// Page setup types
export type SmlPageMarginsType = "pageMargins"; // <pageMargins> page margins
export type SmlPageSetupType = "pageSetup"; // <pageSetup> page setup
export type SmlHeaderFooterType = "headerFooter"; // <headerFooter> header/footer
export type SmlPrintOptionsType = "printOptions"; // <printOptions> print options

// Protection types
export type SmlSheetProtectionType = "sheetProtection"; // <sheetProtection> sheet protection
export type SmlWorkbookProtectionType = "workbookProtection"; // <workbookProtection> workbook protection

// Calculation types
export type SmlCalculationPropertiesType = "calculationProperties"; // <calcPr> calculation properties
export type SmlCalculationChainType = "calculationChain"; // <calcChain> calculation chain

// Union of all SML semantic types
export type SmlOoxmlType =
  // Core structure
  | SmlWorkbookType
  | SmlSheetsType
  | SmlSheetType
  | SmlWorksheetType
  | SmlSheetDataType
  // Cells and rows
  | SmlRowType
  | SmlCellType
  | SmlCellValueType
  | SmlCellFormulaType
  | SmlInlineStringType
  | SmlRichTextType
  // Columns and dimensions
  | SmlColumnsType
  | SmlColumnType
  | SmlDimensionType
  | SmlMergeCellsType
  | SmlMergeCellType
  // Tables
  | SmlTableType
  | SmlTablePartsType
  | SmlTablePartType
  | SmlTableColumnsType
  | SmlTableColumnType
  | SmlAutoFilterType
  // Charts and drawings
  | SmlChartType
  | SmlChartSheetType
  | SmlDrawingType
  // Styles and formatting
  | SmlStyleSheetType
  | SmlCellFormatsType
  | SmlCellFormatType
  | SmlFontsType
  | SmlFontType
  | SmlFillsType
  | SmlFillType
  | SmlBordersType
  | SmlBorderType
  | SmlNumberFormatsType
  | SmlNumberFormatType
  // Shared strings
  | SmlSharedStringsType
  | SmlSharedStringType
  // Views and display
  | SmlSheetViewsType
  | SmlSheetViewType
  | SmlSelectionType
  | SmlPaneType
  | SmlSheetFormatPropertiesType
  // Page setup
  | SmlPageMarginsType
  | SmlPageSetupType
  | SmlHeaderFooterType
  | SmlPrintOptionsType
  // Protection
  | SmlSheetProtectionType
  | SmlWorkbookProtectionType
  // Calculation
  | SmlCalculationPropertiesType
  | SmlCalculationChainType;

// --- Interfaces for complex properties within data.properties ---

// Workbook properties
export interface SmlWorkbookProperties {
  date1904?: boolean; // Use 1904 date system
  dateCompatibility?: boolean; // Date compatibility
  showBorderUnselectedTables?: boolean; // Show borders on unselected tables
  filterPrivacy?: boolean; // Filter privacy
  promptedSolutions?: boolean; // Prompted solutions
  showInkAnnotation?: boolean; // Show ink annotations
  backupFile?: boolean; // Backup file
  saveExternalLinkValues?: boolean; // Save external link values
  updateLinks?: "never" | "always" | "userSet"; // Update links behavior
  codeName?: string; // Code name
  hidePivotFieldList?: boolean; // Hide pivot field list
  showPivotChartFilter?: boolean; // Show pivot chart filter
  allowRefreshQuery?: boolean; // Allow refresh query
  publishItems?: boolean; // Publish items
  checkCompatibility?: boolean; // Check compatibility
  autoCompressPictures?: boolean; // Auto compress pictures
  refreshAllConnections?: boolean; // Refresh all connections
  defaultThemeVersion?: number; // Default theme version
}

// Sheet properties
export interface SmlSheetProperties {
  name?: string; // Sheet name
  sheetId?: number; // Sheet ID
  relationshipId?: string; // Relationship ID
  state?: "visible" | "hidden" | "veryHidden"; // Visibility state
  tabColor?: string; // Tab color
  codeName?: string; // Code name
  enableFormatConditionsCalculation?: boolean; // Enable format conditions calculation
  filterMode?: boolean; // Filter mode
  published?: boolean; // Published
  syncHorizontal?: boolean; // Sync horizontal
  syncVertical?: boolean; // Sync vertical
  syncRef?: string; // Sync reference
  transitionEvaluation?: boolean; // Transition evaluation
  transitionEntry?: boolean; // Transition entry
  pageSetUpPr?: boolean; // Page setup properties
  outlinePr?: boolean; // Outline properties
}

// Row properties
export interface SmlRowProperties {
  r?: number; // Row index (1-based)
  spans?: string; // Column spans
  s?: number; // Style index
  customFormat?: boolean; // Custom format
  ht?: number; // Height in points
  hidden?: boolean; // Hidden
  customHeight?: boolean; // Custom height
  outlineLevel?: number; // Outline level
  collapsed?: boolean; // Collapsed
  thickTop?: boolean; // Thick top border
  thickBot?: boolean; // Thick bottom border
  ph?: boolean; // Show phonetic
  dyDescent?: number; // Descent
}

// Cell properties
export interface SmlCellProperties {
  r?: string; // Cell reference (e.g., "A1")
  s?: number; // Style index
  t?: "b" | "d" | "e" | "inlineStr" | "n" | "s" | "str"; // Cell data type
  cm?: number; // Cell metadata index
  vm?: number; // Value metadata index
  ph?: boolean; // Show phonetic
}

// Cell data types enumeration
export type SmlCellDataType =
  | "b" // Boolean
  | "d" // Date
  | "e" // Error
  | "inlineStr" // Inline string
  | "n" // Number
  | "s" // Shared string
  | "str"; // String

// Column properties
export interface SmlColumnProperties {
  min?: number; // Minimum column index
  max?: number; // Maximum column index
  width?: number; // Column width
  style?: number; // Style index
  hidden?: boolean; // Hidden
  bestFit?: boolean; // Best fit
  customWidth?: boolean; // Custom width
  phonetic?: boolean; // Phonetic
  outlineLevel?: number; // Outline level
  collapsed?: boolean; // Collapsed
}

// Table properties
export interface SmlTableProperties {
  id?: number; // Table ID
  name?: string; // Table name
  displayName?: string; // Display name
  ref?: string; // Cell range reference
  totalsRowShown?: boolean; // Show totals row
  tableBorderDxfId?: number; // Table border format ID
  headerRowBorderDxfId?: number; // Header row border format ID
  totalsRowBorderDxfId?: number; // Totals row border format ID
  headerRowDxfId?: number; // Header row format ID
  insertRow?: boolean; // Insert row
  insertRowShift?: boolean; // Insert row shift
  published?: boolean; // Published
  headerRowCount?: number; // Header row count
  totalsRowCount?: number; // Totals row count
  comment?: string; // Comment
}

// Table column properties
export interface SmlTableColumnProperties {
  id?: number; // Column ID
  uniqueName?: string; // Unique name
  name?: string; // Column name
  totalsRowFunction?:
    | "average"
    | "count"
    | "countNums"
    | "max"
    | "min"
    | "none"
    | "stdDev"
    | "sum"
    | "var"
    | "custom"; // Totals row function
  totalsRowLabel?: string; // Totals row label
  queryTableFieldId?: number; // Query table field ID
  headerRowDxfId?: number; // Header row format ID
  dataDxfId?: number; // Data format ID
  totalsRowDxfId?: number; // Totals row format ID
  headerRowCellStyle?: string; // Header row cell style
  dataCellStyle?: string; // Data cell style
  totalsRowCellStyle?: string; // Totals row cell style
}

// Formula properties
export interface SmlFormulaProperties {
  t?: "array" | "dataTable" | "normal" | "shared"; // Formula type
  aca?: boolean; // Always calculate array
  ref?: string; // Reference for array/data table formulas
  dt2D?: boolean; // Data table 2D
  dtr?: boolean; // Data table row
  del1?: boolean; // Input 1 deleted
  del2?: boolean; // Input 2 deleted
  r1?: string; // Input 1 reference
  r2?: string; // Input 2 reference
  ca?: boolean; // Calculate array
  si?: number; // Shared index
  bx?: boolean; // Assign to name
}

// Number format properties
export interface SmlNumberFormatProperties {
  numFmtId?: number; // Number format ID
  formatCode?: string; // Format code
}

// Font properties
export interface SmlFontProperties {
  name?: string; // Font name
  sz?: number; // Font size
  b?: boolean; // Bold
  i?: boolean; // Italic
  u?: "single" | "double" | "singleAccounting" | "doubleAccounting" | "none"; // Underline
  strike?: boolean; // Strikethrough
  outline?: boolean; // Outline
  shadow?: boolean; // Shadow
  condense?: boolean; // Condense
  extend?: boolean; // Extend
  color?: string; // Font color
  family?: number; // Font family
  charset?: number; // Character set
  scheme?: "major" | "minor" | "none"; // Font scheme
  vertAlign?: "superscript" | "subscript" | "baseline"; // Vertical alignment
}

// Fill properties
export interface SmlFillProperties {
  patternType?:
    | "none"
    | "solid"
    | "mediumGray"
    | "darkGray"
    | "lightGray"
    | "darkHorizontal"
    | "darkVertical"
    | "darkDown"
    | "darkUp"
    | "darkGrid"
    | "darkTrellis"
    | "lightHorizontal"
    | "lightVertical"
    | "lightDown"
    | "lightUp"
    | "lightGrid"
    | "lightTrellis"
    | "gray125"
    | "gray0625"; // Pattern type
  fgColor?: string; // Foreground color
  bgColor?: string; // Background color
  gradientType?: "linear" | "path"; // Gradient type
  degree?: number; // Gradient degree
  left?: number; // Gradient left
  right?: number; // Gradient right
  top?: number; // Gradient top
  bottom?: number; // Gradient bottom
}

// Border properties
export interface SmlBorderProperties {
  left?: SmlBorderSideProperties;
  right?: SmlBorderSideProperties;
  top?: SmlBorderSideProperties;
  bottom?: SmlBorderSideProperties;
  diagonal?: SmlBorderSideProperties;
  vertical?: SmlBorderSideProperties;
  horizontal?: SmlBorderSideProperties;
  diagonalUp?: boolean; // Diagonal up
  diagonalDown?: boolean; // Diagonal down
  outline?: boolean; // Outline
}

// Border side properties
export interface SmlBorderSideProperties {
  style?:
    | "none"
    | "thin"
    | "medium"
    | "dashed"
    | "dotted"
    | "thick"
    | "double"
    | "hair"
    | "mediumDashed"
    | "dashDot"
    | "mediumDashDot"
    | "dashDotDot"
    | "mediumDashDotDot"
    | "slantDashDot"; // Border style
  color?: string; // Border color
}

// Sheet view properties
export interface SmlSheetViewProperties {
  windowProtection?: boolean; // Window protection
  showFormulas?: boolean; // Show formulas
  showGridLines?: boolean; // Show grid lines
  showRowColHeaders?: boolean; // Show row/column headers
  showZeros?: boolean; // Show zeros
  rightToLeft?: boolean; // Right to left
  tabSelected?: boolean; // Tab selected
  showRuler?: boolean; // Show ruler
  showOutlineSymbols?: boolean; // Show outline symbols
  showWhiteSpace?: boolean; // Show white space
  view?: "normal" | "pageBreakPreview" | "pageLayout"; // View type
  topLeftCell?: string; // Top left cell
  colorId?: number; // Color ID
  zoomScale?: number; // Zoom scale
  zoomScaleNormal?: number; // Normal zoom scale
  zoomScaleSheetLayoutView?: number; // Sheet layout view zoom scale
  zoomScalePageLayoutView?: number; // Page layout view zoom scale
  workbookViewId?: number; // Workbook view ID
}

// Selection properties
export interface SmlSelectionProperties {
  pane?: "bottomLeft" | "bottomRight" | "topLeft" | "topRight"; // Pane
  activeCell?: string; // Active cell
  activeCellId?: number; // Active cell ID
  sqref?: string; // Sequence of references
}

// Page margins properties
export interface SmlPageMarginsProperties {
  left?: number; // Left margin
  right?: number; // Right margin
  top?: number; // Top margin
  bottom?: number; // Bottom margin
  header?: number; // Header margin
  footer?: number; // Footer margin
}

// Page setup properties
export interface SmlPageSetupProperties {
  paperSize?: number; // Paper size
  scale?: number; // Scale
  firstPageNumber?: number; // First page number
  fitToWidth?: number; // Fit to width
  fitToHeight?: number; // Fit to height
  pageOrder?: "downThenOver" | "overThenDown"; // Page order
  orientation?: "portrait" | "landscape" | "default"; // Orientation
  usePrinterDefaults?: boolean; // Use printer defaults
  blackAndWhite?: boolean; // Black and white
  draft?: boolean; // Draft
  cellComments?: "none" | "asDisplayed" | "atEnd"; // Cell comments
  useFirstPageNumber?: boolean; // Use first page number
  errors?: "displayed" | "blank" | "dash" | "NA"; // Errors
  horizontalDpi?: number; // Horizontal DPI
  verticalDpi?: number; // Vertical DPI
  copies?: number; // Copies
}

// Calculation properties
export interface SmlCalculationProperties {
  calcMode?: "manual" | "auto" | "autoNoTable"; // Calculation mode
  fullCalcOnLoad?: boolean; // Full calculation on load
  refMode?: "A1" | "R1C1"; // Reference mode
  iterate?: boolean; // Iterate
  iterateCount?: number; // Iteration count
  iterateDelta?: number; // Iteration delta
  fullPrecision?: boolean; // Full precision
  calcCompleted?: boolean; // Calculation completed
  calcOnSave?: boolean; // Calculate on save
  concurrent?: boolean; // Concurrent calculation
  concurrentManual?: boolean; // Concurrent manual
  forceFullCalc?: boolean; // Force full calculation
}
