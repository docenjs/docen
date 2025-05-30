/**
 * Document processing types
 * Pure unified.js compatible types for text documents
 */

import type { Node, Parent } from "@docen/core";

// --- Document-specific AST nodes ---

export interface DocumentRoot extends Parent {
  type: "root";
  children: DocumentNode[];
}

export interface Paragraph extends Parent {
  type: "paragraph";
  children: PhraseContent[];
}

export interface Heading extends Parent {
  type: "heading";
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: PhraseContent[];
}

export interface Text extends Node {
  type: "text";
  value: string;
}

export interface Strong extends Parent {
  type: "strong";
  children: PhraseContent[];
}

export interface Emphasis extends Parent {
  type: "emphasis";
  children: PhraseContent[];
}

export interface Code extends Node {
  type: "code";
  lang?: string;
  meta?: string;
  value: string;
}

export interface InlineCode extends Node {
  type: "inlineCode";
  value: string;
}

export interface Link extends Parent {
  type: "link";
  url: string;
  title?: string;
  children: StaticPhraseContent[];
}

export interface Image extends Node {
  type: "image";
  url: string;
  title?: string;
  alt?: string;
}

export interface List extends Parent {
  type: "list";
  ordered?: boolean;
  start?: number;
  spread?: boolean;
  children: ListItem[];
}

export interface ListItem extends Parent {
  type: "listItem";
  checked?: boolean;
  spread?: boolean;
  children: FlowContent[];
}

export interface Blockquote extends Parent {
  type: "blockquote";
  children: FlowContent[];
}

export interface ThematicBreak extends Node {
  type: "thematicBreak";
}

// --- Content type unions ---

export type DocumentNode = FlowContent | PhraseContent;

export type FlowContent =
  | Paragraph
  | Heading
  | ThematicBreak
  | Blockquote
  | List
  | Code;

export type PhraseContent = StaticPhraseContent | Link;

export type StaticPhraseContent = Text | Emphasis | Strong | InlineCode | Image;

// --- Processor options ---

export interface DocumentProcessorOptions {
  format: "markdown" | "html";
  gfm?: boolean;
  frontmatter?: boolean;
  math?: boolean;
  footnotes?: boolean;
}
