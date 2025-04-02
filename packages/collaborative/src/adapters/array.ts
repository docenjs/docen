import type { Node } from "@docen/core";
import * as Y from "yjs";
import type { YjsASTAdapter, YjsSharedType } from "../types";

/**
 * Array adapter for handling array data like version history, tag lists, etc.
 * This adapter converts between Docen nodes and Yjs Array type.
 */
export class ArrayAdapter<T = unknown> implements YjsASTAdapter<Node, T> {
  fromAST(node: Node): YjsSharedType<T> {
    const yarray = new Y.Array<T>();
    // If node has data property with array items, use them
    if (node.data?.items && Array.isArray(node.data.items)) {
      for (const item of node.data.items) {
        yarray.push([item]);
      }
    }
    return yarray;
  }

  toAST(yType: YjsSharedType<T>): Node {
    if (!(yType instanceof Y.Array)) {
      throw new Error("Expected Y.Array type");
    }
    return {
      type: "container",
      data: {
        items: yType.toArray(),
      },
    };
  }

  observeChanges(
    yType: YjsSharedType<T>,
    callback: (node: Node) => void,
  ): () => void {
    if (!(yType instanceof Y.Array)) {
      throw new Error("Expected Y.Array type");
    }

    const observer = () => {
      callback(this.toAST(yType));
    };

    yType.observe(observer);
    return () => yType.unobserve(observer);
  }
}
