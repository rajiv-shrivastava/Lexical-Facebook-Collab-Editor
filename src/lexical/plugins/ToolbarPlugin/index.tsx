import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from '@lexical/code';
import { $createLinkNode, $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { INSERT_EMBED_COMMAND } from '@lexical/react/LexicalAutoEmbedPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingTagType,
} from '../../nodes/Heading-node-custom';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from '@lexical/selection';
import { $isTableNode } from '../../nodes/CustomTableNode/src';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $createTextNode,
  $getNodeByKey,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  KEY_TAB_COMMAND,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  OUTDENT_CONTENT_COMMAND,
  PASTE_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { Dispatch, useCallback, useEffect, useState } from 'react';
import * as React from 'react';
import useModal from '../../hooks/useModal';
import DropDown, { DropDownItem } from '../../ui/DropDown';
import DropdownColorPicker from '../../ui/DropdownColorPicker';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { sanitizeUrl } from '../../utils/url';
import { EmbedConfigs } from '../AutoEmbedPlugin';
import { INSERT_COLLAPSIBLE_COMMAND } from '../CollapsiblePlugin';
import {
  INSERT_IMAGE_COMMAND,
  InsertImageDialog,
  InsertImagePayload,
} from '../ImagesPlugin';
import { InsertInlineImageDialog } from '../InlineImagePlugin';
import InsertLayoutDialog from '../LayoutPlugin/InsertLayoutDialog';
import PageBreakPlugin from '../PageBreakPlugin';
import { InsertPollDialog } from '../PollPlugin';
import { generateStableCaptionId, InsertTableDialog } from '../TablePlugin';
import FontSize from './fontSize';
import { IS_APPLE } from '../../utils/environment';
import { INSERT_ENDNOTE } from '../EndNotesPlugin';
import Download from "../../images/icons/Download-svg.svg"
import upload from "../../images/icons/upload.svg"
import generateWord from '../MsWordGeneratePlugin';
import BulletListIcon from "../../images/icons/ul-list.svg";
import NumberedListIcon from "../../images/icons/ol-list.svg";
import endNotesIcon from "../../images/icons/endNote.svg"
import { MsWordPaste } from '../MsWordPastePlugin';
import TableOfContent from '../../images/icons/table-of-contents-svgrepo-com.svg'
import { handlePaste } from '../ImagesPlugin';
import { $createPageBreakNode, $isPageBreakNode, PageBreakNode } from '../../nodes/PageBreakNode';
import { removePTagInsideH1FromString } from '../../utils/editorstateHelper';
import { transformHeadings } from '../../utils/editorstateHelper';
// import HtmlToPdf from '../PdfGeneratePlugin';
import { $generateNodesFromDOM } from "@lexical/html";
import SymbolPlugin from '../SymbolPlugin';
import { $createFootnoteNode } from '../../nodes/FootNotes';
import footNotesIcon from '../../images/icons/FootNotes-svg.svg'
import { exportToWord } from './docsFIle';
import { ColoredNode } from '../../nodes/TableNode';
import { exportToPDF1 } from './PdfFile';
import { getSelectedPage } from '../../nodes/LayoutItemNode';
// import generatePdf from '../ExportPDFPlugin';


const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 1.1',
  h3: 'Heading 1.1.1',
  h4: 'Heading 1.1.1.1',
  h5: 'Cross-refrence Text',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

const rootTypeToRootName = {
  root: 'Root',
  table: 'Table',
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const FONT_FAMILY_OPTIONS: [string, string][] = [
  ['Arial', 'Arial'],
  ['Courier New', 'Courier New'],
  ['Georgia', 'Georgia'],
  ['Times New Roman', 'Times New Roman'],
  ['Trebuchet MS', 'Trebuchet MS'],
  ['Verdana', 'Verdana'],
];

const FONT_SIZE_OPTIONS: [string, string][] = [
  ['10px', '10px'],
  ['11px', '11px'],
  ['12px', '12px'],
  ['13px', '13px'],
  ['14px', '14px'],
  ['15px', '15px'],
  ['16px', '16px'],
  ['17px', '17px'],
  ['18px', '18px'],
  ['19px', '19px'],
  ['20px', '20px'],
];

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, ''>]: {
    icon: string;
    iconRTL: string;
    name: string;
  };
} = {
  center: {
    icon: 'center-align',
    iconRTL: 'center-align',
    name: 'Center Align',
  },
  end: {
    icon: 'right-align',
    iconRTL: 'left-align',
    name: 'End Align',
  },
  justify: {
    icon: 'justify-align',
    iconRTL: 'justify-align',
    name: 'Justify Align',
  },
  left: {
    icon: 'left-align',
    iconRTL: 'left-align',
    name: 'Left Align',
  },
  right: {
    icon: 'right-align',
    iconRTL: 'right-align',
    name: 'Right Align',
  },
  start: {
    icon: 'left-align',
    iconRTL: 'right-align',
    name: 'Start Align',
  },
};

function dropDownActiveClass(active: boolean) {
  if (active) {
    return 'active dropdown-item-active';
  } else {
    return '';
  }
}

