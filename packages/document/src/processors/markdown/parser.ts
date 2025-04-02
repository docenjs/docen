/**
 * Markdown parser for Docen
 *
 * This file implements a parser for Markdown documents.
 * It parses Markdown syntax into the Docen AST structure.
 */

import type {
  BlockQuote,
  Code,
  Document,
  Heading,
  Image,
  Inline,
  List,
  ListItem,
  Metadata,
  Paragraph,
  ProcessorOptions,
  Root,
  Source,
  TableCell,
  TableEnhanced,
  TableRow,
  ThematicBreak,
} from "@docen/core";
import { AbstractParser, createProcessorError, toText } from "@docen/core";

/**
 * Markdown Parser implementation
 */
export class MarkdownParser extends AbstractParser {
  id = "markdown-parser";
  name = "Markdown Parser";
  supportedInputTypes = ["text/markdown", "text/plain"];
  supportedOutputTypes: string[] = [];
  supportedInputExtensions = ["md", "markdown", "txt"];
  supportedOutputExtensions: string[] = [];

  /**
   * Try to detect if the source is in Markdown format
   *
   * @param source The source to check
   * @returns True if the source appears to be Markdown
   */
  protected async detectFormat(source: Source): Promise<boolean> {
    try {
      const text = toText(source);
      // Simple heuristic to detect markdown: look for common markdown patterns
      const markdownPatterns = [
        /^#+ /m, // Headings
        /\*\*.*\*\*/, // Bold
        /\*.*\*/, // Italic
        /\[.*\]\(.*\)/, // Links
        /^- /m, // Lists
        /^> /m, // Blockquotes
        /^```/m, // Code blocks
        /^---/m, // Horizontal rule
      ];

      // If at least two patterns match, assume it's markdown
      const matchCount = markdownPatterns.filter((pattern) =>
        pattern.test(text)
      ).length;

      return matchCount >= 2;
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse Markdown content into a document AST
   *
   * @param source The source data to parse
   * @param options Parsing options
   * @returns Parsed document
   */
  async parse(source: Source, options?: ProcessorOptions): Promise<Document> {
    try {
      // Convert source to string
      const text = toText(source);

      // Create empty document structure
      const document: Document = {
        metadata: {},
        content: {
          type: "root",
          children: [],
        },
      };

      // Extract metadata if present (YAML frontmatter)
      if (options?.extractMetadata !== false) {
        document.metadata = this.extractMetadata(text);
      }

      // Parse the content
      document.content = this.parseContent(text);

      return document;
    } catch (error) {
      throw createProcessorError(
        "Failed to parse Markdown document",
        this.id,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Extract metadata from YAML frontmatter in Markdown
   *
   * @param text The markdown text
   * @returns Extracted metadata
   */
  private extractMetadata(text: string): Metadata {
    const metadata: Metadata = {};

    // Check for YAML frontmatter delimited by --- or +++
    const frontmatterRegex = /^(---|\+\+\+)\r?\n([\s\S]*?)\r?\n\1/;
    const match = text.match(frontmatterRegex);

    if (match) {
      // Simple YAML parsing for frontmatter
      const frontmatter = match[2];
      const lines = frontmatter.split(/\r?\n/);

      for (const line of lines) {
        // Match key: value pairs
        const keyValueMatch = line.match(/^([^:]+):\s*(.*)$/);
        if (keyValueMatch) {
          const [, key, value] = keyValueMatch;

          // Simple YAML value parsing
          let parsedValue: string | number | boolean = value.trim();

          // Try to parse numbers and booleans
          if (parsedValue === "true") {
            parsedValue = true;
          } else if (parsedValue === "false") {
            parsedValue = false;
          } else if (parsedValue !== "" && !Number.isNaN(Number(parsedValue))) {
            parsedValue = Number(parsedValue);
          }

          metadata[key.trim()] = parsedValue;
        }
      }
    }

    return metadata;
  }

  /**
   * Parse Markdown content into Docen AST
   *
   * @param text The markdown text
   * @returns Root node of the AST
   */
  private parseContent(text: string): Root {
    const root: Root = {
      type: "root",
      children: [],
    };

    // Remove YAML frontmatter if present
    const frontmatterRegex = /^(---|\+\+\+)\r?\n([\s\S]*?)\r?\n\1/;
    const contentText = text.replace(frontmatterRegex, "").trim();

    // Split text into lines
    const lines = contentText.split(/\r?\n/);

    // Process lines to create nodes
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];

      // Skip empty lines
      if (line.trim() === "") {
        i++;
        continue;
      }

      // Check for block image
      const blockImage = this.parseBlockImage(line);
      if (blockImage) {
        root.children.push(blockImage);
        i++;
        continue;
      }

      // Check for table
      const tableEnhanced = this.parseEnhancedTable(lines, i);
      if (tableEnhanced) {
        root.children.push(tableEnhanced);
        i += tableEnhanced.children.length + 2; // Skip header, separator, and all rows
        continue;
      }

      // Code block
      if (line.startsWith("```")) {
        const codeBlockMatch = line.match(/^```(\w+)?/);
        if (codeBlockMatch) {
          const [, lang] = codeBlockMatch;
          let codeContent = "";
          let j = i + 1;

          // Collect code content until end marker
          while (j < lines.length && !lines[j].startsWith("```")) {
            codeContent += `${lines[j]}\n`;
            j++;
          }

          const code: Code = {
            type: "code",
            lang: lang || undefined,
            value: codeContent.trim(),
          };

          root.children.push(code);
          i = j < lines.length ? j + 1 : j; // Skip closing ```
          continue;
        }
      }

      // Heading
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const [, hashes, content] = headingMatch;
        const depth = hashes.length as 1 | 2 | 3 | 4 | 5 | 6;
        const heading: Heading = {
          type: "heading",
          depth,
          children: this.parseInlineMarkdown(content).children,
        };
        root.children.push(heading);
        i++;
        continue;
      }

