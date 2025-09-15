/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {TableCellNode} from './LexicalTableCellNode';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical';

import {addClassNamesToElement, isHTMLElement} from '@lexical/utils';
import {
  $applyNodeReplacement,
  $getNearestNodeFromDOMNode,
  ElementNode,
} from 'lexical';

import {$isTableCellNode} from './LexicalTableCellNode';
import {TableDOMCell, TableDOMTable} from './LexicalTableObserver';
import {$isTableRowNode, TableRowNode} from './LexicalTableRowNode';
import {getTable} from './LexicalTableSelectionHelpers';

export type SerializedTableNode = Spread<
  {
    isCaption: boolean;
    groupId: string;
  },
  SerializedElementNode
>;

/** @noInheritDoc */
export class TableNode extends ElementNode {
  __isCaption: boolean = true;
  __groupId: string = '';

  static getType(): string {
    return 'table';
  }

  static clone(node: TableNode): TableNode {
    return new TableNode(node.__key, node.__isCaption, node.__groupId);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      table: (_node: Node) => ({
        conversion: $convertTableElement,
        priority: 1,
      }),
    };
  }

  static importJSON(_serializedNode: SerializedTableNode): TableNode {
    return $createTableNode(_serializedNode.isCaption, _serializedNode.groupId);
  }

  constructor(key?: NodeKey, isCaption: boolean = true, groupId: string = '') {
    super(key);
    this.__isCaption = isCaption;
    this.__groupId = groupId;
  }

  exportJSON(): SerializedTableNode {
    return {
      ...super.exportJSON(),
      type: 'table',
      isCaption: this.__isCaption,
      groupId: this.__groupId,
      version: 1,
    };
  }

  createDOM(config: EditorConfig, editor?: LexicalEditor): HTMLElement {
    const tableElement = document.createElement('table');
    tableElement.setAttribute('data-table-caption', `${this.__isCaption}`);
    tableElement.setAttribute('data-table-id', `${this.__groupId}`);
    addClassNamesToElement(tableElement, config.theme.table);

    return tableElement;
  }

  updateDOM(): boolean {
    return false;
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    return {
      ...super.exportDOM(editor),
      after: (tableElement) => {
        if (tableElement) {
          const newElement = tableElement.cloneNode() as ParentNode;
          const colGroup = document.createElement('colgroup');
          const tBody = document.createElement('tbody');
          if (isHTMLElement(tableElement)) {
            tBody.append(...tableElement.children);
          }
          const firstRow = this.getFirstChildOrThrow<TableRowNode>();

          if (!$isTableRowNode(firstRow)) {
            throw new Error('Expected to find row node.');
          }

          const colCount = firstRow.getChildrenSize();

          for (let i = 0; i < colCount; i++) {
            const col = document.createElement('col');
            colGroup.append(col);
          }

          newElement.replaceChildren(colGroup, tBody);

          return newElement as HTMLElement;
        }
      },
    };
  }

  canBeEmpty(): false {
    return false;
  }

  isShadowRoot(): boolean {
    return true;
  }

  getIsCaption() : boolean | undefined {
    return this.__isCaption
  }

  setIsCaption(isCaption: boolean): void {
    const writable = this.getWritable();
    writable.__isCaption = isCaption;
  }

  getGroupId(): string {
    return this.__groupId;
  }

  setGroupId(groupId: string): void {
    const writable = this.getWritable();
    writable.__groupId = groupId;
  }

  getCordsFromCellNode(
    tableCellNode: TableCellNode,
    table: TableDOMTable,
  ): {x: number; y: number} {
    const {rows, domRows} = table;

    for (let y = 0; y < rows; y++) {
      const row = domRows[y];

      if (row == null) {
        continue;
      }

      const x = row.findIndex((cell) => {
        if (!cell) {
          return;
        }
        const {elem} = cell;
        const cellNode = $getNearestNodeFromDOMNode(elem);
        return cellNode === tableCellNode;
      });

      if (x !== -1) {
        return {x, y};
      }
    }

    throw new Error('Cell not found in table.');
  }

  getDOMCellFromCords(
    x: number,
    y: number,
    table: TableDOMTable,
  ): null | TableDOMCell {
    const {domRows} = table;

    const row = domRows[y];

    if (row == null) {
      return null;
    }

    const cell = row[x];

    if (cell == null) {
      return null;
    }

    return cell;
  }

  getDOMCellFromCordsOrThrow(
    x: number,
    y: number,
    table: TableDOMTable,
  ): TableDOMCell {
    const cell = this.getDOMCellFromCords(x, y, table);

    if (!cell) {
      throw new Error('Cell not found at cords.');
    }

    return cell;
  }

  getCellNodeFromCords(
    x: number,
    y: number,
    table: TableDOMTable,
  ): null | TableCellNode {
    const cell = this.getDOMCellFromCords(x, y, table);

    if (cell == null) {
      return null;
    }

    const node = $getNearestNodeFromDOMNode(cell.elem);

    if ($isTableCellNode(node)) {
      return node;
    }

    return null;
  }

  getCellNodeFromCordsOrThrow(
    x: number,
    y: number,
    table: TableDOMTable,
  ): TableCellNode {
    const node = this.getCellNodeFromCords(x, y, table);

    if (!node) {
      throw new Error('Node at cords not TableCellNode.');
    }

    return node;
  }

  canSelectBefore(): true {
    return true;
  }

  canIndent(): false {
    return false;
  }
}

export function $getElementForTableNode(
  editor: LexicalEditor,
  tableNode: TableNode,
): TableDOMTable {
  const tableElement = editor.getElementByKey(tableNode.getKey());

  if (tableElement == null) {
    throw new Error('Table Element Not Found');
  }

  return getTable(tableElement);
}

export function $convertTableElement(_domNode: Node): DOMConversionOutput {
   const domNode = _domNode as HTMLTableElement;

  let isCaption: boolean | undefined = undefined;
  let groupId: string | undefined = undefined;

  const captionAttr = domNode.getAttribute('data-table-caption');
  if (captionAttr === 'true' || captionAttr === 'false') {
    isCaption = captionAttr === 'true';
  }

  groupId = domNode.getAttribute('data-table-id') || '';

  return { node: $createTableNode(isCaption, groupId) };
}

export function $createTableNode(isCaption?: boolean, groupId: string = ''): TableNode {
  const node = new TableNode();
  if (isCaption !== undefined) {
    node.setIsCaption(isCaption);
  }
  node.setGroupId(groupId);
  return node;
}

export function $isTableNode(
  node: LexicalNode | null | undefined,
): node is TableNode {
  return node instanceof TableNode;
}
