/**
 * Processor registry for Docen
 *
 * This file defines the registry system that manages available processors
 * and provides methods to find appropriate processors for specific formats.
 */

import type { FullProcessor, Generator, Parser, Source } from "./processor";

/**
 * Registry for document processors
 */
export class ProcessorRegistry {
  private parsers: Parser[] = [];
  private generators: Generator[] = [];

  /**
   * Register a parser in the registry
   *
   * @param parser The parser to register
   */
  registerParser(parser: Parser): void {
    this.parsers.push(parser);
  }

  /**
   * Register a generator in the registry
   *
   * @param generator The generator to register
   */
  registerGenerator(generator: Generator): void {
    this.generators.push(generator);
  }

  /**
   * Register a full processor (both parser and generator) in the registry
   *
   * @param processor The processor to register
   */
  registerProcessor(processor: FullProcessor): void {
    this.registerParser(processor);
    this.registerGenerator(processor);
  }

  /**
   * Find a parser that can handle the given source
   *
   * @param source The source to find a parser for
   * @param mimeType Optional MIME type hint
   * @param extension Optional file extension hint
   * @returns The first parser that can handle the source, or undefined if none found
   */
  async findParser(
    source: Source,
    mimeType?: string,
    extension?: string
  ): Promise<Parser | undefined> {
    for (const parser of this.parsers) {
      if (await parser.canParse(source, mimeType, extension)) {
        return parser;
      }
    }
    return undefined;
  }

  /**
   * Find a generator that can produce the requested output format
   *
   * @param mimeType Target MIME type
   * @param extension Target file extension
   * @returns The first generator that can produce the format, or undefined if none found
   */
  findGenerator(mimeType?: string, extension?: string): Generator | undefined {
    return this.generators.find((generator) =>
      generator.canGenerate(mimeType, extension)
    );
  }

  /**
   * Find a full processor that can convert from the source to the target format
   *
   * @param source The source to convert from
   * @param sourceMimeType Optional source MIME type hint
   * @param sourceExtension Optional source file extension hint
   * @param targetMimeType Target MIME type
   * @param targetExtension Target file extension
   * @returns A full processor that can handle the conversion, or undefined if none found
   */
  async findFullProcessor(
    source: Source,
    sourceMimeType?: string,
    sourceExtension?: string,
    targetMimeType?: string,
    targetExtension?: string
  ): Promise<FullProcessor | undefined> {
    // First try to find a processor that can handle both source and target
    for (const parser of this.parsers) {
      // Check if parser is also a FullProcessor by checking if canGenerate exists
      if (
        "canGenerate" in parser &&
        (await parser.canParse(source, sourceMimeType, sourceExtension))
      ) {
        const fullProcessor = parser as FullProcessor;
        if (fullProcessor.canGenerate(targetMimeType, targetExtension)) {
          return fullProcessor;
        }
      }
    }
    return undefined;
  }

  /**
   * Get all registered parsers
   *
   * @returns Array of all parsers
   */
  getParsers(): Parser[] {
    return [...this.parsers];
  }

  /**
   * Get all registered generators
   *
   * @returns Array of all generators
   */
  getGenerators(): Generator[] {
    return [...this.generators];
  }

  /**
   * Get all registered full processors
   *
   * @returns Array of all full processors
   */
  getFullProcessors(): FullProcessor[] {
    return this.parsers.filter(
      (parser) => "canGenerate" in parser
    ) as FullProcessor[];
  }
}

/**
 * Global default processor registry instance
 */
export const defaultRegistry = new ProcessorRegistry();
