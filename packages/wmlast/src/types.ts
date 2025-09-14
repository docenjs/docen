// Import all types from ooxast
import type {
  Data,
  Element,
  Root as OoxastRoot,
  ElementData,
  Node,
} from "@docen/ooxast";

// Root data with WML-specific information
export interface RootData extends Data {
  fileType?:
    | "document" // word/document.xml
    | "styles" // word/styles.xml
    | "numbering" // word/numbering.xml
    | "footnotes" // word/footnotes.xml
    | "endnotes" // word/endnotes.xml
    | "comments" // word/comments.xml
    | "header" // word/header*.xml
    | "footer" // word/footer*.xml
    | "theme" // word/theme/theme*.xml
    | "coreProperties" // docProps/core.xml
    | "appProperties" // docProps/app.xml
    | "customProperties" // docProps/custom.xml
    | "fontTable" // word/fontTable.xml
    | "settings" // word/settings.xml
    | "webSettings" // word/webSettings.xml
    | "contentTypes" // [Content_Types].xml
    | "glossary"; // word/glossary/document.xml
  filePath?: string;
}

// Relationship type for OPC package
export interface Relationship extends Node {
  id: string;
  type: string;
  target: string;
  targetMode?: "Internal" | "External";
}

// Main DOCX package container
export interface Package extends Node {
  type: "package";
  children: Root[];
  data: PackageData;
}

// Package data with DOCX package-level information
export interface PackageData extends Data {
  // Package relationships
  relationships: Map<string, Relationship[]>;

  // XML parts from the package
  parts: Map<string, Root>;

  // Media and other non-XML parts
  media: Map<string, Uint8Array>;
}

// WML Root extends Ooxast Root with required data
export interface Root extends OoxastRoot {
  data: RootData;
}

// WML-specific elements
export interface Document extends Element {
  name: "w:document";
  children: (Background | Body)[];
}

export interface Background extends Element {
  name: "w:background";
  data: ElementData & {
    color?: string;
    themeColor?: string;
    themeShade?: string;
    themeTint?: string;
  };
}

export interface Body extends Element {
  name: "w:body";
  children: (Paragraph | Table | SectionProperties)[];
}

export interface Paragraph extends Element {
  name: "w:p";
  children: (ParagraphProperties | Run | Bookmark | Hyperlink | Field)[];
}

export interface Run extends Element {
  name: "w:r";
  children: (
    | RunProperties
    | TextElement
    | Break
    | CarriageReturn
    | Tab
    | NoBreakHyphen
    | SoftHyphen
    | Symbol
    | Drawing
    | FieldChar
    | InstructionText
  )[];
}

// Text element (w:t)
export interface TextElement extends Element {
  name: "w:t";
  data: TextData;
  children: []; // Text content is in child text nodes
}

export interface TextData extends ElementData {
  space?: "preserve";
}

export interface Break extends Element {
  name: "w:br";
  data?: ElementData;
}

// WML-specific run content elements
export interface CarriageReturn extends Element {
  name: "w:cr";
}

export interface Tab extends Element {
  name: "w:tab";
}

export interface NoBreakHyphen extends Element {
  name: "w:noBreakHyphen";
}

export interface SoftHyphen extends Element {
  name: "w:softHyphen";
}

export interface Symbol extends Element {
  name: "w:sym";
  data: ElementData & {
    font?: string;
    char?: string;
  };
}

export interface Drawing extends Element {
  name: "w:drawing";
  children: Element[];
}

// Paragraph content elements
export interface Bookmark extends Element {
  name: "w:bookmarkStart" | "w:bookmarkEnd";
  data: ElementData & {
    name?: string;
    id?: string;
  };
}

export interface Hyperlink extends Element {
  name: "w:hyperlink";
  data: ElementData & {
    id?: string;
    anchor?: string;
    docLocation?: string;
  };
}

export interface Field extends Element {
  name: "w:fldSimple" | "w:instrText";
  data: ElementData & {
    instr?: string;
    fldLock?: string;
    dirty?: string;
  };
}

// WML complex field system
export interface FieldChar extends Element {
  name: "w:fldChar";
  data: ElementData & {
    fldCharType?: "begin" | "separate" | "end";
    dirty?: string;
    fldLock?: string;
  };
}

export interface InstructionText extends Element {
  name: "w:instrText";
  data: ElementData & {
    space?: "preserve";
  };
  children: []; // Field instruction text content
}

export interface Table extends Element {
  name: "w:tbl";
  children: (TableProperties | TableGrid | TableRow)[];
}

// WML-specific table grid system
export interface TableGrid extends Element {
  name: "w:tblGrid";
  children: GridColumn[];
}

