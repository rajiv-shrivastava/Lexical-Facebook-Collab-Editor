import { Comment, Comments, Thread } from "../../commenting";
import { $getNodeByKey, NodeKey } from "lexical";
import { SetStateAction, useEffect, useMemo, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import useModal from "../../hooks/useModal";
import CheckIcon from "../../images/icons/check-mark-line-icon.svg";
import { $isMarkNode, MarkNode } from "@lexical/mark";
import Button from "../../ui/Button";
import { ShowDeleteCommentOrThreadDialog } from "./ShowDeleteCommentOrThreadDialog";
import { CommentsPanelListComment } from "./CommentsPanelListComment";
import { CommentsComposer } from "./CommentsComposer";
import { useCollabAuthorName } from "./index";
import {JSX} from 'react';

export default function CommentsPanelListCB({
  activeIDs,
  comments,
  deleteCommentOrThread,
  listRef,
  submitAddComment,
  markNodeMap,
  resolveThread,
  setShowComments,
  setShowCommentBox,
  focusedCommentId,
  userName,
  userEmail,
  mentionItems  
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
  setShowComments: React.Dispatch<SetStateAction<boolean>>;
  setShowCommentBox: React.Dispatch<SetStateAction<boolean>>;
  focusedCommentId: string;
  userName: string,
  userEmail: string,
  mentionItems: any
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
  let author = useCollabAuthorName();

  return (
    <ul
      style={{
        width: "350px",
      }}
      className="comment-box"
      ref={listRef}
    >
      {comments &&
        (comments.length > 0) &&
        comments.map((commentOrThread) => {
          const id = commentOrThread.id;
          if (commentOrThread.type === "thread") {
            const handleClickThread = () => {
              const markNodeKeys = markNodeMap.get(id);
              if (
                markNodeKeys !== undefined &&
                (activeIDs === null || activeIDs.indexOf(id) === -1)
              ) {
                const activeElement = document.activeElement;

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
                      if (activeElement !== null) {
                        (activeElement as HTMLElement).focus();
                      }
                    },
                  }
                );
              }
            };
            return (
              !commentOrThread?.resolved && (
                <li
                  key={id}
                  onClick={handleClickThread}
                  className={`comment-container ${
                    markNodeMap.has(id) ? "interactive" : ""
                  } ${activeIDs.indexOf(id) === -1 ? "" : "active"}`}
                >
                  <div className="profile-section">
                    <div className="avatar">
                      {
                        commentOrThread?.comments[0]?.author
                          ?.split(" ")
                          .map((word) => word[0]) 
                          .join("") 
                          .toUpperCase()
                      }
                    </div>
                    <div className="name">
                      {commentOrThread?.comments[0]?.author}
                    </div>
                  </div>
                  <div className="CommentPlugin_CommentsPanel_List_Thread_QuoteBox CommentPlugin_CommentsPanel_List_Thread_QuoteBox_CommentBox">
                    <blockquote className="CommentPlugin_CommentsPanel_List_Thread_Quote">
                      <img
                        className={`add-toolbar-image-icon CommentPlugin_CommentsPanel_List_ResolveButton CommentPlugin_CommentsPanel_List_ResolveButton_CB  ${
                          commentOrThread?.resolved ? "opacity-full" : ""
                        }`}
                        src={CheckIcon}
                        alt="Resolve Comment"
                        onClick={() => (
                          resolveThread(commentOrThread),
                          setShowComments(true),
                          setShowCommentBox(false)
                        )}
                      />
                    </blockquote>

                    {userName == commentOrThread?.comments[0]?.author && (
                      <Button
                        onClick={() => {
                          showModal("Delete Thread", (onClose: any) => (
                            <ShowDeleteCommentOrThreadDialog
                              commentOrThread={commentOrThread}
                              deleteCommentOrThread={deleteCommentOrThread}
                              onClose={onClose}
                            />
                          ));
                        }}
                        className="CommentPlugin_CommentsPanel_List_DeleteButton CommentPlugin_CommentsPanel_List_DeleteButtonCB"
                      >
                        <i className="delete deleteIconCB" />
                      </Button>
                    )}
                    {modal}
                  </div>
                  <ul className="CommentPlugin_CommentsPanel_List_Thread_Comments CommentPlugin_CommentsPanel_List_Thread_Comments_CB">
                    {commentOrThread &&
                      commentOrThread.comments &&
                      commentOrThread.comments.length &&
                      commentOrThread.comments.map((comment) => {
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
                            userEmail={userEmail}
                          />
                        );
                      })}
                  </ul>
                  {focusedCommentId === id && !commentOrThread?.resolved && (
                    <div className="CommentPlugin_CommentsPanel_List_Thread_Editor">
                      <CommentsComposer
                        submitAddComment={submitAddComment}
                        thread={commentOrThread}
                        placeholder="Reply to comment..."
                        mode="commentBoxModal"
                        userName={userName}
                        userEmail={userEmail}
                        mentionItems={mentionItems}
                      />
                    </div>
                  )}
                </li>
              )
            );
          }
          return (
            <CommentsPanelListComment
              key={id}
              comment={commentOrThread}
              deleteComment={deleteCommentOrThread}
              rtf={rtf}
              userName={userName}
              userEmail={userEmail}
            />
          );
        })}
    </ul>
  );
}
