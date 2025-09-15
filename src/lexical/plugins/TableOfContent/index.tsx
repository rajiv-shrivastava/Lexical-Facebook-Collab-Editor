/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type {TableOfContentsEntry} from '../../nodes/Heading-node-custom/LexicalTableOfContentsPlugin';
import type {HeadingTagType} from '@lexical/rich-text';
import type {NodeKey} from 'lexical';
import type {JSX} from 'react';

import './index.css';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {TableOfContentsPlugin as LexicalTableOfContentsPlugin} from '../../nodes/Heading-node-custom/LexicalTableOfContentsPlugin';
import {useEffect, useRef, useState} from 'react';
import * as React from 'react';

const MARGIN_ABOVE_EDITOR = 624;
const HEADING_WIDTH = 9;

function indent(tagName: HeadingTagType) {
  if(tagName === 'h1') {
    return 'heading1'
  }else if (tagName === 'h2') {
    return 'heading2';
  } else if (tagName === 'h3') {
    return 'heading3';
  }else if (tagName === 'h4') {
    return 'heading4';
  }else if(tagName === 'h5'){
    return 'heading5';
  }
}

function isHeadingAtTheTopOfThePage(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0].y;
  return (
    elementYPosition >= MARGIN_ABOVE_EDITOR &&
    elementYPosition <= MARGIN_ABOVE_EDITOR + HEADING_WIDTH
  );
}
function isHeadingAboveViewport(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0].y;
  return elementYPosition < MARGIN_ABOVE_EDITOR;
}
function isHeadingBelowTheTopOfThePage(element: HTMLElement): boolean {
  const elementYPosition = element?.getClientRects()[0].y;
  return elementYPosition >= MARGIN_ABOVE_EDITOR + HEADING_WIDTH;
}

function TableOfContentsList({
  tableOfContents,
}: {
  tableOfContents: Array<TableOfContentsEntry>;
}): JSX.Element {
  const [selectedKey, setSelectedKey] = useState('');
  const selectedIndex = useRef(0);
  const [editor] = useLexicalComposerContext();

  function scrollToNode(key: NodeKey, currIndex: number) {
    editor.getEditorState().read(() => {
      const domElement = editor.getElementByKey(key);
      if (domElement !== null) {
        domElement.scrollIntoView({behavior: 'smooth', block: 'center'});
        setSelectedKey(key);
        selectedIndex.current = currIndex;
      }
    });
  }

  useEffect(() => {
    function scrollCallback() {
      if (
        tableOfContents.length !== 0 &&
        selectedIndex.current < tableOfContents.length - 1
      ) {
        let currentHeading = editor.getElementByKey(
          tableOfContents[selectedIndex.current][0],
        );
        if (currentHeading !== null) {
          if (isHeadingBelowTheTopOfThePage(currentHeading)) {
            //On natural scroll, user is scrolling up
            while (
              currentHeading !== null &&
              isHeadingBelowTheTopOfThePage(currentHeading) &&
              selectedIndex.current > 0
            ) {
              const prevHeading = editor.getElementByKey(
                tableOfContents[selectedIndex.current - 1][0],
              );
              if (
                prevHeading !== null &&
                (isHeadingAboveViewport(prevHeading) ||
                  isHeadingBelowTheTopOfThePage(prevHeading))
              ) {
                selectedIndex.current--;
              }
              currentHeading = prevHeading;
            }
            const prevHeadingKey = tableOfContents[selectedIndex.current][0];
            setSelectedKey(prevHeadingKey);
          } else if (isHeadingAboveViewport(currentHeading)) {
            //On natural scroll, user is scrolling down
            while (
              currentHeading !== null &&
              isHeadingAboveViewport(currentHeading) &&
              selectedIndex.current < tableOfContents.length - 1
            ) {
              const nextHeading = editor.getElementByKey(
                tableOfContents[selectedIndex.current + 1][0],
              );
              if (
                nextHeading !== null &&
                (isHeadingAtTheTopOfThePage(nextHeading) ||
                  isHeadingAboveViewport(nextHeading))
              ) {
                selectedIndex.current++;
              }
              currentHeading = nextHeading;
            }
            const nextHeadingKey = tableOfContents[selectedIndex.current][0];
            setSelectedKey(nextHeadingKey);
          }
        }
      } else {
        selectedIndex.current = 0;
      }
    }
    let timerId: ReturnType<typeof setTimeout>;

    function debounceFunction(func: () => void, delay: number) {
      clearTimeout(timerId);
      timerId = setTimeout(func, delay);
    }

    function onScroll(): void {
      debounceFunction(scrollCallback, 10);
    }

    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [tableOfContents, editor]);

   const [show, setShow] = useState(false);

   useEffect(() => {
    // trigger transition after mount
    const timer = setTimeout(() => setShow(true), 10); // slight delay ensures transition fires
    return () => clearTimeout(timer);
  }, []);
function normalizeHeadingText(text: string): string {
  return text
    // Replace HTML entities like &nbsp; with normal spaces
    .replace(/\u00A0/g, ' ')
    // Collapse multiple spaces into one
    .replace(/\s+/g, ' ')
    // Trim leading/trailing whitespace
    .trim();
}

  return (
    <>
    <div className={`table-of-contents fade-in ${show ? 'show' : ''}`}>

      <ul className="headings">
    <p className='table-of-content-head'>Table of Contents</p>
        {tableOfContents.map(([key, text, tag] : any, index) => {
          if (index === 0) {
            return (
              <div className="normal-heading-wrapper" key={key}>
                <div
                  className="heading1"
                  onClick={() => scrollToNode(key, index)}
                  role="button"
                  title={text}
                  tabIndex={0}
                >
                  {(() => {
                    const cleanText = normalizeHeadingText(text);
                    return cleanText.length > 20
                      ? cleanText.substring(0, 20) + "..."
                      : cleanText;
                  })()}
                </div>
              </div>
            );
          } else {
            return (
              <div
                className={`normal-heading-wrapper ${
                  selectedKey === key ? 'selected-heading-wrapper' : ''
                }`}
                key={key}>
                <div
                  onClick={() => scrollToNode(key, index)}
                  role="button"
                  className={indent(tag)}
                  tabIndex={0}>
                  <li
                  title={text}
                    className={`normal-heading ${
                      selectedKey === key ? 'selected-heading' : ''
                    }
                    `}>
                     {(() => {
                    const cleanText = normalizeHeadingText(text);
                    return cleanText.length > 20
                      ? cleanText.substring(0, 20) + "..."
                      : cleanText;
                  })()}
                  </li>
                </div>
              </div>
            );
          }
        })}
      </ul>
    </div>
    </>
    
  );
}

export default function TableOfContentsPlugin() {
  return (
    <LexicalTableOfContentsPlugin>
      {(tableOfContents) => {
        return (
          <>
            <TableOfContentsList
              tableOfContents={tableOfContents.filter(
                ([, , tag]) => tag !== "h6"
              )}
            />
          </>
        );
      }}
    </LexicalTableOfContentsPlugin>
  );
}