/**
 * Archive and container-related AST node definitions
 *
 * This file contains definitions for archive and container nodes.
 */

import type { Node } from "../base";
import type { Block } from "../document/index";
import type {
  EPUBGuideItem,
  EPUBManifestItem,
  EPUBNavigation,
  EPUBPackage,
  EPUBSpineItem,
} from "./epub";

/**
 * Container entry representing a single file or directory in a container
 */
export interface ContainerEntry {
  /** Entry name */
  name: string;
  /** Entry path */
  path: string;
  /** Entry type */
  type: "file" | "directory";
  /** Entry size in bytes */
  size?: number;
  /** Entry last modified date */
  lastModified?: Date;
  /** Entry compression method */
  compressionMethod?: string;
  /** Entry compressed size */
  compressedSize?: number;
  /** Entry checksum */
  checksum?: string;
  /** Entry is encrypted */
  encrypted?: boolean;
  /** Entry content type */
  contentType?: string;
  /** Entry children (for directories) */
  children?: ContainerEntry[];
  /** Entry content (for parsed files) */
  content?: Block | Node;
}

/**
 * Container type literals for type checking
 */
export type ContainerType =
  | "container"
  | "archiveContainer"
  | "epubContainer"
  | "ooxmlContainer";

/**
 * Base container node
 */
export interface Container extends Node {
  type: ContainerType;
  /** Container format */
  format: string;
  /** Container version */
  version?: string;
  /** Container entries */
  entries: ContainerEntry[];
  /** Container metadata */
  metadata?: {
    /** Container created date */
    created?: Date;
    /** Container modified date */
    modified?: Date;
    /** Container author */
    author?: string;
    /** Container comment */
    comment?: string;
    /** Container source system */
    system?: string;
    /** Container encryption method */
    encryption?: string;
    /** Container compression method */
    compression?: string;
    /** Container total size */
    totalSize?: number;
    /** Container compressed size */
    compressedSize?: number;
    /** Container entry count */
    entryCount?: number;
  };
  /** Container parsed content */
  content?: (Block | Node)[];
}

/**
 * Archive container node (ZIP, RAR, TAR, etc.)
 */
export interface ArchiveContainer extends Container {
  type: "archiveContainer";
  /** Archive type */
  archiveType: "zip" | "rar" | "tar" | "7z" | "gzip" | "bzip2";
  /** Archive solid compression */
  solid?: boolean;
  /** Archive recovery record */
  recoveryRecord?: boolean;
  /** Archive password protected */
  passwordProtected?: boolean;
  /** Archive multi-volume */
  multiVolume?: boolean;
  /** Archive volume number */
  volumeNumber?: number;
  /** Archive total volumes */
  totalVolumes?: number;
}

/**
 * EPUB container node
 */
export interface EPUBContainer extends Container {
  type: "epubContainer";
  /** EPUB version */
  epubVersion: "2.0" | "3.0" | "3.1" | "3.2";
  /** EPUB package */
  package?: EPUBPackage;
  /** EPUB manifest */
  manifest?: EPUBManifestItem[];
  /** EPUB spine */
  spine?: EPUBSpineItem[];
  /** EPUB guide */
  guide?: EPUBGuideItem[];
  /** EPUB navigation */
  navigation?: EPUBNavigation[];
}

/**
 * OOXML relationship interface
 */
export interface OOXMLRelationship {
  /** Relationship ID */
  id: string;
  /** Relationship type */
  type: string;
  /** Relationship target */
  target: string;
  /** Relationship target mode */
  targetMode?: "Internal" | "External";
}

/**
 * OOXML core properties interface
 */
export interface OOXMLCoreProperties {
  /** Core title */
  title?: string;
  /** Core subject */
  subject?: string;
  /** Core creator */
  creator?: string;
  /** Core keywords */
  keywords?: string;
  /** Core description */
  description?: string;
  /** Core last modified by */
  lastModifiedBy?: string;
  /** Core revision */
  revision?: string;
  /** Core created */
  created?: Date;
  /** Core modified */
  modified?: Date;
  /** Core category */
  category?: string;
  /** Core content status */
  contentStatus?: string;
}

/**
 * OOXML container node (DOCX, XLSX, PPTX)
 */
export interface OOXMLContainer extends Container {
  type: "ooxmlContainer";
  /** OOXML type */
  ooxmlType: "wordprocessingml" | "spreadsheetml" | "presentationml";
  /** OOXML application */
  application?: string;
  /** OOXML application version */
  applicationVersion?: string;
  /** OOXML content type mapping */
  contentTypes?: Record<string, string>;
  /** OOXML relationships */
  relationships?: OOXMLRelationship[];
  /** OOXML custom properties */
  customProperties?: Record<string, unknown>;
  /** OOXML core properties */
  coreProperties?: OOXMLCoreProperties;
}
