import { EditorState, LexicalEditor } from "lexical";
import { useCallback, useEffect, useRef } from "react";
import { $isRootTextContentEmpty, $rootTextContent } from "@lexical/text";
export function useOnChange(
  setContent: (text: string) => void,
  setCanSubmit: (canSubmit: boolean) => void,
  submitComment: () => void
) {
  const canSubmitRef = useRef(false);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        if (canSubmitRef.current) {
          submitComment();
        } else {
          console.log("Cannot submit");
        }
      }
    },
    [submitComment]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return useCallback(
    (editorState: EditorState, _editor: LexicalEditor) => {
      editorState.read(() => {
        const content = $rootTextContent();
        const canSubmit = !$isRootTextContentEmpty(_editor.isComposing(), true);
        setContent(content);
        setCanSubmit(canSubmit);
        canSubmitRef.current = canSubmit;
      });
    },
    [setCanSubmit, setContent]
  );
}
