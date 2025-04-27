import type { Node } from "unist";
import type {
  OoxmlData,
  OoxmlNode,
  XastElement,
  XastNode,
  XastParent,
} from "./common-types";
import type {
  OoxmlBlockContent,
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

// Type guard for OoxmlBlockContent union type
export function isOoxmlBlockContent(
  node: Node | XastNode | null | undefined,
): node is OoxmlBlockContent {
  if (!node || typeof node !== "object" || !node.type) return false;

  const nodeType = node.type;

  // Check against specific OoxmlNode types included in OoxmlBlockContent
  // Assumes isOoxmlParagraph etc. work correctly with Node | XastNode input
  if (isOoxmlParagraph(node) || isOoxmlTable(node) || isOoxmlList(node)) {
    return true;
  }

  // Check if it's an XastElement type that qualifies as OoxmlBlockContent
  if (nodeType === "element") {
    // Cast to XastElement for safety, though type check ensures it
    const element = node as XastElement;
    const ooxmlType = (element.data as OoxmlData | undefined)?.ooxmlType;

    // Check specific block-level elements identified by ooxmlType
    if (ooxmlType === "bookmarkStart" || ooxmlType === "bookmarkEnd") {
      return true;
    }

    // Check elements that might have been marked as paragraph/table/list by traverse
    // Note: This might overlap with the isOoxmlParagraph/Table/List checks above,
    // but covers cases where the node is technically just XastElement but semantically block.
    if (
      ooxmlType === "paragraph" ||
      ooxmlType === "table" ||
      ooxmlType === "list"
    ) {
      return true;
    }

    // Fallback: OoxmlBlockContent includes the generic XastElement type.
    // We should be careful not to accidentally include inline elements like <w:r>.
    // Rely on the `traverse` function correctly removing/transforming inline elements
    // or setting appropriate `ooxmlType` for block elements.
    // A check like `!['w:r', 'w:t', ...].includes(element.name)` could be added for safety.
    // For now, aligning with the type definition `... | XastElement`.
    return true;
  }

  return false;
}
