import {
  DecoratorNode,
  NodeKey,
  LexicalNode,
  SerializedLexicalNode,
  Spread,
  DOMConversionMap,
} from 'lexical';
import { ReactNode, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import '../DivNode/DivNode.css'


let count = 1;

function generateID(): string {
  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  count++;

  return `${count}-${String(totalSeconds).padStart(6, '0')}`;
}



export type SerializedSimpleInputNode = Spread<
  {
    value: string;
    id: string;
  },
  SerializedLexicalNode
>;

export class SimpleInputNode extends DecoratorNode<ReactNode> {
  __value: string;
  __id: string;

  static getType(): string {
    return 'simple-input';
  }

  static clone(node: SimpleInputNode): SimpleInputNode {
    return new SimpleInputNode(node.__value,node.__id, node.__key);
  }

  constructor(value: string = '',id?: string, key?: NodeKey) {
    super(key);
    this.__value = value;
    this.__id = id ?? generateID(); 
  }

    getId(): string {
    return this.__id;
  }

  createDOM(): HTMLElement {
      const span = document.createElement('span');
  span.style.display = 'contents'; // Invisible wrapper
  span.setAttribute('data-id', this.__id);
  return span;
  }

  updateDOM(prevNode: SimpleInputNode): boolean {
  // Only re-render DOM if ID has changed (rare)
  return this.__id !== prevNode.__id;
}

static importDOM(): DOMConversionMap | null {
  return {
    div: (domNode: HTMLElement): any => {
      const isSimpleInput = domNode.classList.contains('lexical-simple-input-container');
      const id = domNode.getAttribute('data-id');

      if (isSimpleInput && id) {
        return {
          conversion: () => new SimpleInputNode('', id),
          priority: 1,
        };
      }

      return null;
    },
  };
}

exportDOM(): { element: HTMLElement } {
  const div = document.createElement('div');
  div.setAttribute('data-id', this.__id);
  div.classList.add('lexical-simple-input-container');

  // Optional: store value as attribute or inside content
  div.setAttribute('data-value', this.__value); // recommended
  div.textContent = this.__value; // fallback visible content (optional)

  return { element: div };
}



  decorate(): ReactNode {
    return <SimpleInputComponent node={this} />;
  }

  setValue(newValue: string): void {
    const writable = this.getWritable();
    writable.__value = newValue;
  }

  getValue(): string {
    return this.__value;
  }

 static importJSON(serializedNode: SerializedSimpleInputNode): SimpleInputNode {
  const { value, id } = serializedNode;
  return new SimpleInputNode(value, id);
}


  exportJSON(): SerializedSimpleInputNode {
    return {
      type: 'simple-input',
      version: 1,
      value: this.__value,
      id: this.__id,
    };
  }

  isInline(): boolean {
    return true;
  }

          toCodoxNode() {
  const originalJsonNode = this.exportJSON();
  const safeText = originalJsonNode.value?.trim() || ' ';
  return {
    type: 'text',
    version: originalJsonNode.version,
    value: originalJsonNode.value,
    text: safeText,
    id: originalJsonNode.id,
    codox_metadata: {
      type: originalJsonNode.type,
      _namespace: originalJsonNode.type,
    }
  };
}


static fromCodoxNode(codoxNode: any) {
  return {
      type: this.getType(),
          version: codoxNode.version,
    value: codoxNode.value,
    id: codoxNode.id,
  };
}
}

interface SimpleInputComponentProps {
  node: SimpleInputNode;
}

// function SimpleInputComponent({ node }: SimpleInputComponentProps): JSX.Element {
//   const [editor] = useLexicalComposerContext();
//   const value = node.getValue();

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const newValue = event.target.value;
//     editor.update(() => {
//       node.setValue(newValue);
//     });
//   };

//   return (
//     <input
//       id={node.getId()}
//       type="text"
//       value={value}
//       onChange={handleChange}
//       className="px-2 py-1 border border-gray-300 rounded text-sm"
//       onFocus={(e) => e.stopPropagation()}
//       onBlur={(e) => e.stopPropagation()}
//       onClick={(e) => e.stopPropagation()}
//     />
//   );
// }

function SimpleInputComponent({ node }: { node: SimpleInputNode }): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [value, setValue] = useState(node.getValue());

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const latestValue = node.getValue();
        setValue(latestValue);
      });
    });
  }, [editor, node]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue); // Local update for instant UI feedback
    editor.update(() => {
      editor.setEditable(false)
      node.setValue(newValue);
    });
  };

  return (
    <input
      id={node.getId()}
      type="text"
      value={value}
      onChange={()=>{editor.setEditable(false)}}
      className="px-2 py-1 border border-gray-300 rounded text-sm"
      onFocus={(e) => e.stopPropagation()}
      onBlur={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    />
  );
}


export function $createSimpleInputNode(value: string = ''): SimpleInputNode {
  return new SimpleInputNode(value);
}

export function $isSimpleInputNode(node: LexicalNode | null | undefined): node is SimpleInputNode {
  return node instanceof SimpleInputNode;
}
