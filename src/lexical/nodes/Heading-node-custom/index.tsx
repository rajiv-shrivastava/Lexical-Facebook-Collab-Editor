// /**
//  * Copyright (c) Meta Platforms, Inc. and affiliates.
//  *
//  * This source code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  *
//  */

// import type {
//     CommandPayloadType,
//     DOMConversionMap,
//     DOMConversionOutput,
//     DOMExportOutput,
//     EditorConfig,
//     ElementFormatType,
//     LexicalCommand,
//     LexicalEditor,
//     LexicalNode,
//     // LexicalUpdateJSON,
//     NodeKey,
//     ParagraphNode,
//     PasteCommandType,
//     RangeSelection,
//     SerializedElementNode,
//     Spread,
//     TextFormatType,
//   } from 'lexical';
  
//   import {
//     $insertDataTransferForRichText,
//     copyToClipboard,
//   } from '@lexical/clipboard';
//   import {
//     $moveCharacter,
//     $shouldOverrideDefaultCharacterSelection,
//   } from '@lexical/selection';
//   import {
//     $findMatchingParent,
//     $getNearestBlockElementAncestorOrThrow,
//     addClassNamesToElement,
//     isHTMLElement,
//     mergeRegister,
//     objectKlassEquals,
//   } from '@lexical/utils';
//   import {
//     $applyNodeReplacement,
//     $createParagraphNode,
//     $createRangeSelection,
//     $createTabNode,
//     $getAdjacentNode,
//     $getNearestNodeFromDOMNode,
//     $getRoot,
//     $getSelection,
//     $insertNodes,
//     $isDecoratorNode,
//     $isElementNode,
//     $isNodeSelection,
//     $isRangeSelection,
//     $isRootNode,
//     $isTextNode,
//     $normalizeSelection__EXPERIMENTAL,
//     $selectAll,
//     $setSelection,
//     CLICK_COMMAND,
//     COMMAND_PRIORITY_EDITOR,
//     CONTROLLED_TEXT_INSERTION_COMMAND,
//     COPY_COMMAND,
//     createCommand,
//     CUT_COMMAND,
//     DELETE_CHARACTER_COMMAND,
//     DELETE_LINE_COMMAND,
//     DELETE_WORD_COMMAND,
//     DRAGOVER_COMMAND,
//     DRAGSTART_COMMAND,
//     DROP_COMMAND,
//     ElementNode,
//     FORMAT_ELEMENT_COMMAND,
//     FORMAT_TEXT_COMMAND,
//     INDENT_CONTENT_COMMAND,
//     INSERT_LINE_BREAK_COMMAND,
//     INSERT_PARAGRAPH_COMMAND,
//     INSERT_TAB_COMMAND,
//     // isDOMNode,
//     isSelectionCapturedInDecoratorInput,
//     KEY_ARROW_DOWN_COMMAND,
//     KEY_ARROW_LEFT_COMMAND,
//     KEY_ARROW_RIGHT_COMMAND,
//     KEY_ARROW_UP_COMMAND,
//     KEY_BACKSPACE_COMMAND,
//     KEY_DELETE_COMMAND,
//     KEY_ENTER_COMMAND,
//     KEY_ESCAPE_COMMAND,
//     KEY_SPACE_COMMAND,
//     KEY_TAB_COMMAND,
//     OUTDENT_CONTENT_COMMAND,
//     PASTE_COMMAND,
//     REMOVE_TEXT_COMMAND,
//     SELECT_ALL_COMMAND,
//     // setNodeIndentFromDOM,
//   } from 'lexical';

//   export function setNodeIndentFromDOM(domElement: HTMLElement, node: ElementNode) {
//     if (domElement && node) {
//       const indent = domElement.style.marginLeft;
//       if (indent) {
//         node.setIndent(parseInt(indent, 10) || 0);
//       }
//     }
//   }
  
//   export type SerializedHeadingNode = Spread<
//     {
//       tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';
//       id: string;
//       numberString?: string;
//     },
//     SerializedElementNode
//   >;
  
//   export const DRAG_DROP_PASTE: LexicalCommand<Array<File>> = createCommand(
//     'DRAG_DROP_PASTE_FILE',
//   );
  
//   export type SerializedQuoteNode = SerializedElementNode;
  
//   /** @noInheritDoc */
//   export class QuoteNode extends ElementNode {
//     static getType(): string {
//       return 'quote';
//     }
  
