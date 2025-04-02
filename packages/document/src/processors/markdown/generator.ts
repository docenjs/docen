/**
 * Markdown generator for Docen
 *
 * This file implements a generator for Markdown documents.
 * It converts Docen AST structure into Markdown syntax.
 */

import type {
  BlockQuote,
  Code,
  ConversionResult,
  Document,
  DocumentContent,
  Emphasis,
  Generator,
  Heading,
  Image,
  InlineCode,
  InlineImage,
  LineBreak,
  Link,
  List,
  ListItem,
  Node,
  Paragraph,
  ProcessorOptions,
  Root,
  Strong,
  Table,
  TableEnhanced,
  TableRow,
  Text,
  ThematicBreak,
} from "@docen/core";
import { createProcessorError } from "@docen/core";

/**
 * Markdown Generator implementation
 */
export class MarkdownGenerator implements Generator {
  id = "markdown-generator";
  name = "Markdown Generator";
  supportedInputTypes: string[] = [];
  supportedOutputTypes = ["text/markdown", "text/plain"];
  supportedInputExtensions: string[] = [];
  supportedOutputExtensions = ["md", "markdown"];

  /**
   * Check if this generator can produce the requested output format
   *
   * @param mimeType Target MIME type
   * @param extension Target file extension
   * @returns True if this generator can produce the requested format
   */
  canGenerate(mimeType?: string, extension?: string): boolean {
    if (mimeType && this.supportedOutputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedOutputExtensions.includes(extension)) {
      return true;
    }

    return false;
  }

