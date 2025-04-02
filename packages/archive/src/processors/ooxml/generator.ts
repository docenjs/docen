/**
 * OOXML generator for Docen
 *
 * This file implements a generator for OOXML files (DOCX, XLSX, PPTX) using the fflate library.
 */

import type {
  ConversionResult,
  Document,
  Generator,
  Node,
  OOXMLContainer,
  OOXMLCoreProperties,
  ProcessorOptions,
} from "@docen/core";
import { UnsupportedNodeHandling } from "@docen/core";
import { zip } from "fflate";

/**
 * OOXML Generator implementation
 */
export class OOXMLGenerator implements Generator {
  id = "ooxml-generator";
  name = "OOXML Generator";
  supportedInputTypes: string[] = [];
  supportedOutputTypes = [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  supportedInputExtensions: string[] = [];
  supportedOutputExtensions = ["docx", "xlsx", "pptx"];

  /**
   * Handle unsupported nodes with a default strategy
   */
  handleUnsupportedNode(node: Node): UnsupportedNodeHandling {
    return UnsupportedNodeHandling.KEEP_AS_IS;
  }

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
   * Generate OOXML output from a document AST
   *
   * @param document The document to generate from
   * @param options Generation options
   * @returns Generated OOXML content
   */
  async generate(
    document: Document,
    options?: ProcessorOptions
  ): Promise<ConversionResult> {
    // Determine the target format
    const targetFormat = this.determineTargetFormat(options);

    // Check if the document already has an OOXMLContainer
    const existingContainer = this.getOOXMLContainer(document);

    // Create OOXML content based on the document AST
    const files = await this.createOOXMLFiles(
      document,
      targetFormat,
      existingContainer,
      options
    );

    // Compress the files into an OOXML package
    const content = await this.createOOXMLPackage(files);

    // Return the result
    return {
      content,
      mimeType: this.getMimeType(targetFormat),
      extension: targetFormat,
    };
  }

  /**
   * Extract OOXMLContainer from document if it exists
   */
  private getOOXMLContainer(document: Document): OOXMLContainer | undefined {
    // Check if the document content is an OOXMLContainer
    if (
      document.content &&
      typeof document.content === "object" &&
      "type" in document.content
    ) {
      const content = document.content as { type: string };
      if (content.type === "ooxmlContainer") {
        // Use type assertion to unknown first to avoid type error
        return document.content as unknown as OOXMLContainer;
      }
    }
    return undefined;
  }

  /**
   * Determine the target format based on options
   *
   * @param options Generation options
   * @returns Target format (docx, xlsx, pptx)
   */
  private determineTargetFormat(options?: ProcessorOptions): string {
    // Check if the target format is specified in the options
    if (options?.targetFormat) {
      const format = (options.targetFormat as string).toLowerCase();
      if (this.supportedOutputExtensions.includes(format)) {
        return format;
      }

      // Check if it's a MIME type
      const mimeTypeIndex = this.supportedOutputTypes.findIndex(
        (mimeType) => mimeType.toLowerCase() === format
      );
      if (mimeTypeIndex >= 0) {
        return this.supportedOutputExtensions[mimeTypeIndex];
      }
    }

    // Default to DOCX if not specified
    return "docx";
  }

  /**
   * Get the MIME type for the target format
   *
   * @param format Target format (docx, xlsx, pptx)
   * @returns MIME type
   */
  private getMimeType(format: string): string {
    const formatMap: Record<string, string> = {
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };

    return formatMap[format.toLowerCase()] || "application/octet-stream";
  }

  /**
   * Create OOXML files based on the document AST
   *
   * @param document The document to generate from
   * @param targetFormat Target format (docx, xlsx, pptx)
   * @param existingContainer Optional existing OOXMLContainer
   * @param options Generation options
   * @returns Object containing file contents
   */
  private async createOOXMLFiles(
    document: Document,
    targetFormat: string,
    existingContainer?: OOXMLContainer,
    options?: ProcessorOptions
  ): Promise<Record<string, Uint8Array>> {
    // If we have an existing container with the same format, reuse its structure
    if (
      existingContainer &&
      this.isFormatMatchingContainer(targetFormat, existingContainer)
    ) {
      return this.regenerateFromContainer(existingContainer, document, options);
    }

    // Otherwise, create new files from scratch
    const files: Record<string, Uint8Array> = {};

    // Create files based on the target format
    switch (targetFormat) {
      case "docx":
        await this.createDocxFiles(document, files, options);
        break;
      case "xlsx":
        await this.createXlsxFiles(document, files, options);
        break;
      case "pptx":
        await this.createPptxFiles(document, files, options);
        break;
      default:
        throw new Error(`Unsupported target format: ${targetFormat}`);
    }

    return files;
  }

  /**
   * Check if the format matches the container type
   */
  private isFormatMatchingContainer(
    format: string,
    container: OOXMLContainer
  ): boolean {
    const formatToOoxmlType: Record<string, string> = {
      docx: "wordprocessingml",
      xlsx: "spreadsheetml",
      pptx: "presentationml",
    };

    return container.ooxmlType === formatToOoxmlType[format];
  }

  /**
   * Regenerate files from an existing container
   */
  private async regenerateFromContainer(
    container: OOXMLContainer,
    document: Document,
    options?: ProcessorOptions
  ): Promise<Record<string, Uint8Array>> {
    const files: Record<string, Uint8Array> = {};

    // If the container has entries, try to recreate those files
    if (container.entries && container.entries.length > 0) {
      // This is a simple implementation that ignores the actual content
      // A real implementation would update the XML content based on the document

      // Create basic structure files
      if (container.ooxmlType === "wordprocessingml") {
        await this.createDocxFiles(document, files, options);
      } else if (container.ooxmlType === "spreadsheetml") {
        await this.createXlsxFiles(document, files, options);
      } else if (container.ooxmlType === "presentationml") {
        await this.createPptxFiles(document, files, options);
      }
    } else {
      // Fall back to creating files from scratch based on the container type
      if (container.ooxmlType === "wordprocessingml") {
        await this.createDocxFiles(document, files, options);
      } else if (container.ooxmlType === "spreadsheetml") {
        await this.createXlsxFiles(document, files, options);
      } else if (container.ooxmlType === "presentationml") {
        await this.createPptxFiles(document, files, options);
      }
    }

    return files;
  }

  /**
   * Create DOCX files
   *
   * @param document The document to generate from
   * @param files Object to populate with file contents
   * @param options Generation options
   */
  private async createDocxFiles(
    document: Document,
    files: Record<string, Uint8Array>,
    options?: ProcessorOptions
  ): Promise<void> {
    // This is a simplified implementation
    // A real implementation would create all the necessary XML files for a DOCX document

    // Create [Content_Types].xml
    files["[Content_Types].xml"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`
    );

    // Create _rels/.rels
    files["_rels/.rels"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`
    );

    // Create word/_rels/document.xml.rels
    files["word/_rels/document.xml.rels"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`
    );

    // Create word/styles.xml
    files["word/styles.xml"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:pPr/>
    <w:rPr/>
  </w:style>
</w:styles>`
    );

    // Create docProps/core.xml with metadata
    const metadata = this.getCombinedMetadata(document);
    files["docProps/core.xml"] = this.createCorePropertiesXml(metadata);

    // Create word/document.xml with content
    const content = this.generateDocxContent(document);
    files["word/document.xml"] = this.stringToUint8Array(content);
  }

  /**
   * Get combined metadata from document and coreProperties if available
   */
  private getCombinedMetadata(document: Document): OOXMLCoreProperties {
    const metadata = document.metadata || {};
    const container = this.getOOXMLContainer(document);
    const coreProperties = container?.coreProperties || {};

    // Safely extract string values from metadata with fallbacks
    const getStringValue = (value: unknown): string => {
      if (typeof value === "string") return value;
      return "";
    };

    // Combine metadata from document and core properties
    return {
      title:
        getStringValue(metadata.title) ||
        getStringValue(coreProperties.title) ||
        "",
      creator:
        getStringValue(metadata.author) ||
        getStringValue(coreProperties.creator) ||
        "",
      description:
        getStringValue(metadata.description) ||
        getStringValue(coreProperties.description) ||
        "",
      subject:
        getStringValue(metadata.subject) ||
        getStringValue(coreProperties.subject) ||
        "",
      keywords: Array.isArray(metadata.keywords)
        ? metadata.keywords.join(", ")
        : getStringValue(coreProperties.keywords) || "",
      lastModifiedBy:
        getStringValue(metadata.lastModifiedBy) ||
        getStringValue(coreProperties.lastModifiedBy) ||
        "",
      revision:
        getStringValue(metadata.revision) ||
        getStringValue(coreProperties.revision) ||
        "",
      created:
        metadata.created instanceof Date
          ? metadata.created
          : coreProperties.created || new Date(),
      modified:
        metadata.modified instanceof Date
          ? metadata.modified
          : coreProperties.modified || new Date(),
      category: getStringValue(coreProperties.category) || "",
      contentStatus: getStringValue(coreProperties.contentStatus) || "",
    };
  }

  /**
   * Create core properties XML
   */
  private createCorePropertiesXml(props: OOXMLCoreProperties): Uint8Array {
    const createdDate = props.created
      ? props.created.toISOString()
      : new Date().toISOString();
    const modifiedDate = props.modified
      ? props.modified.toISOString()
      : new Date().toISOString();

    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" 
                   xmlns:dc="http://purl.org/dc/elements/1.1/" 
                   xmlns:dcterms="http://purl.org/dc/terms/" 
                   xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${this.escapeXml(props.title || "")}</dc:title>
  <dc:creator>${this.escapeXml(props.creator || "")}</dc:creator>
  <dc:description>${this.escapeXml(props.description || "")}</dc:description>
  <dc:subject>${this.escapeXml(props.subject || "")}</dc:subject>
  <cp:keywords>${this.escapeXml(props.keywords || "")}</cp:keywords>
  <cp:lastModifiedBy>${this.escapeXml(props.lastModifiedBy || "")}</cp:lastModifiedBy>
  <cp:revision>${this.escapeXml(props.revision || "")}</cp:revision>
  <cp:category>${this.escapeXml(props.category || "")}</cp:category>
  <cp:contentStatus>${this.escapeXml(props.contentStatus || "")}</cp:contentStatus>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdDate}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${modifiedDate}</dcterms:modified>
</cp:coreProperties>`;

    return this.stringToUint8Array(xml);
  }

  /**
   * Create XLSX files
   *
   * @param document The document to generate from
   * @param files Object to populate with file contents
   * @param options Generation options
   */
  private async createXlsxFiles(
    document: Document,
    files: Record<string, Uint8Array>,
    options?: ProcessorOptions
  ): Promise<void> {
    // This is a placeholder implementation
    // A real implementation would create all the necessary XML files for an XLSX document

    // Create a minimal XLSX file structure
    files["[Content_Types].xml"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`
    );

