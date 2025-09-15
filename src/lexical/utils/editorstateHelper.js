export function parseHtmlStateWithStyle(html) {
    // Create a temporary container to parse the HTML string
    const container = document.createElement('div');
    container.innerHTML = html;

    // Find all elements in the parsed HTML
    const elements = container.querySelectorAll('*');

    elements.forEach(element => {
        // Create a variable to hold inline styles
        let inlineStyle = '';

        // Special case: If the element has both italic and strikethrough classes
        if (
            element.classList.contains('PlaygroundEditorTheme__textItalic') &&
            element.classList.contains('PlaygroundEditorTheme__textStrikethrough')
        ) {
            // Apply the strikethrough as an inline style
            inlineStyle += 'text-decoration: line-through; ';

            // Wrap the content in <span> for the inline style
            const spanTag = document.createElement('span');
            spanTag.style.cssText = inlineStyle.trim(); // Apply line-through style here

            const iTag = document.createElement('i');
            iTag.innerHTML = element.innerHTML;

            // Wrap the content inside <i> and <span> tags
            spanTag.appendChild(iTag);

            // Replace original content with the new wrapped structure
            element.innerHTML = '';
            element.appendChild(spanTag);
        }
        // Special case 2: If the element has bold and italic and strikethrough classes
        else if (
            element.classList.contains('PlaygroundEditorTheme__textBold') &&
            element.classList.contains('PlaygroundEditorTheme__textItalic') &&
            element.classList.contains('PlaygroundEditorTheme__textStrikethrough')
        ) {
            // Apply the strikethrough as an inline style
            inlineStyle += 'text-decoration: line-through; ';

            // Wrap the content in <span> for the inline style
            const spanTag = document.createElement('span');
            spanTag.style.cssText = inlineStyle.trim(); // Apply line-through style here

            const iTag = document.createElement('i');
            const strongTag = document.createElement('strong');

            // Wrap the content inside each tag in order
            strongTag.innerHTML = element.innerHTML;
            iTag.appendChild(strongTag);
            spanTag.appendChild(iTag);

            // Replace original content with the new wrapped structure
            element.innerHTML = '';
            element.appendChild(spanTag);
        }
        // For other cases: Apply bold, italic, underline, and strikethrough separately
        else {
            // Check for strikethrough class and apply inline style
            if (element.classList.contains('PlaygroundEditorTheme__textStrikethrough')) {
                inlineStyle += 'text-decoration: line-through; '; // Add strikethrough as an inline style
            }

            if (element.classList.contains('PlaygroundEditorTheme__textUnderlineStrikethrough')) {
                inlineStyle += 'text-decoration: line-through underline; '; // Add strikethrough as an inline style
            }

            // Check for bold class and wrap in <strong> tag
            if (element.classList.contains('PlaygroundEditorTheme__textBold')) {
                const strongTag = document.createElement('strong');
                strongTag.innerHTML = element.innerHTML;
                element.innerHTML = '';
                element.appendChild(strongTag);
            }

            // Check for italic class and wrap in <i> tag
            if (element.classList.contains('PlaygroundEditorTheme__textItalic')) {
                const iTag = document.createElement('i');
                iTag.innerHTML = element.innerHTML;
                element.innerHTML = '';
                element.appendChild(iTag);
            }

            // Check for underline class and wrap in <u> tag
            if (element.classList.contains('PlaygroundEditorTheme__textUnderline')) {
                const uTag = document.createElement('u');
                uTag.innerHTML = element.innerHTML;
                element.innerHTML = '';
                element.appendChild(uTag);
            }

            // If inline styles (like strikethrough) are applied, wrap the content with <span>
            if (inlineStyle) {
                const spanTag = document.createElement('span');
                spanTag.style.cssText = inlineStyle.trim();
                spanTag.innerHTML = element.innerHTML;
                element.innerHTML = '';
                element.appendChild(spanTag);
            }
        }
    });

    // Return the modified HTML as a string
    return container.innerHTML;
}