export interface GridColumn extends Element {
  name: "w:gridCol";
  data: ElementData & {
    width?: string;
  };
}

export interface TableRow extends Element {
  name: "w:tr";
  children: (TableRowProperties | TableCell)[];
}

export interface TableCell extends Element {
  name: "w:tc";
  children: (TableCellProperties | Paragraph | Table)[];
}

// Property elements
export interface ParagraphProperties extends Element {
  name: "w:pPr";
  children: (
    | ParagraphStyle
    | NumberingProperties
    | Indentation
    | ParagraphSpacing
    | Justification
    | KeepNext
    | KeepLines
    | ParagraphBorders
    | ParagraphShading
    | Tabs
    | Element
  )[];
}

// WML paragraph formatting properties
export interface ParagraphStyle extends Element {
  name: "w:pStyle";
  data: ElementData & { val?: string };
}

export interface Justification extends Element {
  name: "w:jc";
  data: ElementData & {
    val?: "left" | "center" | "right" | "both" | "distribute";
  };
}

export interface KeepNext extends Element {
  name: "w:keepNext";
  data: ElementData & { val?: string };
}

export interface KeepLines extends Element {
  name: "w:keepLines";
  data: ElementData & { val?: string };
}

// Paragraph spacing
export interface ParagraphSpacing extends Element {
  name: "w:spacing";
  data: ElementData & {
    before?: string;
    after?: string;
    line?: string;
    lineRule?: "auto" | "atLeast" | "exact";
  };
}

// Border system
export interface ParagraphBorders extends Element {
  name: "w:pBdr";
  children: (
    | TopBorder
    | BottomBorder
    | LeftBorder
    | RightBorder
    | BetweenBorder
  )[];
}

export interface BorderProperties extends ElementData {
  val?: string;
  color?: string;
  size?: string;
  space?: string;
  shadow?: string;
  frame?: string;
}

export interface TopBorder extends Element {
  name: "w:top";
  data: BorderProperties;
}

export interface BottomBorder extends Element {
  name: "w:bottom";
  data: BorderProperties;
}

export interface LeftBorder extends Element {
  name: "w:left";
  data: BorderProperties;
}

export interface RightBorder extends Element {
  name: "w:right";
  data: BorderProperties;
}

export interface BetweenBorder extends Element {
  name: "w:between";
  data: BorderProperties;
}

export interface ParagraphShading extends Element {
  name: "w:shd";
  data: ElementData & {
    val?: string;
    color?: string;
    fill?: string;
    themeColor?: string;
    themeFill?: string;
    themeFillShade?: string;
    themeFillTint?: string;
  };
}

// Tabs
export interface Tabs extends Element {
  name: "w:tabs";
  children: Tab[];
}

export interface Tab extends Element {
  name: "w:tab";
  data: ElementData & {
    val?: "left" | "center" | "right" | "decimal" | "bar";
    pos?: string;
    leader?: "none" | "dot" | "hyphen" | "underscore" | "heavy" | "middleDot";
  };
}

// WML paragraph formatting elements
export interface NumberingProperties extends Element {
  name: "w:numPr";
  children: (NumberingId | Level)[];
}

export interface NumberingId extends Element {
  name: "w:numId";
  data: ElementData & {
    val?: string;
  };
}

export interface Indentation extends Element {
  name: "w:ind";
  data: ElementData & {
    left?: string;
    right?: string;
    hanging?: string;
    firstLine?: string;
  };
}

export interface RunProperties extends Element {
  name: "w:rPr";
  children: (
    | Bold
    | Italic
    | Underline
    | Strike
    | DoubleStrike
    | Color
    | Size
    | SizeComplexScript
    | SmallCaps
    | Caps
    | Shadow
    | Emboss
    | Imprint
    | Highlight
    | Shading
    | CharacterSpacing
    | Kerning
    | RunFonts
    | Element
  )[];
}

// WML-specific text formatting properties
export interface Bold extends Element {
  name: "w:b";
  data: ElementData & { val?: string };
}

export interface Italic extends Element {
  name: "w:i";
  data: ElementData & { val?: string };
}

export interface Underline extends Element {
  name: "w:u";
  data: ElementData & {
    val?: string;
    color?: string;
    themeColor?: string;
    themeShade?: string;
    themeTint?: string;
  };
}

export interface Strike extends Element {
  name: "w:strike";
  data: ElementData & { val?: string };
}

export interface DoubleStrike extends Element {
  name: "w:dstrike";
  data: ElementData & { val?: string };
}

