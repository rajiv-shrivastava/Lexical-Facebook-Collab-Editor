// PersistPlugin.tsx

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isTableNode } from "../nodes/CustomTableNode/src";
import { $getRoot, $insertNodes } from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { useEffect } from "react";

export default function PersistPlugin() {
  const [editor] = useLexicalComposerContext();

  // Restore from localStorage
  useEffect(() => {
    const savedHtml = localStorage.getItem("editor-html");
    if (savedHtml) {
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(savedHtml, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);
        $insertNodes(nodes);
      });
    }
  }, [editor]);

  // On every change, persist to localStorage
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const root : any = $getRoot();

     // ⏭ Persist table IDs
     root.getChildren().forEach((node : any) => {
       if ($isTableNode(node)) {
         const dom = editor.getElementByKey(node.getKey());
         if (dom && !dom.hasAttribute("data-preserved-id")) {
           dom.setAttribute("data-preserved-id", node.getKey());
         }
       }
     });

        const htmlString = $generateHtmlFromNodes(editor, root);
        localStorage.setItem("editor-html", htmlString);
      });
    });
  }, [editor]);

  return null;
}
