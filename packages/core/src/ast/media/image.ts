/**
 * Enhanced image-related AST node definitions
 *
 * This file contains definitions for enhanced image nodes.
 */

import type { Node } from "../base";

/**
 * Image region represents a defined area within an image
 */
export interface ImageRegion {
  /** Region ID */
  id: string;
  /** Region type */
  type: "rect" | "circle" | "polygon" | "point";
  /** Region coordinates (format depends on type) */
  coordinates: number[] | { x: number; y: number }[];
  /** Region label */
  label?: string;
  /** Region description */
  description?: string;
  /** Region link */
  link?: string;
}

/**
 * Image metadata interface
 */
export interface ImageMetadata {
  /** Image taken date */
  dateTaken?: Date;
  /** Camera model */
  camera?: string;
  /** Exposure */
  exposure?: string;
  /** Aperture */
  aperture?: string;
  /** ISO */
  iso?: number;
  /** Focal length */
  focalLength?: string;
  /** Flash used */
  flash?: boolean;
  /** GPS location */
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
  };
  /** Original image dimensions */
  originalDimensions?: {
    width: number;
    height: number;
  };
  /** Color profile */
  colorProfile?: string;
  /** Copyright */
  copyright?: string;
  /** Author */
  author?: string;
  /** Software */
  software?: string;
}

/**
 * Enhanced image node with rich metadata and regions
 */
export interface RichImage extends Node {
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
  /** Image is decorative only */
  decorative?: boolean;
  /** Image loading strategy */
  loading?: "eager" | "lazy";
  /** Image format */
  format?: "jpeg" | "png" | "gif" | "webp" | "svg" | "tiff" | "avif";
  /** Image size in bytes */
  size?: number;
  /** Image has transparency */
  hasTransparency?: boolean;
  /** Image has animation */
  hasAnimation?: boolean;
  /** Image dominant colors */
  dominantColors?: string[];
  /** Image metadata */
  metadata?: ImageMetadata;
  /** Image interactive regions */
  regions?: ImageRegion[];
  /** Image placeholder/blur hash */
  placeholder?: string;
  /** Responsive image sources */
  sources?: Array<{
    url: string;
    width: number;
    format?: string;
  }>;
}
