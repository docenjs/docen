/**
 * Markdown parser for Docen
 *
 * This file implements a parser for Markdown documents.
 * It parses Markdown syntax into the Docen AST structure.
 */

import type {
  BlockQuote,
  Chart,
  Code,
  Document,
  Equation,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Metadata,
  Paragraph,
  Parser,
  ProcessorOptions,
  Root,
  Source,
  Table,
  TableCell,
  TableEnhanced,
  TableRow,
  Text,
  ThematicBreak,
} from "@docen/core";
import { toText } from "@docen/core";

/**
 * Markdown Parser implementation
 */
export class MarkdownParser implements Parser {
  id = "markdown-parser";
  name = "Markdown Parser";
  supportedInputTypes = ["text/markdown", "text/plain"];
  supportedOutputTypes: string[] = [];
  supportedInputExtensions = ["md", "markdown", "txt"];
  supportedOutputExtensions: string[] = [];

  /**
   * Check if this parser can handle the given source
   *
   * @param source The source to check
   * @param mimeType Optional MIME type hint
   * @param extension Optional file extension hint
   * @returns True if this parser can handle the source
   */
  async canParse(
    source: Source,
    mimeType?: string,
    extension?: string
  ): Promise<boolean> {
    // Check if the MIME type or extension is supported
    if (mimeType && this.supportedInputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedInputExtensions.includes(extension)) {
      return true;
    }

    // If no hints are provided, try to detect if it's markdown
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
      // If we can't check the content, return false
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

    try {
      // Extract metadata if present (YAML frontmatter)
      if (options?.extractMetadata !== false) {
        document.metadata = this.extractMetadata(text);
      }

      // Parse the content
      document.content = this.parseContent(text);
    } catch (error) {
      console.error("Failed to parse Markdown document:", error);
      // Return empty document if parsing fails
      document.content = {
        type: "root",
        children: [],
      };
    }

    return document;
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

      // Math block
      const mathBlockMatch = line.match(/^\$\$\s*(.+)\s*\$\$$/);
      if (mathBlockMatch) {
        const [, content] = mathBlockMatch;
        const equation: Equation = {
          type: "equation",
          content: content.trim(),
          format: "latex",
        };
        root.children.push(equation);
        i++;
        continue;
      }

      // Inline math
      const mathInlineMatch = line.match(/\$([^$]+)\$/g);
      if (mathInlineMatch) {
        const equation: Equation = {
          type: "equation",
          content: mathInlineMatch[0].replace(/\$/g, "").trim(),
          format: "latex",
        };
        root.children.push(equation);
        i++;
        continue;
      }

      // Chart
      const chartMatch = line.match(/^```chart\s*(\w+)\s*(\{[\s\S]*?\})$/);
      if (chartMatch) {
        const [, chartType, data] = chartMatch;
        const chartData = JSON.parse(data);
        const chart: Chart = {
          type: "chart",
          chartType,
          data: chartData,
        };

        root.children.push(chart);
        i++;
        continue;
      }

      // Enhanced table
      const tableMatch = line.match(/^\|(.+)\|$/);
      if (tableMatch) {
        const table = this.parseEnhancedTable(lines, i);
        if (table) {
          root.children.push(table);
          i += table.children.length + 2; // Skip header and separator
          continue;
        }
      }

      // Heading
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        const [, marks, content] = headingMatch;
        const heading: Heading = {
          type: "heading",
          depth: marks.length as 1 | 2 | 3 | 4 | 5 | 6,
          children: [
            {
              type: "text",
              value: content.trim(),
            } as Text,
          ],
        };
        root.children.push(heading);
        i++;
        continue;
      }

      // Horizontal rule
      if (/^-{3,}$|^_{3,}$|^\*{3,}$/.test(line.trim())) {
        const rule: ThematicBreak = { type: "thematicBreak" };
        root.children.push(rule);
        i++;
        continue;
      }

      // Code block
      if (line.startsWith("```")) {
        const language = line.slice(3).trim();
        const codeLines = [];
        i++;

        while (i < lines.length && !lines[i].startsWith("```")) {
          codeLines.push(lines[i]);
          i++;
        }

        const code: Code = {
          type: "code",
          lang: language || undefined,
          value: codeLines.join("\n"),
        };

        root.children.push(code);
        i++; // Skip the closing ```
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        const quoteLines = [];
        while (i < lines.length && lines[i].startsWith("> ")) {
          quoteLines.push(lines[i].slice(2));
          i++;
        }

        const blockquote: BlockQuote = {
          type: "blockquote",
          children: [
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: quoteLines.join("\n"),
                } as Text,
              ],
            } as Paragraph,
          ],
        };

        root.children.push(blockquote);
        continue;
      }

      // Unordered list
      if (/^[*+-]\s/.test(line)) {
        const list: List = {
          type: "list",
          ordered: false,
          children: [],
        };

        while (i < lines.length && /^[*+-]\s/.test(lines[i])) {
          const itemContent = lines[i].replace(/^[*+-]\s/, "");
          const listItem: ListItem = {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    value: itemContent,
                  } as Text,
                ],
              } as Paragraph,
            ],
          };

          list.children.push(listItem);
          i++;
        }

        root.children.push(list);
        continue;
      }

      // Ordered list
      if (/^\d+\.\s/.test(line)) {
        const list: List = {
          type: "list",
          ordered: true,
          children: [],
        };

        while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
          const itemContent = lines[i].replace(/^\d+\.\s/, "");
          const listItem: ListItem = {
            type: "listItem",
            children: [
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    value: itemContent,
                  } as Text,
                ],
              } as Paragraph,
            ],
          };

          list.children.push(listItem);
          i++;
        }

        root.children.push(list);
        continue;
      }

      // Table
      if (
        line.includes("|") &&
        i < lines.length - 1 &&
        lines[i + 1].includes("|") &&
        lines[i + 1].replace(/[^|\-]/g, "") === lines[i + 1]
      ) {
        // Table header found
        const headerRow = this.parseTableRow(line);
        i += 2; // Skip the header and separator rows

        const table: Table = {
          type: "table",
          children: [
            {
              type: "tableRow",
              children: headerRow.map(
                (header) =>
                  ({
                    type: "tableCell",
                    children: [
                      {
                        type: "text",
                        value: header.trim(),
                      } as Text,
                    ],
                  }) as TableCell
              ),
            } as TableRow,
          ],
        };

        // Parse table rows
        while (i < lines.length && lines[i].includes("|")) {
          const rowCells = this.parseTableRow(lines[i]);

          const tableRow: TableRow = {
            type: "tableRow",
            children: rowCells.map(
              (cell) =>
                ({
                  type: "tableCell",
                  children: [
                    {
                      type: "text",
                      value: cell.trim(),
                    } as Text,
                  ],
                }) as TableCell
            ),
          };

          table.children.push(tableRow);
          i++;
        }

        root.children.push(table);
        continue;
      }

      // Image
      const imageMatch = line.match(/!\[(.*)\]\((.*?)(?:\s+"(.*)")?\)/);
      if (imageMatch) {
        const [, alt, url, title] = imageMatch;
        const image: Image = {
          type: "image",
          url,
          alt: alt || undefined,
          title: title || undefined,
        };

        root.children.push(image);
        i++;
        continue;
      }

      // Link (standalone in a line)
      const linkMatch = line.match(/^\[(.*)\]\((.*?)(?:\s+"(.*)")?\)$/);
      if (linkMatch) {
        const [, text, url, title] = linkMatch;
        const link: Link = {
          type: "link",
          url,
          title: title || undefined,
          children: [
            {
              type: "text",
              value: text,
            } as Text,
          ],
        };

        root.children.push(link);
        i++;
        continue;
      }

      // Regular paragraph
      let paragraphText = line;
      i++;

      // Collect all lines that belong to the same paragraph
      while (
        i < lines.length &&
        lines[i].trim() !== "" &&
        !lines[i].startsWith("#") &&
        !lines[i].startsWith("```") &&
        !lines[i].startsWith("> ") &&
        !/^[*+-]\s/.test(lines[i]) &&
        !/^\d+\.\s/.test(lines[i]) &&
        !/^-{3,}$|^_{3,}$|^\*{3,}$/.test(lines[i].trim())
      ) {
        paragraphText += `\n${lines[i]}`;
        i++;
      }

      // Parse paragraph text for inline elements
      const paragraphContent = this.parseInlineMarkdown(paragraphText);
      root.children.push(paragraphContent);
    }

    return root;
  }

  /**
   * Parse a table row into an array of cell values
   *
   * @param row The markdown table row
   * @returns Array of cell values
   */
  private parseTableRow(row: string): string[] {
    // Split the row into cells and remove empty first/last cells
    return row
      .split("|")
      .map((cell) => cell.trim())
      .filter((_, i, arr) => i !== 0 || arr[i] !== "")
      .filter((_, i, arr) => i !== arr.length - 1 || arr[i] !== "");
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
    let lastIndex = 0;

    // Regular expression to match links [text](url "title")
    const linkRegex = /\[(.*?)\]\((.*?)(?:\s+"(.*?)")?\)/g;

    // Process all links - first get the match
    let match = linkRegex.exec(text);
    while (match !== null) {
      const [fullMatch, linkText, url, title] = match;
      const matchIndex = match.index;

      // Add text before the link as a text node
      if (matchIndex > lastIndex) {
        const textBefore = text.substring(lastIndex, matchIndex);
        if (textBefore.trim()) {
          paragraph.children.push({
            type: "text",
            value: textBefore,
          } as Text);
        }
      }

      // Add the link
      const link: Link = {
        type: "link",
        url,
        title: title || undefined,
        children: [
          {
            type: "text",
            value: linkText,
          } as Text,
        ],
      };

      paragraph.children.push(link);

      // Update the last index
      lastIndex = matchIndex + fullMatch.length;

      // Get next match
      match = linkRegex.exec(text);
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      const remainingContent = text.substring(lastIndex);
      if (remainingContent.trim()) {
        paragraph.children.push({
          type: "text",
          value: remainingContent,
        } as Text);
      }
    }

    // If no inline elements were found, add the whole text as a single node
    if (paragraph.children.length === 0) {
      paragraph.children.push({
        type: "text",
        value: text,
      } as Text);
    }

    return paragraph;
  }

  private parseEnhancedTable(
    lines: string[],
    startIndex: number
  ): TableEnhanced | null {
    // Parse header
    const headerMatch = lines[startIndex].match(/^\|(.+)\|$/);
    if (!headerMatch) return null;

    const headers = headerMatch[1].split("|").map((h) => h.trim());

    // Parse separator
    const separatorMatch = lines[startIndex + 1].match(/^\|(.+)\|$/);
    if (!separatorMatch) return null;

    const separator = separatorMatch[1].split("|").map((s) => s.trim());
    if (!separator.every((s) => /^-+$/.test(s))) return null;

    // Parse rows
    const rows: TableRow[] = [];
    let i = startIndex + 2;

    while (i < lines.length) {
      const rowMatch = lines[i].match(/^\|(.+)\|$/);
      if (!rowMatch) break;

      const cells: TableCell[] = rowMatch[1].split("|").map((c) => ({
        type: "tableCell" as const,
        children: [{ type: "text" as const, value: c.trim() }],
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
            children: headers.map((h) => ({
              type: "tableCell" as const,
              children: [{ type: "text" as const, value: h }],
            })),
          },
        ],
      },
    };

    return table;
  }
}
