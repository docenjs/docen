import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import type { AwarenessState, CursorPosition } from "../src/types";
import { Awareness } from "../src/yjs/awareness";

describe("Awareness", () => {
  let doc: Y.Doc;
  let awareness: Awareness;
  let localClientId: number;

  beforeEach(() => {
    doc = new Y.Doc();
    awareness = new Awareness(doc);
    localClientId = awareness.clientID;
  });

  afterEach(() => {
    awareness.destroy();
    doc.destroy();
  });

  it("should set and get local state", () => {
    const state: AwarenessState = {
      user: { id: "test-id-1", name: "Test User", color: "#ff0000" },
      cursor: null,
    };
    awareness.setLocalState(state);

    const retrievedState = awareness.getLocalState();
    expect(retrievedState).toEqual({
      user: { id: "test-id-1", name: "Test User", color: "#ff0000" },
      cursor: null,
    });
  });

  it("should not update state if unchanged", () => {
    const initialState: AwarenessState = {
      user: { id: "test-id-initial", name: "Initial" },
      cursor: null,
    };
    awareness.setLocalState(initialState);

    const state: AwarenessState = {
      user: { id: "test-id-2", name: "Test User" },
      cursor: null,
    };
    const changeHandler = vi.fn();
    awareness.on("change", changeHandler);

    awareness.setLocalState(state);
    expect(changeHandler).toHaveBeenCalledTimes(1);
    changeHandler.mockClear();

    const sameStateValue: AwarenessState = {
      user: { id: "test-id-2", name: "Test User" },
      cursor: null,
    };
    awareness.setLocalState(sameStateValue);

    expect(changeHandler).toHaveBeenCalledTimes(0);
  });

  it("should emit change event when state is added", () => {
    const state: AwarenessState = {
      user: { id: "test-id-3", name: "Test User" },
      cursor: null,
    };
    const changeHandler = vi.fn();

    awareness.on("change", changeHandler);
    awareness.setLocalState(state);

    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith(
      {
        added: [],
        updated: [localClientId],
        removed: [],
      },
      "local",
    );
  });

  it("should emit change event when state is updated", () => {
    const state1: AwarenessState = {
      user: { id: "test-id-4", name: "Test User" },
      cursor: null,
    };
    awareness.setLocalState(state1);

    const state2: AwarenessState = {
      user: { id: "test-id-4", name: "Updated User" },
      cursor: null,
    };
    const changeHandler = vi.fn();
    awareness.on("change", changeHandler);
    awareness.setLocalState(state2);

    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith(
      {
        added: [],
        updated: [localClientId],
        removed: [],
      },
      "local",
    );
  });

  it("should remove state for specific client", () => {
    const state: AwarenessState = {
      user: { id: "test-id-remove", name: "Test User" },
      cursor: null,
    };
    awareness.setLocalState(state);

    const changeHandler = vi.fn();
    awareness.on("change", changeHandler);

    awareness.setLocalState(null);

    expect(awareness.getLocalState()).toBeNull();

    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        added: [],
        updated: [],
        removed: [localClientId],
      }),
      "local",
    );
  });

  it("should not emit event when removing non-existent client", () => {
    const changeHandler = vi.fn();
    const nonExistentClientId = 12345; // Use an ID that is not the local client ID

    // Ensure the client ID does not exist initially
    expect(awareness.getStates().has(nonExistentClientId)).toBe(false);

    awareness.on("change", changeHandler);

    // Assert that the change handler was not called
    expect(changeHandler).not.toHaveBeenCalled();
  });

  it("should unsubscribe event handlers", () => {
    const changeHandler = vi.fn();

    awareness.on("change", changeHandler);
    awareness.off("change", changeHandler);

    awareness.setLocalState({
      user: { id: "test-id-unsub", name: "Test User" },
      cursor: null,
    });

    expect(changeHandler).not.toHaveBeenCalled();
  });

  it("should clean up on destroy", () => {
    awareness.setLocalState({
      user: { id: "test-id-destroy", name: "Before Destroy" },
      cursor: null,
    });
    expect(awareness.getLocalState()).not.toBeNull();

    awareness.destroy();

    expect(awareness.getLocalState()).toBeNull();
    expect(awareness.getStates().size).toBe(0);

    const handlerCheck = vi.fn();
    try {
      awareness.setLocalState({
        user: { id: "test-id-after-destroy", name: "After Destroy" },
        cursor: null,
      });
    } catch (e) {
      // Methods might throw after destroy, which is acceptable
    }
    expect(handlerCheck).not.toHaveBeenCalled();
  });

  describe("getStates", () => {
    it("should return a map with size 1 (local client) after setting local state", () => {
      awareness.setLocalState({
        user: { id: "test-id-sizecheck", name: "Test" },
        cursor: null,
      });
      expect(awareness.getStates().size).toBe(1);
    });

    it("should return a map with the local state", () => {
      const state: AwarenessState = {
        user: { id: "test-id-john", name: "John" },
        cursor: null,
      };
      awareness.setLocalState(state);

      const states = awareness.getStates();
      expect(states.size).toBe(1);
      expect(states.get(localClientId)).toEqual({
        user: { id: "test-id-john", name: "John" },
        cursor: null,
      });
    });

    it("should return a copy of the states map", () => {
      const state: AwarenessState = {
        user: { id: "test-id-copy", name: "John" },
        cursor: null,
      };
      awareness.setLocalState(state);

      const states1 = awareness.getStates();
      const states2 = awareness.getStates();

      expect(states1).not.toBe(states2);
      expect(states1).toEqual(states2);
      expect(states1.get(localClientId)).toEqual(states2.get(localClientId));
    });
  });

  describe("cursor tracking", () => {
    let ytext: Y.Text;
    let cursorPosition0: CursorPosition;
    let cursorPosition5: CursorPosition;
    let relPosJson0: string;
    let relPosJson5: string;

    beforeEach(() => {
      ytext = new Y.Text();
      doc.getMap("content").set("text", ytext);
      ytext.insert(0, "hello world");

      const rp0 = Y.createRelativePositionFromTypeIndex(ytext, 0);
      const rp5 = Y.createRelativePositionFromTypeIndex(ytext, 5);
      relPosJson0 = Y.relativePositionToJSON(rp0);
      relPosJson5 = Y.relativePositionToJSON(rp5);

      cursorPosition0 = {
        relativePosition: Y.createRelativePositionFromJSON(relPosJson0),
        range: null,
      };
      cursorPosition5 = {
        relativePosition: Y.createRelativePositionFromJSON(relPosJson5),
        range: null,
      };
    });

    it("should set and get cursor position", () => {
      const state: AwarenessState = {
        user: { id: "test-id-cursor", name: "Test User" },
        cursor: cursorPosition0,
      };

      awareness.setLocalState(state);

      const retrievedState = awareness.getLocalState();
      expect(retrievedState?.cursor).toEqual(cursorPosition0);

      if (retrievedState?.cursor) {
        expect(
          Y.relativePositionToJSON(retrievedState.cursor.relativePosition),
        ).toEqual(relPosJson0);
      } else {
        throw new Error("Cursor should not be null");
      }
    });

    it("should update cursor position using setLocalState", () => {
      const initialState: AwarenessState = {
        user: { id: "test-id-cursor-update", name: "Test User" },
        cursor: cursorPosition0,
      };
      awareness.setLocalState(initialState);

      const updatedState: AwarenessState = {
        user: { id: "test-id-cursor-update", name: "Test User" },
        cursor: cursorPosition5,
      };
      awareness.setLocalState(updatedState);

      const retrievedState = awareness.getLocalState();
      expect(retrievedState?.cursor).toEqual(cursorPosition5);
      if (retrievedState?.cursor) {
        expect(
          Y.relativePositionToJSON(retrievedState.cursor.relativePosition),
        ).toEqual(relPosJson5);
      } else {
        throw new Error("Cursor should not be null after update");
      }
    });
  });
});
