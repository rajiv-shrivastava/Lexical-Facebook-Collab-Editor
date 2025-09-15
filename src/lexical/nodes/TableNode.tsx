import {
  TextNode,
  NodeKey,
  LexicalNode,
  EditorConfig,
  SerializedTextNode,
} from "lexical";


interface SerializedColoredNode extends SerializedTextNode {
  color: string;
  fontSize: string;
  bold: string;
  italic: string;
  alignment: string;
  fontFamily: string;
  leadingSpace: string;
  lineSpacing: string;
  trailingSpace: string;
  id: string;
  type: "colored";
}


export class ColoredNode extends TextNode {
  private __color: string;
  private __fontSize: string;
  private __bold: string;
  private __italic: string;
  private __alignment: string;
  private __fontFamily: string;
  private __leadingSpace: string;
  private __lineSpacing: string;
  private __trailingSpace: string;
  private __id: string;


  constructor(text: string, color: string, fontSize: string, bold : string, italic: string, alignment: string, fontFamily: string, leadingSpace: string, lineSpacing: string, trailingSpace: string, id: string, key?: NodeKey) {
    super(text, key);
    this.__color = color;
    this.__fontSize = fontSize;
    this.__bold = bold;
    this.__italic = italic;
    this.__alignment = alignment;
    this.__fontFamily = fontFamily;
    this.__leadingSpace = leadingSpace;
    this.__lineSpacing = lineSpacing;
    this.__trailingSpace = trailingSpace;
    this.__id = id;
  }


  static getType(): string {
    return "colored";
  }


  getId(): string {
    return this.__id;
  }


  static clone(node: ColoredNode): ColoredNode {
    return new ColoredNode(node.__text, node.__color, node.__fontSize,node.__bold, node.__italic, node.__alignment, node.__fontFamily, node.__leadingSpace, node.__lineSpacing, node.__trailingSpace, node.__id, node.__key);
  }


createDOM(config: EditorConfig): HTMLElement {
  const element = super.createDOM(config);
  element.style.color = this.__color;
  (element.style as any).fontSize = this.__fontSize;
  (element.style as any).fontWeight = this.__bold;
  (element.style as any).fontStyle = this.__italic;
  (element.style as any).fontFamily = this.__fontFamily;
  (element.style as any).marginLeft = this.__leadingSpace;
  (element.style as any).lineHeight = this.__lineSpacing;
  (element.style as any).marginRight = this.__trailingSpace;

  element.setAttribute("id", this.__id);
  element.setAttribute("data-ref-id", `ref-${this.__id}`);

  // Apply text-align to parent p tag
  setTimeout(() => {
    const parentP = element.closest('p');
    if (parentP) {
      (parentP.style as any).textAlign = this.__alignment;
    }
  }, 0);

  return element;
}

updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
  const isUpdated = super.updateDOM(prevNode, dom, config);

  if (prevNode.__color !== this.__color) {
    dom.style.color = this.__color;
  }

  if (prevNode.__fontSize !== this.__fontSize) {
    (dom.style as any).fontSize = this.__fontSize;
  }

  if (prevNode.__bold !== this.__bold) {
    (dom.style as any).fontWeight = this.__bold;
  }

  if (prevNode.__italic !== this.__italic) {
    (dom.style as any).fontStyle = this.__italic;
  }

  if (prevNode.__alignment !== this.__alignment) {
    const parentP = dom.closest('p');
    if (parentP) {
      (parentP.style as any).textAlign = this.__alignment;
    }
  }

  if (prevNode.__fontFamily !== this.__fontFamily) {
    (dom.style as any).fontFamily = this.__fontFamily;
  }

  if (prevNode.__leadingSpace !== this.__leadingSpace) {
    (dom.style as any).marginLeft = this.__leadingSpace;
  }

  if (prevNode.__lineSpacing !== this.__lineSpacing) {
    (dom.style as any).lineHeight = this.__lineSpacing;
  }

  if (prevNode.__trailingSpace !== this.__trailingSpace) {
    (dom.style as any).marginRight = this.__trailingSpace;
  }

  if (prevNode.__id !== this.__id) {
    dom.setAttribute("id", this.__id);
    dom.setAttribute("data-ref-id", `ref-${this.__id}`);
  }

