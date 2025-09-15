import type {
    CommandPayloadType,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementFormatType,
    LexicalCommand,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    ParagraphNode,
    PasteCommandType,
    RangeSelection,
    SerializedElementNode,
    Spread,
    TextFormatType,
} from 'lexical';
import {
    $findMatchingParent,
    $getNearestBlockElementAncestorOrThrow,
    addClassNamesToElement,
    isHTMLElement,
    mergeRegister,
    objectKlassEquals,
} from '@lexical/utils';
import {
    $applyNodeReplacement,
    $createParagraphNode,
    $createRangeSelection,
    $createTabNode,
    $getAdjacentNode,
    $getNearestNodeFromDOMNode,
    $getRoot,
    $getSelection,
    $insertNodes,
    $isDecoratorNode,
    $isElementNode,
    $isNodeSelection,
    $isRangeSelection,
    $isRootNode,
    $isTextNode,
    $normalizeSelection__EXPERIMENTAL,
    $selectAll,
    $setSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_EDITOR,
    CONTROLLED_TEXT_INSERTION_COMMAND,
    COPY_COMMAND,
    createCommand,
    CUT_COMMAND,
    DELETE_CHARACTER_COMMAND,
    DELETE_LINE_COMMAND,
    DELETE_WORD_COMMAND,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
    ElementNode,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    INDENT_CONTENT_COMMAND,
    INSERT_LINE_BREAK_COMMAND,
    INSERT_PARAGRAPH_COMMAND,
    INSERT_TAB_COMMAND,
    // isDOMNode,
    isSelectionCapturedInDecoratorInput,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ARROW_LEFT_COMMAND,
    KEY_ARROW_RIGHT_COMMAND,
    KEY_ARROW_UP_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
    KEY_SPACE_COMMAND,
    KEY_TAB_COMMAND,
    OUTDENT_CONTENT_COMMAND,
    PASTE_COMMAND,
    REMOVE_TEXT_COMMAND,
    SELECT_ALL_COMMAND,
    // setNodeIndentFromDOM,
} from 'lexical';

export function setNodeIndentFromDOM(domElement: HTMLElement, node: ElementNode) {
    if (domElement && node) {
        const indent = domElement.style.marginLeft;
        if (indent) {
            node.setIndent(parseInt(indent, 10) || 0);
        }
    }
}

export type SerializedNestedHeadingNode = Spread<
    {
        tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';
        id: string;
        numberString?: string;
    },
    SerializedElementNode
>;

function generateStableId(text: string): string {
    return `${Math.floor(Math.random() * 1000) + 1}`
}


export type NestedHeadingTagType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';

/** @noInheritDoc */
export class NestedHeadingNode extends ElementNode {
    /** @internal */
    __tag: NestedHeadingTagType;
    private __id: string | null = null;
    __numberString: string = '';
    __extraAttributes?: Record<string, string>;

    static getType(): string {
        return 'nested-heading';
    }

    static clone(node: NestedHeadingNode): NestedHeadingNode {
        const newNode = new NestedHeadingNode(node.__tag);
        newNode.__id = node.__id;
        newNode.__numberString = node.__numberString;
        return newNode;
    }

    constructor(tag: NestedHeadingTagType, key?: NodeKey, className?: string) {
        super(key);
        this.__tag = tag;
        this.__id = generateStableId(this.getTextContent());
    }

    getTag(): NestedHeadingTagType {
        return this.__tag;
    }

    setTag(tag: NestedHeadingTagType): this {
        const self = this.getWritable();
        this.__tag = tag;
        return self;
    }

    getLatestIdFromJSON(): string | null {
        const json = this.exportJSON();
        return json.id || null;
    }

    getId(): string {
        return this.__id || generateStableId(this.getTextContent());
    }

    createDOM(config: EditorConfig): HTMLElement {
        const tag = this.__tag;
        const element = document.createElement(tag);

        if (tag !== 'h6') {
            element.setAttribute('id', this.getId());
            element.setAttribute("data-ref-id", `ref-${this.getId()}`);
            element.setAttribute('data-number', this.__numberString ?? '0');
            element.setAttribute('data-nested', 'true');
        }
        const nestedTheme = config.theme
        const nestedClassNames = nestedTheme.heading_nested
        if (nestedClassNames !== undefined) {
            const nestedClassName = nestedClassNames[tag];
            addClassNamesToElement(element, nestedClassName);
        }

        // ✅ Restore h6 attributes
        if (tag === 'h6' && this.__extraAttributes) {
            for (const [key, value] of Object.entries(this.__extraAttributes)) {
                element.setAttribute(key, value);

                // ✅ Apply inline style based on attribute
                if (key === 'data-hidethis') {
                    element.style.opacity = '0'; // ✅ This works now
                }
            }
        }

        return element;
    }


    updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
        dom.setAttribute('data-number', this.__numberString ?? '0');
        return prevNode.__tag !== this.__tag;
    }

    static importDOM(): DOMConversionMap {
  const headingTags: NestedHeadingTagType[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

  const map: DOMConversionMap = {};

  headingTags.forEach((tag) => {
    map[tag] = (domNode: Node) => {
      const element = domNode as HTMLElement;

      // ✅ Only convert to NestedHeadingNode if it has data-nested="true"
      if (element.hasAttribute('data-nested')) {
        return {
          conversion: () => $convertNestedHeadingElement(element),
          priority: 2, // Higher than default heading
        };
      }

      return null; // Fallback to default HeadingNode
    };
  });

  map['span'] = (node: Node) => {
    if (isGoogleDocsTitle(node)) {
      return {
        conversion: () => ({
          node: $createNestedHeadingNode('h1'),
        }),
        priority: 3,
      };
    }
    return null;
  };

  return map;
}

    exportDOM(editor: LexicalEditor): DOMExportOutput {
        const { element } = super.exportDOM(editor);

        if (element && isHTMLElement(element)) {
            if (this.isEmpty()) {
                element.append(document.createElement('br'));
            }

            const formatType = this.getFormatType();
            element.style.textAlign = formatType;

            const direction = this.getDirection();
            if (direction) {
                element.dir = direction;
            }
            element.setAttribute('data-number', this.__numberString ?? '0');
        }
        

        return {
            element,
        };
    }
    setId(id: any): this {
        this.__id = id;
        return this;
    }

    static importJSON(serializedNode: SerializedNestedHeadingNode): NestedHeadingNode {
        const node = $createNestedHeadingNode(serializedNode.tag)
        node.__id = serializedNode.id;
        node.__numberString = serializedNode.numberString ?? ''; // <--- Restore number string
        return node.updateFromJSON(serializedNode);
    }

    // updateFromJSON(
    //   serializedNode: LexicalUpdateJSON<SerializedHeadingNode>,
    // ): this {
    //   return (this.updateFromJSON(serializedNode) as this).setTag(serializedNode.tag);
    // }

    updateFromJSON(serializedNode: SerializedNestedHeadingNode): this {
        this.__tag = serializedNode.tag;
        this.__id = serializedNode.id || null;
        return this;
    }

    exportJSON(): SerializedNestedHeadingNode {
        return {
            ...super.exportJSON(),
            tag: this.getTag(),
            type: this.__type,
            id: this.getId(),
            numberString: this.__numberString
        };
    }

    // Mutation
    insertNewAfter(
        selection?: RangeSelection,
        restoreSelection = true,
    ): ParagraphNode | NestedHeadingNode {
        const anchorOffet = selection ? selection.anchor.offset : 0;
        const lastDesc = this.getLastDescendant();
        const isAtEnd =
            !lastDesc ||
            (selection &&
                selection.anchor.key === lastDesc.getKey() &&
                anchorOffet === lastDesc.getTextContentSize());
        const newElement =
            isAtEnd || !selection
                ? $createParagraphNode()
                : $createNestedHeadingNode(this.getTag());
        const direction = this.getDirection();
        newElement.setDirection(direction);
        this.insertAfter(newElement, restoreSelection);
        if (anchorOffet === 0 && !this.isEmpty() && selection) {
            const paragraph = $createParagraphNode();
            paragraph.select();
            this.replace(paragraph, true);
        }
        return newElement;
    }

    collapseAtStart(): true {
        const newElement = !this.isEmpty()
            ? $createNestedHeadingNode(this.getTag())
            : $createParagraphNode();
        const children = this.getChildren();
        children.forEach((child) => newElement.append(child));
        this.replace(newElement);
        return true;
    }

    extractWithChild(): boolean {
        return true;
    }

    toCodoxNode() {
        const originalJsonNode = this.exportJSON();
        const convertedNode = {
            children: originalJsonNode.children,
            direction: originalJsonNode.direction,
            format: originalJsonNode.format,
            indent: originalJsonNode.indent,
            type: 'heading',
            version: originalJsonNode.version,
            tag: originalJsonNode.tag,
            id: originalJsonNode.id,
            numberString: originalJsonNode.numberString,
            codox_metadata: {
                type: originalJsonNode.type,
                id: originalJsonNode.id,
            },
        };
        console.log('[DEMO DEBUG][WarningNode][toCodoxNode]: ', { convertedNode, originalJsonNode });

        return convertedNode;
    }
    static fromCodoxNode(codoxNode: any) {
       return {
        children: codoxNode.children,
            direction: codoxNode.direction,
            format: codoxNode.format,
            indent: codoxNode.indent,
            type: 'nested-heading',
            version: codoxNode.version,
            tag: codoxNode.tag,
            id: codoxNode.id,
            numberString: codoxNode.numberString,
       }
    }
}

function isGoogleDocsTitle(domNode: Node): boolean {
    if (domNode.nodeName.toLowerCase() === 'span') {
        return (domNode as HTMLSpanElement).style.fontSize === '26pt';
    }
    return false;
}

function $convertNestedHeadingElement(element: HTMLElement): DOMConversionOutput {
  const nodeName = element.nodeName.toLowerCase() as NestedHeadingTagType;
  const node = $createNestedHeadingNode(nodeName);

  if (element.style !== null) {
    setNodeIndentFromDOM(element, node);
    node.setId(element.getAttribute('id'));
    node.setFormat(element.style.textAlign as ElementFormatType);
  }

  const extraAttributes: any = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    extraAttributes[attr.name] = attr.value;

    if (attr.name === 'data-hidethis') {
      element.style.opacity = '0';
    }
  }
  node.__extraAttributes = extraAttributes;

  return { node };
}



export function $createNestedHeadingNode(
    headingTag: NestedHeadingTagType = 'h1',
): NestedHeadingNode {
    return $applyNodeReplacement(new NestedHeadingNode(headingTag));
}

export function $isNestedHeadingNode(
    node: LexicalNode | null | undefined,
): node is NestedHeadingNode {
    return node instanceof NestedHeadingNode;
}