//     static clone(node: QuoteNode): QuoteNode {
//       return new QuoteNode(node.__key);
//     }
  
//     // View
  
//     createDOM(config: EditorConfig): HTMLElement {
//       const element = document.createElement('blockquote');
//       addClassNamesToElement(element, config.theme.quote);
//       return element;
//     }
//     updateDOM(prevNode: this, dom: HTMLElement): boolean {
//       return false;
//     }
  
//     static importDOM(): DOMConversionMap | null {
//       return {
//         blockquote: (node: Node) => ({
//           conversion: $convertBlockquoteElement,
//           priority: 0,
//         }),
//       };
//     }
  
//     exportDOM(editor: LexicalEditor): DOMExportOutput {
//       const {element} = super.exportDOM(editor);
  
//       if (element && isHTMLElement(element)) {
//         if (this.isEmpty()) {
//           element.append(document.createElement('br'));
//         }
  
//         const formatType = this.getFormatType();
//         element.style.textAlign = formatType;
  
//         const direction = this.getDirection();
//         if (direction) {
//           element.dir = direction;
//         }

//         const numberString = (this as unknown as { __numberString?: string }).__numberString;
//         element.setAttribute('data-number', numberString ?? '55');
//       }
  
//       return {
//         element,
//       };
//     }
  
//     static importJSON(serializedNode: SerializedQuoteNode): QuoteNode {
//       return $createQuoteNode().updateFromJSON(serializedNode);
//     }
//     updateFromJSON(serializedNode: SerializedQuoteNode): QuoteNode {
//       const node = this.getWritable();
//       return node;
//     }
  
//     // Mutation
  
//     insertNewAfter(_: RangeSelection, restoreSelection?: boolean): ParagraphNode {
//       const newBlock = $createParagraphNode();
//       const direction = this.getDirection();
//       newBlock.setDirection(direction);
//       this.insertAfter(newBlock, restoreSelection);
//       return newBlock;
//     }
  
//     collapseAtStart(): true {
//       const paragraph = $createParagraphNode();
//       const children = this.getChildren();
//       children.forEach((child) => paragraph.append(child));
//       this.replace(paragraph);
//       return true;
//     }
  
//     canMergeWhenEmpty(): true {
//       return true;
//     }
//   }
  
//   export function $createQuoteNode(): QuoteNode {
//     return $applyNodeReplacement(new QuoteNode());
//   }
  
//   export function $isQuoteNode(
//     node: LexicalNode | null | undefined,
//   ): node is QuoteNode {
//     return node instanceof QuoteNode;
//   }
  
//   function generateStableId(text: string): string {
//     return  `${Math.floor(Math.random() * 1000) + 1}`
//   }


//   export type HeadingTagType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';
  
//   /** @noInheritDoc */
//   export class HeadingNode extends ElementNode {
//     /** @internal */
//     __tag: HeadingTagType;
//     private __id: string | null = null;
//     __numberString: string = ''; 

//     static getType(): string {
//       return 'heading';
//     }
  
//     static clone(node: HeadingNode): HeadingNode {
//       const newNode = new HeadingNode(node.__tag);
//       newNode.__id = node.__id;
//       newNode.__numberString = node.__numberString;
//       return newNode;
//     }
  
//     constructor(tag: HeadingTagType, key?: NodeKey) {
//       super(key);
//       this.__tag = tag;
//       this.__id = generateStableId(this.getTextContent());
//     }
  
//     getTag(): HeadingTagType {
//       return this.__tag;
//     }
  
//     setTag(tag: HeadingTagType): this {
//       const self = this.getWritable();
//       this.__tag = tag;
//       return self;
//     }

//     getLatestIdFromJSON(): string | null {
//       const json = this.exportJSON();
//       return json.id || null;
//     }
  
//     getId(): string {
//       return this.__id || generateStableId(this.getTextContent());
//     }
  
//     // View
  
//   createDOM(config: EditorConfig): HTMLElement {
//     const tag = this.__tag;
//     const element = document.createElement(tag);
//     if (tag !== 'h6') {
//       element.setAttribute('id', this.getId());
//       element.setAttribute("data-ref-id", `ref-${this.getId()}`);
//       element.setAttribute('data-number', this.__numberString ?? '0');
//     }
//     const theme = config.theme;
//     const classNames: any = theme.heading;
//     if (classNames !== undefined) {
//       const className = classNames[tag];
//       addClassNamesToElement(element, className);
//     }
//     return element;
//   }
  
