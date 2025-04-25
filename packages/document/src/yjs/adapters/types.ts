import type * as Y from "yjs";

/**
 * Interface defining how an mdast node maps to Yjs types.
 */
export interface MdastYjsMapping {
  type: string; // mdast node type
  yjsType: typeof Y.XmlElement | typeof Y.XmlText | typeof Y.XmlHook; // Target Yjs type
  yjsTagName?: string | ((node: any) => string); // Tag name or function to get it for XmlElement
  attributes?: (node: any) => Record<string, string>; // Function to map node props to attributes
  value?: (node: any) => string; // Function to get value for Y.XmlText
  childrenBinding?: "recursive" | "skip" | "custom"; // How children should be handled
}

/**
 * Interface defining how a hast node maps to Yjs types.
 */
export interface HastYjsMapping {
  type: string; // hast node type
  yjsType: typeof Y.XmlElement | typeof Y.XmlText | typeof Y.XmlHook; // Target Yjs type
  yjsTagName?: string | ((node: any) => string); // Tag name or function to get it for XmlElement
  attributes?: (
    node: any,
  ) => Record<
    string,
    string | number | boolean | null | undefined | Array<string | number>
  >;
  value?: (node: any) => string; // Function to get value for Y.XmlText
  childrenBinding?: "recursive" | "skip" | "custom"; // How children should be handled
}
