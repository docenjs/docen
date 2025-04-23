import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import {
  Awareness,
  AwarenessChanges,
  type AwarenessState,
} from "../src/yjs/awareness";

describe("Awareness", () => {
  let doc: Y.Doc;
  let awareness: Awareness;

  beforeEach(() => {
    doc = new Y.Doc();
    awareness = new Awareness(doc);
  });

  afterEach(() => {
    awareness.destroy();
    doc.destroy();
  });

  it("should set and get local state", () => {
    const state: AwarenessState = {
      user: { name: "Test User", color: "#ff0000" },
    };
    awareness.setLocalState(state);

    const retrievedState = awareness.getLocalState();
    expect(retrievedState).toEqual(state);
  });

  it("should not update state if unchanged", () => {
    const state: AwarenessState = { user: { name: "Test User" } };
    const changeHandler = vi.fn();

    awareness.on("change", changeHandler);
    awareness.setLocalState(state);

    // Second call with same state should not trigger change
    awareness.setLocalState(state);

    expect(changeHandler).toHaveBeenCalledTimes(1);
  });

  it("should emit change event when state is added", () => {
    const state: AwarenessState = { user: { name: "Test User" } };
    const changeHandler = vi.fn();

    awareness.on("change", changeHandler);
    awareness.setLocalState(state);

    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        added: [doc.clientID],
        updated: [],
        removed: [],
      }),
      null
    );
  });

  it("should emit change event when state is updated", () => {
    const state1: AwarenessState = { user: { name: "Test User" } };
    const state2: AwarenessState = { user: { name: "Updated User" } };
    const changeHandler = vi.fn();

    awareness.setLocalState(state1);
    awareness.on("change", changeHandler);
    awareness.setLocalState(state2);

    expect(changeHandler).toHaveBeenCalledTimes(1);
    expect(changeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        added: [],
        updated: [doc.clientID],
        removed: [],
      }),
      null
    );
  });

  it("should remove state for specific client", () => {
    const state: AwarenessState = { user: { name: "Test User" } };
    awareness.setLocalState(state);

    const changeHandler = vi.fn();
    awareness.on("change", changeHandler);

    awareness.removeState(doc.clientID);

    expect(awareness.getLocalState()).toBeNull();
    expect(changeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        added: [],
        updated: [],
        removed: [doc.clientID],
      }),
      null
    );
  });

  it("should not emit event when removing non-existent client", () => {
    const changeHandler = vi.fn();
    awareness.on("change", changeHandler);

    awareness.removeState(999); // Non-existent client ID

    expect(changeHandler).not.toHaveBeenCalled();
  });

  it("should remove all states", () => {
    const state: AwarenessState = { user: { name: "Test User" } };
    awareness.setLocalState(state);

    const changeHandler = vi.fn();
    awareness.on("change", changeHandler);

    awareness.removeAllStates();

    expect(awareness.getStates().size).toBe(0);
    expect(changeHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        added: [],
        updated: [],
        removed: [doc.clientID],
      }),
      null
    );
  });

  it("should not emit event when removing all states from empty awareness", () => {
    const changeHandler = vi.fn();
    awareness.on("change", changeHandler);

    awareness.removeAllStates();

    expect(changeHandler).not.toHaveBeenCalled();
  });

  it("should unsubscribe event handlers", () => {
    const changeHandler = vi.fn();

    awareness.on("change", changeHandler);
    awareness.off("change", changeHandler);

    awareness.setLocalState({ user: { name: "Test User" } });

    expect(changeHandler).not.toHaveBeenCalled();
  });

  it("should clean up resources on destroy", () => {
    const state: AwarenessState = { user: { name: "Test User" } };
    awareness.setLocalState(state);

    const changeHandler = vi.fn();
    awareness.on("change", changeHandler);

    awareness.destroy();

    expect(awareness.getStates().size).toBe(0);

    // After destroy, events should not be triggered
    awareness.setLocalState(state);
    expect(changeHandler).not.toHaveBeenCalled();
  });

  describe("getStates", () => {
    it("should return an empty map initially", () => {
      expect(awareness.getStates().size).toBe(0);
    });

    it("should return a map with the local state", () => {
      const state = { user: { name: "John" } };
      awareness.setLocalState(state);

      const states = awareness.getStates();
      expect(states.size).toBe(1);
      expect(states.get(doc.clientID)).toEqual(state);
    });

    it("should return a copy of the states map", () => {
      const state = { user: { name: "John" } };
      awareness.setLocalState(state);

      const states1 = awareness.getStates();
      const states2 = awareness.getStates();

      // Should be different objects
      expect(states1).not.toBe(states2);
      // But with same content
      expect(states1.get(doc.clientID)).toEqual(states2.get(doc.clientID));
    });
  });
});
