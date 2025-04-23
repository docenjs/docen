/**
 * Awareness types and utilities for collaborative editing
 * This provides type-safe implementation of Yjs awareness functionality
 */
import type * as Y from "yjs";
import type { AwarenessState } from "../types";

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
 * Extended interface for Y.Awareness to improve type safety
 */
export class Awareness {
  private yDoc: Y.Doc;
  private awarenessStates: Map<number, AwarenessState>;
  private eventHandlers: Map<string, Set<AwarenessCallback>> = new Map();

  constructor(yDoc: Y.Doc) {
    this.yDoc = yDoc;
    this.awarenessStates = new Map();
  }

  /**
   * Set local state information
   * @param state Client state to set
   * @param origin Source of the change (defaults to null)
   */
  setLocalState(state: AwarenessState, origin: unknown = null): void {
    const clientID = this.yDoc.clientID;
    const prevState = this.awarenessStates.get(clientID);

    if (JSON.stringify(prevState) === JSON.stringify(state)) {
      return; // No change, skip update
    }

    this.awarenessStates.set(clientID, state);

    const changes: AwarenessChanges = {
      added: [],
      updated: [clientID],
      removed: [],
    };

    if (!prevState) {
      changes.updated = [];
      changes.added = [clientID];
    }

    this.emit("change", changes, origin);
  }

  /**
   * Get local state information
   * @returns Local client state or null if not set
   */
  getLocalState(): AwarenessState | null {
    const clientID = this.yDoc.clientID;
    return this.awarenessStates.get(clientID) || null;
  }

  /**
   * Get all connected client states
   * @returns Map of client IDs to their states
   */
  getStates(): Map<number, AwarenessState> {
    return new Map(this.awarenessStates);
  }

  /**
   * Remove client state
   * @param clientID Client ID to remove
   * @param origin Source of the change (defaults to null)
   */
  removeState(clientID: number, origin: unknown = null): void {
    if (this.awarenessStates.has(clientID)) {
      this.awarenessStates.delete(clientID);

      const changes: AwarenessChanges = {
        added: [],
        updated: [],
        removed: [clientID],
      };

      this.emit("change", changes, origin);
    }
  }

  /**
   * Remove all client states
   * @param origin Source of the change
   */
  removeAllStates(origin: unknown = null): void {
    const clientIDs = Array.from(this.awarenessStates.keys());
    if (clientIDs.length > 0) {
      for (const clientID of clientIDs) {
        this.awarenessStates.delete(clientID);
      }

      const changes: AwarenessChanges = {
        added: [],
        updated: [],
        removed: clientIDs,
      };

      this.emit("change", changes, origin);
    }
  }

  /**
   * Subscribe to awareness events
   * @param event Event name ('change', 'update', etc.)
   * @param callback Event handler function
   */
  on(event: string, callback: AwarenessCallback): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)?.add(callback);
  }

  /**
   * Unsubscribe from awareness events
   * @param event Event name
   * @param callback Event handler function to remove
   */
  off(event: string, callback: AwarenessCallback): void {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event)?.delete(callback);
    }
  }

  /**
   * Emit an awareness event
   * @param event Event name
   * @param changes Awareness changes object
   * @param origin Source of the change
   * @internal
   */
  emit(event: string, changes: AwarenessChanges, origin: unknown): void {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        for (const callback of handlers) {
          callback(changes, origin);
        }
      }
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.awarenessStates.clear();
    this.eventHandlers.clear();
  }
}
