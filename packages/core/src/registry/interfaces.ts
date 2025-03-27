/**
 * Registry interfaces for Docen
 *
 * This file defines the registry interfaces for managing components.
 */

import type { FullProcessor } from "../processor/index";
import type { Source } from "../processor/interfaces";
import type { Generator, Parser } from "../processor/interfaces";

/**
 * Generic registry interface
 */
export interface Registry<T> {
  /**
   * Register a component
   *
   * @param component The component to register
   */
  register(component: T): void;

  /**
   * Get all registered components
   *
   * @returns Array of registered components
   */
  getAll(): T[];

  /**
   * Clear all registered components
   */
  clear(): void;
}

/**
 * Processor registry interface
 */
export interface ProcessorRegistry extends Registry<Parser | Generator> {
  /**
   * Register a parser
   *
   * @param parser The parser to register
   */
  registerParser(parser: Parser): void;

  /**
   * Register a generator
   *
   * @param generator The generator to register
   */
  registerGenerator(generator: Generator): void;

  /**
   * Register a full processor (both parser and generator) in the registry
   *
   * @param processor The processor to register
   */
  registerProcessor(processor: FullProcessor): void;

  /**
   * Find a parser that can handle the given source
   *
   * @param source The source to find a parser for
   * @param mimeType Optional MIME type hint
   * @param extension Optional file extension hint
   * @returns The first parser that can handle the source, or undefined if none found
   */
  findParser(
    source: Source,
    mimeType?: string,
    extension?: string,
  ): Promise<Parser | undefined>;

  /**
   * Find a generator that can produce the requested output format
   *
   * @param mimeType Target MIME type
   * @param extension Target file extension
   * @returns The first generator that can produce the format, or undefined if none found
   */
  findGenerator(mimeType?: string, extension?: string): Generator | undefined;

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
  findFullProcessor(
    source: Source,
    sourceMimeType?: string,
    sourceExtension?: string,
    targetMimeType?: string,
    targetExtension?: string,
  ): Promise<FullProcessor | undefined>;

  /**
   * Get all registered parsers
   *
   * @returns Array of all parsers
   */
  getParsers(): Parser[];

  /**
   * Get all registered generators
   *
   * @returns Array of all generators
   */
  getGenerators(): Generator[];

  /**
   * Get all registered full processors
   *
   * @returns Array of all full processors
   */
  getFullProcessors(): FullProcessor[];
}
