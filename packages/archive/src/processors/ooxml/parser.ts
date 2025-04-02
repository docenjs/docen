/**
 * OOXML parser for Docen
 *
 * This file implements a parser for OOXML files (DOCX, XLSX, PPTX) using the fflate library.
 */

import type {
  ContainerEntry,
  Document,
  Metadata,
  Node,
  OOXMLContainer,
  OOXMLCoreProperties,
  Parser,
  ProcessorOptions,
  Root,
  Source,
} from "@docen/core";
import { UnsupportedNodeHandling, toUint8Array } from "@docen/core";
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
   * Handle unsupported nodes with a default strategy
   */
  handleUnsupportedNode(node: Node): UnsupportedNodeHandling {
    return UnsupportedNodeHandling.KEEP_AS_IS;
  }

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

    // If no hints are provided, try to detect the format
    try {
      // Convert source to Uint8Array for header checking
      const uint8Array = toUint8Array(source);

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

    // Create empty document structure with OOXMLContainer root
    const ooxmlContainer: OOXMLContainer & Pick<Root, "children"> = {
      type: "ooxmlContainer",
      ooxmlType: "wordprocessingml", // Default, will be updated during parsing
      format: "ooxml",
      entries: [],
      relationships: [],
      contentTypes: {},
      children: [],
    };

    const document: Document = {
      metadata: {},
      content: ooxmlContainer as unknown as Root,
    };

    try {
      // Use fflate to unzip the OOXML file
      const files = await this.unzipOOXML(uint8Array);

      // Populate entries
      ooxmlContainer.entries = this.createContainerEntries(files);

      // Determine OOXML type and update container
      if (files["word/document.xml"]) {
        ooxmlContainer.ooxmlType = "wordprocessingml";
        ooxmlContainer.content = [];
        await this.parseDocx(files, ooxmlContainer, options);
      } else if (files["xl/workbook.xml"]) {
        ooxmlContainer.ooxmlType = "spreadsheetml";
        ooxmlContainer.content = [];
        await this.parseXlsx(files, ooxmlContainer, options);
      } else if (files["ppt/presentation.xml"]) {
        ooxmlContainer.ooxmlType = "presentationml";
        ooxmlContainer.content = [];
        await this.parsePptx(files, ooxmlContainer, options);
      }

      // Extract metadata if requested
      if (options?.extractMetadata) {
        const coreProperties = await this.extractCoreProperties(files);
        ooxmlContainer.coreProperties = coreProperties;
        document.metadata = this.mapCorePropertiesToMetadata(coreProperties);
      }

      // Parse content types and relationships
      this.parseContentTypes(files, ooxmlContainer);
      this.parseRelationships(files, ooxmlContainer);
    } catch (error) {
      console.error("Error parsing OOXML document:", error);
      // Add an error node to the container
      if (ooxmlContainer.content && Array.isArray(ooxmlContainer.content)) {
        ooxmlContainer.content.push({
          type: "paragraph",
          children: [
            {
              type: "text",
              value: `Error parsing OOXML document: ${error}`,
            },
          ],
        });
      }
    }

    return document;
  }

  /**
   * Create container entries from unzipped files
   *
   * @param files Unzipped files
   * @returns Container entries
   */
  private createContainerEntries(
    files: Record<string, Uint8Array>
  ): ContainerEntry[] {
    const entries: ContainerEntry[] = [];
    const directories = new Set<string>();

    // First, identify all directories
    for (const path in files) {
      let currentPath = "";
      const segments = path.split("/");

      // Add all directory segments to the set
      for (let i = 0; i < segments.length - 1; i++) {
        currentPath += `${segments[i]}/`;
        directories.add(currentPath);
      }
    }

    // Create directory entries
    for (const dir of directories) {
      entries.push({
        name:
          dir
            .split("/")
            .filter((s) => s)
            .pop() || "",
        path: dir,
        type: "directory",
        children: [],
      });
    }

    // Create file entries
    for (const path in files) {
      entries.push({
        name: path.split("/").pop() || "",
        path,
        type: "file",
        size: files[path].length,
        contentType: this.inferContentType(path),
      });
    }

    return entries;
  }

  /**
   * Infer content type based on file extension
   */
  private inferContentType(path: string): string {
    const ext = path.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "xml":
        return "application/xml";
      case "rels":
        return "application/vnd.openxmlformats-package.relationships+xml";
      case "png":
        return "image/png";
      case "jpeg":
      case "jpg":
        return "image/jpeg";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Parse content types from [Content_Types].xml
   */
  private parseContentTypes(
    files: Record<string, Uint8Array>,
    container: OOXMLContainer
  ): void {
    const contentTypesFile = files["[Content_Types].xml"];
    if (!contentTypesFile) return;

    const xml = new TextDecoder().decode(contentTypesFile);

    // Parse defaults
    const defaultRegex =
      /<Default Extension="([^"]+)" ContentType="([^"]+)"\/>/g;
    let match = defaultRegex.exec(xml);
    while (match) {
      const ext = match[1];
      const contentType = match[2];
      if (container.contentTypes) {
        container.contentTypes[`.${ext}`] = contentType;
      }
      match = defaultRegex.exec(xml);
    }

    // Parse overrides
    const overrideRegex =
      /<Override PartName="([^"]+)" ContentType="([^"]+)"\/>/g;
    match = overrideRegex.exec(xml);
    while (match) {
      const partName = match[1];
      const contentType = match[2];
      if (container.contentTypes) {
        container.contentTypes[partName] = contentType;
      }
      match = overrideRegex.exec(xml);
    }
  }

  /**
   * Parse relationships from .rels files
   */
  private parseRelationships(
    files: Record<string, Uint8Array>,
    container: OOXMLContainer
  ): void {
    for (const path in files) {
      if (path.endsWith(".rels")) {
        const relsXml = new TextDecoder().decode(files[path]);
        const relationshipRegex =
          /<Relationship Id="([^"]+)" Type="([^"]+)" Target="([^"]+)"(?: TargetMode="([^"]+)")?\/>/g;

        let match = relationshipRegex.exec(relsXml);
        while (match) {
          if (container.relationships) {
            container.relationships.push({
              id: match[1],
              type: match[2],
              target: match[3],
              targetMode: match[4] as "Internal" | "External" | undefined,
            });
          }
          match = relationshipRegex.exec(relsXml);
        }
      }
    }
  }

  /**
   * Extract core properties from core.xml
   *
   * @param files Unzipped files
   * @returns Core properties
   */
  private async extractCoreProperties(
    files: Record<string, Uint8Array>
  ): Promise<OOXMLCoreProperties> {
    const coreProperties: OOXMLCoreProperties = {};

    try {
      // Look for core.xml which contains metadata
      const coreXml = files["docProps/core.xml"];
      if (coreXml) {
        // Parse XML to extract metadata
        const xmlString = new TextDecoder().decode(coreXml);

        // Extract basic metadata from XML
        coreProperties.title = this.extractXmlValue(xmlString, "dc:title");
        coreProperties.creator = this.extractXmlValue(xmlString, "dc:creator");
        coreProperties.description = this.extractXmlValue(
          xmlString,
          "dc:description"
        );
        coreProperties.subject = this.extractXmlValue(xmlString, "dc:subject");
        coreProperties.keywords = this.extractXmlValue(
          xmlString,
          "cp:keywords"
        );
        coreProperties.lastModifiedBy = this.extractXmlValue(
          xmlString,
          "cp:lastModifiedBy"
        );
        coreProperties.revision = this.extractXmlValue(
          xmlString,
          "cp:revision"
        );
        coreProperties.category = this.extractXmlValue(
          xmlString,
          "cp:category"
        );
        coreProperties.contentStatus = this.extractXmlValue(
          xmlString,
          "cp:contentStatus"
        );

        const createdDate = this.extractXmlValue(xmlString, "dcterms:created");
        if (createdDate) {
          coreProperties.created = new Date(createdDate);
        }

        const modifiedDate = this.extractXmlValue(
          xmlString,
          "dcterms:modified"
        );
        if (modifiedDate) {
          coreProperties.modified = new Date(modifiedDate);
        }
      }
    } catch (error) {
      console.error("Error extracting OOXML metadata:", error);
    }

    return coreProperties;
  }

  /**
   * Map OOXMLCoreProperties to generic Metadata
   */
  private mapCorePropertiesToMetadata(
    coreProperties: OOXMLCoreProperties
  ): Metadata {
    return {
      title: coreProperties.title,
      author: coreProperties.creator,
      description: coreProperties.description,
      subject: coreProperties.subject,
      keywords: coreProperties.keywords ? [coreProperties.keywords] : undefined,
      lastModifiedBy: coreProperties.lastModifiedBy,
      created: coreProperties.created,
      modified: coreProperties.modified,
      revision: coreProperties.revision,
    };
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
   * @param container OOXML container to populate
   * @param options Parsing options
   */
  private async parseDocx(
    files: Record<string, Uint8Array>,
    container: OOXMLContainer,
    options?: ProcessorOptions
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
      container.content?.push({
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
   * @param container OOXML container to populate
   * @param options Parsing options
   */
  private async parseXlsx(
    files: Record<string, Uint8Array>,
    container: OOXMLContainer,
    options?: ProcessorOptions
  ): Promise<void> {
    // Get the workbook.xml file
    const workbookXml = files["xl/workbook.xml"];
    if (!workbookXml) {
      throw new Error("Invalid XLSX file: missing xl/workbook.xml");
    }

    // This is a placeholder implementation
    // A real implementation would parse the sheets and data
    container.content?.push({
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
   * @param container OOXML container to populate
   * @param options Parsing options
   */
  private async parsePptx(
    files: Record<string, Uint8Array>,
    container: OOXMLContainer,
    options?: ProcessorOptions
  ): Promise<void> {
    // Get the presentation.xml file
    const presentationXml = files["ppt/presentation.xml"];
    if (!presentationXml) {
      throw new Error("Invalid PPTX file: missing ppt/presentation.xml");
    }

    // This is a placeholder implementation
    // A real implementation would parse the slides and content
    container.content?.push({
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
    const regex = /<w:p(?:\s[^>]*)?>([\s\S]+?)<\/w:p>/g;

    let match = regex.exec(xml);
    while (match !== null) {
      const paragraphXml = match[1];
      // Extract text from paragraph
      const text = this.extractTextFromParagraph(paragraphXml);
      if (text.trim()) {
        paragraphs.push(text);
      }
      match = regex.exec(xml);
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
    const regex = /<w:t(?:\s[^>]*)?>([\s\S]+?)<\/w:t>/g;

    let match = regex.exec(paragraphXml);
    while (match !== null) {
      text += match[1];
      match = regex.exec(paragraphXml);
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
    const tagRegex = new RegExp(
      `<${tagName}(?:\\s[^>]*)?>([\s\S]+?)<\/${tagName}>`,
      "i"
    );
    const match = xml.match(tagRegex);
    return match ? match[1].trim() : "";
  }
}
