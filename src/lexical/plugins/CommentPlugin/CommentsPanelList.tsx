import { Comment, Comments, Thread } from "../../commenting";
import { $getNodeByKey, NodeKey } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useMemo, useState } from "react";
import useModal from "../../hooks/useModal";
import { $isMarkNode, MarkNode } from "@lexical/mark";
import Button from "../../ui/Button";
import { ShowDeleteCommentOrThreadDialog } from "./ShowDeleteCommentOrThreadDialog";
import { CommentsPanelListComment } from "./CommentsPanelListComment";
import { CommentsComposer } from "./CommentsComposer";
import { useCollabAuthorName } from "./index";
import CheckIcon from "../../images/icons/check-mark-line-icon.svg";
import type { JSX } from 'react';

export function CommentsPanelList({
  activeIDs,
  comments,
  deleteCommentOrThread,
  listRef,
  submitAddComment,
  markNodeMap,
  resolveThread,
  userName,
  mentionItems,
  userEmail
}: {
  activeIDs: Array<string>;
  comments: Comments;
  deleteCommentOrThread: (
    commentOrThread: Comment | Thread,
    thread?: Thread
  ) => void;
  listRef: { current: null | HTMLUListElement };
  markNodeMap: Map<string, Set<NodeKey>>;
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread
  ) => void;
  resolveThread: any;
  userName: string;
  mentionItems: any;
  userEmail: string;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [counter, setCounter] = useState(0);
  const [modal, showModal] = useModal();
  const rtf = useMemo(
    () =>
      new Intl.RelativeTimeFormat("en", {
        localeMatcher: "best fit",
        numeric: "auto",
        style: "short",
      }),
    []
  );

  useEffect(() => {
    // Used to keep the time stamp up to date
    const id = setTimeout(() => {
      setCounter(counter + 1);
    }, 10000);

    return () => {
      clearTimeout(id);
    };
  }, [counter]);
  const author = useCollabAuthorName();
  return (
    <ul className="CommentPlugin_CommentsPanel_List" ref={listRef}>
      {comments && comments.length && comments.map((commentOrThread) => {
        const id = commentOrThread.id;
        if (commentOrThread.type === "thread") {
          const handleClickThread = () => {
            const markNodeKeys = markNodeMap.get(id);
            if (
              markNodeKeys !== undefined &&
              (activeIDs === null || activeIDs.indexOf(id) === -1)
            ) {
              const activeElement = document.activeElement;
              // Move selection to the start of the mark, so that we
              // update the UI with the selected thread.
              editor.update(
                () => {
                  const markNodeKey = Array.from(markNodeKeys)[0];
                  const markNode = $getNodeByKey<MarkNode>(markNodeKey);
                  if ($isMarkNode(markNode)) {
                    markNode.selectStart();
                  }
                },
                {
                  onUpdate() {
                    // Restore selection to the previous element
                    if (activeElement !== null) {
                      (activeElement as HTMLElement).focus();
                    }
                  },
                }
              );
            }
          };
          return (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li
              key={id}
              onClick={handleClickThread}
              className={`CommentPlugin_CommentsPanel_List_Thread ${
                markNodeMap.has(id) ? "interactive" : ""
              } ${activeIDs.indexOf(id) === -1 ? "" : "active"}`}
            >
              <div className="CommentPlugin_CommentsPanel_List_Thread_QuoteBox">
                <blockquote className="CommentPlugin_CommentsPanel_List_Thread_Quote">
                  {/* <img
                      className="add-toolbar-image-icon"
                      src={ChatIcon}
                      alt="Add Image"
                    /> */}
                  <span>{commentOrThread?.comments[0]?.author}</span>

                  <img
                    className={`add-toolbar-image-icon CommentPlugin_CommentsPanel_List_ResolveButton ${
                      commentOrThread?.resolved ? "opacity-full" : ""
                    }`}
                    src={CheckIcon}
                    alt="Resolve Comment"
                    onClick={() => resolveThread(commentOrThread)}
                  />
                </blockquote>
                {/* INTRODUCE DELETE THREAD HERE*/}
                {userName == commentOrThread?.comments[0]?.author &&
                <Button
                  onClick={() => {
                    showModal("Delete Thread", (onClose) => (
                      <ShowDeleteCommentOrThreadDialog
                        commentOrThread={commentOrThread}
                        deleteCommentOrThread={deleteCommentOrThread}
                        onClose={onClose}
                      />
                    ));
                  }}
                  className="CommentPlugin_CommentsPanel_List_DeleteButton"
                >
                  <i className="delete" />
                </Button>
                }
                {modal}
              </div>
              <ul className="CommentPlugin_CommentsPanel_List_Thread_Comments">
                {commentOrThread && commentOrThread.comments && commentOrThread.comments.length && commentOrThread.comments.map((comment) => {
                  if (comment.deleted) {
                    return null;
                  }
                  return (
                    <CommentsPanelListComment
                      key={comment.id}
                      comment={comment}
                      deleteComment={deleteCommentOrThread}
                      thread={commentOrThread}
                      rtf={rtf}
                      userName={userName}
                    />
                  );
                })}
              </ul>

              {!commentOrThread?.resolved && (
                <div className="CommentPlugin_CommentsPanel_List_Thread_Editor">
                  <CommentsComposer
                    submitAddComment={submitAddComment}
                    thread={commentOrThread}
                    placeholder="Reply to comment..."
                    userName={userName}
                    mentionItems={mentionItems}
                    userEmail={userEmail}
                  />
                </div>
              )}
            </li>
          );
        }
        return (
          <CommentsPanelListComment
            key={id}
            comment={commentOrThread}
            deleteComment={deleteCommentOrThread}
            rtf={rtf}
            userName={userName}
          />
        );
      })}
    </ul>
  );
}