  return isUpdated;
}



  exportJSON(): SerializedColoredNode {
    return {
      ...super.exportJSON(),
      type: "colored",
      color: this.__color,
      fontSize: this.__fontSize,
      bold: this.__bold,
      italic: this.__italic,
      alignment: this.__alignment,
      fontFamily: this.__fontFamily,
      leadingSpace: this.__leadingSpace,
      lineSpacing: this.__lineSpacing,
      trailingSpace: this.__trailingSpace,
      id: this.__id,
    };
  }


  static importJSON(serializedNode: SerializedColoredNode): ColoredNode {
    return new ColoredNode(
      serializedNode.text,
      serializedNode.color,
      serializedNode.fontSize,
      serializedNode.bold,
      serializedNode.italic,
      serializedNode.alignment,
      serializedNode.fontFamily,
      serializedNode.leadingSpace,
      serializedNode.lineSpacing,
      serializedNode.trailingSpace,
      serializedNode.id
    );
  }


  /**
   * Implement the following API methods to interoperate with Codox
   * Lexical -> Codox Node 
   * Converts lexical node to json node, acceptable by Codox.
   */
  toCodoxNode() {
    // Step 1: Get original text node JSON (using .exportJSON())
    const originalJsonNode = this.exportJSON();


    // Step 2: Extend with additional properties for Codox compatibility
    const convertedNode = {
      type: "text", // Must be one of core or playground node types
      text: originalJsonNode.text,
      format: originalJsonNode.format,
      mode: originalJsonNode.mode,
      detail: originalJsonNode.detail,
      version: originalJsonNode.version,
      style: `color:${originalJsonNode.color};font-size:${originalJsonNode.fontSize};font-weight:${originalJsonNode.bold};font-style:${originalJsonNode.italic};text-align:${originalJsonNode.alignment};font-family:${originalJsonNode.fontFamily};margin-left:${originalJsonNode.leadingSpace};line-height:${originalJsonNode.lineSpacing};margin-right:${originalJsonNode.trailingSpace}`, // Include the color and fontSize styles as a CSS string


      // Codox metadata should hold the immutable properties
      codox_metadata: {
        type: originalJsonNode.type, // type == 'colored'
        id: originalJsonNode.id, // Custom id, immutable property
      },
    };


    // console.log("[DEMO DEBUG][ColoredNode][toCodoxNode]:", {
    //   convertedNode,
    //   originalJsonNode,
    // });


    return convertedNode;
  }


  /**
   * Implement the following API methods to interoperate with Codox
   * Codox -> Lexical Node
   * Converts synchronized Codox JSON node to Lexical JSON node
   * Must be class 'static' method
   */
  static fromCodoxNode(codoxNode: any) {
    // Extract color from the style string
    let color = "";
    let fontSize = "";
    let bold = "";
    let italic = "";
    let alignment = "";
    let fontFamily = "";
    let leadingSpace = "";
    let lineSpacing = "";
    let trailingSpace = "";
    
    // More robust CSS parsing
    if (codoxNode.style) {
      codoxNode.style.split(";").forEach((css: string) => {
        const trimmedCss = css.trim();
        if (trimmedCss?.startsWith("color:")) {
          color = trimmedCss.substring(6); // Remove "color:" prefix
        }
        if (trimmedCss?.startsWith("font-size:")) {
          fontSize = trimmedCss.substring(10); // Remove "font-size:" prefix
        }
        if (trimmedCss?.startsWith("font-weight:")) {
          bold = trimmedCss.substring(12); // Remove "font-weight:" prefix
        }
        if (trimmedCss?.startsWith("font-style:")) {
          italic = trimmedCss.substring(11); // Remove "font-style:" prefix
        }
        if (trimmedCss?.startsWith("text-align:")) {
          alignment = trimmedCss.substring(11); // Remove "text-align:" prefix
        }
        if (trimmedCss?.startsWith("font-family:")) {
          fontFamily = trimmedCss.substring(12); // Remove "font-family:" prefix
        }
        if (trimmedCss?.startsWith("margin-left:")) {
          leadingSpace = trimmedCss.substring(12); // Remove "margin-left:" prefix
        }
        if (trimmedCss?.startsWith("line-height:")) {
          lineSpacing = trimmedCss.substring(12); // Remove "line-height:" prefix
        }
        if (trimmedCss?.startsWith("margin-right:")) {
          trailingSpace = trimmedCss.substring(13); // Remove "margin-right:" prefix
        }
      });
    }


    // Compose original JSON node from Codox node
    const originalJsonNode = {
      type: codoxNode.codox_metadata.type, // Set original type (e.g., "colored")
      text: codoxNode.text,
      format: codoxNode.format,
      mode: codoxNode.mode,
      detail: codoxNode.detail,
      version: codoxNode.version,
      style: "", // Assuming the Lexical node style is empty; if not, handle it appropriately
      id: codoxNode.codox_metadata.id,
      color: color, // Set custom attributes
      fontSize: fontSize,
      bold: bold,
      italic: italic,
      alignment: alignment,
      fontFamily: fontFamily,
      leadingSpace: leadingSpace,
      lineSpacing: lineSpacing,
      trailingSpace: trailingSpace,
    };


    // console.log("[DEMO DEBUG][ColoredNode][fromCodoxNode]:", {
    //   codoxNode,
    //   originalJsonNode,
    // });


    return originalJsonNode;
  }
}


// Optional: Best practice to create the ColoredNode via a helper function
export function $createColoredNode(
  text: string,
  color: string,
  fontSize: string,
  bold: string,
  italic: string,
  alignment: string,
  fontFamily: string,
  leadingSpace: string,
  lineSpacing: string,
  trailingSpace: string,
  id: string
): ColoredNode {
  return new ColoredNode(text, color, fontSize, bold, italic, alignment, fontFamily, leadingSpace, lineSpacing, trailingSpace, id);
}


export function $isColoredNode(
  node: LexicalNode | null | undefined
): node is ColoredNode {
  return node instanceof ColoredNode;
}
