/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  BaseSelection,
  LexicalCommand,
  LexicalEditor,
  NodeKey,
} from "lexical";

import "./ImageNode.css";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { LexicalNestedComposer } from "@lexical/react/LexicalNestedComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import ContentEditable from "../ui/ContentEditable";
import ImageResizer from "../ui/ImageResizer";
import Placeholder from "../ui/Placeholder";
import { $isImageNode } from "./ImageNode";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { updateFigureNumbers } from "../plugins/ImagesPlugin";

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
  createCommand("RIGHT_CLICK_IMAGE_COMMAND");

function LazyImage({
  altText,
  className,
  src,
  width,
  height,
  maxWidth,
  imageRef,
  startCrop,
  setStartCrop,
  isFocused,
  nodeKey,
}: {
  altText: string;
  className: string | null;
  height: "inherit" | number;
  maxWidth?: number;
  src: string;
  width: "inherit" | number;
  imageRef: any;
  startCrop: boolean;
  setStartCrop: any;
  isFocused: boolean;
  nodeKey: NodeKey;
}): JSX.Element {
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [crop, setCrop] = useState<Crop>({
    //@ts-ignore
    unit: "px", // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [editor] = useLexicalComposerContext();
  const image = imageRef.current;

  const updateDimensions = () => {
    if (image && image.naturalWidth && image.naturalHeight) {

      editor.update(() => {
        const node = $getNodeByKey(nodeKey);
        if ($isImageNode(node)) {
          const shouldUpdate =
            node.__width === "inherit" || node.__height === "inherit";

          if (shouldUpdate) {
            node.setWidthAndHeight(image.naturalWidth, image.naturalHeight);
          }
        }
      });
    }
  };

  updateDimensions()


  const applyCrop = () => {
    if (completedCrop) {
      const image = imageRef.current;
      if (!image || !completedCrop) return;

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const offscreen = new OffscreenCanvas(
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );
      const ctx = offscreen.getContext("2d");
      if (!ctx) {
        throw new Error("No 2D context available");
      }

      (ctx as any).drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY
      );

      (offscreen as any).convertToBlob({ type: "image/png" }).then((blob: any) => {
        setStartCrop(false);

        const reader = new FileReader();
        reader.onload = () => {
          const base64data = reader.result as string;

          // Update the node's src directly without local state
          setTimeout(() => {
            editor.update(
              () => {
                const node = $getNodeByKey(nodeKey);
                if ($isImageNode(node) && base64data) {
                  node.setSrc(base64data);
                }
              },
              { tag: 'crop' }
            );
          }, 100);
        };
        reader.onerror = () => {
          console.error("Error reading the cropped image blob");
        };
        reader.readAsDataURL(blob);
      });
    }
  };

  const handleToggleCrop = () => {
    if (startCrop) return;
    setStartCrop((prev: any) => {
      if (prev === false) {
        const image = imageRef.current;

        //@ts-ignore
        setCrop({
          unit: "px", // Can be 'px' or '%'
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      return !prev;
    });
  };

  const lastCompletedCropRef = useRef<PixelCrop | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Store completed crop reference
  useEffect(() => {
    if (completedCrop) {
      lastCompletedCropRef.current = completedCrop;
    }
  }, [completedCrop]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setStartCrop(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef}>
      {isFocused && (
        <button
          style={{ zIndex: 999 }}
          className="image-caption-button"
          onClick={() => handleToggleCrop()}
        >
          Crop
        </button>
      )}

      {startCrop && (
        <button
          style={{ zIndex: 999 }}
          className="image-caption-button"
          onClick={() => applyCrop()}
        >
          Apply Crop
        </button>
      )}

      {startCrop ? (
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
        >
 <img
  className={className || undefined}
  src={src}
  alt={altText}
  ref={imageRef}
  width={typeof width === "number" ? width : undefined}
  height={typeof height === "number" ? height : undefined}
  style={{
    height,
    maxWidth,
    width,
  }}
  draggable="false"
  crossOrigin="anonymous"
/>

        </ReactCrop>
      ) : (
        // When startCrop is false, show the cropped image or original image
<img
  className={className || undefined}
  src={src}
  alt={altText}
  ref={imageRef}
  width={typeof width === "number" ? width : undefined}
  height={typeof height === "number" ? height : undefined}
  style={{
    height,
    maxWidth,
    width,
  }}
  draggable="false"
  crossOrigin="anonymous"
/>

      )}
    </div>
  );
}

export default function ImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  resizable,
  showCaption,
  caption,
  enableCaptions
}: {
  altText: string;
  caption: LexicalEditor;
  height: "inherit" | number;
  maxWidth?: number;
  nodeKey: NodeKey;
  resizable: boolean;
  showCaption: boolean;
  src: string;
  width: "inherit" | number;
  enableCaptions: boolean;
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [selection, setSelection] = useState<BaseSelection | null>(null);
  const [startCrop, setStartCrop] = useState<boolean>(false);
  const activeEditorRef = useRef<LexicalEditor | null>(null);
  const customDeleteImage = useCallback((payload: KeyboardEvent) => {
    if (!isSelected) {
      return false;
    }
  
    // Prevent the default deletion behavior.
    payload.preventDefault();
  
    editor.update(() => {
      const imageNode = $getNodeByKey(nodeKey);
      if ($isImageNode(imageNode)) {
        imageNode.remove();
      }
    });
  
    return true;
  }, [isSelected, editor, nodeKey]);
  
  const onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection();
      const buttonElem = buttonRef.current;
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          // Move focus into nested editor
          $setSelection(null);
          event.preventDefault();
          caption.focus();
          return true;
        } else if (
          buttonElem !== null &&
          buttonElem !== document.activeElement
        ) {
          event.preventDefault();
          buttonElem.focus();
          return true;
        }
      }
      return false;
    },
    [caption, isSelected, showCaption]
  );

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (
        activeEditorRef.current === caption ||
        buttonRef.current === event.target
      ) {
        $setSelection(null);
        editor.update(() => {
          setSelected(true);
          const parentRootElement = editor.getRootElement();
          if (parentRootElement !== null) {
            parentRootElement.focus();
          }
        });
        return true;
      }
      return false;
    },
    [caption, editor, setSelected]
  );

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload;
      if (isResizing) {
        return true;
      }
      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }

      return false;
    },
    [isResizing, isSelected, setSelected, clearSelection]
  );

  const onRightClick = useCallback(
    (event: MouseEvent): void => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection();
        const domElement = event.target as HTMLElement;
        if (
          domElement.tagName === "IMG" &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(
            RIGHT_CLICK_IMAGE_COMMAND,
            event as MouseEvent
          );
        }
      });
    },
    [editor]
  );
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Check if the pressed key is Delete or Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && isSelected) {
        // Stop the event from propagating to other plugins (like the table plugin)
        e.stopPropagation();
        e.preventDefault();
        editor.update(() => {
          const imageNode = $getNodeByKey(nodeKey);
          if ($isImageNode(imageNode)) {
            imageNode.remove();
          }
        });
      }
    };
  
    const rootElement = editor.getRootElement();
    rootElement?.addEventListener("keydown", onKeyDown);
  
    return () => {
      rootElement?.removeEventListener("keydown", onKeyDown);
    };
  }, [isSelected, editor, nodeKey]);
  
  useEffect(() => {
    let isMounted = true;
    const rootElement = editor.getRootElement();
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()));
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor;
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand<MouseEvent>(
        RIGHT_CLICK_IMAGE_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        (event) => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        customDeleteImage,
        4
      ),
      
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        customDeleteImage,
        4
      ),
      
      editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW)
    );

    rootElement?.addEventListener("contextmenu", onRightClick);

    return () => {
      isMounted = false;
      unregister();
      rootElement?.removeEventListener("contextmenu", onRightClick);
    };
  }, [
    clearSelection,
    editor,
    isResizing,
    isSelected,
    nodeKey,
    // onDelete,
    onEnter,
    onEscape,
    onClick,
    onRightClick,
    setSelected,
  ]);

  const setShowCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setShowCaption(true);
      }
    });
  };

  const onResizeEnd = (
    nextWidth: "inherit" | number,
    nextHeight: "inherit" | number
  ) => {
    // Delay hiding the resize bars for click case
    setTimeout(() => {
      setIsResizing(false);
    }, 200);

    editor.update(() => {
      const node = $getNodeByKey(nodeKey);
      if ($isImageNode(node)) {
        node.setWidthAndHeight(nextWidth, nextHeight);
      }
    });
  };

  const onResizeStart = () => {
    if (!startCrop) {
      setIsResizing(true);
    }
  };
  const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
  const isFocused = isSelected || isResizing;
