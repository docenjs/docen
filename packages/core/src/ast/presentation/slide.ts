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
 * Slide layout node
 */
export interface SlideLayout extends Node {
  type: "slideLayout";
  /** Layout name */
  name: string;
  /** Layout ID */
  id?: string;
  /** Layout properties */
  properties?: Record<string, unknown>;
  /** Layout content */
  children: Block[];
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
  properties?: Record<string, unknown>;
  /** Master layouts */
  layouts?: SlideLayout[];
}
