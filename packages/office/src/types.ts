/**
 * Office document processing types
 * Pure unified.js compatible types for office documents
 */

import type { Node, Parent } from "@docen/core";

// --- Office document AST nodes ---

export interface OfficeRoot extends Parent {
  type: "office-root";
  children: OfficeNode[];
  format: "docx" | "xlsx" | "pptx";
}

export interface OfficeDocument extends Parent {
  type: "office-document";
  children: OfficeNode[];
}

export interface OfficeParagraph extends Parent {
  type: "office-paragraph";
  children: OfficeInlineNode[];
  style?: string;
}

export interface OfficeRun extends Parent {
  type: "office-run";
  children: OfficeInlineNode[];
  formatting?: OfficeFormatting;
}

export interface OfficeText extends Node {
  type: "office-text";
  value: string;
}

export interface OfficeTable extends Parent {
  type: "office-table";
  children: OfficeTableRow[];
  style?: string;
}

export interface OfficeTableRow extends Parent {
  type: "office-table-row";
  children: OfficeTableCell[];
}

export interface OfficeTableCell extends Parent {
  type: "office-table-cell";
  children: OfficeNode[];
  colspan?: number;
  rowspan?: number;
}

export interface OfficeImage extends Node {
  type: "office-image";
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface OfficeList extends Parent {
  type: "office-list";
  children: OfficeListItem[];
  ordered?: boolean;
  level?: number;
}

export interface OfficeListItem extends Parent {
  type: "office-list-item";
  children: OfficeNode[];
  level?: number;
}

// --- Spreadsheet-specific nodes ---

export interface OfficeWorkbook extends Parent {
  type: "office-workbook";
  children: OfficeWorksheet[];
}

export interface OfficeWorksheet extends Parent {
  type: "office-worksheet";
  children: OfficeRow[];
  name: string;
}

export interface OfficeRow extends Parent {
  type: "office-row";
  children: OfficeCell[];
  index: number;
}

export interface OfficeCell extends Node {
  type: "office-cell";
  value: string | number | boolean | Date;
  formula?: string;
  style?: string;
  column: string;
  row: number;
}

// --- Presentation-specific nodes ---

export interface OfficePresentation extends Parent {
  type: "office-presentation";
  children: OfficeSlide[];
}

export interface OfficeSlide extends Parent {
  type: "office-slide";
  children: OfficeNode[];
  layout?: string;
  index: number;
}

// --- Formatting types ---

export interface OfficeFormatting {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
}

// --- Content type unions ---

export type OfficeNode =
  | OfficeParagraph
  | OfficeTable
  | OfficeImage
  | OfficeList
  | OfficeWorkbook
  | OfficePresentation;

export type OfficeInlineNode = OfficeText | OfficeRun;

// --- Processor options ---

export interface OfficeProcessorOptions {
  format: "docx" | "xlsx" | "pptx";
  preserveFormatting?: boolean;
  extractImages?: boolean;
  includeMetadata?: boolean;
}
