// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import { useEffect } from 'react';
// import {
//   $getSelection,
//   $isRangeSelection,
//   SELECTION_CHANGE_COMMAND,
//   COMMAND_PRIORITY_LOW,
//   $isParagraphNode,
//   $createParagraphNode,
//   $insertNodes,
//   $createTextNode,
// } from 'lexical';
// import $ from 'jquery';
// import { $generateNodesFromDOM } from "@lexical/html";
// import { $isTableNode } from '../nodes/CustomTableNode/src';


// interface CustomPaginationProps {
//   showPagination?: boolean;
//   id: any;
//   showHeaderFooter: boolean;
//   landscape: boolean;
// }

// export function CustomPagination({showPagination, id, showHeaderFooter, landscape }: CustomPaginationProps) {
//   const [editor] = useLexicalComposerContext();
//     let pageBlock:any
//     let PageBreak= false
// function debounce(fn: () => void, delay: number) {
//   let timer: ReturnType<typeof setTimeout>;
//   return () => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       requestIdleCallback(fn);  // Defer layout-intensive logic
//     }, delay);
//   };
// }

//   useEffect(() => {
//     const selector = id;
//     const editable: any = document.querySelector(`.content-editable-grid-${selector}`);
//     const blockHeight = 1124;
//     const colors = [''];
//     let paragraphNumbers: any;
//     let paragraphHeight: any;

//     if (!editable) return;

//     const removeHighlightCommand = editor.registerCommand(
//       SELECTION_CHANGE_COMMAND,
//       () => {
//         editor.update(() => {
//           const all = document.querySelectorAll('.lexical-highlight');
//           all.forEach((el) => el.classList.remove('lexical-highlight'));

//           const headerInput: any = document.querySelector('.header-input');
//           const footerInput: any = document.querySelector('.footer-input');
//           const blockElem: any = document.querySelectorAll('.block-end');

//           if (showHeaderFooter) {
//             // blockElem.forEach((block: any) => {
//             //   block.setAttribute('data-footer', `${footerInput?.value || 'Type a Footer'}`);
//             //   const next = block.nextElementSibling;
//             //   next?.classList.add('header-js');
//             //   if (next) {
//             //     next.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`);
//             //   }
//             // });
//             addHeaderFooter()
//           }

//           const selection = $getSelection();
//                     if ($isRangeSelection(selection)) {
//             selection.getNodes().forEach((node) => {
//               const dom = editor.getElementByKey(node.getKey());
//               if (!dom) return
//               const pageNumber = dom.getAttribute('data-block-index') ? dom.getAttribute('data-block-index') : (dom as HTMLElement | any).parentElement.getAttribute('data-block-index')
//               pageBlock = pageNumber
//             })
//           }

//           if (
//             !$isRangeSelection(selection) ||
//             selection.isCollapsed() ||
//             selection.getTextContent().length === 0
//           ) {
//             return;
//           }

//           const selectedNodes = selection.getNodes();
//           selectedNodes.forEach((node) => {
//             if ($isParagraphNode(node) && node.getChildren().length === 0) {
//               const dom = editor.getElementByKey(node.getKey());
//               if (dom) {
//                 dom.classList.add('lexical-highlight');
//               }
//             }
//           });
//         });
//         return false;
//       },
//       COMMAND_PRIORITY_LOW
//     );
// let insertCount = 0;
//     function assignBackgroundsAndGaps() {
//       const previousScrollTop = editable.scrollTop;
//       const children = Array.from(editable.children);
//       if (children.length === 0) return;
//       console.log('xngfdgdfgdfg',children)
//       children.forEach((child: any) => {
//         child.classList.remove('block-end');
//         child.style.minHeight = '0px';
//       });

//       children.forEach((child: any) => {
//         if (child && child.tagName.toLowerCase() !== 'figure') {
//           child.classList.add('padding-elem');
//         }
//       });

//       const blocks = new Map();
//       let cumulativeHeight = 0;

