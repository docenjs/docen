import type { Text } from "@docen/core";
import * as Y from "yjs";
import type { YjsASTAdapter, YjsSharedType } from "../types";

/**
 * Base adapter for converting between Docen Text nodes and Yjs Text type
 */
export class TextAdapter implements YjsASTAdapter<Text> {
  fromAST(node: Text): YjsSharedType {
    const ytext = new Y.Text();
    ytext.insert(0, node.value);
    return ytext;
  }

  toAST(yType: YjsSharedType): Text {
    if (!(yType instanceof Y.Text)) {
      throw new Error("Expected Y.Text type");
    }
    return {
      type: "text",
      value: yType.toString(),
    };
  }

  observeChanges(
    yType: YjsSharedType,
    callback: (node: Text) => void,
  ): () => void {
    if (!(yType instanceof Y.Text)) {
      throw new Error("Expected Y.Text type");
    }

    const observer = () => {
      callback(this.toAST(yType));
    };

    yType.observe(observer);
    return () => yType.unobserve(observer);
  }
}
