import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, $getRoot, $isElementNode, $isParagraphNode, $isTextNode } from "lexical";
import { useEffect } from "react";
import { $isDividerTextNode } from "../../nodes/DividerTextNode";
import { integerToRoman } from ".";

export default function EndnoteMonitorPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;

    return editor.registerUpdateListener(({ editorState }) => {
      const paragraphsToRemove : any = [];

      editorState.read(() => {
        // Build set of active markers
        const activeMarkers = new Set();
        const romanNumeralsRegex = /^\[(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx|xxi|xxii|xxiii|xxiv|xxv|xxvi|xxvii|xxviii|xxix|xxx)\]$/;
        const traverseForMarkers = (node : any) => {
          if ($isElementNode(node)) {
            node.getChildren().forEach(child => traverseForMarkers(child));
          } else {
            const textContent = node.getTextContent().trim();
            if (romanNumeralsRegex.test(textContent)) {
              activeMarkers.add(textContent);
            }
          }
        };

        const root = $getRoot();
        traverseForMarkers(root);

        // Check for special element in the DOM
        root.getChildren().forEach(child => {
          if ($isParagraphNode(child)) {
            const paragraphChildren = child.getChildren();
            paragraphChildren.forEach(subChild => {
              if ($isDividerTextNode(subChild)) {
                console.log('activeMarkers', activeMarkers)
                 if (activeMarkers.size === 0) {
                  console.log("[EndnoteMonitorPlugin] Removing dividerTextNode:", subChild);
                  paragraphsToRemove.push(subChild); // Mark it for removal
                }
              }
            });
          }
        });

        // Collect paragraphs to remove
        root.getChildren().forEach(child => {
          if ($isParagraphNode(child)) {
            const paraText = child.getTextContent().trim();
            const match = paraText.match(/\[\w+\]/);
            if (match) {
              const marker = match[0];
              if (!activeMarkers.has(marker)) {
                console.log(`[EndnoteMonitorPlugin] Will remove paragraph with orphan marker '${marker}':`, paraText);
                paragraphsToRemove.push(child);
              }
            }
          }
        });
      });

      // Now safely mutate outside the read()
      if (paragraphsToRemove.length > 0) {
      editor.update(() => {
        // Remove orphaned paragraphs
        paragraphsToRemove.forEach((paragraphNode: any) => {
          paragraphNode.remove();
        });

        // Now trigger renumbering again
        const root = $getRoot();
        const markers : any = [];
        const traverse = (node: any) => {
          if ($isElementNode(node)) {
            node.getChildren().forEach(traverse);
          } else if (node.getType && node.getType() === 'endnote') {
            markers.push(node);
          }
        };
        traverse(root);

        markers.forEach((marker : any, idx : any) => {
          const newNumber = idx + 1;
          marker.setNumber(newNumber);

          const contentKey = marker.getContentKey();
          const contentNode = $getNodeByKey(contentKey);
          if ($isParagraphNode(contentNode)) {
            const firstChild = contentNode.getFirstChild();
            if ($isTextNode(firstChild)) {
              const existingText = firstChild.getTextContent();
              const updatedText = existingText.replace(
                /^\[[^\]]*\]/,
                `[${integerToRoman(newNumber)}]`
              );
              if (updatedText !== existingText) {
                firstChild.setTextContent(updatedText);
              }
            }
          }
        });
      });

      }
    });
  }, [editor]);

  return null;
}