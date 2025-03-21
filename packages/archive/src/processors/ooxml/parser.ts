/**
 * OOXML parser for Docen
 *
 * This file implements a parser for OOXML files (DOCX, XLSX, PPTX) using the fflate library.
 */

import type {
  Document,
  Metadata,
  Parser,
  ProcessorOptions,
  Root,
  Source,
} from "@docen/core";
import { toArrayBuffer, toUint8Array } from "@docen/core";
import { unzip } from "fflate";

/**
 * OOXML Parser implementation
 */
export class OOXMLParser implements Parser {
  id = "ooxml-parser";
  name = "OOXML Parser";
  supportedInputTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  supportedOutputTypes: string[] = [];
  supportedInputExtensions = ["docx", "xlsx", "pptx"];
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
    extension?: string,
  ): Promise<boolean> {
    // Check if the MIME type or extension is supported
    if (mimeType && this.supportedInputTypes.includes(mimeType)) {
      return true;
    }

    if (extension && this.supportedInputExtensions.includes(extension)) {
      return true;
    }

    // If no hints are provided, try to detect the format
    try {
      // Convert source to Uint8Array for header checking
      const buffer = toArrayBuffer(source);
      const uint8Array = new Uint8Array(buffer);

      // Check for OOXML signature (PK\003\004)
      if (
        uint8Array.length >= 4 &&
        uint8Array[0] === 0x50 && // P
        uint8Array[1] === 0x4b && // K
        uint8Array[2] === 0x03 && // \003
        uint8Array[3] === 0x04 // \004
      ) {
        // This is a ZIP file, but we need to check if it's an OOXML file
        // by looking for specific files inside the archive
        // This would require unzipping, which is expensive for detection
        // So we'll just return true for ZIP files and let the parse method handle it
        return true;
      }
    } catch (error) {
      // If we can't check the header, return false
      return false;
    }

    return false;
  }

  /**
   * Parse OOXML data into a document AST
   *
   * @param source The source data to parse
   * @param options Parsing options
   * @returns Parsed document
   */
  async parse(source: Source, options?: ProcessorOptions): Promise<Document> {
    // Convert source to Uint8Array
    const uint8Array = toUint8Array(source);

    // Create empty document structure
    const document: Document = {
      metadata: {},
      content: {
        type: "root",
        children: [],
      },
    };

    // Extract metadata if requested
    if (options?.extractMetadata) {
      document.metadata = await this.extractMetadata(uint8Array);
    }

    // Parse the OOXML content
    const content = await this.parseContent(uint8Array, options);
    document.content = content;

    return document;
  }

  /**
   * Extract metadata from OOXML file
   *
   * @param data The OOXML file data
   * @returns Extracted metadata
   */
  private async extractMetadata(data: Uint8Array): Promise<Metadata> {
    const metadata: Metadata = {};

    try {
      // Use fflate to unzip the OOXML file
      const files = await this.unzipOOXML(data);

      // Look for core.xml which contains metadata
      const coreXml =
        files["docProps/core.xml"] ||
        files["xl/workbook.xml"] ||
        files["ppt/presentation.xml"];
      if (coreXml) {
        // Parse XML to extract metadata
        const xmlString = new TextDecoder().decode(coreXml);

        // Extract basic metadata from XML
        // This is a simple implementation, a more robust one would use XML parsing
        metadata.title = this.extractXmlValue(xmlString, "dc:title");
        metadata.creator = this.extractXmlValue(xmlString, "dc:creator");
        metadata.description = this.extractXmlValue(
          xmlString,
          "dc:description",
        );
        metadata.lastModifiedBy = this.extractXmlValue(
          xmlString,
          "cp:lastModifiedBy",
        );
        metadata.created = new Date(
          this.extractXmlValue(xmlString, "dcterms:created"),
        );
        metadata.modified = new Date(
          this.extractXmlValue(xmlString, "dcterms:modified"),
        );
      }
    } catch (error) {
      console.error("Error extracting OOXML metadata:", error);
    }

    return metadata;
  }

  /**
   * Parse OOXML content into AST
   *
   * @param data The OOXML file data
   * @param options Parsing options
   * @returns Root node of the AST
   */
  private async parseContent(
    data: Uint8Array,
    options?: ProcessorOptions,
  ): Promise<Root> {
    const root: Root = {
      type: "root",
      children: [],
    };

    try {
      // Use fflate to unzip the OOXML file
      const files = await this.unzipOOXML(data);

      // Determine the type of OOXML file
      if (files["word/document.xml"]) {
        // DOCX file
        await this.parseDocx(files, root, options);
      } else if (files["xl/workbook.xml"]) {
        // XLSX file
        await this.parseXlsx(files, root, options);
      } else if (files["ppt/presentation.xml"]) {
        // PPTX file
        await this.parsePptx(files, root, options);
      }
    } catch (error) {
      console.error("Error parsing OOXML content:", error);
      // Add an error node to the AST
      root.children.push({
        type: "paragraph",
        children: [
          {
            type: "text",
            value: `Error parsing OOXML document: ${error}`,
          },
        ],
      });
    }

    return root;
  }

  /**
   * Unzip OOXML file using fflate
   *
   * @param data The OOXML file data
   * @returns Object containing file contents
   */
  private unzipOOXML(data: Uint8Array): Promise<Record<string, Uint8Array>> {
    return new Promise((resolve, reject) => {
      try {
        // Use fflate to unzip the OOXML file
        unzip(data, (err, files) => {
          if (err) {
            reject(new Error(`Failed to unzip OOXML file: ${err.message}`));
          } else {
            resolve(files);
          }
        });
      } catch (error) {
        reject(new Error(`Error unzipping OOXML file: ${error}`));
      }
    });
  }

  /**
   * Parse DOCX file
   *
   * @param files Unzipped DOCX files
   * @param root Root node to populate
   * @param options Parsing options
   */
  private async parseDocx(
    files: Record<string, Uint8Array>,
    root: Root,
    options?: ProcessorOptions,
  ): Promise<void> {
    // Get the main document.xml file
    const documentXml = files["word/document.xml"];
    if (!documentXml) {
      throw new Error("Invalid DOCX file: missing word/document.xml");
    }

    // Parse XML to extract content
    const xmlString = new TextDecoder().decode(documentXml);

    // This is a simplified implementation
    // A more robust implementation would use proper XML parsing
    // and handle all the complexities of the DOCX format

    // Extract paragraphs
    const paragraphs = this.extractParagraphs(xmlString);
    for (const paragraph of paragraphs) {
      root.children.push({
        type: "paragraph",
        children: [
          {
            type: "text",
            value: paragraph,
          },
        ],
      });
    }
  }

  /**
   * Parse XLSX file
   *
   * @param files Unzipped XLSX files
   * @param root Root node to populate
   * @param options Parsing options
   */
  private async parseXlsx(
    files: Record<string, Uint8Array>,
    root: Root,
    options?: ProcessorOptions,
  ): Promise<void> {
    // Get the workbook.xml file
    const workbookXml = files["xl/workbook.xml"];
    if (!workbookXml) {
      throw new Error("Invalid XLSX file: missing xl/workbook.xml");
    }

    // This is a placeholder implementation
    // A real implementation would parse the sheets and data
    root.children.push({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "XLSX parsing not fully implemented yet",
        },
      ],
    });
  }

  /**
   * Parse PPTX file
   *
   * @param files Unzipped PPTX files
   * @param root Root node to populate
   * @param options Parsing options
   */
  private async parsePptx(
    files: Record<string, Uint8Array>,
    root: Root,
    options?: ProcessorOptions,
  ): Promise<void> {
    // Get the presentation.xml file
    const presentationXml = files["ppt/presentation.xml"];
    if (!presentationXml) {
      throw new Error("Invalid PPTX file: missing ppt/presentation.xml");
    }

    // This is a placeholder implementation
    // A real implementation would parse the slides and content
    root.children.push({
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "PPTX parsing not fully implemented yet",
        },
      ],
    });
  }

  /**
   * Extract paragraphs from DOCX XML
   *
   * @param xml The document.xml content
   * @returns Array of paragraph texts
   */
  private extractParagraphs(xml: string): string[] {
    const paragraphs: string[] = [];
    const regex = /<w:p[^>]*>(.+?)<\/w:p>/g;
    const match = regex.exec(xml);

    while (match !== null) {
      const paragraphXml = match[1];
      // Extract text from paragraph
      const text = this.extractTextFromParagraph(paragraphXml);
      if (text.trim()) {
        paragraphs.push(text);
      }
    }

    return paragraphs;
  }

  /**
   * Extract text from paragraph XML
   *
   * @param paragraphXml The paragraph XML
   * @returns Extracted text
   */
  private extractTextFromParagraph(paragraphXml: string): string {
    let text = "";
    const regex = /<w:t[^>]*>(.+?)<\/w:t>/g;
    const match = regex.exec(paragraphXml);

    while (match !== null) {
      text += match[1];
    }

    return text;
  }

  /**
   * Extract value from XML element
   *
   * @param xml The XML string
   * @param tagName The tag name to extract
   * @returns Extracted value or empty string
   */
  private extractXmlValue(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>(.+?)<\/${tagName}>`);
    const match = xml.match(regex);
    return match ? match[1] : "";
  }
}
