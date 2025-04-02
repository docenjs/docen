import type { Node, NodeType, Parent } from "@docen/core";
import * as Y from "yjs";
import type { YjsASTAdapter, YjsSharedType } from "../types";

/**
 * Parent adapter for handling nodes with children
 */
export class ParentAdapter implements YjsASTAdapter<Parent> {
  private childAdapters: Map<NodeType, YjsASTAdapter<Node>>;

  constructor(childAdapters: Map<NodeType, YjsASTAdapter<Node>>) {
    this.childAdapters = childAdapters;
  }

  fromAST(node: Parent): YjsSharedType {
    const ymap = new Y.Map<unknown>();
    ymap.set("type", node.type);
    ymap.set("children", this.convertChildrenToYjs(node.children));
    return ymap;
  }

  toAST(yType: YjsSharedType): Parent {
    if (!(yType instanceof Y.Map)) {
      throw new Error("Expected Y.Map type");
    }

    const type = yType.get("type") as NodeType;
    const children = this.convertYjsToChildren(
      yType.get("children") as Y.Array<unknown>,
    );

    return {
      type,
      children,
    };
  }

  observeChanges(
    yType: YjsSharedType,
    callback: (node: Parent) => void,
  ): () => void {
    if (!(yType instanceof Y.Map)) {
      throw new Error("Expected Y.Map type");
    }

    const observer = () => {
      callback(this.toAST(yType));
    };

    yType.observe(observer);
    return () => yType.unobserve(observer);
  }

  private convertChildrenToYjs(children: Node[]): Y.Array<unknown> {
    const yarray = new Y.Array<unknown>();
    for (const child of children) {
      const adapter = this.childAdapters.get(child.type);
      if (!adapter) {
        throw new Error(`No adapter found for node type: ${child.type}`);
      }
      yarray.push([adapter.fromAST(child)]);
    }
    return yarray;
  }

  private convertYjsToChildren(yarray: Y.Array<unknown>): Node[] {
    const children: Node[] = [];
    for (const item of yarray.toArray()) {
      const ymap = item as Y.Map<unknown>;
      const type = ymap.get("type") as NodeType;
      const adapter = this.childAdapters.get(type);
      if (!adapter) {
        throw new Error(`No adapter found for node type: ${type}`);
      }
      children.push(adapter.toAST(ymap));
    }
    return children;
  }
}

/**
 * Root adapter for handling the document root
 */
export class RootAdapter implements YjsASTAdapter<Parent> {
  private parentAdapter: ParentAdapter;

  constructor(childAdapters: Map<NodeType, YjsASTAdapter<Node>>) {
    this.parentAdapter = new ParentAdapter(childAdapters);
  }

  fromAST(node: Parent): YjsSharedType {
    return this.parentAdapter.fromAST(node);
  }

  toAST(yType: YjsSharedType): Parent {
    return this.parentAdapter.toAST(yType);
  }

  observeChanges(
    yType: YjsSharedType,
    callback: (node: Parent) => void,
  ): () => void {
    return this.parentAdapter.observeChanges(yType, callback);
  }
}
