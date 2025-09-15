
//@ts-nocheck
import React, { useState, useEffect, useRef, useMemo } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlaygroundHeader } from "./ui/PlaygroundHeader";
import { SharedHistoryContext } from "./context/SharedHistoryContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { generateStableCaptionId, TableContext } from "./plugins/TablePlugin";
import PlaygroundEditorTheme from "./themes/PlaygroundEditorTheme";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
// import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
// import EmojisPlugin from "./plugins/EmojisPlugin";
import EquationsPlugin from "./plugins/EquationsPlugin";
import ExcalidrawPlugin from "./plugins/ExcalidrawPlugin";
import FigmaPlugin from "./plugins/FigmaPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import ImagesPlugin, { generateStableImageCaptionId } from "./plugins/ImagesPlugin";
import InlineImagePlugin from "./plugins/InlineImagePlugin";
import KeywordsPlugin from "./plugins/KeywordsPlugin";
import { LayoutPlugin } from "./plugins/LayoutPlugin/LayoutPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import MarkdownShortcutPlugin from "./plugins/MarkdownShortcutPlugin";
// import MentionsPlugin from "./plugins/MentionsPlugin";
import PollPlugin from "./plugins/PollPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import TableCellResizer from "./plugins/TableCellResizer";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
// import TreeViewPlugin from "./plugins/TreeViewPlugin";
import TwitterPlugin from "./plugins/TwitterPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import ContentEditable from "./ui/ContentEditable";
import Placeholder from "./ui/Placeholder";
import { $generateNodesFromDOM } from "@lexical/html";
import { Sample } from "./sample"
import {
  fetchAllDocIds,
  fetchDocInitStateByDocId,
  fetchStateWithTimestamp,
  updateServerState,
} from "./http";

import {
  CodoxCollabPlugin,
  registerNodesWithCodox,
  CodoxCommentPlugin,
  validateStateStructure,
} from "./codoxCollab";
import "./index.css";
import useModal from "./hooks/useModal";

import Button from "./ui/Button";
import { CAN_USE_DOM } from "./utils/canUseDOM";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HeadingStyles } from "./HeadingStyles";
import ReferenceToolbar from "./plugins/CrossReferencePlugin/ReferenceToolbar";
import HashToolbarOpenerPlugin from "./plugins/CrossReferencePlugin/HashToolbarOpenerPlugin";
import CrossReferencePlugin from "./plugins/CrossReferencePlugin";
// import CommentPlugin from "./plugins/CommentPlugin";
import $ from "jquery";
import EndNotesPlugin from "./plugins/EndNotesPlugin";
// import { CommentStore } from "./commenting";
import SearchAndReplacePlugin from "./plugins/SearchAndReplacePlugin";
import { $isTableNode, TableCellNode } from "./nodes/CustomTableNode/src";
import { $createParagraphNode, $getRoot, $insertNodes, $isParagraphNode, $isTextNode, COMMAND_PRIORITY_CRITICAL, LexicalEditor, PASTE_COMMAND } from "lexical";
const LEXICAL_NODES_TO_REGISTER = registerNodesWithCodox([...PlaygroundNodes]);
import CommentPlugin from "./plugins/CommentPlugin";
import { CommentStore } from "./commenting";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import TableOfContentsPlugin from "./plugins/TableOfContent";
import Spinner from "./spinner";
import { addTableCaptions, htmlWithoutSpaces, parseHtmlStateWithStyle, transformHeadings } from "./utils/editorstateHelper";
import { $createReferenceNode } from "./nodes/ReferenceNode";
import { $isHeadingNode } from "@lexical/rich-text";
import CustomOnChange from "./plugins/CustomOnchnage";
import { ColoredNode } from "./nodes/TableNode";
import { $isImageNode } from "./nodes/ImageNode";
import SpeedTest from "./SpeedTest";
import { CustomPagination } from "./plugins/CustomPagination";
import spinverseLogo from "../../src/lexical/images/icons/spinverselogo.png";
import loaderGif from "../../src/lexical/images/icons/loaderGif.gif";
import SpellCheckPlugin from "./plugins/SpellCheckPlugin/SpellCheckPlugin";
import { NestedHeadingPlugin } from "./plugins/NestedHeadings";
import HeaderPlugin from "./plugins/HeaderPlugin";
import FooterPlugin from "./plugins/FooterPlugin";
import FootnotePopupPlugin from "./plugins/FootNotePopUp";
// import TableRenumberPlugin from "./plugins/TableRenumberPlugin";
import { TablePlugin } from "./nodes/CustomTableNode/TablePlugin";
import TableDeletePlugin from "./plugins/TableDeletePlugin";
import EndnoteMonitorPlugin from "./plugins/EndNotesPlugin/EndnoteMonitorPlugin";
import { TableCellCharacterCountPlugin } from "./plugins/TableCellHeight";
import { InitialTableCaptionPlugin } from "./plugins/InitialTableCaptionPlugin";
import { InitialImageCaptionPlugin } from "./plugins/InitialImageCaptionPlugin";
import { InitialContentPlugin } from "./plugins/InitialContentPlugin";
import { ClipboardLoggerPlugin } from "./plugins/ClipboardLoggerPlugin";
import InsertDivPlugin from "./plugins/DivPlugin";
import AutoSplitDivPlugin from "./plugins/AutoSplitDivPlugin";



