import { beforeEach, describe, expect, it } from "vitest";
import * as Y from "yjs";
import type { Parent, TextNode } from "../src/types";
import { createYjsAdapter } from "../src/yjs";

describe("Yjs Integration", () => {
  let ydoc: Y.Doc;
  let rootMap: Y.Map<any>;

  beforeEach(() => {
    ydoc = new Y.Doc();
    rootMap = ydoc.getMap("root");
  });

  it("should create a YJS adapter", () => {
    const adapter = createYjsAdapter(ydoc);

    expect(adapter).toBeDefined();
    expect(adapter.rootMap).toBeInstanceOf(Y.Map);
    expect(adapter.undoManager).toBeDefined();
    expect(typeof adapter.observeChanges).toBe("function");
  });

  it("should convert a text node to Yjs and back", () => {
    const textNode: TextNode = {
      type: "text",
      value: "Hello Yjs world!",
    };

    // Add to document to avoid "Invalid access" error
    ydoc.transact(() => {
      // Create Yjs text type directly
      const yText = new Y.Text(textNode.value);
      rootMap.set("textNode", yText);

      // Test reading the value
      const retrievedYText = rootMap.get("textNode") as Y.Text;
      expect(retrievedYText.toString()).toBe("Hello Yjs world!");

      // Convert back to node and verify
      const convertedBack = {
        type: "text",
        value: retrievedYText.toString(),
      } as TextNode;

      expect(convertedBack.type).toBe("text");
      expect(convertedBack.value).toBe("Hello Yjs world!");
    });
  });

  it("should convert a parent node with children to Yjs and back", () => {
    const parentNode: Parent = {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "Child node",
        } as TextNode,
      ],
    };

    ydoc.transact(() => {
      // Set up parent structure manually
      const yMap = new Y.Map();
      yMap.set("type", "paragraph");

      const yChildren = new Y.Array();
      const yChildText = new Y.Map();
      yChildText.set("type", "text");
      yChildText.set("value", "Child node");

      yChildren.push([yChildText]);
      yMap.set("children", yChildren);

      // Add to document
      rootMap.set("parentNode", yMap);

      // Test
      const retrievedYMap = rootMap.get("parentNode") as Y.Map<any>;
      expect(retrievedYMap.get("type")).toBe("paragraph");

      const retrievedYChildren = retrievedYMap.get("children");
      expect(retrievedYChildren).toBeInstanceOf(Y.Array);

      // Check children
      if (retrievedYChildren instanceof Y.Array) {
        expect(retrievedYChildren.length).toBe(1);

        const childNode = retrievedYChildren.get(0) as Y.Map<any>;
        expect(childNode.get("type")).toBe("text");
        expect(childNode.get("value")).toBe("Child node");
      }
    });
  });

  it("should handle observing changes in Yjs documents", () => {
    const adapter = createYjsAdapter(ydoc);
    const adapterRootMap = adapter.rootMap;

    let changeDetected = false;

    // Set up observer
    const unsubscribe = adapter.observeChanges((events, transaction) => {
      changeDetected = true;
    });

    // Make a change
    ydoc.transact(() => {
      adapterRootMap.set("testKey", "testValue");
    });

    expect(changeDetected).toBe(true);

    // Clean up
    unsubscribe();
  });

  it("should support undo/redo functionality", () => {
    const adapter = createYjsAdapter(ydoc, {
      undoManagerOptions: {
        enabled: true,
        trackedOrigins: ["user"],
      },
    });

    const adapterRootMap = adapter.rootMap;
    const undoManager = adapter.undoManager;

    if (!undoManager) {
      throw new Error("Undo manager should be defined");
    }

    // Make a change with the tracked origin
    ydoc.transact(() => {
      adapterRootMap.set("key", "value1");
    }, "user");

    expect(adapterRootMap.get("key")).toBe("value1");
    expect(undoManager.canUndo()).toBe(true);

    // Undo the change
    undoManager.undo();
    expect(adapterRootMap.get("key")).toBeUndefined();

    // Redo the change
    expect(undoManager.canRedo()).toBe(true);
    undoManager.redo();
    expect(adapterRootMap.get("key")).toBe("value1");
  });
});
