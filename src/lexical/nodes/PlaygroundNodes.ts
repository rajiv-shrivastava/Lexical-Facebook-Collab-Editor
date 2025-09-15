/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {ParagraphNode, type Klass, type LexicalNode} from 'lexical';

import {CodeHighlightNode, CodeNode} from '@lexical/code';
import {HashtagNode} from '@lexical/hashtag';
import {AutoLinkNode, LinkNode} from '@lexical/link';
import {ListItemNode, ListNode} from '@lexical/list';
// import {MarkNode} from '@lexical/mark';
import {OverflowNode} from '@lexical/overflow';
import {HorizontalRuleNode} from '@lexical/react/LexicalHorizontalRuleNode';
// import {HeadingNode, QuoteNode} from '@lexical/rich-text';
import { QuoteNode,HeadingNode } from './Heading-node-custom';

import {CollapsibleContainerNode} from '../plugins/CollapsiblePlugin/CollapsibleContainerNode';
import {CollapsibleContentNode} from '../plugins/CollapsiblePlugin/CollapsibleContentNode';
import {CollapsibleTitleNode} from '../plugins/CollapsiblePlugin/CollapsibleTitleNode';
// import {AutocompleteNode} from './AutocompleteNode';
import {EmojiNode} from './EmojiNode';
import {FigmaNode} from './FigmaNode';
import {ImageNode} from './ImageNode';
import {InlineImageNode} from './InlineImageNode';
import {KeywordNode} from './KeywordNode';
import {LayoutContainerNode} from './LayoutContainerNode';
import {LayoutItemNode} from './LayoutItemNode';
import {MentionNode} from './MentionNode';
import {PageBreakNode} from './PageBreakNode';
import {PollNode} from './PollNode';
import {TweetNode} from './TweetNode';
// import {YouTubeNode} from './YouTubeNode';
import { ReferenceNode } from './ReferenceNode';
import { EndNoteNode } from './EndNoteNode';
import { ColoredNode } from './TableNode';
import { DividerTextNode } from './DividerTextNode';
import { MarkNode } from './lexical-mark-custom';
import { SpellErrorNode } from './SpellErrorNode';
import { NestedHeadingNode } from './Heading-node-custom/NestedHeading';
import { FootnoteNode } from './FootNotes';
import { TableCellNode, TableNode, TableRowNode } from './CustomTableNode/src';
import { SimpleInputNode } from './Header-Footer/HeaderNode';
const PlaygroundNodes: Array<Klass<LexicalNode>> = [
  MarkNode,
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  HashtagNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  OverflowNode,
  PollNode,
  ImageNode,
  InlineImageNode,
  MentionNode,
  EmojiNode,
  KeywordNode,
  HorizontalRuleNode,
  TweetNode,
  FigmaNode,
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
  PageBreakNode,
  LayoutContainerNode,
  LayoutItemNode,
  ReferenceNode,
  EndNoteNode,
  ColoredNode,
  ParagraphNode,
  DividerTextNode,
  SpellErrorNode,
  NestedHeadingNode,
  FootnoteNode,
  SimpleInputNode
];

export default PlaygroundNodes;
