import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useState } from "react";
import {
  $getRoot,
  $isTextNode,
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  $createRangeSelection,
  $setSelection,
  TextNode
} from "lexical";

import NSpell from "nspell";
import './spellCheck.css'
import MisspelledWordHighlightDecorator from "./MisspelledWordHighlightDecorator";
import { dictionary_data_aff } from './spell/en_US_aff';
import { dictionary_data_dic } from './spell/en_US_dic';


function debounce(fn: Function, delay: number) {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

export default function SpellCheckPlugin() {
  const [editor] = useLexicalComposerContext();
  const [position, setSuggestionContextMenu] = useState<any>(null);
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [typo, setTypo] = useState<any>(null);
  const [startIndex, setStartIndex] = useState<any>(null);
  const [endIndex, setEndIndex] = useState<any>(null);
  const [matches, setMatches] = useState<
    Array<{ key: string; start: number; end: number }>
  >([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // Load dictionary once
  useEffect(() => {
    const dictionary = new NSpell(dictionary_data_aff, dictionary_data_dic);
    setTypo(dictionary);
  }, []);

  function getAllTextNodes(node: any): TextNode[] {
    let textNodes: TextNode[] = [];
    if (node instanceof TextNode) {
      const dom = editor.getElementByKey(node.getKey());
      if(dom instanceof HTMLElement){
        const style = window.getComputedStyle(dom);
        const notVisible = style.opacity == '0';
        if(!notVisible){
          textNodes.push(node);
        }
      }
    }
    if (node.getChildren && typeof node.getChildren === "function") {
      node.getChildren().forEach((child: any) => {
        textNodes = textNodes.concat(getAllTextNodes(child));
      });
    }
    return textNodes;
  }

  const searchForMatches = useCallback(() => {
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const allTextNodes = getAllTextNodes(root);
      const newMatches: Array<{ key: string; start: number; end: number }> = [];

      allTextNodes.forEach((textNode) => {
        const text = textNode.getTextContent();
        const wordRegex = /\b[a-zA-Z']+\b/g; // Regex to match words
        let match;
        while ((match = wordRegex.exec(text)) !== null) {
          const word = match[0];
          const start = match.index;
          const end = start + word.length;

          if (!typo?.correct(word)) {
            newMatches.push({
              key: textNode.getKey(),
              start,
              end,
            });
          }
        }
      });
      setMatches(newMatches);
      setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);
    });
  }, [editor, typo]);

  useEffect(() => {
    if (typo) {
      searchForMatches();
    }
  }, [typo, searchForMatches]);

  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.closest && target.closest(".suggestions-toolbar")) return null;

      setSuggestionContextMenu(null);
      setSuggestedWords([]);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const isHidden = (el: HTMLElement): boolean => {
    const style = window.getComputedStyle(el);
    return (
      style.opacity === '0' ||
      style.display === 'none' ||
      style.visibility === 'hidden'
    );
  };

  const handleClick = (event: any) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      // Get the anchor node and offset
      const node = selection.anchorNode;
      const offset = selection.anchorOffset;

      if (!node || node.nodeType !== Node.TEXT_NODE) {
        return; // not a text node
      }
      
      const parentEl = node.parentElement;
      const grandParentEl = parentEl?.parentElement;

      if (
        (parentEl && isHidden(parentEl)) ||
        (grandParentEl && isHidden(grandParentEl))
      ) {
        return; // skip hidden content
      }

      const text = node.textContent;
      if (!text) {
        return;
      }

      // Find the word boundaries around the click position
      const before = text.slice(0, offset);
      const after = text.slice(offset);

      const startMatch = before.match(/\b\w+$/);
      const endMatch = after.match(/^\w+\b/);

      const startIndex = startMatch
        ? before.length - startMatch[0].length
        : offset;
      const endIndex = endMatch ? offset + endMatch[0].length : offset;

      setStartIndex(startIndex)
      setEndIndex(endIndex)

      const word = text.slice(startIndex, endIndex);

      // Get bounding rect of the range covering just this word
      const wordRange = document.createRange();
      wordRange.setStart(node, startIndex);
      wordRange.setEnd(node, endIndex);

      const rect = wordRange.getBoundingClientRect();

      if (!typo.correct(word) && word.length > 0) {
        const suggestions = typo.suggest(word);
        const position = {
          x: rect.left,
          y: rect.bottom,
        };
        setSuggestedWords(suggestions);
        setSuggestionContextMenu(position);
      }
    }
  };

  // const debouncedSearchForMatches = debounce(() => {
  //   typo && searchForMatches();
  // }, 1000);
