import { Comment, Thread } from "../../commenting";
import useModal from "../../hooks/useModal";
import Button from "../../ui/Button";
import { ShowDeleteCommentOrThreadDialog } from "./ShowDeleteCommentOrThreadDialog";
import type { JSX } from 'react';

export function CommentsPanelListComment({
  comment,
  deleteComment,
  thread,
  rtf,
  userName,
  userEmail
}: {
  comment: Comment;
  deleteComment: (
    commentOrThread: Comment | Thread,
    // eslint-disable-next-line no-shadow
    thread?: Thread
  ) => void;
  rtf: Intl.RelativeTimeFormat;
  thread?: Thread;
  userName?: string
  userEmail?: string
}): JSX.Element {
  const seconds = Math.round((comment.timeStamp - performance.now()) / 1000);
  const minutes = Math.round(seconds / 60);
  const [modal, showModal] = useModal();

  return (
    <li className="CommentPlugin_CommentsPanel_List_Comment">
      <div className="CommentPlugin_CommentsPanel_List_Details">
        <span className="CommentPlugin_CommentsPanel_List_Comment_Author">
          {comment.author}
        </span>
        <span className="CommentPlugin_CommentsPanel_List_Comment_Time">
          · {seconds > -10 ? "Just now" : rtf.format(minutes, "minute")}
        </span>
      </div>
      <p
        className={
          comment.deleted ? "CommentPlugin_CommentsPanel_DeletedComment" : ""
        }
        style={{ whiteSpace: "pre-wrap" }}
      >
        {comment.content}
      </p>
      {!comment.deleted && (
        <>
          {userName == comment.author && (
          <Button
            onClick={() => {
              showModal("Delete Comment", (onClose) => (
                <ShowDeleteCommentOrThreadDialog
                  commentOrThread={comment}
                  deleteCommentOrThread={deleteComment}
                  thread={thread}
                  onClose={onClose}
                />
              ));
            }}
            className="CommentPlugin_CommentsPanel_List_DeleteButton"
          >
            <i className="delete" />
          </Button>
        )}
          {modal}
        </>
      )}
    </li>
  );
}
