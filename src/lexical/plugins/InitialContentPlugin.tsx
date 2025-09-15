import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useRef } from "react";
import { addTableCaptions, htmlWithoutSpaces, transformHeadings } from "../utils/editorstateHelper";
import { $generateNodesFromDOM } from "@lexical/html";
import { $isHeadingNode } from "@lexical/rich-text";
import { $createParagraphNode, $getRoot, $insertNodes } from "lexical";
import { $createLayoutContainerNode } from "../nodes/LayoutContainerNode";

export function InitialContentPlugin({ enableCaptions, setEditorEditable, htmlString, isEditable, setIsexistingIdPresent } : any) {
  const [editor] = useLexicalComposerContext();
  const preservedIdMap = useRef({});

//   function splitHtmlIntoParts(htmlString:any, partsCount:any) {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlString, 'text/html');

//   const bodyChildren = Array.from(doc.body.childNodes);
//   const totalNodes = bodyChildren.length;
//   const chunkSize = Math.ceil(totalNodes / partsCount);

//   const parts = [];

//   for (let i = 0; i < totalNodes; i += chunkSize) {
//     const fragment = document.createDocumentFragment();

//     // Clone the range of nodes for this chunk
//     bodyChildren.slice(i, i + chunkSize).forEach(node => {
//       fragment.appendChild(node.cloneNode(true));
//     });

//     // Wrap the fragment in a body tag
//     const wrapperDoc = document.implementation.createHTMLDocument('');
//     wrapperDoc.body.appendChild(fragment);

//     // Serialize back to string
//     parts.push(wrapperDoc.body.innerHTML);
//   }

//   return parts;
// }


  useEffect(() => {
    editor.update(() => {
      const parser = new DOMParser();
      const htmlNoSpace = htmlWithoutSpaces(htmlString);
      const addCaptionHtml = addTableCaptions(htmlNoSpace)
      let pureHeadingHtml = transformHeadings(enableCaptions ? addCaptionHtml : htmlNoSpace);
      // let parts = splitHtmlIntoParts(pureHeadingHtml, 3);
      const dom = parser.parseFromString(pureHeadingHtml, 'text/html');
      dom.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
        const existingId = heading.getAttribute('id');
        if (existingId) {
          heading.setAttribute('data-preserved-id', existingId);
        }
      });
      const nodes = $generateNodesFromDOM(editor, dom);
      nodes.forEach((node) => {
        if ($isHeadingNode(node)) {
          const element = editor.getElementByKey(node.getKey());
          if (element) {
            const preservedId = element.getAttribute('data-preserved-id');
            // if (preservedId) {
            //   const customHeading = CustomHeadingNode.create(node.getHeadingLevel(), preservedId);
            //   node.replace(customHeading);
            // }
          }
        }
      });

      const root = $getRoot();
      root.clear();
      const paraNode = $createParagraphNode()
      $insertNodes(nodes);
      // $insertNodes([paraNode])
      editor.setEditable(false)
      setTimeout(() => {
        editor.setEditable(isEditable)
        setEditorEditable(true)
      }, 5000)
    });
  }, [editor, htmlString]);
  return null;
}