    // Create a simple workbook.xml
    files["xl/workbook.xml"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheets>
    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
    );

    // Create _rels/.rels
    files["_rels/.rels"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`
    );

    // Create docProps/core.xml with metadata
    const metadata = this.getCombinedMetadata(document);
    files["docProps/core.xml"] = this.createCorePropertiesXml(metadata);
  }

  /**
   * Create PPTX files
   *
   * @param document The document to generate from
   * @param files Object to populate with file contents
   * @param options Generation options
   */
  private async createPptxFiles(
    document: Document,
    files: Record<string, Uint8Array>,
    options?: ProcessorOptions
  ): Promise<void> {
    // This is a placeholder implementation
    // A real implementation would create all the necessary XML files for a PPTX document

    // Create a minimal PPTX file structure
    files["[Content_Types].xml"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
</Types>`
    );

    // Create a simple presentation.xml
    files["ppt/presentation.xml"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
</p:presentation>`
    );

    // Create _rels/.rels
    files["_rels/.rels"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
</Relationships>`
    );

    // Create docProps/core.xml with metadata
    const metadata = this.getCombinedMetadata(document);
    files["docProps/core.xml"] = this.createCorePropertiesXml(metadata);
  }

  /**
   * Generate DOCX XML content from document AST
   *
   * @param document The document to generate from
   * @returns DOCX XML content
   */
  private generateDocxContent(document: Document): string {
    let paragraphs = "";

    // Check if the document has a container with content
    const container = this.getOOXMLContainer(document);
    if (container?.content && Array.isArray(container.content)) {
      // Process content from the container
      for (const node of container.content) {
        if (node.type === "paragraph") {
          // Extract text from paragraph node
          const text = this.extractTextFromNode(node);
          if (text) {
            paragraphs += this.createDocxParagraph(text);
          }
        }
      }
    }

    // If no paragraphs were generated, create a default one
    if (!paragraphs) {
      paragraphs = this.createDocxParagraph("Empty document");
    }

    // Create the document.xml content
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
${paragraphs}  </w:body>
</w:document>`;
  }

  /**
   * Extract text from a node
   */
  private extractTextFromNode(node: Node): string {
    if (node.type === "text" && "value" in node) {
      return node.value as string;
    }

    if ("children" in node && Array.isArray(node.children)) {
      return node.children
        .map((child) => this.extractTextFromNode(child))
        .join("");
    }

    return "";
  }

  /**
   * Create a DOCX paragraph
   */
  private createDocxParagraph(text: string): string {
    return `    <w:p>
      <w:pPr>
        <w:pStyle w:val="Normal"/>
      </w:pPr>
      <w:r>
        <w:t>${this.escapeXml(text)}</w:t>
      </w:r>
    </w:p>
`;
  }

  /**
   * Escape XML special characters
   *
   * @param text Text to escape
   * @returns Escaped text
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  /**
   * Create OOXML package from files
   *
   * @param files Object containing file contents
   * @returns Compressed OOXML package
   */
  private createOOXMLPackage(
    files: Record<string, Uint8Array>
  ): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      try {
        // Use fflate to zip the files
        zip(files, { level: 9 }, (err, data) => {
          if (err) {
            reject(new Error(`Failed to create OOXML package: ${err.message}`));
          } else {
            resolve(data);
          }
        });
      } catch (error) {
        reject(new Error(`Error creating OOXML package: ${error}`));
      }
    });
  }

  /**
   * Convert string to Uint8Array using TextEncoder
   *
   * @param str String to convert
   * @returns Uint8Array
   */
  private stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }
}