//     updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
//       dom.setAttribute('data-number', this.__numberString ?? '0');
//       return prevNode.__tag !== this.__tag;
//     }
  
//     static importDOM(): DOMConversionMap | null {
//       return {
//         h1: (node: Node) => ({
//           conversion: $convertHeadingElement,
//           priority: 0,
//         }),
//         h2: (node: Node) => ({
//           conversion: $convertHeadingElement,
//           priority: 0,
//         }),
//         h3: (node: Node) => ({
//           conversion: $convertHeadingElement,
//           priority: 0,
//         }),
//         h4: (node: Node) => ({
//           conversion: $convertHeadingElement,
//           priority: 0,
//         }),
//         h5: (node: Node) => ({
//           conversion: $convertHeadingElement,
//           priority: 0,
//         }),
//         h6: (node: Node) => ({
//           conversion: $convertHeadingElement,
//           priority: 0,
//         }),
//         p: (node: Node) => {
//           // domNode is a <p> since we matched it by nodeName
//           const paragraph = node as HTMLParagraphElement;
//           const firstChild = paragraph.firstChild;
//           if (firstChild !== null && isGoogleDocsTitle(firstChild)) {
//             return {
//               conversion: () => ({node: null}),
//               priority: 3,
//             };
//           }
//           return null;
//         },
//         span: (node: Node) => {
//           if (isGoogleDocsTitle(node)) {
//             return {
//               conversion: (domNode: Node) => {
//                 return {
//                   node: $createHeadingNode('h1'),
//                 };
//               },
//               priority: 3,
//             };
//           }
//           return null;
//         },
//       };
//     }
  
//     exportDOM(editor: LexicalEditor): DOMExportOutput {
//       const {element} = super.exportDOM(editor);
  
//       if (element && isHTMLElement(element)) {
//         if (this.isEmpty()) {
//           element.append(document.createElement('br'));
//         }
  
//         const formatType = this.getFormatType();
//         element.style.textAlign = formatType;
  
//         const direction = this.getDirection();
//         if (direction) {
//           element.dir = direction;
//         }
//         element.setAttribute('data-number', this.__numberString ?? '0');
//       }
  
//       return {
//         element,
//       };
//     }
//     setId(id: any): this {
//       this.__id = id;
//       return this;
//     }    
  
//     static importJSON(serializedNode: SerializedHeadingNode): HeadingNode {
//       const node = $createHeadingNode(serializedNode.tag)
//       node.__id = serializedNode.id;
//       node.__numberString = serializedNode.numberString ?? ''; // <--- Restore number string
//       return node.updateFromJSON(serializedNode);
//     }
  
//     // updateFromJSON(
//     //   serializedNode: LexicalUpdateJSON<SerializedHeadingNode>,
//     // ): this {
//     //   return (this.updateFromJSON(serializedNode) as this).setTag(serializedNode.tag);
//     // }
  
//     updateFromJSON(serializedNode: SerializedHeadingNode): this {
//       this.__tag = serializedNode.tag;
//       this.__id = serializedNode.id || null;
//       return this;
//     }

//     exportJSON(): SerializedHeadingNode {
//       return {
//         ...super.exportJSON(),
//         tag: this.getTag(),
//         type: this.__type,
//         id: this.getId(),
//         numberString: this.__numberString
//       };
//     }
  
//     // Mutation
//     insertNewAfter(
//       selection?: RangeSelection,
//       restoreSelection = true,
//     ): ParagraphNode | HeadingNode {
//       const anchorOffet = selection ? selection.anchor.offset : 0;
//       const lastDesc = this.getLastDescendant();
//       const isAtEnd =
//         !lastDesc ||
//         (selection &&
//           selection.anchor.key === lastDesc.getKey() &&
//           anchorOffet === lastDesc.getTextContentSize());
//       const newElement =
//         isAtEnd || !selection
//           ? $createParagraphNode()
//           : $createHeadingNode(this.getTag());
//       const direction = this.getDirection();
//       newElement.setDirection(direction);
//       this.insertAfter(newElement, restoreSelection);
//       if (anchorOffet === 0 && !this.isEmpty() && selection) {
//         const paragraph = $createParagraphNode();
//         paragraph.select();
//         this.replace(paragraph, true);
//       }
//       return newElement;
//     }
  
