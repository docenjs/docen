/**
 * Register OOXML processors for Docen
 *
 * This file registers OOXML parser and generator implementations.
 */

import { defaultRegistry } from "@docen/core";
import { OOXMLGenerator } from "./generator";
import { OOXMLParser } from "./parser";

// Register the OOXML parser
defaultRegistry.registerParser(new OOXMLParser());

// Register the OOXML generator
defaultRegistry.registerGenerator(new OOXMLGenerator());