//       children.forEach((child: any) => {
//         const isPageBreak = child.tagName.toLowerCase() === 'figure' && child.getAttribute('type') === 'page-break';
//         const childHeight = child.offsetHeight;
//         paragraphHeight = childHeight;

//         // if (isPageBreak) {
//         //   // cumulativeHeight = Math.ceil(cumulativeHeight / blockHeight) * blockHeight;
//         //   cumulativeHeight = (Math.floor(5000 / blockHeight) + 1) * blockHeight;
//         // }

//         if (isPageBreak) {
//   // Artificially add a block height to force a new page start
//   cumulativeHeight += blockHeight;
// }

//         console.log('sdjkhfjdshfksdf',cumulativeHeight)

//         const blockIndex = Math.floor(cumulativeHeight / blockHeight);
//         const color = colors[blockIndex % colors.length];
//         child.style.backgroundColor = color;
//                 child.dataset.blockIndex = blockIndex+1;
//         if (child.tagName.toLowerCase() === 'table') {
//           const blockIndex = child.getAttribute('data-block-index');
//           const tdElements = child.querySelectorAll('td');

//           tdElements.forEach((td:any) => {
//             td.setAttribute('data-block-index', blockIndex);
//             const childElements = td.querySelectorAll('*');
//             childElements.forEach((elem:any) => {
//               elem.setAttribute('data-block-index', Number(blockIndex));
//             });
//           });
//         } 

//           if (child.children && child.children.length > 0) {
//     Array.from(child.children).forEach((grandChild: any) => {
//       grandChild.setAttribute('data-block-index', blockIndex + 1);
//       grandChild.style.backgroundColor = color;
//       if(grandChild.children.length > 0 && grandChild.children[0].hasAttribute('draggable')){
//       grandChild.children[0].children[0].children[0].setAttribute('data-block-index', blockIndex + 1)
        
//       }
//     });
//   }

//   // page layout code do not remove this

//   if(landscape){
//               if(child.previousElementSibling && landscape){
//                               if( child.previousElementSibling.getAttribute('data-landscape') === 'true' && child.getAttribute('data-block-index') === child.previousElementSibling.getAttribute('data-block-index')){
                                
//           child.setAttribute('data-landscape', 'true');
//         } 
//                                       if( child.previousElementSibling.getAttribute('data-landscape') === 'false' && child.getAttribute('data-block-index') === child.previousElementSibling.getAttribute('data-block-index')){
                                
//           child.setAttribute('data-landscape', 'false');
//         } 
//           }

//           if(child.previousElementSibling && landscape && child.tagName.toLowerCase() === 'figure'){
//             child.setAttribute('data-landscape', `${child.previousElementSibling.getAttribute('data-landscape')}`);
//           }
//           if(child.tagName.toLowerCase() === 'figure' && child.getAttribute('data-landscape') === 'true'){
//             child.classList.add('header-js-landscape');
//           }
//            if(child.tagName.toLowerCase() === 'figure' && child.getAttribute('data-landscape') === 'false'){

//             child.classList.remove('header-js-landscape');
//             child.classList.add('header-js-potrait');
//           }



//         if (!child.getAttribute('data-landscape') === true && landscape) {
//           child.setAttribute('data-landscape', 'false');
//         } 
//          if (!child.getAttribute('data-landscape') === true && child.tagName.toLowerCase() === 'table' && landscape) {
//           child.setAttribute('data-landscape', 'false');
//         } 

