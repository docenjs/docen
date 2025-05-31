/**
 * Yjs synchronization utilities
 */

import { applyUpdate, encodeStateAsUpdate } from "yjs";
import type { AnyContainer } from "../types";

/**
 * Synchronization manager for containers
 */
export class ContainerSync {
  private container: AnyContainer;

  constructor(container: AnyContainer) {
    this.container = container;
  }

  /**
   * Get the current state as an update
   */
  getStateUpdate(): Uint8Array {
    return encodeStateAsUpdate(this.container.yjsDoc);
  }

  /**
   * Apply an update to the container
   */
  applyUpdate(update: Uint8Array): void {
    applyUpdate(this.container.yjsDoc, update);
  }

  /**
   * Subscribe to document updates
   */
  onUpdate(
    callback: (update: Uint8Array, origin: unknown) => void
  ): () => void {
    this.container.yjsDoc.on("update", callback);

    return () => {
      this.container.yjsDoc.off("update", callback);
    };
  }

  /**
   * Subscribe to document changes
   */
  onChange(callback: () => void): () => void {
    const handler = () => {
      // Update metadata timestamp
      this.container.metadata.modified = new Date();
      callback();
    };

    this.container.yjsDoc.on("update", handler);

    return () => {
      this.container.yjsDoc.off("update", handler);
    };
  }

  /**
   * Get document size in bytes
   */
  getSize(): number {
    return this.getStateUpdate().length;
  }

  /**
   * Check if document has pending changes
   */
  hasPendingChanges(): boolean {
    // This is a simplified check - in a real implementation,
    // you might want to track this more precisely
    return this.container.yjsDoc.clientID !== 0;
  }
}
