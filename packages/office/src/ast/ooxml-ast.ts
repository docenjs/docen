import type { Node } from "unist";
import type { ElementData, RootData, TextData } from "xast";
import type {
  BorderProperties,
  FillProperties,
  FontProperties,
  OoxmlData,
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

// --- Custom OOXML Node Types (Extending OoxmlNode or XastElement) ---

// Represents <w:bookmarkStart .../> - Now extends XastElement
export interface OoxmlBookmarkStart extends XastElement {
  // type: 'element', name: 'w:bookmarkStart' inherited
  data?: ElementData &
    OoxmlData & {
      ooxmlType: "bookmarkStart";
      properties: {
        id: string;
        name: string;
      };
    };
}

// Represents <w:bookmarkEnd .../> - Now extends XastElement
export interface OoxmlBookmarkEnd extends XastElement {
  // type: 'element', name: 'w:bookmarkEnd' inherited
  data?: ElementData &
    OoxmlData & {
      ooxmlType: "bookmarkEnd";
      properties: {
        id: string;
      };
    };
}

// Represents <w:commentReference .../> - Now extends XastElement
export interface OoxmlCommentReference extends XastElement {
  // type: 'element', name: 'w:commentReference' inherited
  data?: ElementData &
    OoxmlData & {
      ooxmlType: "commentReference";
      properties: {
        id: string;
      };
    };
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
  data?: OoxmlData & { ooxmlType: "comment" };
}

// Represents an image
export interface OoxmlImage extends OoxmlNode {
  type: "image";
  relationId: string;
  data?: OoxmlData & {
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
  data?: OoxmlData & {
    ooxmlType: "drawing";
    properties?: PositionalProperties;
  };
}

// Represents a list item (Abstraction over a <w:p> element)
// Extends OoxmlNode and defines its own children property
export interface OoxmlListItem extends OoxmlNode {
  type: "listItem";
  children: OoxmlBlockContent[]; // Define children explicitly (e.g., the paragraph(s) it contains)
  data?: OoxmlData & {
    ooxmlType: "listItem";
    properties: { level: number; numId?: string };
  };
}

// Represents a sequence of list items (Abstraction)
// Extends OoxmlNode and defines its own children property
export interface OoxmlList extends OoxmlNode {
  type: "list";
  children: OoxmlListItem[]; // Define children explicitly
  data?: OoxmlData & {
    ooxmlType: "list";
    properties: { numId?: string; abstractNumId?: string };
  };
}

// Represents a break (<w:br/>, etc.)
export interface OoxmlBreak extends XastElement {
  // type: 'element', name: 'w:br' inherited
  data?: ElementData &
    OoxmlData & {
      ooxmlType: "break";
      properties: {
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
// Revert to extending OoxmlNode to allow OoxmlList as a child
export interface OoxmlRoot extends OoxmlNode {
  type: "root"; // Explicitly define type
  children: OoxmlBlockContent[];
  data?: OoxmlData & {
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
  data?: ElementData &
    OoxmlData & {
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
  data?: TextData &
    OoxmlData & {
      ooxmlType: "textRun";
      // Now directly uses FontProperties which includes styleId?
      properties?: FontProperties;
      collaborationMetadata?: OoxmlNode["collaborationMetadata"];
    };
}

// Represents a table (<w:tbl>)
export interface OoxmlTable extends XastElement {
  // Extends XastElement
  // type: 'element', name: 'w:tbl', attributes, children: XastNode[] inherited
  // Children should ideally be OoxmlTableRow elements after processing
  data?: ElementData &
    OoxmlData & {
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
  data?: ElementData &
    OoxmlData & {
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
  data?: ElementData &
    OoxmlData & {
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
  data?: ElementData &
    OoxmlData & {
      ooxmlType: "hyperlink";
      url: string; // Custom property moved to data
      relationId?: string;
      tooltip?: string;
      // Now directly uses FontProperties which includes styleId?
      properties?: FontProperties; // Style of the link text
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
  | OoxmlBookmarkStart // Now XastElement with specific data
  | OoxmlBookmarkEnd // Now XastElement with specific data
  | OoxmlCommentReference // Now XastElement with specific data
  | XastElement // Generic element catch-all
  | XastText; // Generic text catch-all

// Block content might include Elements (paragraph, table) and custom nodes (list)
export type OoxmlBlockContent =
  | OoxmlParagraph
  | OoxmlTable
  | OoxmlList
  | OoxmlBookmarkStart // Bookmarks can appear at block level
  | OoxmlBookmarkEnd // Bookmarks can appear at block level
  | XastElement; // Generic element catch-all (e.g., for intermediate processing)

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
