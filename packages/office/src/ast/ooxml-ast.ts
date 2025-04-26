import type { Node } from "unist";
import type {
  BorderProperties,
  FillProperties,
  FontProperties,
  OoxmlNode,
  ParagraphFormatting,
  PositionalProperties,
  SharedResources,
  XastElement,
  XastNode,
  XastParent,
  XastRoot,
  XastText,
} from "./common-types";

// --- Custom OOXML Node Types (Extending OoxmlNode) ---

// Represents <w:bookmarkStart w:id="..." w:name="..."/>
export interface OoxmlBookmarkStart extends OoxmlNode {
  type: "bookmarkStart";
  id: string;
  name: string;
  data?: OoxmlNode["data"] & { ooxmlType: "bookmarkStart" };
}

// Represents <w:bookmarkEnd w:id="..."/>
export interface OoxmlBookmarkEnd extends OoxmlNode {
  type: "bookmarkEnd";
  id: string;
  data?: OoxmlNode["data"] & { ooxmlType: "bookmarkEnd" };
}

// Represents <w:commentReference w:id="..."/>
export interface OoxmlCommentReference extends OoxmlNode {
  type: "commentReference";
  id: string; // Corresponds to the comment ID in comments.xml
  data?: OoxmlNode["data"] & { ooxmlType: "commentReference" };
}

// Represents a comment defined in comments.xml
// Extends OoxmlNode and defines its own children property
export interface OoxmlComment extends OoxmlNode {
  type: "comment";
  id: string;
  author?: string;
  initials?: string;
  date?: string;
  children: OoxmlBlockContent[]; // Define children explicitly
  data?: OoxmlNode["data"] & { ooxmlType: "comment" };
}

// Represents an image
export interface OoxmlImage extends OoxmlNode {
  type: "image";
  relationId: string;
  data?: OoxmlNode["data"] & {
    ooxmlType: "image";
    properties?: PositionalProperties & {
      title?: string;
      description?: string;
    };
  };
}

// Represents a drawing
export interface OoxmlDrawing extends OoxmlNode {
  type: "drawing";
  relationId?: string;
  data?: OoxmlNode["data"] & {
    ooxmlType: "drawing";
    properties?: PositionalProperties;
  };
}

// Represents a list item (Abstraction over a <w:p> element)
// Extends OoxmlNode and defines its own children property
export interface OoxmlListItem extends OoxmlNode {
  type: "listItem";
  children: OoxmlBlockContent[]; // Define children explicitly (e.g., the paragraph(s) it contains)
  data?: OoxmlNode["data"] & {
    ooxmlType: "listItem";
    properties?: { level: number; numId?: string };
  };
}

// Represents a sequence of list items (Abstraction)
// Extends OoxmlNode and defines its own children property
export interface OoxmlList extends OoxmlNode {
  type: "list";
  children: OoxmlListItem[]; // Define children explicitly
  data?: OoxmlNode["data"] & {
    ooxmlType: "list";
    properties?: { numId?: string; abstractNumId?: string };
  };
}

// Represents a break (<w:br/>, etc.)
export interface OoxmlBreak extends OoxmlNode {
  type: "break";
  data?: OoxmlNode["data"] & {
    ooxmlType: "break";
    properties?: {
      breakType:
        | "line"
        | "page"
        | "column"
        | "sectionContinuous"
        | "sectionNextPage"
        | "sectionEvenPage"
        | "sectionOddPage";
    };
  };
}

// --- OOXML Nodes Extending Xast Types ---

// Represents the root of an OOXML document
// Change inheritance from XastRoot to OoxmlNode
export interface OoxmlRoot extends OoxmlNode {
  type: "root"; // Explicitly define type
  // Explicitly define children with specific OOXML block content type
  children: OoxmlBlockContent[];
  data?: OoxmlNode["data"] & {
    // Use OoxmlNode["data"]
    ooxmlType: "root";
    metadata?: {
      source?: string;
      totalPages?: number;
      info?: Record<string, any>;
      sharedResources?: SharedResources;
      settings?: Record<string, any>;
      sectionProperties?: Record<string, unknown>;
      headerAsts?: Record<string, XastRoot>; // Keep XastRoot for header/footer trees?
      footerAsts?: Record<string, XastRoot>;
      comments?: Record<string, OoxmlComment>;
      [key: string]: any;
    };
    collaborationMetadata?: OoxmlNode["collaborationMetadata"];
  };
}

