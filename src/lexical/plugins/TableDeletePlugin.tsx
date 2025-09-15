import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
    $createParagraphNode,
    $createTextNode,
    $getRoot,
    $getSelection,
    $isRangeSelection,
    $isElementNode,
    COMMAND_PRIORITY_CRITICAL,
    KEY_BACKSPACE_COMMAND,
    $isParagraphNode,
} from "lexical";
import { useEffect } from "react";
import { $isTableNode, TableNode } from "../nodes/CustomTableNode/src";
import { generateStableCaptionId } from "./TablePlugin";
import { ColoredNode } from "../nodes/TableNode";

export default function TableDeletePlugin({enableCaption , styleConfig}:any) {
    const [editor] = useLexicalComposerContext();
    const CaptionStyle = styleConfig?.heading?.filter((item : any) => item.title === 'Captions')
    const CaptionStyle_ = CaptionStyle && CaptionStyle[0];
    useEffect(() => {
        let isDeleting = false;

        const removeCommand = editor.registerCommand(
            KEY_BACKSPACE_COMMAND,
            () => {
                if (isDeleting) return false;
                isDeleting = true;

                editor.update(() => {
                    try {
                        const selection = $getSelection();
                        if (!$isRangeSelection(selection)) return false;

                        const selectedNodes = selection.getNodes();
                        const tableNodes = selectedNodes.filter(
                            (node) => node instanceof TableNode
                        );
                        if (tableNodes.length === 0) return false;

                        const root = $getRoot();

                        // Group selected TableNodes by groupId
                        const groups = new Map<string | undefined, any[]>();
                        for (const node of tableNodes) {
                            const groupId = (node as any).__groupId;
                            if (!groups.has(groupId)) {
                                groups.set(groupId, []);
                            }
                            groups.get(groupId)!.push(node);
                        }

                        // For each group, delete partial or full rows
                        groups.forEach((nodesInGroup, groupId) => {
                            const allTableNodes = root.getChildren().filter(
                                (node) =>
                                    node instanceof TableNode && node.__groupId === groupId
                            );

                            const isFullTableDelete = nodesInGroup.length === allTableNodes.length;

                            if (isFullTableDelete) {
                                allTableNodes.forEach((node) => node.remove());

                                // activeEditor.update(() => {
  if (enableCaption) {
    const rootNode = $getRoot();
    const tableNodes = rootNode.getChildren().filter($isTableNode);
    let index1 = 1;

    tableNodes.forEach((tableNode) => {
      const previousNode = tableNode.getPreviousSibling();
      const rootNode = $getRoot();
      const tables = rootNode.getChildren().filter($isTableNode);
      const countOfTable = tables.length;

      const existingCaptionId = (tableNode as any).__captionId ||
        generateStableCaptionId(`Table ${index1}`, countOfTable);

      // Remove any duplicate captions BELOW the table
      const nextNode = tableNode.getNextSibling();
      if (nextNode && $isParagraphNode(nextNode)) {
        nextNode.getChildren().forEach((child) => {
          if (child.getTextContent().startsWith("Table")) {
            child.remove();
          }
        });
      }

      if (previousNode && $isParagraphNode(previousNode)) {
        // Check if previous node contains a caption with ID
        let existingLabelNode: any = null;
        previousNode.getChildren().forEach((child) => {
          if (child.getTextContent().startsWith("Table")) {
            existingLabelNode = child;
          }
        });

        if (existingLabelNode) {
          // If we have an existing label node, update its content but keep the ID
          const existingId = (existingLabelNode as any).getId?.() || existingCaptionId;
          existingLabelNode.remove();

          // Create new label with preserved ID
          const newLabelNode = new ColoredNode(
            `Table ${index1}:`,
             CaptionStyle_?.fontColor || "black",
          `${CaptionStyle_?.fontSize}px`,
          CaptionStyle_?.bold === "Yes" ? "bold" : "normal",
          CaptionStyle_?.italic === "Yes" ? "italic" : "normal",
          CaptionStyle_?.alignment || "left",
          CaptionStyle_?.fontFamily || "Arial",
          CaptionStyle_?.leadingSpace || "0",
          CaptionStyle_?.lineSpacing || "1",
          CaptionStyle_?.trailingSpace || "0",
            existingId
          );

          const firstChild = previousNode.getFirstChild();
          if (firstChild !== null) {
            firstChild.insertBefore(newLabelNode);
          } else {
            previousNode.append(newLabelNode);
          }
        } else {
          // No existing label, create a new one
          const newLabelNode = new ColoredNode(
            `Table ${index1}:`,
             CaptionStyle_?.fontColor || "black",
          `${CaptionStyle_?.fontSize}px`,
          CaptionStyle_?.bold === "Yes" ? "bold" : "normal",
          CaptionStyle_?.italic === "Yes" ? "italic" : "normal",
          CaptionStyle_?.alignment || "left",
          CaptionStyle_?.fontFamily || "Arial",
          CaptionStyle_?.leadingSpace || "0",
          CaptionStyle_?.lineSpacing || "1",
          CaptionStyle_?.trailingSpace || "0",
            existingCaptionId
          );

          const firstChild = previousNode.getFirstChild();
          if (firstChild !== null) {
            firstChild.insertBefore(newLabelNode);
          } else {
            previousNode.append(newLabelNode);
          }
        }
      } else {
        // If there's no previous paragraph node, create a new caption
        const tableNumber = `Table ${index1}:`;
        const newCaptionContainer = $createParagraphNode();
        newCaptionContainer.setFormat("left");

        const newLabelNode = new ColoredNode(
          tableNumber,
           CaptionStyle_?.fontColor || "black",
          `${CaptionStyle_?.fontSize}px`,
          CaptionStyle_?.bold === "Yes" ? "bold" : "normal",
          CaptionStyle_?.italic === "Yes" ? "italic" : "normal",
          CaptionStyle_?.alignment || "left",
          CaptionStyle_?.fontFamily || "Arial",
          CaptionStyle_?.leadingSpace || "0",
          CaptionStyle_?.lineSpacing || "1",
          CaptionStyle_?.trailingSpace || "0",
          existingCaptionId
        );
        newLabelNode.setStyle("font-weight: bold; margin-right: 5px;");

        // const captionText = caption.trim() === "" ? "Caption text here" : caption;
        const captionNode = $createTextNode('captionText');
        captionNode.setStyle("color: black; font-style: italic; font-weight: normal;");

        newCaptionContainer.append(newLabelNode);
        newCaptionContainer.append($createTextNode(" "));
        newCaptionContainer.append(captionNode);
      }

      const hasCaption = (tableNode as any).__isCaption === true;
      if (hasCaption) {
        index1++;
      }
    });
  }
// });

                            } else {
                                const nonDeletedNode = root.getChildren().find(
                                    (node) =>
                                        !(node instanceof TableNode) ||
                                        !nodesInGroup.includes(node)
                                );
                                if (nonDeletedNode && $isElementNode(nonDeletedNode)) {
                                    nonDeletedNode.select();
                                }

                                nodesInGroup.forEach((node) => node.remove());
                            }
                        });

                    } finally {
                        isDeleting = false;
                    }
                });

                return true;
            },
            COMMAND_PRIORITY_CRITICAL
        );

        return () => {
            removeCommand();
        };
    }, [editor]);

    return null;
}