useEffect(() => {
  if (!typo) return;

  const interval = setInterval(() => {
    searchForMatches();
  }, 15000); 

  return () => clearInterval(interval);
}, [typo, searchForMatches]);

  useEffect(() => {

    let currentRootElement: any = null;

    const handleClickOutside = (event: any) => {
      if (currentRootElement && currentRootElement?.contains(event.target)) {
        setSuggestedWords([]);
        setSuggestionContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Register the click listener
    const removeClickListener = editor.registerRootListener(
      (rootElement, prevRootElement) => {
        if (prevRootElement) {
          prevRootElement.removeEventListener("click", handleClick);
        }
        if (rootElement) {
          currentRootElement = rootElement;
          rootElement.addEventListener("click", handleClick);
        }
      }
    );

    const removeUpdateListener = editor.registerUpdateListener(() => {
      //for removing uncleaned red underline nodes if the text is cleared
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const allTextNodes = getAllTextNodes(root).map((node) => node.getKey());

        setMatches((prevMatches) =>
          prevMatches.filter((match) => allTextNodes.includes(match.key))
        );
      });

      // if suggestion box is open, validate the word still exists
      if (startIndex !== null && endIndex !== null && position) {
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const allTextNodes = getAllTextNodes(root);

          let isStillValid = false;

          for (const node of allTextNodes) {
            const text = node.getTextContent();
            if (startIndex < text.length && endIndex <= text.length) {
              const word = text.slice(startIndex, endIndex);
              if (word && !typo?.correct(word)) {
                isStillValid = true;
              }
            }
          }

          if (!isStillValid) {
            setSuggestedWords([]);
            setSuggestionContextMenu(null);
            setStartIndex(null);
            setEndIndex(null);
          }
        });
      }

      // debouncedSearchForMatches();
    });

    return () => {
      removeClickListener();
      removeUpdateListener();

      document.removeEventListener("click", handleClickOutside);

      if (currentRootElement) {
        currentRootElement.removeEventListener("click", handleClick);
      }
    };
  }, [editor, typo, startIndex, endIndex, position]);

  //this replaces the misspelled word by slicing the entire text content on the basis of startIndex & endIndex of missplled word. 
  const replaceWord = (keyWord: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      const startKey = selection.anchor.getNode().getKey();
      const endKey = selection.focus.getNode().getKey();

      const startNode = $getNodeByKey(startKey);
      const endNode = $getNodeByKey(endKey);

      if ($isTextNode(startNode) && $isTextNode(endNode)) {
        const startText = startNode.getTextContent();
        const endText = endNode.getTextContent();
        
        //creating a new text node with the corrected word and replacing the entire content
        const newText = startText.slice(0, startIndex) + keyWord + endText.slice(endIndex);

        const newTextNode = $createTextNode(newText);

        startNode.replace(newTextNode);
        
        //update the selection to the end of the replaced word
        const newKey = newTextNode.getKey();
        const newOffset = startIndex + keyWord.length;

        const newSelection = $createRangeSelection()

        newSelection.anchor.set(newKey, newOffset, 'text');
        newSelection.focus.set(newKey, newOffset, 'text')

        $setSelection(newSelection);
        
        //closes the suggestions menu
        setSuggestionContextMenu(null);
      }
    });
  }

  return <>
    {position ? suggestedWords.length > 0 && (
      <div
        className="suggestions-toolbar"
        style={{
          position: "fixed",
          top: position.y,
          left: position.x,
          backgroundColor: "#fff",
          border: "1px solid #dcdcdc",
          borderRadius: "6px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          padding: "6px 0",
          zIndex: 1000,
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          transform: "translateY(0)",
          minWidth: "180px",
          maxWidth: "260px",
          maxHeight: "160px",
          overflowY: "auto",
          fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
        }}
      >
        <ul style={{ margin: 0, padding: "5px", listStyle: "none" }}>
          {suggestedWords.map((keyWord: any, index: any) => (
            <li
              key={index}
              style={{
                cursor: "pointer",
                padding: "10px 16px",
                borderRadius: 0,
                fontSize: "14px",
                color: "#1a1a1a",
                whiteSpace: "nowrap",
                transition: "background 0.15s ease-in-out",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
              onClick={() => replaceWord(keyWord)}
            >
              {keyWord}
            </li>
          ))}
        </ul>
      </div>
    ) : null}
    <MisspelledWordHighlightDecorator
      matches={matches}
      currentMatchIndex={currentMatchIndex}
      editor={editor}
    />
  </>
}
