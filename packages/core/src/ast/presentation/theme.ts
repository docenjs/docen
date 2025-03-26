/**
 * Presentation theme-related AST node definitions
 *
 * This file contains definitions for presentation themes.
 */

import type { Node } from "../base";

/**
 * Theme color definition
 */
export interface ThemeColor {
  /** Color name */
  name: string;
  /** Color value */
  value: string;
  /** Color category */
  category?: "primary" | "accent" | "background" | "text" | "chart" | "custom";
}

/**
 * Theme font definition
 */
export interface ThemeFont {
  /** Font name */
  name: string;
  /** Font family */
  family: string;
  /** Font category */
  category?: "heading" | "body" | "accent" | "custom";
  /** Font URL */
  url?: string;
  /** Font weight */
  weight?: string;
  /** Font style */
  style?: string;
}

/**
 * Theme node for presentations
 */
export interface Theme extends Node {
  type: "theme";
  /** Theme name */
  name: string;
  /** Theme ID */
  id?: string;
  /** Theme colors */
  colors: ThemeColor[];
  /** Theme fonts */
  fonts: ThemeFont[];
  /** Theme effects */
  effects?: {
    /** Effects for lines */
    line?: {
      /** Line style */
      style?: "solid" | "dashed" | "dotted" | "double";
      /** Line weight */
      weight?: "thin" | "medium" | "thick";
      /** Line shadow */
      shadow?: boolean;
    };
    /** Effects for fills */
    fill?: {
      /** Fill style */
      style?: "solid" | "gradient" | "pattern" | "texture";
      /** Fill shadow */
      shadow?: boolean;
    };
    /** Text effects */
    text?: {
      /** Text shadow */
      shadow?: boolean;
      /** Text glow */
      glow?: boolean;
      /** Text reflection */
      reflection?: boolean;
    };
  };
  /** Theme layout rules */
  layout?: {
    /** Slide margins */
    margins?: {
      /** Top margin */
      top: number;
      /** Right margin */
      right: number;
      /** Bottom margin */
      bottom: number;
      /** Left margin */
      left: number;
    };
    /** Slide aspect ratio */
    aspectRatio?: string;
    /** Default slide layout */
    defaultLayout?: string;
  };
}
