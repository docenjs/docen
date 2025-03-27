/**
 * EPUB-specific AST node definitions
 *
 * This file contains definitions for EPUB-specific structures.
 */

/**
 * EPUB navigation item interface
 */
export interface EPUBNavigation {
  /** Navigation type */
  type: string;
  /** Navigation label */
  label: string;
  /** Navigation href */
  href: string;
  /** Navigation children */
  children?: EPUBNavigation[];
}

/**
 * EPUB package interface
 */
export interface EPUBPackage {
  /** EPUB unique identifier */
  uniqueIdentifier: string;
  /** EPUB identifier */
  identifier: string;
  /** EPUB title */
  title: string;
  /** EPUB language */
  language: string;
  /** EPUB modified date */
  modified?: Date;
  /** EPUB creator */
  creator?: string;
  /** EPUB publisher */
  publisher?: string;
  /** EPUB description */
  description?: string;
  /** EPUB rights */
  rights?: string;
  /** EPUB subjects */
  subjects?: string[];
  /** EPUB coverage */
  coverage?: string;
  /** EPUB source */
  source?: string;
  /** EPUB relations */
  relations?: string[];
  /** EPUB format */
  format?: string;
  /** EPUB type */
  type?: string;
  /** EPUB contributor */
  contributor?: string;
}

/**
 * EPUB manifest item interface
 */
export interface EPUBManifestItem {
  /** Item ID */
  id: string;
  /** Item href */
  href: string;
  /** Item media type */
  mediaType: string;
  /** Item properties */
  properties?: string[];
}

/**
 * EPUB spine item interface
 */
export interface EPUBSpineItem {
  /** Item ID reference */
  idref: string;
  /** Item linear */
  linear?: boolean;
  /** Item properties */
  properties?: string[];
}

/**
 * EPUB guide item interface
 */
export interface EPUBGuideItem {
  /** Guide type */
  type: string;
  /** Guide title */
  title: string;
  /** Guide href */
  href: string;
}