export function parseHtmlForExportToWord(html) {
    const container = document.createElement('div');
    container.innerHTML = html;

    const tables = container.querySelectorAll('.PlaygroundEditorTheme__table');

    if (tables.length === 0) {
        return html;
    }

    tables.forEach(table => {
        // Word-style: full width, grid lines
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse'; // Important for clean Word rendering
        table.style.border = '1px solid black';
        table.style.fontFamily = 'Times New Roman'; // Word default font
        table.style.fontSize = '11pt';

        const rows = table.querySelectorAll('tr');

        rows.forEach((row, rowIndex) => {
            row.style.border = '1px solid black';

            const cells = row.querySelectorAll('td, th');
            const numColumns = cells.length;
            const columnWidth = (100 / numColumns) + '%';

            cells.forEach(cell => {
                cell.style.width = columnWidth;
                cell.style.height = '20px';
                cell.style.border = '1px solid black';

                // Word-style: padding for better readability
                cell.style.padding = '5px 8px';

                // Word-style: default left-align text
                cell.style.textAlign = 'left';
                cell.style.verticalAlign = 'middle';

                // // Apply row banding: light gray background on even rows (excluding header)
                // if (rowIndex % 2 === 1 && !cell.classList.contains('PlaygroundEditorTheme__tableCellHeader')) {
                //     cell.style.backgroundColor = '#f2f2f2'; // Light gray banding
                // }

                // Fallback for empty cells
                if (!cell.innerHTML.trim()) {
                    cell.innerHTML = '&nbsp;';
                }

                // Underline and strikethrough
                const underlineElements = cell.querySelectorAll('.PlaygroundEditorTheme__textUnderline');
                underlineElements.forEach(el => {
                    el.style.textDecoration = 'underline';
                });

                const strikethroughElements = cell.querySelectorAll('.PlaygroundEditorTheme__textStrikethrough');
                strikethroughElements.forEach(el => {
                    el.style.textDecoration = 'line-through';
                });

                // Header styling (Word-style)
                if (cell.classList.contains('PlaygroundEditorTheme__tableCellHeader')) {
                    cell.style.fontWeight = 'bold';
                    cell.style.backgroundColor = '#d9d9d9'; // Word-style light gray header
                    cell.style.textAlign = 'center';
                }
            });
        });
    });

    return container.innerHTML;
}


export function htmlWithoutSpaces(html) {
    // Remove all <br> and <br/> tags
    html = html.replace(/<br\s*\/?>/g, '');

    // Remove empty <p> tags or <p> tags that only contain <br> tags
    // html = html.replace(/<p[^>]*>\s*(<br\s*\/?>)*\s*<\/p>/g, '');

    if (html.includes('Crop')) {
        html = html.replace(/Crop/g, ''); // Remove the word 'Crop'
    }

    const res = removePTagInsideH1FromString(html)
    const res2 = splitEachRowIntoStyledTables(res)
    return res2;
}

// function splitEachRowIntoStyledTables(htmlString) {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlString, 'text/html');

//   const tables = doc.querySelectorAll('table');

//   tables.forEach((originalTable) => {
//     const rows = Array.from(originalTable.querySelectorAll('tr'));
//     if (rows.length <= 1) return;

//     const fragment = document.createDocumentFragment();

//     rows.forEach((row) => {
//       const newTable = document.createElement('table');

//       // Copy attributes (style, class, border, etc.)
//       for (let attr of originalTable.attributes) {
//         newTable.setAttribute(attr.name, attr.value);
//       }

//       // Optionally clone thead/tfoot if needed here

//       // Append cloned row
//       newTable.appendChild(row.cloneNode(true));
//       fragment.appendChild(newTable);
//     });

//     // Insert new tables and remove original
//     originalTable.parentNode.insertBefore(fragment, originalTable);
//     originalTable.remove();
//   });

//   return doc.body.innerHTML;
// }

export function generateUniqueTableGroupId() {
    return `table-group-${Math.random().toString(36).substr(2, 9)}`;
};

function splitEachRowIntoStyledTables(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');


    const tables = Array.from(doc.querySelectorAll('table')).filter(table => {
        return !table.closest('td table, th table');
    });

    tables.forEach((originalTable) => {
        const tableGroupId = generateUniqueTableGroupId();
        const rows = Array.from(originalTable.rows);
        if (rows.length <= 1) return;

        const fragment = document.createDocumentFragment();

        rows.forEach((row, index) => {
            const newTable = document.createElement('table');

            for (let attr of originalTable.attributes) {
                newTable.setAttribute(attr.name, attr.value);
            }

            newTable.setAttribute('data-table-caption', index === 0 ? 'true' : 'false');
            newTable.setAttribute('data-table-id', tableGroupId);

            const movedRow = row;
            newTable.appendChild(movedRow);
            fragment.appendChild(newTable);
        });

        originalTable.replaceWith(fragment);
    });

    //   const res2 = addTableCaptions(doc.body.innerHTML);
    return doc.body.innerHTML;
}


