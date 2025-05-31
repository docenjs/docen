// ast/wml.ts
// Defines OOXML types and property interfaces specific to WordprocessingML (WML)
// Based on Office Open XML WordprocessingML specification
// http://officeopenxml.com/

import type {
  Measurement,
  MeasurementOrAuto,
  MeasurementOrPercent,
  OnOffValue,
  PositionalProperties,
  ShadingProperties,
  TableBorderProperties,
} from "./shared";

// --- WML Specific OOXML Types (String Literals) ---
// These define the possible values for data.ooxmlType based on WordprocessingML specification

// Core document structure types
export type WmlDocumentType = "document"; // <w:document> root element
export type WmlBodyType = "body"; // <w:body> document body
export type WmlParagraphType = "paragraph"; // <w:p> paragraph element
export type WmlTextRunType = "textRun"; // <w:r> run element
export type WmlTextType = "text"; // <w:t> text element
export type WmlTextContentWrapperType = "textContentWrapper"; // For w:t wrapper

// Text content and formatting types
export type WmlBreakType = "break"; // <w:br> line/page/column break
export type WmlTabCharType = "tabChar"; // <w:tab> tab character
export type WmlSoftHyphenType = "softHyphen"; // <w:softHyphen>
export type WmlNoBreakHyphenType = "noBreakHyphen"; // <w:noBreakHyphen>
export type WmlSymbolType = "symbol"; // <w:sym> symbol character

// Table structure types (exactly as in OOXML spec)
export type WmlTableType = "table"; // <w:tbl> table element
export type WmlTablePropertiesType = "tableProperties"; // <w:tblPr> table properties
export type WmlTableGridType = "tableGrid"; // <w:tblGrid> table grid definition
export type WmlTableGridColType = "tableGridCol"; // <w:gridCol> grid column
export type WmlTableRowType = "tableRow"; // <w:tr> table row
export type WmlTableRowPropertiesType = "tableRowProperties"; // <w:trPr> row properties
export type WmlTableCellType = "tableCell"; // <w:tc> table cell
export type WmlTableCellPropertiesType = "tableCellProperties"; // <w:tcPr> cell properties

// List and numbering types (processed from w:numPr in paragraphs)
export type WmlListType = "list"; // Abstract type for grouped list items
export type WmlListItemType = "listItem"; // Abstract type for individual list items
export type WmlNumberingPropertiesType = "numberingProperties"; // <w:numPr> numbering properties

// Hyperlink and bookmark types
export type WmlHyperlinkType = "hyperlink"; // <w:hyperlink> hyperlink element
export type WmlBookmarkStartType = "bookmarkStart"; // <w:bookmarkStart>
export type WmlBookmarkEndType = "bookmarkEnd"; // <w:bookmarkEnd>

// Comment types
export type WmlCommentReferenceType = "commentReference"; // <w:commentReference>
export type WmlCommentRangeStartType = "commentRangeStart"; // <w:commentRangeStart>
export type WmlCommentRangeEndType = "commentRangeEnd"; // <w:commentRangeEnd>
export type WmlCommentType = "comment"; // For comment definitions in resources

// Section and document structure types
export type WmlSectionPropertiesType = "sectionProperties"; // <w:sectPr> section properties
export type WmlHeaderType = "header"; // <w:hdr> header content
export type WmlFooterType = "footer"; // <w:ftr> footer content

// Field types (complex fields)
export type WmlFieldCharType = "fieldChar"; // <w:fldChar> field character
export type WmlSimpleFieldType = "simpleField"; // <w:fldSimple> simple field
export type WmlInstructionTextType = "instructionText"; // <w:instrText> field instruction

// Reference types (footnotes/endnotes)
export type WmlFootnoteReferenceType = "footnoteReference"; // <w:footnoteReference>
export type WmlEndnoteReferenceType = "endnoteReference"; // <w:endnoteReference>

// Drawing and graphics types
export type WmlDrawingType = "drawing"; // <w:drawing> Drawing wrapper for DML
export type WmlPictureType = "picture"; // <w:pict> VML picture wrapper

// Smart tag types
export type WmlSmartTagType = "smartTag"; // <w:smartTag> smart tag element

// Properties types
export type WmlParagraphPropertiesType = "paragraphProperties"; // <w:pPr> paragraph properties
export type WmlRunPropertiesType = "runProperties"; // <w:rPr> run properties

