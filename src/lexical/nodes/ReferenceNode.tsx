import { DecoratorNode, DOMConversionMap, EditorConfig, LexicalEditor } from "lexical";
import * as React from "react";

export type SerializedReferenceNode = {
  type: "reference";
  id: string;
  text: string;
  version: 1;
};

export class ReferenceNode extends DecoratorNode<JSX.Element> {
  __referencedElementId: string;
  __text: string;
  constructor(referencedElementId: string, text: string, key?: string) {
    console.log('referencedText', text)
    super(key);
    this.__referencedElementId = referencedElementId;
    this.__text = text;
  }

  static getType(): string {
    return "reference";
  }

  static clone(node: ReferenceNode): ReferenceNode {
    return new ReferenceNode(
      node.__referencedElementId,
      node.__text,
      node.__key
    );
  }

  createDOM(config: any): HTMLElement {
    const dom = document.createElement("span");
    dom.style.cursor = "pointer";
    dom.style.background = "#f8f6e2";
    dom.style.fontSize = "17px";
    dom.setAttribute('data-node-type', 'reference');
    dom.setAttribute('data-ref-id', this.__referencedElementId);
    dom.setAttribute("data-lexical-node-key", this.__key as string);
    dom.setAttribute("id", this.__referencedElementId);
    dom.setAttribute("data-cross-ref", "true");
    dom.textContent = this.__text;

    dom.addEventListener("click", (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    
      // Step 1: Get the parent editor container (with class like editor-autosave-id_8-dd---)
      const editorContainer = dom.closest('[class^="editor-autosave-"]') as HTMLElement | null;
      if (!editorContainer) return;
    
      const editIdClass = Array.from(editorContainer.classList).find(cls =>
        cls.startsWith("editor-autosave-")
      );
      if (!editIdClass) return;
    
      const editId = editIdClass.replace("editor-autosave-", "");
    
      // Step 2: Query *within* this editor only
      const sourceElement = editorContainer.querySelector(
          `[data-ref-id="ref-${this.__referencedElementId}"]`
        ) as HTMLElement | null;

        if (sourceElement) {
          sourceElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          sourceElement.classList.add("reference-highlight");
          setTimeout(() => {
            sourceElement.classList.remove("reference-highlight");
          }, 1000);

          setTimeout(() => {
            if (
              sourceElement instanceof HTMLInputElement ||
              sourceElement instanceof HTMLTextAreaElement
            ) {
              sourceElement.focus();
              sourceElement.setSelectionRange(
                sourceElement.value.length,
                sourceElement.value.length
              );
            } else if (sourceElement.isContentEditable) {
              sourceElement.focus();
              const range = document.createRange();
              const selection = window.getSelection();
              range.selectNodeContents(sourceElement);
              range.collapse(false);
              selection?.removeAllRanges();
              selection?.addRange(range);
            } else {
              sourceElement.setAttribute("tabindex", "-1");
              sourceElement.focus();
            }
          }, 500);
        } else {
          console.warn(
            `Referenced element with data-ref-id="ref-${this.__referencedElementId}" not found.`
          );
        }
    });

    const sourceElement = document.querySelector(
      `[data-ref-id="ref-${this.__referencedElementId}"]`
    );
    if (sourceElement) {
      const observer = new MutationObserver(() => {
        const newText = sourceElement.textContent;
        const crossRefNodes = document.querySelectorAll(
          `[data-cross-ref][id="${this.__referencedElementId}"]`
        );
        crossRefNodes.forEach((node) => {
          if (node.textContent !== newText) {
            node.textContent = newText || "";
          }
        });
      });
      observer.observe(sourceElement, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    return dom;
  }

  updateDOM(prevNode: ReferenceNode, dom: HTMLElement, config: any): boolean {
    const sourceElement = document.querySelector(
      `[data-ref-id="ref-${this.__referencedElementId}"]`
    ) as HTMLElement | null;
    console.log('first', this.__text, sourceElement)
    if (sourceElement) {
      const newText = sourceElement.textContent;
      console.log('newText', newText)
      if (dom.textContent !== this.__text) {
        dom.textContent = this.__text || "";
      }
    }
    return false;
  }

  decorate(editor: LexicalEditor, config: EditorConfig): JSX.Element {
    return <></>;
  }

  static importJSON(serializedNode: SerializedReferenceNode): ReferenceNode {
    const node = $createReferenceNode(serializedNode.id, serializedNode.text);
    return node;
  }

  exportJSON(): SerializedReferenceNode {
    return {
      type: "reference",
      id: this.__referencedElementId,
      text: this.__text,
      version: 1,
    };
  }
// In ReferenceNode class
static importDOM(): DOMConversionMap | null {
  return {
    span: (domNode: HTMLElement) => {
      if (domNode.hasAttribute('data-cross-ref')) {
        return {
          conversion: (element) => {
            const id = element.getAttribute('id') || '';
            const text = element.textContent || '';
            return { node: new ReferenceNode(id, text) };
          },
          priority: 2,
        };
      }
      return null;
    },
  };
}
  /**
   * Convert the ReferenceNode to a Codox-compatible node
   */
  toCodoxNode() {
    const originalJsonNode : any = this.exportJSON();

    const convertedNode = {
      type: "text", // Codox uses "text" for content-based nodes
      text: originalJsonNode.text,
      format: originalJsonNode.format,
      mode: originalJsonNode.mode,
      detail: originalJsonNode.detail,
      version: originalJsonNode.version,
      style: "cursor: pointer; background: #f8f6e2; font-size: 17px;", // Include the style

      codox_metadata: {
        type: originalJsonNode.type,
        referencedElementId: originalJsonNode.id, // The referenced element ID
      },
    };

    console.log("[DEMO DEBUG][ReferenceNode][toCodoxNode]:", {
      convertedNode,
      originalJsonNode,
    });

    return convertedNode;
  }

  /**
   * Convert a Codox node to a ReferenceNode
   * @param codoxNode The Codox node to convert
   * @returns The corresponding ReferenceNode
   */
  // static fromCodoxNode(codoxNode: any) {
  //   const id = codoxNode.codox_metadata.referencedElementId;
  //   const text = codoxNode.text;
  
  //   return new ReferenceNode(id, text);
  // }

  
  static fromCodoxNode(codoxNode: any) {
    return {
      type: codoxNode.codox_metadata.type,
      version: codoxNode.version,
      text: codoxNode.text,
      id : codoxNode.codox_metadata.referencedElementId,
    };
  }
}  

// ✅ Utility function to create the ReferenceNode
export function $createReferenceNode(
  refId: string,
  referencedText: string
): ReferenceNode {
  return new ReferenceNode(refId, referencedText);
}