//  function flattenNestedTables(htmlString) {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(htmlString, 'text/html');
//     let caption

//     // Collect all nested tables inside other tables, in original order
//     const allTables = Array.from(doc.querySelectorAll('table'));
//     const nestedTables = allTables.filter(table => {
//       caption = table.previousElementSibling
//         return table.closest('table') !== table; // Skip self, get only nested
//     });

//     nestedTables.forEach(nestedTable => {
//         // Find outermost parent <table>
//         let parentTable = nestedTable.closest('table');
//         while (parentTable && parentTable.parentElement) {
//             const higher = parentTable.parentElement.closest('table');
//             if (!higher) break;
//             parentTable = higher;
//         }

//         // Remove nested table from its original position
//         nestedTable.remove();

//         // Insert after the outermost parent
//         parentTable.insertAdjacentElement('afterend', nestedTable);
//         nestedTable.insertAdjacentElement('beforebegin', caption);
//     });
//     const res = removeNestedTables(doc.body.innerHTML)
//     return res
// }

// function removeNestedTables(htmlString) {
//   // Create a DOM parser
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(htmlString, 'text/html');

//   // Get all table elements
//   const allTables = doc.querySelectorAll('table');

//   // Loop through each table
//   allTables.forEach((table) => {
//     // Check if this table is nested inside another table
//     let parent = table.parentElement;
//     while (parent) {
//       if (parent.tagName === 'TABLE') {
//         table.previousElementSibling.textContent.includes('Table') ? table.previousElementSibling.remove() : table.textContent
//         table.remove(); // Remove the nested table
//         break;
//       }
//       parent = parent.parentElement;
//     }
//   });

//   // Return the modified HTML as string
//   return doc.body.innerHTML;
// }