export interface Color extends Element {
  name: "w:color";
  data: ElementData & {
    val?: string;
    themeColor?: string;
    themeShade?: string;
    themeTint?: string;
  };
}

export interface Size extends Element {
  name: "w:sz";
  data: ElementData & { val?: string };
}

export interface SizeComplexScript extends Element {
  name: "w:szCs";
  data: ElementData & { val?: string };
}

export interface SmallCaps extends Element {
  name: "w:smallCaps";
  data: ElementData & { val?: string };
}

export interface Caps extends Element {
  name: "w:caps";
  data: ElementData & { val?: string };
}

export interface Shadow extends Element {
  name: "w:shadow";
  data: ElementData & { val?: string };
}

export interface Emboss extends Element {
  name: "w:emboss";
  data: ElementData & { val?: string };
}

export interface Imprint extends Element {
  name: "w:imprint";
  data: ElementData & { val?: string };
}

export interface Highlight extends Element {
  name: "w:highlight";
  data: ElementData & {
    val?: string;
    themeColor?: string;
  };
}

export interface Shading extends Element {
  name: "w:shd";
  data: ElementData & {
    val?: string;
    color?: string;
    fill?: string;
    themeColor?: string;
    themeFill?: string;
    themeFillShade?: string;
    themeFillTint?: string;
  };
}

export interface CharacterSpacing extends Element {
  name: "w:spacing";
  data: ElementData & { val?: string };
}

export interface Kerning extends Element {
  name: "w:kern";
  data: ElementData & { val?: string };
}

export interface RunFonts extends Element {
  name: "w:rFonts";
  data: ElementData & {
    ascii?: string;
    hAnsi?: string;
    eastAsia?: string;
    cs?: string;
    hint?: "default" | "eastAsia" | "cs" | "ascii";
  };
}

export interface TableProperties extends Element {
  name: "w:tblPr";
  children: (
    | TableStyle
    | TableWidth
    | TableAlignment
    | TableBorders
    | TableShading
    | TableCellSpacing
    | TableCellMargins
    | TableLayout
    | TableLook
    | TableIndentation
    | TableCaption
    | TableOverlap
    | TableFloatingProperties
    | TableStyleBandSizes
    | Element
  )[];
}

export interface TableRowProperties extends Element {
  name: "w:trPr";
  children: (TableRowHeight | TableCellSpacing | Element)[];
}

export interface TableCellProperties extends Element {
  name: "w:tcPr";
  children: (
    | TableCellWidth
    | TableCellBorders
    | TableCellShading
    | TableCellMargins
    | VerticalAlignment
    | GridSpan
    | VerticalMerge
    | CellFitText
    | CellNoWrap
    | HideMark
    | Element
  )[];
}

// WML table formatting properties
export interface TableStyle extends Element {
  name: "w:tblStyle";
  data: ElementData & { val?: string };
}

export interface TableWidth extends Element {
  name: "w:tblW";
  data: ElementData & {
    w?: string;
    type?: "auto" | "dxa" | "nil" | "pct";
  };
}

export interface TableAlignment extends Element {
  name: "w:jc";
  data: ElementData & { val?: "left" | "center" | "right" };
}

export interface TableBorders extends Element {
  name: "w:tblBorders";
  children: (
    | TopBorder
    | BottomBorder
    | LeftBorder
    | RightBorder
    | InsideHorizontalBorder
    | InsideVerticalBorder
  )[];
}

export interface InsideHorizontalBorder extends Element {
  name: "w:insideH";
  data: BorderProperties;
}

export interface InsideVerticalBorder extends Element {
  name: "w:insideV";
  data: BorderProperties;
}

export interface TableShading extends Element {
  name: "w:shd";
  data: ElementData & {
    val?: string;
    color?: string;
    fill?: string;
    themeColor?: string;
    themeFill?: string;
    themeFillShade?: string;
    themeFillTint?: string;
  };
}

export interface TableCellSpacing extends Element {
  name: "w:tblCellSpacing";
  data: ElementData & {
    w?: string;
    type?: "dxa" | "nil";
  };
}

export interface TableCellMargins extends Element {
  name: "w:tblCellMar";
  children: (TopMargin | BottomMargin | LeftMargin | RightMargin)[];
}

export interface TableLayout extends Element {
  name: "w:tblLayout";
  data: ElementData & { type?: "autofit" | "fixed" };
}

export interface TableLook extends Element {
  name: "w:tblLook";
  data: ElementData & {
    firstRow?: string;
    lastRow?: string;
    firstColumn?: string;
    lastColumn?: string;
    noHBand?: string;
    noVBand?: string;
    val?: string;
  };
}

