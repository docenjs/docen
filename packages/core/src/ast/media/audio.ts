/**
 * Audio-related AST node definitions
 *
 * This file contains definitions for audio nodes.
 */

import type { Node } from "../base";

/**
 * Audio track interface
 */
export interface AudioTrack {
  /** Track kind */
  kind: "main" | "translation" | "description" | "commentary";
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
 * Audio node
 */
export interface Audio extends Node {
  type: "audio";
  /** Audio URL */
  url: string;
  /** Audio title */
  title?: string;
  /** Audio duration in seconds */
  duration?: number;
  /** Audio format */
  format?: string;
  /** Audio codec */
  codec?: string;
  /** Audio bit rate */
  bitRate?: number;
  /** Audio sample rate */
  sampleRate?: number;
  /** Audio channels */
  channels?: number;
  /** Audio tracks */
  tracks?: AudioTrack[];
  /** Audio autoplay */
  autoplay?: boolean;
  /** Audio loop */
  loop?: boolean;
  /** Audio controls */
  controls?: boolean;
  /** Audio muted */
  muted?: boolean;
  /** Audio preload */
  preload?: "none" | "metadata" | "auto";
  /** Audio transcript */
  transcript?: string;
  /** Audio description */
  description?: string;
}
