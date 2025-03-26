/**
 * Video-related AST node definitions
 *
 * This file contains definitions for video nodes.
 */

import type { Node } from "../base";

/**
 * Video track interface
 */
export interface VideoTrack {
  /** Track kind */
  kind: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
  /** Track language */
  language?: string;
  /** Track label */
  label?: string;
  /** Track URL */
  url: string;
  /** Track format */
  format?: string;
  /** Default track */
  default?: boolean;
}

/**
 * Video node
 */
export interface Video extends Node {
  type: "video";
  /** Video URL */
  url: string;
  /** Video title */
  title?: string;
  /** Video poster image URL */
  poster?: string;
  /** Video width */
  width?: number;
  /** Video height */
  height?: number;
  /** Video aspect ratio */
  aspectRatio?: string;
  /** Video duration in seconds */
  duration?: number;
  /** Video format */
  format?: string;
  /** Video codec */
  codec?: string;
  /** Video bit rate */
  bitRate?: number;
  /** Video frame rate */
  frameRate?: number;
  /** Video tracks */
  tracks?: VideoTrack[];
  /** Video autoplay */
  autoplay?: boolean;
  /** Video loop */
  loop?: boolean;
  /** Video controls */
  controls?: boolean;
  /** Video muted */
  muted?: boolean;
  /** Video preload */
  preload?: "none" | "metadata" | "auto";
  /** Video description */
  description?: string;
  /** Key frames as thumbnails */
  keyFrames?: string[];
}
