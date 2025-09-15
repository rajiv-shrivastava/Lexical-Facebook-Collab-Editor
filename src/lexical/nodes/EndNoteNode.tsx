
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  TextNode,
  type NodeKey,
} from "lexical";
import { integerToRoman } from "../plugins/EndNotesPlugin";

export class EndNoteNode extends TextNode {
  __number: number;
  __contentKey: string;
  __attrId: string;

  static getType(): string {
    return "endnote";
  }

  static clone(node: EndNoteNode): EndNoteNode {
    return new EndNoteNode(
      node.__number,
      node.__contentKey,
      node.__text,
      node.__attrId
    );
  }

constructor(number?: number, contentKey?: string, text?: string, attrId?: string) {
  super(text || `[${number ?? "?"}]`);
  this.__number = number ?? 0;
  this.__contentKey = contentKey ?? "";
  this.__attrId = attrId ?? "";
   this.setMode("token");
}


static importJSON(serializedNode: any): EndNoteNode {
  const number = serializedNode.number ?? 0;
  const contentKey = serializedNode.contentKey ?? '';
  const text = serializedNode.text ?? `[${integerToRoman(number)}]`;
  const attrId = serializedNode.attrId ?? "";
  return new EndNoteNode(number, contentKey, text, attrId);
}
exportJSON() {
  return {
    ...super.exportJSON(),
    number: this.__number,
    contentKey: this.__contentKey,
    attrId: this.__attrId,
    type: "endnote",
    version: 1,
    id: this.getKey(),
  };
}

  setAttrId(attrId: string): void {
    const writable = this.getWritable();
    writable.__attrId = attrId;
  }

  getAttrId(): string {
    return this.__attrId;
  }

  createDOM(config: any): HTMLElement {
    const dom = super.createDOM(config);
    dom.style.cssText = "cursor: pointer; vertical-align: super; font-size: 0.8em;";
    dom.dataset.endnote = "true";
    if (this.__attrId) {
      dom.dataset[`attrEndnote`] = this.__attrId;
    }
    return dom;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("span");
    element.dataset.lexicalEndnote = "true";
    element.dataset.contentKey = this.__contentKey;
    element.textContent = this.__text;
    if (this.__attrId) {
      element.dataset[`attrEndnote${this.__attrId}`] = "true";
    }
    return { element };
  }

  getNumber(): number {
    return this.__number;
  }

  setNumber(number: number): void {
    const writable = this.getWritable();
    writable.__number = number;
    this.setTextContent(`[${integerToRoman(number)}]`);
  }

  setContentKey(key: string): void {
    const writable = this.getWritable();
    writable.__contentKey = key;
  }

  getContentKey(): string {
    return this.__contentKey;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }

toCodoxNode() {
  const originalJsonNode = this.exportJSON();
  return {
    type: 'text',
    text: originalJsonNode.text,
    format: originalJsonNode.format,
    mode: originalJsonNode.mode,
    detail: originalJsonNode.detail,
    version: originalJsonNode.version,
    codox_metadata: {
      type: originalJsonNode.type,
      id: originalJsonNode.id,
      contentKey: originalJsonNode.contentKey,
      number: originalJsonNode.number,
    attrId: originalJsonNode.attrId,
      _namespace: "endnote",
    }
  };
}

static fromCodoxNode(codoxNode: any) {
  return {
    type: 'endnote',
    text: codoxNode.text,
    format: codoxNode.format,
    mode: codoxNode.mode,
    detail: codoxNode.detail,
    version: codoxNode.version,
    number: codoxNode.codox_metadata.number,
    contentKey: codoxNode.codox_metadata.contentKey,
      attrId: codoxNode.codox_metadata.attrId,
    id: codoxNode.codox_metadata.id,
    style: codoxNode.style ?? "",
    };
  }

  static importDOM(): DOMConversionMap {
    return {
      span: (domNode: HTMLElement) => {
        if (domNode.dataset.lexicalEndnote === "true") {
          return {
            conversion: convertEndNoteElement,
            priority: 1,
          };
        }
        return null;
      },
    };
  }
}

function convertEndNoteElement(domNode: HTMLElement): DOMConversionOutput {
  const match = domNode.textContent?.match(/\[(\d+)\]/);
  const number = match ? parseInt(match[1], 10) : 1;
  const contentKey = domNode.dataset.contentKey || "";
  const attrId = Object.keys(domNode.dataset).find(k => k.startsWith("attrEndnote"))
    ?.replace("attrEndnote", "") || "";
  const node = new EndNoteNode(number, contentKey, domNode.textContent ?? "", attrId);
  return { node };
}

export function $createEndNoteNode(
  number: number,
  contentKey?: string,
  attrId?: string
): EndNoteNode {
  return new EndNoteNode(number, contentKey || "", undefined, attrId);
}

export function $isEndNoteNode(node: any): node is EndNoteNode {
  return node instanceof EndNoteNode;
}
