import { $patchStyleText, $wrapNodes } from "@lexical/selection";
import {
  $getSelection,
  LexicalEditor,
  $isTextNode,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical";
import * as React from "react";
// import Plus from "../../assets/icons/plus-large-svgrepo-com.svg";
// import Minus from "../../assets/icons/minus-svgrepo-com.svg";
import DropDown, { DropDownItem } from "../../ui/DropDown";
// import { Divider } from "../ui/Divider";
import { $createHeadingNode } from "../../nodes/Heading-node-custom";
import { $setBlocksType } from "@lexical/selection";
import { $createNestedHeadingNode } from "../../nodes/Heading-node-custom/NestedHeading";

const MIN_ALLOWED_FONT_SIZE = 8;
const MAX_ALLOWED_FONT_SIZE = 72;

const blockTypeToBlockName = {
   h1: 'Heading 1',
  h2: 'Heading 1.1',
  h3: 'Heading 1.1.1',
  h4: 'Heading 1.1.1.1',
  h5: "Cross-refrence Text",
  paragraph: "Normal",
};

const FontSize = ({
  selectionFontSize,
  disabled,
  editor,
  blockType,
  styleConfig,
  isenterPressed,
  currentElementClick,
  currentElementSelect,
  wpAndTaskId
}: {
  selectionFontSize: string;
  disabled: boolean;
  editor: LexicalEditor;
  blockType: keyof typeof blockTypeToBlockName;
  styleConfig: any;
  isenterPressed: any;
  currentElementClick: any;
  currentElementSelect: any;
  wpAndTaskId: any;
}) => {
  const [inputValue, setInputValue] = React.useState<string>(selectionFontSize);
  const [currentHeading, setCurrentHeading] =
    React.useState<keyof typeof blockTypeToBlockName>(blockType);
  const [present, setPresent] = React.useState<any>("");
  const [editorheading, setEdiotorHeading] = React.useState<any>([]);
  const [headingvalue, setHeadingValue] = React.useState<any>("");

  const { heading } = styleConfig || {};

  const updateFontSizeInSelection = (
    fontStyle: Record<
      string,
      string | ((currentStyleValue: string | null) => string) | null
    >
  ) => {
    if (fontStyle && fontStyle.title) {
      editor.update(() => {
        if (editor.isEditable()) {
          const selection = $getSelection();
          if (selection) {
            $patchStyleText(selection, fontStyle);
          }
        }
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    const inputValueNumber = Number(inputValue);
    if (!isNaN(inputValueNumber)) {
      const validFontSize = Math.min(
        Math.max(inputValueNumber, MIN_ALLOWED_FONT_SIZE),
        MAX_ALLOWED_FONT_SIZE
      );
      setInputValue(String(validFontSize));
      updateFontSizeInSelection({ "font-size": `${validFontSize}px` });
    }
  };

  const handleButtonClick = (increment: boolean) => {
    const currentSize =
      styleConfig && styleConfig[currentHeading]
        ? styleConfig[currentHeading].fontSize
        : "10px";
    const newSize = increment
      ? Math.min(currentSize + 2, MAX_ALLOWED_FONT_SIZE)
      : Math.max(currentSize - 2, MIN_ALLOWED_FONT_SIZE);
    setInputValue(String(newSize));
    updateFontSizeInSelection({ "font-size": `${currentHeading}px` });
  };

  const formatParagraph = (level: keyof typeof blockTypeToBlockName) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

    const formatNestedHeading = (level: keyof typeof blockTypeToBlockName) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // @ts-ignore
          $setBlocksType(selection, () => $createHeadingNode(level));
        }
      });
      // let fontSizeVal = null;
      // if (heading) {
      //   switch (level) {
      //     case "h1":
      //         fontSizeVal = heading.find((item: { title: string; }) => item.title === "Heading1")?.fontSize ?? 56;
      //         break;
      //     case "h2":
      //         fontSizeVal = heading.find((item: { title: string; }) => item.title === "Heading2")?.fontSize ?? 14;
      //         break;
      //     case "h3":
      //         fontSizeVal = heading.find((item: { title: string; }) => item.title === "Heading3")?.fontSize ?? 12;
      //         break;
      //     case "paragraph":
      //         fontSizeVal = 15; 
      //         break;
      //     default:
      //         fontSizeVal = 15;
      // }
  
      // }
    };

  const formatHeading = (level: keyof typeof blockTypeToBlockName) => {
    setPresent(level);
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // @ts-ignore
        $wrapNodes(selection, () => $createNestedHeadingNode(level , wpAndTaskId));
      }
    });
    let fontSizeVal = null;
    if (heading) {
      switch (level) {
        case "h1":
            fontSizeVal = heading.find((item: { title: string; }) => item.title === "Heading1")?.fontSize ?? 56;
            break;
        case "h2":
            fontSizeVal = heading.find((item: { title: string; }) => item.title === "Heading2")?.fontSize ?? 14;
            break;
        case "h3":
            fontSizeVal = heading.find((item: { title: string; }) => item.title === "Heading3")?.fontSize ?? 12;
            break;
        case "h4":
            fontSizeVal = heading.find((item: { title: string; }) => item.title === "Heading4")?.fontSize ?? 12;
            break;
        case "h5":
            fontSizeVal = heading.find((item: { title: string; }) => item.title === "Heading5")?.fontSize ?? 12;
            break;
        case "paragraph":
            fontSizeVal = 15; 
            break;
        default:
            fontSizeVal = 15;
    }
    
    }
    setInputValue(fontSizeVal);
    setPresent(level);
    setCurrentHeading(level);
  };

  const setToDefault = () => {
    setInputValue("15");
  };

  React.useEffect(() => {
    setToDefault();
  }, [isenterPressed]);

  React.useEffect(() => {
    const trackCursorPosition = () => {
      editor.update(() => {
        const selection = $getSelection();
        if (selection !== null) {
          const nodes = selection.getNodes();
          const node = nodes[0];

          if (!$isTextNode(node)) {
            const nodeType = node.getType();
            if (nodeType in blockTypeToBlockName) {
              setCurrentHeading(nodeType as keyof typeof blockTypeToBlockName);
            }
          }
        }
      });
    };
    editor.registerUpdateListener(trackCursorPosition);

    return () => {
      editor.registerUpdateListener(trackCursorPosition);
    };
  }, [editor]);


  React.useEffect(() => {
    let headingName = "";
    switch (currentElementClick.tagName) {
      case "P":
        setCurrentHeading("paragraph");
        setInputValue("15");
        break;
      case "H1":
        setCurrentHeading("h1");
        const h1FontSize = styleConfig["heading"]
          .find((item: { title: string }) => item.title === "Heading1")
          ?.fontSize ?? "16"; // fallback to 16 if fontSize is null or undefined
        setInputValue(h1FontSize);
        headingName = "Heading1";
        break;
      case "H2":
        setCurrentHeading("h2");
        const h2FontSize = styleConfig["heading"]
          .find((item: { title: string }) => item.title === "Heading2")
          ?.fontSize ?? "14"; // fallback to 14 if fontSize is null or undefined
        setInputValue(h2FontSize);
        headingName = "Heading2";
        break;
      case "H3":
        setCurrentHeading("h3");
        const h3FontSize = styleConfig["heading"]
          .find((item: { title: string }) => item.title === "Heading3")
          ?.fontSize ?? "12"; // fallback to 12 if fontSize is null or undefined
        setInputValue(h3FontSize);
        headingName = "Heading3";
        break;
      default:
        setCurrentHeading("paragraph");
        setInputValue("15");
        break;
    }
  }, [currentElementClick]);


  React.useEffect(() => {
    let headingName = "";
    if (!currentElementSelect) {
      setInputValue('15');
      setCurrentHeading("paragraph");
      return;
    }
    const elementTag = currentElementSelect.trim();  
    switch (elementTag) {
      case "P":
        setInputValue('15');
        setCurrentHeading("paragraph");
        break;
      case "h1":
        setCurrentHeading("h1");
        const h1FontSize = styleConfig["heading"]
          .find((item: { title: string }) => item.title === "Heading1")
          ?.fontSize ?? "16"; // fallback to 16 if fontSize is null or undefined
        setInputValue(h1FontSize);
        headingName = "Heading1";
        break;
      case "h2":
        setCurrentHeading("h2");
        const h2FontSize = styleConfig["heading"]
          .find((item: { title: string }) => item.title === "Heading2")
          ?.fontSize ?? "14"; // fallback to 14 if fontSize is null or undefined
        setInputValue(h2FontSize);
        headingName = "Heading2";
        break;
      case "h3":
        setCurrentHeading("h3");
        const h3FontSize = styleConfig["heading"]
          .find((item: { title: string }) => item.title === "Heading3")
          ?.fontSize ?? "12"; // fallback to 12 if fontSize is null or undefined
        setInputValue(h3FontSize);
        headingName = "Heading3";
        break;
        case "h4":
        setCurrentHeading("h4");
        const h4FontSize = styleConfig["heading"]
          .find((item: { title: string }) => item.title === "Heading4")
          ?.fontSize ?? "12"; // fallback to 12 if fontSize is null or undefined
        setInputValue(h4FontSize);
        headingName = "Heading4";
        break;
        case "h5":
        setCurrentHeading("h5");
        const h5FontSize = styleConfig["heading"]
          .find((item: { title: string }) => item.title === "Heading5")
          ?.fontSize ?? "12"; // fallback to 12 if fontSize is null or undefined
        setInputValue(h5FontSize);
        headingName = "Heading5";
        break;
      default:
        setCurrentHeading("paragraph");
        setInputValue("15");
        break;
    }
  }, [currentElementSelect]);
  
  return (
    <>
      {styleConfig && styleConfig.heading ? (
          <DropDown
            disabled={disabled}
            buttonClassName="toolbar-item block-controls"
            buttonAriaLabel="Formatting options for text style"
            buttonIconClassName={"icon block-type " + currentHeading}
            buttonLabel={blockTypeToBlockName[currentHeading]}
          >
            <DropDownItem
              className={`item ${currentHeading === "paragraph" ? "active" : ""
                }`}
              onClick={() => formatParagraph("paragraph")}
            >
              <i className="icon paragraph" />
              <span className="text">{blockTypeToBlockName.paragraph}</span>
            </DropDownItem>

              {styleConfig.heading &&
              styleConfig.heading.find(
                (item: { title: string }) => item.title === "Heading1"
              ) && (
                <DropDownItem
                  className={`item `}
                  onClick={() => formatNestedHeading("h1",)}
                >
                  <i className="icon h1" />
                  <span className="text">{blockTypeToBlockName.h1}</span>
                </DropDownItem>
              )}

            {styleConfig.heading &&
              styleConfig.heading.find(
                (item: { title: string }) => item.title === "Heading2"
              ) && (
                <DropDownItem
                  className={`item `}
                  onClick={() => formatNestedHeading("h2")}
                >
                  <i className="icon h2" />
                  <span className="text">{blockTypeToBlockName.h2}</span>
                </DropDownItem>
              )}
            {styleConfig.heading &&
              styleConfig.heading.find(
                (item: { title: string }) => item.title === "Heading3"
              ) && (
                <DropDownItem
                  className={`item `}
                  onClick={() => formatNestedHeading("h3")}
                >
                  <i className="icon h3" />
                  <span className="text">{blockTypeToBlockName.h3}</span>
                </DropDownItem>
              )}
            {styleConfig.heading &&
              styleConfig.heading.find(
                (item: { title: string }) => item.title === "Heading5"
              ) && (
                <DropDownItem
                  className={`item`}
                  onClick={() => formatNestedHeading("h4")}
                >
                  <i className="icon h4" />
                  <span className="text">{blockTypeToBlockName.h4}</span>
                </DropDownItem>
              )}
              
            {styleConfig.heading &&
              styleConfig.heading.find(
                (item: { title: string }) => item.title === "Heading5"
              ) && (
                <DropDownItem
                  className={`item ${currentHeading === "h5" ? "active" : ""}`}
                  onClick={() => formatHeading("h5")}
                >
                  <i className="icon h5" />
                  <span className="text">Cross-refrence Text</span>
                </DropDownItem>
              )}
          </DropDown>

      ) : (
        ""
      )}
    </>
  );
};
export default FontSize;

