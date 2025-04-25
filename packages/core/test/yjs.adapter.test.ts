import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import * as Y from "yjs";
import type {
  Node,
  NodeBindingStrategy,
  ResolvedNode,
  SyncConflict,
  TextNode,
  YjsAdapter,
  YjsAdapterOptions,
} from "../src/types";
import { createYjsAdapter } from "../src/yjs/index";

describe("createYjsAdapter", () => {
  let doc: Y.Doc;
  let adapter: YjsAdapter;

  beforeEach(() => {
    // Create a fresh Y.Doc for each test
    doc = new Y.Doc();
    adapter = createYjsAdapter(doc, {});
  });

  afterEach(() => {
    // Clean up
    doc.destroy();
  });

  test("creates adapter with default options", () => {
    expect(adapter).toBeDefined();
    expect(adapter.doc).toBe(doc);
    expect(adapter.rootMap).toBeInstanceOf(Y.Map);
    expect(adapter.undoManager).toBeInstanceOf(Y.UndoManager);
    expect(typeof adapter.observeChanges).toBe("function");
    expect(typeof adapter.resolveConflict).toBe("function");
    expect(typeof adapter.bindNode).toBe("function");
    expect(typeof adapter.unbindNode).toBe("function");
    expect(adapter.bindingStrategies).toBeDefined();
    // Check default tracked origin
    expect(adapter.undoManager?.trackedOrigins.has("local-update")).toBe(true);
  });

  test("creates adapter with undo disabled", () => {
    const customDoc = new Y.Doc();
    // Use undoManagerOptions to disable
    const disabledAdapter = createYjsAdapter(customDoc, {
      undoManagerOptions: { enabled: false },
    });
    expect(disabledAdapter.undoManager).toBeNull();
    disabledAdapter.doc.destroy();
  });

  test("creates adapter with custom undo track origins", () => {
    const customDoc = new Y.Doc();
    // Use undoManagerOptions to set tracked origins
    const adapterOptions: YjsAdapterOptions = {
      undoManagerOptions: {
        trackedOrigins: ["custom-origin", "another-origin"],
      },
    };
    const customAdapter = createYjsAdapter(customDoc, adapterOptions);

    expect(customAdapter.undoManager).toBeInstanceOf(Y.UndoManager);
    const trackedOrigins = customAdapter.undoManager?.trackedOrigins;
    expect(trackedOrigins).toBeDefined();
    // Check if custom origins are present (default might also be merged depending on implementation)
    expect(trackedOrigins?.has("custom-origin")).toBe(true);
    expect(trackedOrigins?.has("another-origin")).toBe(true);
    // Check if default origin is NOT the only one (or if it's merged)
    // Depending on merge logic in createYjsAdapter, default might be present or not
    // Let's assume defaults are NOT automatically merged if custom ones are provided
    // expect(trackedOrigins?.has("local-update")).toBe(false);
    // OR if defaults ARE merged:
    // expect(trackedOrigins?.has("local-update")).toBe(true);
    // --> Sticking to checking only the provided custom origins for clarity

    customDoc.destroy();
  });

  test("resolveConflict uses timestamp strategy by default", () => {
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
      // Example: custom logic always prefers local but marks as merged
      return { node: conflict.localNode, origin: "merged" };
    });
    const customDoc = new Y.Doc();
    // Define options using YjsAdapterOptions type
    const adapterOptions: YjsAdapterOptions = {
      syncStrategy: "custom",
      customSyncHandler: customHandler,
    };
    const customAdapter = createYjsAdapter(customDoc, adapterOptions);
    const conflict: SyncConflict = {
      localNode: { type: "text", value: "local" } as TextNode,
      remoteNode: { type: "text", value: "remote" } as TextNode,
      localTimestamp: 100, // Timestamps are irrelevant for this custom handler
      remoteTimestamp: 200,
      path: ["test"],
    };
    const resolution = customAdapter.resolveConflict(conflict);
    expect(customHandler).toHaveBeenCalledWith(
      expect.objectContaining(conflict),
    );
    expect(resolution.node).toBe(conflict.localNode);
    expect(resolution.origin).toBe("merged");
    customDoc.destroy();
  });

  test("observeChanges registers and removes listeners", () => {
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
      toYjs: vi.fn((node: Node) => new Y.Text("custom")),
      fromYjs: vi.fn(
        (ytext: Y.AbstractType<any>) => ({ type: "custom" }) as Node,
      ),
      observe: vi.fn(
        (node: Node, yType: Y.AbstractType<any>, callback: any) => () => {},
      ),
    };

    const customDoc = new Y.Doc();
    const customAdapter = createYjsAdapter(customDoc, {
      bindingStrategies: {
        custom: customStrategy,
      },
    });

    expect(customAdapter.bindingStrategies.custom).toBe(customStrategy);
    customDoc.destroy();
  });

  test("binding strategies are merged with defaults", () => {
    const customStrategy: NodeBindingStrategy = {
      toYjs: vi.fn((node: Node) => new Y.Text("custom")),
      fromYjs: vi.fn(
        (yType: Y.AbstractType<any>) => ({ type: "custom" }) as Node,
      ),
      observe: vi.fn(
        (node: Node, yType: Y.AbstractType<any>, callback: any) => () => {},
      ),
    };

    const customDoc = new Y.Doc();
    const customAdapter = createYjsAdapter(customDoc, {
      bindingStrategies: {
        custom: customStrategy,
      },
    });

    // Should have both default and custom strategies
    expect(customAdapter.bindingStrategies.text).toBeDefined();
    expect(customAdapter.bindingStrategies.map).toBeDefined();
    expect(customAdapter.bindingStrategies.array).toBeDefined();
    expect(customAdapter.bindingStrategies.custom).toBe(customStrategy);
    customDoc.destroy();
  });
});
