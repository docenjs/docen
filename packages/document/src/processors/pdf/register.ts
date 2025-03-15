/**
 * Register PDF processors for Docen
 *
 * This file registers PDF parser and generator implementations.
 */

import { defaultRegistry } from "@docen/core";
import { PDFGenerator } from "./generator";
import { PDFParser } from "./parser";

// Register the PDF parser
defaultRegistry.registerParser(new PDFParser());

// Register the PDF generator
defaultRegistry.registerGenerator(new PDFGenerator());
