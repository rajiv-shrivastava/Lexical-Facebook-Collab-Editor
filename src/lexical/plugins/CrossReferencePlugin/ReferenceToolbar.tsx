import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  createCommand,
  LexicalNode,
} from "lexical";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export const INSERT_CROSS_REFERENCE = createCommand("INSERT_CROSS_REFERENCE");
export const UPDATE_REFERENCE_LABEL = createCommand<{
  refId: string;
  newLabel: string;
}>("UPDATE_REFERENCE_LABEL");

export type Reference = {
  id: string;
  label: string;
  elementId?: string;
};

interface IReferenceToolbar {
  references: Reference[];
  setReferences: Dispatch<SetStateAction<Reference[]>>;
  position: { x: number; y: number } | null;
  onClose: () => void;
  IsexistingIdPresent: boolean;
  referencing_array : any
}

export const generateStableId = (text: string) => {
  // More robust hash calculation
  let hash = 5381;
  const cleanText = text.trim().replace(/\s+/g, ' ');
  for (let i = 0; i < cleanText.length; i++) {
    hash = (hash << 5) + hash + cleanText.charCodeAt(i);
  }
  return `h-${Math.abs(hash % 1000000000)}`;
};

const ReferenceToolbar = ({
  references,
  setReferences,
  position,
  onClose,
  IsexistingIdPresent,
  referencing_array = []
}: IReferenceToolbar) => {
  const [editor] = useLexicalComposerContext();
  const [refs2, setRefs2] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!editor) return;


    function collectRefsRecursively(
      node: LexicalNode,
      editor: any,
      refs: Reference[],
      newArray: any[],
      IsexistingIdPresent: boolean,
      seenIds: Set<string>
    ) {
      const textContent = node.getTextContent?.();
      const nodeKey = node.getKey?.();
    
      const isHeading = $isHeadingNode(node);
      const isParagraph = $isParagraphNode(node);
    
      if (!IsexistingIdPresent && textContent && textContent.trim() && nodeKey) {
        const element = editor.getElementByKey(nodeKey);
        if (element) {
          let existingId =
            element.getAttribute("data-ref-id")?.replace("ref-", "") ||
            element.getAttribute("id");
    
          if (!existingId && isHeading) {
            existingId = generateStableId(textContent);
            element.setAttribute("data-ref-id", `ref-${existingId}`);
            element.setAttribute("id", existingId);
          } else if (!existingId && isParagraph) {
            const hasDirectId = element.getAttribute("id") || element.getAttribute("data-ref-id");
            if (!hasDirectId) {
              const spanWithId = element.querySelector("span[id]");
              existingId = spanWithId?.getAttribute("id") || null;
            }
          }
    
          if (existingId && !seenIds.has(existingId)) {
            seenIds.add(existingId);
          const numberString = element.getAttribute('data-number') ?? '';
          const finalLabel = numberString ? `${numberString}. ${textContent}` : textContent;
            newArray.push({ element, id: existingId, label: finalLabel });
            refs.push({ id: existingId, label: finalLabel });
          }
        }
      }
    
      if ($isElementNode(node)) {
        for (const child of node.getChildren()) {
          collectRefsRecursively(child, editor, refs, newArray, IsexistingIdPresent, seenIds);
        }
      }
    }
    
    
    const updateReferences = () => {
      editor.update(() => {
        const root = $getRoot();
        const refs: Reference[] = [];
        const newArray: any[] = [];
        const seenIds = new Set<string>();
    
        collectRefsRecursively(root, editor, refs, newArray, IsexistingIdPresent, seenIds);
    
        setRefs2(newArray);
        setReferences(refs);
      });
    };

    updateReferences();
    return editor.registerUpdateListener(updateReferences);
  }, [editor, setReferences]);

  useEffect(() => {
    if (!editor) return;

    const unregister = editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection) && selection.isCollapsed()) {
          const anchorNode = selection.anchor.getNode();
          if (anchorNode.getTextContent) {
            const text = anchorNode.getTextContent();
            const hashIndex = text.lastIndexOf("#");
            if (hashIndex !== -1) {
              const afterHash = text.slice(hashIndex + 1);
              if (afterHash.length > 0 && afterHash[0] === " ") {
                setQuery("");
              } else {
                const spaceIndex = afterHash.indexOf(" ");
                const queryText =
                  spaceIndex !== -1
                    ? afterHash.slice(0, spaceIndex)
                    : afterHash;
                setQuery(queryText.trim());
              }
            } else {
              setQuery("");
            }
          }
        }
      });
    });
    return unregister;
  }, [editor]);
