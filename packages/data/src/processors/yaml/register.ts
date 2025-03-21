/**
 * Register YAML processors for Docen
 *
 * This file registers YAML parser and generator implementations.
 */

import { defaultRegistry } from "@docen/core";
import { YAMLGenerator } from "./generator";
import { YAMLParser } from "./parser";

// Register the YAML parser
defaultRegistry.registerParser(new YAMLParser());

// Register the YAML generator
defaultRegistry.registerGenerator(new YAMLGenerator());
