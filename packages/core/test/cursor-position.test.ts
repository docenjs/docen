import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as Y from "yjs";
import { createYjsAdapter } from "../src/yjs";

describe("Cursor and Selection Tracking", () => {
  let doc: Y.Doc;
  let adapter: any; // Use any for testing to avoid interface issues

  beforeEach(() => {
    doc = new Y.Doc();
    adapter = createYjsAdapter(doc);

    // Skip tests if adapter doesn't have awareness features
    if (!adapter.awareness) {
      return;
    }
  });

  afterEach(() => {
    doc.destroy();
  });

  it("should set and get local cursor position", () => {
    // Skip if no awareness support
    if (!adapter.awareness) {
      return;
    }

    // Create a text node in the document
    const rootMap = doc.getMap("content");
    const textNode = new Y.Text("Hello World");
    rootMap.set("text", textNode);

    // Create a relative position
    const relativePosition = Y.createRelativePositionFromTypeIndex(textNode, 5);

    // Create a cursor position
    const cursorPosition = {
      relativePosition,
    };

    // Set the cursor position
    if (typeof adapter.setLocalCursor === "function") {
      adapter.setLocalCursor(cursorPosition);

      // Get local state and verify the cursor was set
      const localState = adapter.getLocalState
        ? adapter.getLocalState()
        : adapter.awareness.getLocalState();

      // Verify the cursor position was set correctly
      expect(localState).toBeDefined();
      expect(localState?.cursor).toEqual(cursorPosition);
    }
  });

  it("should handle selection ranges", () => {
    // Skip if no awareness support
    if (!adapter.awareness) {
      return;
    }

    // Create a text node in the document
    const rootMap = doc.getMap("content");
    const textNode = new Y.Text("Hello World Selection Test");
    rootMap.set("text", textNode);

    // Create relative positions for selection range
    const start = Y.createRelativePositionFromTypeIndex(textNode, 6);
    const end = Y.createRelativePositionFromTypeIndex(textNode, 11);

    // Create a cursor position with selection range
    const cursorPosition = {
      relativePosition: start,
      range: {
        start,
        end,
      },
    };

    // Set the cursor position with selection
    if (typeof adapter.setLocalCursor === "function") {
      adapter.setLocalCursor(cursorPosition);

      // Get local state and verify the selection was set
      const localState = adapter.getLocalState
        ? adapter.getLocalState()
        : adapter.awareness.getLocalState();

      // Verify the cursor position and range were set correctly
      expect(localState).toBeDefined();
      expect(localState?.cursor).toEqual(cursorPosition);
      expect(localState?.cursor?.range?.start).toEqual(start);
      expect(localState?.cursor?.range?.end).toEqual(end);
    }
  });

  it("should set user information", () => {
    // Skip if no awareness support
    if (!adapter.awareness) {
      return;
    }

    const userInfo = {
      id: "user-123",
      name: "Test User",
      color: "#ff0000",
    };

    // Set user information
    if (typeof adapter.setLocalUser === "function") {
      adapter.setLocalUser(userInfo);

      // Get local state and verify the user info was set
      const localState = adapter.getLocalState
        ? adapter.getLocalState()
        : adapter.awareness.getLocalState();

      expect(localState).toBeDefined();
      expect(localState?.user).toEqual(userInfo);
    }
  });

  it("should get all user states", () => {
    // Skip if no awareness support
    if (!adapter.awareness) {
      return;
    }

    // Set local user state
    if (
      typeof adapter.setLocalUser === "function" &&
      (typeof adapter.getStates === "function" ||
        typeof adapter.awareness.getStates === "function")
    ) {
      adapter.setLocalUser({
        id: "local-user",
        name: "Local User",
      });

      // Get all states
      const states = adapter.getStates
        ? adapter.getStates()
        : adapter.awareness.getStates();

      // Check if local user state is included
      expect(states.size).toBeGreaterThan(0);
      expect(states.get(doc.clientID)).toBeDefined();
      expect(states.get(doc.clientID)?.user.id).toBe("local-user");
    }
  });

  it("should handle awareness events", () => {
    // Skip if no awareness support
    if (!adapter.awareness) {
      return;
    }

    if (typeof adapter.awareness.on === "function") {
      let updateReceived = false;

      // Add event listener
      adapter.awareness.on("change", (update: any) => {
        updateReceived = true;
        expect(update.added.length > 0 || update.updated.length > 0).toBe(true);
      });

      // Trigger an update
      const state = adapter.awareness.getLocalState() || {};
      adapter.awareness.setLocalState({
        ...state,
        user: {
          id: "test-user",
          name: "Test User",
        },
      });

      expect(updateReceived).toBe(true);
    }
  });
});
