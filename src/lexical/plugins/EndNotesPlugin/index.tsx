import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $createTextNode,
  createCommand,
  $getSelection,
  $isElementNode,
  $createRangeSelection,
  $setSelection,
  $isParagraphNode,
  $isTextNode,
  $getNodeByKey,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical";
import { useEffect, useRef, useCallback, useState } from "react";
import {
  $createEndNoteNode,
  $isEndNoteNode,
  EndNoteNode,
} from "../../nodes/EndNoteNode";
import {
  $createDividerTextNode,
  $isDividerTextNode,
} from "../../nodes/DividerTextNode";
import { EndNoteDialog } from "./EndnoteDialog";

export const INSERT_ENDNOTE: any = createCommand<any>("INSERT_ENDNOTE");

export function integerToRoman(num: number): string {
  const romanValues: { [key: string]: number } = {
    m: 1000,
    cm: 900,
    d: 500,
    cd: 400,
    c: 100,
    xc: 90,
    l: 50,
    xl: 40,
    x: 10,
    ix: 9,
    v: 5,
    iv: 4,
    i: 1,
  };
  let roman = "";
  for (let key in romanValues) {
    while (num >= romanValues[key]) {
      roman += key;
      num -= romanValues[key];
    }
  }
  return roman;
}

export default function EndNotesPlugin() {
  const [editor] = useLexicalComposerContext();
  const skipNextCheck = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingRef = useRef(false);
  const [showDialog, setShowDialog] = useState(false);
  const pendingSelectionRef = useRef<any>(null);

  // Helper: traverse all nodes in document order
  const traverseNodes = (node: any, callback: (node: any) => void) => {
    callback(node);
    if ($isElementNode(node)) {
      node.getChildren().forEach((child) => traverseNodes(child, callback));
    }
  };

  // Convert roman numeral to number for sorting
  const romanToNumber = (roman: string): number => {
    const values: { [key: string]: number } = {
      i: 1,
      v: 5,
      x: 10,
      l: 50,
      c: 100,
      d: 500,
      m: 1000,
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000,
    };
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
      const current = values[roman[i]];
      const next = values[roman[i + 1]];
      if (next && current < next) {
        total += next - current;
        i++;
      } else {
        total += current;
      }
    }
    return total;
  };

  // Get all endnote markers in document order
  const getAllEndNoteMarkers = (): EndNoteNode[] => {
    const markers: EndNoteNode[] = [];
    const root = $getRoot();

    traverseNodes(root, (node) => {
      if ($isEndNoteNode(node)) {
        markers.push(node);
      }
    });

    return markers;
  };

  // Get all endnote content paragraphs (those with roman numeral markers)
  const getAllEndNoteContentParagraphs = (): any[] => {
    const contentParagraphs: any[] = [];
    const root = $getRoot();

    root.getChildren().forEach((child) => {
      if ($isParagraphNode(child)) {
        const firstChild = child.getFirstChild();
        if ($isTextNode(firstChild)) {
          const text = firstChild.getTextContent();
          // Match roman numeral pattern at start: [i], [ii], [iii], etc.
          const match = text.match(/^\[([ivxlcdm]+)\]/i);
          if (match) {
            const romanNumeral = match[1];
            const number = romanToNumber(romanNumeral);
            contentParagraphs.push({
              node: child,
              number: number,
              roman: romanNumeral.toLowerCase(),
            });
          }
        }
      }
    });

    // Sort by roman numeral order
    contentParagraphs.sort((a, b) => a.number - b.number);

    return contentParagraphs;
  };


  // Renumber all endnotes sequentially
  const renumberAllEndNotes = useCallback(() => {
    if (isUpdatingRef.current) return;
    
    const markers = getAllEndNoteMarkers();

    // Check if numbering is already sequential
    let needUpdate = false;
    for (let i = 0; i < markers.length; i++) {
      if (markers[i].getNumber() !== i + 1) {
        needUpdate = true;
        break;
      }
    }

    if (!needUpdate) return;

    console.log("🔢 Renumbering endnotes...");

    // Update all endnote numbers and content markers
    markers.forEach((marker, index) => {
      const newNumber = index + 1;
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
  }, []);

  // Debounced update function to handle collaboration safely
  const debouncedUpdate = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      if (skipNextCheck.current) {
        skipNextCheck.current = false;
        return;
      }

      editor.update(() => {
        isUpdatingRef.current = true;
        try {
          renumberAllEndNotes();
        } finally {
          isUpdatingRef.current = false;
        }
      });
    }, 100); // Small delay to batch updates
  }, [editor,  renumberAllEndNotes]);

  // Clean up orphaned endnote content when markers are removed
  const cleanupOrphanedEndNotes = useCallback(() => {
    const markers = getAllEndNoteMarkers();
    const contentParagraphs = getAllEndNoteContentParagraphs();
    const markerContentKeys = new Set(markers.map(marker => marker.getContentKey()));

    // Find and remove content paragraphs that don't have corresponding markers
    contentParagraphs.forEach((item) => {
      const contentKey = item.node.getKey();
      if (!markerContentKeys.has(contentKey)) {
        // console.log(🗑️ Removing orphaned endnote content: [${item.roman}]);
        item.node.remove();
      }
    });
  }, []);

  const createEndNoteWithText = (endNoteText: string) => {
    skipNextCheck.current = true;

    editor.update(() => {
      const root = $getRoot();
      const selection = pendingSelectionRef.current;

      // generate random id
      const randomId = Math.random().toString(36).substr(2, 9);
      const endNoteNode = $createEndNoteNode(0, "", randomId);

      if (selection && $isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const isForward =
          anchor.key === focus.key
            ? anchor.offset <= focus.offset
            : anchor.key < focus.key;

        const key = isForward ? focus.key : anchor.key;
        const offset = isForward ? focus.offset : anchor.offset;

        const range = $createRangeSelection();
        range.anchor.set(key, offset, "text");
        range.focus.set(key, offset, "text");
        $setSelection(range);
        range.insertNodes([endNoteNode]);
      }

      // Create the content node for the new endnote
      const endNoteParagraph = $createParagraphNode();
      const endNoteContent = $createTextNode(`[?] ${endNoteText}`);
      endNoteParagraph.append(endNoteContent);
      root.append(endNoteParagraph);

      // Add dataset attribute in DOM for content paragraph
      setTimeout(() => {
        const paragraphElement = editor.getElementByKey(endNoteParagraph.getKey());
        if (paragraphElement) {
          paragraphElement.dataset[`attrEndnote`] = randomId;
        }
      }, 50);

      // Link the new endnote marker with its content node
      endNoteNode.setContentKey(endNoteParagraph.getKey());
      const existingMarkers = getAllEndNoteMarkers();
      if (existingMarkers.length === 1) {
        const extraParagraph = $createParagraphNode();
        root.append(extraParagraph);
      }
      
      // Reorder endnote content nodes
      const allEndNotes = getAllEndNoteMarkers();
      const contentKeysInOrder = allEndNotes.map((node) =>
        node.getContentKey()
      );
      const contentNodes = contentKeysInOrder
        .map((key) => $getNodeByKey(key))
        .filter((node) => node !== null);

      contentNodes?.forEach((node) => {
        if (node) {
          root.append(node);
        }
      });

      // Insert divider if needed
      let dividerExists = false;
      root.getChildren().forEach((child) => {
        if ($isParagraphNode(child)) {
          const firstChild = child.getFirstChild();
          if (
            (firstChild && $isDividerTextNode(firstChild)) ||
            (firstChild &&
              $isTextNode(firstChild) &&
              firstChild
                .getTextContent()
                .includes("_______________________________"))
          ) {
            dividerExists = true;
            if (
              !$isDividerTextNode(firstChild) &&
              firstChild
                .getTextContent()
                .includes("_______________________________")
            ) {
              const dividerNode = $createDividerTextNode();
              firstChild.replace(dividerNode);
            }
          }
        }
      });

      if (!dividerExists && contentNodes?.length > 0) {
        const dividerParagraph = $createParagraphNode();
        dividerParagraph.append($createDividerTextNode());
        contentNodes[0]?.insertBefore(dividerParagraph);
      }

      // Remove duplicate dividers
      const foundDividers: any = [];
      root.getChildren().forEach((child) => {
        if ($isParagraphNode(child)) {
          const firstChild = child.getFirstChild();
          if (
            (firstChild && $isDividerTextNode(firstChild)) ||
            (firstChild &&
              $isTextNode(firstChild) &&
              firstChild
                .getTextContent()
                .includes("_______________________________"))
          ) {
            foundDividers.push(child);
          }
        }
      });
      if (foundDividers.length > 1) {
        for (let i = 1; i < foundDividers.length; i++) {
          foundDividers[i].remove();
        }
      }

      // Renumber all endnotes
      renumberAllEndNotes();

      // Set selection at the end of the new endnote content
      if (selection && $isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const isForward =
          anchor.key === focus.key
            ? anchor.offset <= focus.offset
            : anchor.key < focus.key;

        const key = isForward ? focus.key : anchor.key;
        const offset = isForward ? focus.offset + 1 : anchor.offset + 1; // +1 to place cursor after the endnote marker

        const rangeSelection = $createRangeSelection();
        rangeSelection.anchor.set(key, offset, "text");
        rangeSelection.focus.set(key, offset, "text");
        $setSelection(rangeSelection);
      }

    });

    // Clear the pending selection
    pendingSelectionRef.current = null;
  };
  const showEndNoteDialog = () => {
    // Store current selection
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (selection && $isRangeSelection(selection)) {
        pendingSelectionRef.current = selection.clone();
      }
    });

    setShowDialog(true);
  };

  const handleDialogConfirm = (endNoteText: string) => {
    createEndNoteWithText(endNoteText);
    setShowDialog(false);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    pendingSelectionRef.current = null;
  };

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      INSERT_ENDNOTE,
      () => {
        showEndNoteDialog();
        return true;
      },
      0
    );

    // Use mutation listener to handle endnote changes in collaboration-safe way
    const unregisterMutationListener = editor.registerMutationListener(
      EndNoteNode,
      (mutatedNodes) => {
        // Skip if we just inserted a new endnote
        if (skipNextCheck.current || isUpdatingRef.current) {
          return;
        }

        const hasRemovedNodes = Array.from(mutatedNodes.entries()).some(
          ([_, mutation]) => mutation === "destroyed"
        );

        if (hasRemovedNodes) {
          console.log(
            "🔄 EndNoteNode was removed, triggering cleanup..."
          );
          
          // Use debounced update to handle collaboration safely
          debouncedUpdate();
        }
      }
    );

    // Initialize relationships on mount
    setTimeout(() => {
      editor.update(() => {
        renumberAllEndNotes();
      });
    }, 100);

    return () => {
      unregisterCommand();
      unregisterMutationListener();
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [editor, debouncedUpdate, renumberAllEndNotes]);

  return (
    <>
      <EndNoteDialog
        open={showDialog}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
      />
    </>
  );
}


