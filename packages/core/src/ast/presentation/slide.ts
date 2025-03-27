/**
 * Presentation slide-related AST node definitions
 *
 * This file contains definitions for presentation slides.
 */

import type { Node } from "../base";
import type { Block } from "../document/index";

/**
 * Slide node for presentation slides
 */
export interface Slide extends Node {
  type: "slide";
  /** Slide number */
  number?: number;
  /** Slide title */
  title?: string;
  /** Slide layout */
  layout?: string;
  /** Slide notes */
  notes?: string;
  /** Slide transition */
  transition?: {
    /** Transition type */
    type?:
      | "none"
      | "fade"
      | "push"
      | "wipe"
      | "split"
      | "reveal"
      | "random"
      | "zoom";
    /** Transition duration in milliseconds */
    duration?: number;
    /** Transition direction */
    direction?: "left" | "right" | "up" | "down";
  };
  /** Slide background */
  background?: {
    /** Background color */
    color?: string;
    /** Background image */
    image?: string;
    /** Background video */
    video?: string;
    /** Background opacity */
    opacity?: number;
  };
  /** Slide content */
  children: Block[];
}

/**
 * Slide layout properties
 */
export interface SlideLayoutProperties {
  /** Layout type */
  type?:
    | "title"
    | "content"
    | "section"
    | "two-content"
    | "comparison"
    | "blank";
  /** Layout orientation */
  orientation?: "portrait" | "landscape";
  /** Layout margins */
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
  /** Layout placeholders */
  placeholders?: Array<{
    /** Placeholder type */
    type:
      | "title"
      | "content"
      | "subtitle"
      | "body"
      | "image"
      | "chart"
      | "table";
    /** Placeholder position */
    position: {
      /** X position */
      x: number;
      /** Y position */
      y: number;
      /** Width */
      width: number;
      /** Height */
      height: number;
    };
  }>;
}

/**
 * Slide layout node
 */
export interface SlideLayout extends Node {
  type: "slideLayout";
  /** Layout name */
  name: string;
  /** Layout ID */
  id?: string;
  /** Layout properties */
  properties?: SlideLayoutProperties;
  /** Layout content */
  children: Block[];
}

/**
 * Slide master properties
 */
export interface SlideMasterProperties {
  /** Master type */
  type?: "standard" | "custom";
  /** Master orientation */
  orientation?: "portrait" | "landscape";
  /** Master margins */
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
  /** Master background */
  background?: {
    /** Background color */
    color?: string;
    /** Background image */
    image?: string;
    /** Background video */
    video?: string;
    /** Background opacity */
    opacity?: number;
  };
  /** Master theme */
  theme?: string;
}

/**
 * Slide master node
 */
export interface SlideMaster extends Node {
  type: "slideMaster";
  /** Master name */
  name: string;
  /** Master ID */
  id?: string;
  /** Master properties */
  properties?: SlideMasterProperties;
  /** Master layouts */
  layouts?: SlideLayout[];
}
