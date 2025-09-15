import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  DecoratorNode,
  DOMConversionMap,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
} from 'lexical';
import { useEffect } from 'react';

// utils/footnoteUtils.ts
export function generateStableFootnoteId(content: string,pageNumber:string): string {
  // Simple hash function to create stable ID from content
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `footnote_page-number-${Number(pageNumber)}-${Math.abs(hash).toString(36)}`;
}

type SerializedFootnoteNode = {
  type: 'footnote';
  version: 1;
  id: string;
  className: string | null;
  content:string
  pageNumber:string;
};

export class FootnoteNode extends DecoratorNode<JSX.Element> {
  __id: string;
  __className: string | null;
  __content:string
  __pageNumber: string;

  static getType(): string {
    return 'footnote';
  }

 static clone(node: FootnoteNode): FootnoteNode {
  return new FootnoteNode(node.getId(), node.__className, node.__content,node.__pageNumber, node.__key);
}

  constructor(
    id: string, // ID is now required
    className: string | null = null,
    content: string,
    pageNumber:string,
    key?: NodeKey
  ) {
    super(key);

    this.__id = id 
    this.__className = className;
    this.__content = content;
    this.__pageNumber = pageNumber;
        if (!id) {
      // throw new Error('FootnoteNode requires an ID');
    }
  }

  getId(): string {
    return this.__id
  }

  getClassName(): string | null {
    return this.__className;
  }

  getContent(): string | undefined{
    return this.__content;
  }

    setContent(content: string): void {
    const writable = this.getWritable();
    writable.__content = content;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const element = document.createElement('sup');
    element.id = this.getId();
    element.className = this.__className || 'footnote highlighted-footnote';
    element.dataset.footnoteId = this.getId();
    element.dataset.content = this.__content;
    element.dataset.pageNumber = this.__pageNumber;
    return element;
  }

  updateDOM(prevNode: FootnoteNode, dom: HTMLElement): boolean {
    if (prevNode.getId() !== this.getId()) {
      dom.id = this.getId();
      dom.dataset.footnoteId = this.getId();
    }
    if (prevNode.__className !== this.__className) {
      dom.className = this.__className || 'footnote';
    }
     if (prevNode.__content !== this.__content) {
      dom.dataset.content = this.__content;
    }
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    const number = computeFootnoteNumber(_editor, this.getId());
    return (
      <span
        id={this.getId()}
        className={this.__className || 'footnote'}
        data-footnote-id={this.getId()}
        data-content={this.__content}
      >
        {number} {/* Or your custom number rendering */}
      </span>
    );
  }

  exportJSON(): SerializedFootnoteNode {
    return {
      type: 'footnote',
      version: 1,
      id: this.getId(),
      className: this.__className,
      content: this.__content,
      pageNumber: this.__pageNumber
    };
  }

  static importJSON(serialized: SerializedFootnoteNode): FootnoteNode {
    return new FootnoteNode(serialized.id, serialized.className,serialized.content,serialized.pageNumber);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      sup: (domNode: HTMLElement) => {
        if (!(domNode instanceof HTMLElement)) return null;
        const id = domNode.dataset.footnoteId || domNode.id;
        const content = domNode.dataset.content || domNode.textContent || '';
        const pageNumber :any= domNode.dataset.pageNumber;
        if (!id) return null;
        return {
          conversion: () => ({ node: new FootnoteNode(id || generateStableFootnoteId(content,pageNumber), domNode.className,content,pageNumber) }),
          priority: 1,
        };
      },
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('sup');
    element.id = this.getId();
    element.dataset.footnoteId = this.getId();
    element.className = this.__className || 'footnote';
    element.dataset.content = this.__content;
    return { element };
  }

      toCodoxNode() {
  const originalJsonNode = this.exportJSON();
  return {
    type: 'text',
    version: originalJsonNode.version,
    text:  '1',
    id: originalJsonNode.id,
    className: originalJsonNode.className,
    content: originalJsonNode.content,
    pageNumber:originalJsonNode.pageNumber,
    codox_metadata: {
      type: originalJsonNode.type,
      id: originalJsonNode.id,
      _namespace: "footnote"
    }
  };
}


static fromCodoxNode(codoxNode: any) {
  return {
    type: 'footnote',
    version: codoxNode.version,
    // text: codoxNode.text,
    content: codoxNode.content,
    id: codoxNode.codox_metadata.id,
    className: codoxNode.className,
    pageNumber:codoxNode.pageNumber,
  };
}
}

export function $getAllFootnoteNodes(): FootnoteNode[] {
  const root = $getRoot();
  const nodes: FootnoteNode[] = [];

  const walk = (node: LexicalNode) => {
    if ($isFootnoteNode(node)) {
      nodes.push(node);
    }
    
    if ('getChildren' in node && typeof node.getChildren === 'function') {
      node.getChildren().forEach(walk);
    }
  };

  walk(root);
  return nodes;
}

function computeFootnoteNumber(editor: LexicalEditor, id: string): number {
  let number = 0;
  editor.getEditorState().read(() => {
    const nodes = $getAllFootnoteNodes();
    number = nodes.findIndex((n) => n.getId() === id) + 1;
  });
  return number;
}

export function FootnotePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({editorState}) => {
      const prevState = editor.getEditorState();
      if (prevState === editorState) return;

      editor.update(() => {
        const nodes = $getAllFootnoteNodes();
        let needsUpdate = false;
        
        for (const node of nodes) {
          // Only update if actually needed
          if (node.getLatest().getContent() !== node.getContent()) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          for (const node of nodes) {
            node.getWritable(); // Trigger update
          }
        }
      });
    });
  }, [editor]);

  return null;
}

// export function $createFootnoteNode(id: string, className: string | null = 'footnote'): FootnoteNode {
//   if (!id) {
//     throw new Error('Cannot create footnote without ID');
//   }
//   return new FootnoteNode(id, className);
// }
export function $createFootnoteNode(
  context: string = '',
  className: string | null = 'footnote',
  pageNumber: string
): FootnoteNode {
  return new FootnoteNode(
    generateStableFootnoteId(context,pageNumber),
    className,
    context,
    pageNumber
  );
}

export function $isFootnoteNode(node: LexicalNode | null | undefined): node is FootnoteNode {
  return node instanceof FootnoteNode;
}
