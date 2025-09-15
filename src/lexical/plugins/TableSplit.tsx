import { useEffect } from 'react';
import {
  LexicalEditor,
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $insertNodes,
} from 'lexical';
import {
  TableNode,
  TableRowNode,
  $createTableNode,
} from '../nodes/CustomTableNode/src';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import $ from 'jquery'; 
import { $createPageBreakNode } from '../nodes/PageBreakNode';

type UseTableAutoSplitProps = {
    parsedHtml: any
  editor: LexicalEditor;
  blocksPerPage?: number; // default is 30
};

export function useSplitTableByVisualPage({
  parsedHtml,
  editor,
}: UseTableAutoSplitProps) {
  const PAGE_HEIGHT = 50;

  useEffect(() => {
    const checkAndSplitTables = () => {
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        children.forEach((node) => {
          if (!(node instanceof TableNode)) return;

          const domNode = editor.getElementByKey(node.getKey());
          if (!domNode) return;

          const height = $(domNode).outerHeight() ?? 0;
          const overflow = height - PAGE_HEIGHT;

          console.log("Table height in pixels:", height, "Overflow:", overflow);

          if (overflow > 0) {
            // Calculate approx. number of rows to keep
            const rows = node.getChildren<TableRowNode>();
            const totalRows = rows.length;
            if (totalRows <= 1) return;

            const avgRowHeight = height / totalRows;
            const rowsFit = Math.floor(PAGE_HEIGHT / avgRowHeight);

            const rowsToMove = rows.slice(rowsFit);

            editor.update(() => {
              const newTableNode = $createTableNode();

              rowsToMove.forEach((row) => {
                row.remove();
                newTableNode.append(row);
              });

              const separator = $createParagraphNode();
              node.insertAfter(newTableNode);
              // separator.insertAfter(newTableNode);
              newTableNode.insertAfter($createParagraphNode()).selectEnd();
            });
          }
        });
      });
    };

    // Use slight delay to allow DOM to render
    setTimeout(checkAndSplitTables, 100); 
  }, [editor, parsedHtml]);
}


export function TableAutoSplitPlugin(parsedHtml:any) {
  const [editor] = useLexicalComposerContext();
  useSplitTableByVisualPage({ parsedHtml,editor, blocksPerPage: 1 });
  return null;
}