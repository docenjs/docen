/**
 * DOCX Template loader with c12 configuration management
 * Core template loading functionality for unified.js patterns
 */

import { loadConfig } from "c12";
import type { VFile } from "vfile";
import type {
  DocxTemplateConfig,
  DocxTemplateLoaderOptions,
  DocxTemplateResult,
  VFileDocxContext,
} from "./types";

/**
 * Load DOCX template configuration using c12
 * Leverages c12's built-in defu merging and layer resolution
 */
export async function loadDocxTemplate(
  options: DocxTemplateLoaderOptions = {},
): Promise<DocxTemplateResult> {
  const { preset, vfile, debug, ...c12Options } = options;

  try {
    // Use c12's configuration loading with built-in defu merging
    const { config, configFile, layers } = await loadConfig<DocxTemplateConfig>(
      {
        name: "docx-template",
        configFile: preset ? `${preset}.config` : undefined,
        cwd: process.cwd(),
        // c12 handles defu merging internally - no need to implement our own
        defaults: {
          metadata: {
            creator: "Docen DOCX Template System",
          },
          pageSettings: {
            width: 595.28, // A4 width in points
            height: 841.89, // A4 height in points
            orientation: "portrait",
            margin: {
              top: 72, // 1 inch
              right: 72,
              bottom: 72,
              left: 72,
            },
          },
        },
        ...c12Options,
      },
    );

    if (debug) {
      console.log("[DOCX Template] Loaded configuration:", {
        preset,
        configFile,
        layerCount: layers?.length || 0,
      });
    }

    return {
      config,
      layers: layers || [],
      configFile,
      vfile,
    };
  } catch (error) {
    if (debug) {
      console.error("[DOCX Template] Failed to load template:", error);
    }
    throw new Error(
      `Failed to load DOCX template: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Create DOCX template configuration for VFile context
 * Integrates with unified.js processing pipeline
 */
export function createDocxVFileContext(
  vfile: VFile,
  templateResult: DocxTemplateResult,
): VFile {
  const context: VFileDocxContext = {
    template: templateResult.config,
    templateMeta: {
      preset: templateResult.configFile
        ? templateResult.configFile.replace(/\.config.*$/, "")
        : undefined,
      configFile: templateResult.configFile,
      processed: new Date(),
    },
  };

  // Attach template context to VFile data
  vfile.data = vfile.data || {};
  vfile.data.docxTemplate = context;

  return vfile;
}

/**
 * Process DOCX template from preset name
 * Convenience function for common use case
 */
export async function processDocxTemplate(
  preset: string,
  options: Omit<DocxTemplateLoaderOptions, "preset"> = {},
): Promise<DocxTemplateResult> {
  return loadDocxTemplate({
    preset,
    ...options,
  });
}

/**
 * Validate DOCX template configuration
 * Checks for required fields and correct structure
 */
export function validateDocxTemplate(config: DocxTemplateConfig): boolean {
  if (!config || typeof config !== "object") {
    return false;
  }

  // Check page settings if present
  if (config.pageSettings) {
    const { width, height, orientation } = config.pageSettings;
    if (width && (typeof width !== "number" || width <= 0)) {
      return false;
    }
    if (height && (typeof height !== "number" || height <= 0)) {
      return false;
    }
    if (orientation && !["portrait", "landscape"].includes(orientation)) {
      return false;
    }
  }

  // Check styles if present
  if (config.styles) {
    const { paragraphStyles, characterStyles, tableStyles, listStyles } =
      config.styles;
    const styleArrays = [
      paragraphStyles,
      characterStyles,
      tableStyles,
      listStyles,
    ];

    for (const styles of styleArrays) {
      if (styles && !Array.isArray(styles)) {
        return false;
      }
      if (styles) {
        for (const style of styles) {
          if (!style.id || typeof style.id !== "string") {
            return false;
          }
        }
      }
    }
  }

  return true;
}

/**
 * Extract VFile template context
 * Helper to get template data from VFile
 */
export function extractDocxTemplateContext(
  vfile: VFile,
): VFileDocxContext | undefined {
  return vfile.data?.docxTemplate as VFileDocxContext;
}

/**
 * Check if VFile has DOCX template context
 */
export function hasDocxTemplateContext(vfile: VFile): boolean {
  return !!vfile.data?.docxTemplate;
}
