// import {
//   ElementNode,
//   LexicalNode,
//   NodeKey,
//   Spread,
//   SerializedElementNode,
//   $getSelection,
//   $isRangeSelection,
// } from "lexical";
// import './DivNode.css';

// type SerializedDivNode = Spread<
//   {
//     type: "div";
//     version: 1;
//     id: string;
//     className: string;
//   },
//   SerializedElementNode
// >;
//   let count = 1
//   let defaultVal = "Type a Header"
//   let defaultFooter = "Type a Footer"

//   export function setDefaultHeader(val:string){
//     defaultVal = val
//   }

//     export function setDefaultFooter(val:string){
//     defaultFooter = val
//   }

// function generateID() {
//   const now = new Date();

//   const hours = now.getHours();
//   const minutes = now.getMinutes();
//   const seconds = now.getSeconds();

//   // Convert time to total seconds since midnight
//   const totalSeconds = hours * 3600 + minutes * 60 + seconds;

//   // Pad to 6 digits
//   return `${count}-${String(totalSeconds).padStart(6, '0')}`
// }

// export function getSelectedDivNode(): DivNode | null {
//   const selection = $getSelection();

//   if (!$isRangeSelection(selection)) {
//     return null;
//   }

//   let node :any= selection.anchor.getNode();

//   // Traverse up the tree to find the DivNode
//   while (node !== null) {
//     if ($isDivNode(node)) {
//       return node;
//     }
//     node = node.getParent();
//   }

//   return null;
// }

// export class DivNode extends ElementNode {
//    __id: string;
//    __className: string;
//   static getType(): string {
//     return "div";
//   }

//   setClassName(className: string): this {
//   const writable = this.getWritable();
//   writable.__className = className;
//   return this;
// }

// removeClassName(className: string): this {
//   const writable = this.getWritable();
//   if (writable.__className === className) {
//     writable.__className = "";
//   }
//   return this;
// }

//   // static clone(node: DivNode): DivNode {
//   //   return new DivNode(node.__id,node.__key);
//   // }

//   static clone(node: DivNode): DivNode {
//   return new DivNode(node.__id, node.__className, node.__key);
// }


//   constructor(id:string,clasName:string,key?: NodeKey) {
//     super(key);
//     this.__id = id,
//     this.__className = clasName;
//   }

//   // ----- Serialization -----
//   static importJSON(serializedNode: SerializedDivNode): DivNode {
//     const node = new DivNode(serializedNode.id, serializedNode.className);
//     return node
//   }

//   exportJSON(): SerializedDivNode {
//     return {
//       ...super.exportJSON(),
//       type: "div",
//       version: 1,
//       id: generateID(),
//       className: this.__className,
//     };
//   }

// static importDOM(): any {
//   return {
//     div: (domNode: HTMLElement) => {
//       if (!domNode.classList.contains("custom-div")) {
//         return null;
//       }

//       const HeaderText = domNode.getAttribute('HeaderText') || defaultVal
//       const FooterText = domNode.getAttribute('FooterText') || defaultFooter

//       return {
//         conversion: () => {
//           setDefaultHeader(HeaderText)
//           setDefaultFooter(FooterText)
//           const divNode = new DivNode(generateID(),'custom-div');

//           // Import children inside this div as well
//           return { node: divNode };
//         },
//         priority: 3,
//       };
//     },
//   };
// }

// exportDOM(): { element: HTMLElement } {
//   const dom = document.createElement("div");
//   dom.classList.add("custom-div");
//   dom.id = count.toString()
//   // Add the header and footer inputs
//   const headerInput = document.createElement("input");
//   headerInput.type = "text";
//   headerInput.className = "Header-Input";
//   headerInput.id = "header";
//   headerInput.value = defaultVal;

//   const footerInput = document.createElement("input");
//   footerInput.type = "text";
//   footerInput.className = "Footer-Input";
//   footerInput.id = "footer";
//   footerInput.value = defaultFooter;

//   dom.appendChild(headerInput);
//   dom.appendChild(footerInput);

//     if (this.__className) {
//     dom.classList.add(this.__className);
//   }

//   // Add styling inline (optional, often used to preserve appearance in export)
//   dom.style.border = "1px solid #aaa";
//   dom.style.margin = "10px 0";
//   dom.style.boxShadow = "0 -10px 0 0 #eee, 0 10px 0 0 #eee";
//   dom.style.padding = "96px";
//   dom.style.minHeight = "1000px";
//   dom.style.maxWidth = "816px";
//   dom.style.marginLeft = "8.5%";

//   return { element: dom };
// }



