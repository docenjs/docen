/**
 * Container format types and interfaces
 */

import type {
  Array as YArray,
  Doc as YDoc,
  Map as YMap,
  Text as YText,
} from "yjs";

/**
 * Container types supported by Docen
 */
export type ContainerType = "document" | "data" | "presentation";

/**
 * Container file extensions
 */
export type ContainerExtension = ".mdcx" | ".dtcx" | ".ptcx";

/**
 * Base container interface
 */
export interface Container {
  readonly type: ContainerType;
  readonly extension: ContainerExtension;
  readonly metadata: ContainerMetadata;
  readonly yjsDoc: YDoc;
}

/**
 * Container metadata (mutable for internal updates)
 */
export interface ContainerMetadata {
  readonly version: string;
  readonly created: Date;
  modified: Date; // Mutable for sync updates
  readonly title?: string;
  readonly description?: string;
  readonly tags?: string[];
}

/**
 * Document container (.mdcx) - uses Y.Text for collaboration
 */
export interface DocumentContainer extends Container {
  readonly type: "document";
  readonly extension: ".mdcx";
  readonly content: YText;
}

/**
 * Data container (.dtcx) - uses Y.Array and Y.Map for collaboration
 */
export interface DataContainer extends Container {
  readonly type: "data";
  readonly extension: ".dtcx";
  readonly data: YArray<YMap<unknown>>;
}

/**
 * Presentation container (.ptcx) - uses Y.Text + Y.Map for collaboration
 */
export interface PresentationContainer extends Container {
  readonly type: "presentation";
  readonly extension: ".ptcx";
  readonly content: YText;
  readonly layout: YMap<unknown>;
}

/**
 * Union type for all container types
 */
export type AnyContainer =
  | DocumentContainer
  | DataContainer
  | PresentationContainer;
