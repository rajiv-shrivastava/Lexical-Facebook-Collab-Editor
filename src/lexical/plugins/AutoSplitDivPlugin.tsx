import { useEffect, useRef } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getNodeByKey,
  PASTE_COMMAND,
  COMMAND_PRIORITY_LOW,
  LexicalNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $createParagraphNode,
  $createTextNode,
  $createRangeSelection,
  $setSelection,
} from "lexical";
import { $createLayoutItemNode, getAllLayoutItemNodes, getSelectedPage, setDefaultFooter, setDefaultHeader } from "../nodes/LayoutItemNode";
import { $createSimpleInputNode } from "../nodes/Header-Footer/HeaderNode";
import { $generateNodesFromDOM } from "@lexical/html";

export default function AutoSplitDivPlugin() {
  const [editor] = useLexicalComposerContext();
  const headerRef = useRef<any>('Type a Header');
  const footerRef = useRef<any>('Type a Footer');
  const PasteRef = useRef<any>(null)
  const MAX_HEIGHT = 1000;

//       useEffect(() => {
//         setTimeout(()=>{
//               const handleDoubleClick = (e:any) => {
//       console.log('Double-clicked element:', e.target.id);
//       // Add your custom logic here
//       editor.setEditable(false)
//       header.focus()
//     };

//       const handleKeyDown = (e: KeyboardEvent) => {
//     if (e.ctrlKey && e.key.toLowerCase() === 'h') {
//       e.preventDefault(); // prevent the default browser action (e.g., opening browser search)
//       e.stopPropagation()
//       editor.setEditable(false);
//       editor.update(()=>{
//         const divNode :any = getSelectedPage()
//           console.log('fjghdfgdfgfh',divNode.getHeaderText())
//       const header = document.getElementById(`${divNode.__id}-header`);
//         setTimeout(()=>{
//       if (header) {
//         header.focus()
//               header.onchange = function (e: any) {
//         editor.setEditable(false);
//       };

//         const headerInputs = document.querySelectorAll('.Header-Input');

//         // Function to update all inputs when one changes
//         headerInputs.forEach(input => {
//           input.addEventListener('input', (e:any) => {
//             const value = e.target.value;
//           headerRef.current = value;
//       headerInputs.forEach((otherInput:any) => {
//         if (otherInput !== e.target) {
//           otherInput.value = value;
//           headerRef.current = value;
//         }
//       });
//     });
//   });
//       }

//       if (header) header.setAttribute('contenteditable', 'true');
//         },500)

//       })

//     }
//   };

//         const handleKeyDownFooter = (e: KeyboardEvent) => {
//     if (e.ctrlKey && e.key.toLowerCase() === 'e') {
//       e.preventDefault(); // prevent the default browser action (e.g., opening browser search)
//       e.stopPropagation()
//       editor.setEditable(false);
//       editor.update(()=>{
//         const divNode :any = getSelectedPage()
//       const footer = document.getElementById(`${divNode.__id}-footer`);
//         setTimeout(()=>{
//       if (footer) {
//         footer.focus()
//               footer.onchange = function (e: any) {
//         editor.setEditable(false);
//       };

//         const footerInputs = document.querySelectorAll('.Footer-Input');

//         // Function to update all inputs when one changes
//         footerInputs.forEach(input => {
//           input.addEventListener('input', (e:any) => {
//             const value = e.target.value;
//           footerRef.current = value;
//       footerInputs.forEach((otherInput:any) => {
//         if (otherInput !== e.target) {
//           otherInput.value = value;
//           footerRef.current = value;
//         }
//       });
//     });
//   });
//       }

//       if (footer) footer.setAttribute('contenteditable', 'true');
//         },500)

//       })

//     }
//   };

//     const header :any= document.querySelector('.Header-Input');
//     const footer = document.querySelector('.Footer-Input');

//     editor.update(()=>{
//       const node = getSelectedPage()
//       if(!node) return
//       console.log('sdfbsdhfdd',node.getChildren())
//     })

//     console.log('fdjhgdfxkjg',header,footer)
//     // if (header) {
//     //   header.onchange = function (e: any) {
//     //     editor.setEditable(false);
//     //   };

//     //         header.ondblclick = function (e: any) {
//     //     editor.setEditable(false);
//     //   };
//     // }

//     //     if (footer) {
//     //   footer.onchange = function (e: any) {
//     //     editor.setEditable(false);
//     //   };

//     //         footer.ondblclick = function (e: any) {
//     //     editor.setEditable(false);
//     //   };
//     // }
//     if (header)  header.addEventListener('dblclick', handleDoubleClick);
//     if (footer) footer.addEventListener('dblclick', handleDoubleClick);
// document.addEventListener('keydown', handleKeyDown);
// document.addEventListener('keydown', handleKeyDownFooter);

//     // Cleanup function
//     return () => {
//       if (header) header.removeEventListener('dblclick', handleDoubleClick);
//       if (footer) footer.removeEventListener('dblclick', handleDoubleClick);
//       document.removeEventListener('keydown', handleKeyDown);
//       document.removeEventListener('keydown', handleKeyDownFooter);
//     };
//         },5500)
//   }, [editor]);

  useEffect(() => {
 // example threshold in pixels

  const handler = (event: any) => {
    if( PasteRef.current === false){
          const { key } = event.detail;

    editor.update(() => {
      const node: any = $getNodeByKey(key);
      if (!node) return;

      const domElement = editor.getElementByKey(key);
      if (!domElement) return;

      const height = domElement.offsetHeight;

      if (height <= MAX_HEIGHT) return;

      const children = node.getChildren();
      if (children.length === 0) return;
      setDefaultHeader(headerRef.current)
      setDefaultFooter(footerRef.current)
      const newDiv = $createLayoutItemNode();
      const midpoint = Math.floor(children.length / 2);
      const toMove = [...children.slice(midpoint)];
      console.log('kdfghhg',node.getNextSibling()?.getClassName())
      // custom-landscape
              if(node.getNextSibling() !== null && node.getNextSibling().getType() === 'layout-item' && node.getNextSibling()?.getClassName() === undefined){
          console.log('sdfsfsdfdsf',node.getNextSibling())
          const nextpage = node.getNextSibling();
                toMove.forEach((child: LexicalNode) => nextpage.append(child));
      // node.insertAfter(newDiv);
      nextpage.selectStart();

        }
        else{
                toMove.forEach((child: LexicalNode) => newDiv.append(child));
      node.insertAfter(newDiv);
        }
    });

//     editor.update(() => {
//   const node = $getNodeByKey(key);
//   if (!node) return;

//   const domElement = editor.getElementByKey(key);
//   if (!domElement) return;

//   const height = domElement.offsetHeight;
//   if (height <= MAX_HEIGHT) return;

//   // Create new layout node (or whatever node type you're using)
//   const newNode = $createLayoutItemNode();
//   node.insertAfter(newNode);

//   // Optionally set header/footer
//   setDefaultHeader(headerRef.current);
//   setDefaultFooter(footerRef.current);

//   // Move selection (caret) into the new node
//   const selection = $getSelection();
//   if ($isRangeSelection(selection)) {
//     const newNodeStart = newNode.getFirstDescendant();

//     if ($isTextNode(newNodeStart)) {
//       // If the first child is a text node, place caret at the start
//       selection.setTextNodeRange(newNodeStart, 0, newNodeStart, 0);
//     } else {
//       // If no text node, insert a new empty paragraph or text node to select
//       const paragraph = $createParagraphNode().append($createTextNode());
//       newNode.append(paragraph);
//       const textNode = paragraph.getFirstChild();
//       if ($isTextNode(textNode)) {
//         selection.setTextNodeRange(textNode, 0, textNode, 0);
//       }
//     }
//   }
// });


//   editor.update(() => {
//   const node: any = $getNodeByKey(key);
//   if (!node) return;

//   const domElement = editor.getElementByKey(key);
//   if (!domElement) return;

//   const height = domElement.offsetHeight;
//   if (height <= MAX_HEIGHT) return;

//   const children = node.getChildren();
//   if (children.length === 0) return;

//   setDefaultHeader(headerRef.current);
//   setDefaultFooter(footerRef.current);

//   const midpoint = Math.floor(children.length / 2);
//   const toMove = [...children.slice(midpoint)];

//   const nextPage = node.getNextSibling();
//   if (nextPage && nextPage.getType() === 'layout-item') {
//     console.log('Prepending to existing next layout-item:', nextPage.getKey());

//     const firstChild = nextPage.getFirstChild();

//     toMove.forEach((child: LexicalNode) => {
//       if (firstChild) {
//         child.insertBefore(firstChild);
//       } else {
//         nextPage.append(child); // if no children, just append
//       }
//     });

//     nextPage.selectStart();
//   } else {
//     const newDiv = $createLayoutItemNode();
//     toMove.forEach((child: LexicalNode) => {
//       newDiv.append(child);
//     });
//     node.insertAfter(newDiv);
//   }
// });



    }
  };

  document.addEventListener("DivNodeOverflow", handler);

const unregisterPaste = editor.registerCommand(
  PASTE_COMMAND,
  () => {
    PasteRef.current = true
    setTimeout(() => {
      editor.update(() => {
        const root = editor.getRootElement();
        if (!root) return;

        const processedNodes = new Set<string>();
        const wrappers = root.querySelectorAll("[data-lexical-node-key]");
        const MAX_HEIGHT = 800;
        
        wrappers.forEach((wrapper) => {
          console.log('sfdkjgh',wrapper)
          const nodeKey = wrapper.getAttribute("data-lexical-node-key");
          if (!nodeKey || processedNodes.has(nodeKey)) return;

          const node: any = $getNodeByKey(nodeKey);
          const domElement = editor.getElementByKey(nodeKey);
          if (!node || !domElement) return;

          let height = domElement.offsetHeight;

          let safetyCounter = 0; // avoid infinite loop
          while (height > MAX_HEIGHT && safetyCounter < 5) {
            const children = node.getChildren();
            if (children.length <= 1) break;

            const midpoint = Math.floor(children.length / 2);
            const toMove = children.slice(midpoint);

            const newDiv = $createLayoutItemNode();
            newDiv.setHeaderText(headerRef.current);
            newDiv.setFooterText(footerRef.current);

            toMove.forEach((child:any) => newDiv.append(child));
            node.insertAfter(newDiv);

            processedNodes.add(nodeKey);
            processedNodes.add(newDiv.getKey());

            // Refresh height after DOM change
            const newElement = editor.getElementByKey(newDiv.getKey());
            if (!newElement) break;

            height = newElement.offsetHeight;
            safetyCounter++;
          }
        });
      });
    }, 50);

    return false;
  },
  COMMAND_PRIORITY_LOW
);


  return () => {
    document.removeEventListener("DivNodeOverflow", handler);
    unregisterPaste();
  };
}, [editor]);


const headerSave = ()=>{
  editor.update(()=>{
    const allPage = getAllLayoutItemNodes()
    if(allPage){
      allPage.forEach((page:any)=>{
        page.setHeaderText(headerRef.current)
        console.log('hjsgfsdfdf',headerRef.current,footerRef.current)
      })
    }
  })
}
const footerSave = ()=>{
  editor.update(()=>{
    const allPage = getAllLayoutItemNodes()
    if(allPage){
      allPage.forEach((page:any)=>{
        page.setFooterText(footerRef.current)
        console.log('hjsgfsdfdf',headerRef.current,footerRef.current)
      })
    }
  })
}


      const handleKeyDown = (e: any) => {
    // if (e.ctrlKey && e.key.toLowerCase() === 'h') {
      e.preventDefault(); // prevent the default browser action (e.g., opening browser search)
      e.stopPropagation()
      editor.setEditable(false);
      editor.update(()=>{
        const divNode :any = getSelectedPage()
          console.log('fjghdfgdfgfh',divNode.getHeaderText())
      const header = document.getElementById(`${divNode.__id}-header`);
        setTimeout(()=>{
      if (header) {
        header.focus()
              header.onchange = function (e: any) {
        editor.setEditable(false);
      };

        const headerInputs = document.querySelectorAll('.Header-Input');

        // Function to update all inputs when one changes
        headerInputs.forEach(input => {
          input.addEventListener('input', (e:any) => {
            const value = e.target.value;
          headerRef.current = value;
      headerInputs.forEach((otherInput:any) => {
        if (otherInput !== e.target) {
          otherInput.value = value;
          headerRef.current = value;
        }
      });
    });
  });
      }

      if (header) header.setAttribute('contenteditable', 'true');
        },500)

      })

    // }
  };


// useEffect(() => {
//   const timer = setTimeout(() => {
//     editor.update(() => {
//       const header = document.querySelector('.Header-Input');
//       if (header) {
//         console.log('kjfdhgjfdkhg',header)
//         const handleDoubleClick = () => {
//           console.log('Header was double-clicked!');
//           // Add your logic here
//         };

//         header.addEventListener('dblclick', handleDoubleClick);

//         // Clean up the event listener on unmount
//         return () => {
//           header.removeEventListener('dblclick', handleDoubleClick);
//         };
//       }
//     });
//   }, 5500);

//   // Clean up the timer
//   return () => clearTimeout(timer);
// }, [editor]);


// useEffect(() => {
//   const timer = setTimeout(() => {
//     editor.update(() => {
//       const headers = document.querySelectorAll('.Header-Input');

//       const handleDoubleClick = (e:any) => {
//         editor.setEditable(false)
//         const selectedHeader = e.target
//         if(selectedHeader){
//           setTimeout(()=>{
//             if (selectedHeader) {
//               console.log('djhfksdhfsdf Header was double-clicked!', e.target);
//         selectedHeader.focus()
//               selectedHeader.onchange = function (e: any) {
//         editor.setEditable(false);
//       };

//         const headerInputs = document.querySelectorAll('.Header-Input');

//         // Function to update all inputs when one changes
//         headerInputs.forEach(input => {
//           input.addEventListener('input', (e:any) => {
//             const value = e.target.value;
//           headerRef.current = value;
//       headerInputs.forEach((otherInput:any) => {
//         if (otherInput !== e.target) {
//           otherInput.value = value;
//           headerRef.current = value;
//         }
//       });
//     });
//   });
//       }

//       if (selectedHeader) selectedHeader.setAttribute('contenteditable', 'true');
//         },500)
//         }
//       };

//       headers.forEach((header) => {
//         console.log('djhfksdhfsdf')
//         header.addEventListener('dblclick', handleDoubleClick);
//       });

//       // Cleanup function to remove all listeners
//       return () => {
//         headers.forEach((header) => {
//           header.removeEventListener('dblclick', handleDoubleClick);
//         });
//       };
//     });
//   }, 5500);

//   // Cleanup timeout on unmount or change
//   return () => clearTimeout(timer);
// }, [editor]);

useEffect(() => {
  const handleInputDoubleClicked = (e: any) => {
    editor.update(()=>{
      if(e.detail.type === 'header'){
              const headerSelected = document.getElementById(e.detail.id)
      if(headerSelected){
    console.log('Double-clicked input ID:', headerSelected);
    editor.setEditable(false)
    headerSelected.focus()
    headerSelected.onchange = function (e: any) {
        editor.setEditable(false);
      };

              const headerInputs = document.querySelectorAll('.Header-Input');

        // Function to update all inputs when one changes
        headerInputs.forEach(input => {
          input.addEventListener('input', (e:any) => {
            const value = e.target.value;
          headerRef.current = value;
      headerInputs.forEach((otherInput:any) => {
        if (otherInput !== e.target) {
          otherInput.value = value;
          headerRef.current = value;
        }
      });
    });
  });


      }
      }

       if(e.detail.type === 'footer'){
        console.log('Double-clicked input ID:', e.detail.id);
              const footerSelected = document.getElementById(e.detail.id)
      if(footerSelected){
    editor.setEditable(false)
    footerSelected.focus()
    footerSelected.onchange = function (e: any) {
        editor.setEditable(false);
      };

              const footerInputs = document.querySelectorAll('.Footer-Input');

        // Function to update all inputs when one changes
        footerInputs.forEach(input => {
          input.addEventListener('input', (e:any) => {
            const value = e.target.value;
          footerRef.current = value;
      footerInputs.forEach((otherInput:any) => {
        if (otherInput !== e.target) {
          otherInput.value = value;
          footerRef.current = value;
        }
      });
    });
  });


      }
      }
    })

    // You can handle more logic here, like updating state, etc.
  };

  // Attach listener
  document.addEventListener('InputDoubleClicked', handleInputDoubleClicked);

  // Cleanup on unmount
  return () => {
    document.removeEventListener('InputDoubleClicked', handleInputDoubleClicked);
  };
}, []);

  return (
    <>
    <button style={{position:'fixed',right: 0, top:'100px'}} onClick={()=> PasteRef.current = false}>aloo</button>
    <button style={{position:'fixed',right: 0, top:'200px'}} onClick={headerSave}>headerSave</button>
    <button style={{position:'fixed',right: 0, top:'300px'}} onClick={footerSave}>footerSave</button>
    <button style={{position:'fixed',right: 0, top:'400px'}} onClick={(e)=>handleKeyDown(e)}>editHeader</button>

    </>
  );
}
