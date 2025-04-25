import type * as Mdast from "mdast";
import * as Y from "yjs";
import type { MdastYjsMapping } from "./types"; // Import from the new types file

/**
 * Defines how specific mdast node types map to Yjs XML types.
 * This configuration will be used by the core YjsAdapter.
 */

// Mapping: mdast paragraph -> Y.XmlElement named 'paragraph'
export const mdastParagraphMapping: MdastYjsMapping = {
  type: "paragraph",
  yjsType: Y.XmlElement,
  yjsTagName: "paragraph",
  childrenBinding: "recursive", // Assume children are handled recursively
};

// Mapping: mdast text -> Y.XmlText
export const mdastTextMapping: MdastYjsMapping = {
  type: "text",
  yjsType: Y.XmlText,
  value: (node: Mdast.Text) => node.value, // Get value from node
};

// Mapping: mdast heading -> Y.XmlElement named 'h1', 'h2', etc.
export const mdastHeadingMapping: MdastYjsMapping = {
  type: "heading",
  yjsType: Y.XmlElement,
  yjsTagName: (node: Mdast.Heading) => `h${node.depth}`, // Dynamic tag based on depth
  attributes: (node: Mdast.Heading) => ({ depth: String(node.depth) }), // Store depth as attribute
  childrenBinding: "recursive",
};

// Mapping: mdast strong (bold) -> Y.XmlElement named 'strong'
export const mdastStrongMapping: MdastYjsMapping = {
  type: "strong",
  yjsType: Y.XmlElement,
  yjsTagName: "strong",
  childrenBinding: "recursive",
};

// Mapping: mdast emphasis (italic) -> Y.XmlElement named 'em'
export const mdastEmphasisMapping: MdastYjsMapping = {
  type: "emphasis",
  yjsType: Y.XmlElement,
  yjsTagName: "em",
  childrenBinding: "recursive",
};

// Mapping: mdast list -> Y.XmlElement named 'ul' or 'ol'
export const mdastListMapping: MdastYjsMapping = {
  type: "list",
  yjsType: Y.XmlElement,
  yjsTagName: (node: Mdast.List) => (node.ordered ? "ol" : "ul"),
  attributes: (node: Mdast.List) => {
    const attrs: Record<string, string> = {};
    if (
      node.ordered &&
      node.start !== null &&
      node.start !== undefined &&
      node.start !== 1
    ) {
      attrs.start = String(node.start);
    }
    // Could add spread, loose later if needed
    return attrs;
  },
  childrenBinding: "recursive", // Children are listItems
};

// Mapping: mdast listItem -> Y.XmlElement named 'li'
export const mdastListItemMapping: MdastYjsMapping = {
  type: "listItem",
  yjsType: Y.XmlElement,
  yjsTagName: "li",
  attributes: (node: Mdast.ListItem) => {
    const attrs: Record<string, string> = {};
    // Handle GFM checkboxes
    if (node.checked !== null && node.checked !== undefined) {
      // We might store this as a data attribute or rely on structure/class
      attrs["data-checked"] = String(node.checked);
      // Alternatively, could map to specific class or structure if rendering handles it
    }
    // Could add spread later if needed
    return attrs;
  },
  childrenBinding: "recursive", // Children are blocks (paragraph, etc.)
};

// Mapping: mdast link -> Y.XmlElement named 'a'
export const mdastLinkMapping: MdastYjsMapping = {
  type: "link",
  yjsType: Y.XmlElement,
  yjsTagName: "a",
  attributes: (node: Mdast.Link) => {
    const attrs: Record<string, string> = { href: node.url };
    if (node.title) {
      attrs.title = node.title;
    }
    return attrs;
  },
  childrenBinding: "recursive", // Children are phrasing content (text, strong, etc.)
};

// Mapping: mdast image -> Y.XmlElement named 'img' (self-closing)
export const mdastImageMapping: MdastYjsMapping = {
  type: "image",
  yjsType: Y.XmlElement,
  yjsTagName: "img",
  attributes: (node: Mdast.Image) => {
    const attrs: Record<string, string> = { src: node.url };
    if (node.title) {
      attrs.title = node.title;
    }
    if (node.alt) {
      attrs.alt = node.alt;
    }
    return attrs;
  },
  childrenBinding: "skip", // No children for img
};

// Mapping: mdast blockquote -> Y.XmlElement named 'blockquote'
export const mdastBlockquoteMapping: MdastYjsMapping = {
  type: "blockquote",
  yjsType: Y.XmlElement,
  yjsTagName: "blockquote",
  childrenBinding: "recursive",
};

// Mapping: mdast code (block) -> Y.XmlElement pre > code
export const mdastCodeMapping: MdastYjsMapping = {
  type: "code",
  yjsType: Y.XmlElement,
  yjsTagName: "pre", // Outer element is <pre>
  childrenBinding: "custom", // Special handling for inner <code>
  // Custom logic would likely be needed in the core adapter to handle this:
  // 1. Create <pre> element.
  // 2. Create <code> element inside.
  // 3. Set lang/meta as attributes on <code>.
  // 4. Put node.value inside <code> as Y.XmlText.
  attributes: (node: Mdast.Code) => {
    const attrs: Record<string, string> = {};
    // Attributes for the inner <code> tag, how to handle this?
    // Maybe store them on the <pre> with a prefix?
    if (node.lang) {
      attrs["data-code-lang"] = node.lang;
    }
    if (node.meta) {
      attrs["data-code-meta"] = node.meta;
    }
    return attrs; // These are technically for the <pre> tag here
  },
  value: (node: Mdast.Code) => node.value, // Need a way to handle this value within the custom childrenBinding
};

// Mapping: mdast inlineCode -> Y.XmlElement named 'code'
export const mdastInlineCodeMapping: MdastYjsMapping = {
  type: "inlineCode",
  yjsType: Y.XmlElement,
  yjsTagName: "code",
  // Inline code value is directly mapped to Y.XmlText inside the <code> element
  value: (node: Mdast.InlineCode) => node.value,
  childrenBinding: "skip", // Value is handled by 'value', no recursive children
};

// TODO: Define mappings for other core mdast types:
// root, table, tableRow, tableCell, thematicBreak, html, definition, footnoteDefinition, footnoteReference etc.

// Interface moved to types.ts
// export interface MdastYjsMapping { ... }

// This array will hold all the default mappings
export const defaultMdastMappings: MdastYjsMapping[] = [
  mdastParagraphMapping,
  mdastTextMapping,
  mdastHeadingMapping,
  mdastStrongMapping,
  mdastEmphasisMapping,
  mdastListMapping,
  mdastListItemMapping,
  mdastLinkMapping,
  mdastImageMapping,
  mdastBlockquoteMapping,
  mdastCodeMapping,
  mdastInlineCodeMapping,
  // ... add other mappings here
];