function Divider(): JSX.Element {
  return <div className="divider" />;
}

function FontDropDown({
  editor,
  value,
  style,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: string;
  style: string;
  disabled?: boolean;
}): JSX.Element {
  const handleClick = useCallback(
    (option: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          $patchStyleText(selection, {
            [style]: option,
          });
        }
      });
    },
    [editor, style],
  );

  const buttonAriaLabel =
    style === 'font-family'
      ? 'Formatting options for font family'
      : 'Formatting options for font size';

  return (
    <DropDown
      disabled={disabled}
      buttonClassName={'toolbar-item ' + style}
      buttonLabel={value}
      buttonIconClassName={
        style === 'font-family' ? 'icon block-type font-family' : ''
      }
      buttonAriaLabel={buttonAriaLabel}>
      {(style === 'font-family' ? FONT_FAMILY_OPTIONS : FONT_SIZE_OPTIONS).map(
        ([option, text]) => (
          <DropDownItem
            className={`item ${dropDownActiveClass(value === option)} ${style === 'font-size' ? 'fontsize-item' : ''
              }`}
            onClick={() => handleClick(option)}
            key={option}>
            <span className="text">{text}</span>
          </DropDownItem>
        ),
      )}
    </DropDown>
  );
}

function ElementFormatDropdown({
  editor,
  value,
  isRTL,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || 'left'];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption.name}
      buttonIconClassName={`icon ${isRTL ? formatOption.iconRTL : formatOption.icon
        }`}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment">
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="item">
        <i className="icon left-align" />
        <span className="text">Left Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="item">
        <i className="icon center-align" />
        <span className="text">Center Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="item">
        <i className="icon right-align" />
        <span className="text">Right Align</span>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
        }}
        className="item">
        <i className="icon justify-align" />
        <span className="text">Justify Align</span>
      </DropDownItem>
    </DropDown>
  );
}

export default function ToolbarPlugin({
  setIsLinkEditMode,
  onlUser,
  styleConfig,
  showComments,
  setShowComments,
  showTabContentBtn,
  setshowTabContentBtn,
  showTabContent,
  parsedHtmlString,
  enableCaptions,
  showPdf,
  userOnline,
  wpAndTaskId,
  editorTitle,
  showCommentPlugin,
  exportToPDF,
  editId,
  landscape,
  setLandscape,
  ispagebreakOn,
  showFootNoteOption = false,
  showPagination,
  enableTable = true,
  setpdfExport,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
  onlUser: any;
  styleConfig: any;
  showComments: boolean;
  setshowTabContentBtn: any;
  setShowComments: Dispatch<boolean>;
  showTabContent: boolean;
  showTabContentBtn: boolean;
  parsedHtmlString: any;
  enableCaptions: any,
  showPdf: boolean,
  editorTitle: string,
  userOnline: any,
  wpAndTaskId: any,
  showCommentPlugin?: any,
  exportToPDF?: any
  editId: any;
  landscape: any
  setLandscape?: any,
  ispagebreakOn: boolean,
  showFootNoteOption?: boolean,
  showPagination?: boolean,
  enableTable?: boolean,
  setpdfExport?: any
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [rootType, setRootType] =
    useState<keyof typeof rootTypeToRootName>('root');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );
  const [fontSize, setFontSize] = useState<string>('14.5px');
  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [modal, showModal] = useModal();
  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>('');
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [currentElementClick, setcurrentElementClick] = useState<any>("");
  const [currentElementSelect, setcurrentElementSelect] = useState<any>("");
  const [isenterPressed, setIsEnterPressed] = useState("");
  const [passedContent, setpassedContent] = useState("");
  const [block, setBlock] = useState(true);
  const [htmlPasteModalOpen, sethtmlPasteModalOpen] = useState(false);
  const [getPageTotal, setPageTotal] = useState('1')
  const [CurrentPage, setCurrentPage] = useState<string>('1')
  const LowPriority = 1;

  const { heading } = styleConfig || {};
  const pageRef = React.useRef<any>(null)
  const LayoutRef = React.useRef<any>(null)
  const CaptionStyle = styleConfig?.heading?.filter((item : any) => item.title === 'Captions')
  const CaptionStyle_ = CaptionStyle && CaptionStyle[0];
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEnterPressed((prev) => prev + 1);
    }
  };
  const isFirefox = typeof navigator !== "undefined" &&  navigator.userAgent.toLowerCase().includes("firefox");

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePaste1 = (
    event: any,
    editor: LexicalEditor
  ) => {
    //@ts-ignore
    const data = event.clipboardData || window.clipboardData;
    const pastedHTML = data?.getData('text/html');

    if (!pastedHTML) {
      return;
    }
    const modifiedHTML = removePTagInsideH1FromString(pastedHTML);
    const parser = new DOMParser();
    const dom = parser.parseFromString(modifiedHTML, 'text/html');

    const nodes = $generateNodesFromDOM(editor, dom);

    // Step 4: Insert nodes into Lexical editor
    editor.update(() => {
      const selection = $getSelection();
      if (selection) {
        $insertNodes(nodes);
      }
    });
    event.preventDefault();
  };


