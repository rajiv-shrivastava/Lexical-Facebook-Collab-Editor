import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, $insertNodes, $getRoot, $getNodeByKey } from "lexical";
import { useEffect } from "react";
import { INSERT_CROSS_REFERENCE } from "./ReferenceToolbar";
import type { Reference } from "./ReferenceToolbar";
import { $createReferenceNode } from "../../nodes/ReferenceNode";

const CrossReferencePlugin = (props : any) => {
  const [editor] = useLexicalComposerContext();
  const { styleConfig } = props;
  const crossRefStyles = styleConfig?.heading?.filter((item : any) => item.title === 'Cross-refrence Text')
  const refStyle = crossRefStyles && crossRefStyles[0];

  // Helper function to get computed styles from an element
  const getElementStyles = (element : any) => {
    if (!element) return {};
    
    const computedStyle = window.getComputedStyle(element);
    return {
      color: computedStyle.color,
      fontSize: computedStyle.fontSize,
      fontWeight: computedStyle.fontWeight,
      fontStyle: computedStyle.fontStyle,
      fontFamily: computedStyle.fontFamily,
      lineHeight: computedStyle.lineHeight,
      textDecoration: computedStyle.textDecoration,
      letterSpacing: computedStyle.letterSpacing,
      textTransform: computedStyle.textTransform
    };
  };

  // Helper function to apply styles to an element
  const applyStylesToElement = (element : any, styles : any) => {
    Object.keys(styles).forEach(property => {
      if (styles[property]) {
        element.style[property] = styles[property];
      }
    });
  };

  useEffect(() => {
    // Handler for clicking on reference elements
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const refId = target.getAttribute("data-ref-id");

      if (refId) {
        e.preventDefault();
        e.stopPropagation();

        const elements = document.querySelectorAll(`[data-ref-id="${refId}"]`);
        elements.forEach((element : any) => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          const originalBackground = element.style.backgroundColor;
          setTimeout(() => {
            element.style.backgroundColor = originalBackground;
          }, 2000);
        });
      }
    };

    const unregisterCommand = editor.registerCommand(
      INSERT_CROSS_REFERENCE,
      (reference: Reference) => {
        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            let referencedText = reference.label;

            const element = document.getElementById(reference.id || "");
            if (element) {
              const numberString = element.getAttribute("data-number") ?? "";
              const textContent = element.textContent ?? "";
              referencedText = numberString ? `${numberString}. ${textContent}` : textContent;
            }

            // Create the reference node
            const referenceNode = $createReferenceNode(reference.id || "", referencedText);
            selection.insertNodes([referenceNode]);

            // Apply styling after insertion
            setTimeout(() => {
              const insertedElement : any = document.querySelector(`[id="${reference.id}"][data-cross-ref="true"]`);
              if (insertedElement) {
                // Find the previous element or parent to copy styles from
                let styleSource = insertedElement.previousElementSibling;
                if (!styleSource) {
                  // If no previous sibling, try the parent element
                  styleSource = insertedElement.parentElement?.querySelector('[data-lexical-text="true"]');
                }
                if (!styleSource) {
                  // Fallback to parent element
                  styleSource = insertedElement.parentElement;
                }

                if (styleSource) {
                  const styles = getElementStyles(styleSource);
                  applyStylesToElement(insertedElement, styles);
                  // Maintain the cursor pointer and background for cross-reference functionality
                  insertedElement.style.cursor = 'pointer';
                  insertedElement.style.backgroundColor = 'rgb(248, 246, 226)';
                }
              }
            }, 0);
          }
        });
        return true;
      },
      0
    );

    // Add some CSS for the tooltip hover effect
    const style = document.createElement("style");
    style.textContent = `
      .reference-tooltip {
        transition: all 0.2s ease;
      }
      .reference-tooltip:hover {
        background-color: #f8f9fa;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("click", handleClick);
      unregisterCommand();
      document.head.removeChild(style);
    };
  }, [editor, refStyle]);

  useEffect(() => {
    const updateAllReferenceTexts = () => {
      editor.update(() => {
        const crossRefNodes = document.querySelectorAll('[data-cross-ref]');
        crossRefNodes.forEach((crossRefNode : any) => {
          const refId = crossRefNode.getAttribute('id');
          if (refId) {
            // Only update if the target element exists in current editor
            const sourceElement = document.getElementById(refId);
            const nodeKey = crossRefNode.getAttribute('data-lexical-node-key');
            if (sourceElement) {
              const numberString = sourceElement.getAttribute("data-number") ?? "";
              const textContent = sourceElement.textContent ?? "";
              const newText = numberString ? `${numberString}. ${textContent}` : textContent;
              if (crossRefNode.textContent !== newText) {
                crossRefNode.textContent = newText;
              }

              // Apply styling to existing cross-references
              let styleSource = crossRefNode.previousElementSibling;
              if (!styleSource) {
                styleSource = crossRefNode.parentElement?.querySelector('[data-lexical-text="true"]');
              }
              if (!styleSource) {
                styleSource = crossRefNode.parentElement;
              }

              if (styleSource) {
                const styles = getElementStyles(styleSource);
                applyStylesToElement(crossRefNode, styles);
                // Maintain the cursor pointer and background for cross-reference functionality
                crossRefNode.style.cursor = 'pointer';
                crossRefNode.style.backgroundColor = 'rgb(248, 246, 226)';
              }
            } else if (nodeKey) {
              const nodeToRemove = $getNodeByKey(nodeKey);
              if (nodeToRemove) {
                nodeToRemove?.remove();
              }
            }
          }
        });
      });
    };

    // Update references whenever the editor updates
    const unregisterUpdateListener = editor.registerUpdateListener(() => {
      updateAllReferenceTexts();
    });

    return () => {
      unregisterUpdateListener();
    };
  }, [editor]);

  return null;
};

export default CrossReferencePlugin;


// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { $getSelection, $isRangeSelection, $insertNodes, $getRoot, $getNodeByKey } from "lexical";
// import { useEffect } from "react";
// import { INSERT_CROSS_REFERENCE } from "./ReferenceToolbar";
// import type { Reference } from "./ReferenceToolbar";
// import { $createReferenceNode } from "../../nodes/ReferenceNode";

// const CrossReferencePlugin = (props : any) => {
//   const [editor] = useLexicalComposerContext();
//   const { styleConfig } = props;
//   const crossRefStyles = styleConfig?.heading?.filter((item : any) => item.title === 'Cross-refrence Text')
//   const refStyle = crossRefStyles && crossRefStyles[0];
//   useEffect(() => {
//     // Handler for clicking on reference elements
//     const handleClick = (e: MouseEvent) => {
//       const target = e.target as HTMLElement;
//       const refId = target.getAttribute("data-ref-id");
    
//       if (refId) {
//         e.preventDefault();
//         e.stopPropagation();

//         const elements = document.querySelectorAll(`[data-ref-id="${refId}"]`);
//         elements.forEach((element : any) => {
//           element.scrollIntoView({ behavior: "smooth", block: "center" });
//           const originalBackground = element.style.backgroundColor;
//           // element.style.backgroundColor = "#ffeb3b";
//           setTimeout(() => {
//             element.style.backgroundColor = originalBackground;
//           }, 2000);
//         });
//       }
//     };

//     // document.addEventListener("click", handleClick);

//     const unregisterCommand = editor.registerCommand(
//       INSERT_CROSS_REFERENCE,
//       (reference: Reference) => {
//         editor.update(() => {
//           const selection = $getSelection();

//           if ($isRangeSelection(selection)) {
//            let referencedText = reference.label;

//             const element = document.getElementById(reference.id || "");
//             if (element) {
//               const numberString = element.getAttribute("data-number") ?? "";
//               const textContent = element.textContent ?? "";
//               referencedText = numberString ? `${numberString}. ${textContent}` : textContent;
//             }

//             // Insert even if element was not found
//             const referenceNode = $createReferenceNode(reference.id || "", referencedText);
//             selection.insertNodes([referenceNode]);


//             // const referenceNode = $createReferenceNode(
//             //   reference.id || "",
//             //   referencedText
//             // );
//             // console.log('referenceNode', referenceNode)
//             // selection.insertNodes([referenceNode]);
//           }
//         });
//         return true;
//       },
//       0
//     );

//     // Add some CSS for the tooltip hover effect
//     const style = document.createElement("style");
//     style.textContent = `
//       .reference-tooltip {
//         transition: all 0.2s ease;
//       }
//       .reference-tooltip:hover {
//         background-color: #f8f9fa;
//       }
//     `;
//     document.head.appendChild(style);

