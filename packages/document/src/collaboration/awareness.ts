import type { AwarenessState, Awareness as CoreAwareness } from "@docen/core";
import type { Awareness as YProtocolsAwareness } from "y-protocols/awareness";
import type * as Y from "yjs";

/**
 * Wraps the y-protocols Awareness instance to conform to the CoreAwareness interface.
 */
export class DocenAwarenessAdapter implements CoreAwareness {
  readonly clientID: number;
  doc: Y.Doc;
  private yAwareness: YProtocolsAwareness;

  constructor(yAwareness: YProtocolsAwareness) {
    this.yAwareness = yAwareness;
    this.clientID = yAwareness.clientID;
    this.doc = yAwareness.doc;
  }

  // --- CoreAwareness Implementation ---

  getLocalState(): AwarenessState | null {
    // Attempt to cast, acknowledging potential runtime issues if state is invalid
    return this.yAwareness.getLocalState() as AwarenessState | null;
  }

  setLocalState(state: Partial<AwarenessState> | null): void {
    this.yAwareness.setLocalState(state);
  }

  setLocalStateField(field: string, value: any): void {
    this.yAwareness.setLocalStateField(field, value);
  }

  getStates(): Map<number, AwarenessState> {
    // Attempt to cast, acknowledging potential runtime issues if states are invalid
    return this.yAwareness.getStates() as Map<number, AwarenessState>;
  }

  on(
    event: "change" | "update",
    cb: (
      changes: { added: number[]; updated: number[]; removed: number[] },
      origin: any
    ) => void
  ): void {
    this.yAwareness.on(event, cb);
  }

  off(
    event: "change" | "update",
    cb: (
      changes: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown
    ) => void
  ): void {
    this.yAwareness.off(event, cb);
  }

  destroy(): void {
    this.yAwareness.destroy();
  }
}
