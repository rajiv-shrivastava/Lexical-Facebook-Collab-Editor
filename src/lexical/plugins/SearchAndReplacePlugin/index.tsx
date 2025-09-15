import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getNodeByKey,
  TextNode,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import SearchAndReplaceModal from "./SearchAndReplaceModal";
import SearchHighlightDecorator from "./SearchHighlightDecorator";

export default function SearchAndReplacePlugin() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matches, setMatches] = useState<
    Array<{ key: string; start: number; end: number }>
  >([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [ReplaceBoxOpen, setReplaceBoxOpen] = useState(false);

  useEffect(() => {
    if (searchInputRef && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  function getAllTextNodes(node: any): TextNode[] {
    let textNodes: TextNode[] = [];
    if (node instanceof TextNode) {
      textNodes.push(node);
    }
    if (node.getChildren && typeof node.getChildren === "function") {
      node.getChildren().forEach((child: any) => {
        textNodes = textNodes.concat(getAllTextNodes(child));
      });
    }
    return textNodes;
  }
  const searchForMatches = useCallback(() => {
    if (!isOpen || searchText === "") {
      setMatches([]);
      setCurrentMatchIndex(-1);
      return;
    }
    editor.getEditorState().read(() => {
      const root = $getRoot();
      const allTextNodes = getAllTextNodes(root);
      const newMatches: Array<{ key: string; start: number; end: number }> = [];
      const lowerSearchText = searchText.toLowerCase();

      allTextNodes.forEach((textNode) => {
        const text = textNode.getTextContent();
        const lowerText = text.toLowerCase();
        let startPos = 0;
        while (startPos < lowerText.length) {
          const index = lowerText.indexOf(lowerSearchText, startPos);
          if (index === -1) break;
          newMatches.push({
            key: textNode.getKey(),
            start: index,
            end: index + searchText.length,
          });
          startPos = index + 1;
        }
      });
      setMatches(newMatches);
      setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);
    });
  }, [isOpen, searchText, editor]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const traverseAndReplace = (node: any) => {
    if (node.getTextContent && typeof node.getTextContent === "function") {
      const text = node.getTextContent();
      if (
        text &&
        searchText !== "" &&
        text.toLowerCase().includes(searchText.toLowerCase())
      ) {
        const escapedSearchText = searchText.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );
        const regex = new RegExp(escapedSearchText, "gi");
        const newText = text.replace(regex, replaceText);
        if (node.setTextContent) {
          node.setTextContent(newText);
        }
      }
    }
    if (node.getChildren && typeof node.getChildren === "function") {
      node.getChildren().forEach((child: any) => traverseAndReplace(child));
    }
  };

  const handleReplaceAll = () => {
    editor.update(() => {
      const root = $getRoot();
      traverseAndReplace(root);
    });
    setTimeout(() => {
      searchForMatches();
    }, 0);
  };

  const handleReplace = () => {
    editor.update(() => {
      const match = matches[currentMatchIndex];
      if (match) {
        const node = $getNodeByKey(match.key);
        if (node && node instanceof TextNode) {
          const text = node.getTextContent();
          scrollToMatch(currentMatchIndex);
          const newText =
            text.slice(0, match.start) + replaceText + text.slice(match.end);
          node.setTextContent(newText);
        }
      }
    });
    setTimeout(() => {
      searchForMatches();
    }, 0);
  };

  useEffect(() => {
    searchForMatches();
  }, [searchForMatches]);

  const scrollToMatch = useCallback(
    (index: number) => {
      if (matches.length === 0) return;
      const match = matches[index];
      editor.getEditorState().read(() => {
        const node = $getNodeByKey(match.key);
        if (node && node instanceof TextNode) {
          const domElement = editor.getElementByKey(node.getKey());
          if (domElement) {
            domElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
    },
    [matches, editor]
  );
  const handleNextMatch = useCallback(() => {
    if (matches.length === 0) return;
    const newIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(newIndex);
    scrollToMatch(newIndex);
  }, [currentMatchIndex, matches, scrollToMatch]);

  const handlePreviousMatch = useCallback(() => {
    if (matches.length === 0) return;
    const newIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(newIndex);
    scrollToMatch(newIndex);
  }, [currentMatchIndex, matches, scrollToMatch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        const editorElement : any = editor.getRootElement();
        if (!editorElement.contains(document.activeElement)) {
          return;
        }
        e.preventDefault();
        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const selectedText = selection.getTextContent();
            setSearchText(selectedText);
          }
        });
        setIsOpen(true);
      }
      if (
        e.key === "Enter" &&
        searchInputRef.current === document.activeElement
      ) {
        e.preventDefault();
        handleNextMatch();
      }
    },
    [editor, handleNextMatch]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      const unregister = editor?.registerUpdateListener(() => {
        searchForMatches();
      });
      return () => {
        unregister();
      };
    }
  }, [editor, isOpen, searchForMatches]);

  return (
    <>
      {isOpen && (
        <SearchAndReplaceModal
          handleReplace={handleReplace}
          handleClose={handleClose}
          handleReplaceAll={handleReplaceAll}
          searchText={searchText}
          setSearchText={setSearchText}
          replaceText={replaceText}
          setReplaceText={setReplaceText}
          handleNextMatch={handleNextMatch}
          handlePreviousMatch={handlePreviousMatch}
          matchesCount={matches.length}
          currentMatchIndex={currentMatchIndex}
          searchInputRef={searchInputRef}
          replaceInputRef={replaceInputRef}
          ReplaceBoxOpen={ReplaceBoxOpen}
          setReplaceBoxOpen={setReplaceBoxOpen}
        />
      )}

      <SearchHighlightDecorator
        editor={editor}
        matches={matches}
        currentMatchIndex={currentMatchIndex}
      />
    </>
  );
}
