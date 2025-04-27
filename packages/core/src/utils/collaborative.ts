/**
 * Collaborative editing utilities
 * Provides helper functions for working with collaborative documents and Yjs
 */
import * as Y from "yjs";
import {
  AbsolutePosition,
  ID,
  RelativePosition,
  applyUpdate,
  createAbsolutePositionFromRelativePosition,
  createRelativePositionFromJSON,
  encodeStateAsUpdate,
} from "yjs";
import type {
  Awareness,
  AwarenessState,
  CursorInfo,
  CursorPosition,
} from "../types";

/**
 * Create a relative position from a shared type and offset
 */
export function createRelativePosition(
  sharedType: Y.AbstractType<any>,
  offset: number,
): Y.RelativePosition {
  return Y.createRelativePositionFromTypeIndex(sharedType, offset);
}

/**
 * Create a relative position from a document path and offset
 */
export function createRelativePositionFromPath(
  doc: Y.Doc,
  path: (string | number)[],
  offset: number,
): Y.RelativePosition {
  const sharedType = getNodeAtPath(doc, path);
  if (!sharedType) {
    throw new Error(`Cannot find shared type at path: ${path}`);
  }
  return createRelativePosition(sharedType, offset);
}

/**
 * Convert a relative position to an absolute position
 */
export function createAbsolutePosition(
  relPos: Y.RelativePosition,
  doc: Y.Doc,
): Y.AbsolutePosition | null {
  return Y.createAbsolutePositionFromRelativePosition(relPos, doc);
}

/**
 * Convert an absolute position to a path and offset
 */
export function absolutePositionToPathOffset(
  absPos: Y.AbsolutePosition,
): { path: string[]; offset: number } | null {
  if (!absPos || !absPos.type) return null;

  const path: string[] = [];
  let currentType = absPos.type;

  // Build path by traversing the tree upwards
  while (currentType?._item?.parent) {
    const parent = currentType._item.parent;

    if (parent instanceof Y.Map) {
      // Find the key in the parent's map
      for (const [key, value] of parent.entries()) {
        if (value === currentType) {
          path.unshift(key);
          break;
        }
      }
    } else if (parent instanceof Y.Array) {
      // Handle YArray case differently
      const index = parent.toArray().indexOf(currentType);
      if (index !== -1) {
        path.unshift(index.toString());
      }
    }

    currentType = parent;
  }

  return {
    path,
    offset: absPos.index,
  };
}

/**
 * Get a node at a specific path in the Yjs document
 */
export function getNodeAtPath(
  doc: Y.Doc,
  path: (string | number)[],
): Y.AbstractType<any> | null {
  if (!path || path.length === 0) return null;

  let current: Y.AbstractType<any> | null = doc.get(
    path[0].toString(),
    Y.AbstractType,
  ) as Y.AbstractType<any>;
  if (!current) return null;

  for (let i = 1; i < path.length; i++) {
    const segment = path[i];

    if (current instanceof Y.Map) {
      current = current.get(segment.toString()) as Y.AbstractType<any>;
    } else if (current instanceof Y.Array) {
      const index =
        typeof segment === "number"
          ? segment
          : Number.parseInt(segment.toString(), 10);
      if (Number.isNaN(index)) return null;
      current = current.get(index) as Y.AbstractType<any>;
    } else {
      return null;
    }

    if (!current) return null;
  }

  return current;
}

/**
 * Get all user cursors from awareness states
 */
export function getAwarenessCursors(awareness: Awareness): CursorInfo[] {
  const cursors: CursorInfo[] = [];

  try {
    const states = awareness.getStates();

    for (const [clientId, state] of states.entries()) {
      if (!state?.cursor) continue;

      const { cursor, selection } = state;
      const doc = awareness.doc;

      let absolutePosition: Y.AbsolutePosition | null = null;
      if (cursor?.relativePosition) {
        try {
          absolutePosition = createAbsolutePositionFromRelativePosition(
            cursor.relativePosition,
            doc,
          );
        } catch (e) {
          console.warn(
            `[getAwarenessCursors] Error creating absolute position for client ${clientId}`,
            e,
          );
        }
      }

      let absoluteSelection: {
        anchor: Y.AbsolutePosition | null;
        head: Y.AbsolutePosition | null;
      } | null = null;
      if (selection) {
        try {
          absoluteSelection = {
            anchor: selection.anchor
              ? createAbsolutePositionFromRelativePosition(
                  selection.anchor,
                  doc,
                )
              : null,
            head: selection.head
              ? createAbsolutePositionFromRelativePosition(selection.head, doc)
              : null,
          };
        } catch (e) {
          console.warn(
            `[getAwarenessCursors] Error creating absolute selection for client ${clientId}`,
            e,
          );
        }
      }

      cursors.push({
        clientId,
        userName: state.user?.name ?? `User ${clientId}`,
        color:
          state.user?.color ??
          `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        position: absolutePosition
          ? absolutePositionToPathOffset(absolutePosition)
          : null,
        active: state.active ?? false,
        selection: absoluteSelection,
      });
    }
  } catch (e) {
    console.error("Error getting awareness cursors:", e);
  }

  return cursors;
}

/**
 * Calculate text document statistics
 */
export function calculateDocumentStats(
  doc: Y.Doc,
  awareness?: Awareness,
): DocumentStats {
  const totalNodes = 0;
  const totalCharacters = 0;
  const nodesTyped: Record<string, number> = {};
  const collaboratorIds = new Set<string>();

  try {
    // Count nodes and characters in the document
    for (const [key, value] of doc.share.entries()) {
      if (value instanceof Y.XmlFragment) {
        countNodes(value);
      }
    }

    // Count unique collaborators from the document
    const collaborators = Array.from(
      new Set(doc.getClients().map((id) => id.toString())),
    );

    // Add active users from awareness
    if (awareness) {
      const states = awareness.getStates();
      for (const [clientId] of states.entries()) {
        collaboratorIds.add(clientId.toString());
      }
    }

    // Get the last modified date from all updates
    const lastMod = doc.getUpdateV2();

    // Return the collected statistics
    return {
      totalNodes,
      totalCharacters,
      nodesTyped,
      collaborators: Array.from(collaboratorIds.values()).map((id) => ({
        id,
        name: `User ${id}`,
      })),
      lastModified: lastMod ? new Date().toISOString() : null,
    };
  } catch (e) {
    console.error("Error calculating document statistics:", e);
    return {
      totalNodes: 0,
      totalCharacters: 0,
      nodesTyped: {},
      collaborators: [],
      lastModified: null,
    };
  }
}
