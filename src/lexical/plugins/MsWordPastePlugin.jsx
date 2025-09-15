import React, { useEffect, useRef, useState } from "react";
// import Close from '../../assets/icons/close.svg'
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $insertNodes,
  $isRootOrShadowRoot,
} from "lexical";
// import MS_Word from "../../assets/icons/Ms-word.svg"
import $ from "jquery";
import { $createTableCellNode, $createTableNode, $createTableRowNode } from "../nodes/CustomTableNode/src";
import { eachRight } from "lodash-es";
import { $createListItemNode, $createListNode } from "@lexical/list";
import { $createImageNode } from "../nodes/ImageNode";
import { $insertNodeToNearestRoot } from '@lexical/utils';
import { $createHeadingNode } from "../nodes/Heading-node-custom";

export const MsWordPaste = ({ onlUser, collabApiKey, htmlPasteModalOpen, sethtmlPasteModalOpen, passedContent, onPaste, source }) => {
  const contentRef = useRef(null);
  const [pastedContent, setPastedContent] = useState("");
  const [serializedEditorState_TEXT, set_serializedEditorState_TEXT] = React.useState("")
  const [editor] = useLexicalComposerContext();
  const InserRef = React.useRef();
  const spanRef = useRef(null);
  const resetSerialized = () => {
    set_serializedEditorState_TEXT({
      root: {
        type: "root",
        version: 1,
        children: [
          {
            children: [],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "text",
            version: 1,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
      },
    })
    setPastedContent("")
  }

  React.useEffect(() => {
    resetSerialized()
  }, [])


  const resetModalState = () => {
    sethtmlPasteModalOpen(false);
    setPastedContent(" ")
    resetSerialized();
  }

  const getDisplayStyleValue = (cssString) => {
    const regex = /display:\s*([^;]+);/;
    const match = cssString.match(regex);
    if (match) {
      return match[1]
    }
  }

  function InsertParagraphButton() {
    const [editor] = useLexicalComposerContext();
    const insertParagraph = (textVal, passedNodeoBJ) => {
      editor.update(() => {
        const paragraphNode = $createParagraphNode();
        const textNode = $createTextNode(`${textVal}`);
        textNode.setStyle(passedNodeoBJ.style)
        textNode.setFormat(passedNodeoBJ.format)
        paragraphNode.append(textNode);
        const root = editor.getRootElement();
        if (root && textVal && textVal.length > 0) {
          const rootNode = editor.getEditorState().read(() => $getRoot());
          // rootNode.append(paragraphNode);
          $insertNodeToNearestRoot(paragraphNode)
        }
      });
    };

    const handleOp = () => {
      let items = getTagsWithStyles(pastedContent)
      getImageSrcAndListFromHTML(pastedContent);
      // htmlStringToLexicalList(pastedContent)
      items.root.children.map((eachIt, i) => {
        if (eachIt && eachIt.text && eachIt.text.trim("") && eachIt.text.trim("").length > 1 && eachIt.style && eachIt.style.length > 10 && getDisplayStyleValue(eachIt.style) === "block") {
          let textDelay = eachIt.order.split("_")[1]
          setTimeout(() => {
            insertParagraph(eachIt.text.trim(""), eachIt)

          }, textDelay * 2)
        }
      })
      resetModalState()
    }
    return <button onClick={handleOp} ref={InserRef} style={{ display: "none" }}></button>;
  }

  function onlyFontSizeAndColor(cssString, tagName) {
    const fontWeightRegex = /font-weight:\s*([a-zA-Z0-9\-]+);/;
    const textDecorationRegex = /text-decoration:\s*([^;]+?)(?=\s*;|\s*$)/;
    const fontStyleRegex = /font-style:\s*([a-zA-Z0-9\-]+);/;
    const fontSizeRegex = /font-size:\s*([\d.]+(?:px|pt|em|rem|%)?)/;
    const colorRegex = /color:\s*([^;]+)/;
    const fontWeightMatch = cssString.match(fontWeightRegex);
    const textDecorationMatch = cssString.match(textDecorationRegex);
    const fontStyleMatch = cssString.match(fontStyleRegex)
    const fontSizeMatch = cssString.match(fontSizeRegex);
    const colorMatch = cssString.match(colorRegex);
    const fontWeight = fontWeightMatch ? fontWeightMatch[1] : null;
    const textDecoration = textDecorationMatch ? textDecorationMatch[1] : null;
    const fontStyle = fontStyleMatch ? fontStyleMatch[1] : null;
    const fontSize = fontSizeMatch ? fontSizeMatch[1] : null;
    const color = colorMatch ? colorMatch[1] : null;
    let allowedTags = ["span", "table", "tbody", "tr", "td"]
    let styleObj = {
      "font-weight": fontWeight && fontWeight !== null ? fontWeight : 'none',
      "text-decoration": textDecoration && textDecoration !== null ? textDecoration : 'none',
      "font-style": fontStyle && fontStyle !== null ? fontStyle : 'none',
      "font-size": fontSize && fontSize !== null ? "none" : "none",
      "display": allowedTags.includes(tagName) ? "block" : "none",
      "color": color && color !== "transparent" ? color : 'black'
    }
    function convertToCssString(styleObject) {
      return Object.entries(styleObject)
        .map(([key, value]) => `${key}: ${value};`)
        .join(' ');
    }
    const cssStringVal = convertToCssString(styleObj);
    return {
      cssString: cssStringVal,
      fontSize: fontSize && fontSize !== null ? fontSize : "none",
      fontWeight: fontWeight && fontWeight !== null ? fontWeight : "none",
      fontStyle: fontStyle && fontStyle !== null ? fontStyle : "none",
      textDecoration: textDecoration && textDecoration !== null ? textDecoration : "none",
    }
  }

  const extractCssPropertyValue = (cssString, property) => {
    const regex = new RegExp(`${property}:\\s*([^;]+)`);
    const match = cssString.match(regex);
    return match ? match[1].trim() : null;
  }

  const getImageSrcAndListFromHTML = (pastedHTML) => {
    const parser = new DOMParser();
    const newHtml = addOrderAttributesToAllElements(pastedHTML)
    const doc = parser.parseFromString(newHtml, 'text/html');
    const images = doc.querySelectorAll('img');
    const imageSrcArray = Array.from(images).map(img => {
      const imageId = img.getAttribute('id')
      const imageParts = imageId.split('_')[1];
      const delay = imageParts * 2;


      setTimeout(() => {
        editor.update(() => {
          const src = img.src;
          const altText = img.textContent
          const image = { src, altText }
          const imageNode = $createImageNode(image);
          const root = $getRoot();
          $insertNodeToNearestRoot(imageNode);
        })
      }, delay)
    });
  }
  function processWordTableAndInsert(tableElement, editor) {
    const rows = Array.from(tableElement.querySelectorAll('tr'));
    const tableId = tableElement.getAttribute('id');
    const tableIdParts = tableId.split('_')[1];
    const delay = tableIdParts * 2;
    setTimeout(() => {
      editor.update(() => {
        const tableNode = $createTableNode();

        rows.forEach(row => {
          const rowNode = $createTableRowNode();
          const cells = Array.from(row.querySelectorAll('td'));

          cells.forEach(cell => {
            const cellNode = $createTableCellNode();
            const spanElements = Array.from(cell.querySelectorAll('span'));

            const spanData = spanElements.map(span => {
              const spanStyle = span.getAttribute('style') || '';
              return {
                text: span.innerText.trim(),
                style: spanStyle,
              };
            });

            let combinedStyle = spanData
              .map(span => span.style)
              .filter(style => style)
              .map(style => {
                return style
                  .split(';')
                  .map(rule => rule.trim())
                  .filter(rule => !rule.startsWith('font-family'))
                  .filter(rule => !rule.startsWith('font-size'))
                  .filter(rule => !rule.startsWith('border'))
                  .filter(rule => !rule.startsWith('width'))
                  .join('; ');
              })
              .join('; ');

            const fontWeight = extractCssPropertyValue(combinedStyle, 'font-weight');
            const fontStyle = extractCssPropertyValue(combinedStyle, 'font-style');
            const textDecoration = extractCssPropertyValue(combinedStyle, 'text-decoration');

            combinedStyle = `${combinedStyle}; font-weight: ${fontWeight}`;
            combinedStyle = `${combinedStyle}; font-style: ${fontStyle}`;
            combinedStyle = `${combinedStyle}; color: black`;
            combinedStyle = `${combinedStyle}; text-decoration: ${textDecoration}`;

            const textNode = $createTextNode(cell.innerText.trim());
            const formatvar = determineTextFormat(fontWeight, fontStyle, textDecoration);
            textNode.setFormat(formatvar);

            if (combinedStyle) {
              textNode.setStyle(combinedStyle);
            }

            // Wrap text node inside a paragraph node
            const paragraphNode = $createParagraphNode();
            paragraphNode.append(textNode);
            cellNode.append(paragraphNode);
            rowNode.append(cellNode);
          });

          tableNode.append(rowNode);
        });

        const rootNode = $getRoot();
        if (rootNode) {
          $insertNodeToNearestRoot(tableNode);
        } else {
          // console.error('Root node is not defined');
        }
      });
    }, delay);
  }


  function determineTextFormat(fontWeight, fontStyle, textDecoration) {
    if (fontWeight === 'bold' && fontStyle === 'italic' && textDecoration === 'underline line-through') {
      return 15;
    } else if (textDecoration === 'underline line-through') {
      return 12;
    } else if (fontStyle === 'italic' && textDecoration === 'line-through') {
      return 6;
    } else if (fontStyle === 'italic' && textDecoration === 'underline') {
      return 11;
    } else if (fontWeight === 'bold' && textDecoration === 'line-through') {
      return 5;
    } else if (fontWeight === 'bold' && textDecoration === 'underline') {
      return 9;
    } else if (fontWeight === 'bold' && fontStyle === 'italic') {
      return 3;
    } else if (fontWeight === 'bold') {
      return 1;
    } else if (fontStyle === 'italic') {
      return 2;
    } else if (textDecoration === 'underline') {
      return 8;
    } else if (textDecoration === 'line-through') {
      return 4;
    }
    return 0;
  }


  function addOrderAttributesToAllElements(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    let orderCounter = 1;
    function traverseAndAddAttributes(node) {
      if (node.nodeType === 1) {
        const orderId = `order_${orderCounter++}`;
        node.setAttribute('data-title', orderId);
        node.setAttribute('id', orderId);
      }
      node.childNodes.forEach(childNode => traverseAndAddAttributes(childNode));
    }
    traverseAndAddAttributes(doc.body);

    return doc.body.innerHTML;
  }

  function getTagsWithStyles(htmlString) {
    const parser = new DOMParser();
    const newHtml = addOrderAttributesToAllElements(htmlString)
    const doc = parser.parseFromString(newHtml, 'text/html');

    const elementsWithAriaLevel = [];
    const elements = doc.querySelectorAll('[aria-level]');

    elements.forEach(element => {
      const headingId = element.getAttribute('id');
      const headingParts = headingId.split('_')[1];
      const delay = headingParts * 2;
      setTimeout(() => {
        editor.update(() => {
          const heading = $createHeadingNode(`${element.getAttribute('aria-level') === '1' ? 'h1' : element.getAttribute('aria-level') === '2' ? 'h2' : element.getAttribute('aria-level') === '3' ? 'h3' : element.getAttribute('aria-level') === '4' ? 'h4' : 'h5'}`);
          const text = $createTextNode(element.innerText)
          heading.append(text)
          $insertNodeToNearestRoot(heading)
        })
      }, delay);

    });


    const UlLists = doc.querySelectorAll('ul')
    UlLists.forEach(ul => {
      // insertExtractedListsToLexical(ul , editor)
      const ul_Id = ul.getAttribute('id')
      const ulParts = ul_Id.split('_')[1];
      const delay = ulParts * 2;

      setTimeout(() => {
        editor.update(() => {
          const listNode = $createListNode('ul');
          const listNodeItems = $createListItemNode()
          const textNode = $createTextNode(`${ul.textContent}`)

          const ulElem = Array.from(ul.querySelectorAll('span'))
          const ulData = ulElem.map((span) => {
            const spanStyle = span.getAttribute('style') || '';
            return {
              text: span.innerText.trim(),
              style: spanStyle,
            };
          })

          let combinedStyle = ulData
            .map(span => span.style)
            .filter(style => style)
            .map(style => {
              return style
                .split(';')
                .map(rule => rule.trim())
                .filter(rule => !rule.startsWith('font-family'))
                .filter(rule => !rule.startsWith('font-size'))
                .filter(rule => !rule.startsWith('border'))
                .filter(rule => !rule.startsWith('width'))
                .join('; ');
            })
            .join('; ');

          const fontWeight = extractCssPropertyValue(combinedStyle, 'font-weight');
          const fontStyle = extractCssPropertyValue(combinedStyle, 'font-style');
          const textDecoration = extractCssPropertyValue(combinedStyle, 'text-decoration');
          combinedStyle = `${combinedStyle}; font-weight: ${fontWeight}`;
          combinedStyle = `${combinedStyle}; font-style: ${fontStyle}`;
          combinedStyle = `${combinedStyle}; color: black`;
          combinedStyle = `${combinedStyle}; text-decoration: ${textDecoration}`;
          if (combinedStyle) {
            textNode.setStyle(combinedStyle);
          }
          listNodeItems.append(textNode)
          listNode.append(listNodeItems)
          // if(listNode){
          const root = $getRoot();
          // root.append(listNode)
          $insertNodeToNearestRoot(listNode)
          // }
        })
      }, delay)

    });

    const OlLists = doc.querySelectorAll('ol')
    OlLists.forEach(Ol => {
      // insertExtractedListsToLexical(Ol, editor)
      const ol_Id = Ol.getAttribute('id')
      const olParts = ol_Id.split('_')[1];
      const delay = olParts * 2;
      setTimeout(() => {
        editor.update(() => {
          const listNode = $createListNode('ol');
          const listNodeItems = $createListItemNode()
          const textNode = $createTextNode(`${Ol.textContent}`)
          const olElem = Array.from(Ol.querySelectorAll('span'))
          const olData = olElem.map((span) => {
            const spanStyle = span.getAttribute('style') || '';
            return {
              text: span.innerText.trim(),
              style: spanStyle,
            };
          })

          let combinedStyle = olData
            .map(span => span.style)
            .filter(style => style)
            .map(style => {
              return style
                .split(';')
                .map(rule => rule.trim())
                .filter(rule => !rule.startsWith('font-family'))
                .filter(rule => !rule.startsWith('font-size'))
                .filter(rule => !rule.startsWith('border'))
                .filter(rule => !rule.startsWith('width'))
                .join('; ');
            })
            .join('; ');

          const fontWeight = extractCssPropertyValue(combinedStyle, 'font-weight');
          const fontStyle = extractCssPropertyValue(combinedStyle, 'font-style');
          const textDecoration = extractCssPropertyValue(combinedStyle, 'text-decoration');
          combinedStyle = `${combinedStyle}; font-weight: ${fontWeight}`;
          combinedStyle = `${combinedStyle}; font-style: ${fontStyle}`;
          combinedStyle = `${combinedStyle}; color: black`;
          combinedStyle = `${combinedStyle}; text-decoration: ${textDecoration}`;
          let format = determineTextFormat(fontStyle, fontWeight, textDecoration)
          textNode.setFormat(format)
          if (combinedStyle) {
            textNode.setStyle(combinedStyle);
          }
          listNodeItems.append(textNode)
          listNode.append(listNodeItems)
          const root = $getRoot();
          $insertNodeToNearestRoot(listNode)
        })
      }, delay)
    });

    const tableElements = doc.querySelectorAll('table');

    tableElements.forEach(table => {
      processWordTableAndInsert(table, editor);
    });

    const allElements = doc.querySelectorAll('*');
    const tagsWithStyles = Array.from(allElements).filter(element => !element.closest('table')).filter(element => !element.closest('ol')).filter(element => !element.closest('ul')).map(element => {
      return {
        elemText: element.innerText,
        tagName: element.tagName.toLowerCase(),
        style: element.getAttribute('style') || '',
        order: element.getAttribute('id') || ''
      };
    });
    let copySerialText = serializedEditorState_TEXT
    tagsWithStyles.map(item => {
      let styleOfItem = onlyFontSizeAndColor(item.style, item.tagName)
      const { cssString, fontSize, fontWeight, textDecoration, fontStyle, border } = styleOfItem || {}

      if (item.style && item.style.length > 0 && item.elemText.trim(" ").length && fontSize !== "none" && fontWeight !== null && textDecoration !== null && fontStyle !== null) {
        let formatvar = determineTextFormat(fontWeight, fontStyle, textDecoration);

        // Detect if the text starts with more than 10 spaces
        const leadingSpaces = item.elemText.match(/^ {10,}/);
        let modifiedStyle = cssString;

        if (leadingSpaces) {
          // Append text-align style
          modifiedStyle = `${modifiedStyle}; text-align: left;`;
        }

        copySerialText.root.children.push({
          detail: 0,
          format: formatvar,
          mode: "normal",
          style: `${modifiedStyle}`,
          text: `${item.elemText}`,
          type: "text",
          version: 1,
          order: item.order,
        });
      }
    });

    return copySerialText;

  }

  const handlePaste = (event) => {
    if (event) {
      event.preventDefault();
      const clipboardData = event.clipboardData || window.clipboardData;
      const pastedHTML = clipboardData.getData("text/html");
      if (pastedHTML) {
        setPastedContent(pastedHTML);
      }
    }
  };

  const resetTextarea = () => {
    setPastedContent("")
    handleClose();
  };

  useEffect(() => {
    return () => {
      setPastedContent(" ")
    };
  }, []);

  const handleOpen = () => {
    sethtmlPasteModalOpen(true)
    setTimeout(() => {
      InserRef.current?.click()
    }, 200);

  }

  const handleClose = () => {
    sethtmlPasteModalOpen(false)
    setPastedContent("")
  }

  useEffect((event) => {
    if (htmlPasteModalOpen) {
      setPastedContent(passedContent);
      handleOpen()
    }
  }, [htmlPasteModalOpen])

  return (
    <><InsertParagraphButton /></>
  );
};