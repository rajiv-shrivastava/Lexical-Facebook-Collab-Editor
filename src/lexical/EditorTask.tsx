
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
import { TablePlugin } from "./nodes/CustomTableNode/TablePlugin";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import AutoEmbedPlugin from "./plugins/AutoEmbedPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import DragDropPaste from "./plugins/DragDropPastePlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
import EmojisPlugin from "./plugins/EmojisPlugin";
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
import PageBreakPlugin from "./plugins/PageBreakPlugin";
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
import CountParagraphs from "./plugins/PageBreakPlugin/Pagination";
import TableOfContentsPlugin from "./plugins/TableOfContent";
import Spinner from "./spinner";
import { addTableCaptions, htmlWithoutSpaces, parseHtmlStateWithStyle } from "./utils/editorstateHelper";
import { $isImageNode, ImageNode } from "./nodes/ImageNode";
import CustomOnChange from "./plugins/CustomOnchnage";
import SpeedTest from "./SpeedTest";
import { ColoredNode } from "./nodes/TableNode";
import spinverseLogo from "../../src/lexical/images/icons/spinverselogo.png";
import loaderGif from "../../src/lexical/images/icons/loaderGif.gif";
import { CustomPaginationTask } from "./plugins/CustomPaginationTask";
import { NestedHeadingPlugin } from "./plugins/NestedHeadings";
import SpellCheckPlugin from "./plugins/SpellCheckPlugin/SpellCheckPlugin";
import HeaderPlugin from "./plugins/HeaderPlugin";
import FooterPlugin from "./plugins/FooterPlugin";
import TableRenumberPlugin from "./plugins/TableRenumberPlugin";
import TableDeletePlugin from "./plugins/TableDeletePlugin";
import EndnoteMonitorPlugin from "./plugins/EndNotesPlugin/EndnoteMonitorPlugin";
import { InitialTableCaptionPlugin } from "./plugins/InitialTableCaptionPlugin";
import { InitialImageCaptionPlugin } from "./plugins/InitialImageCaptionPlugin";
export function ClipboardLoggerPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ClipboardEvent>(
      PASTE_COMMAND,
      (event) => {
        const clipboardData = event?.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData?.getData("text/html");

        if (html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const fragmentMatch = html?.match(
            /<!--StartFragment-->(.*?)<!--EndFragment-->/s
          );
          const fragmentHtml = fragmentMatch
            ? fragmentMatch[1]
            : doc.body.innerHTML;
          const fragmentDoc = parser?.parseFromString(fragmentHtml, "text/html");
          const children = fragmentDoc.body.children;

          const isOnlyTableWithEmptyParasOnly = Array.from(children)?.every(
            (child) => {
              if (child.tagName.toLowerCase() === "table") {
                return true;
              } else if (child.tagName.toLowerCase() === "p") {
                return child.innerHTML.trim() === "<br>";
              }
              return false;
            }
          );

          if (isOnlyTableWithEmptyParasOnly) {
            // event.preventDefault();
            // alert("Copy-pasting table is not currently supported. Please insert a table and copy the content to it directly.");
            // return true; 
          }
        }

        return false; 
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  return null;
}
export function EditorTask({
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
  showTabContent = true,
  wpAndTaskId,
  enableCaptions = true,
  editorTitle,
  showPdf = true,
  showPagination = true,
  exportToPDF,
  enableSpellCheckerFlag = false,
  editorForTemplate,
  showCommentPlugin,
  isPdfExporting = false,
  landscape = false,
  setLandscape,
  ispagebreakOn = false,
  referencing_array = [],
  enableTable = false,
  showEditorCursor = false,
  setShowComments,
  showComments = false,
  commentId
}: any) {
  const containerRef = useRef(null);

  const { historyState }: any = useSharedHistoryContext();
  const [userOnline, setuserOnline] = useState([]);

  const [currentDocId, setCurrentDocId] = useState("skyp_1");
  const [onlUser, setonlUser] = useState([]);
  const {
    pageMarginTop,
    pageMarginLeft,
    pageMarginBottom,
    pageMarginRight,
    heading,
  } = styleConfig || {};
  const [codoxStarted, setCodoxStarted] = useState(false);
  const [modal, showModal] = useModal();
  const [initLexicalState, setInitLexicalState] = useState(null);
  const [references, setReferences] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [mentionedEmails, setmentionedEmails] = useState([])
  const codoxProviderRef = useRef(null);
  const [isValidEditorState, setisValidEditorState] = useState(false);
  const [showTabContentBtn, setshowTabContentBtn] = useState(false);

  const fetchDocOnNetworkReconnect = async () => {
    const state = { root: [] }; //await fetchDocInitStateByDocId(currentDocId);
    return { state, timestamp: Date.now() };
  };

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
    apiKey: CollabApiKey, 
    user: userDetail,
    hooks: {
      fetchDocOnNetworkReconnect,
      contentChanged: (data, source) => {
        // if(source === 'remote'){
        //   return false
        // }
        // console.log(
        //   "[Lexical Demo][contentChanged hook] hook invoked by Codox: ",
        //   data
        // );
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
        });
      });
      codoxProviderRef.current
        .start(codoxConfig)
        .then(() => {
          console.log("[Lexical Demo][codox.start] success");
          setCodoxStarted(true);
        })
        .catch((err) => console.log("[Lexical Demo][codox.start] error", err));
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
  //     // console.log('Scrolling to top...');
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
      /**
       * Stop already running codox sync, when docId is changed
       */
      if (codoxStarted) {
        stopCodoxSync();
      }

      // Make a real api call for init state
      // let initState = await fetchDocInitStateByDocId(currentDocId);
      let initState = defaultState


      // console.log({ initState });

      if (initState) {
        try {
          validateStateStructure(initState, LEXICAL_NODES_TO_REGISTER); // if invalid - will throw

          setInitLexicalState(initState);
        } catch (err) {
          console.error("error: ", err);
        }
      }
    })();
  }, [currentDocId]);

  useEffect(() => {
    if (initLexicalState && docId && !codoxStarted && CollabApiKey) {
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
          const parser = new DOMParser();
          const htmlNoSpace = htmlWithoutSpaces(initialEditorState)
          const addCaptionHtml = addTableCaptions(htmlNoSpace)
          const dom = parser.parseFromString(enableCaptions ? addCaptionHtml : htmlNoSpace, 'text/html');
          let nodes = $generateNodesFromDOM(editor, dom);
          const root = $getRoot();
          root.clear();
          const paraNode = $createParagraphNode()
          $insertNodes(nodes);
          $insertNodes([paraNode])

          editor.setEditable(isEditable)
          setTimeout(() => {
            editor.setEditable(isEditable)
            setEditorEditable(true)
          }, 5000)



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
      namespace: `Playground`,
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
    // console.log("[Lexical Demo][contentChangedHookHandler]: ", {
    //   source,
    //   content,
    // });
  };

  const placeholder = <Placeholder>{""}</Placeholder>;
  const [floatingAnchorElem, setFloatingAnchorElem] = useState(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [editorEditable, setEditorEditable] = useState(false);
  const [parsedHtml,setParsedHtml] = useState('');
  

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


  React.useEffect(() => {
    if (initialEditorState && userObj && userObj.userName && docId && styleConfig) {
      setTimeout(() => {
        setisValidEditorState(true)
      }, 1000);
    }
    else {
      setisValidEditorState(false)
    }
  }, [initialEditorState, userObj, styleConfig])

  const SavedState = (editorState) => {
    updateSharepointList2(editorState)
    setParsedHtml(editorState)
  }

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
      {isValidEditorState ?
        <LexicalComposer initialConfig={initLexicalConfig} key={docId}>
          <SharedHistoryContext>
            <TableContext>
              <div ref={containerRef} className="editor-shell" style={{ position: "relative" }}>
                <div className={(!codoxStarted && !editorForTemplate) ? "blurred-editor-content" : ""}>
                  <>
                  <InitialTableCaptionPlugin  htmlString={initialEditorState} styleConfig={styleConfig}/>
                  <InitialImageCaptionPlugin htmlString= {initialEditorState} wpAndTaskId={`${wpAndTaskId.workplanId}-${wpAndTaskId.taskId}`} styleConfig={styleConfig}/>
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
                    />
                                        <TableRenumberPlugin/>
                            <EndnoteMonitorPlugin/>
                    
                    <NestedHeadingPlugin/>
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
                            exportToPDF={exportToPDF}
                            editId={editId}
                            showCommentPlugin={showCommentPlugin}
                            landscape={landscape}
                            setLandscape={setLandscape}
                            ispagebreakOn={ispagebreakOn}
                            enableTable={enableTable}
                            showPdf={showPdf}
                  />} </> : ""}
                  <CustomOnChange onChange={SavedState} />

                    <div className={`editor-container tree-view ${landscape ? "landscape" : ""}`}>
                      <DragDropPaste />
                    <EmojiPickerPlugin />
                    <AutoEmbedPlugin />
                    <EmojisPlugin />
                      <HashtagPlugin />
                      <KeywordsPlugin />
                      <AutoLinkPlugin />
                      <HistoryPlugin externalHistoryState={historyState} />
                      {/* {showPagination && <HeaderPlugin savedStateHeader={initialEditorState}/>} */}
                      <RichTextPlugin
                        contentEditable={
                          <div className="editor-scroller">
                            <div className="editor" ref={onRef}>
                            {/* <div className={`editor-autosave-${editId}`}> <ContentEditable className={(codoxStarted || editorEditable) && isEditable ? 'ContentEditable__root' : 'ContentEditable__root no-events'} /></div> */}

                            <div className={`editor-autosave-${editId}`}> <ContentEditable className={(codoxStarted || editorEditable) && isEditable ?  `ContentEditable__root editorForTask ${showPagination ? `content-editable-grid-${editId}`: ''}`: `ContentEditable__root no-events editorForTask ${showPagination ? `content-editable-grid-${editId}`: ''}`} /></div>
                            </div>
                          </div>
                        }
                        placeholder={placeholder}
                        ErrorBoundary={LexicalErrorBoundary}
                      />
                      {/* {showPagination && <FooterPlugin savedStateFooter={initialEditorState}/>} */}
                      <ListPlugin />
                      <ListMaxIndentLevelPlugin maxDepth={7} />
                      <TablePlugin
                        hasCellMerge={true}
                        hasCellBackgroundColor={true}
                      />
                    {isCollab && <TableCellResizer />}
                    <ImagesPlugin enableCaptions={enableCaptions} wpAndTaskId={`${wpAndTaskId.workplanId}-${wpAndTaskId.taskId}`} styleConfig={styleConfig}/>
                      <LinkPlugin />
                      <TabFocusPlugin />
                      {floatingAnchorElem && !isSmallWidthViewport && (
                        <>
                          <TableCellActionMenuPlugin
                            anchorElem={floatingAnchorElem}
                            cellMerge={true}
                            styleConfig={styleConfig}
                          />
                        </>
                      )}
                    {contextMenu && (
                      <ReferenceToolbar
                        references={references}
                        setReferences={setReferences}
                        position={contextMenu}
                        onClose={() => setContextMenu(null)}
                        referencing_array={referencing_array}

                      />
                    )}
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
                        <TableDeletePlugin styleConfig={styleConfig}/>
                      <CustomPaginationTask id={editId} />
                    </div>
                  </>
                  {((!codoxStarted && !editorForTemplate) || isPdfExporting) && (
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

                {isCollab && <CodoxCollabPlugin
                    debug={true}
                    ref={codoxProviderRef}
                  onBlacklistedInsert={onBlacklistedInsert}
                />}
                {modal}
              </div>
            </TableContext>
          </SharedHistoryContext>
          {styleConfig && <HeadingStyles styleConfig={styleConfig} />}
        </LexicalComposer> :
       <>
          {((!codoxStarted && !editorForTemplate) || isPdfExporting) && (
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
    </>
  );
}