      // List
      const listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
      if (listMatch) {
        const [, indent, marker, content] = listMatch;
        const ordered = /\d+\./.test(marker);

        // Parse the list (including nested items)
        const list: List = {
          type: "list",
          ordered,
          children: [],
        };

        // Process this first list item
        const firstItem: ListItem = {
          type: "listItem",
          children: [this.parseInlineMarkdown(content)],
        };
        list.children.push(firstItem);
        i++;

        // Check for more list items with the same indentation
        while (i < lines.length) {
          const nextLine = lines[i];
          const nextMatch = nextLine.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);

          if (nextMatch && nextMatch[1].length === indent.length) {
            // Same level list item
            const nextItem: ListItem = {
              type: "listItem",
              children: [this.parseInlineMarkdown(nextMatch[3])],
            };
            list.children.push(nextItem);
            i++;
          } else {
            // Not a list item at the same level
            break;
          }
        }

        root.children.push(list);
        continue;
      }

      // Blockquote
      const blockquoteMatch = line.match(/^>\s*(.+)$/);
      if (blockquoteMatch) {
        const [, content] = blockquoteMatch;
        const blockquote: BlockQuote = {
          type: "blockquote",
          children: [this.parseInlineMarkdown(content)],
        };

        // Check for multi-line blockquotes
        i++;
        while (i < lines.length) {
          const nextLine = lines[i];
          const nextMatch = nextLine.match(/^>\s*(.+)$/);

          if (nextMatch) {
            // Continue blockquote
            blockquote.children.push(this.parseInlineMarkdown(nextMatch[1]));
            i++;
          } else if (nextLine.trim() === "") {
            // Empty line might be part of the blockquote
            i++;
          } else {
            // End of blockquote
            break;
          }
        }

        root.children.push(blockquote);
        continue;
      }

      // Thematic break
      const thematicBreakMatch = line.match(/^[-*_]{3,}$/);
      if (thematicBreakMatch) {
        const thematicBreak: ThematicBreak = {
          type: "thematicBreak",
        };
        root.children.push(thematicBreak);
        i++;
        continue;
      }

      // Regular paragraph
      const paragraph: Paragraph = this.parseInlineMarkdown(line);

      // Check for multi-line paragraphs
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];

        if (nextLine.trim() === "") {
          // Empty line ends paragraph
          i++;
          break;
        }

        // Check if next line is a special element
        if (
          nextLine.match(/^(#{1,6}|\s*([-*+]|\d+\.)|\s*>|[-*_]{3,}|```)/) ||
          this.parseBlockImage(nextLine) ||
          this.parseEnhancedTable(lines, i)
        ) {
          break;
        }

        // Continue paragraph
        for (const inlineNode of this.parseInlineMarkdown(nextLine).children) {
          paragraph.children.push(inlineNode);
        }
        i++;
      }

      root.children.push(paragraph);
    }

    return root;
  }

  /**
   * Parse inline markdown formatting
   *
   * @param text The text with inline markdown
   * @returns Paragraph node with inline elements
   */
  private parseInlineMarkdown(text: string): Paragraph {
    const paragraph: Paragraph = {
      type: "paragraph",
      children: [],
    };

    // Create a working copy of the text
    const lastIndex = 0;

    // Process bold text
    this.processRegexPattern(
      paragraph,
      text,
      /\*\*(.*?)\*\*/g,
      (content: string) => ({
        type: "strong",
        children: [{ type: "text", value: content }],
      }),
      lastIndex
    );

    // Process italic text
    this.processRegexPattern(
      paragraph,
      text,
      /\*(.*?)\*/g,
      (content: string) => ({
        type: "emphasis",
        children: [{ type: "text", value: content }],
      }),
      lastIndex
    );

    // Process inline code
    this.processRegexPattern(
      paragraph,
      text,
      /`([^`]+)`/g,
      (content: string) => ({
        type: "inlineCode",
        value: content,
      }),
      lastIndex
    );

    // Process line breaks
    this.processRegexPattern(
      paragraph,
      text,
      /\\\n/g,
      () => ({
        type: "break",
      }),
      lastIndex
    );

    // Process links
    this.processRegexPattern(
      paragraph,
      text,
      /\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g,
      (content: string, url: string, title?: string) => ({
        type: "link",
        url,
        title,
        children: [{ type: "text", value: content }],
      }),
      lastIndex
    );

    // Process inline images
    this.processRegexPattern(
      paragraph,
      text,
      /!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)/g,
      (alt: string, url: string, title?: string) => ({
        type: "inlineImage",
        url,
        alt: alt || undefined,
        title,
      }),
      lastIndex
    );

    // If no inline elements were found, add the whole text as a single node
    if (paragraph.children.length === 0) {
      paragraph.children.push({
        type: "text",
        value: text,
      });
    }

    return paragraph;
  }

  /**
   * Helper method to process regex patterns for inline markdown
   *
   * @param paragraph The paragraph node to add content to
   * @param text The text to process
   * @param regex The regex pattern to match
   * @param createNode Function to create a node from matches
   * @param initialLastIndex Tracking last index for adding text between matches
   */
  private processRegexPattern(
    paragraph: Paragraph,
    text: string,
    regex: RegExp,
    createNode: (...args: string[]) => Inline,
    initialLastIndex: number
  ): void {
    let currentMatch = regex.exec(text);
    let currentLastIndex = initialLastIndex;

    while (currentMatch !== null) {
      const fullMatch = currentMatch[0];
      const matchIndex = currentMatch.index;

      // Add text before the match
      if (matchIndex > currentLastIndex) {
        const textBefore = text.substring(currentLastIndex, matchIndex);
        if (textBefore.trim()) {
          paragraph.children.push({
            type: "text",
            value: textBefore,
          });
        }
      }

      // Create node based on pattern match
      if (regex.toString().includes("\\\\n")) {
        // Line break pattern (no capture groups)
        paragraph.children.push(createNode() as Paragraph["children"][0]);
      } else if (
        regex
          .toString()
          .includes('\\[([^\\]]+)\\]\\(([^)]+)(?:\\s+"([^"]+)")?\\)')
      ) {
        // Link pattern (3 potential capture groups)
        paragraph.children.push(
          createNode(
            currentMatch[1],
            currentMatch[2],
            currentMatch[3]
          ) as Paragraph["children"][0]
        );
      } else if (regex.toString().includes("!\\[")) {
        // Image pattern (3 potential capture groups)
        paragraph.children.push(
          createNode(
            currentMatch[1],
            currentMatch[2],
            currentMatch[3]
          ) as Paragraph["children"][0]
        );
      } else {
        // Other patterns with single capture group (bold, italic, code)
        paragraph.children.push(
          createNode(currentMatch[1]) as Paragraph["children"][0]
        );
      }

      // Update the last index
      currentLastIndex = matchIndex + fullMatch.length;

      // Get next match
      currentMatch = regex.exec(text);
    }

    // Add any remaining text
    if (currentLastIndex < text.length) {
      const remainingContent = text.substring(currentLastIndex);
      if (remainingContent.trim()) {
        paragraph.children.push({
          type: "text",
          value: remainingContent,
        });
      }
    }
  }

  /**
   * Parse block image markdown syntax
   *
   * @param text The text with image markdown
   * @returns Image node if found, null otherwise
   */
  private parseBlockImage(text: string): Image | null {
    const imageMatch = text.match(
      /^!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]+)")?\)$/
    );
    if (!imageMatch) return null;

    const [, alt, url, title] = imageMatch;
    return {
      type: "image",
      url,
      alt: alt || undefined,
      title,
    };
  }

  /**
   * Parse enhanced table from markdown
   *
   * @param lines Array of text lines
   * @param startIndex Starting index in the lines array
   * @returns TableEnhanced node if found, null otherwise
   */
  private parseEnhancedTable(
    lines: string[],
    startIndex: number
  ): TableEnhanced | null {
    if (startIndex + 2 >= lines.length) return null;

    // Parse header
    const headerMatch = lines[startIndex].match(/^\|(.+)\|$/);
    if (!headerMatch) return null;

    // Parse separator (must have at least one | character)
    const separatorMatch = lines[startIndex + 1].match(/^\|(.+)\|$/);
    if (!separatorMatch) return null;

    const separator = separatorMatch[1].split("|").map((s) => s.trim());
    if (!separator.every((s) => /^:?-+:?$/.test(s))) return null;

    // Get header cells
    const headers = headerMatch[1]
      .split("|")
      .map((h) => h.trim())
      .map((h) => ({
        type: "tableCell" as const,
        children: this.parseInlineMarkdown(h).children,
      }));

    // Parse rows
    const rows: TableRow[] = [];
    let i = startIndex + 2;

    while (i < lines.length) {
      const rowMatch = lines[i].match(/^\|(.+)\|$/);
      if (!rowMatch) break;

      const cells: TableCell[] = rowMatch[1]
        .split("|")
        .map((c) => c.trim())
        .map((c) => ({
          type: "tableCell" as const,
          children: this.parseInlineMarkdown(c).children,
        }));

      rows.push({
        type: "tableRow" as const,
        children: cells,
      });
      i++;
    }

    // Create enhanced table
    const table: TableEnhanced = {
      type: "table" as const,
      children: rows,
      header: {
        type: "tableHeader" as const,
        rows: [
          {
            type: "tableRow" as const,
            children: headers,
          },
        ],
      },
    };

    return table;
  }
}
