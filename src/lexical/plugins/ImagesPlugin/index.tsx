import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
  $createLineBreakNode,
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isParagraphNode,
  $isRootOrShadowRoot,
  $isTextNode,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
  PASTE_COMMAND,
} from "lexical";
import { useEffect, useRef, useState } from "react";
import * as React from "react";

import {
  $createImageNode,
  $isImageNode,
  ImageNode,
  ImagePayload,
} from "../../nodes/ImageNode";
import Button from "../../ui/Button";
import { DialogActions, DialogButtonsList } from "../../ui/Dialog";
import FileInput from "../../ui/FileInput";
import TextInput from "../../ui/TextInput";
import { CAN_USE_DOM } from "../../utils/canUseDOM";
import { ColoredNode } from "../../nodes/TableNode";

export type InsertImagePayload = Readonly<ImagePayload>;

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  CAN_USE_DOM ? (targetWindow || window).getSelection() : null;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> =
  createCommand("INSERT_IMAGE_COMMAND");

export function InsertImageUriDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");
  const isDisabled = src === "";

  return (
    <>
      <TextInput
        label="Image URL"
        placeholder="i.e. https://source.unsplash.com/random"
        onChange={setSrc}
        value={src}
        data-test-id="image-modal-url-input"
      />
      <TextInput
        label="Alt Text"
        placeholder="Random unsplash image"
        onChange={setAltText}
        value={altText}
        data-test-id="image-modal-alt-text-input"
      />
      <DialogActions>
        <Button
          data-test-id="image-modal-confirm-btn"
          disabled={isDisabled}
          onClick={() =>
            {
const img = new Image();
            img.onload = () => {
              let finalSrc = src;
              if (img.height > 600) {
                const scale = 600 / img.height;
                const canvas = document.createElement("canvas");
                canvas.height = 600;
                canvas.width = img.width * scale;
        
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  finalSrc = canvas.toDataURL("image/png");
        
                }
              }
              onClick({ altText, src });
            };
            img.onerror = () => {
              alert("Failed to load image from the provided URL.");
            };
            img.src = src;
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export function InsertImageUploadedDialogBody({
  onClick,
}: {
  onClick: (payload: InsertImagePayload) => void;
}) {
  const [src, setSrc] = useState("");
  const [altText, setAltText] = useState("");

  const isDisabled = src === "";

  const loadImage = (files: FileList | null) => {
    const reader = new FileReader();
    reader.onload = function () {
      if (typeof reader.result === "string") {
        setSrc(reader.result);
      }
      return "";
    };
    if (files !== null) {
      reader.readAsDataURL(files[0]);
    }
  };

  return (
    <>
      <FileInput
        label="Image Upload"
        onChange={loadImage}
        accept="image/*"
        data-test-id="image-modal-file-upload"
      />
      <TextInput
        label="Alt Text"
        placeholder="Descriptive alternative text"
        onChange={setAltText}
        value={altText}
        data-test-id="image-modal-alt-text-input"
      />
      <DialogActions>
        <Button
          data-test-id="image-modal-file-upload-btn"
          disabled={isDisabled}
          onClick={() =>{
const img = new Image();
            img.onload = () => {
              console.log(`Loaded image dimensions: ${img.width}x${img.height}`);
              if (img.width > 2000 && img.height > 2000) {
                alert("Image dimensions can not 2000x2000.");
                return;
              }
              let finalSrc = src;
              if (img.height > 600) {
                const scale = 600 / img.height;
                const canvas = document.createElement("canvas");
                canvas.height = 600;
                canvas.width = img.width * scale;
        
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  finalSrc = canvas.toDataURL("image/png");
        
                }
              }
              onClick({ altText, src });
            };
            img.onerror = () => {
              alert("Failed to load image from the provided URL.");
            };
            img.src = src;
        }}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  );
}

export function InsertImageDialog({
  activeEditor,
  onClose,
  enableCaptions,
}: {
  activeEditor: LexicalEditor;
  onClose: () => void;
  enableCaptions: boolean;
}): JSX.Element {
  const [mode, setMode] = useState<null | "file">("file");

  const hasModifier = useRef(false);

  useEffect(() => {
    hasModifier.current = false;
    const handler = (e: KeyboardEvent) => {
      hasModifier.current = e.altKey;
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [activeEditor]);

  const onClick = (payload: InsertImagePayload) => {
    activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
    console.log("line 202 imageplugin insert image");
    onClose();
  };

  return (
    <>
      {mode === "file" && <InsertImageUploadedDialogBody onClick={onClick} />}
    </>
  );
}

export function handlePaste(
  event: ClipboardEvent,
  editor: LexicalEditor,
  caption: string,
  enableCaptions: boolean,
  wpAndTaskId?: string,
  styleConfig?: any
) {
  event.preventDefault();
  const clipboardData: any = event.clipboardData;
  if (!clipboardData) return false;
  const items: any = clipboardData.items;
  if (!items || items.length === 0) return false;
  let imageInserted = false;
  let textInserted = false;
  const item = items.length > 1 ? items[1] : items[0];
  let int = 1;
  if (int === 1) {
    int = 2;
    if (item.type === "text/html" && !imageInserted) {
      const htmlData = clipboardData.getData("text/html");
      const doc = new DOMParser().parseFromString(htmlData, "text/html");
      const imgTag: any = doc.querySelector("img");
      if (imgTag && imgTag.src) {
        fetch(imgTag.src)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], "pasted-image.png", {
              type: "image/png",
            });
            handleImagePaste(file, editor, enableCaptions, wpAndTaskId, styleConfig);
          })
          .catch((err) => console.error("Error fetching pasted image:", err));

        imageInserted = true;
      }
    } else if (item.type.startsWith("image/") && !imageInserted) {
      const file = item.getAsFile();
      if (file) {
        handleImagePaste(file, editor,enableCaptions , wpAndTaskId , styleConfig);
        imageInserted = true;
      }
    }
    //  else if (item.type.startsWith("text") && !textInserted) {
    //   const text = clipboardData.getData("text/plain");
    //   handleTextPaste(text, editor);
    //   textInserted = true;
    // }
  }
  if (!imageInserted && !textInserted) {
    return false;
  }

  return true;
}

