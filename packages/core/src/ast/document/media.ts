/**
 * Media and link-related AST node definitions
 *
 * This file contains definitions for links, images, and other media elements.
 */

import type { Node } from "../base";
import type { Inline } from "./text";

/**
 * Link node
 */
export interface Link extends Node {
  type: "link";
  /** Link URL */
  url: string;
  /** Link title (optional) */
  title?: string;
  /** Link relation type */
  rel?: string;
  /** Open in new tab */
  newTab?: boolean;
  /** Link content */
  children: Inline[];
}

/**
 * Image node
 */
export interface Image extends Node {
  type: "image";
  /** Image URL */
  url: string;
  /** Image alt text */
  alt?: string;
  /** Image title */
  title?: string;
  /** Image dimensions */
  dimensions?: {
    width?: number;
    height?: number;
  };
  /** Image caption */
  caption?: string;
  /** Is this image decorative only */
  decorative?: boolean;
  /** Image loading strategy */
  loading?: "eager" | "lazy";
}

/**
 * Inline image node
 */
export interface InlineImage extends Node {
  type: "inlineImage";
  /** Image URL */
  url: string;
  /** Image alt text */
  alt?: string;
  /** Image title */
  title?: string;
  /** Image dimensions */
  dimensions?: {
    width?: number;
    height?: number;
  };
}

/**
 * Shape node for drawings and shapes
 */
export interface Shape extends Node {
  type: "shape";
  /** Shape type */
  shapeType: string;
  /** Shape properties */
  properties?: {
    width?: number;
    height?: number;
    position?: {
      x: number;
      y: number;
    };
    rotation?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}
