/**
 * Processor registry implementation for Docen
 *
 * This file implements the registry for managing processor components.
 */

import type { FullProcessor } from "../processor/index";
import type { Source } from "../processor/interfaces";
import type { Generator, Parser } from "../processor/interfaces";
import type { ProcessorRegistry } from "./interfaces";

/**
 * Registry for document processors
 */
export class ProcessorRegistryImpl implements ProcessorRegistry {
  private parsers: Parser[] = [];
  private generators: Generator[] = [];

  /**
   * Register a component in the registry
   *
   * @param component The component to register
   */
  register(component: Parser | Generator): void {
    if ("parse" in component) {
      this.registerParser(component as Parser);
    }
    if ("generate" in component) {
      this.registerGenerator(component as Generator);
    }
  }

  /**
   * Get all registered components
   *
   * @returns Array of all components
   */
  getAll(): (Parser | Generator)[] {
    // Return unique set of components
    const allComponents = [...this.parsers, ...this.generators];
    return [...new Set(allComponents)];
  }

  /**
   * Register a parser in the registry
   *
   * @param parser The parser to register
   */
  registerParser(parser: Parser): void {
    if (!this.parsers.find((p) => p.id === parser.id)) {
      this.parsers.push(parser);
    }
  }

  /**
   * Register a generator in the registry
   *
   * @param generator The generator to register
   */
  registerGenerator(generator: Generator): void {
    if (!this.generators.find((g) => g.id === generator.id)) {
      this.generators.push(generator);
    }
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
    // Try to find processors that can handle both parse and generate operations
    const fullProcessors = this.getFullProcessors();

    for (const processor of fullProcessors) {
      if (
        (await processor.canParse(source, sourceMimeType, sourceExtension)) &&
        processor.canGenerate(targetMimeType, targetExtension)
      ) {
        return processor;
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
      (parser): parser is FullProcessor => "canGenerate" in parser
    );
  }

  /**
   * Clear all registered processors
   */
  clear(): void {
    this.parsers = [];
    this.generators = [];
  }
}
