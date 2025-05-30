/**
 * Container factory functions
 */

import { Doc as YDoc, type Map as YMap } from "yjs";
import type { AnyContainer, ContainerType } from "../types";

/**
 * Create a new container of the specified type
 */
export function createContainer(type: ContainerType): AnyContainer {
  const yjsDoc = new YDoc();
  const now = new Date();

  const baseMetadata = {
    version: "1.0.0",
    created: now,
    modified: now,
  };

  switch (type) {
    case "document": {
      const content = yjsDoc.getText("content");
      return {
        type: "document",
        extension: ".mdcx",
        metadata: baseMetadata,
        yjsDoc,
        content,
      };
    }

    case "data": {
      const data = yjsDoc.getArray<YMap<unknown>>("data");
      return {
        type: "data",
        extension: ".dtcx",
        metadata: baseMetadata,
        yjsDoc,
        data,
      };
    }

    case "presentation": {
      const content = yjsDoc.getText("content");
      const layout = yjsDoc.getMap("layout");
      return {
        type: "presentation",
        extension: ".ptcx",
        metadata: baseMetadata,
        yjsDoc,
        content,
        layout,
      };
    }

    default:
      throw new Error(`Unknown container type: ${type}`);
  }
}
