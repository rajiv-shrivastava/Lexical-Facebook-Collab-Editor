import type {
  BaseSelection,
  EditorConfig,
  LexicalNode,
  NodeKey,
  RangeSelection,
  SerializedElementNode,
  Spread,
} from 'lexical';
import {
  addClassNamesToElement,
  removeClassNamesFromElement,
} from '@lexical/utils';
import {
  $applyNodeReplacement,
  $isRangeSelection,
  ElementNode,
  DOMConversionMap,
  DOMExportOutput,
} from 'lexical';

export type SerializedMarkNode = Spread<
  {
    ids: Array<string>;
  },
  SerializedElementNode
>;

const NO_IDS:  string[] = [];

/** @noInheritDoc */
export class MarkNode extends ElementNode {
  __ids: string[];

  static getType(): string {
    return 'mark';
  }

  static clone(node: MarkNode): MarkNode {
    return new MarkNode(node.__ids, node.__key);
  }

  static importDOM(): DOMConversionMap {
    return {
      mark: (domNode) => {
        return {
          conversion: (domNode) => {
            const ids = domNode.getAttribute('data-ids')?.split(',') || [];
            return { node: new MarkNode(ids) };
          },
          priority: 1,
        };
      },
    };
  }

  static importJSON(serializedNode: SerializedMarkNode): MarkNode {
    return new MarkNode(serializedNode.ids);
  }

  exportJSON(): SerializedMarkNode {
    return {
      ...super.exportJSON(),
      ids: Array.from(this.__ids),
      type: this.__type,
    };
  }

  constructor(ids: string[] = NO_IDS, key?: NodeKey) {
    super(key);
    this.__ids = ids;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('mark');
    addClassNamesToElement(element, config.theme.mark);

    // Add IDs as data attributes
    if (this.__ids.length > 0) {
      element.setAttribute('data-ids', this.__ids.join(','));
    }
    return element;
  }

  updateDOM(prevNode: this, element: HTMLElement, config: EditorConfig): boolean {
    const prevIDs = prevNode.__ids;
    const nextIDs = this.__ids;

    if (prevIDs.join(',') !== nextIDs.join(',')) {
      element.setAttribute('data-ids', nextIDs.join(','));
    }
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('mark');
    // if(element.textContent === ''){
    //   element.textContent = this.getTextContent();

    // }

    // Add IDs as data attributes
    if (this.__ids.length > 0) {
      element.setAttribute('data-ids', this.__ids.join(','));
    }
    return { element };
  }

  hasID(id: string): boolean {
    return this.__ids.includes(id);
  }

  getIDs(): Array<string> {
    return Array.from(this.__ids);
  }

  setIDs(ids:  string[]): this {
    this.__ids = ids;
    return this;
  }

  addID(id: string): this {
    if (!this.__ids.includes(id)) {
      this.__ids = [...this.__ids, id];
    }
    return this;
  }

   deleteID(id: string): void {
       // Instead of re-assigning the array, just remove the entry in place:
       const idx = this.__ids.indexOf(id);
       if (idx > -1) {
         this.__ids.splice(idx, 1);
       }
     }

  insertNewAfter(selection: RangeSelection, restoreSelection = true): null | ElementNode {
    const markNode = $createMarkNode(this.__ids);
    this.insertAfter(markNode, restoreSelection);
    return markNode;
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  canBeEmpty(): false {
    return false;
  }

  isInline(): true {
    return true;
  }
}

export function $createMarkNode(ids:  string[] = NO_IDS): MarkNode {
  return $applyNodeReplacement(new MarkNode(ids));
}

export function $isMarkNode(node: LexicalNode | null): node is MarkNode {
  return node instanceof MarkNode;
}
