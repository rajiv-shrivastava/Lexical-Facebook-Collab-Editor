import { TextNode, SerializedTextNode, EditorConfig } from "lexical";

// Extend SerializedTextNode to include color and backgroundColor properties
interface ExtendedSerializedTextNode extends SerializedTextNode {
  id: any;
  color?: string;
  backgroundColor?: string;
}

export class DividerTextNode extends TextNode {
  static getType(): string {
    return "dividerText";
  }
  
  static clone(node: DividerTextNode): DividerTextNode {
    return new DividerTextNode(node.__text, node.__key);
  }
  
  constructor(text: string = "_______________________________", key?: string) {
    super(text);
  }
  
  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.dataset.divider = "true";
    dom.contentEditable = "false";
    return dom;
  }
  updateDOM(prevNode: DividerTextNode, dom: HTMLElement, config: EditorConfig): boolean {
    dom.dataset.divider = "true";
    return super.updateDOM(prevNode, dom, config);
  }

// exportJSON(): ExtendedSerializedTextNode {
//   return {
//     ...super.exportJSON(),
//     type: "dividerText",
//     id: this.getKey(), // Use actual node key
//     version: 1,
//     detail: 0,
//     format: 0,
//     mode: "normal",
//     text: "_______________________________",
//   };
// }
exportJSON(): ExtendedSerializedTextNode {
  return {
    ...super.exportJSON(),
    type: "dividerText",
    id: this.getKey(),
    version: 1,
    detail: 0,
    format: 0,
    mode: "normal",
    text: "_______________________________",
    style: "", // include if you want consistency with base TextNode
  };
}

  
static importJSON(serializedNode: SerializedTextNode): DividerTextNode {
  // Safely access 'id' from Codox-injected metadata or fallback to key
  const key = (serializedNode as any).id ?? (serializedNode as any).key;
  const text = serializedNode.text ?? "_______________________________";
  return new DividerTextNode(text);
}

  
  exportDOM(): {element: HTMLElement} {
    const element = document.createElement('span');
    element.textContent = this.__text;
    element.dataset.divider = "true";
    return {element};
  }
  
  static importDOM() {
    return {
      span: (domNode: HTMLElement) => {
        if (domNode.dataset.divider === "true" || 
            domNode.textContent === "_______________________________") {
          return {
            conversion: () => {
              return {
                node: new DividerTextNode()
              };
            },
            priority: 2 as const
          };
        }
        return null;
      }
    };
  }
toCodoxNode() {
  const originalJsonNode = this.exportJSON();
  return {
    type: 'text',
    text: originalJsonNode.text,
    format: originalJsonNode.format,
    detail: originalJsonNode.detail,
    version: originalJsonNode.version,
    codox_metadata: {
      type: originalJsonNode.type,
      id: originalJsonNode.id,
      _namespace: "dividerText"
    }
  };
}


  /**
   * Implement the following API methods to interoperate with Codox
   * Codox -> Lexical Node
   * Converts synchronized codox json node to lexical json node
   * must be class 'static' method
   */
// static fromCodoxNode(codoxNode: any) {
//   return {
//     type: codoxNode.codox_metadata.type,
//     text: codoxNode.text,
//     format: codoxNode.format,
//     detail: codoxNode.detail,
//     mode: codoxNode.mode,
//     version: codoxNode.version,
//     id: codoxNode.codox_metadata.id,
//     codox_metadata: {
//       ...codoxNode.codox_metadata,
//       _namespace: "dividerText"
//     }
//   };
// }

static fromCodoxNode(codoxNode: any) {
  return {
    type: 'dividerText',
    text: codoxNode.text,
    format: codoxNode.format,
    detail: codoxNode.detail,
    version: codoxNode.version,
    id: codoxNode.codox_metadata.id,
    mode: codoxNode.mode ?? "normal",
    style: codoxNode.style ?? "", // ensure it matches exportJSON
  };
}
}


// Helper function to create a divider text node.
export function $createDividerTextNode(): DividerTextNode {
  return new DividerTextNode();
}

// Type guard to check if a node is a DividerTextNode.
export function $isDividerTextNode(node: any): node is DividerTextNode {
  return node instanceof DividerTextNode;
}