const pureHeadingPaste = (html: any) => {
    editor.update(() => {
      const convsertedHtml = transformHeadings(html)

      const parser = new DOMParser();
      const dom = parser.parseFromString(convsertedHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const paraNode = $createParagraphNode()
      $insertNodes(nodes);
      // $insertNodes([paraNode])
        if (enableCaptions) {
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
              } 
            }
             else {
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
    })
  }

  useEffect(() => {
    const unregisterCommand = editor.registerCommand(
      PASTE_COMMAND,
      (event) => {
        // @ts-ignore
        const data = event.clipboardData || window.clipboardData;
        const pastedHTML = data?.getData("text/html");
        const pastedText = data?.getData('text/plain');

        if (
          pastedHTML?.includes(
            `<meta http-equiv=Content-Type content="text/html; charset=utf-8">`
          ) &&
          pastedHTML?.includes("microsoft-com")
        ) {
          handlePaste(event as ClipboardEvent, editor, '', enableCaptions);
          return false;
        }

        if (/^https?:\/\/\S+$/.test(pastedText)) {
          event.preventDefault();
          editor.update(() => {
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(pastedText);
            const linkNode = $createLinkNode(pastedText);
            linkNode.append(textNode);
            paragraph.append(linkNode);
            $insertNodes([paragraph])
          });
          return true;
        }
        if (pastedHTML && !pastedHTML?.includes("Outline") && !pastedHTML?.includes(
          `<meta http-equiv=Content-Type content="text/html; charset=utf-8">`
        ) &&
          !pastedHTML?.includes("microsoft-com")) {
          pureHeadingPaste(pastedHTML)
          return true
        }

        if (pastedHTML?.includes("Outline")) {
          setpassedContent(pastedHTML);
          sethtmlPasteModalOpen(true);
          return true;
        } else {
          handlePaste1(event, editor)
          return true;
        }
      },
      LowPriority
    );
    // Cleanup function to unregister the command when the component unmounts or state changes
    return () => {
      unregisterCommand();
    };
  }, [block]);

  useEffect(() => {
    const handleUndo = () => {
      if (userOnline && userOnline.length > 1) {
        return true;
      } else {
        return false
      }
    };

    const handleRedo = () => {
      if (userOnline && userOnline.length > 1) {
        return true;
      } else {
        return false
      }
    };
    const undoUnregister = editor.registerCommand(
      UNDO_COMMAND,
      handleUndo,
      COMMAND_PRIORITY_HIGH
    );

    const redoUnregister = editor.registerCommand(
      REDO_COMMAND,
      handleRedo,
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      undoUnregister();
      redoUnregister();
    };
  }, [editor, userOnline]);
// layout code starrted


  // useEffect(()=>{
  //  setTimeout(()=>{
  //   landscape && AllPotrait(document.querySelector(`.content-editable-grid-${editId}`))
  //   landscape && console.log('function called')
  //  },10000)
  // },[])


  function AllPotrait(contentEditable: HTMLElement | null) {
  pageRef.current = null
  LayoutRef.current = 'potrait'
  if (!contentEditable || contentEditable.getAttribute("contenteditable") !== "true") {
    console.warn("No contenteditable element found or it is not editable.");
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.warn("No text is selected.");
    return;
  }

  const range = selection.getRangeAt(0);

  let selectedNode = range.startContainer as HTMLElement;
  while (selectedNode && selectedNode !== contentEditable && !selectedNode.hasAttribute?.("data-block-index")) {
    selectedNode = selectedNode.parentElement as HTMLElement;
  }

  if (!selectedNode || !selectedNode.hasAttribute("data-block-index")) {
    console.warn("No element with data-block-index found in selection.");
    return;
  }

  const targetIndex = selectedNode.getAttribute("data-block-index");
  if (!targetIndex) return;

  const allMatching = contentEditable.querySelectorAll(`[data-block-index]`);

  allMatching.forEach((el) => {
    const element = el as HTMLElement;

    if (element.closest('table') && element.tagName.toLowerCase() !== 'table') return;

    if (element.tagName.toLowerCase() === 'table') {
      // Only add potrait-tables to the table tag itself
      element.classList.remove('potrait');
      element.classList.add('potrait-tables');
      return;
    }

    // Only apply .potrait class if it's a block-level and not in a table
    const displayStyle = window.getComputedStyle(element).display;
    const isBlock = displayStyle === "block" || displayStyle === "flex" || displayStyle === "grid";

    if (isBlock) {
      element.classList.add('potrait');
      element.setAttribute('data-landscape', 'false');
    }
        if(el.tagName.toLowerCase() === 'figure'){
      el.classList.remove('header-js-landscape')
    }
  });
}

function AllLandScape(contentEditable: HTMLElement | null) {
  if (!contentEditable || contentEditable.getAttribute("contenteditable") !== "true") {
    console.warn("No contenteditable element found or it is not editable.");
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.warn("No text is selected.");
    return;
  }

  const range = selection.getRangeAt(0);

  let selectedNode = range.startContainer as HTMLElement;
  while (selectedNode && selectedNode !== contentEditable && !selectedNode.hasAttribute?.("data-block-index")) {
    selectedNode = selectedNode.parentElement as HTMLElement;
  }

  if (!selectedNode || !selectedNode.hasAttribute("data-block-index")) {
    console.warn("No element with data-block-index found in selection.");
    return;
  }

  const targetIndex = selectedNode.getAttribute("data-block-index");
  if (!targetIndex) return;

  const allMatching = contentEditable.querySelectorAll(`[data-block-index]`);
  LayoutRef.current = 'landscape'
  allMatching.forEach((el) => {
    const element = el as HTMLElement;

    const displayStyle = window.getComputedStyle(element).display;
    const isBlock = displayStyle === "block" || displayStyle === "flex" || displayStyle === "grid";

    if (isBlock) {
    element.classList.remove('potrait')
    element.classList.remove('potrait-tables')
    element.setAttribute('data-landscape','true')
    }

    if(el.tagName.toLowerCase() === 'figure'){
      el.classList.add('header-js-landscape')
    }
  });
}


function currentPotrait(contentEditable: HTMLElement | null) {
  pageRef.current = null
  LayoutRef.current = 'potrait'
  if (!contentEditable || contentEditable.getAttribute("contenteditable") !== "true") {
    console.warn("No contenteditable element found or it is not editable.");
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.warn("No text is selected.");
    return;
  }

  const range = selection.getRangeAt(0);

  // Traverse up to find the element with data-block-index
  let selectedNode = range.startContainer as HTMLElement;
  while (selectedNode && selectedNode !== contentEditable && !selectedNode.hasAttribute?.("data-block-index")) {
    selectedNode = selectedNode.parentElement as HTMLElement;
  }

  if (!selectedNode || !selectedNode.hasAttribute("data-block-index")) {
    console.warn("No element with data-block-index found in selection.");
    return;
  }

  const targetIndex = selectedNode.getAttribute("data-block-index");
  if (!targetIndex) return;

  const allMatching = contentEditable.querySelectorAll(`[data-block-index="${targetIndex}"]`);

  allMatching.forEach((el) => {
    const element = el as HTMLElement;

    // If element is inside a table, skip it
    if (element.closest('table') && element.tagName.toLowerCase() !== 'table') return;

    if (element.tagName.toLowerCase() === 'table') {
      // Only add potrait-tables to the table tag itself
      element.classList.remove('potrait');
      element.classList.add('potrait-tables');
      return;
    }

    // Only apply .potrait class if it's a block-level and not in a table
    const displayStyle = window.getComputedStyle(element).display;
    const isBlock = displayStyle === "block" || displayStyle === "flex" || displayStyle === "grid";

    if (isBlock) {
      activeEditor.update(()=>{
              const paragraph = $createParagraphNode();
      const spaceTextNode = $createTextNode(" ");
      paragraph.append(spaceTextNode);

      const root = $getRoot();
      root.append(paragraph);

      paragraph.remove();
      })
      element.classList.add('potrait');
      element.setAttribute('data-landscape', 'false');
    }
        if(el.tagName.toLowerCase() === 'figure'){
      el.classList.remove('header-js-landscape')
    }
  });
}

  const potrait = () =>{
    editor.update(()=>{
      const divNode = getSelectedPage()
      if(divNode){
        divNode.removeClassName('custom-landscape')
      }
    })
  }

    function currentLandScape(contentEditable: HTMLElement | null) {
  if (!contentEditable || contentEditable.getAttribute("contenteditable") !== "true") {
    console.warn("No contenteditable element found or it is not editable.");
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    console.warn("No text is selected.");
    return;
  }

  const range = selection.getRangeAt(0);

  // Traverse up to find the element with data-block-index
  let selectedNode = range.startContainer as HTMLElement;
  while (selectedNode && selectedNode !== contentEditable && !selectedNode.hasAttribute?.("data-block-index")) {
    selectedNode = selectedNode.parentElement as HTMLElement;
  }

  if (!selectedNode || !selectedNode.hasAttribute("data-block-index")) {
    console.warn("No element with data-block-index found in selection.");
    return;
  }

  const targetIndex = selectedNode.getAttribute("data-block-index");
  pageRef.current = targetIndex
  LayoutRef.current = 'landscape'
  if (!targetIndex) return;

  const allMatching = contentEditable.querySelectorAll(`[data-block-index="${targetIndex}"]`);

  allMatching.forEach((el) => {
    const element = el as HTMLElement;

    // Only apply styles if the element is block-level
    const displayStyle = window.getComputedStyle(element).display;
    const isBlock = displayStyle === "block" || displayStyle === "flex" || displayStyle === "grid";

    if (isBlock) {
    element.classList.remove('potrait')
    element.classList.remove('potrait-tables')
    element.setAttribute('data-landscape','true')
    }

        if(el.tagName.toLowerCase() === 'figure'){
      el.classList.add('header-js-landscape')
    }
  });
}

  const Landscape = ()=>{
    editor.update(()=>{
      const htmlString = `<div class="custom-div" style="border: 1px solid rgb(170, 170, 170); margin: 10px 0px 10px 8.5%; box-shadow: rgb(238, 238, 238) 0px -10px 0px 0px, rgb(238, 238, 238) 0px 10px 0px 0px; padding: 96px; min-height: 1000px; max-width: 816px;"><input type="text" class="Header-Input" id="header"><input type="text" class="Footer-Input" id="footer"><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">text inside page</span></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><br></p></div>`
      const dom = new DOMParser()
      const parser = dom.parseFromString(htmlString, 'text/html');
      const nodes = $generateNodesFromDOM(editor, parser);
      // $insertNodes(nodes)

      const selection = $getSelection();
      if($isRangeSelection(selection)){
        console.log('dfghfdgfdg',selection)
        const divNode = getSelectedPage()
        if(divNode){
          divNode.setClassName('custom-landscape')
        }
      }
    })
  }
// layout code ended
  
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      selection.getNodes().forEach((node) => {
        const dom = editor.getElementByKey(node.getLatest().__key);
        if (!dom) return
        const pageNumber = dom.getAttribute('data-block-index') ?
          dom.getAttribute('data-block-index') :
          (dom as HTMLElement | any).parentElement.getAttribute('data-block-index')
        setCurrentPage(pageNumber)
        if(pageNumber === pageRef.current && LayoutRef.current === 'landscape'){
                            setTimeout(() => {
           applyLandscapeByIndex(document.querySelector(`.content-editable-grid-${editId}`),pageRef.current)

        }, 100);
        }
         if(pageNumber === pageRef.current && LayoutRef.current === 'potrait'){
          applyPotraitByIndex(document.querySelector(`.content-editable-grid-${editId}`),pageRef.current)
        }
      })
    }

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
            const parent = e.getParent();
            return parent !== null && $isRootOrShadowRoot(parent);
          });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType('table');
      } else {
        setRootType('root');
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : '',
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '15px'),
      );
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000'),
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff',
        ),
      );
      setFontFamily(
        $getSelectionStyleValueForProperty(selection, 'font-family', 'Arial'),
      );
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }
      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || 'left',
      );
    }
  }, [activeEditor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setIsEnterPressed("");
        const nodeNumber = $getSelection()?.getNodes()[0].__parent;
        const editorNodes = editor.getEditorState()._nodeMap;

        let nodesArrTemp: LexicalNode[] = []
        editorNodes.forEach((value, key) => {
          if (key === nodeNumber) {
            //@ts-ignore
            return setcurrentElementSelect(value.__tag);
          }
        });
        $updateToolbar();
        setActiveEditor(newEditor);
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);


  function totalPages() {

    const container = document.querySelector(`.content-editable-grid-${editId}`);
    setTimeout(() =>{
          
    if (container) {
      const blockEnds = container.querySelectorAll(".block-end");
      setPageTotal(`${blockEnds.length}`)

      if (blockEnds.length === 0) return;

      const total = blockEnds.length;

      const seenPageIndexes = new Set<number>();

      blockEnds.forEach((el, index) => {
        // Always set data-total
        el.setAttribute('data-total', String(total));
        // Only set data-page-number once per unique index
        if (!seenPageIndexes.has(index)) {
          el.setAttribute('data-page-number', String(index + 1));
          seenPageIndexes.add(index);
        }
      });

    }
    }, 50)
  }
  useEffect(() => {
    return mergeRegister(
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
          totalPages();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          if (userOnline && userOnline.length > 1) {
            setCanUndo(true)
          } else {

            setCanUndo(payload);
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === 'KeyK' && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url: string | null;
          if (!isLink) {
            setIsLinkEditMode(true);
            url = sanitizeUrl('https://');
          } else {
            setIsLinkEditMode(false);
            url = null;
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);


  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: 'historic' } : {},
      );
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement
            let textNode = node;
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode;
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode;
            }

            if (textNode.__style !== '') {
              textNode.setStyle('');
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat('');
            }
            node = textNode;
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('');
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ 'background-color': value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl('https://'));
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink, setIsLinkEditMode]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );
  const insertGifOnClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
  };

  const formatNumberedList = () => {
    if (blockType !== 'number') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
  };

  const formatBulletList = () => {
    editor.focus();
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const insertFootnote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const context = anchorNode.getTextContent();
        const cursorOffset = selection.anchor.offset;
        const pageNumberElem = editor.getElementByKey(anchorNode.getKey());
        let pageNumber = '';
        if (pageNumberElem) {
          pageNumber = pageNumberElem.getAttribute('data-block-index') ?? '';
        }
        const idInput = [context, cursorOffset, pageNumber].join(':');
        const footnote = $createFootnoteNode(idInput, 'footnote highlighted-footnote', pageNumber);
        selection.insertNodes([footnote]);
      }
    });
  }, [editor]);

  const pageNumber = parseInt(CurrentPage, 10);
  const displayPage = !Number.isNaN(pageNumber) ? pageNumber : 1;
 useEffect(() => {
  if(showPagination){
    totalPages()}
  },[showPagination])
