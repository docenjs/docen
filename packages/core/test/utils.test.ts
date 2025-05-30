import { find } from "unist-util-find";
import { describe, expect, it } from "vitest";
import type { Node, Parent, TextNode } from "../src/types";
import { findNodePath, transform } from "../src/utils";

describe("Utils", () => {
  describe("find (from unist-util-find)", () => {
    it("should find a node that matches the predicate", () => {
      const tree: Parent = {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                value: "Hello",
              } as TextNode,
            ],
          } as Parent,
          {
            type: "heading",
            children: [],
          } as Parent,
        ],
      };

      const result = find(tree, (node) => node.type === "text");
      expect(result).toBeDefined();
      expect(result?.type).toBe("text");
      expect((result as TextNode).value).toBe("Hello");
    });

    it("should return undefined if no node matches", () => {
      const tree: Parent = {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [],
          } as Parent,
        ],
      };

      const result = find(tree, (node) => node.type === "nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("findNodePath", () => {
    it("should find the path to a node", () => {
      const textNode: TextNode = {
        type: "text",
        value: "Hello",
      };

      const tree: Parent = {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [textNode],
          } as Parent,
        ],
      };

      const path = findNodePath(tree, textNode);
      expect(path).not.toBeNull();
      expect(path).toEqual(["children", 0, "children", 0]);
    });

    it("should return null if node is not found", () => {
      const tree: Parent = {
        type: "root",
        children: [],
      };

      const nonExistentNode: Node = {
        type: "text",
      };

      const path = findNodePath(tree, nonExistentNode);
      expect(path).toBeNull();
    });
  });

  describe("transform", () => {
    it("should transform nodes that match a type string", () => {
      const tree: Parent = {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [],
          } as Parent,
          {
            type: "heading",
            children: [],
          } as Parent,
        ],
      };

      const result = transform(tree, "paragraph", (node) => ({
        ...node,
        data: { transformed: true },
      }));

      expect(result.type).toBe("root");
      expect((result as Parent).children[0].data).toEqual({
        transformed: true,
      });
      expect((result as Parent).children[1].data).toBeUndefined();
    });

    it("should transform nodes that match a predicate function", () => {
      const tree: Parent = {
        type: "root",
        children: [
          {
            type: "paragraph",
            children: [],
          } as Parent,
          {
            type: "heading",
            depth: 1,
            children: [],
          } as Parent & { depth: number },
        ],
      };

      const result = transform(
        tree,
        (node) => node.type === "heading",
        (node) => ({
          ...node,
          data: { transformed: true },
        }),
      );

      expect(result.type).toBe("root");
      expect((result as Parent).children[0].data).toBeUndefined();
      expect((result as Parent).children[1].data).toEqual({
        transformed: true,
      });
    });
  });
});
