import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function PageMarkerPlugin1() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(() => {
      const root = editor.getRootElement();
      if (!root) return;

      // Clear existing markers if any
      root.querySelectorAll('.page-break-marker').forEach(el => el.remove());

      const children = Array.from(root.children);
      let cumulativeHeight = 0;
      let pageHeight = 200;
      let pageCounter = 1;

      children.forEach((child:any) => {
        const height = child.offsetHeight;

        if (cumulativeHeight + height > pageHeight) {
          // Insert visual marker
          const marker = document.createElement('div');
          marker.textContent = `${++pageCounter}`;
          marker.className = 'page-break-marker';
          marker.style.cssText = 'height: 1px; border-bottom: 2px dashed red; margin: 10px 0; position: relative;';

          root.insertBefore(marker, child);
          cumulativeHeight = 0;
        //   console.log('worked',marker)
        }

        cumulativeHeight += height;
      });
    });
  }, [editor]);

  return null;
}