function applyLandscapeByIndex(contentEditable: HTMLElement | null, targetIndex: string) {

  if (!contentEditable) {
    console.warn("No contentEditable element provided.");
    return;
  }

  const allMatching = contentEditable.querySelectorAll(`[data-block-index="${targetIndex}"]`);

  if (allMatching.length === 0) {
    return;
  }

  allMatching.forEach((el) => {
    const element = el as HTMLElement;

    const displayStyle = window.getComputedStyle(element).display;
    const isBlock = displayStyle === "block" || displayStyle === "flex" || displayStyle === "grid";

    if (isBlock) {
      element.classList.remove("potrait");
      element.classList.remove("potrait-tables");
      element.setAttribute("data-landscape", "true");
    }
  });

  // Special case for index 1
  if (targetIndex === "1") {
    const inputElement = document.querySelector('input[data-block-index="1"]') as HTMLElement | null;
    const footerInput = document.querySelector("#footer") as HTMLElement | null;

    if (inputElement) {
      inputElement.classList.remove("potrait");
      inputElement.setAttribute("data-landscape", "true");
      inputElement.style.marginLeft = "0";
    }

    if (footerInput) {
      footerInput.classList.remove("potrait");
      footerInput.setAttribute("data-landscape", "true");
      footerInput.style.marginLeft = "0";
    }
    
  }
}


