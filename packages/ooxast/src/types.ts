import type {
  Data as XastData,
  Element as XastElement,
  Node as XastNode,
  Root as XastRoot,
  RootContentMap as XastRootContentMap,
  ElementContentMap as XastElementContentMap,
  ElementData as XastElementData,
  Parent as XastParent,
  Literal as XastLiteral,
} from "xast";
import {} from "./drawingml";

/**
 * Info associated with OOXML nodes by the ecosystem.
 *
 * This extends the base xast Data interface to add OOXML-specific data.
 */
export interface Data extends XastData {
  /**
   * OOXML-specific namespace information
   */
  namespace?: string | undefined;
  /**
   * DrawingML specific properties
   */
  drawingml?:
    | {
        /**
         * Whether this is a DrawingML element
         */
        isDrawingML?: boolean;
        /**
         * DrawingML element type
         */
        elementType?: "picture" | "shape" | "table" | "connector";
      }
    | undefined;
}

/**
 * Abstract OOXML node.
 *
 * This extends the base xast Node interface to add OOXML-specific functionality.
 */
export interface Node extends XastNode {
  data?: Data | undefined;
}

/**
 * Abstract OOXML node that contains other OOXML nodes (*children*).
 *
 * This extends the base xast Parent interface.
 */
export interface Parent extends XastParent {
  data?: Data | undefined;
}

/**
 * Abstract OOXML node that contains the smallest possible value.
 *
 * This extends the base xast Literal interface.
 */
export interface Literal extends XastLiteral {
  data?: Data | undefined;
}

/**
 * Info associated with OOXML elements.
 */
export interface ElementData extends XastElementData {
  /**
   * The specific OOXML namespace for this element
   */
  ooxmlNamespace?: string | undefined;
}

/**
 * Base interface for all OOXML elements.
 *
 * This extends the base xast Element interface.
 */
export interface Element extends XastElement {
  data?: ElementData | undefined;
}

/**
 * OOXML Root with extended content map for DrawingML elements.
 *
 * This extends the base xast Root interface.
 */
export interface Root extends XastRoot {
  data?: Data | undefined;
  children: RootContent[];
}

/**
 * Extended RootContentMap that includes DrawingML elements.
 *
 * This allows specific OOXML elements to be used as root children.
 */
export interface RootContentMap extends XastRootContentMap {}

/**
 * Union of all possible root content types in OOXML.
 */
export type RootContent = RootContentMap[keyof RootContentMap];

/**
 * Extended ElementContentMap for OOXML elements.
 */
export interface ElementContentMap extends XastElementContentMap {}

/**
 * Union of all possible element content types in OOXML.
 */
export type ElementContent = ElementContentMap[keyof ElementContentMap];

/**
 * Union of registered OOXML literals.
 */
export type Literals = Extract<RootContent, Literal>;

/**
 * Union of registered OOXML nodes.
 */
export type Nodes = Root | Node | RootContent;

/**
 * Union of registered OOXML parents.
 */
export type Parents = Extract<Nodes, Parent>;
