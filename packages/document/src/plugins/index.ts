/**
 * Document plugins for unified.js ecosystem
 * Provides extensibility for future unified.js plugins
 */

import { createPlugin } from "@docen/core";
import type { Plugin } from "unified";

/**
 * Example plugin that demonstrates how to extend document processing
 * This is a placeholder for future unified.js ecosystem plugins
 */
export function exampleDocumentPlugin(): Plugin {
  return createPlugin(
    () => (tree) => {
      // Future unified.js ecosystem plugins would go here
      // This is just a placeholder
      return tree;
    },
    {
      name: "example-document-plugin",
      description: "Example plugin for document processing",
      version: "1.0.0",
      formats: ["markdown", "html"],
    },
  );
}

/**
 * Plugin registry for document-specific plugins
 * Provides a way to discover and register plugins for document processing
 */
export class DocumentPluginRegistry {
  private plugins: Plugin[] = [];

  /**
   * Register a document plugin
   */
  register(plugin: Plugin): void {
    this.plugins.push(plugin);
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return [...this.plugins];
  }

  /**
   * Get plugins by format
   */
  getByFormat(format: string): Plugin[] {
    return this.plugins.filter((plugin) => {
      const docenPlugin = plugin as { meta?: { formats?: string[] } };
      return docenPlugin.meta?.formats?.includes(format);
    });
  }
}

// Export a singleton instance
export const documentPlugins = new DocumentPluginRegistry();