//     collapseAtStart(): true {
//       const newElement = !this.isEmpty()
//         ? $createHeadingNode(this.getTag())
//         : $createParagraphNode();
//       const children = this.getChildren();
//       children.forEach((child) => newElement.append(child));
//       this.replace(newElement);
//       return true;
//     }
  
//     extractWithChild(): boolean {
//       return true;
//     }

//     toCodoxNode() {
//         /**
//          * Step 1: Get original text node json. You should/must use .exportJSON()
//          */
//         const originalJsonNode = this.exportJSON();
    
//         /**
//          * Step 2: Extend with additional properties.
//          */
//         const convertedNode = {
//           type: 'text', // type property must be one of core or playground node types
          
//           // preserve default text node attributes
//         //   text: originalJsonNode.text,
//           format: originalJsonNode.format,
//           // key: originalJsonNode.key,
//         //   mode: originalJsonNode.mode,
//         //   detail: originalJsonNode.detail,
//           version: originalJsonNode.version,
    
//           // extension: all mutable style properties should be serialized as a style string, as per TextNode definition 
//           // assumption is the lexical node style is empty, if not, concat the styles. 
//         //   style: `color:${originalJsonNode.color};background-color:${originalJsonNode.backgroundColor};`,
    
//           /**
//            * extension: codox_metadata should hold immutables:
//            *  - required: your extended node type, e.g. 'warning' 
//            *  - optional: any immutable properties of an original node - these fields are not merged and synchronized. 
//            */
//           codox_metadata: {
//             type: originalJsonNode.type, //type == 'warning'
//             id: originalJsonNode.id,
//             // key:originalJsonNode.key //some custom id an immutable property
//           },
//         };
//         console.log('[DEMO DEBUG][WarningNode][toCodoxNode]: ', { convertedNode, originalJsonNode });
    
//         return convertedNode;
//       }
    
//       /**
//        * Implement the following API methods to interoperate with Codox
//        * Codox -> Lexical Node
//        * Converts synchronized codox json node to lexical json node
//        * must be class 'static' method
//        */
//       static fromCodoxNode(codoxNode : any) {
//         /**
//          * extension: all mutable properties should be deserialized from the style string, 
//          */
//         let color = '';
//         let backgroundColor = '';
//         // codoxNode.style.split(';').forEach((css) => {
//         //   if (css.startsWith('color:')) {
//         //     color = css.split(':')[1];
//         //   }
//         //   if (css.startsWith('background-color:')) {
//         //     backgroundColor = css.split(':')[1];
//         //   }
//         // });
    
//         // compose original json node from codox node
//         const originalJsonNode = {
//           // set original type - in this example it will be "warning"
//           type: codoxNode.codox_metadata.type, 
//           // set base attributes
//           text: codoxNode.text,
//           format: codoxNode.format,
//           mode: codoxNode.mode,
//           detail: codoxNode.detail,
//           version: codoxNode.version,
//           key: codoxNode.key,
//           style: '',  // assumption here is the lexical node style is empty, if not, splice out the extended mutable properties
    
//           /**
//            * set custom attributes
//            */
//           id: codoxNode.codox_metadata.id,
//           color: color,
//           backgroundColor: backgroundColor,
//         };
//         console.log('[DEMO DEBUG][WarningNode][fromCodoxNode]: ', { codoxNode, originalJsonNode });
//         return originalJsonNode;
//       }
//   }
  
//   function isGoogleDocsTitle(domNode: Node): boolean {
//     if (domNode.nodeName.toLowerCase() === 'span') {
//       return (domNode as HTMLSpanElement).style.fontSize === '26pt';
//     }
//     return false;
//   }
  
//   function $convertHeadingElement(element: HTMLElement): DOMConversionOutput {
//     const nodeName = element.nodeName.toLowerCase();
//     let node = null;
//     if (
//       nodeName === 'h1' ||
//       nodeName === 'h2' ||
//       nodeName === 'h3' ||
//       nodeName === 'h4' ||
//       nodeName === 'h5' ||
//       nodeName === 'h6'
//     ) {
//       node = $createHeadingNode(nodeName);
//       if (element.style !== null) {
//         setNodeIndentFromDOM(element, node);
//         node.setId(element.getAttribute('id'));
//         node.setFormat(element.style.textAlign as ElementFormatType);
//       }
//     }
//     return {node};
//   }
  