//           if(child.hasAttribute('data-landscape') && child.getAttribute('data-landscape') === 'false' && child.tagName.toLowerCase() !== 'table' && landscape){
//             child.classList.add('potrait')
//           }
//           if(child.hasAttribute('data-landscape') && child.getAttribute('data-landscape') === 'false' && child.tagName.toLowerCase() === 'table' && landscape){
//             child.classList.add('potrait-tables')
//           }
//       //       if(children.length > 2 && child.previousElementSibling?.getAttribute('data-block-index') !== child.getAttribute('data-block-index') && child.previousElementSibling?.getAttribute('data-block-index') !== undefined && child.getAttribute('data-landscape') === 'true'){
//       //       //   // if(child.getAttribute('data-block-index') )
//       //       //   let count = 0;
//       //       //   if(count <= 2){
//       //       //     console.log('sjhdskhf',child.previousElementSibling?.getAttribute('data-block-index'), child.getAttribute('data-block-index'))
//       //       //     insertManualPageBreak()
//       //       //     count = count+1
//       //       //   }
//       //  if (insertCount < 2) {
//       //   console.log('Inserting page break...', child.previousElementSibling?.getAttribute('data-block-index'), child.getAttribute('data-block-index'));
//       //   insertManualPageBreak();
//       //   insertCount++;
//       // }
//       //       }
//   }

//   if(landscape === false){
//               if(child.tagName.toLowerCase() === 'figure'){
//             child.classList.add('header-js-Figure');
//           }
//   }

//     // page layout code do not remove this


//         if (!blocks.has(blockIndex)) {
//           blocks.set(blockIndex, []);
//         }

//         blocks.get(blockIndex).push(child);
//         cumulativeHeight += childHeight;
//       });

//       blocks.forEach((divs) => {
//         const totalHeight = divs.reduce((sum: any, div: any) => sum + div.offsetHeight, 0);
//         let deficit = blockHeight - totalHeight;
//         paragraphNumbers = deficit / paragraphHeight + 3;
//         const lastDiv = divs[divs.length - 1];
//         const firstDiv = divs[0];
//         console.log('totalHeight',divs)
//         if (lastDiv) {
//           if (lastDiv.tagName.toLowerCase() !== 'figure') {
//             lastDiv.classList.add('block-end', 'padding-elem');
//           }
//           if (lastDiv.tagName.toLowerCase() === 'h6') {
//             lastDiv.classList.remove('block-end');
//             lastDiv.nextElementSibling?.classList.add('block-end');
//           }
//           if (deficit > 0) {
//             lastDiv.style.minHeight = (lastDiv.offsetHeight + deficit) + 'px';
//           }

//           // After finishing a page block
// //           if (lastDiv && deficit <= 0) {  // means page is full
// //             const nextPageFirstBlock = lastDiv.nextElementSibling;
            
// //             if (nextPageFirstBlock && nextPageFirstBlock.getAttribute('data-landscape') === 'true') {
// //     console.log("Page full and next page is landscape → inserting new page",deficit);

// //     insertManualPageBreak();

// //     // Recalculate layout so new page gets indexed correctly
// //     setTimeout(() => assignBackgroundsAndGaps(), 100);
// //   }
// // }

//         }

//         if (firstDiv && !firstDiv.hasAttribute('data-footer-inserted') && !firstDiv.classList.contains('header-js') && showHeaderFooter) {
//           firstDiv.setAttribute('data-footer-inserted', 'true');
//           const headerInput: any = document.querySelector('.header-input');
//           const footerInput: any = document.querySelector('.footer-input');
//           firstDiv.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`);
//           firstDiv.setAttribute('data-footer', `${footerInput?.value}`);
//         }
//       });

//       const contentMatches = document.querySelectorAll(".block-end, figure[type='page-break']");
//       const total = contentMatches.length;
//       contentMatches.forEach((el, index) => {
//         el.setAttribute('data-index', String(index + 1));
//         el.setAttribute('data-total', String(total));
//       });
// if (Math.abs(editable.scrollHeight - (editable.scrollTop + editable.clientHeight)) > 10) {
//   editable.scrollTop = previousScrollTop;
// }

//     }

//     function insertManualPageBreak() {
//       editor.update(() => {
//         const dom = document.createElement('figure');
//         dom.setAttribute('type', 'page-break');
//         dom.innerHTML = '<br>';
//         const parsed = new DOMParser().parseFromString(dom.outerHTML, 'text/html');
//         const nodes = $generateNodesFromDOM(editor, parsed);
//         $insertNodes(nodes);
//       });