function handleImagePaste(file: File, editor: LexicalEditor, enableCaptions: boolean , wpAndTaskId?: any , styleConfig?: any) {
     const CaptionStyle = styleConfig?.heading?.filter((item : any) => item.title === 'Captions')
    const CaptionStyle_ = CaptionStyle && CaptionStyle[0];
  const reader = new FileReader();
  reader.onload = () => {
    const imageSrc = reader.result;
 const img:any = new Image();

    img.onload = () => {
const img = new Image();
            img.onload = () => {
              let finalSrc = imageSrc;
              if (img.height > 600) {
                const scale = 600 / img.height;
                const canvas = document.createElement("canvas");
                canvas.height = 600;
                canvas.width = img.width * scale;
        
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  finalSrc = canvas.toDataURL("image/png");
        
                }
              }
            };

    
    const altText = file.name;
    const payload = { altText, src: imageSrc as string };

    editor.update(() => {
      const rootNode = $getRoot();
      const labelNodes = rootNode
        .getChildren()
        .filter(
          (node) =>
            $isParagraphNode(node) &&
            node.getChildren().some((child) =>
              child.getTextContent().startsWith("Figure")
            )
        );

      const figureCount = labelNodes.length + 1;
      const figureLabel = `Figure ${figureCount}:`
      const id = generateStableImageCaptionId("Figure", figureCount, wpAndTaskId);

      const labelNode = new ColoredNode(figureLabel,   CaptionStyle_?.fontColor || "black",
          `${CaptionStyle_?.fontSize}px`,
          CaptionStyle_?.bold === "Yes" ? "bold" : "normal",
          CaptionStyle_?.italic === "Yes" ? "italic" : "normal",
          CaptionStyle_?.alignment || "left",
          CaptionStyle_?.fontFamily || "Arial",
          CaptionStyle_?.leadingSpace || "0",
          CaptionStyle_?.lineSpacing || "1",
          CaptionStyle_?.trailingSpace || "0", id);
      (labelNode as any).__captionId = id;

      const imageNode = $createImageNode({ ...payload, });
        (imageNode as any).__captionId = id;

        const containerNode = $createParagraphNode();
        containerNode.setFormat("left");
        const breakNode = $createLineBreakNode();
        containerNode.append(imageNode, breakNode);
        
        if (enableCaptions) {
          const captionText = "";
          const captionNode = $createTextNode(captionText);
          captionNode.setStyle(
            "color: black; font-style: italic; font-weight: bold;"
          );
          containerNode.append(labelNode, captionNode);
        }
        
        $insertNodes([containerNode]);

        if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
          $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
        }
      });

      // Update figure numbers after paste
      setTimeout(() => {
        updateFigureNumbers(editor);
      }, 0);
    }
img.onerror = () => {
      console.error("Failed to load image for dimension check.");
    };

    img.src = imageSrc;
  };
  reader.readAsDataURL(file);
}

