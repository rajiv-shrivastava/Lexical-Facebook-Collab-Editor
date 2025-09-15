import {
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
  RangeSelection,
} from "lexical";
import { Comment, createComment, createThread, Thread } from "../../commenting";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createDOMRange, createRectsFromDOMRange } from "@lexical/selection";
import { useOnChange } from "./UseOnChange";
import { PlainTextEditor } from "./PlainTextEditor";
import Button from "../../ui/Button";
import { useCollabAuthorName } from "./index";

export default function CommentInputBox({
  editor,
  cancelAddComment,
  submitAddComment,
  userName,
  mentionItems,
  userEmail
}: {
  cancelAddComment: () => void;
  editor: LexicalEditor;
  submitAddComment: (
    commentOrThread: Comment | Thread,
    isInlineComment: boolean,
    thread?: Thread,
    selection?: RangeSelection | null,
  ) => void;
  userName?: string | any,
  mentionItems: any;
  userEmail?: string
}) {
  const [content, setContent] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const selectionState = useMemo(
    () => ({
      container: document.createElement("div"),
      elements: [],
    }),
    []
  );
  const selectionRef = useRef<RangeSelection | null>(null);
  const author = useCollabAuthorName();

  const updateLocation = useCallback(() => {
    editor && editor.getEditorState() && editor.getEditorState().read(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        selectionRef.current = selection.clone();
        const anchor = selection.anchor;
        const focus = selection.focus;
        const range = createDOMRange(
          editor,
          anchor.getNode(),
          anchor.offset,
          focus.getNode(),
          focus.offset
        );
        const boxElem = boxRef.current;
        if (range !== null && boxElem !== null) {
          const { left, bottom, width } = range.getBoundingClientRect();
          const selectionRects = createRectsFromDOMRange(editor, range);
          let correctedLeft =
            selectionRects.length === 1 ? left + width / 2 - 125 : left - 125;
          if (correctedLeft < 10) {
            correctedLeft = 10;
          }
          boxElem.style.left = `${correctedLeft}px`;
          boxElem.style.top = `${
            bottom +
            20 +
            (window.pageYOffset || document.documentElement.scrollTop)
          }px`;
          const selectionRectsLength = selectionRects.length;
          const { container } = selectionState;
          const elements: Array<HTMLSpanElement> = selectionState.elements;
          const elementsLength = elements.length;

          for (let i = 0; i < selectionRectsLength; i++) {
            const selectionRect = selectionRects[i];
            let elem: HTMLSpanElement = elements[i];
            if (elem === undefined) {
              elem = document.createElement("span");
              elements[i] = elem;
              container.appendChild(elem);
            }
            const color = "255, 212, 0";
            const style = `position:absolute;top:${
              selectionRect.top +
              (window.pageYOffset || document.documentElement.scrollTop)
            }px;left:${selectionRect.left}px;height:${
              selectionRect.height
            }px;width:${
              selectionRect.width
            }px;background-color:rgba(${color}, 0.3);pointer-events:none;z-index:5;`;
            elem.style.cssText = style;
          }
          for (let i = elementsLength - 1; i >= selectionRectsLength; i--) {
            const elem = elements[i];
            container.removeChild(elem);
            elements.pop();
          }
        }
      }
    });
  }, [editor, selectionState]);

  useLayoutEffect(() => {
    updateLocation();
    const container = selectionState.container;
    const body = document.body;
    if (body !== null) {
      body.appendChild(container);
      return () => {
        body.removeChild(container);
      };
    }
  }, [selectionState.container, updateLocation]);

  useEffect(() => {
    window.addEventListener("resize", updateLocation);

    return () => {
      window.removeEventListener("resize", updateLocation);
    };
  }, [updateLocation]);

  const onEscape = (event: KeyboardEvent): boolean => {
    event.preventDefault();
    cancelAddComment();
    return true;
  };

  const submitComment = () => {
    if (canSubmit) {
      let quote = editor.getEditorState().read(() => {
        const selection = selectionRef.current;
        return selection ? selection.getTextContent() : "";
      });
      if (quote.length > 100) {
        quote = quote.slice(0, 99) + "…";
      }
      submitAddComment(
        createThread(quote, [createComment(content, (userName || author) , userEmail)]),
        true,
        undefined,
        selectionRef.current
      );
      selectionRef.current = null;
    }
  };

  const onChange = useOnChange(setContent, setCanSubmit, submitComment);

  return (
    <div className="CommentPlugin_CommentInputBox" ref={boxRef}>
      <PlainTextEditor
        className="CommentPlugin_CommentInputBox_Editor"
        onEscape={onEscape}
        onChange={onChange}
        mentionItems={mentionItems}
      />
      <div className="CommentPlugin_CommentInputBox_Buttons">
        <Button
          onClick={cancelAddComment}
          className="CommentPlugin_CommentInputBox_Button"
        >
          Cancel
        </Button>
        <Button
          onClick={submitComment}
          disabled={!canSubmit}
          className="CommentPlugin_CommentInputBox_Button primary"
        >
          Comment
        </Button>
      </div>
    </div>
  );
}