// Represents a paragraph (<w:p>)
export interface OoxmlParagraph extends XastElement {
  // Extends XastElement
  // type: 'element' is inherited
  // name: string (e.g., 'w:p') is inherited
  // attributes?: Record<...> is inherited
  // children: XastNode[] is inherited - Contains text runs, breaks, bookmarks, etc.
  data?: XastElement["data"] & {
    ooxmlType: "paragraph";
    properties?: ParagraphFormatting;
    collaborationMetadata?: OoxmlNode["collaborationMetadata"];
  };
}

// Represents a text run (<w:r>/<w:t>)
export interface OoxmlTextRun extends XastText {
  // Extends XastText
  // type: 'text' is inherited
  // value: string is inherited
  data?: XastText["data"] & {
    ooxmlType: "textRun";
    properties?: FontProperties & { styleId?: string };
    collaborationMetadata?: OoxmlNode["collaborationMetadata"];
  };
}

// Represents a table (<w:tbl>)
export interface OoxmlTable extends XastElement {
  // Extends XastElement
  // type: 'element', name: 'w:tbl', attributes, children: XastNode[] inherited
  // Children should ideally be OoxmlTableRow elements after processing
  data?: XastElement["data"] & {
    ooxmlType: "table";
    properties?: {
      styleId?: string;
      borders?: BorderProperties;
      fill?: FillProperties;
      layout?: "fixed" | "autofit";
      width?: number | string;
    };
    collaborationMetadata?: OoxmlNode["collaborationMetadata"];
  };
}

// Represents a table row (<w:tr>)
export interface OoxmlTableRow extends XastElement {
  // Extends XastElement
  // type: 'element', name: 'w:tr', attributes, children: XastNode[] inherited
  // Children should ideally be OoxmlTableCell elements after processing
  data?: XastElement["data"] & {
    ooxmlType: "tableRow";
    properties?: {
      isHeader?: boolean;
      height?: number | string;
      heightRule?: "auto" | "exact" | "atLeast";
      cantSplit?: boolean;
    };
    collaborationMetadata?: OoxmlNode["collaborationMetadata"];
  };
}

// Represents a table cell (<w:tc>)
export interface OoxmlTableCell extends XastElement {
  // Extends XastElement
  // type: 'element', name: 'w:tc', attributes, children: XastNode[] inherited
  // Children should ideally be OoxmlParagraph, OoxmlTable, etc. after processing
  data?: XastElement["data"] & {
    ooxmlType: "tableCell";
    properties?: {
      borders?: BorderProperties;
      fill?: FillProperties;
      verticalAlignment?: "top" | "center" | "bottom" | "baseline" | "auto";
      gridSpan?: number;
      vMerge?: "restart" | "continue" | "merged";
      width?: number | string;
      noWrap?: boolean;
    };
    collaborationMetadata?: OoxmlNode["collaborationMetadata"];
  };
}

// Represents a hyperlink (<w:hyperlink>)
export interface OoxmlHyperlink extends XastElement {
  // Extends XastElement
  // type: 'element', name: 'w:hyperlink', attributes, children: XastNode[] inherited
  // Children should ideally be OoxmlTextRun elements after processing
  data?: XastElement["data"] & {
    ooxmlType: "hyperlink";
    url: string; // Custom property moved to data
    relationId?: string;
    tooltip?: string;
    properties?: FontProperties & { styleId?: string }; // Style of the link text
    collaborationMetadata?: OoxmlNode["collaborationMetadata"];
  };
}

// --- Content Unions (Adjusted) ---
// These unions now mix standard Xast nodes (where OOXML type is in data)
// with custom OOXML nodes.

// Inline content might include Text, Elements (like hyperlink), and custom nodes
export type OoxmlInlineContent =
  | OoxmlTextRun
  | OoxmlHyperlink
  | OoxmlImage
  | OoxmlDrawing
  | OoxmlBreak
  | OoxmlBookmarkStart
  | OoxmlBookmarkEnd
  | OoxmlCommentReference
  | XastElement
  | XastText;

// Block content might include Elements (paragraph, table) and custom nodes (list)
export type OoxmlBlockContent =
  | OoxmlParagraph
  | OoxmlTable
  | OoxmlList
  | OoxmlBookmarkStart
  | OoxmlBookmarkEnd
  | XastElement;

// General content union for processing flexibility
export type OoxmlContent =
  | OoxmlRoot
  | OoxmlParagraph
  | OoxmlTextRun
  | OoxmlTable
  | OoxmlTableRow
  | OoxmlTableCell
  | OoxmlHyperlink
  | OoxmlImage
  | OoxmlDrawing
  | OoxmlList
  | OoxmlListItem
  | OoxmlBreak
  | OoxmlBookmarkStart
  | OoxmlBookmarkEnd
  | OoxmlCommentReference
  | OoxmlComment
  | XastNode; // Include base XastNode to allow for intermediate processing steps
