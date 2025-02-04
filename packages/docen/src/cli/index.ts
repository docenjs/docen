#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineCommand, runCommand } from "@funish/cli";
import { version } from "../../package.json";
import { convert, extractText, getMetadata } from "../index";

const convertCommand = defineCommand({
  meta: {
    name: "convert",
    description: "Convert document to target format",
    version,
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
    ocr: {
      type: "boolean",
      description: "Enable OCR for image-based documents",
    },
    language: {
      type: "string",
      description: "Language for OCR",
    },
    preserveFormatting: {
      type: "boolean",
      description: "Preserve original formatting",
    },
  },
  async run({ args }) {
    try {
      const { source, target, format, ocr, language, preserveFormatting } =
        args;

      if (!source || !target) {
        throw new Error("Source and target files are required");
      }

      const sourceData = await readFile(resolve(source));
      await convert(sourceData, resolve(target), {
        targetFormat: format,
        ocr,
        language,
        preserveFormatting,
      });

      console.log(`Successfully converted ${source} to ${target}`);
    } catch (error: unknown) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  },
});

const extractCommand = defineCommand({
  meta: {
    name: "extract",
    description: "Extract text from document",
    version,
  },
  args: {
    source: {
      type: "positional",
      description: "Source file",
      required: true,
    },
    ocr: {
      type: "boolean",
      description: "Enable OCR for image-based documents",
    },
    language: {
      type: "string",
      description: "Language for OCR",
    },
  },
  async run({ args }) {
    try {
      const { source, ocr, language } = args;

      if (!source) {
        throw new Error("Source file is required");
      }

      const sourceData = await readFile(resolve(source));
      const text = await extractText(sourceData, { ocr, language });
      console.log(text);
    } catch (error: unknown) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  },
});

const metadataCommand = defineCommand({
  meta: {
    name: "metadata",
    description: "Get document metadata",
    version,
  },
  args: {
    source: {
      type: "positional",
      description: "Source file",
      required: true,
    },
  },
  async run({ args }) {
    try {
      const { source } = args;

      if (!source) {
        throw new Error("Source file is required");
      }

      const sourceData = await readFile(resolve(source));
      const metadata = await getMetadata(sourceData);
      console.log(JSON.stringify(metadata, null, 2));
    } catch (error: unknown) {
      console.error(
        "Error:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  },
});

const cli = defineCommand({
  meta: {
    name: "docen",
    version,
    description: "Universal document conversion and processing library",
  },
  subCommands: {
    convert: convertCommand,
    extract: extractCommand,
    metadata: metadataCommand,
  },
});

runCommand(cli, { rawArgs: process.argv.slice(2) });
