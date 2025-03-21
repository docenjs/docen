/**
 * Register XML processors for Docen
 *
 * This file registers XML parser and generator implementations.
 */

import { defaultRegistry } from "@docen/core";
import { XMLGenerator } from "./generator";
import { XMLParser } from "./parser";

// Register the XML parser
defaultRegistry.registerParser(new XMLParser());

// Register the XML generator
defaultRegistry.registerGenerator(new XMLGenerator());