//     return () => {
//       document.removeEventListener("click", handleClick);
//       unregisterCommand();
//       document.head.removeChild(style);
//     };
//   }, [editor, refStyle]);

//   useEffect(() => {
//     const updateAllReferenceTexts = () => {
//       editor.update(() => {
//   const crossRefNodes = document.querySelectorAll('[data-cross-ref]');
//         crossRefNodes.forEach((crossRefNode) => {
//            const refId = crossRefNode.getAttribute('id');
//           if (refId) {
//             // Only update if the target element exists in current editor
//             const sourceElement = document.getElementById(refId);
//             const nodeKey = crossRefNode.getAttribute('data-lexical-node-key');
//            if (sourceElement) {
//               const numberString = sourceElement.getAttribute("data-number") ?? "";
//               const textContent = sourceElement.textContent ?? "";
//               const newText = numberString ? `${numberString}. ${textContent}` : textContent;
//               if (crossRefNode.textContent !== newText) {
//               crossRefNode.textContent = newText;
//               }
//             } else if (nodeKey) {
//               const nodeToRemove = $getNodeByKey(nodeKey);
//               if (nodeToRemove) {
//                 nodeToRemove?.remove();
//               }
//             }
//  }
//         });
//       });
//     };
  
//     // Update references whenever the editor updates
//     const unregisterUpdateListener = editor.registerUpdateListener(() => {
//       updateAllReferenceTexts();
//     });
  
//     return () => {
//       unregisterUpdateListener();
//     };
//   }, [editor]);
  
//   return null;
// };

// export default CrossReferencePlugin;