//   function $convertBlockquoteElement(element: HTMLElement): DOMConversionOutput {
//     const node = $createQuoteNode();
//     if (element.style !== null) {
//       node.setFormat(element.style.textAlign as ElementFormatType);
//       setNodeIndentFromDOM(element, node);
//     }
//     return {node};
//   }
  
//   export function $createHeadingNode(
//     headingTag: HeadingTagType = 'h1',
//   ): HeadingNode {
//     return $applyNodeReplacement(new HeadingNode(headingTag));
//   }
  
//   export function $isHeadingNode(
//     node: LexicalNode | null | undefined,
//   ): node is HeadingNode {
//     return node instanceof HeadingNode;
//   }


/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

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
    // LexicalUpdateJSON,
    NodeKey,
    ParagraphNode,
    PasteCommandType,
    RangeSelection,
    SerializedElementNode,
    Spread,
    TextFormatType,
  } from 'lexical';
  
  import {
    $insertDataTransferForRichText,
    copyToClipboard,
  } from '@lexical/clipboard';
  import {
    $moveCharacter,
    $shouldOverrideDefaultCharacterSelection,
  } from '@lexical/selection';
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
  
  export type SerializedHeadingNode = Spread<
    {
      tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';
      id: string;
      numberString?: string;
    },
    SerializedElementNode
  >;
  
  export const DRAG_DROP_PASTE: LexicalCommand<Array<File>> = createCommand(
    'DRAG_DROP_PASTE_FILE',
  );
  
  export type SerializedQuoteNode = SerializedElementNode;
  
  /** @noInheritDoc */
  export class QuoteNode extends ElementNode {
    static getType(): string {
      return 'quote';
    }
  
    static clone(node: QuoteNode): QuoteNode {
      return new QuoteNode(node.__key);
    }
  
    // View
  
    createDOM(config: EditorConfig): HTMLElement {
      const element = document.createElement('blockquote');
      addClassNamesToElement(element, config.theme.quote);
      return element;
    }
    updateDOM(prevNode: this, dom: HTMLElement): boolean {
      return false;
    }
  
    static importDOM(): DOMConversionMap | null {
      return {
        blockquote: (node: Node) => ({
          conversion: $convertBlockquoteElement,
          priority: 0,
        }),
      };
    }
  
    exportDOM(editor: LexicalEditor): DOMExportOutput {
      const {element} = super.exportDOM(editor);
  
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

        const numberString = (this as unknown as { __numberString?: string }).__numberString;
        element.setAttribute('data-number', numberString ?? '55');
      }
  
      return {
        element,
      };
    }
  
    static importJSON(serializedNode: SerializedQuoteNode): QuoteNode {
      return $createQuoteNode().updateFromJSON(serializedNode);
    }
    updateFromJSON(serializedNode: SerializedQuoteNode): QuoteNode {
      const node = this.getWritable();
      return node;
    }
  
    // Mutation
  
    insertNewAfter(_: RangeSelection, restoreSelection?: boolean): ParagraphNode {
      const newBlock = $createParagraphNode();
      const direction = this.getDirection();
      newBlock.setDirection(direction);
      this.insertAfter(newBlock, restoreSelection);
      return newBlock;
    }
  
    collapseAtStart(): true {
      const paragraph = $createParagraphNode();
      const children = this.getChildren();
      children.forEach((child) => paragraph.append(child));
      this.replace(paragraph);
      return true;
    }
  
    canMergeWhenEmpty(): true {
      return true;
    }
  }
  
  export function $createQuoteNode(): QuoteNode {
    return $applyNodeReplacement(new QuoteNode());
  }
  
  export function $isQuoteNode(
    node: LexicalNode | null | undefined,
  ): node is QuoteNode {
    return node instanceof QuoteNode;
  }
  
  function generateStableId(text: string): string {
    return  `${Math.floor(Math.random() * 1000) + 1}`
  }


  export type HeadingTagType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';
  
  /** @noInheritDoc */
  export class HeadingNode extends ElementNode {
    /** @internal */
    __tag: HeadingTagType;
    private __id: string | null = null;
    __numberString: string = ''; 
    __extraAttributes?:string

    static getType(): string {
      return 'heading';
    }
  
    static clone(node: HeadingNode): HeadingNode {
      const newNode = new HeadingNode(node.__tag);
      newNode.__id = node.__id;
      newNode.__numberString = node.__numberString;
      return newNode;
    }
  
    constructor(tag: HeadingTagType, key?: NodeKey) {
      super(key);
      this.__tag = tag;
      this.__id = generateStableId(this.getTextContent());
    }
  
    getTag(): HeadingTagType {
      return this.__tag;
    }
  
    setTag(tag: HeadingTagType): this {
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
  
    // View
  
  // createDOM(config: EditorConfig): HTMLElement {
  //   const tag = this.__tag;
  //   const element = document.createElement(tag);
  //   if (tag !== 'h6') {
  //     element.setAttribute('id', this.getId());
  //     element.setAttribute("data-ref-id", `ref-${this.getId()}`);
  //     element.setAttribute('data-number', this.__numberString ?? '0');
  //   }
  //   const theme = config.theme;
  //   const classNames: any = theme.heading;
  //   if (classNames !== undefined) {
  //     const className = classNames[tag];
  //     addClassNamesToElement(element, className);
  //   }
  //   return element;
  // }

  createDOM(config: EditorConfig): HTMLElement {
    const tag = this.__tag;
    const element = document.createElement(tag);
  
    if (tag !== 'h6') {
      element.setAttribute('id', this.getId());
      element.setAttribute("data-ref-id", `ref-${this.getId()}`);
      element.setAttribute('data-number', this.__numberString ?? '0');
    }
  
    const theme = config.theme;
    const classNames: any = theme.heading;
    if (classNames !== undefined) {
      const className = classNames[tag];
      addClassNamesToElement(element, className);
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
  
    static importDOM(): DOMConversionMap | null {
      return {
        h1: (node: Node) => ({
          conversion: $convertHeadingElement,
          priority: 0,
        }),
        h2: (node: Node) => ({
          conversion: $convertHeadingElement,
          priority: 0,
        }),
        h3: (node: Node) => ({
          conversion: $convertHeadingElement,
          priority: 0,
        }),
        h4: (node: Node) => ({
          conversion: $convertHeadingElement,
          priority: 0,
        }),
        h5: (node: Node) => ({
          conversion: $convertHeadingElement,
          priority: 0,
        }),
        h6: (node: Node) => ({
          conversion: $convertHeadingElement,
          priority: 0,
        }),
        p: (node: Node) => {
          // domNode is a <p> since we matched it by nodeName
          const paragraph = node as HTMLParagraphElement;
          const firstChild = paragraph.firstChild;
          if (firstChild !== null && isGoogleDocsTitle(firstChild)) {
            return {
              conversion: () => ({node: null}),
              priority: 3,
            };
          }
          return null;
        },
        span: (node: Node) => {
          if (isGoogleDocsTitle(node)) {
            return {
              conversion: (domNode: Node) => {
                return {
                  node: $createHeadingNode('h1'),
                };
              },
              priority: 3,
            };
          }
          return null;
        },
      };
    }
  
    exportDOM(editor: LexicalEditor): DOMExportOutput {
      const {element} = super.exportDOM(editor);
  
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
  
    static importJSON(serializedNode: SerializedHeadingNode): HeadingNode {
      const node = $createHeadingNode(serializedNode.tag)
      node.__id = serializedNode.id;
      node.__numberString = serializedNode.numberString ?? ''; // <--- Restore number string
      return node.updateFromJSON(serializedNode);
    }
  
    // updateFromJSON(
    //   serializedNode: LexicalUpdateJSON<SerializedHeadingNode>,
    // ): this {
    //   return (this.updateFromJSON(serializedNode) as this).setTag(serializedNode.tag);
    // }
  
    updateFromJSON(serializedNode: SerializedHeadingNode): this {
      this.__tag = serializedNode.tag;
      this.__id = serializedNode.id || null;
      return this;
    }

    exportJSON(): SerializedHeadingNode {
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
    ): ParagraphNode | HeadingNode {
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
          : $createHeadingNode(this.getTag());
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
        ? $createHeadingNode(this.getTag())
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
        /**
         * Step 1: Get original text node json. You should/must use .exportJSON()
         */
        const originalJsonNode = this.exportJSON();
    
        /**
         * Step 2: Extend with additional properties.
         */
        const convertedNode = {
          type: 'text', // type property must be one of core or playground node types
          
          // preserve default text node attributes
        //   text: originalJsonNode.text,
          format: originalJsonNode.format,
          // key: originalJsonNode.key,
        //   mode: originalJsonNode.mode,
        //   detail: originalJsonNode.detail,
          version: originalJsonNode.version,
    
          // extension: all mutable style properties should be serialized as a style string, as per TextNode definition 
          // assumption is the lexical node style is empty, if not, concat the styles. 
        //   style: `color:${originalJsonNode.color};background-color:${originalJsonNode.backgroundColor};`,
    
          /**
           * extension: codox_metadata should hold immutables:
           *  - required: your extended node type, e.g. 'warning' 
           *  - optional: any immutable properties of an original node - these fields are not merged and synchronized. 
           */
          codox_metadata: {
            type: originalJsonNode.type, //type == 'warning'
            id: originalJsonNode.id,
            // key:originalJsonNode.key //some custom id an immutable property
          },
        };
        console.log('[DEMO DEBUG][WarningNode][toCodoxNode]: ', { convertedNode, originalJsonNode });
    
        return convertedNode;
      }
    
      /**
       * Implement the following API methods to interoperate with Codox
       * Codox -> Lexical Node
       * Converts synchronized codox json node to lexical json node
       * must be class 'static' method
       */
      static fromCodoxNode(codoxNode : any) {
        /**
         * extension: all mutable properties should be deserialized from the style string, 
         */
        let color = '';
        let backgroundColor = '';
        // codoxNode.style.split(';').forEach((css) => {
        //   if (css.startsWith('color:')) {
        //     color = css.split(':')[1];
        //   }
        //   if (css.startsWith('background-color:')) {
        //     backgroundColor = css.split(':')[1];
        //   }
        // });
    
        // compose original json node from codox node
        const originalJsonNode = {
          // set original type - in this example it will be "warning"
          type: codoxNode.codox_metadata.type, 
          // set base attributes
          text: codoxNode.text,
          format: codoxNode.format,
          mode: codoxNode.mode,
          detail: codoxNode.detail,
          version: codoxNode.version,
          key: codoxNode.key,
          style: '',  // assumption here is the lexical node style is empty, if not, splice out the extended mutable properties
    
          /**
           * set custom attributes
           */
          id: codoxNode.codox_metadata.id,
          color: color,
          backgroundColor: backgroundColor,
        };
        console.log('[DEMO DEBUG][WarningNode][fromCodoxNode]: ', { codoxNode, originalJsonNode });
        return originalJsonNode;
      }
  }
  
  function isGoogleDocsTitle(domNode: Node): boolean {
    if (domNode.nodeName.toLowerCase() === 'span') {
      return (domNode as HTMLSpanElement).style.fontSize === '26pt';
    }
    return false;
  }
  
  function $convertHeadingElement(element: HTMLElement): DOMConversionOutput {
    const nodeName = element.nodeName.toLowerCase();
    let node = null;
    if (
      nodeName === 'h1' ||
      nodeName === 'h2' ||
      nodeName === 'h3' ||
      nodeName === 'h4' ||
      nodeName === 'h5' ||
      nodeName === 'h6'
    ) {
      node = $createHeadingNode(nodeName);
      if (element.style !== null) {
        setNodeIndentFromDOM(element, node);
        node.setId(element.getAttribute('id'));
        node.setFormat(element.style.textAlign as ElementFormatType);
      }

      if (nodeName === 'h6') {
        const extraAttributes: any= {};
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          extraAttributes[attr.name] = attr.value;
          if(attr.name === 'data-hidethis'){
            element.style.opacity = '0'
          }
        }
        node.__extraAttributes = extraAttributes;
      }
    }
    return {node};
  }
  
  function $convertBlockquoteElement(element: HTMLElement): DOMConversionOutput {
    const node = $createQuoteNode();
    if (element.style !== null) {
      node.setFormat(element.style.textAlign as ElementFormatType);
      setNodeIndentFromDOM(element, node);
    }
    return {node};
  }
  
  export function $createHeadingNode(
    headingTag: HeadingTagType = 'h1',
  ): HeadingNode {
    return $applyNodeReplacement(new HeadingNode(headingTag));
  }
  
  export function $isHeadingNode(
    node: LexicalNode | null | undefined,
  ): node is HeadingNode {
    return node instanceof HeadingNode;
  }
