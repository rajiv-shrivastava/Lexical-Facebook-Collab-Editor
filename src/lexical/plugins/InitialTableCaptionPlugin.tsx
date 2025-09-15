import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isParagraphNode } from "lexical";
import { useEffect } from "react";
import { generateStableCaptionId } from "./TablePlugin";
import { ColoredNode } from "../nodes/TableNode";
import { $isTableNode } from "../nodes/CustomTableNode/src";

function cssFromCaptionStyle(s: any = {}): string {
  // Idempotent CSS string (overwrites on each reload). We encode bold/italic
  // in CSS to avoid toggleFormat double-flips.
  const parts: string[] = [];
  if (s.fontColor) parts.push(`color:${s.fontColor} !important`);
  if (s.fontSize) parts.push(`font-size:${s.fontSize}px !important`);
  if (s.fontFamily) parts.push(`font-family:${s.fontFamily} !important`);
  if (s.lineSpacing) parts.push(`line-height:${s.lineSpacing} !important`);
  // if (s.leadingSpace) parts.push(`padding-left:${s.leadingSpace}em !important`);
  // if (s.trailingSpace) parts.push(`padding-right:${s.trailingSpace}em !important`);
  if (s.bold === "Yes") parts.push(`font-weight:bold !important`);
  if (s.italic === "Yes") parts.push(`font-style:italic !important`);
  // Optional sentinel for debugging/idempotency checks
  parts.push(`--caption-styled:1`);
  return parts.join("; ");
}

export function InitialTableCaptionPlugin({
  htmlString,
  styleConfig = {
    fontColor: "black",
    fontSize: "12",
    bold: "No",
    italic: "No",
    alignment: "left",
    fontFamily: "Arial",
    leadingSpace: "0",
    lineSpacing: "1",
    trailingSpace: "0",
  },
}: {
  htmlString: string;
  styleConfig?: any;
}) {
  const [editor] = useLexicalComposerContext();

  // Prefer the 'Captions' entry under heading, fallback to styleConfig itself.
  const CaptionStyle_ =
    styleConfig?.heading?.find((item: any) => item.title === "Captions") ??
    styleConfig ??
    {};

  useEffect(() => {
    if (!htmlString) return;

    editor.update(() => {
      const root = $getRoot();
      const tableNodes = root.getChildren().filter($isTableNode);

      tableNodes.forEach((tableNode: any, index: number) => {
        const previousNode = tableNode.getPreviousSibling();

        if (previousNode && $isParagraphNode(previousNode)) {
          // Align the whole caption paragraph from style
          const align = (CaptionStyle_?.alignment || "left").toLowerCase();
          previousNode.setFormat(
            align === "right" ? "right" : align === "center" ? "center" : "left"
          );

          const children = previousNode.getChildren();

          // Find the label part ("Table N:") if present
          const labelIdx = children.findIndex((child: any) =>
            child.getTextContent().startsWith("Table")
          );
          const labelCandidate: any = labelIdx >= 0 ? children[labelIdx] : null;

          if (labelCandidate) {
            const existingId = labelCandidate.getId?.();

            if (existingId) {
              // Label is already a ColoredNode with ID – just re-bind to table
              tableNode.__captionId = existingId;
            } else {
              // Make/replace a proper ColoredNode label with a stable ID
              const captionTextForHash = previousNode.getTextContent();
              const captionId = generateStableCaptionId(captionTextForHash, index);
              tableNode.__captionId = captionId;

              const newLabelNode = new ColoredNode(
                labelCandidate.getTextContent(), // keep text, e.g., "Table 1:"
                CaptionStyle_?.fontColor || "black",
                `${CaptionStyle_?.fontSize}px`,
                CaptionStyle_?.bold === "Yes" ? "bold" : "normal",
                CaptionStyle_?.italic === "Yes" ? "italic" : "normal",
                CaptionStyle_?.alignment || "left",
                CaptionStyle_?.fontFamily || "Arial",
                CaptionStyle_?.leadingSpace || "0",
                CaptionStyle_?.lineSpacing || "1",
                CaptionStyle_?.trailingSpace || "0",
                captionId
              );
              // Only spacing here; do not force bold/italic on the label via inline CSS
              newLabelNode.setStyle("margin-right: 8px;");
              labelCandidate.replace(newLabelNode);
            }

            // Style the CAPTION TEXT after the label (idempotent via setStyle overwrite)
            const css = cssFromCaptionStyle(CaptionStyle_);
            for (let i = labelIdx + 1; i < children.length; i++) {
              const node: any = children[i];
              // Only style text nodes (skip spaces/linebreaks is optional)
              if (typeof node.setStyle === "function" && node.getType?.() === "text") {
                node.setStyle(css);
              }
            }
          }
        }
      });
    });
    // Re-run if style changes too (so reload OR new theme both restyle the caption text)
  }, [editor, htmlString, JSON.stringify(CaptionStyle_)]);

  return null;
}