// Union of all WML semantic types
export type WmlOoxmlType =
  // Core document structure
  | WmlDocumentType
  | WmlBodyType
  | WmlParagraphType
  | WmlTextRunType
  | WmlTextType
  | WmlTextContentWrapperType
  // Text content and formatting
  | WmlBreakType
  | WmlTabCharType
  | WmlSoftHyphenType
  | WmlNoBreakHyphenType
  | WmlSymbolType
  // Table structure
  | WmlTableType
  | WmlTablePropertiesType
  | WmlTableGridType
  | WmlTableGridColType
  | WmlTableRowType
  | WmlTableRowPropertiesType
  | WmlTableCellType
  | WmlTableCellPropertiesType
  // Lists and numbering
  | WmlListType
  | WmlListItemType
  | WmlNumberingPropertiesType
  // Hyperlinks and bookmarks
  | WmlHyperlinkType
  | WmlBookmarkStartType
  | WmlBookmarkEndType
  // Comments
  | WmlCommentReferenceType
  | WmlCommentRangeStartType
  | WmlCommentRangeEndType
  | WmlCommentType
  // Section and document structure
  | WmlSectionPropertiesType
  | WmlHeaderType
  | WmlFooterType
  // Fields
  | WmlFieldCharType
  | WmlSimpleFieldType
  | WmlInstructionTextType
  // References
  | WmlFootnoteReferenceType
  | WmlEndnoteReferenceType
  // Drawing and graphics
  | WmlDrawingType
  | WmlPictureType
  // Smart tags
  | WmlSmartTagType
  // Properties
  | WmlParagraphPropertiesType
  | WmlRunPropertiesType;

// --- Interfaces for complex properties within data.properties ---
// (Most properties are now defined in shared.ts and directly applied)

// Structure for WmlBreak properties (<w:br w:type="..." w:clear="..."/>)
export interface WmlBreakProperties {
  breakType?: "page" | "column" | "textWrapping";
  clear?: "none" | "left" | "right" | "all";
}

// Structure for WmlListItem properties (derived during processing)
export interface WmlListItemProperties {
  level: number;
  numId?: string; // From the associated paragraph's numbering properties
}

// Structure for WmlList properties (derived during processing)
export interface WmlListProperties {
  numId?: string;
  abstractNumId?: string;
}

// Structure for WmlHyperlink properties (<w:hyperlink r:id="..." w:anchor="..." w:tooltip="..."/>)
export interface WmlHyperlinkProperties {
  relationId?: string; // r:id (preferred)
  anchor?: string; // w:anchor (internal bookmark)
  tooltip?: string; // w:tooltip
  url?: string; // Resolved from relationId
}

// Structure for Bookmark properties
export interface WmlBookmarkStartProperties {
  id: string; // <w:bookmarkStart w:id="..." w:name="..."/>
  bookmarkName: string;
}
export interface WmlBookmarkEndProperties {
  id: string; // <w:bookmarkEnd w:id="..."/>
}

// Structure for Comment Reference properties (<w:commentReference w:id="..."/>)
export interface WmlCommentRefProperties {
  id: string;
}

// Structure for Symbol properties (<w:sym w:font="..." w:char="..."/>)
export interface WmlSymbolProperties {
  font?: string;
  charCode: string; // Hex character code
}

// Structure for Field Character properties (<w:fldChar w:fldCharType="..."/>)
export interface WmlFieldCharProperties {
  type: "begin" | "separate" | "end";
  dirty?: OnOffValue; // w:dirty
  locked?: OnOffValue; // w:fldLock
}

// Structure for Simple Field properties (<w:fldSimple w:instr="..."/>)
export interface WmlSimpleFieldProperties {
  instruction: string; // w:instr
  dirty?: OnOffValue; // w:dirty
  locked?: OnOffValue; // w:fldLock
}

// Structure for Smart Tag properties (<w:smartTag w:namespaceuri="..." w:name="..."/>)
export interface WmlSmartTagProperties {
  namespaceUri: string; // w:namespaceuri
  name: string; // w:name
}

// --- Table Properties ---

/** Properties for <w:tbl> */
export interface WmlTableProperties {
  styleId?: string; // <w:tblStyle w:val="..."/>
  width?: MeasurementOrPercent | MeasurementOrAuto; // <w:tblW w:w="..." w:type="dxa|pct|auto"/>
  alignment?: "left" | "center" | "right"; // <w:jc w:val="..."/>
  indentation?: Measurement; // <w:tblInd w:w="..." w:type="dxa"/>
  borders?: TableBorderProperties; // <w:tblBorders>...
  shading?: ShadingProperties; // <w:shd .../> (Table background)
  layout?: "fixed" | "autofit"; // <w:tblLayout w:type="..."/>
  cellMargins?: {
    // <w:tblCellMar>
    top?: Measurement; // <w:top w:w="..." w:type="dxa"/>
    bottom?: Measurement; // <w:bottom w:w="..." w:type="dxa"/>
    left?: Measurement; // <w:left w:w="..." w:type="dxa"/>
    right?: Measurement; // <w:right w:w="..." w:type="dxa"/>
    // Add start/end if needed
  };
  cellSpacing?: Measurement; // <w:tblCellSpacing w:w="..." w:type="dxa"/>
  look?: string; // <w:tblLook w:val="04A0" .../> (Conditional formatting flags)
  // Add tblPrEx for floating tables, bidiVisual etc.
}

