// ast/wml.ts
// Defines OOXML types and property interfaces specific to WordprocessingML (WML)

import type {
  BorderStyleProperties,
  ColorDefinition,
  // Shared formatting properties
  FontProperties,
  HeaderFooterReference,
  IndentationProperties,
  Measurement,
  MeasurementOrAuto,
  MeasurementOrPercent,
  NumberingProperties,
  OnOffValue,
  // Basic types
  OoxmlData,
  OoxmlElement,
  OoxmlElementContent,
  OoxmlRoot,
  OoxmlText,
  ParagraphBorderProperties,
  ParagraphFormatting,
  PositionalProperties,
  SectionProperties,
  ShadingProperties,
  SharedEndnoteDefinition, // Import definition type
  // Shared structural definitions
  SharedFootnoteDefinition, // Import definition type
  SpacingProperties,
  TabStop,
  TableBorderProperties,
} from "./shared";

// --- WML Specific OOXML Types (String Literals) ---
// These define the possible values for data.ooxmlType

export type WmlRootType = "root";
export type WmlParagraphType = "paragraph";
export type WmlTextRunType = "textRun";
export type WmlTextType = "text"; // For enriched XastText nodes
export type WmlBreakType = "break";
export type WmlTableType = "table"; // <w:tbl>
export type WmlTableRowType = "tableRow"; // <w:tr>
export type WmlTableCellType = "tableCell"; // <w:tc>
export type WmlListType = "list"; // Abstract type for grouped lists
export type WmlListItemType = "listItem"; // Abstract type for list items
export type WmlHyperlinkType = "hyperlink";
export type WmlBookmarkStartType = "bookmarkStart";
export type WmlBookmarkEndType = "bookmarkEnd";
export type WmlCommentReferenceType = "commentReference"; // <w:commentReference>
export type WmlCommentType = "comment"; // For comment definitions in resources
export type WmlHeaderType = "header"; // <w:hdr> root element
export type WmlFooterType = "footer"; // <w:ftr> root element
export type WmlSectionPropertiesType = "sectionProperties"; // <w:sectPr>
export type WmlSymbolType = "symbol"; // <w:sym>
export type WmlFieldCharType = "fieldChar"; // <w:fldChar>
export type WmlSimpleFieldType = "simpleField"; // <w:fldSimple>
export type WmlInstructionTextType = "instructionText"; // <w:instrText>
export type WmlSoftHyphenType = "softHyphen"; // <w:softHyphen/>
export type WmlNoBreakHyphenType = "noBreakHyphen"; // <w:noBreakHyphen/>
export type WmlTabCharType = "tabChar"; // <w:tab/> within a run
export type WmlFootnoteReferenceType = "footnoteReference"; // <w:footnoteReference w:id="..."/>
export type WmlEndnoteReferenceType = "endnoteReference"; // <w:endnoteReference w:id="..."/>
export type WmlDrawingType = "drawing"; // <w:drawing> - Wrapper for DML/VML
export type WmlPictureType = "picture"; // <w:pict> - Legacy VML picture wrapper
export type WmlTableGridType = "tableGrid"; // <w:tblGrid>
export type WmlTableGridColType = "tableGridCol"; // <w:gridCol>

// Union of all WML semantic types
export type WmlOoxmlType =
  | WmlRootType
  | WmlParagraphType
  | WmlTextRunType
  | WmlTextType
  | WmlBreakType
  | WmlTableType
  | WmlTableRowType
  | WmlTableCellType
  | WmlListType
  | WmlListItemType
  | WmlHyperlinkType
  | WmlBookmarkStartType
  | WmlBookmarkEndType
  | WmlCommentReferenceType
  | WmlCommentType
  | WmlHeaderType
  | WmlFooterType
  | WmlSectionPropertiesType
  | WmlSymbolType
  | WmlFieldCharType
  | WmlSimpleFieldType
  | WmlInstructionTextType
  | WmlSoftHyphenType
  | WmlNoBreakHyphenType
  | WmlTabCharType
  | WmlFootnoteReferenceType
  | WmlEndnoteReferenceType
  | WmlDrawingType
  | WmlPictureType
  | WmlTableGridType
  | WmlTableGridColType;
// Add other types like commentRangeStart/End, etc.

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
    embeddedAst?: any /* Define DML/VML AST types later */;
  };
  positioning?: PositionalProperties; // Extracted from wp:anchor properties
}

/** Properties for <w:pict> (VML) */
export interface WmlPictureProperties {
  // Similar to drawing, needs reference to the VML content
  vmlContentRef?: {
    relationId?: string;
    embeddedVml?: any /* Define VML AST type later */;
  };
  positioning?: PositionalProperties; // Extracted from shape properties within VML?
}

// --- Image Reference Properties (Custom AST Node) ---
// Used to carry image info from mdast-to-ooxml to ooxml-to-docx
export interface WmlImageRefProperties {
  url: string;
  alt?: string | null;
  title?: string | null;
}