// function applyPotraitByIndex(contentEditable: HTMLElement | null, targetIndex: string) {

//   if (!contentEditable) {
//     console.warn("No contentEditable element provided.");
//     return;
//   }

//   const allMatching = contentEditable.querySelectorAll(`[data-block-index="${targetIndex}"]`);

//   if (allMatching.length === 0) {
//     return;
//   }

//   allMatching.forEach((el) => {
//     const element = el as HTMLElement;

//     const displayStyle = window.getComputedStyle(element).display;
//     const isBlock = displayStyle === "block" || displayStyle === "flex" || displayStyle === "grid";

//     if (isBlock) {
//       element.classList.add("potrait");
//       element.classList.add("potrait-tables");
//       element.setAttribute("data-landscape", "true");
//     }
//   });

//   // Special case for index 1
//   if (targetIndex === "1") {
//     const inputElement = document.querySelector('input[data-block-index="1"]') as HTMLElement | null;
//     const footerInput = document.querySelector("#footer") as HTMLElement | null;

//     if (inputElement) {
//       inputElement.classList.add("potrait");
//       inputElement.setAttribute("data-landscape", "true");
//       inputElement.style.marginLeft = "240px";
//     }

//     // if (footerInput) {
//     //   footerInput.classList.add("potrait");
//     //   footerInput.setAttribute("data-landscape", "true");
//     //   footerInput.style.marginLeft = "0";
//     // }
    
