import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { COMMAND_PRIORITY_CRITICAL, PASTE_COMMAND } from "lexical";
import { useEffect } from "react";

export function ClipboardLoggerPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand<ClipboardEvent>(
      PASTE_COMMAND,
      (event) => {
        const clipboardData = event?.clipboardData;
        if (!clipboardData) return false;

        const html = clipboardData?.getData("text/html");

        if (html) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const fragmentMatch = html?.match(
            /<!--StartFragment-->(.*?)<!--EndFragment-->/s
          );
          const fragmentHtml = fragmentMatch
            ? fragmentMatch[1]
            : doc.body.innerHTML;
          const fragmentDoc = parser?.parseFromString(fragmentHtml, "text/html");
          const children = fragmentDoc.body.children;

          const isOnlyTableWithEmptyParasOnly = Array.from(children)?.every(
            (child) => {
              if (child.tagName.toLowerCase() === "table") {
                return true;
              } else if (child.tagName.toLowerCase() === "p") {
                return child.innerHTML.trim() === "<br>";
              }
              return false;
            }
          );

          if (isOnlyTableWithEmptyParasOnly) {
            // event.preventDefault(); 
            // alert("Copy-pasting table is not currently supported. Please insert a table and copy the content to it directly.");
            // return true;
          }
        }

        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor]);

  return null;
}