  /**
   * Generate Markdown output from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated Markdown content
   */
  async generate(
    document: Document,
    options?: ProcessorOptions
  ): Promise<ConversionResult> {
    try {
      let markdown = "";

      // Add YAML frontmatter if metadata exists and has content
      if (
        document.metadata &&
        Object.keys(document.metadata).length > 0 &&
        options?.includeFrontmatter !== false
      ) {
        markdown += "---\n";
        for (const [key, value] of Object.entries(document.metadata)) {
          // Skip internal metadata that shouldn't be exposed
          if (key.startsWith("_")) continue;

          // Format the value based on its type
          let formattedValue = value;
          if (typeof value === "string") {
            // Check if the string needs quotes (contains special characters)
            if (
              value.includes("\n") ||
              value.includes(":") ||
              value.includes("'") ||
              value.includes('"')
            ) {
              formattedValue = `"${value.replace(/"/g, '\\"')}"`;
            }
          }

          markdown += `${key}: ${formattedValue}\n`;
        }
        markdown += "---\n\n";
      }

      // Generate markdown from content
      if (document.content) {
        markdown += this.convertNodeToMarkdown(document.content);
      }

      return {
        content: markdown,
        mimeType: "text/markdown",
        extension: "md",
      };
    } catch (error) {
      throw createProcessorError(
        "Failed to generate Markdown document",
        this.id,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Generate output for a specific node type
   *
   * @param node The node to generate from
   * @param options Generation options
   * @returns Generated content for the node, or null if the node type is not supported
   */
  async generateFromNode(
    node: DocumentContent,
    options?: ProcessorOptions
  ): Promise<ConversionResult | null> {
    try {
      // Check if this is a node type we can handle
      if (!this.isDocumentNode(node)) {
        return null;
      }

      const markdown = this.convertNodeToMarkdown(node);

      return {
        content: markdown,
        mimeType: "text/markdown",
        extension: "md",
      };
    } catch (error) {
      console.error("Error generating markdown from node:", error);
      return null;
    }
  }

  /**
   * Check if a node is a document node that we can process
   */
  private isDocumentNode(node: unknown): boolean {
    if (!node || typeof node !== "object" || node === null) {
      return false;
    }

    const nodeObj = node as { type?: string };
    if (!nodeObj.type) {
      return false;
    }

    const supportedTypes = [
      "root",
      "heading",
      "paragraph",
      "text",
      "emphasis",
      "strong",
      "inlineCode",
      "break",
      "list",
      "listItem",
      "table",
      "image",
      "inlineImage",
      "link",
      "code",
      "blockquote",
      "thematicBreak",
    ];

    return supportedTypes.includes(nodeObj.type);
  }

  /**
   * Convert a node to markdown
   *
   * @param node The node to convert
   * @returns Generated markdown
   */
  private convertNodeToMarkdown(node: Node): string {
    if (!node) return "";

    switch (node.type) {
      case "root":
        return this.generateFromRoot(node as Root);
      case "heading":
        return this.generateFromHeading(node as Heading);
      case "paragraph":
        return this.generateFromParagraph(node as Paragraph);
      case "text":
        return this.generateFromText(node as Text);
      case "emphasis":
        return this.generateFromEmphasis(node as Emphasis);
      case "strong":
        return this.generateFromStrong(node as Strong);
      case "inlineCode":
        return this.generateFromInlineCode(node as InlineCode);
      case "break":
        return this.generateFromLineBreak(node as LineBreak);
      case "list":
        return this.generateFromList(node as List);
      case "listItem":
        return this.generateFromListItem(node as ListItem);
      case "table":
        return "header" in node
          ? this.generateFromEnhancedTable(node as TableEnhanced)
          : this.generateFromTable(node as Table);
      case "image":
        return this.generateFromImage(node as Image);
      case "inlineImage":
        return this.generateFromInlineImage(node as InlineImage);
      case "link":
        return this.generateFromLink(node as Link);
      case "code":
        return this.generateFromCode(node as Code);
      case "blockquote":
        return this.generateFromBlockquote(node as BlockQuote);
      case "thematicBreak":
        return this.generateFromThematicBreak(node as ThematicBreak);
      default:
        // Unknown node type, return empty string
        return "";
    }
  }

  /**
   * Generate markdown from root node
   *
   * @param root The root node
   * @returns Generated markdown
   */
  private generateFromRoot(root: Root): string {
    if (!root.children || root.children.length === 0) {
      return "";
    }

    return root.children
      .map((node) => this.convertNodeToMarkdown(node))
      .join("\n\n");
  }

  /**
   * Generate markdown from heading node
   *
   * @param heading The heading node
   * @returns Generated markdown
   */
  private generateFromHeading(heading: Heading): string {
    const level = heading.depth || 1;
    const prefix = "#".repeat(level);
    const text =
      heading.children
        ?.map((node) => this.convertNodeToMarkdown(node))
        .join("") || "";

    return `${prefix} ${text}`;
  }

  /**
   * Generate markdown from paragraph node
   *
   * @param paragraph The paragraph node
   * @returns Generated markdown
   */
  private generateFromParagraph(paragraph: Paragraph): string {
    if (!paragraph.children || paragraph.children.length === 0) {
      return "";
    }

    return paragraph.children
      .map((node) => this.convertNodeToMarkdown(node))
      .join("");
  }

  /**
   * Generate markdown from text node
   *
   * @param text The text node
   * @returns Generated markdown
   */
  private generateFromText(text: Text): string {
    return text.value || "";
  }

  /**
   * Generate markdown from emphasis (italic) node
   *
   * @param emphasis The emphasis node
   * @returns Generated markdown
   */
  private generateFromEmphasis(emphasis: Emphasis): string {
    if (!emphasis.children || emphasis.children.length === 0) {
      return "";
    }

    const content = emphasis.children
      .map((node) => this.convertNodeToMarkdown(node))
      .join("");

    return `*${content}*`;
  }

  /**
   * Generate markdown from strong (bold) node
   *
   * @param strong The strong node
   * @returns Generated markdown
   */
  private generateFromStrong(strong: Strong): string {
    if (!strong.children || strong.children.length === 0) {
      return "";
    }

    const content = strong.children
      .map((node) => this.convertNodeToMarkdown(node))
      .join("");

    return `**${content}**`;
  }

  /**
   * Generate markdown from inline code node
   *
   * @param inlineCode The inline code node
   * @returns Generated markdown
   */
  private generateFromInlineCode(inlineCode: InlineCode): string {
    return `\`${inlineCode.value || ""}\``;
  }

  /**
   * Generate markdown from line break node
   *
   * @param lineBreak The line break node
   * @returns Generated markdown
   */
  private generateFromLineBreak(lineBreak: LineBreak): string {
    return "\\\n";
  }

  /**
   * Generate markdown from list node
   *
   * @param list The list node
   * @returns Generated markdown
   */
  private generateFromList(list: List): string {
    if (!list.children || list.children.length === 0) {
      return "";
    }

    return list.children
      .map((node, index) => {
        const prefix = list.ordered ? `${index + 1}. ` : "- ";
        const content = this.convertNodeToMarkdown(node);
        // Remove the leading "- " or "1. " from list items as we'll add our own
        const cleanedContent = content.replace(/^(- |[0-9]+\. )/, "");

        // Handle multi-line list items by adding proper indentation
        return prefix + cleanedContent.replace(/\n/g, "\n  ");
      })
      .join("\n");
  }

  /**
   * Generate markdown from list item node
   *
   * @param listItem The list item node
   * @returns Generated markdown
   */
  private generateFromListItem(listItem: ListItem): string {
    if (!listItem.children || listItem.children.length === 0) {
      return "";
    }

    return listItem.children
      .map((node) => this.convertNodeToMarkdown(node))
      .join("\n");
  }

  /**
   * Generate markdown from table node
   *
   * @param table The table node
   * @returns Generated markdown
   */
  private generateFromTable(table: Table): string {
    if (!table.children || table.children.length === 0) {
      return "";
    }

    // Extract all rows
    const rows = table.children;

    // Ensure there's at least a header row
    if (rows.length === 0) {
      return "";
    }

    // Get the maximum number of columns based on all rows
    const maxColumns = Math.max(
      ...rows.map((row) =>
        row.type === "tableRow" ? row.children?.length || 0 : 0
      )
    );

    // Generate header row
    const headerRow = rows[0];
    let markdown = this.generateTableRow(headerRow, maxColumns);

    // Generate separator row
    markdown += `\n|${"---|".repeat(maxColumns)}`;

    // Generate data rows
    for (let i = 1; i < rows.length; i++) {
      markdown += `\n${this.generateTableRow(rows[i], maxColumns)}`;
    }

    return markdown;
  }

  /**
   * Generate a table row
   *
   * @param row The table row node
   * @param columns The number of columns
   * @returns Generated markdown for the row
   */
  private generateTableRow(row: TableRow, columns: number): string {
    if (row.type !== "tableRow" || !row.children) {
      return `|${" |".repeat(columns)}`;
    }

    let markdown = "|";

    // Add cells
    for (let i = 0; i < columns; i++) {
      const cell = row.children[i];
      if (cell && cell.type === "tableCell") {
        const cellContent =
          cell.children
            ?.map((node) => this.convertNodeToMarkdown(node))
            .join("") || "";
        markdown += ` ${cellContent} |`;
      } else {
        markdown += " |";
      }
    }

    return markdown;
  }

  /**
   * Generate markdown from image node
   *
   * @param image The image node
   * @returns Generated markdown
   */
  private generateFromImage(image: Image): string {
    const alt = image.alt || "";
    const url = image.url || "";
    const title = image.title ? ` "${image.title}"` : "";

    return `![${alt}](${url}${title})`;
  }

  /**
   * Generate markdown from inline image node
   *
   * @param inlineImage The inline image node
   * @returns Generated markdown
   */
  private generateFromInlineImage(inlineImage: InlineImage): string {
    const alt = inlineImage.alt || "";
    const url = inlineImage.url || "";
    const title = inlineImage.title ? ` "${inlineImage.title}"` : "";

    return `![${alt}](${url}${title})`;
  }

  /**
   * Generate markdown from link node
   *
   * @param link The link node
   * @returns Generated markdown
   */
  private generateFromLink(link: Link): string {
    const text =
      link.children?.map((node) => this.convertNodeToMarkdown(node)).join("") ||
      "";
    const url = link.url || "";
    const title = link.title ? ` "${link.title}"` : "";

    return `[${text}](${url}${title})`;
  }

  /**
   * Generate markdown from code node
   *
   * @param code The code node
   * @returns Generated markdown
   */
  private generateFromCode(code: Code): string {
    const language = code.lang || "";
    const value = code.value || "";

    return `\`\`\`${language}\n${value}\n\`\`\``;
  }

  /**
   * Generate markdown from blockquote node
   *
   * @param blockquote The blockquote node
   * @returns Generated markdown
   */
  private generateFromBlockquote(blockquote: BlockQuote): string {
    if (!blockquote.children || blockquote.children.length === 0) {
      return "";
    }

    const content = blockquote.children
      .map((node) => this.convertNodeToMarkdown(node))
      .join("\n\n");

    // Add > prefix to each line
    return content
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  }

  /**
   * Generate markdown from thematic break node
   *
   * @param thematicBreak The thematic break node
   * @returns Generated markdown
   */
  private generateFromThematicBreak(thematicBreak: ThematicBreak): string {
    return "---";
  }

  /**
   * Generate markdown from enhanced table node
   *
   * @param table The enhanced table node
   * @returns Generated markdown
   */
  private generateFromEnhancedTable(table: TableEnhanced): string {
    if (!table.children || table.children.length === 0) {
      return "";
    }

    // Prepare all rows (including header rows and body rows)
    const allRows: TableRow[] = [];

    // Add header rows if available
    if (table.header?.rows && table.header.rows.length > 0) {
      allRows.push(...table.header.rows);
    }

    // Add body rows
    allRows.push(...table.children);

    // Ensure there's at least one row
    if (allRows.length === 0) {
      return "";
    }

    // Get the maximum number of columns based on all rows
    const maxColumns = Math.max(
      ...allRows.map((row) =>
        row.type === "tableRow" ? row.children?.length || 0 : 0
      )
    );

    // Generate header row (first row)
    const headerRow = allRows[0];
    let markdown = this.generateTableRow(headerRow, maxColumns);

    // Generate separator row
    markdown += `\n|${"---|".repeat(maxColumns)}`;

    // Generate remaining rows
    for (let i = 1; i < allRows.length; i++) {
      markdown += `\n${this.generateTableRow(allRows[i], maxColumns)}`;
    }

    // Add table metadata as HTML comments if available
    if (table.style || table.theme) {
      markdown += "\n\n<!-- Table Properties:";

      if (table.style) {
        markdown += `\nStyle: ${JSON.stringify(table.style)}`;
      }

      if (table.theme) {
        markdown += `\nTheme: ${JSON.stringify({
          name: table.theme.name,
          type: table.theme.type,
        })}`;
      }

      markdown += "\n-->";
    }

    return markdown;
  }
}