//   // ----- DOM Representation -----
// //   createDOM(): HTMLElement {
// //     const dom = document.createElement("div");
// //     dom.classList.add("custom-div");
// //     dom.style.backgroundColor = "#f0f0f0"; // Example styling
// //     dom.style.minHeight = '1124px';
// //     // dom.style.maxHeight = '1124px';
// //     dom.style.border = '1px solid rgb(77 77 77 / 55%)';
// //     return dom;
// //   }

// createDOM(): HTMLElement {
//   const dom = document.createElement("div");
//   dom.innerHTML = `<input type='text' class='Header-Input' id='${count}-header' value='${defaultVal}'/> <input type='text' class='Footer-Input' id='${count}-footer' value='${defaultFooter}' />`;
//   dom.id = count.toString()
//   count = count +1
//   dom.classList.add("custom-div");
//   dom.style.border = "1px solid #aaa";
//   // dom.style.margin = "0 0 15px 8.5%;";
// //   dom.style.borderTop = "10px solid #eee"
// dom.style.boxShadow = " 0 -10px 0 0 #eee, 0 10px 0 0 #eee"
//   dom.style.padding = "8px";
//   dom.style.minHeight = "1100px";
//   dom.style.maxWidth = '600px'
//   dom.style.padding = '96px 96px'
//   dom.style.marginLeft = '17.5%'
//   dom.style.marginBottom = '10px'

//   dom.setAttribute('HeaderText', defaultVal)
//   dom.setAttribute('FooterText', defaultFooter)

//       if (this.__className) {
//         console.log('class name',this.__className)
//     dom.classList.add(this.__className);
//   }

//   // Monitor height
//   const resizeObserver = new ResizeObserver((entries) => {
//     for (let entry of entries) {
//       const height = entry.contentRect.height;
//       if (height > 1124) {
//         // Dispatch custom command to handle split
//         console.log('height exceeded');
//         // dom.dispatchEvent(new CustomEvent("DivNodeOverflow", { detail: { key: this.getKey() } }));
//         dom.dispatchEvent(
//   new CustomEvent("DivNodeOverflow", {
//     detail: { key: this.getKey() },
//     bubbles: true,
//   })
// );
//       }
//     }
//   });

//   resizeObserver.observe(dom);

//   return dom;
// }


// updateDOM(prevNode: DivNode, dom: HTMLElement): boolean {
//   if (this.__className !== prevNode.__className) {
//     // // Remove old class
//     // if (prevNode.__className) {
//     //   dom.classList.remove(prevNode.__className);
//     // }
//     // Add new class
//     if (this.__className) {
//       dom.classList.add(this.__className);
//     }
//     return true; // tells Lexical to re-render the DOM
//   }
//   return false;
// }

//   // ----- Allowed Children -----
//   canInsertNode(node: LexicalNode): boolean {
//     const allowedTypes = [
//       "table",
//       "image",
//       "heading",
//       "paragraph",
//       "list",
//       "custom", // extend with your custom nodes
//     ];
//     return allowedTypes.includes((node as any).getType?.());
//   }
//         toCodoxNode() {
//   const originalJsonNode = this.exportJSON();
//   console.log('dsjfhsdfsdf',originalJsonNode)
//   return {
//     type: 'page-break',
//     children: originalJsonNode.children,
//     direction: originalJsonNode.direction,
//     format: originalJsonNode.format,
//     indent: originalJsonNode.indent,
//     version: originalJsonNode.version,
//     id: originalJsonNode.id,
//     className: originalJsonNode.className,
//     codox_metadata: {
//       type: originalJsonNode.type,
//       _namespace: originalJsonNode.type,
//       id: originalJsonNode.id,
//     }
//   };
// }


// static fromCodoxNode(codoxNode: any) {
//     const filterNodes :any= []
//   const nodes = codoxNode.children;
//   console.log('dfjsdhfsdf div',codoxNode)
//   // nodes.forEach((node:any)=>{
//   //   node.codoxId = codoxNode.codoxId !== undefined && codoxNode.codoxId;
//   // console.log('dfjsdhfsdf',node.codoxId)
//   //   filterNodes.push(node)

//   // })

//   return {
//       children: codoxNode.children,
//       direction: codoxNode.direction,
//       format: codoxNode.format,
//       indent: codoxNode.indent,
//       type: 'div',
//       version: codoxNode.version,
//       id: codoxNode.id,
//       className: codoxNode.className,
//   };
// }


// }

// export function $createDivNode(): DivNode {
//   return new DivNode(generateID(),"custom-div");
// }

// export function $isDivNode(node: LexicalNode | null): node is DivNode {
//   return node instanceof DivNode;
// }
