import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createPoint, $createRangeSelection, $createTextNode, $getRoot, $getSelection, $insertNodes, $isRangeSelection, $isTextNode, $setSelection } from "lexical";
// import { $createDivNode, $isDivNode, getSelectedDivNode, setDefaultHeader } from "../nodes/DivNode/DivNode";
import { $generateNodesFromDOM } from "@lexical/html";
import { $createLayoutItemNode, $isLayoutItemNode, getSelectedPage } from "../nodes/LayoutItemNode";
// import { $createSimpleInputNode } from "../nodes/Header-Footer/HeaderNode";

export function moveCursorToNextDivNode(editor:any) {
editor.update(() => {
    const selection = $getSelection();
  if (!$isRangeSelection(selection)) return;

  let currentNode :any= selection.anchor.getNode();

  // Traverse up to find the current DivNode
  while (currentNode && !$isLayoutItemNode(currentNode)) {
    currentNode = currentNode.getParent();
  }

  if (!currentNode) return;

  const nextSibling = currentNode.getNextSibling();
  if (nextSibling && $isLayoutItemNode(nextSibling)) {
    // Find first child inside next div node to place cursor in
    const firstChild = nextSibling.getFirstDescendant();
    if (firstChild && $isTextNode(firstChild)) {
      const point = $createPoint(firstChild.getKey(), 0, "text");
      const newSelection = $createRangeSelection();
      newSelection.anchor = point;
      newSelection.focus = point;
      $setSelection(newSelection);
    } else {
      // If no text content, place cursor at the start of the div node
      nextSibling.selectStart();
    }
  }
})
}

export default function InsertDivPlugin() {
  const [editor] = useLexicalComposerContext();

  const insertDiv = () => {
    editor.update(() => {
      // setDefaultHeader('yo yo ')
      const divNode = $createLayoutItemNode();

      // Example: add one paragraph child initially
      const p = $createParagraphNode().append($createTextNode("Inside new DivNode"));
      divNode.append(p);

      const root = $getRoot();
        if(root){
            root.append(divNode);
        }
    });
  };

  const Landscape = ()=>{
    editor.update(()=>{
      const htmlString = `<div class="custom-div" style="border: 1px solid rgb(170, 170, 170); margin: 10px 0px 10px 8.5%; box-shadow: rgb(238, 238, 238) 0px -10px 0px 0px, rgb(238, 238, 238) 0px 10px 0px 0px; padding: 96px; min-height: 1000px; max-width: 816px;"><input type="text" class="Header-Input" id="header"><input type="text" class="Footer-Input" id="footer"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">text inside page</span></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></div>`
      const dom = new DOMParser()
      const parser = dom.parseFromString(htmlString, 'text/html');
      const nodes = $generateNodesFromDOM(editor, parser);
      // $insertNodes(nodes)

      const selection = $getSelection();
      if($isRangeSelection(selection)){
        console.log('dfghfdgfdg',selection)
        const divNode = getSelectedPage()
        if(divNode){
          divNode.setClassName('custom-landscape')
        }
      }
    })
  }

  const removeLandscape = () =>{
    editor.update(()=>{
      const divNode = getSelectedPage()
      if(divNode){
        divNode.removeClassName('custom-landscape')
      }
    })
  }

  const insertHeader = () =>{
    editor.update(()=>{
      const selection = $getSelection();
      if($isRangeSelection(selection)){
        // const head = $createSimpleInputNode('')
        // $insertNodes([head])
      }
    })
  }

  const abs = (editor:any)=>{
    editor.update(()=>{
      const node = getSelectedPage()
      setTimeout(()=>{
        editor.update(()=>{
                console.log('dfhsdkhf',node)
      if(node){
        node.remove()
      }
        })
      },500)

    })
  }

  return (
<>
    {/* <button onClick={()=>{moveCursorToNextDivNode(editor)}}>moveCursorToNextDivNode</button> */}
    {/* <button style={{position:'fixed'}} onClick={()=>abs(editor)}>delete</button> */}
    {/* <button  onClick={abs}>delete</button> */}
</>
  );
}
