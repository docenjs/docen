/**
 * Main Docen module
 */
import { defaultRegistry } from "@docen/core";
import type {
  BlockQuote,
  Code,
  ConversionResult,
  Document,
  List,
  Metadata,
  Node,
  Paragraph,
  ProcessorOptions,
  ProcessorRegistry,
  Source,
  Table,
  Text,
} from "@docen/core";

// Import document processors

/**
 * Extract text from a document
 *
 * @param source Source document data
 * @param options Processing options
 * @returns Extracted text content
 */
export async function extractText(
  source: Source,
  options?: ProcessorOptions
): Promise<string> {
  // Find a parser that can handle the source
  const parser = await defaultRegistry.findParser(source);
  if (!parser) {
    throw new Error("No parser found for the given source");
  }

  // Parse the document
  const document = await parser.parse(source, options);

  // Extract text from the document AST
  return extractTextFromDocument(document);
}

/**
 * Extract text from a document AST
 *
 * @param document Document AST
 * @returns Extracted text content
 */
function extractTextFromDocument(document: Document): string {
  // Start with an empty string
  let text = "";

  // Process each node in the document
  const processNode = (node: Node): void => {
    if (node.type === "text") {
      text += (node as Text).value;
    } else if (node.type === "paragraph") {
      // Process paragraph children
      for (const child of (node as Paragraph).children) {
        processNode(child);
      }
      text += "\n\n";
    } else if (node.type === "heading") {
      // Process heading children
      for (const child of (node as Paragraph).children) {
        processNode(child);
      }
      text += "\n\n";
    } else if (node.type === "list") {
      // Process list items
      const listNode = node as List;
      for (const [index, item] of listNode.children.entries()) {
        const prefix = listNode.ordered ? `${index + 1}. ` : "- ";
        text += prefix;
        for (const child of item.children) {
          processNode(child);
        }
        text += "\n";
      }
      text += "\n";
    } else if (node.type === "table") {
      // Process table rows
      const tableNode = node as Table;
      for (const row of tableNode.children) {
        for (const [index, cell] of row.children.entries()) {
          for (const child of cell.children) {
            processNode(child);
          }
          if (index < row.children.length - 1) {
            text += " | ";
          }
        }
        text += "\n";
      }
      text += "\n";
    } else if (node.type === "code") {
      // Add code blocks
      text += (node as Code).value;
      text += "\n\n";
    } else if (node.type === "blockquote") {
      // Process blockquote children
      for (const child of (node as BlockQuote).children) {
        processNode(child);
      }
      text += "\n\n";
    } else if (node.type === "break") {
      text += "\n";
    } else if ("children" in node && Array.isArray(node.children)) {
      // Process any other node with children
      for (const child of node.children) {
        processNode(child);
      }
    }
  };

  // Process the root node
  processNode(document.content);

  // Clean up extra whitespace
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Convert a document from one format to another
 *
 * @param source Source document data
 * @param targetFormat Target format (extension or MIME type)
 * @param options Conversion options
 * @returns Conversion result
 */
export async function convert(
  source: Source,
  targetFormat: string,
  options?: ProcessorOptions
): Promise<ConversionResult> {
  // Determine if targetFormat is a MIME type or extension
  const isMimeType = targetFormat.includes("/");

  // Find a processor that can handle the conversion
  const processor = await defaultRegistry.findFullProcessor(
    source,
    undefined,
    undefined,
    isMimeType ? targetFormat : undefined,
    !isMimeType ? targetFormat : undefined
  );

  if (processor) {
    // Use the full processor for direct conversion
    const document = await processor.parse(source, options);
    return processor.generate(document, options);
  }

  // If no full processor is found, try to use separate parser and generator
  const parser = await defaultRegistry.findParser(source);
  if (!parser) {
    throw new Error("No parser found for the given source");
  }

  const generator = defaultRegistry.findGenerator(
    isMimeType ? targetFormat : undefined,
    !isMimeType ? targetFormat : undefined
  );
  if (!generator) {
    throw new Error(
      `No generator found for the target format: ${targetFormat}`
    );
  }

  // Parse the document
  const document = await parser.parse(source, options);

  // Generate the output
  return generator.generate(document, options);
}

/**
 * Get metadata from a document
 *
 * @param source Source document data
 * @param options Processing options
 * @returns Document metadata
 */
export async function getMetadata(
  source: Source,
  options?: ProcessorOptions
): Promise<Metadata> {
  // Find a parser that can handle the source
  const parser = await defaultRegistry.findParser(source);
  if (!parser) {
    throw new Error("No parser found for the given source");
  }

  // Parse the document with metadata extraction enabled
  const extractOptions = { ...options, extractMetadata: true };
  const document = await parser.parse(source, extractOptions);

  // Return the metadata
  return document.metadata;
}

/**
 * Get the registry instance
 *
 * @returns The default processor registry
 */
export function getRegistry(): ProcessorRegistry {
  return defaultRegistry;
}

// Re-export core types
export type {
  Document,
  Metadata,
  Source,
  ProcessorOptions,
  ConversionResult,
  Parser,
  Generator,
  FullProcessor,
} from "@docen/core";