/** Properties for <w:tr> */
export interface WmlTableRowProperties {
  height?: Measurement; // <w:trHeight w:val="..."/>
  heightRule?: "auto" | "atLeast" | "exact"; // <w:trHeight w:hRule="..."/>
  cantSplit?: OnOffValue; // <w:cantSplit/> (Don't break across pages)
  isHeader?: OnOffValue; // <w:tblHeader/> (Repeat as header row)
  cellAlignment?: "top" | "center" | "bottom"; // <w:trPr><w:vAlign w:val="..."/></w:trPr> (Default vertical alignment for cells)
  // Add gridBefore/gridAfter, widthBefore/widthAfter etc.
}

/** Properties for <w:tc> */
export interface WmlTableCellProperties {
  width?: MeasurementOrPercent | MeasurementOrAuto; // <w:tcW w:w="..." w:type="dxa|pct|auto"/>
  borders?: TableBorderProperties; // <w:tcBorders>...
  shading?: ShadingProperties; // <w:shd .../>
  margins?: {
    // <w:tcMar>
    top?: Measurement; // <w:top w:w="..." w:type="dxa"/>
    bottom?: Measurement; // <w:bottom w:w="..." w:type="dxa"/>
    left?: Measurement; // <w:left w:w="..." w:type="dxa"/>
    right?: Measurement; // <w:right w:w="..." w:type="dxa"/>
    // Add start/end if needed for LTR/RTL
  };
  verticalAlign?: "top" | "center" | "bottom"; // <w:vAlign w:val="..."/>
  textDirection?: "lrTb" | "tbRl" | "btLr"; // <w:textDirection w:val="..."/>
  gridSpan?: number; // <w:gridSpan w:val="..."/> (Horizontal merge)
  vMerge?: "continue" | "restart"; // <w:vMerge w:val="..."/> (Vertical merge)
  noWrap?: OnOffValue; // <w:noWrap/>
  // Add fitText, hideMark etc.
}

/** Properties for <w:tblGrid> */
export type WmlTableGridProperties = Record<string, never>;

/** Properties for <w:gridCol> */
export interface WmlTableGridColProperties {
  width?: Measurement; // <w:gridCol w:w="..."/> (Twips)
}

// --- Footnote/Endnote Reference Properties ---

export interface WmlFootnoteReferenceProperties {
  id: string; // <w:footnoteReference w:id="..."/>
  customMark?: string; // <w:footnoteRef w:customMarkFollows="1"/> -> text run follows
  separator?: boolean; // <w:separator/> inside footnoteRef
  continuationSeparator?: boolean; // <w:continuationSeparator/> inside footnoteRef
}

export interface WmlEndnoteReferenceProperties {
  id: string; // <w:endnoteReference w:id="..."/>
  customMark?: string; // <w:endnoteRef w:customMarkFollows="1"/> -> text run follows
  separator?: boolean; // <w:separator/> inside endnoteRef
  continuationSeparator?: boolean; // <w:continuationSeparator/> inside endnoteRef
}

// --- Drawing/Picture Properties ---

/** Properties for <w:drawing> */
export interface WmlDrawingProperties {
  // Reference to the actual drawing object (e.g., inline DML, anchored DML)
  // The parser needs to handle the children of <w:drawing> (e.g., wp:inline, wp:anchor)
  // and potentially store the parsed DML AST or its relationId here.
  drawingContentRef?: {
    type: "dml" | "vml";
    relationId?: string;
    embeddedAst?: DrawingMLAst | VMLAst; // Define DML/VML AST types
  };
  positioning?: PositionalProperties; // Extracted from wp:anchor properties
}

/** Properties for <w:pict> (VML) */
export interface WmlPictureProperties {
  // Similar to drawing, needs reference to the VML content
  vmlContentRef?: {
    relationId?: string;
    embeddedVml?: VMLAst; // Define VML AST type
  };
  positioning?: PositionalProperties; // Extracted from shape properties within VML?
}

// Define placeholder AST types for DrawingML and VML
export interface DrawingMLAst {
  type: "drawingml";
  elements: unknown[]; // Placeholder for DML elements
}

export interface VMLAst {
  type: "vml";
  elements: unknown[]; // Placeholder for VML elements
}

// --- Image Reference Properties (Custom AST Node) ---
// Used to carry image info from mdast-to-ooxml to ooxml-to-docx
export interface WmlImageRefProperties {
  url: string;
  alt?: string | null;
  title?: string | null;
}