export interface TableIndentation extends Element {
  name: "w:tblInd";
  data: ElementData & {
    w?: string;
    type?: "dxa" | "nil";
  };
}

export interface TableCaption extends Element {
  name: "w:tblCaption";
  data: ElementData & { val?: string };
}

export interface TableOverlap extends Element {
  name: "w:tblOverlap";
  data: ElementData & { val?: "never" | "overlap" };
}

export interface TableFloatingProperties extends Element {
  name: "w:tblpPr";
  data: ElementData & {
    leftFromText?: string;
    rightFromText?: string;
    topFromText?: string;
    bottomFromText?: string;
    vertAnchor?: "margin" | "page" | "text";
    horzAnchor?: "margin" | "page" | "text";
    tblpX?: string;
    tblpY?: string;
    tblpXSpec?: "center" | "inside" | "left" | "outside" | "right";
    tblpYSpec?: "bottom" | "center" | "inline" | "inside" | "outside" | "top";
  };
}

export interface TableStyleBandSizes extends Element {
  name: "w:tblStyleRowBandSize";
  data: ElementData & { val?: string };
  children: Element[];
}

export interface TableStyleColBandSize extends Element {
  name: "w:tblStyleColBandSize";
  data: ElementData & { val?: string };
  children: Element[];
}

export interface TableRowHeight extends Element {
  name: "w:trHeight";
  data: ElementData & {
    val?: string;
    hRule?: "auto" | "atLeast" | "exact";
  };
}

export interface TableCellWidth extends Element {
  name: "w:tcW";
  data: ElementData & {
    w?: string;
    type?: "auto" | "dxa" | "nil" | "pct";
  };
}

export interface TableCellBorders extends Element {
  name: "w:tcBorders";
  children: (
    | TopBorder
    | BottomBorder
    | LeftBorder
    | RightBorder
    | InsideHorizontalBorder
    | InsideVerticalBorder
    | TableCellBorderTopLeftToBottomRight
  )[];
}

export interface TableCellBorderTopLeftToBottomRight extends Element {
  name: "w:tl2br";
  data: BorderProperties;
}

export interface TableCellShading extends Element {
  name: "w:shd";
  data: ElementData & {
    val?: string;
    color?: string;
    fill?: string;
    themeColor?: string;
    themeFill?: string;
    themeFillShade?: string;
    themeFillTint?: string;
  };
}

export interface VerticalAlignment extends Element {
  name: "w:vAlign";
  data: ElementData & { val?: "top" | "center" | "bottom" };
}

export interface GridSpan extends Element {
  name: "w:gridSpan";
  data: ElementData & { val?: string };
}

export interface VerticalMerge extends Element {
  name: "w:vMerge";
  data: ElementData & { val?: "continue" | "restart" };
}

export interface CellFitText extends Element {
  name: "w:tcFitText";
  data: ElementData & { val?: string };
}

export interface CellNoWrap extends Element {
  name: "w:noWrap";
  data: ElementData & { val?: string };
}

export interface HideMark extends Element {
  name: "w:hideMark";
  data: ElementData & { val?: string };
}

export interface TopMargin extends Element {
  name: "w:top";
  data: ElementData & {
    w?: string;
    type?: "dxa" | "nil";
  };
}

export interface BottomMargin extends Element {
  name: "w:bottom";
  data: ElementData & {
    w?: string;
    type?: "dxa" | "nil";
  };
}

export interface LeftMargin extends Element {
  name: "w:left";
  data: ElementData & {
    w?: string;
    type?: "dxa" | "nil";
  };
}

export interface RightMargin extends Element {
  name: "w:right";
  data: ElementData & {
    w?: string;
    type?: "dxa" | "nil";
  };
}

// Re-export all types from ooxast for convenience

export interface SectionProperties extends Element {
  name: "w:sectPr";
  children: (
    | HeaderReference
    | FooterReference
    | PageSize
    | PageMargins
    | PageBorders
    | LineNumbering
    | PageNumbering
    | Columns
    | SectionType
    | SectionVerticalAlignment
    | TitlePage
    | PaperSource
    | Element
  )[];
}

// WML page layout elements
export interface PageSize extends Element {
  name: "w:pgSz";
  data: ElementData & {
    width?: string;
    height?: string;
    orient?: "portrait" | "landscape";
  };
}

export interface PageMargins extends Element {
  name: "w:pgMar";
  data: ElementData & {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    header?: string;
    footer?: string;
    gutter?: string;
  };
}

// WML section formatting properties
export interface HeaderReference extends Element {
  name: "w:headerReference";
  data: ElementData & {
    type?: "default" | "even" | "first";
    id?: string;
  };
}

