import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { 
  $getRoot, 
  $createTextNode, 
  $getSelection, 
  $setSelection, 
  $createRangeSelection,
  $isRangeSelection,
  RangeSelection,
  TextNode,
  LexicalNode
} from 'lexical';
import { $isHeadingNode, HeadingNode } from '@lexical/rich-text';
import { useEffect, useCallback } from 'react';

export function NestedHeadingPlugin() {
  const [editor] = useLexicalComposerContext();

  const updateHeadingNumbers = useCallback(() => {
    const root = $getRoot();
    const children = root.getChildren();
    
    const headingCounts = { h1: 0, h2: 0, h3: 0, h4: 0 };
    
    children.forEach((child: any) => {
      if (child.getType() === 'heading') {
        const tag = child.getTag();
        const level = parseInt(tag.charAt(1));

        // Reset deeper level counts when we encounter a higher level heading
        if (level === 1) {
          headingCounts.h2 = 0;
          headingCounts.h3 = 0;
          headingCounts.h4 = 0;
        } else if (level === 2) {
          headingCounts.h3 = 0;
          headingCounts.h4 = 0;
        } else if (level === 3) {
          headingCounts.h4 = 0;
        }

        // Increment the current level count
        if (tag === 'h1') {
          headingCounts.h1++;
        } else if (tag === 'h2') {
          // Ensure h1 is at least 1 if we have h2
          if (headingCounts.h1 === 0) headingCounts.h1 = 1;
          headingCounts.h2++;
        } else if (tag === 'h3') {
          // Ensure h1 and h2 are at least 1 if we have h3
          if (headingCounts.h1 === 0) headingCounts.h1 = 1;
          if (headingCounts.h2 === 0) headingCounts.h2 = 1;
          headingCounts.h3++;
        } else if (tag === 'h4') {
          // Ensure h1, h2, and h3 are at least 1 if we have h4
          if (headingCounts.h1 === 0) headingCounts.h1 = 1;
          if (headingCounts.h2 === 0) headingCounts.h2 = 1;
          if (headingCounts.h3 === 0) headingCounts.h3 = 1;
          headingCounts.h4++;
        }

        // Build the heading number string (for CSS only)
        let numberString = '';
        if (level === 1) {
          numberString = `${headingCounts.h1}`;
        } else if (level === 2) {
          numberString = `${headingCounts.h1}.${headingCounts.h2}`;
        } else if (level === 3) {
          numberString = `${headingCounts.h1}.${headingCounts.h2}.${headingCounts.h3}`;
        } else if (level === 4) {
          numberString = `${headingCounts.h1}.${headingCounts.h2}.${headingCounts.h3}.${headingCounts.h4}`;
        }

        // Only update if the numberString has actually changed to avoid unnecessary updates
        if (child.getType() === 'heading') {
          const currentNumberString = (child as any).__numberString;
          if (currentNumberString !== numberString) {
            const writableHeading: any = child.getWritable();
            writableHeading.__numberString = numberString;
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    // Use update listener instead of transform to avoid recursion
    const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
      editor.update(() => {
        updateHeadingNumbers();
      });
    });

    return removeUpdateListener;
  }, [editor, updateHeadingNumbers]);

  useEffect(() => {
    // Initial numbering update
    editor.update(() => {
      updateHeadingNumbers();
    });
  }, [editor, updateHeadingNumbers]);

  return null;
}