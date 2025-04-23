/**
 * AST types for Docen
 * Defining types for Abstract Syntax Tree nodes
 */
import type { Node as UnistNode, Parent as UnistParent } from "unist";
import type { Position } from "unist";
import type { ValidationError } from "../errors";

/**
 * Base node interface extends unist Node
 */
export interface Node extends UnistNode {
  /**
   * Optional collaboration metadata
   */
  collaborationMetadata?: {
    /**
     * Creator identifier
     */
    createdBy?: string;

    /**
     * Creation timestamp
     */
    createdAt?: number;

    /**
     * Last modifier identifier
     */
    modifiedBy?: string;

    /**
     * Last modification timestamp
     */
    modifiedAt?: number;

    /**
     * Node version number
     */
    version?: number;

    /**
     * Timestamp for synchronization conflict resolution
     */
    lastModifiedTimestamp?: number;

    /**
     * Origin of the last change (e.g., "user", "system", "remote")
     */
    origin?: string;
  };
}

/**
 * Parent node with children
 */
export interface Parent extends Node, UnistParent {
  /**
   * Array of child nodes
   */
  children: Node[];
}

/**
 * Text node with a value
 */
export interface TextNode extends Node {
  /**
   * Node type identifier
   */
  type: string;

  /**
   * Text content
   */
  value: string;
}

/**
 * Root document node
 */
export interface DocenRoot extends Parent {
  /**
   * Node type identifier, always "root"
   */
  type: "root";

  /**
   * Child nodes
   */
  children: Node[];

  /**
   * Document metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Document schema definition
 */
export interface DocumentSchema {
  /**
   * Node type definitions
   */
  nodeTypes: Record<string, NodeTypeDefinition>;

  /**
   * Validation rules
   */
  validationRules: ValidationRule[];

  /**
   * Error handling callback
   */
  onValidationError?: (error: ValidationError) => "ignore" | "fix" | "reject";
}

/**
 * Node type definition
 */
export interface NodeTypeDefinition {
  /**
   * Required properties
   */
  required?: string[];

  /**
   * Property types
   */
  properties?: Record<
    string,
    {
      type: "string" | "number" | "boolean" | "object" | "array";
      items?: NodeTypeDefinition;
    }
  >;

  /**
   * Allowed child node types
   */
  allowedChildren?: string[];

  /**
   * Binding strategy override
   */
  bindingStrategy?: "deep" | "shallow" | "lazy";
}

/**
 * Validation rule
 */
export interface ValidationRule {
  /**
   * Node selector
   */
  selector: string | ((node: Node) => boolean);

  /**
   * Validation function
   */
  validate: (node: Node) => boolean | ValidationError;
}
