/**
 * Document plugins for unified.js ecosystem
 * Provides extensibility for future unified.js plugins
 */

import type { Plugin } from "unified";

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
