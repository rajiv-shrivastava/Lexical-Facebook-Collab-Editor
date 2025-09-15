import { Comment, Thread } from "../../commenting";
import Button from "../../ui/Button";
import type { JSX } from 'react';

export function ShowDeleteCommentOrThreadDialog({
  commentOrThread,
  deleteCommentOrThread,
  onClose,
  thread = undefined,
}: {
  commentOrThread: Comment | Thread;

  deleteCommentOrThread: (
    comment: Comment | Thread,
    // eslint-disable-next-line no-shadow
    thread?: Thread
  ) => void;
  onClose: () => void;
  thread?: Thread;
}): JSX.Element {
  return (
    <>
      Are you sure you want to delete this {commentOrThread.type}?
      <div className="Modal__content">
        <Button
          onClick={() => {
            deleteCommentOrThread(commentOrThread, thread);
            onClose();
          }}
        >
          Delete
        </Button>{" "}
        <Button
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
