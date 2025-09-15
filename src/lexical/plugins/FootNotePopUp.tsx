import {
  $createParagraphNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getRoot,
  $nodesOfType,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect, useRef, useState } from 'react';
import { $getAllFootnoteNodes, $isFootnoteNode, FootnoteNode } from '../nodes/FootNotes';

interface Footnote {
  id: string;
  className: string | null;
  content: string;
}

const parseFootnoteContentFromHTML = (htmlString: string) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const footnotesH6 = doc.querySelector('h6[data-footnotes]');
    if (footnotesH6?.textContent) {
      return JSON.parse(footnotesH6.textContent);
    }

    const allH6s = doc.querySelectorAll('h6');
    for (const h6 of Array.from(allH6s)) {
      const text = h6.textContent?.trim() || '';
      if (text.startsWith('{') && text.endsWith('}')) {
        try {
          return JSON.parse(text);
        } catch {
          continue;
        }
      }
    }
  } catch (e) {
    console.error('Error parsing footnote content:', e);
  }
  return {};
};

export default function FootnotePopupPlugin({
  footNotesState,
  setFootNote,
}: {
  footNotesState: string;
  setFootNote: (value: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [popupInfo, setPopupInfo] = useState<{
    domRect: DOMRect;
    id: string;
    number?: number;
  } | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [footnotes, setFootnotes] = useState<Footnote[]>([]);
  const [parsedContent, setParsedContent] = useState<Record<string, string>>({});
  const editorRef = useRef<HTMLDivElement | any>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);
  const previousFootnoteIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedRef = useRef(false);
  const InputRef = useRef<HTMLInputElement | any>(null);


  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);


  useEffect(() => {
    const parsed = parseFootnoteContentFromHTML(footNotesState);
    setParsedContent(parsed);
  }, [footNotesState]);

  useEffect(() => {
    const removeUpdateListener = editor.registerUpdateListener(({ editorState: newEditorState }) => {
      newEditorState.read(() => {
        if (!isMountedRef.current) return;

        const footnoteNodes = $nodesOfType(FootnoteNode);
        const sortedNodes = Array.from(footnoteNodes).sort((a, b) => {
          const domA = editor.getElementByKey(a.getKey());
          const domB = editor.getElementByKey(b.getKey());
          return domA && domB
            ? domA.compareDocumentPosition(domB) & Node.DOCUMENT_POSITION_FOLLOWING
              ? -1
              : 1
            : 0;
        });

        const newFootnotes: Footnote[] = sortedNodes.map((node) => {
          const id = node.getId();
          const existing = footnotes.find((fn) => fn.id === id);
          return {
            id,
            className: node.getClassName(),
            content: existing?.content ?? parsedContent[id] ?? '',
          };
        });

      const newIds = new Set(newFootnotes.map((fn) => fn.id));
const prevIds = previousFootnoteIdsRef.current;
const addedIds = Array.from(newIds).filter((id) => !prevIds.has(id));
const removedIds = Array.from(prevIds).filter((id) => !newIds.has(id));

previousFootnoteIdsRef.current = newIds;

// Remove deleted footnotes
if (removedIds.length > 0) {
  setFootnotes((prev) => prev.filter((fn) => !removedIds.includes(fn.id)));
}

// Update full footnote list with new/updated nodes
setFootnotes(newFootnotes);

// Only show popup for newly inserted nodes (skip on first render)
if (hasInitializedRef.current && addedIds.length > 0) {
  const newId = addedIds[0];
  const newNode = sortedNodes.find((n) => n.getId() === newId);
  if (newNode) {
    const domNode = editor.getElementByKey(newNode.getKey());
    if (domNode) {
      const domRect = domNode.getBoundingClientRect();
      const index = newFootnotes.findIndex((fn) => fn.id === newId);
      setCurrentIndex(index);
      setPopupInfo({
        domRect,
        id: newId,
        number: index + 1,
      });
      InputRef.current?.focus();
      editor.setEditable(false)
                  editor.update(()=>{
          const root = $getRoot();
          const text = $createTextNode('.')
          const para = $createParagraphNode()
          para.append(text)
          if(root) root.append(para)
        })
    }
  }
}

if (!hasInitializedRef.current) {
  hasInitializedRef.current = true;
}

      });
    });

    return () => {
      removeUpdateListener();
    };
  }, [editor, parsedContent, footnotes]);

  useEffect(() => {
    if (currentIndex >= footnotes.length) {
      setCurrentIndex(footnotes.length > 0 ? footnotes.length - 1 : 0);
    }
  }, [footnotes, currentIndex]);

  useEffect(() => {
    if (footnotes.length > 0) {
      const footnoteContents = footnotes.reduce((acc, fn) => {
        acc[fn.id] = fn.content;
        return acc;
      }, {} as Record<string, string>);
      setFootNote(JSON.stringify(footnoteContents));
    }
  }, [footnotes, setFootNote]);

  useEffect(() => {
    const currentId = popupInfo?.id;
    const highlights = document.querySelectorAll('sup[data-footnote-id]');
    highlights.forEach((sup) => {
      const el = sup as HTMLElement;
el.classList.remove('highlighted-footnote');

    });

    if (currentId) {
      const target = document.querySelector(`sup[data-footnote-id="${currentId}"]`) as HTMLElement;
if (target) {
target.classList.add('highlighted-footnote');
}

    }
  }, [popupInfo?.id, currentIndex]);

  useEffect(() => {
    const removeClickListener = editor.registerRootListener((rootElement) => {
      editorRef.current = rootElement;

      const handleClick = (event: MouseEvent) => {
        if (!isMountedRef.current) return;

        const target = event.target as HTMLElement;
        const domNode = target.closest('sup');

        if (!domNode || !editorRef.current?.contains(domNode)) {
          setPopupInfo(null);
          editor.setEditable(true)
                editor.update(() => {
    const root = $getRoot();
    const children = root.getChildren();

    // Example: remove any paragraph with the exact "removing one" text
    children.forEach((child) => {
      if (
        child.getType() === 'paragraph' &&
        child.getTextContent() === '.'
      ) {
        child.remove();
      }
    });
  });
          return;
        }

        editor.update(() => {
          if (!isMountedRef.current) return;

          const lexicalNode = $getNearestNodeFromDOMNode(domNode);
          if ($isFootnoteNode(lexicalNode)) {
            const domRect = domNode.getBoundingClientRect();
            const clickedId = lexicalNode.getId();
            const footnoteNodes = $getAllFootnoteNodes();
            const index = footnoteNodes.findIndex((node) => node.getId() === clickedId);

            if (index !== -1 && isMountedRef.current) {
              setCurrentIndex(index);
              editor.update(() => {
                const root = $getRoot();
                const text = $createTextNode(' ');
                const para = $createParagraphNode();
                para.append(text);
                if (root) root.append(para);
              });
              InputRef.current?.focus();
              setPopupInfo({
                domRect,
                id: clickedId,
                number: index+1,
              });
              editor.setEditable(false)
              InputRef.current?.focus();
                          editor.update(()=>{
          const root = $getRoot();
          const text = $createTextNode('.')
          const para = $createParagraphNode()
          para.append(text)
          if(root) root.append(para)
        })
            }
          }
        });
      };

      rootElement?.addEventListener('click', handleClick);
      return () => {
        rootElement?.removeEventListener('click', handleClick);
      };
    });

    return () => {
      removeClickListener();
    };
  }, [editor]);

  const navigateToFootnote = (index: number) => {
    const footnote = footnotes[index];
    if (!footnote) return;

    const targetSup = document.querySelector(`sup[data-footnote-id="${footnote.id}"]`) as HTMLElement;
    if (targetSup) {
      targetSup.scrollIntoView({ behavior: 'smooth', block: 'center' });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        const updatedRect = targetSup.getBoundingClientRect();
        setPopupInfo({
          id: footnote.id,
          domRect: updatedRect,
          number: index + 1,
        });
        editor.setEditable(false)
                    editor.update(()=>{
          const root = $getRoot();
          const text = $createTextNode('.')
          const para = $createParagraphNode()
          para.append(text)
          if(root) root.append(para)
        })
        setCurrentIndex(index);
      }, 300);
    }
  };

  const handleNext = () => {
    if (footnotes.length === 0) return;
    const nextIndex = (currentIndex + 1) % footnotes.length;
    navigateToFootnote(nextIndex);
  };

  const handlePrevious = () => {
    if (footnotes.length === 0) return;
    const prevIndex = (currentIndex - 1 + footnotes.length) % footnotes.length;
    navigateToFootnote(prevIndex);
  };

  const handleContentChange = (id: string, newContent: string) => {
    setFootnotes((prev) =>
      prev.map((fn) => (fn.id === id ? { ...fn, content: newContent } : fn))
    );
  };

  const closePopup = () => {
      const allHighlights = document.querySelectorAll('sup.highlighted-footnote');
  allHighlights.forEach((el) => el.classList.remove('highlighted-footnote'));
    editor.update(() => {
      const root = $getRoot();
      const children = root.getChildren();
      children.forEach((child) => {
        if (
          child.getType() === 'paragraph' &&
          child.getTextContent() === ' '
        ) {
          child.remove();
        }
      });
    });
    setPopupInfo(null);
    editor.setEditable(true)
          editor.update(() => {
    const root = $getRoot();
    const children = root.getChildren();

    // Example: remove any paragraph with the exact "removing one" text
    children.forEach((child) => {
      if (
        child.getType() === 'paragraph' &&
        child.getTextContent() === '.'
      ) {
        child.remove();
      }
    });
  });
  };

  const currentFootnote = footnotes[currentIndex];
  if (!popupInfo || footnotes.length === 0 || !currentFootnote) return null;

  return (
    <>
      <div
        onClick={closePopup}
        className="footnote-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.1)',
          zIndex: 9998,
        }}
      />
      <div
        className="footnote-popup"
        style={{
          position: 'fixed',
          bottom: 0,
          width: '300px',
          right: '9px',
          height: '90px',
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '8px',
          borderRadius: '6px',
          boxShadow: 'none',
          zIndex: 9999,
        }}
      >
        <strong className="footnote-label">Footnote Number:</strong> {currentIndex + 1}
        <div className="footnote-section" style={{ paddingTop: 10, marginTop: 15 }}>
          <div
            className="footnote-item"
            key={currentFootnote.id}
            style={{ marginBottom: 8 }}
          >
            {/* <span className="footnote-index">{currentIndex + 1}</span> */}
            <textarea
              className="footnote-textarea"
              placeholder='Insert footnote text'
              ref={InputRef}
              id={currentFootnote.id}
              value={currentFootnote.content}
              onChange={(e) => handleContentChange(currentFootnote.id, e.target.value)}
              style={{
                width: '80%',
                height: '20px',
                resize: 'vertical',
                padding: '8px',
                fontSize: '12px',
              }}
            />
          </div>
        </div>
        <div className="footnote-controls">
          <button className="footnote-btn" onClick={closePopup}>Close</button>
          <button className="footnote-btn" onClick={handlePrevious}>{'<'}</button>
          <button className="footnote-btn" onClick={handleNext}>{'>'}</button>
          <span className="footnote-count">
            {/* {currentIndex + 1}/{footnotes.length} */}
          </span>
        </div>
      </div>
    </>
  );
}