// helper to safely normalize labels for text-based de-dupe
const normalize = (s: unknown) =>
  typeof s === "string" ? s.trim().replace(/\s+/g, " ").toLowerCase() : "";

const refs2LabelSet = new Set(
  (Array.isArray(refs2) ? refs2 : []).map((r: any) => normalize(r?.label))
);

const mergedRefs = [
  ...(Array.isArray(refs2) ? refs2 : []),
  ...(Array.isArray(referencing_array)
    ? referencing_array.filter((refFromArray: any) => {
        // de-dupe by id (existing logic, but safe)
        const idClash = (Array.isArray(refs2) ? refs2 : []).some(
          (ref: any) => String(ref?.id) === String(refFromArray?.id)
        );

        // de-dupe by label text (your new rule)
        const labelClash = refs2LabelSet.has(normalize(refFromArray?.label));

        return !idClash && !labelClash;
      })
    : []),
];

const filteredRefs = query
  ? mergedRefs?.filter(
      (ref: any) =>
        typeof ref?.label === "string" &&
        ref?.label.toLowerCase().includes(query?.toLowerCase())
    )
  : mergedRefs;

  if (!position) return null;

  const referencesClickHandler = (ref: Reference) => {
    editor.focus();

    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) && selection.isCollapsed()) {
        const anchorNode = selection.anchor.getNode();
        if (anchorNode.getTextContent) {
          const text = anchorNode.getTextContent();
          console.log('text', text)
          const hashIndex = text.lastIndexOf("#");
          if (hashIndex !== -1) {
            const spaceIndex = text.indexOf(" ", hashIndex);
            let newText;
            if (spaceIndex !== -1) {
              newText = text.slice(0, hashIndex) + text.slice(spaceIndex);
            } else {
              newText = text.slice(0, hashIndex);
            }
            (anchorNode as any).setTextContent(newText);
          }
        }
      }
    });

    setQuery("");
    editor.dispatchCommand(INSERT_CROSS_REFERENCE, ref);
    onClose();
  };

  return filteredRefs.length > 0 ? (
    <div
      className="reference-toolbar"
      style={{
        position: "fixed",
        top: position.y,
        left: position.x  ,
        background: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "8px",
        borderRadius: "8px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
        transform: "scale(1.02)",
        maxHeight: "150px",
        overflowY: "auto",
      }}
    >
      <ul style={{ margin: 0, padding: "5px", listStyle: "none" }}>
        {filteredRefs.map((ref: any) => (
          <li
            key={ref.id}
            style={{
              cursor: "pointer",
              padding: "8px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#333",
              transition:
                "background 0.2s ease-in-out, transform 0.1s ease-in-out",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={() => referencesClickHandler(ref)}
          >
            {ref.label}
          </li>
        ))}
      </ul>
    </div>
  ) : (
    <div
      className="reference-toolbar"
      style={{
        position: "fixed",
        top: position.y,
        left: position.x ,
        background: "rgba(255, 255, 255, 0.8)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "8px",
        borderRadius: "8px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
        zIndex: 1000,
        transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
        transform: "scale(1.02)",
      }}
    >
      <p style={{ fontSize: 14, color: "#666" }}>No references found</p>
    </div>
  );
};

export default ReferenceToolbar;
