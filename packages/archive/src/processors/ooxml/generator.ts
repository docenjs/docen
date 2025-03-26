/**
 * OOXML generator for Docen
 *
 * This file implements a generator for OOXML files (DOCX, XLSX, PPTX) using the fflate library.
 */

import type {
  ConversionResult,
  Document,
  Generator,
  ProcessorOptions,
} from "@docen/core";
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

    // Create OOXML content based on the document AST
    const files = await this.createOOXMLFiles(document, targetFormat, options);

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
    switch (format.toLowerCase()) {
      case "docx":
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      case "xlsx":
        return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      case "pptx":
        return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
      default:
        return "application/octet-stream";
    }
  }

  /**
   * Create OOXML files based on the document AST
   *
   * @param document The document to generate from
   * @param targetFormat Target format (docx, xlsx, pptx)
   * @param options Generation options
   * @returns Object containing file contents
   */
  private async createOOXMLFiles(
    document: Document,
    targetFormat: string,
    options?: ProcessorOptions
  ): Promise<Record<string, Uint8Array>> {
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
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n' +
        '  <Default Extension="xml" ContentType="application/xml"/>\n' +
        '  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>\n' +
        '  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>\n' +
        '  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n' +
        "</Types>"
    );

    // Create _rels/.rels
    files["_rels/.rels"] = this.stringToUint8Array(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>\n' +
        '  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>\n' +
        "</Relationships>"
    );

    // Create word/_rels/document.xml.rels
    files["word/_rels/document.xml.rels"] = this.stringToUint8Array(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>\n' +
        "</Relationships>"
    );

    // Create word/styles.xml
    files["word/styles.xml"] = this.stringToUint8Array(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n' +
        '  <w:style w:type="paragraph" w:styleId="Normal">\n' +
        '    <w:name w:val="Normal"/>\n' +
        "    <w:pPr/>\n" +
        "    <w:rPr/>\n" +
        "  </w:style>\n" +
        "</w:styles>"
    );

    // Create docProps/core.xml with metadata
    const metadata = document.metadata || {};
    files["docProps/core.xml"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <dc:title>${metadata.title || ""}</dc:title>\n  <dc:creator>${metadata.creator || ""}</dc:creator>\n  <dc:description>${metadata.description || ""}</dc:description>\n  <cp:lastModifiedBy>${metadata.lastModifiedBy || ""}</cp:lastModifiedBy>\n  <dcterms:created xsi:type="dcterms:W3CDTF">${metadata.created || new Date().toISOString()}</dcterms:created>\n  <dcterms:modified xsi:type="dcterms:W3CDTF">${metadata.modified || new Date().toISOString()}</dcterms:modified>\n</cp:coreProperties>`
    );

    // Create word/document.xml with content
    const content = this.generateDocxContent(document);
    files["word/document.xml"] = this.stringToUint8Array(content);
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
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n' +
        '  <Default Extension="xml" ContentType="application/xml"/>\n' +
        '  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>\n' +
        '  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n' +
        "</Types>"
    );

    // Create a simple workbook.xml
    files["xl/workbook.xml"] = this.stringToUint8Array(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n' +
        "  <sheets>\n" +
        '    <sheet name="Sheet1" sheetId="1" r:id="rId1"/>\n' +
        "  </sheets>\n" +
        "</workbook>"
    );
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
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
        '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n' +
        '  <Default Extension="xml" ContentType="application/xml"/>\n' +
        '  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>\n' +
        '  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>\n' +
        "</Types>"
    );

    // Create _rels/.rels
    files["_rels/.rels"] = this.stringToUint8Array(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>\n' +
        '  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>\n' +
        "</Relationships>"
    );

    // Create a simple presentation.xml
    files["ppt/presentation.xml"] = this.stringToUint8Array(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">\n' +
        "  <p:sldMasterIdLst>\n" +
        '    <p:sldMasterId id="2147483648" r:id="rId1"/>\n' +
        "  </p:sldMasterIdLst>\n" +
        "  <p:sldIdLst>\n" +
        '    <p:sldId id="256" r:id="rId2"/>\n' +
        "  </p:sldIdLst>\n" +
        '  <p:sldSz cx="9144000" cy="6858000"/>\n' +
        '  <p:notesSz cx="6858000" cy="9144000"/>\n' +
        "</p:presentation>"
    );

    // Create docProps/core.xml with metadata
    const metadata = document.metadata || {};
    files["docProps/core.xml"] = this.stringToUint8Array(
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n  <dc:title>${metadata.title || ""}</dc:title>\n  <dc:creator>${metadata.creator || ""}</dc:creator>\n  <dc:description>${metadata.description || ""}</dc:description>\n  <cp:lastModifiedBy>${metadata.lastModifiedBy || ""}</cp:lastModifiedBy>\n  <dcterms:created xsi:type="dcterms:W3CDTF">${metadata.created || new Date().toISOString()}</dcterms:created>\n  <dcterms:modified xsi:type="dcterms:W3CDTF">${metadata.modified || new Date().toISOString()}</dcterms:modified>\n</cp:coreProperties>`
    );
  }

  /**
   * Generate DOCX content XML based on the document AST
   *
   * @param document The document to generate from
   * @returns DOCX content XML
   */
  private generateDocxContent(document: Document): string {
    // Start with XML declaration and document element
    let content = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
    content +=
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">\n';
    content += "  <w:body>\n";

    // Process document content
    if (document.content?.children) {
      for (const node of document.content.children) {
        switch (node.type) {
          case "paragraph": {
            content += "    <w:p>\n";

            // Process paragraph content
            for (const child of node.children) {
              if (child.type === "text") {
                content += "      <w:r>\n";
                content += `        <w:t>${this.escapeXml(child.value)}</w:t>\n`;
                content += "      </w:r>\n";
              } else if (child.type === "emphasis") {
                content += "      <w:r>\n";
                content += "        <w:rPr><w:i/></w:rPr>\n";
                // Process emphasis content (simplified - just taking first text node)
                const text = child.children.find((c) => c.type === "text");
                if (text && text.type === "text") {
                  content += `        <w:t>${this.escapeXml(text.value)}</w:t>\n`;
                }
                content += "      </w:r>\n";
              } else if (child.type === "strong") {
                content += "      <w:r>\n";
                content += "        <w:rPr><w:b/></w:rPr>\n";
                // Process strong content (simplified - just taking first text node)
                const text = child.children.find((c) => c.type === "text");
                if (text && text.type === "text") {
                  content += `        <w:t>${this.escapeXml(text.value)}</w:t>\n`;
                }
                content += "      </w:r>\n";
              }
              // Other inline types could be handled here
            }

            content += "    </w:p>\n";
            break;
          }

          case "heading": {
            // Get heading level
            const level = node.depth || 1;

            content += "    <w:p>\n";
            content += "      <w:pPr>\n";
            content += `        <w:pStyle w:val="Heading${level}"/>\n`;
            content += "      </w:pPr>\n";

            // Process heading content
            for (const child of node.children) {
              if (child.type === "text") {
                content += "      <w:r>\n";
                content += `        <w:t>${this.escapeXml(child.value)}</w:t>\n`;
                content += "      </w:r>\n";
              }
              // Other inline types could be handled here
            }

            content += "    </w:p>\n";
            break;
          }

          // Other block types could be handled here
        }
      }
    }

    // Close document
    content += "  </w:body>\n";
    content += "</w:document>";

    return content;
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
        zip(files, (err, data) => {
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
   * Convert string to Uint8Array
   *
   * @param str String to convert
   * @returns Uint8Array representation of the string
   */
  private stringToUint8Array(str: string): Uint8Array {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }
}
