/**
 * Register Markdown processors for Docen
 *
 * This file registers Markdown parser and generator implementations.
 */

import { defaultRegistry } from "@docen/core";
import { MarkdownGenerator } from "./generator";
import { MarkdownParser } from "./parser";

// Register the Markdown parser
defaultRegistry.registerParser(new MarkdownParser());

// Register the Markdown generator
defaultRegistry.registerGenerator(new MarkdownGenerator());