//       setTimeout(() => assignBackgroundsAndGaps(), 500);
//     }

//     function addHeaderFooter() {
//       const headerInput: any = document.querySelector('.header-input');
//       const footerInput: any = document.querySelector('.footer-input');
//       const blockElem: any = document.querySelectorAll('.block-end');
//       blockElem.forEach((block: any) => {
//         block.setAttribute('data-footer', `${footerInput?.value || 'Type a Footer'}`);
//         const next = block.nextElementSibling;
//         next?.classList.add('header-js');

//         if(block.getAttribute('data-block-index') === '1'){
//           editable.firstElementChild.classList.add('header-js')
//           editable.firstElementChild.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`)
//         }

//         if(next && next !== null){
//           if(next.tagName.toLowerCase() === 'h6'){
//             next?.classList.remove('header-js');
//             next.nextElementSibling.classList.add('header-js');
//           }
//         }
//         if (next) {
//           next.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`);

//                   if(next && next !== null){
//           if(next.tagName.toLowerCase() === 'h6'){
//             next?.removeAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`)
//             next.nextElementSibling.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`);
//           }
//         }
//         }
//       });

//               const elements = document.querySelectorAll('[data-block-index].header-js');
//   const seen: Record<string, boolean> = {};

//   elements.forEach(el => {
//     const index = el.getAttribute('data-block-index');
    
//     if (index !== null) {
//       if (!seen[index]) {
//         seen[index] = true;
//       } else {
//         el.classList.remove('header-js');
//       }
//     }
//   });
//     }

//     const addPageBtn = document.querySelector(".addPage");
//     if (addPageBtn) {
//       addPageBtn.addEventListener("click", insertManualPageBreak);
//     }

//     document.addEventListener('keydown', (e: KeyboardEvent) => {
//       if (e.ctrlKey && e.key === 'Enter') {
//         e.preventDefault();
//         insertManualPageBreak();
//       }
//     });

// const debouncedAssign = debounce(assignBackgroundsAndGaps, 250);
// document.addEventListener('paste', debouncedAssign);
// // editable.addEventListener('input', debouncedAssign);


//     // editable.addEventListener('input', assignBackgroundsAndGaps);
//     const observer = new ResizeObserver(assignBackgroundsAndGaps);
//     observer.observe(editable);

//     setTimeout(() => {
//       assignBackgroundsAndGaps();
//       if(showHeaderFooter) addHeaderFooter();
//     }, 0);

//         setTimeout(() => {
//       if(showHeaderFooter) addHeaderFooter();
//       console.log('function called')
//     }, 3000);

//     return () => {
//       removeHighlightCommand();
//       observer.disconnect();
//       document.removeEventListener('paste', debouncedAssign);
//     };
//   }, []);

//   const setPageBreak = ()=>{
//     PageBreak = true
//   }

//   return (
//     <>
//       <button style={{display:'none'}} className="addPage">Insert Page Break</button>
//       <button onClick={setPageBreak}>setPageBreak</button>
//     </>
//   );
// }



import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $isParagraphNode,
  $createParagraphNode,
  $insertNodes,
  $createTextNode,
} from 'lexical';
import $ from 'jquery';
import { $generateNodesFromDOM } from "@lexical/html";
import { $isTableNode } from '../nodes/CustomTableNode/src';


interface CustomPaginationProps {
  showPagination?: boolean;
  id: any;
  showHeaderFooter: boolean;
  landscape: boolean;
}

