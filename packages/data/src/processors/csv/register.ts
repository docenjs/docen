/**
 * Register CSV processors for Docen
 *
 * This file registers CSV parser and generator implementations.
 */

import { defaultRegistry } from "@docen/core";
import { CSVGenerator } from "./generator";
import { CSVParser } from "./parser";

// Register the CSV parser
defaultRegistry.registerParser(new CSVParser());

// Register the CSV generator
defaultRegistry.registerGenerator(new CSVGenerator());
