/**
 * Core plugin system for Docen
 * Defines plugin interfaces and provides basic plugins
 */
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import type { Node } from "../types";
import type { DocenProcessor } from "../types";

/**
 * Interface for plugin discovery mechanisms
 */
export interface PluginDiscovery {
  scanPlugins(path: string): Promise<Plugin[]>;
  getAvailablePlugins(): Plugin[];
  registerPlugin(plugin: Plugin): void;
}

/**
 * Collaborative processor plugin with Yjs integration
 */
export function collaborativePlugin(): Plugin {
  return () =>
    function transformer(this: DocenProcessor, tree: Node, file: VFile) {
      // Check if file has collaborative document attached
      // Access the processor context to check if collaboration is active
      // (Assuming transformer is run within the processor scope where 'this' is the processor)
      const adapter = this.getYjsAdapter ? this.getYjsAdapter() : null;

      if (!adapter) {
        console.warn(
          "collaborativePlugin: YjsAdapter not found on processor context. Collaboration features might be disabled or not initialized.",
        );
        return tree;
      }

      // This plugin's role is now mainly to signal that collaboration is active
      // or potentially perform setup tasks that require the adapter.
      // Actual node binding should happen elsewhere (e.g., when loading content into Yjs).
      console.log("collaborativePlugin: Collaboration is active.");

      // Example: Potentially attach adapter info to VFile if needed by subsequent non-context-aware plugins?
      // file.data = { ...(file.data || {}), yjsAdapterAvailable: true };

      // Return the original tree, no modifications needed here for metadata.
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
  } = {},
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
    collaborativePlugin(),
    changeTrackingPlugin(),
    fragmentationPlugin(),
    cursorTrackingPlugin(),
  ];

  /**
   * Scan a directory for plugins
   */
  async scanPlugins(path: string): Promise<Plugin[]> {
    // In a real implementation, this would dynamically load plugins
    // from the specified path using dynamic imports or require
    return this.plugins;
  }

  /**
   * Get all available plugins
   */
  getAvailablePlugins(): Plugin[] {
    return this.plugins;
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
