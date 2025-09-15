import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createTableNodeWithDimensions,
  $isTableNode,
  INSERT_TABLE_COMMAND,
  TableNode,
} from "../nodes/CustomTableNode/src";
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  EditorThemeClasses,
  Klass,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
} from "lexical";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as React from "react";

import Button from "../ui/Button";
import { DialogActions } from "../ui/Dialog";
import TextInput from "../ui/TextInput";
import invariant from "../utils/invariant";
import { ColoredNode } from "../nodes/TableNode";
import {$generateNodesFromDOM} from "@lexical/html"
import { generateUniqueTableGroupId } from "../utils/editorstateHelper";

export type InsertTableCommandPayload = Readonly<{
  columns: string;
  rows: string;
  includeHeaders?: boolean;
}>;

export type CellContextShape = {
  cellEditorConfig: null | CellEditorConfig;
  cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  set: (
    cellEditorConfig: null | CellEditorConfig,
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>
  ) => void;
};

export type CellEditorConfig = Readonly<{
  namespace: string;
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
  onError: (error: Error, editor: LexicalEditor) => void;
  readOnly?: boolean;
  theme?: EditorThemeClasses;
}>;

export const INSERT_NEW_TABLE_COMMAND: LexicalCommand<InsertTableCommandPayload> =
  createCommand("INSERT_NEW_TABLE_COMMAND");

export const CellContext = createContext<CellContextShape>({
  cellEditorConfig: null,
  cellEditorPlugins: null,
  set: () => {
    // Empty function
  },
});

export function TableContext({ children }: { children: JSX.Element }) {
  const [contextValue, setContextValue] = useState<{
    cellEditorConfig: null | CellEditorConfig;
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
  }>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
  });
  return (
    <CellContext.Provider
      value={useMemo(
        () => ({
          cellEditorConfig: contextValue.cellEditorConfig,
          cellEditorPlugins: contextValue.cellEditorPlugins,
          set: (cellEditorConfig, cellEditorPlugins) => {
            setContextValue({ cellEditorConfig, cellEditorPlugins });
          },
        }),
        [contextValue.cellEditorConfig, contextValue.cellEditorPlugins]
      )}
    >
      {children}
    </CellContext.Provider>
  );
}

export const generateStableCaptionId = (text: any, tableIndex: any) => {
  let hash = 5381;
  const cleanText = String(tableIndex); // Use only table index for stability
  for (let i = 0; i < cleanText.length; i++) {
    hash = ((hash << 5) + hash) + cleanText.charCodeAt(i);
  }
  return `table-${tableIndex}-${Math.abs(hash % 1000000)}`;

};

//Split each row into a table so that pagination doesn't consider a table as a single block element but rather a collection of elements
export function splitEachRowIntoStyledTables(htmlString: any) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  const tables = doc.querySelectorAll('table');

  tables.forEach((originalTable) => {
    const tableGroupId = generateUniqueTableGroupId();
    const rows = Array.from(originalTable.querySelectorAll('tr'));
    if (rows.length <= 1) return;

    const fragment = document.createDocumentFragment();

    rows.forEach((row, index) => {
      const newTable = document.createElement('table');

      // Copy attributes
      for (let attr of originalTable.attributes) {
        newTable.setAttribute(attr.name, attr.value);
      }

      newTable.setAttribute('data-table-caption', index === 0 ? 'true' : 'false');
      newTable.setAttribute('data-table-id', tableGroupId)
      const tbody = document.createElement('tbody');
      tbody.appendChild(row.cloneNode(true));
      newTable.appendChild(tbody);

      fragment.appendChild(newTable);
    });

    originalTable.replaceWith(fragment);
  });

  return doc.body.innerHTML;
}

export function generateLargeTableHTML({
  totalRows = 10,
  totalColumns = 4,
  headers = true,
} = {}) {
  let html = '<table>';

  if (headers) {
    html += '<thead><tr>';
    for (let col = 0; col < totalColumns; col++) {
      html += '<th></th>';
    }
    html += '</tr></thead>';
    totalRows -= 1; // Reduce totalRows by 1 to account for the header row
  }

  // Add data rows to the table
  html += '<tbody>';
  for (let row = 0; row < totalRows; row++) {
    html += '<tr>';
    for (let col = 0; col < totalColumns; col++) {
      html += '<td></td>';
    }
    html += '</tr>';
  }
  html += '</tbody>';

  html += '</table>';
  return html;
}

