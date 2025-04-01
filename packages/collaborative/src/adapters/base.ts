import type { Text } from "@docen/core";
import * as Y from "yjs";
import type { YjsASTAdapter } from "../types";

/**
 * Base adapter for converting between Docen Text nodes and Yjs Text type
 */
export class TextAdapter implements YjsASTAdapter<Text> {
  fromAST(node: Text): Y.AbstractType<Y.YTextEvent> {
    const ytext = new Y.Text();
    ytext.insert(0, node.value);
    return ytext;
  }

  toAST(yType: Y.AbstractType<Y.YTextEvent>): Text {
    if (!(yType instanceof Y.Text)) {
      throw new Error("Expected Y.Text type");
    }
    return {
      type: "text",
      value: yType.toString(),
    };
  }

  observeChanges(
    yType: Y.AbstractType<Y.YTextEvent>,
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
