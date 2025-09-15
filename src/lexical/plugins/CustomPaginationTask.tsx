import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  $isParagraphNode,
  $createParagraphNode,
} from 'lexical';

export function CustomPaginationTask(id:any) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    const removeHighlightCommand = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        editor.update(() => {
          const all = document.querySelectorAll('.lexical-highlight');
          all.forEach((el) => el.classList.remove('lexical-highlight'));
          const headerInput :any= document.querySelector('.header-input') 
           const footerInput :any= document.querySelector('.footer-input')
           const blockElem  :any = document.querySelectorAll('.block-end')
            blockElem.forEach((block :any)=>{
            block.setAttribute('data-footer',`${footerInput ? footerInput?.value : ''}`)
            const next = block.nextElementSibling;
            next?.classList.add('header-js')
            if(next){next.setAttribute('data-header',`${headerInput ? headerInput.value : ''}`)}
            
            });

          const selection = $getSelection();
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
    const selector = id.id
    const editable: any = document.querySelector(`.content-editable-grid-${selector}`);
    const blockHeight = 300;
    const colors = [''];

    if (!editable) return;
    function assignBackgroundsAndGaps() {
      const children = Array.from(editable.children);
      if (children.length === 0) return;

      children.forEach((child: any) => {
        child.classList.remove('block-end');
        child.classList.remove('header-js')
        child.style.minHeight = '0px';
      });

      children.forEach((child: any) => {
        if(child && child.tagName.toLowerCase() !== 'figure'){
          child.classList.add('padding-elem');

        }
      })


      const blocks = new Map();
      let cumulativeHeight = 0;

      children.forEach((child: any) => {
        const childHeight = child.offsetHeight;
        const blockIndex = Math.floor(cumulativeHeight / blockHeight);
        const color = colors[blockIndex % colors.length];
        child.style.backgroundColor = color;

        if (!blocks.has(blockIndex)) {
          blocks.set(blockIndex, []);
        }
        blocks.get(blockIndex).push(child);
        cumulativeHeight += childHeight;        
      });

      blocks.forEach((divs) => {
        const totalHeight = divs.reduce((sum: any, div: any) => sum + div.offsetHeight, 0);
        const deficit = blockHeight - totalHeight;
        const lastDiv = divs[divs.length - 1];
        const firstDiv = divs[0];


        if (lastDiv) {
          lastDiv.classList.add('block-end');
          if(lastDiv && lastDiv.tagName.toLowerCase() !== 'figure'){
            lastDiv.classList.add('padding-elem')
          }
          if (deficit > 0) {
            lastDiv.style.minHeight = (lastDiv.offsetHeight + deficit) + 'px';

          }
        }

        // if( firstDiv && !firstDiv.hasAttribute('data-footer-inserted') &&   !firstDiv.classList.contains('header-js')){
        //       firstDiv.setAttribute('data-footer-inserted', 'true');
        //       const headerInput :any= document.querySelector('.header-input') 
        //       firstDiv.setAttribute('data-header',`${ headerInput ? headerInput.value : 'type a Header'}`)
        //       const footerInput :any= document.querySelector('.footer-input')
        //       firstDiv.setAttribute('data-header',`${headerInput ? headerInput.value : ''}`)
        //       firstDiv.setAttribute('data-footer',`${footerInput ? footerInput.value : ''}`) 
        // }
      });
      const inputElement :any = document.querySelector('.footer-input')


     const firstBlock = blocks.get(0);
      if (firstBlock && firstBlock.length > 0) {
        const lastDiv = firstBlock[firstBlock.length - 1];
        const lastDivTop = lastDiv.offsetTop;
        const lastDivHeight = lastDiv.offsetHeight;

        const bottomOfFirstBlock = lastDivTop + lastDivHeight;

const offsetBeforeBorder = 25 + (inputElement? inputElement.offsetHeight : 80) - 2;
inputElement ? inputElement .style.top = (editable.offsetTop + bottomOfFirstBlock - offsetBeforeBorder) + 'px':  '';
      }
    }

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Enter') {

//                 const el :any= document.querySelector('.block-end')
//         if( el && el.offsetHeight < 1015){
//         el.scrollIntoView({
//           behavior: 'smooth',
//           block: 'center',
//           inline: 'center'
//         });
//         window.scrollTo({
//   top: 0, // or any fixed position
//   behavior: 'auto'
// });
//       }
//         // }
//         const selection = window.getSelection();
//         if (!selection?.rangeCount) return;

//         const range = selection.getRangeAt(0);
//         const newDiv = document.createElement('div');
//         newDiv.innerHTML = '<br>';

//         let currentDiv = range.startContainer as HTMLElement;
//         while (currentDiv && currentDiv !== editable && currentDiv.nodeName !== 'DIV') {
//           currentDiv = currentDiv.parentNode as HTMLElement;
//         }

//         if (currentDiv && currentDiv !== editable) {
//           if (currentDiv.nextSibling) {
//             editable.insertBefore(newDiv, currentDiv.nextSibling);
//           } else {
//             editable.appendChild(newDiv);
//           }

//           const newRange = document.createRange();
//           newRange.setStart(newDiv, 0);
//           newRange.collapse(true);
//           selection.removeAllRanges();
//           selection.addRange(newRange);
//         } else {
//           editable.appendChild(newDiv);
//         }

//         assignBackgroundsAndGaps();
//       }
//     };

    // editable.addEventListener('keydown', handleKeyDown);
    editable.addEventListener('input', assignBackgroundsAndGaps);
    const observer = new MutationObserver(assignBackgroundsAndGaps);
    observer.observe(editable, { childList: true, subtree: true });

setTimeout(() => {
  assignBackgroundsAndGaps();
  addHeaderFooter()
}, 0);

const addHeaderFooter = ()=>{
                       const headerInput :any= document.querySelector('.header-input') 
           const footerInput :any= document.querySelector('.footer-input')
           const blockElem  :any = document.querySelectorAll('.block-end')
            blockElem.forEach((block :any)=>{
            block.setAttribute('data-footer',`${footerInput ? footerInput?.value : ''}`)
            const next = block.nextElementSibling;
            next?.classList.add('header-js')
            if(next){next.setAttribute('data-header',`${headerInput ? headerInput.value :''}`)}
            
            });
}


    document.addEventListener('paste', function () {

      setTimeout(()=>{
        addHeaderFooter()
      },100)

      const children = Array.from(editable.children);
      children.forEach((child: any) => {
        if(child && child.tagName.toLowerCase() !== 'figure'){
          child.classList.add('padding-elem');
        }
      })

      // const tableCells = document.querySelectorAll('td');
      // tableCells.forEach(cell => {
      //   cell.classList.add('pasted-tables');
      // });

      const contentMatches = document.querySelectorAll(".block-end");
      const pageBreaks = document.querySelectorAll('figure[type="page-break"]');
      const combined = Array.from(contentMatches).concat(Array.from(pageBreaks));
      if (combined.length === 0) return;
      const total = combined.length;
      combined.forEach((el, index) => {
        el.setAttribute('data-index', String(index + 1));
        el.setAttribute('data-total', String(total));
      });
    });

    return () => {
      removeHighlightCommand();
      // editable.removeEventListener('keydown', handleKeyDown);
      editable.removeEventListener('input', assignBackgroundsAndGaps);
      observer.disconnect();
    };
  }, [editor]);

  return null;
}
