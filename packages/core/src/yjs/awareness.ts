import { Awareness as YAwareness } from "y-protocols/awareness";
import type { AwarenessState, CursorPosition } from "../types";

/**
 * Type definition for awareness changes
 */
export interface AwarenessChanges {
  added: number[];
  updated: number[];
  removed: number[];
}

/**
 * Type definition for awareness callbacks
 */
export type AwarenessCallback = (
  changes: AwarenessChanges,
  origin: unknown
) => void;

/**
 * Awareness adapter for collaborative editing
 * Implementation that meets the requirements of the Docen project
 * while maintaining API compatibility with YAwareness
 */
export class Awareness extends YAwareness {
  /**
   * Helper method to get the local state with proper typing
   */
  getLocalStateTyped(): AwarenessState | undefined {
    const state = super.getLocalState();
    return state as AwarenessState | undefined;
  }

  /**
   * Set the local state with validation
   */
  setLocalState(state: Partial<AwarenessState> | null): void {
    if (state === null) {
      super.setLocalState(null);
      return;
    }

    // Ensure we always have a properly structured state
    const currentState = this.getLocalStateTyped() || {
      user: { id: "anonymous", name: "Anonymous" },
      cursor: null,
    };

    // Merge the new state with the current state
    const mergedState: AwarenessState = {
      ...currentState,
      ...state,
      // Make sure user is always defined
      user: {
        ...currentState.user,
        ...(state.user || {}),
      },
    };

    super.setLocalState(mergedState as any);
  }

  /**
   * Set local cursor position
   */
  setLocalCursor(position: CursorPosition | null): void {
    const state = this.getLocalStateTyped() || {
      user: { id: "anonymous", name: "Anonymous" },
      cursor: null,
    };

    this.setLocalState({
      ...state,
      cursor: position,
    });
  }

  /**
   * Set local user information
   */
  setLocalUser(user: AwarenessState["user"]): void {
    const state = this.getLocalStateTyped() || {
      user: { id: "anonymous", name: "Anonymous" },
      cursor: null,
    };

    this.setLocalState({
      ...state,
      user,
    });
  }

  /**
   * Register a change listener
   */
  on(
    event: string,
    callback: (
      changes: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown
    ) => void
  ): void {
    // Cast to any for compatibility with super.on which might expect a generic Function type internally
    super.on(event, callback as any);
  }

  /**
   * Remove a change listener
   */
  off(
    event: string,
    callback: (
      changes: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown
    ) => void
  ): void {
    // Cast to any for compatibility with super.off
    super.off(event, callback as any);
  }

  /**
   * Get the local state with proper typing.
   * Overrides the base class method.
   */
  getLocalState(): AwarenessState | null {
    const state = super.getLocalState();
    // Return null if state is null/undefined, otherwise cast
    return state ? (state as AwarenessState) : null;
  }

  /**
   * Get all states as a new Map instance.
   * Overrides the base class method to ensure a copy is returned.
   */
  getStates(): Map<number, AwarenessState> {
    // Return a new Map instance (copy) with correctly typed values
    const states = super.getStates();
    const typedStates = new Map<number, AwarenessState>();
    states.forEach((state, clientId) => {
      typedStates.set(clientId, state as AwarenessState);
    });
    return typedStates;
  }

  /**
   * Destroy the Awareness instance and clean up listeners.
   * Overrides the base class method.
   */
  destroy(): void {
    super.destroy();
  }

  /**
   * Forward all other method calls to the underlying YAwareness instance
   */
  [key: string]: any;
}
