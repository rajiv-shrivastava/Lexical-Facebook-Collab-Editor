import { saveAs } from "file-saver";
import { parseHtmlForExportToWord, parseHtmlStateWithStyle } from '../utils/editorstateHelper';
import $ from 'jquery';
import React from 'react';
import { Helmet } from 'react-helmet';

const generateWord = async (editor, title, styleConfig, parsedHtmlString, landscape) => {
  const headerContent = document.querySelector('.header-input')?.getAttribute('value') || '';
  const footerContent = document.querySelector('.footer-input')?.getAttribute('value') || '';
  await generateWordFile({ title, parsedHtmlString, styleConfig, headerContent, footerContent, landscape });
};

const generateWordFile = async ({ title, parsedHtmlString, headerContent, footerContent, landscape }) => {
  const pageOrientation = landscape ? 'size: 11in 8.5in;' : 'size: 8.5in 11in;';
  const wordHeader = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <title>Document</title>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <style>
        body {
          font-family: "Times New Roman", Times, serif;
          font-size: 14.5px;
        }
        h1 { font-size: 14.5px; font-weight: bold; }
        h2 { font-size: 14.5px; font-style: italic; font-weight: bold; }
        h3, h4, h5 { font-size: 14.5px; font-style: italic; font-weight: 100; }
        ul, ol, li { line-height: normal !important; }

        table {
          width: 100%;
          max-width: 600px;
          table-layout: fixed;
          border-collapse: collapse;
          box-sizing: border-box;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        th, td {
          border: 1px solid #000;
          word-break: break-all;
          overflow-wrap: break-word;
          white-space: normal;
          box-sizing: border-box;
          max-width: 100%;
          padding: 4px;
        }

        @page Section1 {
          mso-header-margin:.5in;
          mso-footer-margin:.5in;
          mso-header: h1;
          mso-footer: f1;
          mso-footnote: _ftn1;
          mso-paper-source:0;
          ${pageOrientation}
        }
        
        div.Section1 {
          page: Section1;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
  `;

   const defaultFooter = `
    <p style="text-align:right">
      <span style="mso-field-code: PAGE"></span>
    </p>
  `;

  const wordFooter = `
      </div>
      
      <!-- Header definition -->
      <w:sectPr>
        <w:headerReference w:type="default" r:id="rId1"/>
        <w:footerReference w:type="default" r:id="rId2"/>
      </w:sectPr>
      
      <!-- Actual header content -->
      <div style='mso-element:header' id="h1">
        ${headerContent || ''}
      </div>
      
      <!-- Actual footer content -->
      <div style='mso-element:footer' id="f1">
        ${footerContent || ''}${defaultFooter}
      </div>
    </body>
    </html>
  `;

  const html = parsedHtmlString || $('.ContentEditable__root').html();
  const extractFoonote = parseHTMLWithFootnotes(html)
  const parsedHtml = parseHtmlForExportToWord(extractFoonote.htmlString);
  const styledHtml = parseHtmlStateWithStyle(parsedHtml);
  const processedHtml = await processContent(styledHtml);

  // const footnotesHtml = extractFoonote.footnotes.length
  // ? `<p style:'font-weight:bold'>FootNotes</p> <hr /><ol>${extractFoonote.footnotes.map(fn => 
  //     `<li id="footnote-${fn.index}">${fn.text}`)}</ol>`
  // : '';


  const footnotesHtml = extractFoonote.footnotes.length
  ? `
    <div style="border-top: 1px solid #000; margin-top: 20px; padding-top: 10px;">
      <p style="font-weight:bold">Footnotes</p>
      <ol>
        ${extractFoonote.footnotes.reverse().map(fn => `<li id="footnote-${fn.index}">${fn.text}</li>`).join('')}

      </ol>
    </div>
  `
  : '';


  const content = wordHeader + processedHtml + footnotesHtml + wordFooter;
  const blob = new Blob([content], { type: "application/msword" });
  saveAs(blob, `${title || "Exported"}.doc`);
};

async function processContent(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  // Remove all <h6> elements
  doc.querySelectorAll('h6').forEach(el => el.remove());

  // Style headings
  const headingMap = {
    h1: { fontSize: '14.5px', fontWeight: 'bold', fontStyle: 'normal' },
    h2: { fontSize: '14.5px', fontWeight: 'bold', fontStyle: 'italic' },
    h3: { fontSize: '14.5px', fontWeight: '100', fontStyle: 'italic' },
  };

  Object.entries(headingMap).forEach(([tag, styles]) => {
    doc.querySelectorAll(tag).forEach(el => {
      el.style.fontSize = styles.fontSize;
      el.style.fontWeight = styles.fontWeight;
      el.style.fontStyle = styles.fontStyle;
      el.style.fontFamily = `"Times New Roman", Times, serif`;
    });
  });

  const processedHtml = await styleImagesAndTables(doc.body.innerHTML);
  return processedHtml;
}

async function convertAvifToPngDataUrl(avifDataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load AVIF image.'));
    img.src = avifDataUrl;
  });
}

function createHiddenRenderContainer() {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.pointerEvents = 'none';
  container.style.width = '1000px';
  container.style.zIndex = -1;
  document.body.appendChild(container);
  return container;
}

  function parseHTMLWithFootnotes(htmlString) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const footnoteElement = doc.querySelector('h6[data-footnotes]');
    let footnotesArray = [];

    if (footnoteElement) {
        try {
            const footnotesData = JSON.parse(footnoteElement.textContent || '{}');

            footnotesArray = Object.entries(footnotesData)
                .sort(([keyA], [keyB]) => {
                    // Extract numerical parts for sorting: page-number and id suffix
                    const extractKeyParts = key => {
                        const match = key.match(/footnote_page-number-(\d+)-(.+)/);
                        return match ? [parseInt(match[1], 10), match[2]] : [0, key];
                    };

                    const [pageA, idA] = extractKeyParts(keyA);
                    const [pageB, idB] = extractKeyParts(keyB);

                    // First sort by page number, then by id
                    if (pageA !== pageB) return pageA - pageB;
                    return idA.localeCompare(idB);
                })
                .map(([id, text]) => ({ id, text }));
        } catch (e) {
            console.error("Failed to parse footnotes JSON:", e);
        }
    }

    return {
        htmlString,
        footnotes: footnotesArray
    };
}

async function styleImagesAndTables(htmlString) {
  const container = createHiddenRenderContainer();
  container.innerHTML = htmlString;

  // Handle images
  const images = container.querySelectorAll('img');
  await Promise.all(Array.from(images).map(async img => {
    if (/^data:image\/avif/.test(img.src)) {
      try {
        img.src = await convertAvifToPngDataUrl(img.src);
        img.alt = 'Converted from AVIF';
      } catch {}
    }
  }));

  images.forEach(img => {
    const maxWidth = 600;
    const width = img.offsetWidth || img.naturalWidth;
    const height = img.offsetHeight || img.naturalHeight;

    if (width > maxWidth) {
      img.setAttribute('width', maxWidth);
      img.style.width = `${maxWidth}px`;
      img.style.height = 'auto';
    } else {
      img.setAttribute('width', width);
      img.setAttribute('height', height);
      img.style.width = `${width}px`;
      img.style.height = `${height}px`;
    }
  });

  // Handle tables
  const tables = container.querySelectorAll('table');
  tables.forEach(table => {
    const colCount = table.rows[0]?.cells.length || 1;
    const colWidth = 600 / colCount;

    table.style.width = '100%';
    table.style.maxWidth = '600px';
    table.style.tableLayout = 'fixed';
    table.style.borderCollapse = 'collapse';

    table.querySelectorAll('th, td').forEach(cell => {
      cell.style.width = `${colWidth}px`;
      cell.style.maxWidth = `${colWidth}px`;
      cell.style.boxSizing = 'border-box';
      cell.style.overflow = 'hidden';
      cell.style.wordBreak = 'break-all';
      cell.style.whiteSpace = 'normal';
      cell.style.overflowWrap = 'break-word'; 
      cell.style.padding = '4px';
    });
  });

  const html = container.innerHTML;
  document.body.removeChild(container);
  return html;
}

export const ExportWordStylesHelmet = () => (
  <Helmet>
    <style>{`
      body {
        font-family: "Times New Roman", Times, serif;
        font-size: 14.5px;
      }
      h1 { font-size: 14.5px; font-weight: bold; }
      h2 { font-size: 14.5px; font-style: italic; font-weight: bold; }
      h3, h4, h5 { font-size: 14.5px; font-style: italic; font-weight: 100; }
      ul, ol, li { line-height: normal !important; }

      table {
        width: 600px;
        max-width: 600px;
        table-layout: fixed;
        border-collapse: collapse;
      }

      th, td {
        border: 1px solid #000;
        word-break: break-word;
        overflow-wrap: break-word;
        white-space: normal;
      }
    `}</style>
  </Helmet>
);

export default generateWord;
