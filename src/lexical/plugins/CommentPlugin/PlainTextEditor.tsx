import { EditorState, LexicalEditor } from "lexical";
import ExampleTheme from "../../ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { EscapeHandlerPlugin } from "./EscapeHandlerPlugin";
import { MentionNode } from "../../nodes/MentionNode";
import MentionsPlugin from "../MentionsPlugin";

export function PlainTextEditor({
  className,
  autoFocus,
  onEscape,
  onChange,
  editorRef,
  placeholder = "Type a comment...",
  mentionItems,
}: {
  autoFocus?: boolean;
  className?: string;
  editorRef?: { current: null | LexicalEditor };
  onChange: (editorState: EditorState, editor: LexicalEditor) => void;
  onEscape: (e: KeyboardEvent) => boolean;
  placeholder?: string;
  mentionItems: any;
}) {
  const initialConfig = {
    namespace: "Commenting",
    nodes: [MentionNode],
    onError: (error: Error) => {
      throw error;
    },
    theme: ExampleTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="CommentPlugin_CommentInputBox_EditorContainer">
        <PlainTextPlugin
          contentEditable={<ContentEditable className={className} />}
          placeholder={<></>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <HistoryPlugin />
        {autoFocus !== false && <AutoFocusPlugin />}
        <EscapeHandlerPlugin onEscape={onEscape} />
        <ClearEditorPlugin />
        {editorRef !== undefined && <EditorRefPlugin editorRef={editorRef} />}
      </div>

      <MentionsPlugin mentionItems={mentionItems} />
    </LexicalComposer>
  );
}
