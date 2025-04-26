import type { Node } from "unist";
import type { OoxmlNode, XastParent } from "./common-types";
import type {
  OoxmlBreak,
  OoxmlDrawing,
  OoxmlHyperlink,
  OoxmlImage,
  OoxmlList,
  OoxmlListItem,
  OoxmlParagraph,
  OoxmlRoot,
  OoxmlTable,
  OoxmlTableCell,
  OoxmlTableRow,
  OoxmlTextRun,
} from "./ooxml-ast";

// Base type guard for OoxmlNode
export function isOoxmlNode(node: any): node is OoxmlNode {
  return (
    typeof node === "object" && node !== null && typeof node.type === "string"
  );
}

export function isOoxmlParent(node: Node): node is XastParent {
  // Check if it's a node and has a children array
  return isOoxmlNode(node) && Array.isArray((node as XastParent).children);
}

export function isOoxmlRoot(node: Node): node is OoxmlRoot {
  return node.type === "root";
}
export function isOoxmlParagraph(node: Node): node is OoxmlParagraph {
  return node.type === "paragraph";
}
export function isOoxmlTextRun(node: Node): node is OoxmlTextRun {
  return node.type === "textRun";
}
export function isOoxmlTable(node: Node): node is OoxmlTable {
  return node.type === "table";
}
export function isOoxmlTableRow(node: Node): node is OoxmlTableRow {
  return node.type === "tableRow";
}
export function isOoxmlTableCell(node: Node): node is OoxmlTableCell {
  return node.type === "tableCell";
}
export function isOoxmlHyperlink(node: Node): node is OoxmlHyperlink {
  return node.type === "hyperlink";
}
export function isOoxmlImage(node: Node): node is OoxmlImage {
  return node.type === "image";
}
export function isOoxmlDrawing(node: Node): node is OoxmlDrawing {
  return node.type === "drawing";
}
export function isOoxmlList(node: Node): node is OoxmlList {
  return node.type === "list";
}
export function isOoxmlListItem(node: Node): node is OoxmlListItem {
  return node.type === "listItem";
}
export function isOoxmlBreak(node: Node): node is OoxmlBreak {
  return node.type === "break";
}