useEffect(() => {
  return editor.registerCommand(
    KEY_DELETE_COMMAND,
    () => {
      if (isSelected) {
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.remove();
            updateFigureNumbers(editor);
          }
        });
        return true;
      }
      return false;
    },
    COMMAND_PRIORITY_CRITICAL
  );
}, [editor, isSelected, nodeKey]);
  return (
    <Suspense fallback={null}>
      <>
        <div draggable={draggable}>
          <LazyImage
            className={
              isFocused
                ? `focused ${$isNodeSelection(selection) ? "draggable" : ""}`
                : null
            }
            src={src}
            altText={altText}
            width={width}
            height={height}
            maxWidth={maxWidth}
            imageRef={imageRef}
            startCrop={startCrop}
            setStartCrop={setStartCrop}
            isFocused={isFocused}
            nodeKey={nodeKey}
          />
        </div>

        {showCaption && (
          <div className="image-caption-container">
            <LexicalNestedComposer initialEditor={caption}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="ImageNode__contentEditable" />
                }
                placeholder={
                  <Placeholder className="ImageNode__placeholder">
                    Enter a caption...
                  </Placeholder>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </LexicalNestedComposer>
          </div>
        )}

        {!startCrop &&
          resizable &&
          $isNodeSelection(selection) &&
          isFocused && (
            <ImageResizer
              showCaption={showCaption}
              setShowCaption={setShowCaption}
              editor={editor}
              buttonRef={buttonRef}
              maxWidth={maxWidth}
              onResizeStart={startCrop ? () => {} : onResizeStart}
              onResizeEnd={startCrop ? () => {} : onResizeEnd}
              enableCaptions={enableCaptions}
              imageRef={imageRef}
            />
          )}
      </>
    </Suspense>
  );
}
