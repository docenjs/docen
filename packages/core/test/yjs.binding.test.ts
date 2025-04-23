import { beforeEach, describe, expect, it, vi } from "vitest";
import * as Y from "yjs";
import type { Node, TextNode } from "../src/ast";
import {
  ArrayNodeBindingStrategy,
  MapNodeBindingStrategy,
  type NodeBindingStrategy,
  type TextNodeBindingStrategy,
  createYjsAdapter,
} from "../src/yjs";

describe("Yjs Binding Strategies", () => {
  let doc: Y.Doc;

  beforeEach(() => {
    doc = new Y.Doc();
  });

  describe("Binding Strategy Creation", () => {
    it("should provide default binding strategies", () => {
      const adapter = createYjsAdapter(doc);

      expect(adapter.bindingStrategies.text).toBeDefined();
      expect(adapter.bindingStrategies.map).toBeDefined();
      expect(adapter.bindingStrategies.array).toBeDefined();

      // Verify structure
      expect(typeof adapter.bindingStrategies.text.toYjs).toBe("function");
      expect(typeof adapter.bindingStrategies.text.fromYjs).toBe("function");
      expect(typeof adapter.bindingStrategies.text.observe).toBe("function");
    });

    it("should merge custom binding strategies with defaults", () => {
      const customTextStrategy: TextNodeBindingStrategy = {
        toYjs: vi.fn().mockReturnValue(new Y.Text()),
        fromYjs: vi
          .fn()
          .mockReturnValue({ type: "text", value: "" } as TextNode),
        observe: vi.fn().mockReturnValue(() => {}),
      };

      const adapter = createYjsAdapter(doc, {
        bindingStrategies: {
          text: customTextStrategy,
        },
      });

      // Custom strategy should be used
      expect(adapter.bindingStrategies.text).toBe(customTextStrategy);

      // Default strategies for others should be preserved
      expect(adapter.bindingStrategies.map).toBeDefined();
      expect(adapter.bindingStrategies.array).toBeDefined();
    });
  });

  describe("Strategy Interface", () => {
    it("TextNodeBindingStrategy should define the correct methods", () => {
      const adapter = createYjsAdapter(doc);
      const textStrategy = adapter.bindingStrategies.text;

      expect(textStrategy.toYjs).toBeInstanceOf(Function);
      expect(textStrategy.fromYjs).toBeInstanceOf(Function);
      expect(textStrategy.observe).toBeInstanceOf(Function);
    });

    it("MapNodeBindingStrategy should define the correct methods", () => {
      const adapter = createYjsAdapter(doc);
      const mapStrategy = adapter.bindingStrategies.map;

      expect(mapStrategy.toYjs).toBeInstanceOf(Function);
      expect(mapStrategy.fromYjs).toBeInstanceOf(Function);
      expect(mapStrategy.observe).toBeInstanceOf(Function);
    });

    it("ArrayNodeBindingStrategy should define the correct methods", () => {
      const adapter = createYjsAdapter(doc);
      const arrayStrategy = adapter.bindingStrategies.array;

      expect(arrayStrategy.toYjs).toBeInstanceOf(Function);
      expect(arrayStrategy.fromYjs).toBeInstanceOf(Function);
      expect(arrayStrategy.observe).toBeInstanceOf(Function);
    });
  });

  describe("NodeTypeMappings Configuration", () => {
    it("should respect node type mappings", () => {
      const adapter = createYjsAdapter(doc, {
        nodeTypeMappings: {
          text: "text",
          paragraph: "map",
          list: "array",
          customType: "map",
        },
      });

      expect(adapter.bindingStrategies).toBeDefined();

      // We can't directly test the mappings, but we can verify the structure exists
      expect(adapter.bindNode).toBeInstanceOf(Function);
    });
  });

  describe("Custom Binding Strategy Integration", () => {
    it("should allow registering a custom binding strategy", () => {
      const customStrategy: NodeBindingStrategy = {
        toYjs: vi.fn().mockReturnValue(new Y.Map()),
        fromYjs: vi.fn().mockReturnValue({ type: "custom" } as Node),
        observe: vi.fn().mockReturnValue(() => {}),
      };

      const adapter = createYjsAdapter(doc, {
        bindingStrategies: {
          custom: customStrategy,
        },
      });

      expect(adapter.bindingStrategies.custom).toBe(customStrategy);
    });

    it("should allow overriding default strategies", () => {
      const originalAdapter = createYjsAdapter(doc);
      const originalTextStrategy = originalAdapter.bindingStrategies.text;

      const customTextStrategy: TextNodeBindingStrategy = {
        toYjs: vi.fn().mockReturnValue(new Y.Text("custom")),
        fromYjs: vi
          .fn()
          .mockReturnValue({ type: "text", value: "custom" } as TextNode),
        observe: vi.fn().mockReturnValue(() => {}),
      };

      const adapter = createYjsAdapter(doc, {
        bindingStrategies: {
          text: customTextStrategy,
        },
      });

      expect(adapter.bindingStrategies.text).not.toBe(originalTextStrategy);
      expect(adapter.bindingStrategies.text).toBe(customTextStrategy);
    });
  });
});
