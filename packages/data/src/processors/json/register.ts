/**
 * Register JSON processors for Docen
 *
 * This file registers JSON parser and generator implementations.
 */

import { defaultRegistry } from "@docen/core";
import { JSONGenerator } from "./generator";
import { JSONParser } from "./parser";

// Register the JSON parser
defaultRegistry.registerParser(new JSONParser());

// Register the JSON generator
defaultRegistry.registerGenerator(new JSONGenerator());
