import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $getRoot, $isParagraphNode } from "lexical";
import { ColoredNode } from "../nodes/TableNode";
import { generateStableCaptionId } from "./TablePlugin";
import { $isTableNode, TableNode } from "../nodes/CustomTableNode/src";

function renumberAllTablesAndRemoveOrphanCaptions(styleConfig?: any) {
  const root = $getRoot();
  const children = root.getChildren();
  const tables = children.filter((node) => $isTableNode(node) && node.getIsCaption());
  let count = 1;
  const CaptionStyle = styleConfig?.heading?.filter((item : any) => item.title === 'Captions')
  const CaptionStyle_ = CaptionStyle && CaptionStyle[0];
  for (const tableNode of tables) {
    const tableWritable = tableNode.getWritable();
    const captionId = generateStableCaptionId(`Table ${count}`, count);
    (tableWritable as any).__captionId = captionId;

    const prevNode = tableWritable.getPreviousSibling();
    if (prevNode && $isParagraphNode(prevNode)) {
      const children = prevNode.getChildren();
      const labelNode = children.find((child) =>
        child.getTextContent().startsWith("Table")
      );

      if (labelNode) {
        const newLabel = new ColoredNode(`Table ${count}:`,   CaptionStyle_?.fontColor || "black",
          `${CaptionStyle_?.fontSize}px`,
          CaptionStyle_?.bold === "Yes" ? "bold" : "normal",
          CaptionStyle_?.italic === "Yes" ? "italic" : "normal",
          CaptionStyle_?.alignment || "left",
          CaptionStyle_?.fontFamily || "Arial",
          CaptionStyle_?.leadingSpace || "0",
          CaptionStyle_?.lineSpacing || "1",
          CaptionStyle_?.trailingSpace || "0", captionId);
        labelNode.replace(newLabel);
      }
    }

    count++;
  }

  // Also remove leftover orphan captions
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    const next = children[i + 1];

    if (
      $isParagraphNode(node) &&
      node.getTextContent().trim().startsWith("Table") &&
      !$isTableNode(next)
    ) {
      node.remove(); // orphaned caption
    }
  }
}

export default function TableRenumberPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerMutationListener(TableNode, (mutations) => {
      let deleted = false;

      for (const [_, type] of mutations) {
        if (type === "destroyed") {
          deleted = true;
          break;
        }
      }
      if (deleted) {
        editor.update(() => {
          renumberAllTablesAndRemoveOrphanCaptions();
        });
      }
    });
  }, [editor]);

  return null;
}


// // plugins/TableRenumberPlugin.tsx
// import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
// import { useEffect } from "react";
// import { TableNode } from "@lexical/table";
// import { $getRoot, $isParagraphNode } from "lexical";
// import { generateStableCaptionId } from "./TablePlugin";
// import { ColoredNode } from "../nodes/TableNode";
// import { $isTableNode } from "@lexical/table";

// export function renumberAllTables() {
//   const root = $getRoot();
//   const tables = root.getChildren().filter($isTableNode);
//   let count = 1;

//   for (const tableNode of tables) {
//     const prevNode = tableNode.getPreviousSibling();
//     const captionId = generateStableCaptionId(`Table ${count}`, count);

//     // Make node writable
//     const writableTableNode = tableNode.getWritable();
//     (writableTableNode as any).__captionId = captionId;

//     if (prevNode && $isParagraphNode(prevNode)) {
//       const children = prevNode.getChildren();
//       const labelNode = children.find((child) =>
//         child.getTextContent().startsWith("Table")
//       );

//       if (labelNode) {
//         const newLabel = new ColoredNode(`Table ${count}:`, "black", captionId);
//         labelNode.replace(newLabel);
//       }
//     }

//     count++;
//   }
// }


// export default function TableRenumberPlugin() {
//   const [editor] = useLexicalComposerContext();

//   useEffect(() => {
//     const cleanup = editor.registerMutationListener(TableNode, (mutations) => {
//       let deleted = false;
//       mutations.forEach((type) => {
//         if (type === "destroyed") {
//           deleted = true;
//         }
//       });

//       if (deleted) {
//         editor.update(() => {
//           renumberAllTables();
//         });
//       }
//     });

//     return cleanup;
//   }, [editor]);

//   return null;
// }
