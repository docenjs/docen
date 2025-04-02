/**
 * Command-line interface for Docen
 *
 * This file implements the CLI functionality for Docen using @funish/cli.
 */

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { toArrayBuffer, toDataView } from "@docen/core";
import { defineCommand, runMain } from "@funish/cli";
import { convert, extractText, getMetadata } from "../index";

// Version constant
const VERSION = "0.1.0";

// Convert command
const convertCommand = defineCommand({
  meta: {
    name: "convert",
    description: "Convert document to target format",
    version: VERSION,
  },
  args: {
    source: {
      type: "positional",
      description: "Source file",
      required: true,
    },
    target: {
      type: "positional",
      description: "Target file",
      required: true,
    },
    format: {
      type: "string",
      description: "Target format override",
    },
    preserveFormatting: {
      type: "boolean",
      description: "Preserve original formatting",
    },
    extractImages: {
      type: "boolean",
      description: "Extract images when possible",
    },
    extractMetadata: {
      type: "boolean",
      description: "Extract metadata when possible",
    },
  },
  async run({ args }) {
    try {
      const {
        source,
        target,
        format,
        preserveFormatting,
        extractImages,
        extractMetadata,
      } = args;

      if (!source || !target) {
        throw new Error("Source and target files are required");
      }

      // Read source file
      const fileData = toArrayBuffer(await readFile(resolve(source)));

      // Convert document
      const result = await convert(
        fileData,
        format || target.split(".").pop() || "",
        {
          preserveFormatting,
          extractImages,
          extractMetadata,
        }
      );

      // Write output file
      await writeFile(resolve(target), toDataView(result.content));

      console.log(`Document converted to ${target}`);
    } catch (error) {
      console.error(
        "Error converting document:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  },
});

// Extract text command
const extractCommand = defineCommand({
  meta: {
    name: "extract",
    description: "Extract text from document",
    version: VERSION,
  },
  args: {
    source: {
      type: "positional",
      description: "Source file",
      required: true,
    },
    output: {
      type: "string",
      description: "Output file path (defaults to stdout)",
    },
    metadata: {
      type: "boolean",
      description: "Include metadata in output",
    },
  },
  async run({ args }) {
    try {
      const { source, output, metadata } = args;

      if (!source) {
        throw new Error("Source file is required");
      }

      // Read source file
      const fileData = toArrayBuffer(await readFile(resolve(source)));

      // Extract text
      const text = await extractText(fileData, {
        extractMetadata: metadata,
      });

      // Get metadata if requested
      let result = text;
      if (metadata) {
        const metadataObj = await getMetadata(fileData);
        const metadataStr = JSON.stringify(metadataObj, null, 2);
        result = `--- Metadata ---\n${metadataStr}\n\n--- Content ---\n${text}`;
      }

      // Output result
      if (output) {
        await writeFile(resolve(output), result);
        console.log(`Text extracted to ${output}`);
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error(
        "Error extracting text:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  },
});

// Metadata command
const metadataCommand = defineCommand({
  meta: {
    name: "metadata",
    description: "Get document metadata",
    version: VERSION,
  },
  args: {
    source: {
      type: "positional",
      description: "Source file",
      required: true,
    },
    output: {
      type: "string",
      description: "Output file path (defaults to stdout)",
    },
  },
  async run({ args }) {
    try {
      const { source, output } = args;

      if (!source) {
        throw new Error("Source file is required");
      }

      // Read source file
      const fileData = toArrayBuffer(await readFile(resolve(source)));

      // Extract metadata
      const metadata = await getMetadata(fileData);
      const result = JSON.stringify(metadata, null, 2);

      // Output result
      if (output) {
        await writeFile(resolve(output), result);
        console.log(`Metadata extracted to ${output}`);
      } else {
        console.log(result);
      }
    } catch (error) {
      console.error(
        "Error extracting metadata:",
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  },
});

// Main CLI
const docenCli = defineCommand({
  meta: {
    name: "docen",
    version: VERSION,
    description: "Universal document conversion and processing library",
  },
  subCommands: {
    convert: convertCommand,
    extract: extractCommand,
    metadata: metadataCommand,
  },
});

// Export the CLI
export default docenCli;

runMain(docenCli);
