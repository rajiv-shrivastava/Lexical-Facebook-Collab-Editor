import { Comment, Comments, Thread } from "../../commenting";
import { NodeKey } from "lexical";
import { SetStateAction, useEffect, useRef } from "react";
import { CommentsPanelList } from "./CommentsPanelList";
import closeIcon from "../../images/icons/crossIcon.svg";
import type { JSX } from 'react';

export default function CommentsPanel({
  activeIDs,
  deleteCommentOrThread,
  comments,
  submitAddComment,
  markNodeMap,
  resolveThread,
  setShowComments,
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
  markNodeMap: Map<string, Set<NodeKey>>;
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread
  ) => void;
  resolveThread: any;
  setShowComments: React.Dispatch<SetStateAction<boolean>>;
  setShowCommentBox: React.Dispatch<SetStateAction<boolean>>;
  showCommentBox: boolean;
  userName: string;
  mentionItems: any;
  userEmail: string
}): JSX.Element {
  const listRef = useRef<HTMLUListElement>(null);
  const isEmpty = comments.length === 0;
  useEffect(() => {
   if (comments.length === 0) {
    localStorage.removeItem('commentsData')
   }
  }, [comments])
  
  return (
    <div className="CommentPlugin_CommentsPanel">
      <div className="CommentPlugin_CommentTextDiv">
        <h2 className="CommentPlugin_CommentsPanel_Heading">Comments</h2>
        <img
          onClick={() => setShowComments(false)}
          className="CommentPlugin_CommentsPanel_close_icon"
          width={12}
          height={12}
          src={closeIcon}
          alt=""
        />
      </div>
      {isEmpty ? (
        <div className="CommentPlugin_CommentsPanel_Empty">No Comments</div>
      ) : (
        <CommentsPanelList
          activeIDs={activeIDs}
          comments={comments}
          deleteCommentOrThread={deleteCommentOrThread}
          listRef={listRef}
          submitAddComment={submitAddComment}
          markNodeMap={markNodeMap}
          resolveThread={resolveThread}
          userName={userName}
          mentionItems={mentionItems}
          userEmail={userEmail}
        />
      )}
    </div>
  );
}
