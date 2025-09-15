import './index.css';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import {
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from 'lexical';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { recyclePageNumber } from '../../plugins/PageBreakPlugin/PageBreakCounter';
import $ from 'jquery'


const availablePageNumbers: number[] = [];

function getNextPageNumber(existing: number[] = []): number {
  if (availablePageNumbers.length > 0) {
    return availablePageNumbers.shift()!;
  }
  const used = new Set(existing);
  let i = 1;
  while (used.has(i)) i++;
  return i;
}

export type SerializedPageBreakNode = {
  type: string;
  version: 1;
  pageNumber: number;
};

function PageBreakComponent({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      event.preventDefault();
      if (isSelected && $isNodeSelection($getSelection())) {
        const node = $getNodeByKey(nodeKey);
        if ($isPageBreakNode(node)) {
          const deletedPageNumber = node.getPageNo();
  
          // Remove the node and recycle its page number
          node.remove();
          recyclePageNumber(deletedPageNumber);
          console.log('Deleted Page Break:', deletedPageNumber);
  
          // Adjust subsequent page break numbers
          const root = $getRoot();
          const allNodes = root.getChildren();
          for (const child of allNodes) {
            if ($isPageBreakNode(child)) {
              const currentPageNo = child.getPageNo();
              if (currentPageNo > deletedPageNumber) {
                child.setPageNo(currentPageNo - 1);
              }
            }
          }
  
          return true;
        }
      }
      return false;
    },
    [isSelected, nodeKey]
  );
  

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const pbElem = editor.getElementByKey(nodeKey);
          if (event.target === pbElem) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [clearSelection, editor, isSelected, nodeKey, onDelete, setSelected]);

  // useEffect(() => {
  //   const pbElem = editor.getElementByKey(nodeKey);
  //   if (pbElem !== null) {
  //     pbElem.className = isSelected ? 'header-js-potrait header-js' : 'header-js-potrait header-js';
  //   }
  // }, [editor, isSelected, nodeKey]);

  return null;
}

export class PageBreakNode extends DecoratorNode<JSX.Element> {
  __pageNumber: number;

  constructor(pageNumber: number = 1, key?: NodeKey) {
    super(key);
    this.__pageNumber = pageNumber;
  }

  static getType(): string {
    return 'page-break';
  }

  getPageNo(): number {
    return this.__pageNumber;
  }

  setPageNo(pageNumber: number): void {
    const writable = this.getWritable();
    writable.__pageNumber = pageNumber;
  }

  static clone(node: PageBreakNode): PageBreakNode {
    return new PageBreakNode(node.__pageNumber, node.__key);
  }

  static importJSON(serializedNode: SerializedPageBreakNode): PageBreakNode {
    return new PageBreakNode(serializedNode.pageNumber);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      figure: (domNode: HTMLElement) => {
        const tp = domNode.getAttribute('type');
        if (tp !== this.getType()) {
          return null;
        }

        return {
          conversion: convertPageBreakElement,
          priority: COMMAND_PRIORITY_HIGH,
        };
      },
    };
  }

  exportJSON(): SerializedPageBreakNode {
    return {
      type: this.getType(),
      version: 1,
      pageNumber: this.__pageNumber,
    };
  }

  createDOM(): HTMLElement {
    const el = document.createElement('figure');
    const childEl = document.createElement('span');
    el.style.pageBreakAfter = 'always';
    el.setAttribute('type', 'page-break');
    // childEl.innerHTML = `${this.__pageNumber}.`;
    childEl.style.position = 'absolute';
    childEl.style.left = '97%';
    childEl.style.bottom = '0';
    el.append(childEl);
    el.setAttribute('data-page-number', this.__pageNumber.toString()); // Add page number as data attribute
    return el;
  }

  getTextContent(): string {
    return '\n';
  }

  isInline(): false {
    return false;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <PageBreakComponent nodeKey={this.__key} />;
  }

  // Codox Node Import: Converts a Codox JSON object back to a PageBreakNode
static fromCodoxNode(codoxNode: { pageNumber: number; codox_metadata: { type: string; id: any; }; text: any; format: any; mode: any; detail: any; version: any; }) {
  const pageNumber = codoxNode.pageNumber;

  const originalJsonNode = {
    type: codoxNode.codox_metadata.type,
    text: codoxNode.text,
    format: codoxNode.format,
    mode: codoxNode.mode,
    detail: codoxNode.detail,
    version: codoxNode.version,
    pageNumber: pageNumber, // Pull pageNumber from Codox structure
    style: '',
    id: codoxNode.codox_metadata.id,
  };

  console.log('[DEMO DEBUG][PageBreakNode][fromCodoxNode]: ', { codoxNode, originalJsonNode });
  
  // Return the reconstructed PageBreakNode from Codox structure
  return new PageBreakNode(originalJsonNode.pageNumber);
}


  // Codox Node Conversion: Converts PageBreakNode to a Codox structure
toCodoxNode() {
  const originalJsonNode = this.exportJSON();

  const convertedNode = {
    type: 'page-break', // type property for Codox
    text: '', // PageBreak nodes typically don't hold textual content
    pageNumber: originalJsonNode.pageNumber, // Extract page number
    // format: originalJsonNode?.format,h
    style: '',  // Assume no style or customize if needed
    // detail: originalJsonNode.detail,
    version: originalJsonNode.version,
    codox_metadata: {
      type: originalJsonNode.type,
      id: originalJsonNode.pageNumber, // Use pageNumber as a unique ID in Codox
    },
  };

  console.log('[DEMO DEBUG][PageBreakNode][toCodoxNode]: ', { convertedNode, originalJsonNode });
  return convertedNode;
}



}

function convertPageBreakElement(domNode: HTMLElement): DOMConversionOutput {
  const pageAttr = domNode.getAttribute('data-page-number'); // Get page number from data attribute
  const pageNumber = pageAttr ? parseInt(pageAttr, 10) : 1;
  return {
    node: $createPageBreakNode(pageNumber),
  };
}

export function $createPageBreakNode(pageNumber?: number): PageBreakNode {
  if (pageNumber === undefined) {
    const totalParagraphs = $('p').length - 1;
    pageNumber = Math.ceil(totalParagraphs / 20) || 1;
  }
  return new PageBreakNode(pageNumber);
}


export function $isPageBreakNode(
  node: LexicalNode | null | undefined,
): node is PageBreakNode {
  return node instanceof PageBreakNode;
}
