/**
 * XML parser for Docen
 *
 * This file implements a parser for XML files.
 */

import type {
  Document,
  Parser,
  ProcessorOptions,
  Source,
  Table,
  TableRow,
} from "@docen/core";

/**
 * XML Parser options
 */
export interface XMLParserOptions extends ProcessorOptions {
  /** Whether to preserve comments (default: false) */
  preserveComments?: boolean;
  /** Whether to preserve attributes (default: true) */
  preserveAttributes?: boolean;
  /** Whether to convert primitive values (default: true) */
  convertPrimitives?: boolean;
}

/**
 * XML Parser implementation
 */
export class XMLParser implements Parser {
  id = "xml-parser";
  name = "XML Parser";
  supportedInputTypes = ["text/xml", "application/xml"];
  supportedInputExtensions = ["xml"];
  supportedOutputTypes: string[] = [];
  supportedOutputExtensions: string[] = [];

  /**
   * Check if this parser can handle the given source
   */
  async canParse(
    source: Source,
    mimeType?: string,
    extension?: string,
  ): Promise<boolean> {
    // Check MIME type first
    if (mimeType && this.supportedInputTypes.includes(mimeType)) {
      return true;
    }

    // Then check file extension
    if (extension && this.supportedInputExtensions.includes(extension)) {
      return true;
    }

    // Finally check content if available
    if (source) {
      const content =
        source instanceof Uint8Array
          ? new TextDecoder().decode(source)
          : String(source);
      return content.trim().startsWith("<?xml");
    }

    return false;
  }

  /**
   * Parse XML string into DOM Document
   */
  private parseXMLString(content: string): XMLDocument {
    if (typeof window === "undefined") {
      throw new Error("XML parsing is only supported in browser environments");
    }
    const parser = new DOMParser();
    return parser.parseFromString(content, "text/xml");
  }

  /**
   * Parse XML content into document AST
   */
  async parse(source: Source): Promise<Document> {
    try {
      const content =
        source instanceof Uint8Array
          ? new TextDecoder().decode(source)
          : String(source);
      const xmlDoc = this.parseXMLString(content);

      return {
        content: {
          type: "root",
          children: [
            {
              type: "table",
              children: this.convertXMLToNodes(xmlDoc.documentElement),
            },
          ],
        },
        metadata: {
          encoding: xmlDoc.characterSet,
        },
      };
    } catch (error) {
      console.error("Error parsing XML:", error);
      throw new Error(`Failed to parse XML: ${error}`);
    }
  }

  /**
   * Convert XML nodes to document AST nodes
   */
  private convertXMLToNodes(element: Element): TableRow[] {
    const rows: TableRow[] = [];

    // Create a row for the element
    rows.push({
      type: "tableRow",
      children: [
        {
          type: "tableCell",
          children: [{ type: "text", value: element.tagName }],
        },
        {
          type: "tableCell",
          children: [{ type: "text", value: element.textContent || "" }],
        },
      ],
    });

    // Process child elements
    for (const child of Array.from(element.children)) {
      rows.push(...this.convertXMLToNodes(child));
    }

    return rows;
  }

  /**
   * Parse XML content into a data structure
   *
   * @param text The XML text to parse
   * @param options Parsing options
   * @returns Parsed data structure
   */
  private parseXML(
    text: string,
    options: {
      preserveComments: boolean;
      preserveAttributes: boolean;
      convertPrimitives: boolean;
    },
  ): unknown {
    const { preserveComments, preserveAttributes, convertPrimitives } = options;

    // Remove XML declaration and comments if not preserving them
    let processedText = text.replace(/<\?xml[^>]*\?>\s*/, "");
    if (!preserveComments) {
      processedText = processedText.replace(/<!--[\s\S]*?-->/g, "");
    }

    // Parse XML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(processedText, "text/xml");

    // Convert DOM to data structure
    return this.domToData(doc.documentElement, {
      preserveComments,
      preserveAttributes,
      convertPrimitives,
    });
  }

  /**
   * Convert DOM node to data structure
   *
   * @param node The DOM node to convert
   * @param options Conversion options
   * @returns Converted data structure
   */
  private domToData(
    node: Element,
    options: {
      preserveComments: boolean;
      preserveAttributes: boolean;
      convertPrimitives: boolean;
    },
  ): unknown {
    const { preserveAttributes, convertPrimitives } = options;

    // Handle text nodes
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || "";
      if (convertPrimitives) {
        return this.convertPrimitiveValue(text);
      }
      return text;
    }

    // Handle element nodes
    if (node.nodeType === Node.ELEMENT_NODE) {
      const result: Record<string, unknown> = {};

      // Add attributes if preserving them
      if (preserveAttributes && node.attributes.length > 0) {
        const attrs: Record<string, string> = {};
        for (const attr of node.attributes) {
          attrs[attr.name] = attr.value;
        }
        result["@attributes"] = attrs;
      }

      // Add child nodes
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent?.trim() || "";
          if (text) {
            result["#text"] = text;
          }
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const childData = this.domToData(child as Element, options);
          const childName = (child as Element).tagName;

          if (Array.isArray(result[childName])) {
            (result[childName] as unknown[]).push(childData);
          } else if (result[childName]) {
            result[childName] = [result[childName], childData];
          } else {
            result[childName] = childData;
          }
        }
      }

      return result;
    }

    return null;
  }

  /**
   * Convert primitive value string to appropriate type
   *
   * @param value The value string to convert
   * @returns Converted value
   */
  private convertPrimitiveValue(value: string): unknown {
    // Handle null
    if (value === "null") {
      return null;
    }

    // Handle undefined
    if (value === "undefined") {
      return undefined;
    }

    // Handle numbers
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num;
    }

    // Handle booleans
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }

    // Return as string if no conversion possible
    return value;
  }

  /**
   * Convert data structure to table nodes
   *
   * @param data The data structure to convert
   * @returns Array of table nodes
   */
  private dataToTable(data: unknown): Table[] {
    const tables: Table[] = [];

    if (typeof data === "object" && data !== null) {
      const entries = Object.entries(data as Record<string, unknown>);
      if (entries.length > 0) {
        const table: Table = {
          type: "table",
          children: [],
        };

        // Add header row
        const headerRow: TableRow = {
          type: "tableRow",
          children: entries.map(([key]) => ({
            type: "tableCell",
            children: [{ type: "text", value: key }],
          })),
        };
        table.children.push(headerRow);

        // Add data row
        const dataRow: TableRow = {
          type: "tableRow",
          children: entries.map(([, value]) => ({
            type: "tableCell",
            children: [{ type: "text", value: String(value) }],
          })),
        };
        table.children.push(dataRow);

        tables.push(table);
      }
    }

    return tables;
  }
}
