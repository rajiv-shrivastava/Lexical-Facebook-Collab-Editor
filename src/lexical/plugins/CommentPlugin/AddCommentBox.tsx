import { LexicalEditor, NodeKey } from "lexical";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { JSX } from 'react';
import addIcon from '../../images/icons/addCommentIcon.svg';
export function AddCommentBox({
  anchorKey,
  editor,
  onAddComment,
  onClose,
}: {
  anchorKey: NodeKey;
  editor: LexicalEditor;
  onAddComment: () => void;
  onClose: () => void;
}): JSX.Element {
  const boxRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const boxElem = boxRef.current;
    const rootElement = editor.getRootElement();
    const anchorElement = editor.getElementByKey(anchorKey);

    if (boxElem !== null && rootElement !== null && anchorElement !== null) {
      const { right } = rootElement.getBoundingClientRect();
      const { top } = anchorElement.getBoundingClientRect();
      boxElem.style.left = `${right - 20 + window.scrollX}px`;
      boxElem.style.top = `${top - 30 + window.scrollY}px`;
    }
  }, [anchorKey, editor]);

  useEffect(() => {
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [editor, updatePosition]);

  useLayoutEffect(() => {
    updatePosition();
  }, [anchorKey, editor, updatePosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div className="CommentPlugin_AddCommentBox" ref={boxRef}>
      <button
      style={{display : "flex" , justifyContent : "center", alignItems : "center"}}
        className="CommentPlugin_AddCommentBox_button"
        onClick={onAddComment}
      >
      <img src={addIcon} alt="" />
      </button>
    </div>
  );
}