export interface FooterReference extends Element {
  name: "w:footerReference";
  data: ElementData & {
    type?: "default" | "even" | "first";
    id?: string;
  };
}

export interface PageBorders extends Element {
  name: "w:pgBorders";
  data: ElementData & {
    offsetFrom?: "text" | "page";
    zOrder?: "front" | "back";
  };
  children: (TopBorder | BottomBorder | LeftBorder | RightBorder)[];
}

export interface LineNumbering extends Element {
  name: "w:lnNumType";
  data: ElementData & {
    countBy?: string;
    start?: string;
    restart?: "continuous" | "newSection" | "newPage";
  };
}

export interface PageNumbering extends Element {
  name: "w:pgNumType";
  data: ElementData & {
    fmt?: string;
    start?: string;
  };
}

export interface Columns extends Element {
  name: "w:cols";
  data: ElementData & {
    space?: string;
    num?: string;
    separator?: string;
    equalWidth?: string;
  };
  children: Element[];
}

export interface SectionType extends Element {
  name: "w:type";
  data: ElementData & {
    val?: "continuous" | "evenPage" | "nextColumn" | "nextPage" | "oddPage";
  };
}

export interface SectionVerticalAlignment extends Element {
  name: "w:vAlign";
  data: ElementData & { val?: "both" | "bottom" | "center" | "top" };
}

export interface TitlePage extends Element {
  name: "w:titlePg";
  data: ElementData & { val?: string };
}

export interface PaperSource extends Element {
  name: "w:paperSrc";
  data: ElementData & { val?: string };
}

// Styles
export interface Styles extends Element {
  name: "w:styles";
  children: (Style | DocDefaults | LatentStyles)[];
}

export interface DocDefaults extends Element {
  name: "w:docDefaults";
  children: Element[];
}

export interface LatentStyles extends Element {
  name: "w:latentStyles";
  data: ElementData & {
    count?: string;
    locked?: string;
  };
  children: Element[];
}

export interface Style extends Element {
  name: "w:style";
  data: StyleData;
}

export interface StyleData extends ElementData {
  type?: "paragraph" | "character" | "table" | "numbering";
  styleId?: string;
  name?: string;
}

// Numbering
export interface Numbering extends Element {
  name: "w:numbering";
  children: (AbstractNum | NumberingInstance | NumberingPictureBullet)[];
}

export interface AbstractNum extends Element {
  name: "w:abstractNum";
  data: AbstractNumData;
  children: Level[];
}

export interface AbstractNumData extends ElementData {
  abstractNumId?: string;
}

export interface NumberingInstance extends Element {
  name: "w:num";
  data: NumberingInstanceData;
}

export interface NumberingInstanceData extends ElementData {
  numId?: string;
  abstractNumId?: string;
}

export interface NumberingOverride extends Element {
  name: "w:num";
  data: NumberingInstanceData;
  children: LevelOverride[];
}

export interface LevelOverride extends Element {
  name: "w:lvlOverride";
  data: ElementData & {
    ilvl?: string;
  };
  children: (StartOverride | LevelOverrideException)[];
}

export interface StartOverride extends Element {
  name: "w:startOverride";
  data: ElementData & { val?: string };
}

export interface LevelOverrideException extends Element {
  name: "w:lvl";
  data: ElementData & {
    ilvl?: string;
  };
  children: Element[];
}

export interface NumberingPictureBullet extends Element {
  name: "w:numPicBullet";
  data: ElementData & {
    numPicBulletId?: string;
  };
  children: (LevelPictureBulletId | Element)[];
}

export interface LevelPictureBulletId extends Element {
  name: "w:lvlPicBulletId";
  data: ElementData & {
    val?: string;
  };
}

// WML numbering level elements
export interface Level extends Element {
  name: "w:lvl";
  data: ElementData & {
    ilvl?: string;
    start?: string;
    numFmt?: string;
    lvlText?: string;
    lvlJc?: string;
  };
  children: Element[];
}

export interface FootnoteData extends ElementData {
  id?: string;
}

export interface EndnoteData extends ElementData {
  id?: string;
}

// Headers and Footers (root elements)
export interface Header extends Element {
  name: "w:hdr";
  children: (Paragraph | Table | SectionProperties)[];
}

export interface Footer extends Element {
  name: "w:ftr";
  children: (Paragraph | Table | SectionProperties)[];
}

export interface CommentData extends ElementData {
  id?: string;
  author?: string;
  date?: string;
}

// Re-export all types from ooxast for convenience
export type {
  Data,
  Node,
  Parent,
  Literal,
  Element,
  RootContent,
  RootContentMap,
  ElementData,
} from "@docen/ooxast";
