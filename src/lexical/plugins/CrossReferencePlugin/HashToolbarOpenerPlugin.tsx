import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { KEY_DOWN_COMMAND } from 'lexical';

export default function HashToolbarOpenerPlugin({ containerRef, setContextMenu } : any) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const removeListener = editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event) => {
        if (event.key === '#' || (event.key === '3' && event.shiftKey)) {
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            let rect = range.getBoundingClientRect();
            if (range.collapsed) {
              const currentRange = range.cloneRange();
              const marker = document.createElement('span');
              marker.style.display = 'inline-block';
              marker.textContent = "\u200B";

              range?.insertNode(marker);
              rect = marker?.getBoundingClientRect();

              const parent = marker.parentNode;
              marker?.remove();
              if (parent) {
                parent?.normalize();
              }

              selection?.removeAllRanges();
              selection?.addRange(currentRange);
            }
          setContextMenu({ x: rect.left, y: rect.bottom });
          }
          return false;
        }
        return false;
      },
      0
    );

    return () => {
      removeListener();
    };
  }, [editor, setContextMenu, containerRef]);

  return null;
}
