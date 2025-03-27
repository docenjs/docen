/**
 * Register JSON processor
 */

import { defaultRegistry } from "@docen/core";
import { JSONGenerator } from "./generator";
import { JSONParser } from "./parser";

// Register JSON parser
defaultRegistry.registerParser(new JSONParser());

// Register JSON generator
defaultRegistry.registerGenerator(new JSONGenerator());
