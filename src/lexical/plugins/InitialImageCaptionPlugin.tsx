import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isParagraphNode, $isTextNode } from "lexical";
import { useEffect } from "react";
import { $isImageNode, ImageNode } from "../nodes/ImageNode";
import { generateStableImageCaptionId } from "./ImagesPlugin";
import { ColoredNode } from "../nodes/TableNode";
function cssFromCaptionStyle(s: any = {}): string {
  const parts: string[] = [];
  if (s.fontColor) parts.push(`color:${s.fontColor} !important`);
  if (s.fontSize) parts.push(`font-size:${s.fontSize}px !important`);
  if (s.fontFamily) parts.push(`font-family:${s.fontFamily} !important`);
  if (s.lineSpacing) parts.push(`line-height:${s.lineSpacing} !important`);
  if (s.bold === "Yes") parts.push(`font-weight:bold !important`);
  if (s.italic === "Yes") parts.push(`font-style:italic !important`);
  parts.push(`--caption-styled:1`);
  return parts.join("; ");
}

export function InitialImageCaptionPlugin({
  htmlString,
  wpAndTaskId,
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
  wpAndTaskId: string;
  styleConfig?: any;
}) {
  const [editor] = useLexicalComposerContext();

  // Prefer the 'Captions' entry under heading; fallback to the styleConfig itself.
  const CaptionStyle_ =
    styleConfig?.heading?.find((item: any) => item.title === "Captions") ??
    styleConfig ??
    {};

  useEffect(() => {
    if (!htmlString || !wpAndTaskId) return;

    editor.update(() => {
      const root = $getRoot();
      const paras = root.getChildren().filter($isParagraphNode);

      paras.forEach((para, idx) => {
        // 1) find an ImageNode in this paragraph
        const imgNode = para.getChildren().find($isImageNode) as ImageNode | undefined;
        if (!imgNode) return;

        // 2) locate the caption label text node that starts with "Figure"
        let labelPara = para;
        let labelNode = para
          .getChildren()
          .find((n) => $isTextNode(n) && n.getTextContent().startsWith("Figure"));

        if (!labelNode) {
          // search forward for the first non-empty paragraph that has the label
          for (let j = idx + 1; j < paras.length; j++) {
            const candidate = paras[j];
            if (candidate.getTextContent().trim() === "") continue;
            const found = candidate
              .getChildren()
              .find((n) => $isTextNode(n) && n.getTextContent().startsWith("Figure"));
            if (found) {
              labelNode = found;
              labelPara = candidate;
              break;
            }
          }
        }

        if (!labelNode) return;

        // 3) align the caption paragraph according to style (left/center/right)
        const align = (CaptionStyle_?.alignment || "left").toLowerCase();
        labelPara.setFormat(
          align === "right" ? "right" : align === "center" ? "center" : "left"
        );

        // 4) ensure we have a stable caption id on the image, preserving an existing ColoredNode id
        const existingId =
          typeof (labelNode as any).getId === "function"
            ? (labelNode as any).getId()
            : undefined;

        const textCaption = labelNode.getTextContent();
        const figNumber = parseInt(textCaption.match(/\d+/)?.[0] || "1");
        const captionId =
          existingId ||
          generateStableImageCaptionId(textCaption, figNumber, wpAndTaskId);

        (imgNode as any).__captionId = captionId;

        // 5) replace the plain label text node with a ColoredNode if it's not one already
        if (!existingId) {
          const newLabel = new ColoredNode(
            labelNode.getTextContent(), // e.g., "Figure 3:"
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
          // only spacing on the label; bold/italic reserved to the style encoder
          newLabel.setStyle("margin-right: 8px;");
          labelNode.replace(newLabel);
        }

        // 6) idempotently style the caption text AFTER the label inside the same paragraph
        const css = cssFromCaptionStyle(CaptionStyle_);
        const children = labelPara.getChildren();
        const labelIdx = children.findIndex((n) => {
          // after replacement, the label is either a ColoredNode or (rarely) remains a text node
          // match either by id (if present) or by startsWith("Figure")
          if (typeof (n as any).getId === "function") {
            return (n as any).getId() === captionId;
          }
          return $isTextNode(n) && n.getTextContent().startsWith("Figure");
        });

        if (labelIdx >= 0) {
          for (let i = labelIdx + 1; i < children.length; i++) {
            const node: any = children[i];
            if (typeof node.setStyle === "function" && node.getType?.() === "text") {
              node.setStyle(css);
            }
          }
        }
      });
    });
    // Re-run when style changes to re-apply idempotent styling
  }, [editor, htmlString, wpAndTaskId, JSON.stringify(CaptionStyle_)]);

  return null;
}
