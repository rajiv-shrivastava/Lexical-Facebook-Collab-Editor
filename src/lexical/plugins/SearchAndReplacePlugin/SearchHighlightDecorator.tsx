import React, { useEffect, useState } from "react";

interface Match {
  key: string;
  start: number;
  end: number;
}

interface Highlight {
  key: string;
  top: number;
  left: number;
  width: number;
  height: number;
  isSelected: boolean;
}

interface SearchHighlightDecoratorProps {
  editor: any;
  matches: Match[];
  currentMatchIndex: number;
}

export default function SearchHighlightDecorator({
  editor,
  matches,
  currentMatchIndex,
}: SearchHighlightDecoratorProps) {
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  useEffect(() => {
    const newHighlights: Highlight[] = [];
    matches.forEach((match, index) => {
      const element = editor.getElementByKey(match.key);
      if (element && element.firstChild) {
        const textNode = element.firstChild;
        if (textNode.nodeType === Node.TEXT_NODE) {
          const textContent = textNode.textContent || "";
          const safeStart = Math.min(match.start, textContent.length);
          const safeEnd = Math.min(match.end, textContent.length);
          const range = document.createRange();
          try {
            range.setStart(textNode, safeStart);
            range.setEnd(textNode, safeEnd);
          } catch (error) {
            console.error("Error setting range:", error);
            return;
          }
          const rect = range.getBoundingClientRect();
          const editorElement = editor.getRootElement();
          if (editorElement) {
            const editorRect = editorElement.getBoundingClientRect();
            newHighlights.push({
              key: `${match.key}-${match.start}`,
              top: rect.top - editorRect.top,
              left: rect.left - editorRect.left,
              width: rect.width,
              height: rect.height,
              isSelected: index === currentMatchIndex,
            });
          }
        }
      }
    });
    setHighlights(newHighlights);
  }, [matches, currentMatchIndex, editor]);

  return (
    <div
      className="search-highlight-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        width: "100%",
        height: "100%",
      }}
    >
      {highlights.map((highlight) => (
        <div
          key={highlight.key}
          className="search-highlight"
          style={{
            position: "absolute",
            top: highlight.top,
            left: highlight.left,
            width: highlight.width,
            height: highlight.height,
            backgroundColor: highlight.isSelected ? "orange" : "yellow",
            opacity: highlight.isSelected ? 0.7 : 0.4,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}
