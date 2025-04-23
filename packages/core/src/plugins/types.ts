/**
 * Plugin system types for Docen
 * Defining types for plugins and plugin discovery
 */
import type { Plugin } from "unified";
import type { VFile } from "vfile";
import type { Node } from "../ast/types";

/**
 * Plugin discovery interface
 */
export interface PluginDiscovery {
  /**
   * Scan for plugins in a specific path
   */
  scanPlugins(path: string): Promise<Plugin[]>;

  /**
   * Get all available plugins
   */
  getAvailablePlugins(): Plugin[];

  /**
   * Register a plugin manually
   */
  registerPlugin(plugin: Plugin): void;
}

/**
 * Plugin metadata interface
 */
export interface PluginMeta {
  /**
   * Plugin name
   */
  name: string;

  /**
   * Plugin description
   */
  description?: string;

  /**
   * Plugin version
   */
  version?: string;

  /**
   * Plugin author
   */
  author?: string;

  /**
   * Plugin dependencies
   */
  dependencies?: string[];

  /**
   * Supported formats
   */
  formats?: string[];

  /**
   * Plugin configuration schema
   */
  configSchema?: Record<string, unknown>;
}

/**
 * Plugin definition for Docen
 */
export interface DocenPlugin extends Plugin {
  /**
   * Plugin metadata
   */
  meta?: PluginMeta;

  /**
   * Whether plugin is enabled by default
   */
  defaultEnabled?: boolean;

  /**
   * Plugin priority (lower numbers run first)
   */
  priority?: number;

  /**
   * Plugin phase
   */
  phase?: "parse" | "transform" | "compile" | "all";
}

/**
 * Plugin options for Docen processor
 */
export interface PluginOptions {
  /**
   * Custom discovery path
   */
  discoveryPath?: string;

  /**
   * Explicitly enabled plugins
   */
  enabledPlugins?: string[];

  /**
   * Explicitly disabled plugins
   */
  disabledPlugins?: string[];

  /**
   * Plugin settings by name
   */
  pluginSettings?: Record<string, Record<string, unknown>>;
}
