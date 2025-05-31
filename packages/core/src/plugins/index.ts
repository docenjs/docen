/**
 * Core plugin system for Docen
 * Defines plugin interfaces and provides basic plugin utilities
 */
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import type { DocenPlugin, DocenVFileData, Node, PluginMeta } from "../types";

/**
 * Interface for plugin discovery mechanisms
 */
export interface PluginDiscovery {
  scanPlugins(path: string): Promise<Plugin[]>;
  getAvailablePlugins(): Plugin[];
  registerPlugin(plugin: Plugin): void;
}

/**
 * Create a plugin with metadata
 */
export function createPlugin(plugin: Plugin, meta?: PluginMeta): DocenPlugin {
  const docenPlugin = plugin as DocenPlugin;
  if (meta) {
    docenPlugin.meta = meta;
  }
  return docenPlugin;
}

/**
 * Basic validation plugin
 */
export function validationPlugin(): Plugin {
  return () =>
    function transformer(tree: Node, file: VFile) {
      // Basic AST validation
      if (!tree || typeof tree !== "object") {
        file.message("Invalid AST: tree must be an object");
      }

      if (!tree.type) {
        file.message("Invalid AST: tree must have a type");
      }

      return tree;
    };
}

/**
 * Basic metadata plugin
 */
export function metadataPlugin(): Plugin {
  return () =>
    function transformer(tree: Node, file: VFile) {
      // Add processing metadata
      const data = file.data as DocenVFileData;
      if (!data.processing) {
        data.processing = {};
      }

      data.processing.startTime = Date.now();

      return tree;
    };
}

/**
 * Default plugin for tracking changes
 */
export function changeTrackingPlugin(): Plugin {
  return () =>
    function transformer(tree: Node, file: VFile) {
      // Track changes by adding them to the vfile messages
      file.message("Document processed with change tracking enabled", {
        source: "docen:change-tracking",
        ruleId: "change-tracking",
      });

      return tree;
    };
}

/**
 * Plugin to enable automatic document fragmentation
 */
export function fragmentationPlugin(
  options: {
    threshold?: number;
    maxFragments?: number;
    nodeTypes?: string[];
  } = {}
): Plugin {
  return () =>
    function transformer(tree: Node, file: VFile) {
      // Configure fragmentation settings
      const threshold = options.threshold || 1000;
      const maxFragments = options.maxFragments || 100;
      const nodeTypes = options.nodeTypes || ["section", "chapter"];

      // Add metadata for fragmentation
      file.data.fragmentation = {
        enabled: true,
        threshold,
        maxFragments,
        nodeTypes,
      };

      return tree;
    };
}

/**
 * Plugin for cursor and selection tracking
 */
export function cursorTrackingPlugin(): Plugin {
  return () =>
    function transformer(tree: Node, file: VFile) {
      // Enable cursor tracking in the document
      file.data.cursorTracking = {
        enabled: true,
        timestamp: Date.now(),
      };

      return tree;
    };
}

/**
 * Basic plugin discovery implementation
 */
export class BasicPluginDiscovery implements PluginDiscovery {
  private plugins: Plugin[] = [
    validationPlugin(),
    metadataPlugin(),
    changeTrackingPlugin(),
    fragmentationPlugin(),
    cursorTrackingPlugin(),
  ];

  /**
   * Scan a directory for plugins
   */
  async scanPlugins(path: string): Promise<Plugin[]> {
    // Basic implementation - just return registered plugins
    return [...this.plugins];
  }

  /**
   * Get all available plugins
   */
  getAvailablePlugins(): Plugin[] {
    return [...this.plugins];
  }

  /**
   * Register a plugin manually
   */
  registerPlugin(plugin: Plugin): void {
    this.plugins.push(plugin);
  }
}

// Export a singleton instance of the plugin discovery
export const pluginDiscovery = new BasicPluginDiscovery();