export function CustomPagination({showPagination, id, showHeaderFooter, landscape }: CustomPaginationProps) {
  const [editor] = useLexicalComposerContext();
    let pageBlock:any
function debounce(fn: () => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      requestIdleCallback(fn);  // Defer layout-intensive logic
    }, delay);
  };
}

  useEffect(() => {
    const selector = id;
    const editable: any = document.querySelector(`.content-editable-grid-${selector}`);
    const blockHeight = 1124;
    const colors = [''];
    let paragraphNumbers: any;
    let paragraphHeight: any;

    if (!editable) return;

    const removeHighlightCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.update(() => {
          const all = document.querySelectorAll('.lexical-highlight');
          all.forEach((el) => el.classList.remove('lexical-highlight'));

          const headerInput: any = document.querySelector('.header-input');
          const footerInput: any = document.querySelector('.footer-input');
          const blockElem: any = document.querySelectorAll('.block-end');

          if (showHeaderFooter) {
            // blockElem.forEach((block: any) => {
            //   block.setAttribute('data-footer', `${footerInput?.value || 'Type a Footer'}`);
            //   const next = block.nextElementSibling;
            //   next?.classList.add('header-js');
            //   if (next) {
            //     next.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`);
            //   }
            // });
            addHeaderFooter()
          }

          const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
            selection.getNodes().forEach((node) => {
              const dom = editor.getElementByKey(node.getKey());
              if (!dom) return
              const pageNumber = dom.getAttribute('data-block-index') ? dom.getAttribute('data-block-index') : (dom as HTMLElement | any).parentElement.getAttribute('data-block-index')
              pageBlock = pageNumber
            })
          }

          if (
            !$isRangeSelection(selection) ||
            selection.isCollapsed() ||
            selection.getTextContent().length === 0
          ) {
            return;
          }

          const selectedNodes = selection.getNodes();
          selectedNodes.forEach((node) => {
            if ($isParagraphNode(node) && node.getChildren().length === 0) {
              const dom = editor.getElementByKey(node.getKey());
              if (dom) {
                dom.classList.add('lexical-highlight');
              }
            }
          });
        });
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    function assignBackgroundsAndGaps() {
      const previousScrollTop = editable.scrollTop;
      const children = Array.from(editable.children);
      if (children.length === 0) return;

      children.forEach((child: any) => {
        child.classList.remove('block-end');
        child.style.minHeight = '0px';
      });

      children.forEach((child: any) => {
        if (child && child.tagName.toLowerCase() !== 'figure') {
          child.classList.add('padding-elem');
        }
      });

      const blocks = new Map();
      let cumulativeHeight = 0;

      children.forEach((child: any) => {
        const isPageBreak = child.tagName.toLowerCase() === 'figure' && child.getAttribute('type') === 'page-break';
        const childHeight = child.offsetHeight;
        paragraphHeight = childHeight;

        // if (isPageBreak) {
        //   cumulativeHeight = Math.ceil(cumulativeHeight / blockHeight) * blockHeight;
        // }

        if (isPageBreak) {
  // Force a new page by simulating the full height of the current page
  cumulativeHeight = Math.ceil(cumulativeHeight / blockHeight) * blockHeight + 1;
}


        const blockIndex = Math.floor(cumulativeHeight / blockHeight)+1;
        const color = colors[blockIndex % colors.length];
        child.style.backgroundColor = color;
                child.dataset.blockIndex = blockIndex;
        if (child.tagName.toLowerCase() === 'table') {
          const blockIndex = child.getAttribute('data-block-index');
          const tdElements = child.querySelectorAll('td');

          tdElements.forEach((td:any) => {
            td.setAttribute('data-block-index', blockIndex);
            const childElements = td.querySelectorAll('*');
            childElements.forEach((elem:any) => {
              elem.setAttribute('data-block-index', Number(blockIndex));
            });
          });
        } 

          if (child.children && child.children.length > 0) {
    Array.from(child.children).forEach((grandChild: any) => {
      grandChild.setAttribute('data-block-index', blockIndex);
      grandChild.style.backgroundColor = color;
      if(grandChild.children.length > 0 && grandChild.children[0].hasAttribute('draggable')){
      grandChild.children[0].children[0].children[0].setAttribute('data-block-index', blockIndex)
        
      }
    });
  }

  // page layout code do not remove this

  if(landscape){
              if(child.previousElementSibling && landscape){
                              if( child.previousElementSibling.getAttribute('data-landscape') === 'true' && child.getAttribute('data-block-index') === child.previousElementSibling.getAttribute('data-block-index')){
                                
          child.setAttribute('data-landscape', 'true');
        } 
                                      if( child.previousElementSibling.getAttribute('data-landscape') === 'false' && child.getAttribute('data-block-index') === child.previousElementSibling.getAttribute('data-block-index')){
                                
          child.setAttribute('data-landscape', 'false');
        } 
          }

          if(child.previousElementSibling && landscape && child.tagName.toLowerCase() === 'figure'){
            child.setAttribute('data-landscape', `${child.previousElementSibling.getAttribute('data-landscape')}`);
          }
          if(child.tagName.toLowerCase() === 'figure' && child.getAttribute('data-landscape') === 'true'){
            child.classList.add('header-js-landscape');
          }
           if(child.tagName.toLowerCase() === 'figure' && child.getAttribute('data-landscape') === 'false'){

            child.classList.remove('header-js-landscape');
            child.classList.add('header-js-potrait');
          }



        if (!child.getAttribute('data-landscape') === true && landscape) {
          child.setAttribute('data-landscape', 'false');
        } 
         if (!child.getAttribute('data-landscape') === true && child.tagName.toLowerCase() === 'table' && landscape) {
          child.setAttribute('data-landscape', 'false');
        } 

          if(child.hasAttribute('data-landscape') && child.getAttribute('data-landscape') === 'false' && child.tagName.toLowerCase() !== 'table' && landscape){
            child.classList.add('potrait')
          }
          if(child.hasAttribute('data-landscape') && child.getAttribute('data-landscape') === 'false' && child.tagName.toLowerCase() === 'table' && landscape){
            child.classList.add('potrait-tables')
          }
  }

  if(landscape === false){
              if(child.tagName.toLowerCase() === 'figure'){
            child.classList.add('header-js-Figure');
          }
  }

    // page layout code do not remove this


        if (!blocks.has(blockIndex)) {
          blocks.set(blockIndex, []);
        }

        blocks.get(blockIndex).push(child);
        cumulativeHeight += childHeight;
      });

      blocks.forEach((divs) => {
        const totalHeight = divs.reduce((sum: any, div: any) => sum + div.offsetHeight, 0);
        const deficit = blockHeight - totalHeight;
        paragraphNumbers = deficit / paragraphHeight + 3;
        const lastDiv = divs[divs.length - 1];
        const firstDiv = divs[0];

        if (lastDiv) {
          if (lastDiv.tagName.toLowerCase() !== 'figure') {
            lastDiv.classList.add('block-end', 'padding-elem');
          }
          if (lastDiv.tagName.toLowerCase() === 'h6') {
            lastDiv.classList.remove('block-end');
            lastDiv.nextElementSibling?.classList.add('block-end');
          }
          if (deficit > 0) {
            lastDiv.style.minHeight = (lastDiv.offsetHeight + deficit) + 'px';
          }
        }

        if (firstDiv && !firstDiv.hasAttribute('data-footer-inserted') && !firstDiv.classList.contains('header-js') && showHeaderFooter) {
          firstDiv.setAttribute('data-footer-inserted', 'true');
          const headerInput: any = document.querySelector('.header-input');
          const footerInput: any = document.querySelector('.footer-input');
          firstDiv.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`);
          firstDiv.setAttribute('data-footer', `${footerInput?.value}`);
        }
      });

      const inputElement: any = document.querySelector('.footer-input');
      const firstBlock = blocks.get(0);
      if (firstBlock && firstBlock.length > 0) {
        const lastDiv = firstBlock[firstBlock.length - 1];
        const lastDivTop = lastDiv.offsetTop;
        const lastDivHeight = lastDiv.offsetHeight;

        const offsetBeforeBorder = 25 + inputElement?.offsetHeight - 2;
        if (inputElement) {
          inputElement.style.top = (editable.offsetTop + lastDivTop + lastDivHeight - offsetBeforeBorder) + 'px';
        }
      }

      const contentMatches = document.querySelectorAll(".block-end, figure[type='page-break']");
      const total = contentMatches.length;
      contentMatches.forEach((el, index) => {
        el.setAttribute('data-index', String(index + 1));
        el.setAttribute('data-total', String(total));
      });
if (Math.abs(editable.scrollHeight - (editable.scrollTop + editable.clientHeight)) > 10) {
  editable.scrollTop = previousScrollTop;
}

    }

    function insertManualPageBreak() {
      editor.update(() => {
        const dom = document.createElement('figure');
        dom.setAttribute('type', 'page-break');
        dom.innerHTML = '<br>';
        const parsed = new DOMParser().parseFromString(dom.outerHTML, 'text/html');
        const nodes = $generateNodesFromDOM(editor, parsed);
        $insertNodes(nodes);
      });

      setTimeout(() => assignBackgroundsAndGaps(), 500);
    }

    function addHeaderFooter() {
      const headerInput: any = document.querySelector('.header-input');
      const footerInput: any = document.querySelector('.footer-input');
      const blockElem: any = document.querySelectorAll('.block-end');
      blockElem.forEach((block: any) => {
        block.setAttribute('data-footer', `${footerInput?.value || 'Type a Footer'}`);
        const next = block.nextElementSibling;
        next?.classList.add('header-js');

        if(block.getAttribute('data-block-index') === '1'){
          editable.firstElementChild.classList.add('header-js')
          editable.firstElementChild.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`)
        }

        if(next && next !== null){
          if(next.tagName.toLowerCase() === 'h6'){
            next?.classList.remove('header-js');
            next.nextElementSibling.classList.add('header-js');
          }
        }
        if (next) {
          next.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`);

                  if(next && next !== null){
          if(next.tagName.toLowerCase() === 'h6'){
            next?.removeAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`)
            next.nextElementSibling.setAttribute('data-header', `${headerInput ? headerInput.value : 'Type a Header'}`);
          }
        }
        }
      });

              const elements = document.querySelectorAll('[data-block-index].header-js');
  const seen: Record<string, boolean> = {};

  elements.forEach(el => {
    const index = el.getAttribute('data-block-index');
    
    if (index !== null) {
      if (!seen[index]) {
        seen[index] = true;
      } else {
        el.classList.remove('header-js');
      }
    }
  });
    }

    const addPageBtn = document.querySelector(".addPage");
    if (addPageBtn) {
      addPageBtn.addEventListener("click", insertManualPageBreak);
    }

    // document.addEventListener('keydown', (e: KeyboardEvent) => {
    //   if (e.ctrlKey && e.key === 'Enter') {
    //     e.preventDefault();
    //     insertManualPageBreak();
    //   }
    // });

const debouncedAssign = debounce(assignBackgroundsAndGaps, 250);
document.addEventListener('paste', debouncedAssign);
// editable.addEventListener('input', debouncedAssign);


    // editable.addEventListener('input', assignBackgroundsAndGaps);
    const observer = new ResizeObserver(assignBackgroundsAndGaps);
    observer.observe(editable);

    // setTimeout(() => {
    //   assignBackgroundsAndGaps();
    //   if(showHeaderFooter) addHeaderFooter();
    // }, 0);

        setTimeout(() => {
      if(showHeaderFooter) addHeaderFooter();
      console.log('function called')
    }, 3000);

    return () => {
      removeHighlightCommand();
      observer.disconnect();
      document.removeEventListener('paste', debouncedAssign);
    };
  }, []);

  return (
    <>
      <button style={{display:'none'}} className="addPage">Insert Page Break</button>
    </>
  );
}