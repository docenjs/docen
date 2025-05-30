/**
 * Core Type Definitions for Docen
 * Pure unified.js compatible types
 */

import type {
  Plugin as UnifiedPlugin,
  Processor as UnifiedProcessor,
} from "unified";
import type { Node as UnistNode, Parent as UnistParent } from "unist";
import type { VFileData } from "vfile";

// --- Base AST Nodes ---

export interface Node extends UnistNode {
  // Pure unist node, no collaboration metadata
}

export interface Parent extends Node, UnistParent {
  children: Node[];
}

export interface TextNode extends Node {
  type: "text";
  value: string;
}

export interface DocenRoot extends Parent {
  type: "root";
  children: Node[];
  metadata?: Record<string, unknown>;
}

export interface DocenNode extends Node {
  id?: string;
}

// --- Document Schema & Validation ---

export interface DocumentSchema {
  nodeTypes: Record<string, NodeTypeDefinition>;
  validationRules: ValidationRule[];
  onValidationError?: (error: string) => "ignore" | "fix" | "reject";
}

export interface NodeTypeDefinition {
  required?: string[];
  properties?: Record<
    string,
    {
      type: "string" | "number" | "boolean" | "object" | "array";
      items?: NodeTypeDefinition;
    }
  >;
  allowedChildren?: string[];
}

export interface ValidationRule {
  selector: string | ((node: Node) => boolean);
  validate: (node: Node) => boolean | string;
}

// --- Error Types ---

export interface ErrorContext {
  [key: string]: unknown;
}

export interface ParseErrorContext extends ErrorContext {
  content?: string;
  position?: {
    line: number;
    column: number;
    offset: number;
  };
}

export interface TransformErrorContext extends ErrorContext {
  node?: Node;
  transformer?: string;
  phase?: "parse" | "transform" | "compile";
}

export interface ValidationErrorContext extends ErrorContext {
  node?: Node;
  rule?: string;
  path?: (string | number)[];
}

export interface PluginErrorContext extends ErrorContext {
  pluginName?: string;
  phase?: "load" | "execute" | "configure";
}

export interface FileErrorContext extends ErrorContext {
  path?: string;
  contents?: string;
  position?: { line: number; column: number; offset: number };
}

// --- Result Pattern ---

export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

// --- Processor Types ---

/** DocenProcessor extends the standard unified processor */
export interface DocenProcessor
  extends UnifiedProcessor<DocenRoot, DocenRoot, DocenRoot, DocenRoot> {
  // Pure unified.js processor
}

/** Options for creating a Docen processor */
export interface DocenProcessorOptions {
  source?: string;
  plugins?: (UnifiedPlugin | [UnifiedPlugin, Record<string, unknown>])[];
  adapter?: "remark" | "rehype" | "retext" | "recma";
}

// --- Plugin Types ---

/** Plugin metadata interface */
export interface PluginMeta {
  name: string;
  description?: string;
  version?: string;
  author?: string;
  dependencies?: string[];
  formats?: string[];
  configSchema?: Record<string, unknown>;
}

/** Plugin definition for Docen */
export interface DocenPlugin extends UnifiedPlugin {
  meta?: PluginMeta;
  defaultEnabled?: boolean;
  priority?: number;
  phase?: "parse" | "transform" | "compile" | "all";
}

/** Plugin options for Docen processor */
export interface PluginOptions {
  discoveryPath?: string;
  enabledPlugins?: string[];
  disabledPlugins?: string[];
  pluginSettings?: Record<string, Record<string, unknown>>;
}

// --- Utility Types ---

/** Extended data for VFile (without collaborative properties) */
export interface DocenVFileData extends VFileData {
  processing?: {
    startTime?: number;
    endTime?: number;
    stats?: Record<string, unknown>;
  };
}

/** Path in a document */
export type DocPath = (string | number)[];

/** A unique ID for a document or fragment */
export type DocId = string;

/** Timestamp used for tracking modifications */
export type Timestamp = number;
