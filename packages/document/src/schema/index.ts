/**
 * Document schema definitions
 * Pure unified.js compatible schema validation
 */

import type { DocumentSchema, Node } from "@docen/core";

// Define specific heading node type for validation
interface HeadingNode extends Node {
  type: "heading";
  depth?: number;
}

// Type guard to check if a node is a heading
function isHeadingNode(node: Node): node is HeadingNode {
  return node.type === "heading";
}

/**
 * Basic document schema
 */
export const documentSchema: DocumentSchema = {
  nodeTypes: {
    root: {
      allowedChildren: [
        "paragraph",
        "heading",
        "list",
        "blockquote",
        "code",
        "thematicBreak",
      ],
    },
    paragraph: {
      allowedChildren: [
        "text",
        "strong",
        "emphasis",
        "inlineCode",
        "link",
        "image",
      ],
    },
    heading: {
      required: ["depth"],
      properties: {
        depth: { type: "number" },
      },
      allowedChildren: ["text", "strong", "emphasis", "inlineCode"],
    },
    text: {
      required: ["value"],
      properties: {
        value: { type: "string" },
      },
    },
    strong: {
      allowedChildren: ["text", "emphasis", "inlineCode"],
    },
    emphasis: {
      allowedChildren: ["text", "strong", "inlineCode"],
    },
    code: {
      required: ["value"],
      properties: {
        value: { type: "string" },
        lang: { type: "string" },
        meta: { type: "string" },
      },
    },
    inlineCode: {
      required: ["value"],
      properties: {
        value: { type: "string" },
      },
    },
    link: {
      required: ["url"],
      properties: {
        url: { type: "string" },
        title: { type: "string" },
      },
      allowedChildren: ["text", "strong", "emphasis", "inlineCode", "image"],
    },
    image: {
      required: ["url"],
      properties: {
        url: { type: "string" },
        title: { type: "string" },
        alt: { type: "string" },
      },
    },
    list: {
      properties: {
        ordered: { type: "boolean" },
        start: { type: "number" },
        spread: { type: "boolean" },
      },
      allowedChildren: ["listItem"],
    },
    listItem: {
      properties: {
        checked: { type: "boolean" },
        spread: { type: "boolean" },
      },
      allowedChildren: ["paragraph", "list"],
    },
    blockquote: {
      allowedChildren: ["paragraph", "heading", "list", "blockquote", "code"],
    },
    thematicBreak: {},
  },
  validationRules: [
    {
      selector: (node) => node.type === "heading",
      validate: (node) => {
        if (!isHeadingNode(node)) {
          return "Invalid heading node";
        }
        if (!node.depth || node.depth < 1 || node.depth > 6) {
          return "Heading depth must be between 1 and 6";
        }
        return true;
      },
    },
  ],
};
