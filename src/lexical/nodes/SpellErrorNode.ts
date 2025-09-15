import { DecoratorNode } from "lexical";
import * as React from "react";

interface SpellErrorNodeProps {
  errorText: string;
  replacements: string[];
}

export class SpellErrorNode extends DecoratorNode<SpellErrorNodeProps> {
  __errorText: string;
  __replacements: string[];

  static getType() {
    return "spellError";
  }

  static clone(node: SpellErrorNode) {
    return new SpellErrorNode(
      node.__errorText,
      node.__replacements,
      node.__key
    );
  }

  constructor(errorText: string, replacements: string[], key?: string) {
    super(key);
    this.__errorText = errorText;
    this.__replacements = replacements;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.style.textDecoration = "underline wavy red";
    span.style.cursor = "pointer";
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): any {
    return {
      errorText: this.__errorText,
      replacements: Array.isArray(this.__replacements)
        ? this.__replacements
        : [],
    };
  }

  exportJSON(): any {
    return {
      type: "spellError", // match getType()
      version: 1,
      errorText: this.__errorText,
      replacements: Array.isArray(this.__replacements)
        ? this.__replacements
        : [],
    };
  }

  static importJSON(serializedNode: any) {
    return new SpellErrorNode(
      serializedNode.errorText,
      serializedNode.replacements
    );
  }

  // Add this:
  toCodoxNode() {
    return {
      type: "spellError",
      errorText: this.__errorText,
      replacements: Array.isArray(this.__replacements)
        ? this.__replacements
        : [],
    };
  }

  static fromCodoxNode(data: any) {
    return {
      type: "spellError",
      version: 1,
      errorText: data.errorText,
      replacements: Array.isArray(data.replacements) ? data.replacements : [],
    };
  }
}