function isValidImageUrl(url: string) {
  return url.match(/\.(jpeg|jpg|gif|png|bmp|svg)$/i);
}

// Global figure counter
let figureCount = 0;
const figureRegistry = new Map<string, number>();

// ... existing code ...

export const updateFigureNumbers = (editor: LexicalEditor) => {
  editor.update(() => {
    const rootNode = $getRoot();
    const paragraphs = rootNode.getChildren().filter($isParagraphNode);
    
    let currentIndex = 1;
    paragraphs.forEach(para => {
      const imageNode = para.getChildren().find($isImageNode);
      if (imageNode) {
        // Update figure number in caption
        const captionNodes = para.getChildren().filter(n => 
          n instanceof ColoredNode && n.getTextContent().startsWith("Figure")
        );
        
        if (captionNodes.length > 0) {
          const captionNode = captionNodes[0] as ColoredNode;
          const currentText = captionNode.getTextContent();
          
          // Extract existing caption text after the colon
          const colonIndex = currentText.indexOf(":");
          const existingCaption = colonIndex !== -1 ? currentText.slice(colonIndex + 1) : "";
          
          // Preserve existing caption while updating the number
          const newText = `Figure ${currentIndex}:${existingCaption}`;
          captionNode.setTextContent(newText);
          
          figureRegistry.set(imageNode.getKey(), currentIndex);
          currentIndex++;
        }
      }
    });
    
    // Update global counter
    figureCount = currentIndex - 1;
  });
};

// ... rest of the code ...