export function addTableCaptions(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') return htmlString;

  try {
    const container = document.createElement('div');
    container.innerHTML = htmlString;

    const tables = container.querySelectorAll('table[data-table-caption="true"]');
    const images = container.querySelectorAll('img');
    let captionCount = 1;
    let figureCount = 1;

    const TABLE_PREFIX_RE = /^\s*Table\s+\d+:\s*/i;

    const nodeContainsDecorator = (el) => {
      if (!(el instanceof Element)) return false;
      if (
        el.hasAttribute('data-lexical-decorator') ||
        el.getAttribute('data-node-type') === 'reference' ||
        el.hasAttribute('data-cross-ref')
      ) return true;
      // Check descendants
      return !!el.querySelector('[data-lexical-decorator], [data-node-type="reference"], [data-cross-ref]');
    };

    const stripExistingPrefixFromStart = (p) => {
      // 1) Remove duplicate [data-caption-part="number"] (keep the first, if any)
      const numberSpans = p.querySelectorAll('[data-caption-part="number"]');
      if (numberSpans.length > 1) {
        for (let i = 1; i < numberSpans.length; i++) numberSpans[i].remove();
      }

      // 2) Remove raw/inline "Table X:" prefix from the **start** only
      while (p.firstChild) {
        const n = p.firstChild;

        if (n.nodeType === Node.TEXT_NODE) {
          const newText = (n.textContent || '').replace(TABLE_PREFIX_RE, '');
          if (newText.length === (n.textContent || '').length) break; // no prefix at start
          n.textContent = newText;
          if (!n.textContent) p.removeChild(n);
          else break; // cleaned
        } else if (n.nodeType === Node.ELEMENT_NODE) {
          const el = /** @type {Element} */ (n);

          // If this is our number span we will handle it later; remove it now to avoid duplicates
          if (el.getAttribute('data-caption-part') === 'number') {
            p.removeChild(el);
            continue;
          }

          // If element contains any decorator/cross-ref or is <i>, don't touch
          if (nodeContainsDecorator(el) || el.tagName.toLowerCase() === 'i') break;

          // Only strip if the element is a simple inline holder (span/strong/em/u/b/i) with textContent
          const tag = el.tagName.toLowerCase();
          const isSimpleInline = /^(span|strong|em|u|b|i)$/i.test(tag);
          if (!isSimpleInline) break;

          const txt = el.textContent || '';
          if (!TABLE_PREFIX_RE.test(txt)) break;

          // Remove only the prefix portion, keep the rest
          const newTxt = txt.replace(TABLE_PREFIX_RE, '');
          // If becomes empty, remove element; else replace its text and stop
          if (newTxt.trim() === '') {
            p.removeChild(el);
            continue; // keep looping to clear any subsequent prefix text nodes
          } else {
            // Replace element's children with a single text node (preserve tag)
            el.innerHTML = '';
            el.appendChild(document.createTextNode(newTxt));
            break;
          }
        } else {
          break;
        }
      }
    };

    const ensureCaptionP = (table) => {
      let prevElem = table.previousElementSibling;
      if (prevElem && prevElem.tagName && prevElem.tagName.toLowerCase() === 'p') return prevElem;
      const p = document.createElement('p');
      table.parentNode.insertBefore(p, table);
      return p;
    };

    const upsertNumberSpan = (p, count) => {
      let numberSpan = p.querySelector('[data-caption-part="number"]');
      if (!numberSpan) {
        numberSpan = document.createElement('span');
        numberSpan.setAttribute('data-caption-part', 'number');
        p.insertBefore(numberSpan, p.firstChild);
      } else {
        // ensure it's at the very start
        if (p.firstChild !== numberSpan) p.insertBefore(numberSpan, p.firstChild);
      }
      numberSpan.textContent = 'Table ' + count + ': ';
      return numberSpan;
    };

    const upsertItalicLabel = (p, numberSpan) => {
      let iTag = p.querySelector('i');
      if (!iTag) {
        iTag = document.createElement('i');
        // Move everything after numberSpan into iTag (preserve refs/decorators)
        while (numberSpan.nextSibling) {
          iTag.appendChild(numberSpan.nextSibling);
        }
        p.appendChild(iTag);
      } else {
        // keep numberSpan before <i>
        if (iTag.previousSibling !== numberSpan) {
          p.insertBefore(numberSpan, iTag);
        }
      }
      return iTag;
    };

    tables.forEach((table) => {
      if (!table || !table.parentNode) return;

      const captionP = ensureCaptionP(table);
      // Remove any preexisting "Table X:" prefix at the start (text or simple spans)
      stripExistingPrefixFromStart(captionP);

      // Now add/update the canonical number span
      const numberSpan = upsertNumberSpan(captionP, captionCount);

      // Ensure label is inside <i>, without touching decorator spans
      upsertItalicLabel(captionP, numberSpan);

      captionCount++;
    });

    // Figures (unchanged logic)
    images.forEach((img) => {
      if (!img || !img.parentNode) return;

      const nextElem = img.nextElementSibling;
      const FigureText = 'Figure ' + figureCount + ':';

      if (
        nextElem &&
        nextElem.tagName &&
        nextElem.tagName.toLowerCase() === 'span' &&
        /^Figure\s+\d+:/i.test((nextElem.textContent || '').trim())
      ) {
        const str = nextElem.textContent || '';
        const result = str.replace(/^Figure\s+\d+:/, '').trim();
        nextElem.innerHTML = '<span>' + FigureText + '</span> <span>' + result + '</span>';
      } else {
        const caption = document.createElement('span');
        caption.textContent = FigureText;
        img.parentNode.insertBefore(caption, img.nextSibling);
      }

      figureCount++;
    });

    const res = splitLongTableCells(container.innerHTML);
    return res || container.innerHTML;
  } catch (error) {
    console.error('Error in addTableCaptions:', error);
    return htmlString;
  }
}