//   }
//   // layout code ended
// }

function applyPotraitByIndex(contentEditable: HTMLElement | null, targetIndex: string) {
  if (!contentEditable) {
    console.warn("No contentEditable element provided.");
    return;
  }

  const allElements = contentEditable.querySelectorAll<HTMLElement>('[data-block-index]');
  
  allElements.forEach((element) => {
    const index = element.getAttribute("data-block-index");
    const displayStyle = window.getComputedStyle(element).display;
    const isBlock = displayStyle === "block" || displayStyle === "flex" || displayStyle === "grid";

    if (!isBlock) return;

    if (index === targetIndex) {
      // Keep classes and set landscape attribute
      element.setAttribute("data-landscape", "true");
    } else {
      // Remove portrait styles from all other elements
      element.classList.remove("potrait");
      element.classList.remove("potrait-tables");
      element.removeAttribute("data-landscape");
    }
  });

  // Special case for index 1
  if (targetIndex === "1") {
    const inputElement = document.querySelector('input[data-block-index="1"]') as HTMLElement | null;
    const footerInput = document.querySelector("#footer") as HTMLElement | null;

    if (inputElement) {
      inputElement.setAttribute("data-landscape", "true");
      inputElement.style.marginLeft = "0";
    }

    if (footerInput) {
      footerInput.setAttribute("data-landscape", "true");
      footerInput.style.marginLeft = "0";
    }
  }
}

  return (
    <div className="toolbar">
      {showTabContent && (
        <button
          disabled={false}
          onClick={() => {
            setshowTabContentBtn(!showTabContentBtn);
          }}
          title={"Table of Conetent"}
          type="button"
          className="toolbar-item spaced"
          aria-label="table-of-content"
        >
          <img src={TableOfContent} width={16} height={16} />
        </button>
      )}
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          if (userOnline && userOnline.length > 1) {
            setCanUndo(false);
          } else {
            activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
          }
        }}
        title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
        type="button"
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <i className="format undo" />
      </button>
      <button
        disabled={!canRedo || !isEditable}
        onClick={() => {
          if (userOnline && userOnline.length > 1) {
            setCanRedo(false);
          } else {
            activeEditor.dispatchCommand(REDO_COMMAND, undefined);
          }
        }}
        title={IS_APPLE ? "Redo (⌘Y)" : "Redo (Ctrl+Y)"}
        type="button"
        className="toolbar-item"
        aria-label="Redo"
      >
        <i className="format redo" />
      </button>
      {blockType === "code" ? (
        <DropDown
          disabled={!isEditable}
          buttonClassName="toolbar-item code-language"
          buttonLabel={getLanguageFriendlyName(codeLanguage)}
          buttonAriaLabel="Select language"
        >
          {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
            return (
              <DropDownItem
                className={`item ${dropDownActiveClass(
                  value === codeLanguage
                )}`}
                onClick={() => onCodeLanguageSelect(value)}
                key={value}
              >
                <span className="text">{name}</span>
              </DropDownItem>
            );
          })}
        </DropDown>
      ) : (
        <>
          <Divider />
          <FontSize
            selectionFontSize={fontSize.slice(0, -2)}
            editor={editor}
            disabled={!isEditable}
            styleConfig={styleConfig}
            blockType={"h1"}
            isenterPressed={isenterPressed}
            currentElementClick={currentElementClick}
            currentElementSelect={currentElementSelect}
            wpAndTaskId={wpAndTaskId}
          />
          <Divider />
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={"toolbar-item spaced " + (isBold ? "active" : "")}
            title={IS_APPLE ? "Bold (⌘B)" : "Bold (Ctrl+B)"}
            type="button"
            aria-label={`Format text as bold. Shortcut: ${IS_APPLE ? "⌘B" : "Ctrl+B"
              }`}
          >
            <i className="format bold" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={"toolbar-item spaced " + (isItalic ? "active" : "")}
            title={IS_APPLE ? "Italic (⌘I)" : "Italic (Ctrl+I)"}
            type="button"
            aria-label={`Format text as italics. Shortcut: ${IS_APPLE ? "⌘I" : "Ctrl+I"
              }`}
          >
            <i className="format italic" />
          </button>
          <button
            disabled={!isEditable}
            onClick={() => {
              activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
            title={IS_APPLE ? "Underline (⌘U)" : "Underline (Ctrl+U)"}
            type="button"
            aria-label={`Format text to underlined. Shortcut: ${IS_APPLE ? "⌘U" : "Ctrl+U"
              }`}
          >
            <i className="format underline" />
          </button>
          {/* Page Orientation code do not remove this */}
          {landscape && <Divider />}
          {/* this is code for Portrait and Landscape */}
         {landscape && 
                      <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel=""
            buttonAriaLabel="Insert specialized editor node"
            buttonIconClassName="icon dropdown-rotate"
          >
            {/* <DropDownItem
              onClick={() => {
                console.log(landscape, "pop");
                setLandscape(false);
              }}
              className="item"
            >
              <div>Potrait</div>
            </DropDownItem>
             <DropDownItem
              onClick={() => {
              AllLandScape(document.querySelector(`.content-editable-grid-${editId}`))
              }}
              className="item"
            >
              <div>Landscape</div>
            </DropDownItem>             */}
            <DropDownItem
              onClick={() => {
                // currentPotrait(document.querySelector(`.content-editable-grid-${editId}`))
                potrait()
              }}
              className="item"
            >
              <div>Page potrait</div>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
              //  currentLandScape(document.querySelector(`.content-editable-grid-${editId}`))
              Landscape()
              }}
              className="item"
            >
              <div>Page landscape</div>
            </DropDownItem>
          </DropDown>
            } 
          {landscape && <Divider />}
          {/* Page Orientation code do not remove this */}
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel=""
            buttonAriaLabel="Formatting options for additional text styles"
            buttonIconClassName="icon dropdown-more"
          >
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  FORMAT_TEXT_COMMAND,
                  "strikethrough"
                );
              }}
              className={"item " + dropDownActiveClass(isStrikethrough)}
              title="Strikethrough"
              aria-label="Format text with a strikethrough"
            >
              <i className="icon strikethrough" />
              <span className="text">Strikethrough</span>
            </DropDownItem>
                            <DropDownItem
                  onClick={() => {
                    showModal('Insert Columns Layout', (onClose) => (
                      <InsertLayoutDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}
                  className="item">
                  <i className="icon columns" />
                  <span className="text">Columns Layout</span>
                </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
              }}
              className={"item " + dropDownActiveClass(isSubscript)}
              title="Subscript"
              aria-label="Format text with a subscript"
            >
              <i className="icon subscript" />
              <span className="text">Subscript</span>
            </DropDownItem>
            <DropDownItem
              onClick={() => {
                activeEditor.dispatchCommand(
                  FORMAT_TEXT_COMMAND,
                  "superscript"
                );
              }}
              className={"item " + dropDownActiveClass(isSuperscript)}
              title="Superscript"
              aria-label="Format text with a superscript"
            >
              <i className="icon superscript" />
              <span className="text">Superscript</span>
            </DropDownItem>
          </DropDown>
          <Divider />
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item spaced"
            buttonLabel="Insert"
            buttonAriaLabel="Insert specialized editor node"
            buttonIconClassName="icon plus"
          >
            <DropDownItem
              onClick={() => {
                showModal("Insert Image", (onClose) => (
                  <InsertImageDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                    enableCaptions={false}
                  />
                ));
              }}
              className="item"
            >
              <i className="icon image" />
              <span className="text">Image</span>
            </DropDownItem>
            {ispagebreakOn &&
              <DropDownItem
                className="item addPage"
                onClick={() => {
                  (document.querySelector('.addPage') as HTMLElement | null)?.click();
                }}
              >
                <i className="icon page-break" />
                <span className="text">Page Break</span>
              </DropDownItem>
            }

            {enableTable && 
                        <DropDownItem
              onClick={() => {
                showModal("Insert Table", (onClose) => (
                  <InsertTableDialog
                    activeEditor={activeEditor}
                    onClose={onClose}
                    enableCaptions={enableCaptions}
                    styleConfig={styleConfig}
                  />
                ));
              }}
              className="item"
            >
              <i className="icon table" />
              <span className="text">Table</span>
            </DropDownItem>}

            <DropDownItem
              className="item"
              onClick={() => {
                formatBulletList();
              }}
            >
              <img src={BulletListIcon} height={21} width={21} />
              <span style={{ marginLeft: "10px", marginTop: "2px" }}>
                Bullet List
              </span>
            </DropDownItem>

            <DropDownItem
              className="item"
              onClick={() => {
                formatNumberedList();
              }}
            >
              <img src={NumberedListIcon} height={21} width={21} />
              <span style={{ marginLeft: "10px", marginTop: "2px" }}>
                Numbered List
              </span>
            </DropDownItem>
            {showFootNoteOption &&
              <DropDownItem
                className="item"
                onClick={() => { insertFootnote() }}
              >
                <img src={footNotesIcon} height={21} width={21} />
                <span style={{ marginLeft: "10px", marginTop: "2px" }}>
                  FootNotes
                </span>
              </DropDownItem>}
            <DropDownItem
              className='item'
              onClick={() => editor.dispatchCommand(INSERT_ENDNOTE, undefined)}>
              <img src={endNotesIcon} height={21} width={21} />
              <span style={{ marginLeft: "10px", marginTop: "2px" }}> EndNotes </span>
            </DropDownItem>
          </DropDown>
          <SymbolPlugin />
        </>
      )}
      {showCommentPlugin &&
        <>
          <Divider />
          <button
            className={`toolbar-item ${showComments ? "active" : ""}`}
            onClick={() => {
              setShowComments(!showComments);
            }}
            title={showComments ? "Hide Comments" : "Show Comments"}
          >
            <i className="comments" />
          </button>
        </>}
      <Divider />
      <MsWordPaste
        passedContent={passedContent}
        source={"remote"}
        onPaste={null}
        htmlPasteModalOpen={htmlPasteModalOpen}
        sethtmlPasteModalOpen={sethtmlPasteModalOpen}
        onlUser={onlUser}
        collabApiKey={""}
      />
      <DropDown
        disabled={!isEditable}
        buttonClassName="toolbar-item spaced"
        buttonLabel="Export"
        buttonAriaLabel="Insert specialized editor node"
      >
        <DropDownItem
          onClick={async () => {
            const today = new Date();
            const formattedDate = today?.toISOString()?.split("T")[0];
            const customTitle = `${editorTitle}-${formattedDate}`;
            exportToWord(editor, customTitle, parsedHtmlString, false);
          }}
          className="item"
        >
          <div
            className="div"
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              width={15}
              height={15}
              src={Download}
              alt=""
              style={{ marginRight: "10px" }}
            />
            <span className="text">Word</span>
          </div>
        </DropDownItem>
        {showPdf && (
          <DropDownItem onClick={() =>
           isFirefox ? exportToPDF() : exportToPDF1(editId,editorTitle,parsedHtmlString,setpdfExport,landscape)
          } className="item">
            <div
              className="div"
              style={{ display: "flex", alignItems: "center" }}
            >
              <img
                width={15}
                height={15}
                src={Download}
                alt=""
                style={{ marginRight: "10px" }}
              />
              <span className="text">Pdf</span>
            </div>
          </DropDownItem>
        )}
      </DropDown>
      <ElementFormatDropdown
        disabled={!isEditable}
        value={elementFormat}
        editor={editor}
        isRTL={isRTL}
      />
      {/* <PageBreakPlugin/> */}
      {ispagebreakOn && <button
        style={{ display: "none" }}
        id="pagination"
        onClick={() => {
          PageBreakPlugin(editor);
        }}
      ></button>}
      <div className="flex-container-onluser">{onlUser}</div>
      
      {showPagination && <p className='total-pages'>{`${displayPage} of ${ getPageTotal} Pages`}</p>}

      {modal}
    </div>
  );
}
