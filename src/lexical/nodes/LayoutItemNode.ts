/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';
import './DivNode/DivNode.css';

import { addClassNamesToElement } from '@lexical/utils';
import { $getRoot, $getSelection, $isElementNode, $isRangeSelection, ElementNode } from 'lexical';

let count = 1
let defaultVal = "Type a Header"
let defaultFooter = "Type a Footer"

export function setDefaultHeader(val: string) {
  defaultVal = val
}

export function setDefaultFooter(val: string) {
  defaultFooter = val
}

function generateID(): string {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  count++;

  return `${count}-${String(totalSeconds).padStart(6, '0')}`;
}




export function getSelectedPage(): LayoutItemNode | null {
  const selection = $getSelection();

  if (!$isRangeSelection(selection)) {
    return null;
  }

  let node: any = selection.anchor.getNode();

  while (node !== null) {
    if ($isLayoutItemNode(node)) {
      return node;
    }
    node = node.getParent();
  }

  return null;
}

export function getAllLayoutItemNodes(): LayoutItemNode[] {
  const layoutNodes: LayoutItemNode[] = [];

  $getRoot().getChildren().forEach(function traverse(node) {
    if ($isLayoutItemNode(node)) {
      layoutNodes.push(node);
    }

    if ($isElementNode(node)) {
      node.getChildren().forEach(traverse);
    }
  });

  return layoutNodes;
}


export type SerializedLayoutItemNode = Spread<{
  id: string;
  className?: string
  headerText: string;
  footerText: string;
}, SerializedElementNode>;

export class LayoutItemNode extends ElementNode {
  __className?: string;
  __id: string;
  __headerText: string;
  __footerText: string;

  static getType(): string {
    return 'layout-item';
  }

  setClassName(className: string): this {
    const writable = this.getWritable();
    writable.__className = className;
    return this;
  }
  getClassName(): string | undefined{
    return this.__className
  }
  removeClassName(className: string): this {
    const writable = this.getWritable();
    if (writable.__className === className) {
      writable.__className = "";
    }
    return this;
  }

  setHeaderText(text: string): this {
    const writable = this.getWritable();
    writable.__headerText = text;
    return this;
  }

  getHeaderText(): string {
  return this.__headerText;
}


  setFooterText(text: string): this {
    const writable = this.getWritable();
    writable.__footerText = text;
    return this;
  }

  static clone(node: LayoutItemNode): LayoutItemNode {
    return new LayoutItemNode(node.__className, node.__id, node.__headerText, node.__footerText, node.__key);
  }

  constructor(className?: string, id?: string, headerText?: string, footerText?: string, key?: NodeKey) {
    super(key);
    this.__className = className;
    this.__id = id ?? generateID();
    this.__headerText = headerText ?? defaultVal;
    this.__footerText = footerText ?? defaultFooter;
  }

  getId(): string {
    return this.__id;
  }


  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div');
    // dom.innerHTML = `<input id="${this.__id}-header" type="text" class="Header-Input" value="${this.__headerText}">     <input id="${this.__id}-footer" type="text" class="Footer-Input" value="${this.__footerText}">`
    dom.id = this.__id
    count = count + 1
    dom.classList.add("custom-div");
    dom.style.border = "1px solid #aaa";
    dom.style.padding = "8px";
    dom.style.minHeight = "1100px";
    dom.style.maxWidth = '600px'
    dom.style.padding = '96px 96px'
    dom.style.marginLeft = '17.5%'

    dom.setAttribute('HeaderText', this.__headerText)
    dom.setAttribute('FooterText', this.__footerText)


      const headerInput = document.createElement('input');
  headerInput.type = 'text';
  headerInput.className = 'Header-Input';
  headerInput.value = this.__headerText;
  headerInput.id = `${this.__id}-header`;
  headerInput.setAttribute('contentEditable', 'false');

  // Create footer input
  const footerInput = document.createElement('input');
  footerInput.type = 'text';
  footerInput.className = 'Footer-Input';
  footerInput.value = this.__footerText;
  footerInput.id = `${this.__id}-footer`;
  footerInput.setAttribute('contentEditable', 'false');

  dom.appendChild(headerInput);
  dom.appendChild(footerInput);


    if (this.__className) {
      dom.classList.add(this.__className);
    }

    // Monitor height
    // const resizeObserver = new ResizeObserver((entries) => {
    //   for (let entry of entries) {
    //     const height = entry.contentRect.height;
    //     if (height > 1124) {
    //       dom.dispatchEvent(
    //         new CustomEvent("DivNodeOverflow", {
    //           detail: { key: this.getKey() },
    //           bubbles: true,
    //         })
    //       );
    //     }
    //   }
    // });

    const resizeObserver = new ResizeObserver(() => {
  let totalChildrenHeight = 0;

  // Calculate the total height of all direct child elements
  dom.childNodes.forEach((child) => {
    if (child instanceof HTMLElement) {
      totalChildrenHeight += child.offsetHeight;
    }
  });

  if (totalChildrenHeight > 1124) {
    dom.dispatchEvent(
      new CustomEvent("DivNodeOverflow", {
        detail: { key: this.getKey() },
        bubbles: true,
      })
    );
  }
});