export default function ImagesPlugin({
  enableCaptions = true,
  wpAndTaskId,
  styleConfig
}: {
  enableCaptions?: boolean;
  wpAndTaskId: string;
  styleConfig?: any;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();
  const [caption, setCaption] = useState<string>("");
  const CaptionStyle = styleConfig?.heading?.filter(
    (item: any) => item.title === "Captions"
  );
  const CaptionStyle_ = CaptionStyle && CaptionStyle[0];
  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor");
    }

    updateFigureNumbers(editor);

    return mergeRegister(
      // editor.registerCommand<InsertImagePayload>(
      //   INSERT_IMAGE_COMMAND,
      //   (payload) => {
      //     figureCount += 1;
      //     if (captionsEnabled) {
      //       const labelNode = $createTextNode(`Figure ${figureCount}:`);
      //       labelNode.setStyle(
      //         "font-weight: bold; display: block; text-align: center; margin-top: 5px; font-size: 15x;"
      //       );

      //       const imageNode = $createImageNode({ ...payload });
      //       const containerNode = $createParagraphNode();
      //       containerNode.setFormat("left");

      //       const breakNode = $createLineBreakNode();
      //       const captionText = caption.trim() === "" ? "" : caption;

      //       const captionNode = $createTextNode(captionText);
      //       captionNode.setStyle(
      //         captionText
      //           ? "color: black; font-style: italic; font-weight: bold;"
      //           : "color: gray; font-style: italic; font-weight: normal;"
      //       );

      //       containerNode.append(imageNode, breakNode, labelNode, captionNode);
      //       $insertNodes([containerNode]);

      //       if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
      //         $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
      //       }
      //     } else {
      //       // Insert image without caption and label if captions are disabled
      //       const imageNode = $createImageNode(payload);
      //       const containerNode = $createParagraphNode();
      //       containerNode.setFormat("left");
      //       const breakNode = $createLineBreakNode();
      //       containerNode.append(imageNode, breakNode);
      //       $insertNodes([containerNode]);

      //       if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
      //         $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
      //       }
      //     }

      //     editor.update(() => {
      //       const rootNode = $getRoot();
      //       const ImageNodes = rootNode
      //         .getChildren()
      //         .filter((node) => $isParagraphNode(node));
      //       let index1 = 1;
      //       ImageNodes.forEach((ImageNode, index) => {
      //         const labelNode = ImageNode.getChildren().find((child) =>
      //           child.getTextContent().startsWith("Figure")
      //         );
      //         const imageNumber = `Figure ${index1}:`;
      //         const id = generateStableImageCaptionId('labelText', figureCount);
      //         if (labelNode) {
      //           const labelNode1 = new ColoredNode(
      //             imageNumber,
      //             "black",
      //             id
      //           );
      //           labelNode.replace(labelNode1);
      //           index1++;
      //         }
      //       });
      //     });

      //     return true;
      //   },
      //   COMMAND_PRIORITY_EDITOR
      // ),
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          figureCount += 1;
          const id = generateStableImageCaptionId('Figure', figureCount ,wpAndTaskId);
          const figureLabel = "Figure 0:"; // Temporary placeholder
          
          if (enableCaptions) {
        const figureLabel = `Figure ${figureCount}:`;
        const id = generateStableImageCaptionId("Figure", figureCount, wpAndTaskId);
        const labelNode = new ColoredNode(figureLabel,  CaptionStyle_?.fontColor || "black",
        `${CaptionStyle_?.fontSize}px`,
        CaptionStyle_?.bold === "Yes" ? "bold" : "normal",
        CaptionStyle_?.italic === "Yes" ? "italic" : "normal",
        CaptionStyle_?.alignment || "left",
        CaptionStyle_?.fontFamily || "Arial",
        CaptionStyle_?.leadingSpace || "0",
        CaptionStyle_?.lineSpacing || "1",
        CaptionStyle_?.trailingSpace || "0", id);
        (labelNode as any).__captionId = id;
            const imageNode = $createImageNode({ ...payload });
            (imageNode as any).__captionId = id;
            const containerNode = $createParagraphNode();
            containerNode.setFormat("left");

            const captionText = caption.trim() === "" ? "" : caption;

            const captionNode = $createTextNode(captionText);
            captionNode.setStyle(
              captionText
                ? "color: black; font-style: italic; font-weight: bold;"
                : "color: gray; font-style: italic; font-weight: normal;"
            );
      
            containerNode.append(imageNode, labelNode, captionNode);
            $insertNodes([containerNode]);
            
            if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
              $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
            }
          } else {
            // Insert image without caption and label if captions are disabled
            const imageNode = $createImageNode(payload);
            const containerNode = $createParagraphNode();
            containerNode.setFormat("left");
            containerNode.append(imageNode);
            $insertNodes([containerNode]);

            if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
              $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
            }
          }
      
          // Update figure numbers after insertion
          setTimeout(() => {
            updateFigureNumbers(editor);
          }, 0);
      
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),

      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event);
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return onDrop(event, editor);
        },
        COMMAND_PRIORITY_HIGH
      ),
      editor.registerCommand<ClipboardEvent>(
        PASTE_COMMAND,
        (event) => {
          const items:any = event.clipboardData?.items;
          if(items?.length <= 2 && items?.length ){
            return handlePaste(event, editor, caption , enableCaptions, wpAndTaskId, styleConfig);
          }else{
            return false;
          }
          
        },
        COMMAND_PRIORITY_HIGH
      ),
      
      // Listen for image deletions
      editor.registerMutationListener(ImageNode, (mutations) => {
        let needsUpdate = false;
        mutations.forEach((mutation, nodeKey) => {
          if (mutation === 'destroyed') {
            needsUpdate = true;
            figureRegistry.delete(nodeKey);
          }
        });
        if (needsUpdate) {
          updateFigureNumbers(editor);
        }
      })
    );
  }, [enableCaptions, editor, caption]);

  return null;
}
export function generateStableImageCaptionId(text: string | number, index: number , wpAndTaskId: string): string {
  let hash = 5381;
  const cleanText = String(index); // Use only table index for stability
  console.log('text 666666666666666666', text);
  console.log('index 666666666666666666', index);
  console.log('wpAndTaskId 666666666666666666', wpAndTaskId);

  for (let i = 0; i < cleanText.length; i++) {
    hash = ((hash << 5) + hash) + cleanText.charCodeAt(i);
  }
  return `${wpAndTaskId}-Image-${index}-${Math.abs(hash % 1000000)}`;
}

const TRANSPARENT_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const img = document.createElement("img");
img.src = TRANSPARENT_IMAGE;

function onDragStart(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData("text/plain", "_");
  dataTransfer.setDragImage(img, 0, 0);
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        caption: node.__caption,
        height: node.__height,
        key: node.getKey(),
        maxWidth: node.__maxWidth,
        showCaption: node.__showCaption,
        src: node.__src,
        width: node.__width,
      },
      type: "image",
    })
  );

  return true;
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  }
  return true;
}

function getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");
  if (!dragData) {
    return null;
  }
  const { type, data } = JSON.parse(dragData);
  if (type !== "image") {
    return null;
  }

  return data;
}

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest("code, span.editor-image") &&
    target.parentElement &&
    target.parentElement.closest("div.ContentEditable__root")
  );
}

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
      ? (target as Document).defaultView
      : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  if (document.caretRangeFromPoint) {
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else if (event.rangeParent && domSelection !== null) {
    domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
    range = domSelection.getRangeAt(0);
  } else {
    throw Error(`Cannot get the selection when dragging`);
  }

  return range;
}
function saveCaptionToLocalStorage(imageKey: any, textContent: any) {
  throw new Error("Function not implemented.");
}
