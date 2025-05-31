/**
 * Yjs awareness utilities for user presence and cursor tracking
 */

import { Awareness } from "y-protocols/awareness";
import type { AnyContainer } from "../types";

/**
 * User information for awareness
 */
export interface UserInfo {
  id: string;
  name: string;
  color: string;
  cursor?: {
    position: number;
    selection?: {
      start: number;
      end: number;
    };
  };
}

/**
 * Awareness manager for containers
 */
export class ContainerAwareness {
  private awareness: Awareness;

  constructor(container: AnyContainer) {
    this.awareness = new Awareness(container.yjsDoc);
  }

  /**
   * Set local user information
   */
  setUser(user: UserInfo): void {
    this.awareness.setLocalStateField("user", user);
  }

  /**
   * Get all connected users
   */
  getUsers(): Map<number, UserInfo> {
    const users = new Map<number, UserInfo>();
    this.awareness.getStates().forEach((state, clientId) => {
      if (state.user) {
        users.set(clientId, state.user);
      }
    });
    return users;
  }

  /**
   * Update cursor position
   */
  setCursor(
    position: number,
    selection?: { start: number; end: number }
  ): void {
    const currentUser = this.awareness.getLocalState()?.user;
    if (currentUser) {
      this.awareness.setLocalStateField("user", {
        ...currentUser,
        cursor: { position, selection },
      });
    }
  }

  /**
   * Subscribe to awareness changes
   */
  onUsersChange(callback: (users: Map<number, UserInfo>) => void): () => void {
    const handler = () => {
      callback(this.getUsers());
    };

    this.awareness.on("change", handler);

    return () => {
      this.awareness.off("change", handler);
    };
  }

  /**
   * Destroy awareness
   */
  destroy(): void {
    this.awareness.destroy();
  }
}
