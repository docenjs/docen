/**
 * DOCX Template system types - c12 configuration-based
 * Following unified.js patterns for VFile compatibility
 */

import type { ConfigLayer, LoadConfigOptions } from "c12";
import type { VFile } from "vfile";

// --- DOCX-specific template types ---

/**
 * DOCX document configuration schema for c12
 */
export interface DocxTemplateConfig {
  /** Document metadata */
  metadata?: {
    title?: string;
    description?: string;
    creator?: string;
    subject?: string;
    keywords?: string;
    category?: string;
    lastModifiedBy?: string;
    revision?: string;
    created?: Date;
    modified?: Date;
  };

  /** Page layout settings */
  pageSettings?: {
    width?: number;
    height?: number;
    orientation?: "portrait" | "landscape";
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
  };

  /** Style definitions for DOCX */
  styles?: {
    paragraphStyles?: DocxStyleDefinition[];
    characterStyles?: DocxStyleDefinition[];
    tableStyles?: DocxStyleDefinition[];
    listStyles?: DocxStyleDefinition[];
  };

  /** Document sections */
  sections?: DocxSectionConfig[];

  /** Headers and footers */
  headerFooter?: {
    header?: DocxHeaderFooterConfig;
    footer?: DocxHeaderFooterConfig;
  };

  /** Numbering definitions */
  numbering?: DocxNumberingConfig[];

  /** Table of contents settings */
  tableOfContents?: DocxTOCConfig;
}

/**
 * DOCX style definition
 */
export interface DocxStyleDefinition {
  id: string;
  name: string;
  type?: "paragraph" | "character" | "table" | "numbering";
  basedOn?: string;
  next?: string;
  quickFormat?: boolean;

  /** Character formatting */
  run?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    size?: number;
    font?: string;
    color?: string;
    highlightColor?: string;
    allCaps?: boolean;
    smallCaps?: boolean;
  };

  /** Paragraph formatting */
  paragraph?: {
    alignment?: "left" | "center" | "right" | "justify";
    spacing?: {
      before?: number;
      after?: number;
      line?: number;
    };
    indent?: {
      left?: number;
      right?: number;
      hanging?: number;
      firstLine?: number;
    };
    borders?: {
      top?: DocxBorderDefinition;
      bottom?: DocxBorderDefinition;
      left?: DocxBorderDefinition;
      right?: DocxBorderDefinition;
    };
    shading?: {
      type?: string;
      color?: string;
      fill?: string;
    };
  };
}

/**
 * DOCX border definition
 */
export interface DocxBorderDefinition {
  style?: string;
  size?: number;
  color?: string;
  space?: number;
}

/**
 * DOCX section configuration
 */
export interface DocxSectionConfig {
  pageSize?: {
    width?: number;
    height?: number;
    orientation?: "portrait" | "landscape";
  };
  pageMargins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    header?: number;
    footer?: number;
  };
  columns?: {
    count?: number;
    space?: number;
    separator?: boolean;
  };
  headers?: DocxHeaderFooterConfig;
  footers?: DocxHeaderFooterConfig;
}

/**
 * DOCX header/footer configuration
 */
export interface DocxHeaderFooterConfig {
  default?: string;
  first?: string;
  even?: string;
}

/**
 * DOCX numbering configuration
 */
export interface DocxNumberingConfig {
  id: string;
  levels: DocxNumberingLevel[];
}

/**
 * DOCX numbering level
 */
export interface DocxNumberingLevel {
  level: number;
  format?:
    | "decimal"
    | "upperRoman"
    | "lowerRoman"
    | "upperLetter"
    | "lowerLetter"
    | "bullet";
  text?: string;
  start?: number;
  indent?: {
    left?: number;
    hanging?: number;
  };
}

/**
 * DOCX table of contents configuration
 */
export interface DocxTOCConfig {
  title?: string;
  styles?: string[];
  levels?: number;
  pageNumbers?: boolean;
  hyperlinks?: boolean;
}

// --- c12 integration types ---

/**
 * c12-based DOCX template loader options
 */
export interface DocxTemplateLoaderOptions
  extends LoadConfigOptions<DocxTemplateConfig> {
  /** Template preset name */
  preset?: string;

  /** VFile for template content */
  vfile?: VFile;

  /** Debug mode */
  debug?: boolean;
}

/**
 * DOCX template processing result
 */
export interface DocxTemplateResult {
  /** Resolved configuration */
  config: DocxTemplateConfig;

  /** Configuration layers from c12 */
  layers: ConfigLayer<DocxTemplateConfig>[];

  /** Source config file path */
  configFile?: string;

  /** VFile template context */
  vfile?: VFile;
}

/**
 * VFile template context for unified.js compatibility
 */
export interface VFileDocxContext {
  /** Template configuration */
  template?: DocxTemplateConfig;

  /** Template processing metadata */
  templateMeta?: {
    preset?: string;
    configFile?: string;
    processed?: Date;
  };
}