let demoUserName = `EX-TARUN_${Math.floor(Math.random() * 1000)}`; // as example, just a random user name


export function Editor({
  initialEditorState,
  userObj,
  CollabApiKey,
  docId,
  mentionItems,
  type,
  updateSharepointList,
  updateSharepointList2,
  savedComments,
  styleConfig,
  handleSaveComments,
  pagination = false,
  customHeight,
  customWidth,
  isCollab = true,
  defaultState,
  editId,
  toolbarShow = true,
  isEditable = false,
  showTabContent = false,
  wpAndTaskId,
  enableCaptions = true,
  showPagination = false,
  setshowPagination,
  editorTitle,
  showPdf,
  showCommentPlugin,
  exportToPDF,
  editorForTemplate,
  enableSpellCheckerFlag = false,
  showHeaderFooter = false,
  isPdfExporting = false, //this state is accepted as props from spinverse, used for export in mozilla only.
  landscape = false,
  setLandscape,
  ispagebreakOn,
  showFootNoteOption = false,
  referencing_array = [],
  enableTable = true,
  showEditorCursor = false,
  setShowComments,
  showComments = false,
  commentId
}: any) {
  const containerRef = useRef(null);

  const { historyState }: any = useSharedHistoryContext();
  const [userOnline, setuserOnline] = useState([]);
  const [parsedHtml, setParsedHtml] = useState('');

  const [currentDocId, setCurrentDocId] = useState("skyp_1");
  const [onlUser, setonlUser] = useState([]);
  const {
    pageMarginTop,
    pageMarginLeft,
    pageMarginBottom,
    pageMarginRight,
    heading,
  } = styleConfig || {};
  // flag for codox start
  const [codoxStarted, setCodoxStarted] = useState(false);
  const [modal, showModal] = useModal();
  const [initLexicalState, setInitLexicalState] = useState(null);
  //states for cross reference plugin
  const [references, setReferences] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [mentionedEmails, setmentionedEmails] = useState([])
  const codoxProviderRef = useRef(null);
  const [isValidEditorState, setisValidEditorState] = useState(false);
  const [showTabContentBtn, setshowTabContentBtn] = useState(false);
  const [IsexistingIdPresent, setIsexistingIdPresent] = useState(false)
  // const [landscape, setlandscape] = useState(false);
  const [footNote,setFootNote] = useState('')
  const [isUserOnline, setIsUserOnline] = useState(true);
  const onChangeRef = useRef(false);
  const [pdfExport, setpdfExport] = useState(false) //this state handles pdf export that comes from editor only
  const isInitial = useRef<boolean>(false)

  // temporary code
  const handleToggle = () => {
    setShowPagination(prev => !prev);
  };
  // temporary code
  const fetchDocOnNetworkReconnect = async () => {
    // Use real api call to BE
    const state = { root: [] }; //await fetchDocInitStateByDocId(currentDocId);
    return { state, timestamp: Date.now() };
  };
  // triggered by Codox
  let onBlacklistedInsert = () => {
    console.log(
      "[Lexical Demo][onBlacklistedInsert] blacklisted combination found"
    );
  };

  const { userName, userId, userEmail } = userObj || {
    userName: "aa",
    userId: "aa",
    userEmail: "aa@sample.com",
  };
  const userDetail = {
    name: userName,
    id: userId,
    email: userEmail,
  };

  const codoxConfig = {
    docId: docId + "_" + editId,
    namespace: `editor_${docId}_${editId}`,
    apiKey: CollabApiKey, // demo api key provided by codox. Must use your own
    user: userDetail, // client user name - use real username here instead of demo name
    hooks: {
      fetchDocOnNetworkReconnect,
      contentChanged: (data, source) => {
        contentChangedHookHandler(data);
      },
      usersUpdate: (data) => {
        setuserOnline(data);
        renderOnlineUsers(data);
        console.log(
          "[Lexical Demo][usersUpdate hook] hook invoked by Codox: ",
          data
        );
      },
    },
  };
  useEffect(() => {
    let userOnlineArr = [];
    let isPresent = [];
    if (userOnline && userOnline.length > 0) {
      userOnline.map((item, index) => {
        if (!isPresent.includes(item.name)) {
          isPresent.push(item.name);
          userOnlineArr.push(
            <div
              key={index}
              title={item.name}
              className={`avatarStyle avatar-color-${index + 1}`}
            >
              {" "}
              {item.name && item.name[0]}
              {item.name && item.name[4]}
            </div>
          );
        }
      });
    }
    setonlUser(userOnlineArr);
  }, [userOnline]);

  const startCodoxSync = () => {
    if (codoxProviderRef.current) {
      codoxProviderRef.current.initComments(savedComments);
      const events = ["content_changed", "error", "users_update"];
      events.forEach((event) => {
        console.log("[Lexical Demo][[Subscribe to Codox Event]: ", event);
        codoxProviderRef.current.on(event, (data) => {
          // console.log("[Lexical Demo][Codox Event Emitted]: ", { event, data });
        });
      });
      codoxProviderRef.current
      .start(codoxConfig)
      .then(() => {
          setCodoxStarted(true);
          setIsUserOnline(true)
        })
        .catch((err) => {console.log("[Lexical Demo][codox.start] error", err)
          setIsUserOnline(false)
          
        });
    }
  };
  const stopCodoxSync = () => {
    if (codoxProviderRef.current) {
      codoxProviderRef.current.stop();
    }
    setCodoxStarted(false);
  };


  // useEffect(() => {
  //   setTimeout(() => {
  //     $('[class^="finalProposalEditorContainer_"]').animate(
  //       {
  //         scrollTop: 0,
  //       },
  //       500,
  //       () => {
  //         // console.log('Scrolling complete');
  //       }
  //     );
  //   }, 1000);
  // }, []);



  useEffect(() => {
    $(".editor-outer").css({
      justifyContent: showCommentBox ? "flex-start" : "center",
    });
  }, [showCommentBox]);
  useEffect(() => {
    (async () => {
      if (!currentDocId) return;
      if (codoxStarted) {
        stopCodoxSync();
      }
      let initState = defaultState
      if (initState) {
        try {
          validateStateStructure(initState, LEXICAL_NODES_TO_REGISTER); // if invalid - will throw

          setInitLexicalState(initState);
        } catch (err) {
          console.error("[APP] error: ", err);
        }
      }
    })();
  }, [currentDocId]);

  useEffect(() => {
    if (isValidEditorState && docId ) {
      setTimeout(() => {
        startCodoxSync();
      }, 2000);
    }
  }, [initLexicalState, docId, codoxStarted, CollabApiKey]);
  const initLexicalConfig = useMemo(() => {
    if (!initLexicalState) return;
    return {
      editorState: (editor) => {
        editor.update(() => {
          const commentStore = new CommentStore(editor);
          if (savedComments) {
            commentStore.setComments(savedComments);
            if (!editor._commentStore) {
              editor._commentStore = new CommentStore(editor);
              if (editor._commentStore.getComments().length === 0) {
                editor._commentStore.setComments(savedComments);
              }
            }
          }
        });
      },
      namespace: `editor_${docId}`,
      nodes: LEXICAL_NODES_TO_REGISTER,
      onError: (error) => {
        // custom error handler, can do smth custom here
        console.error("[Lexical Demo][Editor Error Captured]: ", error);
        // throw error;
      },
      theme: PlaygroundEditorTheme
    }
  }, [initLexicalState]);

  const editorStateRef = useRef(initialEditorState);
  useEffect(() => {
    if (!editorStateRef.current) {
      editorStateRef.current = initialEditorState;
    }
  }, [initialEditorState]);

  const contentChangedHookHandler = ({ source, content }) => {
    // console.log("", 
    // {
    //   source,
    //   content,
    // });
  };

  const placeholder = <Placeholder>{""}</Placeholder>;
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [editorEditable, setEditorEditable] = useState(false);

  const onRef = (_floatingAnchorElem) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (contextMenu && !event.target.closest(".reference-toolbar")) {
        setContextMenu(null);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [contextMenu]);

  let previousState = ""; // Variable to store the previous state

  let userInteracted = false;
  // Listen for user input (keyboard or mouse interaction)
  $(document).on('keydown mouseup', `.editor-autosave-${editId}`, () => {
    userInteracted = true;
  });
  const [editorState, setEditorState] = useState('');
  const lastEditorStateRef = useRef('');


  // React.useEffect(() => {
  //   if (initialEditorState && userObj && userObj.userName && docId && styleConfig) {
  //     setTimeout(() => {
  //       setisValidEditorState(true)
  //     }, 1000);
  //   }
  //   else {
  //     setisValidEditorState(false)
  //   }
  // }, [initialEditorState, userObj, styleConfig])

  React.useEffect(()=>{
    if(initialEditorState && styleConfig){
setisValidEditorState(true)
    }
  },[initialEditorState, styleConfig])

  const SavedState = (editorState) => {

      const container = document.querySelector(`.editor-autosave-${editId}`)
  if(container){
    if(!container?.children[0].innerHTML.includes('Loading Data...')){
          updateSharepointList(editorState)
    setParsedHtml(editorState)
    }
    }
  }
  useEffect(() => {
    const scrollContainer = document.querySelector('.finalProposalEditorContainer_c1fd8e2e');

    if (!scrollContainer) return;

    const handleScroll = () => {
      console.log("Editor container scrolled");
      setContextMenu(null);
      setShowCommentInput(false);
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function getHtmlWithoutClass(domElement, classToRemove) {
    if (!domElement) return '';
    const clone = domElement.cloneNode(true);

    const elements = clone.querySelectorAll('*');
    elements.forEach(el => el.classList.remove(classToRemove));

    clone.classList?.remove(classToRemove);

    return clone;
  }

   const refresh = () =>{
    window.location.reload(true);
   }

   const Continue = () =>{
    // setshowPagination(true)
    setIsUserOnline(true)
    isInitial.current = true
   }

   useEffect(() => {
    if(showPagination){
      onChangeRef.current = true;
    }
    else{
      setTimeout(() =>{onChangeRef.current = true},10000)
    }
   }, [showPagination,onChangeRef]);
  const didSimulateInitialClick = useRef(false);

  useEffect(() => {
    const editorIsUsable =
      isValidEditorState &&
      ((isCollab && codoxStarted) || (!isCollab && editorEditable)) &&
      isEditable;

    if (!editorIsUsable || didSimulateInitialClick.current) return;

    const timer = setTimeout(() => {
      const el: HTMLElement | null = document.querySelector(
        `.editor-autosave-${editId} .ContentEditable__root`
      );

      if (el) {
        console.log('clicked')
        el.focus();

        const opts: MouseEventInit = { bubbles: true, cancelable: true, view: window };
        el.dispatchEvent(new MouseEvent("mousedown", opts));
        el.dispatchEvent(new MouseEvent("mouseup", opts));
        el.dispatchEvent(new MouseEvent("click", opts));

        didSimulateInitialClick.current = true;
      }
    }, 6000);

    return () => clearTimeout(timer);
  }, [isValidEditorState, isCollab, codoxStarted, editorEditable, isEditable, editId]);


    React.useEffect(() => {
      if(showEditorCursor){
  const hideRemoteCursors = () => {
    codoxProviderRef.current.cursor.hide();
  };

    window.addEventListener('scroll',() => hideRemoteCursors());

    return () => {
      window.removeEventListener('scroll',() => hideRemoteCursors());

    };
      }
  }, [showEditorCursor]);

      React.useEffect(() => {
      if(showEditorCursor){

          const showRemoteCursors = () => {
    codoxProviderRef.current.cursor.show();
  };

    window.addEventListener('mousedown',() => showRemoteCursors());

    return () => {
      window.removeEventListener('mousedown',() => showRemoteCursors());

    };
      }
  }, [showEditorCursor]);


  return (
    <>
      {/* <SpeedTest /> */}
      {isValidEditorState ?

        <LexicalComposer initialConfig={initLexicalConfig} key={docId}>
          <SharedHistoryContext>
            <TableContext>
              <div ref={containerRef} className="editor-shell" style={{ position: "relative" }}>
                <div className={(!codoxStarted && !editorForTemplate) ? "blurred-editor-content" : ""}>
                  <>
                    {/* commenting below logic to send search and replace will add later */}
                   <InitialContentPlugin enableCaptions={enableCaptions} setEditorEditable={setEditorEditable} isEditable={isEditable} htmlString={codoxStarted || isInitial.current === true ? initialEditorState : '<p style="text-align: center">Loading Data...</p>'}/>
                  {codoxStarted && <InitialTableCaptionPlugin  htmlString={initialEditorState} styleConfig={styleConfig} />}
                  {codoxStarted && <InitialImageCaptionPlugin htmlString= {initialEditorState} wpAndTaskId={`${wpAndTaskId.workplanId}-${wpAndTaskId.taskId}`} styleConfig={styleConfig} />}
                  {showCommentPlugin && 
                    <CommentPlugin
                      showComments={showComments}
                      setShowComments={setShowComments}
                      handleSaveComments={handleSaveComments}
                      userName={userName}
                      userEmail={userEmail}
                      mentionItems={mentionItems}
                      mentionedEmails={mentionedEmails}
                      setmentionedEmails={setmentionedEmails}
                      wpAndTaskId={wpAndTaskId}
                      setShowCommentInput={setShowCommentInput}
                      showCommentInput={showCommentInput}
                      commentId={commentId}
                    />}
                    {/* <TableRenumberPlugin/> */}
                    <EndnoteMonitorPlugin/>
                    <ClipboardLoggerPlugin />
                    {isEditable ? <>
                      {styleConfig && (toolbarShow) &&
                        <ToolbarPlugin
                          styleConfig={styleConfig}
                          setIsLinkEditMode={setIsLinkEditMode}
                          onlUser={onlUser}
                          showComments={showComments}
                          setShowComments={setShowComments}
                          parsedHtmlString={parsedHtml}
                          enableCaptions={enableCaptions}
                          wpAndTaskId={wpAndTaskId}
                          editorTitle={editorTitle}
                          showCommentPlugin={showCommentPlugin}
                          exportToPDF={exportToPDF}
                          showPdf={showPdf}
                          editId={editId}
                          landscape={landscape}
                          setLandscape={setLandscape}
                          ispagebreakOn={ispagebreakOn}
                          showFootNoteOption={showFootNoteOption}
                          showPagination={showPagination}
                          enableTable={enableTable}
                          showTabContentBtn={showTabContentBtn}
                          setshowTabContentBtn={setshowTabContentBtn}
                          showTabContent={showTabContent}
                          setpdfExport={setpdfExport}
                        />} </> : ""}
                      <TableCellCharacterCountPlugin/>
                      { showTabContentBtn && <TableOfContentsPlugin/>}
                      <InsertDivPlugin />
                      <AutoSplitDivPlugin />
                      <LayoutPlugin/>

                   {showPagination && <CustomPagination showPagination={showPagination} id={editId} showHeaderFooter={showHeaderFooter} landscape={landscape}/>}
                    {onChangeRef.current && onChangeRef.current === true && <CustomOnChange FootNote={footNote} onChange={SavedState} showHeaderFooter={showHeaderFooter}/>}
                    <div className={`editor-container tree-view ${landscape && showPagination === true ? "landscape" : "landscape"} ${showTabContentBtn ? 'editor-right-side' : ''}`}>
                      <DragDropPaste />
                      {/* <TableAutoSplitPlugin /> */}
                      {!isCollab && <AutoFocusPlugin />}
                      {/* <HashtagPlugin />
                      <KeywordsPlugin />
                      <AutoLinkPlugin /> */}
                      <HistoryPlugin externalHistoryState={historyState} />
                      {showPagination && showHeaderFooter && <HeaderPlugin landscape={landscape} editId={editId} savedStateHeader={initialEditorState}/>}
                                          <NestedHeadingPlugin/>

                      <RichTextPlugin
                        contentEditable={
                          <div className="editor-scroller">
                            <div className="editor" ref={onRef}>
                              <div className={`editor-autosave-${editId}`}> <ContentEditable className={(codoxStarted || editorEditable) && isEditable ? `ContentEditable__root ${showPagination ? `content-editable-grid-${editId}` : 'No-Pagination'}` : `ContentEditable__root no-events ${showPagination ? `content-editable-grid-${editId}` : 'No-Pagination'}`} /></div>
                            </div>
                          </div>
                        }
                        placeholder={placeholder}
                        ErrorBoundary={LexicalErrorBoundary}
                      />
                        {showPagination && showHeaderFooter && <FooterPlugin landscape={landscape} editId={editId} savedStateFooter={initialEditorState}/>}
                      <ListPlugin />
                      <FootnotePopupPlugin footNotesState={initialEditorState} setFootNote={setFootNote}/>
                      {/* <ListMaxIndentLevelPlugin maxDepth={7} /> */}
                      <TablePlugin
                        hasCellMerge={true}
                        hasCellBackgroundColor={true}
                      />
                      <TableCellResizer />
                      <ImagesPlugin enableCaptions={enableCaptions} wpAndTaskId={`${wpAndTaskId.workplanId}-${wpAndTaskId.taskId}`} styleConfig={ styleConfig} />
                      {/* <LinkPlugin />
                      <TabFocusPlugin /> */}
                      {floatingAnchorElem && !isSmallWidthViewport && (
                        <>
                          <TableCellActionMenuPlugin
                            anchorElem={floatingAnchorElem}
                            cellMerge={true}
                            enableCaption={enableCaptions}
                            styleConfig={styleConfig}
                          />
                        </>
                      )}
                      <ReferenceToolbar
                        references={references}
                        setReferences={setReferences}
                        position={contextMenu}
                        onClose={() => setContextMenu(null)}
                        IsexistingIdPresent={IsexistingIdPresent}
                        referencing_array={referencing_array || []}
                      />
                      <HashToolbarOpenerPlugin
                        setContextMenu={setContextMenu}
                        references={references}
                        setReferences={setReferences}
                        containerRef={containerRef}
                      />
                      <CrossReferencePlugin
                        references={references}
                        setReferences={setReferences}
                        styleConfig={styleConfig}
                      />
                      <EndNotesPlugin />
                      <SearchAndReplacePlugin />
                      {enableSpellCheckerFlag && <SpellCheckPlugin />}
                      <TableDeletePlugin enableCaption={enableCaptions} styleConfig={styleConfig}/>
                    </div>
                  </>
                  {!isValidEditorState || pdfExport || isPdfExporting && (
                    <div
                      style={{
                        position: "absolute",
                        zIndex: 999,
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(255, 255, 255, 0.6)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "start",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      <img
                        src={spinverseLogo}
                        alt="Spinverse Logo"
                        style={{ height: "60px", marginBottom: "20px", marginTop: "110px" }}
                      />
                      <img
                        src={loaderGif}
                        alt="Loading..."
                        style={{ height: "50px" }}
                      />
                    </div>
                  )}
                </div>
                {isCollab &&
                  <CodoxCollabPlugin
                    debug={true}
                    ref={codoxProviderRef}
                    onBlacklistedInsert={onBlacklistedInsert} // callback to trigger when attempt to insert/paste blacklisted content combination
                  />}
                {modal}
              </div>
            </TableContext>
         
          </SharedHistoryContext>
          {styleConfig && <HeadingStyles styleConfig={styleConfig} docId={docId} />}
        </LexicalComposer> :
        // <Spinner/>
        <>
          { (
            <div
              style={{
                position: "absolute",
                zIndex: 999,
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "start",
                backdropFilter: "blur(6px)",
              }}
            >
              <img
                src={spinverseLogo}
                alt="Spinverse Logo"
                style={{ height: "60px", marginBottom: "20px", marginTop: "110px" }}
              />
              <img
                src={loaderGif}
                alt="Loading..."
                style={{ height: "50px" }}
              />
            </div>
          )}
        </>
      }

      {!isUserOnline && 
      
//             <div
//         style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           width: '100vw',
//           height: '100vh',
//           backgroundColor: 'rgba(0,0,0,0.1)',
//           zIndex: 9998,
//         }}
//       >

//       <div id="confirmPopup" style={{
//     display:  'block',
//     position: 'fixed',
//     top: '35%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     background: '#fff',
//     padding: '20px',
//     border: '1px solid #ccc',
//     boxShadow: '0 0 10px rgba(0,0,0,0.3)',
//     zIndex: 1000,
//   }} >
//   <p>Collaboration is not started due to network issue or invalid editor state.</p>
//   <button onClick={refresh}>Refresh</button>
//   <button onClick={Continue}>Continue Editing</button>
// </div>


//       </div>


<div
  style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 9998,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, sans-serif',
  }}
>
  <div
    id="confirmPopup"
    style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '24px',
      width: '500px',
      maxWidth: '90%',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
      zIndex: 10000,
      textAlign: 'center',
    }}
  >
    <p style={{ marginBottom: '20px', fontSize: '15px', color: '#333' }}>
      Collaboration is not started due to network issue or invalid editor state.
    </p>
    <div style={{ display: 'flex', justifyContent: 'end', gap: '12px' }}>
            <button
        onClick={Continue}
        style={{
          backgroundColor: '#1976d2',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Continue Editing
      </button>
      <button
        onClick={refresh}
        style={{
          backgroundColor: '#e0e0e0',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Refresh
      </button>
    </div>
  </div>
</div>



}
    </>
  );
}
