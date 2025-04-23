/**
 * Core plugin system for Docen
 * Defines plugin interfaces and provides basic plugins
 */
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import type { Node } from "../ast";
import type {
  CollaborativeDocument,
  PluginDiscovery,
  PluginMeta,
} from "../types";

/**
 * Collaborative processor plugin with Yjs integration
 */
export function collaborativePlugin(): Plugin {
  return () =>
    function transformer(tree: Node, file: VFile) {
      // Check if file has collaborative document attached
      const vfile = file as VFile & {
        collaborativeDocument?: CollaborativeDocument;
      };

      if (!vfile.collaborativeDocument) {
        return tree;
      }

      // Add collaboration metadata to nodes that don't have it
      function addCollaborationMetadata(node: Node) {
        if (!node.collaborationMetadata) {
          node.collaborationMetadata = {
            createdAt: Date.now(),
            lastModifiedTimestamp: Date.now(),
            version: 1,
            origin: "system",
          };
        }

        if ("children" in node && Array.isArray((node as any).children)) {
          (node as any).children.forEach(addCollaborationMetadata);
        }
      }

      // Process the tree
      addCollaborationMetadata(tree);

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