function splitLongTableCells(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const tables = Array.from(doc.querySelectorAll('table'));

    tables.forEach(originalTable => {
        const originalRows = Array.from(originalTable.querySelectorAll('tr'));
        let hasLongCell = false;
                  function containsImageTag(str) {
          return /<img\b[^>]*>/i.test(str);
         }

        // Check for long content
        originalRows.forEach(row => {
            row.querySelectorAll('td, th').forEach(cell => {
                if (cell.textContent.trim().length > 250) {
                    hasLongCell = true;
                }
                if(containsImageTag(cell.innerHTML)){
                    hasLongCell = false
                }
            });
        });

        if (hasLongCell) {
            const newTables = [];

            originalRows.forEach(originalRow => {
                const originalCells = Array.from(originalRow.children); // td or th

                const chunks = originalCells.map(cell => {
                    const text = cell.textContent.trim();
                    const splitText = [];

                    for (let i = 0; i < text.length; i += 250) {
                        splitText.push(text.slice(i, i + 250));
                    }

                    return {
                        tagName: cell.tagName.toLowerCase(),
                        attributes: [...cell.attributes],
                        chunks: splitText
                    };
                });

                const maxChunks = Math.max(...chunks.map(c => c.chunks.length));

                for (let i = 0; i < maxChunks; i++) {
                    let newTable = newTables[i];
                    if (!newTable) {
                        newTable = doc.createElement('table');
                        [...originalTable.attributes].forEach(attr => {
                            if (attr.name === 'data-table-caption' && attr.value === 'true') {
                                newTable.setAttribute(attr.name, 'false')
                            } else {
                                newTable.setAttribute(attr.name, attr.value)
                            }
                        }
                        );
                        newTables[i] = newTable;
                    }

                    const newRow = doc.createElement('tr');
                    [...originalRow.attributes].forEach(attr =>
                        newRow.setAttribute(attr.name, attr.value)
                    );

                    chunks.forEach(cellData => {
                        const newCell = doc.createElement(cellData.tagName);
                        cellData.attributes.forEach(attr =>
                            newCell.setAttribute(attr.name, attr.value)
                        );
                        newCell.textContent = cellData.chunks[i] || '';
                        newRow.appendChild(newCell);
                    });

                    newTable.appendChild(newRow);
                }
            });

            // Replace original table with new tables as HTML string
            const wrapper = doc.createElement('div');
            newTables.forEach(table => wrapper.appendChild(table));

            // Replace the original table in its parent
            originalTable.replaceWith(...wrapper.children);
        }
    });

    return doc.body.innerHTML;
}






export function removePTagInsideH1FromString(htmlString) {
    // Create a temporary DOM element to parse the HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;

    // Select all h1 elements in the parsed HTML
    const h1Elements = tempDiv.querySelectorAll('h1');

    h1Elements.forEach(h1 => {
        // Find the first p tag inside each h1 element
        const pInsideH1 = h1.querySelector('p');

        // Remove the p tag if it exists inside the h1 tag
        if (pInsideH1) {
            pInsideH1.remove();
        }
    });

    // const result = filterHiddenParagraphs(tempDiv.innerHTML);
    const result = tempDiv.innerHTML;
    // Return the updated HTML as a string
    return result;
}



export function transformHeadings(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const processElements = (elements) => {
        elements.forEach(el => {
            const onlyChildIsTable =
                el.children.length > 0 &&
                Array.from(el.children).every(child => child.tagName === 'TABLE');

            // Case 1: Element wraps only table(s) → unwrap
            if (onlyChildIsTable) {
                const fragment = document.createDocumentFragment();
                Array.from(el.children).forEach(child => {
                    if (child.tagName === 'TABLE') {
                        fragment.appendChild(child.cloneNode(true));
                    }
                });
                el.replaceWith(fragment);
            }

            // Case 2: Element contains only a <p> (possibly empty or just <br/>)
            else if (
                el.children.length === 1 &&
                el.children[0].tagName === 'P'
            ) {
                const p = el.children[0];
                const pHtml = p.innerHTML.trim();
                const isEmptyOrBrOnly = pHtml === '' || /^<br\s*\/?>$/i.test(pHtml);

                if (isEmptyOrBrOnly) {
                    el.replaceWith(p);
                } else {
                    p.replaceWith(...p.childNodes);
                }
            }
        });
    };

    // Select all headings and <p> elements
    const elementsToProcess = Array.from(
        doc.querySelectorAll('h1, h2, h3, h4, h5, h6, p')
    );

    processElements(elementsToProcess);

    return doc.body.innerHTML;
}