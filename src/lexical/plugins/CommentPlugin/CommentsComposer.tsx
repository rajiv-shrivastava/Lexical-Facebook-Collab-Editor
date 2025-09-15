import { useRef, useState } from "react";
import { Comment, createComment, Thread } from "../../commenting";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical";
import { useOnChange } from "./UseOnChange";
import { PlainTextEditor } from "./PlainTextEditor";
import Button from "../../ui/Button";
import { useCollabAuthorName } from "./index";

export function CommentsComposer({
  submitAddComment,
  thread,
  placeholder,
  mode,
  userName,
  userEmail,
  mentionItems
}: {
  placeholder?: string;
  submitAddComment: (
    commentOrThread: Comment,
    isInlineComment: boolean,
    // eslint-disable-next-line no-shadow
    thread?: Thread
  ) => void;
  thread?: Thread;
  mode?: string;
  userName?: string;
  userEmail?: string;
  mentionItems: any;
}) {
  const [content, setContent] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const editorRef = useRef<LexicalEditor>(null);
  const author = useCollabAuthorName();

  const submitComment = () => {
    if (canSubmit) {
      submitAddComment(createComment(content, (userName || author) , userEmail), false, thread);
      const editor = editorRef.current;
      if (editor !== null) {
        editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      }
    }
  };
  const onChange = useOnChange(setContent, setCanSubmit, submitComment);

  return (
    <>
      <PlainTextEditor
        className="CommentPlugin_CommentsPanel_Editor"
        autoFocus={false}
        onEscape={() => {
          return true;
        }}
        onChange={onChange}
        editorRef={editorRef}
        placeholder={placeholder}
        mentionItems={mentionItems}
      />
      <Button
        className={
          mode == "commentBoxModal"
            ? "CommentPlugin_CommentsPanel_SendButton SendButton_Commentbox"
            : "CommentPlugin_CommentsPanel_SendButton"
        }
        onClick={submitComment}
        disabled={!canSubmit}
      >
        <i className="send" />
      </Button>
    </>
  );
}
