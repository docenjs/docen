import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as Y from "yjs";
import type { Node, TextNode } from "../src/ast";
import type { ResolvedNode, SyncConflict } from "../src/types";
import { type NodeBindingStrategy, createYjsAdapter } from "../src/yjs";

describe("createYjsAdapter", () => {
  let doc: Y.Doc;

  beforeEach(() => {
    // Create a fresh Y.Doc for each test
    doc = new Y.Doc();
  });

  afterEach(() => {
    // Clean up
    doc.destroy();
  });

  test("creates adapter with default options", () => {
    const adapter = createYjsAdapter(doc);

    expect(adapter).toBeDefined();
    expect(adapter.doc).toBe(doc);
    expect(adapter.rootMap).toBeInstanceOf(Y.Map);
    expect(adapter.undoManager).toBeInstanceOf(Y.UndoManager);
    expect(typeof adapter.observeChanges).toBe("function");
    expect(typeof adapter.resolveConflict).toBe("function");
    expect(typeof adapter.bindNode).toBe("function");
    expect(typeof adapter.unbindNode).toBe("function");
    expect(adapter.bindingStrategies).toBeDefined();
  });

  test("creates adapter with undo disabled", () => {
    const adapter = createYjsAdapter(doc, { undoEnabled: false });

    expect(adapter.undoManager).toBeNull();
  });

  test("creates adapter with custom undo track origins", () => {
    const adapter = createYjsAdapter(doc, {
      undoTrackOrigin: ["custom-origin"],
    });

    expect(adapter.undoManager).toBeInstanceOf(Y.UndoManager);
    // Check if the trackedOrigins includes our custom origin
    // @ts-ignore - Accessing private property for testing
    expect(adapter.undoManager?.trackedOrigins.has("custom-origin")).toBe(true);
  });

  test("resolveConflict uses timestamp strategy by default", () => {
    const adapter = createYjsAdapter(doc);

    const localNode = { type: "text", value: "local" } as TextNode;
    const remoteNode = { type: "text", value: "remote" } as TextNode;

    // Local is newer
    const conflict1: SyncConflict = {
      localNode,
      remoteNode,
      localTimestamp: 200,
      remoteTimestamp: 100,
      path: ["test"],
    };

    const resolution1 = adapter.resolveConflict(conflict1);
    expect(resolution1.node).toBe(localNode);
    expect(resolution1.origin).toBe("local");

    // Remote is newer
    const conflict2: SyncConflict = {
      localNode,
      remoteNode,
      localTimestamp: 100,
      remoteTimestamp: 200,
      path: ["test"],
    };

    const resolution2 = adapter.resolveConflict(conflict2);
    expect(resolution2.node).toBe(remoteNode);
    expect(resolution2.origin).toBe("remote");
  });

  test("resolveConflict uses custom strategy when provided", () => {
    const customHandler = vi.fn((conflict: SyncConflict): ResolvedNode => {
      return { node: conflict.localNode, origin: "merged" };
    });

    const adapter = createYjsAdapter(doc, {
      syncStrategy: "custom",
      customSyncHandler: customHandler,
    });

    const conflict: SyncConflict = {
      localNode: { type: "text", value: "local" } as TextNode,
      remoteNode: { type: "text", value: "remote" } as TextNode,
      localTimestamp: 100,
      remoteTimestamp: 200,
      path: ["test"],
    };

    const resolution = adapter.resolveConflict(conflict);
    expect(customHandler).toHaveBeenCalledWith(conflict);
    expect(resolution.node).toBe(conflict.localNode);
    expect(resolution.origin).toBe("merged");
  });

  test("observeChanges registers and removes listeners", () => {
    const adapter = createYjsAdapter(doc);
    const callback = vi.fn();

    // Add listener
    const unobserve = adapter.observeChanges(callback);

    // Make a change to trigger the callback
    doc.transact(() => {
      adapter.rootMap.set("test", "value");
    });

    expect(callback).toHaveBeenCalled();

    // Reset mock and remove listener
    callback.mockReset();
    unobserve();

    // Make another change
    doc.transact(() => {
      adapter.rootMap.set("test2", "value2");
    });

    // Callback should not be called this time
    expect(callback).not.toHaveBeenCalled();
  });

  test("adapter uses custom binding strategies", () => {
    const customStrategy: NodeBindingStrategy = {
      toYjs: vi.fn(() => new Y.Text("custom")),
      fromYjs: vi.fn(() => ({ type: "custom" }) as Node),
      observe: vi.fn(() => () => {}),
    };

    const adapter = createYjsAdapter(doc, {
      bindingStrategies: {
        custom: customStrategy,
      },
    });

    expect(adapter.bindingStrategies.custom).toBe(customStrategy);
  });

  test("binding strategies are merged with defaults", () => {
    const customStrategy: NodeBindingStrategy = {
      toYjs: vi.fn(() => new Y.Text("custom")),
      fromYjs: vi.fn(() => ({ type: "custom" }) as Node),
      observe: vi.fn(() => () => {}),
    };

    const adapter = createYjsAdapter(doc, {
      bindingStrategies: {
        custom: customStrategy,
      },
    });

    // Should have both default and custom strategies
    expect(adapter.bindingStrategies.text).toBeDefined();
    expect(adapter.bindingStrategies.map).toBeDefined();
    expect(adapter.bindingStrategies.array).toBeDefined();
    expect(adapter.bindingStrategies.custom).toBe(customStrategy);
  });
});