export function InsertTableDialog({
  activeEditor,
  onClose,
  enableCaptions = true,
  styleConfig
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
  enableCaptions?: boolean;
  styleConfig?: any;
}): JSX.Element {
  const [rows, setRows] = useState("5");
  const [columns, setColumns] = useState("5");
  const [caption, setCaption] = useState<string>("");
  const [isDisabled, setIsDisabled] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  let tableCount = Number(localStorage.getItem("tableCount")) || 1;
  const CaptionStyle = styleConfig?.heading?.filter((item : any) => item.title === 'Captions')
  const CaptionStyle_ = CaptionStyle && CaptionStyle[0];
  useEffect(() => {
    const row = Number(rows);
    const column = Number(columns);
  if (row && row > 0 && row <= 500 && column && column > 0 && column <= 20) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [rows, columns]);

  const handleSaveTable = () => {
    activeEditor.update(() => {
      const rootNode = $getRoot();
      const tableNodes = rootNode.getChildren().filter($isTableNode);

      if (tableNodes.length === 0) {
        console.warn("No tables found in the document!");
        return;
      }

      const tableData = tableNodes.map((tableNode) => {
        let captionText = caption;

        const previousNode = tableNode.getPreviousSibling();
        if (previousNode && $isParagraphNode(previousNode)) {
          const textNodes = previousNode
            .getChildren()
            .filter((child) => child.getType() === "text");

          if (textNodes.length > 1) {
            captionText = textNodes[1].getTextContent();
          }
        }

        return {
          caption: captionText,
          content: tableNode
            .getChildren()
            .map((row) =>
              (row as any)
                .getChildren()
                .map((cell: any) => cell.getTextContent())
            ),
        };
      });
      localStorage.setItem("savedTableData", JSON.stringify(tableData));
    });
  };
// helper near the top of the file (or above onAddTable)
function cssFromCaptionStyle(s: any = {}): string {
  const parts: string[] = [];
  if (s.fontColor) parts.push(`color:${s.fontColor} !important`);
  if (s.fontSize) parts.push(`font-size:${s.fontSize}px !important`);
  if (s.fontFamily) parts.push(`font-family:${s.fontFamily} !important`);
  if (s.lineSpacing) parts.push(`line-height:${s.lineSpacing} !important`);
  if (s.leadingSpace) parts.push(`padding-left:${s.leadingSpace}em !important`);
  if (s.trailingSpace) parts.push(`padding-right:${s.trailingSpace}em !important`);
  return parts.join("; ");
}

  const onAddTable = () => {
    if (!rows || !columns) return;

    const currentTableCount = tableCount;

    const totalRows = Number(rows);
    const totalColumns = Number(columns);

    activeEditor.update(() => {
      if (enableCaptions) {
        const captionContainer = $createParagraphNode();
        captionContainer.setFormat("left");
        const rootNode = $getRoot();
        const tables = rootNode.getChildren().filter($isTableNode);
        const countOfTable = tables.length;
        const captionId = generateStableCaptionId(caption || `Table ${currentTableCount}`, countOfTable);
        const labelNode = new ColoredNode(
          `Table ${currentTableCount}:`,
        CaptionStyle_?.fontColor || "black",
        `${CaptionStyle_?.fontSize}px`,
        CaptionStyle_?.bold === "Yes" ? "bold" : "normal",
        CaptionStyle_?.italic === "Yes" ? "italic" : "normal",
        CaptionStyle_?.alignment || "left",
        CaptionStyle_?.fontFamily || "Arial",
        CaptionStyle_?.leadingSpace || "0",
        CaptionStyle_?.lineSpacing || "1",
        CaptionStyle_?.trailingSpace || "0",
          captionId,
        );
        labelNode.setStyle("font-weight: bold; margin-right: 8px;");
        const captionText = caption.trim() === "" ? "." : caption;
        const captionNode = $createTextNode(captionText);
  // apply bold/italic only if requested
  if (CaptionStyle_?.bold === "Yes") captionNode.toggleFormat("bold");
  if (CaptionStyle_?.italic === "Yes") captionNode.toggleFormat("italic");

  // apply non-format CSS (size, color, family, spacing)
  captionNode.setStyle(cssFromCaptionStyle(CaptionStyle_));

        captionContainer.getChildren().forEach(child => child.remove());
        const breakNode = $createLineBreakNode();
        captionContainer.append(labelNode);
        captionContainer.append(captionNode);
        captionContainer.append(breakNode);
        // const selection = $getSelection();
      // if (!$isRangeSelection(selection)) return;

      //   let node: any = selection.anchor.getNode();
      //   let tableNode = null;

      //     while (node !== null) {
      //       if ($isTableNode(node)) {
      //         tableNode = node;
      //         break;
      //       }
      //       node = node.getParent();
      //     }

      // if (tableNode) {
      //   tableNode.insertAfter(captionContainer)

      //   captionContainer.selectEnd();
      // } else{
          $insertNodes([captionContainer]);

      // }


        
      }
      const htmlString = generateLargeTableHTML({ totalRows, totalColumns })
      const modifiedHTML = splitEachRowIntoStyledTables(htmlString);

      const parser = new DOMParser();
      const dom = parser.parseFromString(modifiedHTML, 'text/html');
      const nodes = $generateNodesFromDOM(activeEditor, dom);


//       const selection = $getSelection();
// if (!$isRangeSelection(selection)) return;

// let node: any = selection.anchor.getNode();
// let tableNode = null;

// while (node !== null) {
//   if ($isTableNode(node)) {
//     tableNode = node;
//     break;
//   }
//   node = node.getParent();
// }

// if (tableNode) {
//   let lastInserted :any= tableNode;
//   nodes.forEach((node) => {
//     lastInserted.insertAfter(node);
//     lastInserted = node;
//   });

//   nodes[nodes.length - 1].selectEnd();
// } else{
      $insertNodes(nodes);

// }


    });

    activeEditor.update(() => {
      if(enableCaptions) {
      const rootNode = $getRoot();
      const tableNodes = rootNode.getChildren().filter($isTableNode);
      let index1 = 1;
      tableNodes.forEach((tableNode) => {
        const previousNode = tableNode.getPreviousSibling();
        // Get the caption ID associated with this table, or generate a new one
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
              existingId,
            );
            // newLabelNode.setStyle("font-weight: bold; margin-right: 5px;");

            // Insert at the beginning of paragraph
            const firstChild = previousNode.getFirstChild();
            if (firstChild !== null) {
              firstChild.insertBefore(newLabelNode);
            } else {
              previousNode.append(newLabelNode);
            }
          } 
          else {
            // No existing label, create a new one
            if(enableCaptions) {
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
              existingCaptionId,
            );
            // newLabelNode.setStyle("font-weight: bold; margin-right: 5px;");

            const firstChild = previousNode.getFirstChild();
            if (firstChild !== null) {
              firstChild.insertBefore(newLabelNode);
            } else {
              previousNode.append(newLabelNode);
            }
          }}
        } 
        else {
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
              existingCaptionId,
            );
            newLabelNode.setStyle(" margin-right: 5px;");
           const captionText = caption.trim() === "" ? "Caption text here" : caption;
          const captionNode = $createTextNode(captionText);

          // dynamic bold/italic
          if (CaptionStyle_?.bold === "Yes") captionNode.toggleFormat("bold");
          if (CaptionStyle_?.italic === "Yes") captionNode.toggleFormat("italic");

          // carry over CSS (size, color, family, spacing)
          captionNode.setStyle(cssFromCaptionStyle(CaptionStyle_));
            newCaptionContainer.append(newLabelNode);
            newCaptionContainer.append($createTextNode(" "));
            newCaptionContainer.append(captionNode);
            // tableNode.insertBefore(newCaptionContainer);
          }
        const hasCaption = tableNode.__isCaption === true
        if(hasCaption){
          index1++;
        }
      });
    }
    });

    tableCount++;
    localStorage.setItem("tableCount", tableCount.toString());
    setTimeout(() => {
      handleSaveTable();
    }, 50);

    onClose?.();
  };

  return (
    <>
      <TextInput
        placeholder="# of rows (1-500)"
        label="Rows"
        onChange={setRows}
        value={rows}
        type="number"
      />
      <TextInput
        placeholder="# of columns (1-20)"
        label="Columns"
        onChange={setColumns}
        value={columns}
        type="number"
      />
      {enableCaptions &&
        <TextInput
          placeholder="Enter table caption"
          label={`Caption`}
          value={caption}
          onChange={setCaption}
        />}
      <DialogActions>
        <Button disabled={isDisabled} onClick={onAddTable}>
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}