    resizeObserver.observe(dom);
    // if (typeof config.theme.layoutItem === 'string') {
    //   addClassNamesToElement(dom, config.theme.layoutItem);
    // }

const headerInputs = dom.querySelectorAll('.Header-Input');
const footerInputs = dom.querySelectorAll('.Footer-Input');

// Header inputs
headerInputs.forEach((input: any) => {
  // Input syncing
  input.addEventListener('input', (e: any) => {
    const value = e.target.value;
    headerInputs.forEach((otherInput: any) => {
      if (otherInput !== e.target) {
        otherInput.value = value;
      }
    });
  });

  // Dispatch custom event on double-click
  input.addEventListener('dblclick', () => {
    const event = new CustomEvent('InputDoubleClicked', {
      detail: {
        id: input.id,
        type: 'header',
      },
      bubbles: true, // Allow it to bubble up to parent if needed
    });
    input.dispatchEvent(event);
  });
});

// Footer inputs
footerInputs.forEach((input: any) => {
  // Input syncing
  input.addEventListener('input', (e: any) => {
    const value = e.target.value;
    footerInputs.forEach((otherInput: any) => {
      if (otherInput !== e.target) {
        otherInput.value = value;
      }
    });
  });

  // Dispatch custom event on double-click
  input.addEventListener('dblclick', () => {
    const event = new CustomEvent('InputDoubleClicked', {
      detail: {
        id: input.id,
        type: 'footer',
      },
      bubbles: true,
    });
    input.dispatchEvent(event);
  });
});




    return dom;
  }

  updateDOM(prevNode: LayoutItemNode, dom: HTMLElement): boolean {
    let didUpdate = false;

    // Handle class name changes
    if (this.__className !== prevNode.__className) {
      if (prevNode.__className) {
        dom.classList.remove(prevNode.__className);
      }
      if (this.__className) {
        dom.classList.add(this.__className);
      }
      didUpdate = true;
    }
       if (this.__headerText !== prevNode.__headerText) {
      if (prevNode.__headerText) {
        dom.setAttribute('data-header',``)
      }
      if (this.__headerText) {
        dom.setAttribute('data-header',`${this.__headerText}`)
      }
      didUpdate = true;
    }

           if (this.__footerText !== prevNode.__footerText) {
      if (prevNode.__footerText) {
        dom.setAttribute('data-footer',``)
      }
      if (this.__footerText) {
        dom.setAttribute('data-footer',`${this.__footerText}`)
      }
      didUpdate = true;
    }

    return didUpdate;
  }



  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (domNode.classList.contains('PlaygroundEditorTheme__layoutItem') || domNode.hasAttribute('data-lexical-layout-item')) {
          return {
            conversion: convertLayoutItemElement,
            priority: 2,
          };
        }
        return null;
      },
    };
  }


  static importJSON(SerializedLayoutItemNode: SerializedLayoutItemNode): LayoutItemNode {
    return new LayoutItemNode(
      SerializedLayoutItemNode.className || 'custom-div',
      SerializedLayoutItemNode.id,
      SerializedLayoutItemNode.headerText,
      SerializedLayoutItemNode.footerText,);
  }

  isShadowRoot(): boolean {
    return true;
  }

  exportJSON(): SerializedLayoutItemNode {
    return {
      ...super.exportJSON(),
      type: 'layout-item',
      version: 1,
      id: this.__id,
      headerText: this.__headerText,
      footerText: this.__footerText,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div');

    element.innerHTML = `<input id="${this.__id}-header" type="text" class="Header-Input" value="${this.__headerText}">     <input id="${this.__id}-footer" type="text" class="Footer-Input" value="${this.__footerText}">`;

    element.classList.add("custom-div");
    element.style.padding = "8px";
    element.style.minHeight = "1100px";
    element.style.maxWidth = '600px'
    element.style.padding = '96px 96px'
    element.style.marginLeft = '17.5%'
    element.id = this.__id

    // ✅ Add the stored class name
    if (this.__className) {
      element.classList.add(this.__className);
      // Optional: Also add it as an attribute for easier re-import
      element.setAttribute("data-classname", this.__className);
    }
    element.setAttribute("data-header", this.__headerText);
    element.setAttribute("data-footer", this.__footerText);

    element.setAttribute("data-lexical-layout-item", "true"); // mark it as your custom node
    return { element };
  }

}

export function $createLayoutItemNode(className?: string): LayoutItemNode {
  return new LayoutItemNode(className);
}

export function $isLayoutItemNode(
  node: LexicalNode | null | undefined,
): node is LayoutItemNode {
  return node instanceof LayoutItemNode;
}

function convertLayoutItemElement(domNode: HTMLElement): DOMConversionOutput | null {
  const className = domNode.getAttribute('data-classname') || undefined;
  const headerText = domNode.getAttribute('data-header') || defaultVal;
  const footerText = domNode.getAttribute('data-footer') || defaultFooter;
  return {
    node: new LayoutItemNode(className, undefined, headerText, footerText),
  };
}
