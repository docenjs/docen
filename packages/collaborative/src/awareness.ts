import { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";
import type { AwarenessState } from "./types";

/**
 * Creates an awareness wrapper for a Yjs document
 *
 * @param ydoc Yjs document instance
 * @param initialState Initial awareness state (optional)
 * @returns Awareness API
 */
export function createAwareness(
  ydoc: Y.Doc,
  initialState?: Partial<AwarenessState>,
) {
  // Create awareness instance
  const awareness = new Awareness(ydoc);

  // Set default local state
  const defaultState: AwarenessState = {
    id: generateUserId(),
    name: "Anonymous",
    ...(initialState || {}),
  };

  // Set initial state
  if (initialState) {
    awareness.setLocalState(defaultState);
  }

  return {
    /**
     * Get all awareness states
     */
    getStates: () => {
      const states = new Map<number, AwarenessState>();
      awareness.getStates().forEach((state, clientId: number) => {
        // Verify that the state has required properties before casting
        if (
          typeof state === "object" &&
          state &&
          "id" in state &&
          "name" in state
        ) {
          states.set(clientId, state as unknown as AwarenessState);
        }
      });
      return states;
    },

    /**
     * Set local user state
     */
    setLocalState: (state: Partial<AwarenessState>) => {
      const currentState = awareness.getLocalState() as
        | AwarenessState
        | undefined;
      awareness.setLocalState({
        ...currentState,
        ...state,
      });
    },

    /**
     * Get local user state
     */
    getLocalState: () => {
      return awareness.getLocalState() as AwarenessState | undefined;
    },

    /**
     * Observe awareness changes
     */
    observe: (
      callback: (changes: {
        added: number[];
        updated: number[];
        removed: number[];
      }) => void,
    ) => {
      awareness.on("change", callback);
      return () => {
        awareness.off("change", callback);
      };
    },

    /**
     * Destroy awareness
     */
    destroy: () => {
      awareness.destroy();
    },
  };
}

/**
 * Generate a random user ID
 */
function generateUserId(): string {
  return Math.random().toString(36).substring(2, 15);
}
