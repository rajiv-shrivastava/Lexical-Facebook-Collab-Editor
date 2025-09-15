import React, { useEffect, useRef, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
  ParagraphNode,
} from 'lexical';

import {
  $findCellNode,
  $findTableNode,
  $isTableNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '../nodes/CustomTableNode/src'; // adjust your import paths here
import { $generateNodesFromDOM } from '@lexical/html';
import { ImageNode } from '../nodes/ImageNode';

export function TableCellCharacterCountPlugin() {
  const [editor] = useLexicalComposerContext();
  const [count, setCount] = useState(0);
  const insertionDoneRef = useRef(false);
  let content: any
  let containImage:boolean
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setCount(0);
          insertionDoneRef.current = false;
          return;
        }

        const anchorNode = selection.anchor.getNode();
        // const tableNode = $findTableNode(anchorNode)

        // const grpId = (tableNode as TableNode).__groupId

        const cell = $findCellNode(anchorNode);
        
        if(cell){
          const cellElem = editor.getElementByKey(cell?.getLatest().getKey())
          function containsImageTag(str:string) {
          return /<img\b[^>]*>/i.test(str);
         }

          if(cellElem){
            containImage = containsImageTag(cellElem?.innerHTML)
           if(containsImageTag(cellElem.innerHTML)){
             setCount(0);
             insertionDoneRef.current = false;
             return;
           }
          }
        }
        const cellChild = cell?.getChildren()
        cellChild?.forEach((child:any)=>{
          const cellNodes = child.getChildren()
          containImage = cellNodes.some((node:any) => node instanceof ImageNode) || false
        })
        if (!cell || containImage === true) {
          setCount(0);
          insertionDoneRef.current = false;
          return;
        }


        

        const text = cell.getTextContent();
        content = text
        setCount(text.length);

        if (text.length <= 250) {
          insertionDoneRef.current = false;
          return;
        }
        const lastChar = text.slice(240)
        function removeLastChar(str: string) {
          return str.slice(0, 240);
        }

        // Find current table node
        let node: any = cell;
        while (node && !$isTableNode(node)) {
          (node as TableCellNode) = node.getParent();
        }
        if (!node) return;
        const currentTable = node;

        // Get index of current cell inside its row
        const parentRow = cell.getParent() as TableRowNode;
        const siblings = parentRow.getChildren();
        const cellIndex = siblings.findIndex(s => s.getKey() === cell.getKey());

        editor.update(() => {
          // Check if next table exists after current
          const nextNode = currentTable.getNextSibling();
          if (nextNode && $isTableNode(nextNode)) {
            // Just move cursor to same cell in next table
            const nextTableRows = nextNode.getChildren();
            if (nextTableRows.length > 0) {
              const nextFirstRow = nextTableRows[0] as TableRowNode;
              const targetCell = nextFirstRow.getChildAtIndex(cellIndex);
              if (targetCell && $isElementNode(targetCell)) {
                const text = $createTextNode(lastChar)
                const cellParagraph: any = targetCell.getChildren()[0];
                (cellParagraph as ParagraphNode).append(text)
                targetCell.select();

                const updatedText = removeLastChar(content);

                cell.clear();
                const p = $createParagraphNode()
                p.append($createTextNode(updatedText))
                cell.append(p);
              }
            }
            return;
          }

          // Otherwise insert new table below current table
          const totalColumns = parentRow.getChildren().length;
          const emptyCells = Array(totalColumns).fill('<td></td>').join('');
          const newTableHTML = `<table data-table-caption='false' border="1"><tbody><tr>${emptyCells}</tr></tbody></table>`;

          const parser = new DOMParser();
          const dom = parser.parseFromString(newTableHTML, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          if (nodes.length === 0) return;

          const newTableNode = nodes[0];
          (newTableNode as any).__groupId = currentTable.__groupId
          currentTable.insertAfter(newTableNode);

          if ($isTableNode(newTableNode)) {
            const newTableRows = newTableNode.getChildren();
            if (newTableRows.length > 0) {
              const newFirstRow = newTableRows[0] as TableRowNode;
              const targetCell = newFirstRow.getChildAtIndex(cellIndex);
              if (targetCell && $isElementNode(targetCell)) {
                const text = $createTextNode(lastChar)
                const cellParagraph: any = targetCell.getChildren()[0];
                (cellParagraph as ParagraphNode).append(text)
                targetCell.select();

                const updatedText = removeLastChar(content);

                cell.clear();
                const p = $createParagraphNode()
                p.append($createTextNode(updatedText))
                cell.append(p);
              }
            }
          }
        });
      });
    });
  }, [editor]);

  return null;
}
