import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';
// import {getNextPageBreakNumber, resetPageBreakCounter} from './PageBreakCounter';
import { $getRoot, $getSelection, $isRangeSelection} from 'lexical';
import { $createPageBreakNode, $isPageBreakNode } from '../../nodes/PageBreakNode';
import { getNextPageBreakNumber } from './PageBreakCounter';

export default function PageBreakPlugin(editor:any) {
  let count :any = 1
  const insertPageBreak = () => {
    editor.update(() => {
      const root = $getRoot();
      root.getChildren().forEach(()=>{
        
        const root = $getRoot();
           const existing = root.getChildren()
             .filter(node =>{
              if($isPageBreakNode(node)){
                count = node.__pageNumber
              }
             })
            })
            const pageNumber = getNextPageBreakNumber(count);
      const node = $createPageBreakNode();
      const selection = $getSelection();
      if (selection !== null && $isRangeSelection(selection)) {
        const parent = selection.anchor.getNode().getTopLevelElementOrThrow();
        parent.insertAfter(node);
        node.selectEnd();
      }
    });
  };

  insertPageBreak();
}
