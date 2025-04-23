/**
 * VFile extensions for collaborative capabilities
 * Adds collaborative data and methods to VFile instances
 */
import type { VFile, VFileData } from "vfile";
import * as Y from "yjs";
import type { CollaborativeDocument } from "../document/types";
import type { Awareness } from "../yjs/awareness";
import type { AwarenessState } from "../yjs/types";

/**
 * Extended data for VFile that includes collaborative properties
 */
export interface CollaborativeVFileData extends VFileData {
  /**
   * Reference to the collaborative document
   */
  collaborativeDocument?: CollaborativeDocument;

  /**
   * Awareness information for the document
   */
  awareness?: {
    /**
     * The local client ID
     */
    clientId: number;

    /**
     * Current cursor position
     */
    cursor?: {
      index: number;
      length: number;
      path: (string | number)[];
    };

    /**
     * User information
     */
    user?: {
      name?: string;
      id?: string;
      color?: string;
    };
  };
}

/**
 * Get the collaborative document from a VFile instance
 */
export function getCollaborativeDocument(
  file: VFile
): CollaborativeDocument | undefined {
  return (file.data as CollaborativeVFileData).collaborativeDocument;
}

/**
 * Set the collaborative document on a VFile instance
 */
export function setCollaborativeDocument(
  file: VFile,
  document: CollaborativeDocument
): VFile {
  (file.data as CollaborativeVFileData).collaborativeDocument = document;
  return file;
}

/**
 * Get the awareness instance from a VFile
 */
export function getAwareness(file: VFile): Awareness | undefined {
  const doc = getCollaborativeDocument(file);
  return doc?.awareness;
}

/**
 * Create a relative position from path and offset (utility function)
 */
function createRelativePositionFromPath(
  doc: Y.Doc,
  path: (string | number)[],
  offset: number
): Y.RelativePosition {
  // This is a simplified placeholder - in a real implementation,
  // this would use proper Yjs API to create a relative position
  const type = doc.getMap("root");
  return Y.createRelativePositionFromTypeIndex(type, offset);
}

/**
 * Update cursor position in the VFile awareness
 */
export function updateCursor(
  file: VFile,
  path: (string | number)[],
  offset: number
): void {
  const awareness = getAwareness(file);
  if (!awareness) {
    return;
  }

  const localState =
    (awareness.getLocalState() as Partial<AwarenessState>) || {};
  const doc = getCollaborativeDocument(file)?.ydoc;

  if (!doc) {
    return;
  }

  // Create cursor position using Yjs relative position
  const cursorPosition = createRelativePositionFromPath(doc, path, offset);

  const updatedState: AwarenessState = {
    user: localState.user || { name: "Anonymous" },
    status: "online",
    cursor: cursorPosition,
  };

  awareness.setLocalState(updatedState);
}

/**
 * Update selection in the VFile awareness
 */
export function updateSelection(
  file: VFile,
  anchorPath: (string | number)[],
  anchorOffset: number,
  headPath: (string | number)[],
  headOffset: number
): void {
  const awareness = getAwareness(file);
  if (!awareness) {
    return;
  }

  const localState =
    (awareness.getLocalState() as Partial<AwarenessState>) || {};
  const doc = getCollaborativeDocument(file)?.ydoc;

  if (!doc) {
    return;
  }

  // Create selection positions using Yjs relative positions
  const anchor = createRelativePositionFromPath(doc, anchorPath, anchorOffset);
  const head = createRelativePositionFromPath(doc, headPath, headOffset);

  const updatedState: AwarenessState = {
    user: localState.user || { name: "Anonymous" },
    status: "online",
    selection: {
      anchor,
      head,
    },
  };

  awareness.setLocalState(updatedState);
}

/**
 * Update the local client's user information
 */
export function updateUserInfo(
  file: VFile,
  userInfo: { name?: string; id?: string; color?: string; avatar?: string }
): VFile {
  const data = file.data as CollaborativeVFileData;

  if (!data.awareness) {
    data.awareness = {
      clientId: 0,
    };
  }

  data.awareness.user = userInfo;

  // Update awareness if available
  const awareness = getAwareness(file);
  if (awareness) {
    const currentState = awareness.getLocalState() || {};

    const updatedState: AwarenessState = {
      ...currentState,
      user: {
        name: userInfo.name,
        id: userInfo.id,
        color: userInfo.color,
        avatar: userInfo.avatar,
      },
    };

    awareness.setLocalState(updatedState);
  }

  return file;
}

/**
 * Get all connected users and their states
 */
export function getAllUserStates(file: VFile): Record<number, unknown> {
  const awareness = getAwareness(file);
  if (!awareness) {
    return {};
  }

  const statesMap = awareness.getStates();
  const statesObj: Record<number, unknown> = {};

  // Convert Map to plain object
  statesMap.forEach((value, key) => {
    statesObj[key] = value;
  });

  return statesObj;
}
