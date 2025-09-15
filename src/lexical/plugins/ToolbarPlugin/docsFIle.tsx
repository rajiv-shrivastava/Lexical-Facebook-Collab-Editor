import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  FootnoteReferenceRun,
  Table,
  TableRow,
  TableCell,
  ShadingType,
  ImageRun,
  WidthType,
  Footer,
  PageNumber,
  Header,
  LineRuleType,
  TableLayoutType
} from "docx";
//@ts-ignore
import { saveAs } from "file-saver";
import {
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  ElementNode,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
} from "lexical";
import { $isListNode, $isListItemNode } from "@lexical/list";
import { $getAllFootnoteNodes, $isFootnoteNode } from "../../nodes/FootNotes";
import { $isImageNode } from "../../nodes/ImageNode";
import { $isTableNode } from "../../nodes/CustomTableNode/src";
import { TableCellNode } from "../../nodes/CustomTableNode/src";
import { $isHeadingNode } from "../../nodes/Heading-node-custom";

type BlockElement = Paragraph | Table;

interface FootnoteData {
  id: number;
  content: string;
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return "FFFFFF";
  const [r, g, b] = match.slice(1).map((num) =>
    parseInt(num, 10).toString(16).padStart(2, "0")
  );
  return `${r}${g}${b}`.toUpperCase();
}

function getImageTypeFromDataUrl(dataUrl: string): "png" | "jpg" | "gif" {
  const match: any = /^data:image\/(png|jpeg|jpg|gif);base64,/.exec(dataUrl);
  if (match) {
    return match[1] === "jpg" || match[1] === "jpeg" ? "jpg" : match[1];
  }
  return "png";
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function createTextRun(text: string, format: number): TextRun {
  const isBold = (format & 1) !== 0;
  const isItalic = (format & 2) !== 0;
  const isUnderline = (format & 8) !== 0;
  return new TextRun({
    text,
    bold: isBold,
    italics: isItalic,
    underline: isUnderline ? {} : undefined,
    size: 22
  });
}

function createHeadingTextRun(text: string, format: number, styles?: {
  fontSize?: string,
  fontWeight?: string,
  fontStyle?: string,
  fontFamily?: string
}): TextRun {
  const isBoldFromFormat = (format & 1) !== 0;
  const isItalicFromFormat = (format & 2) !== 0;
  const isUnderline = (format & 8) !== 0;

  const bold =
    styles?.fontWeight
      ? styles.fontWeight === "bold" || parseInt(styles.fontWeight) >= 600
      : isBoldFromFormat;
  const italics =
    styles?.fontStyle
      ? styles.fontStyle.toLowerCase() === "italic"
      : isItalicFromFormat;

  let size = 22;
  if (styles?.fontSize) {
    const pxMatch = styles.fontSize.match(/^(\d+(\.\d+)?)px$/);
    if (pxMatch) {
      const pxValue = parseFloat(pxMatch[1]);
      size = Math.round(pxValue * 2);
    }
  }

  return new TextRun({
    text,
    bold,
    italics,
    underline: isUnderline ? {} : undefined,
    size,
    font: styles?.fontFamily || "Times New Roman",
    color: '#000000'
  });
}


function getHeadingLevel(tag: string): any {
  switch (tag) {
    case "h1": return HeadingLevel.HEADING_1;
    case "h2": return HeadingLevel.HEADING_2;
    case "h3": return HeadingLevel.HEADING_3;
    case "h4": return HeadingLevel.HEADING_4;
    case "h5": return HeadingLevel.HEADING_5;
    case "h6": return HeadingLevel.HEADING_6;
    default: return HeadingLevel.HEADING_1;
  }
}

function getAlignment(format: string): any {
  switch (format) {
    case "center": return AlignmentType.CENTER;
    case "right": return AlignmentType.RIGHT;
    case "justify": return AlignmentType.JUSTIFIED;
    default: return AlignmentType.LEFT;
  }
}

function processNode(
  node: LexicalNode,
  footnotes: Map<string, { id: number; content: string }>,
  contentWidth?: number
): { blocks: BlockElement[] } {
  const blocks: BlockElement[] = [];
  const textRuns: (TextRun | FootnoteReferenceRun)[] = [];

  if ($isParagraphNode(node)) {
    const children = node.getChildren();

    children.forEach((child) => {
      if ($isTextNode(child)) {
        const text = child.getTextContent();
        const format = child.getFormat();
        textRuns.push(createTextRun(text, format));
      } else if ($isFootnoteNode(child)) {
        const footnoteId = child.getId();
        const footnoteData = footnotes.get(footnoteId);
        if (footnoteData) {
          textRuns.push(new FootnoteReferenceRun(footnoteData.id));
        }
      } else if ($isImageNode(child)) {
        const src = child.getSrc();
        const width: any = child.__width !== 'inherit' && child.__width > 690 ? 600 : child.__width
        const height: any = child.__height

        if (src.startsWith("data:")) {
          const base64Data = src.split(",")[1];
          const buffer = base64ToUint8Array(base64Data);
          const imageType = getImageTypeFromDataUrl(src);

          const imageRun = new ImageRun({
            data: buffer,
            type: imageType,
            transformation: { width, height },
          });

          blocks.push(new Paragraph({ children: [imageRun] }));
        }
      }
    });

    if (textRuns.length > 0) {
      blocks.push(
        new Paragraph({
          children: textRuns,
          alignment: getAlignment(node.getFormatType()),
          spacing: {
            line: 360,
            lineRule: LineRuleType.AUTO,
          },
        })
      );
    }
  }

  else if ($isHeadingNode(node)) {
    const tag = node.getTag();
    if (tag !== 'h6') {
      const children = node.getChildren();
      const textRuns: (TextRun | FootnoteReferenceRun)[] = [];

      const headingStylesMap: any = {
        h1: { fontSize: "14.5px", fontWeight: "bold", fontStyle: "normal", fontFamily: "Times New Roman" },
        h2: { fontSize: "14.5px", fontWeight: "bold", fontStyle: "italic", fontFamily: "Times New Roman" },
        h3: { fontSize: "14.5px", fontWeight: "100", fontStyle: "italic", fontFamily: "Times New Roman" },
      };

      const styles = headingStylesMap[tag] || {};

      children.forEach((child) => {
        if ($isTextNode(child)) {
          const text = child.getTextContent();
          const format = child.getFormat();
          textRuns.push(createHeadingTextRun(text, format, styles));
        } else if ($isFootnoteNode(child)) {
          const footnoteId = child.getId();
          const footnoteData = footnotes.get(footnoteId);
          if (footnoteData) {
            textRuns.push(new FootnoteReferenceRun(footnoteData.id));
          }
        }
      });

      blocks.push(
        new Paragraph({
          children: textRuns,
          heading: getHeadingLevel(node.getTag()),
          spacing: {
            before: 200,
            after: 200,
          },
        })
      );
    }
  }
  else if ($isListNode(node)) {
    const listItems = node.getChildren();

    listItems.forEach((listItem) => {
      if ($isListItemNode(listItem)) {
        const children = listItem.getChildren();
        const textRuns: (TextRun | FootnoteReferenceRun)[] = [];

        children.forEach((child) => {
          if ($isTextNode(child)) {
            const text = child.getTextContent();
            const format = child.getFormat();
            textRuns.push(createTextRun(text, format));
          } else if ($isFootnoteNode(child)) {
            const footnoteId = child.getId();
            const footnoteData = footnotes.get(footnoteId);
            if (footnoteData) {
              textRuns.push(new FootnoteReferenceRun(footnoteData.id));
            }
          }
        });

        const bulletText = node.getListType() === "bullet" ? "• " : "1. ";

        blocks.push(
          new Paragraph({
            children: [new TextRun({ text: bulletText }), ...textRuns],
            spacing: {
              line: 360,
              lineRule: LineRuleType.AUTO,
            },
          })
        );
      }
    });
  }
  else if ($isTableNode(node) && node instanceof ElementNode) {
    const rowNodes = node.getChildren();
    // Fallback if contentWidth not provided (keeps your old 9000 default)
    const tableTotalWidth = contentWidth ?? 9000;
    const tableRows = rowNodes
      .map((rowNode): TableRow | null => {
        if (!(rowNode instanceof ElementNode)) return null;

        const cellNodes = rowNode.getChildren();
        const numColumns = cellNodes.length || 1;
        // Divide usable width evenly across columns
        const cellWidth = Math.floor(tableTotalWidth / numColumns);

        const tableCells = cellNodes.map((cellNode) => {
          const cellParagraphs = (cellNode as TableCellNode).getChildren();
          const paragraphList: Paragraph[] = [];

          const bgColor = rgbToHex(
            (cellNode as TableCellNode).__backgroundColor || "rgb(255,255,255)"
          );

          cellParagraphs.forEach((p) => {
            const textRuns: (TextRun | FootnoteReferenceRun)[] = [];
            const spans = (p as ParagraphNode).getChildren();

            spans.forEach((span) => {
              if ($isTextNode(span)) {
                const text = span.getTextContent();
                const format = span.getFormat();
                textRuns.push(createTextRun(text, format));
              } else if ($isFootnoteNode(span)) {
                const footnoteId = span.getId();
                const footnoteData = footnotes.get(footnoteId);
                if (footnoteData) {
                  textRuns.push(new FootnoteReferenceRun(footnoteData.id));
                }
              } else if ($isImageNode(span)) {
                const src = span.getSrc();
                const width: any = 200;
                const height: any = 200;

                if (src.startsWith("data:")) {
                  const base64Data = src.split(",")[1];
                  const buffer = base64ToUint8Array(base64Data);
                  const imageType = getImageTypeFromDataUrl(src);

                  const imageRun = new ImageRun({
                    data: buffer,
                    type: imageType,
                    transformation: { width, height },
                  });

                  textRuns.push(imageRun);
                }
              }
            });

            // Fallback if no content
            if (textRuns.length === 0) {
              textRuns.push(new TextRun(" "));
            }

            paragraphList.push(
              new Paragraph({
                children: textRuns,
                spacing: {
                  line: 360,
                  lineRule: LineRuleType.AUTO,
                },
              })
            );
          });

          return new TableCell({
            width: {
              size: cellWidth,
              type: WidthType.DXA,
            },
            margins: {
              top: 50,
              bottom: 50,
              left: 50,
              right: 50,
            },
            shading: {
              type: ShadingType.CLEAR,
              fill: bgColor,
              color: "auto",
            },
            children: paragraphList,
          });
        });

        return new TableRow({ children: tableCells });
      })
      .filter((row): row is TableRow => row !== null);

    blocks.push(
      new Table({
        width: {
          size: 9000,
          type: WidthType.DXA,
        },
        rows: tableRows,
        layout: TableLayoutType.FIXED,
        columnWidths:
          (rowNodes[0] instanceof ElementNode)
            ? Array((rowNodes[0] as ElementNode).getChildren().length || 1)
              .fill(Math.floor(tableTotalWidth / ((rowNodes[0] as ElementNode).getChildren().length || 1)))
            : undefined,

      })
    );
  }


  return { blocks };
}


function parseHTMLWithFootnotes(htmlString: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const footnoteElement = doc.querySelector("h6[data-footnotes]");
  const footnotesArray: Array<{ id: string, text: string }> = [];

  if (footnoteElement) {
    const footnotesData = JSON.parse(footnoteElement.textContent || "{}");

    Object.entries(footnotesData)
      .sort(([keyA], [keyB]) => {
        const extractKeyParts = (key: string) => {
          const match = key.match(/footnote_page-number-(\d+)-(.+)/);
          return match ? [parseInt(match[1], 10), match[2]] : [0, key];
        };

        const [pageA, idA] = extractKeyParts(keyA);
        const [pageB, idB] = extractKeyParts(keyB);

        if (pageA !== pageB) return (pageA as any) - (pageB as any);
        return (idA as string).localeCompare((idB as string));
      })
      .forEach(([id, text]) => {
        footnotesArray.push({ id, text: text as string });
      });
  }

  return {
    htmlString,
    footnotes: footnotesArray
  };
}



export function exportToWord(
  editor: LexicalEditor,
  fileName: string = "document",
  parsedHtmlString: string,
  landscape: boolean = false,
): void {


  const { footNoteArr, rootChildren, footnoteNodes } = editor.getEditorState().read(() => {
    return {
      footNoteArr: parseHTMLWithFootnotes(parsedHtmlString),
      footnoteNodes: $getAllFootnoteNodes(),
      rootChildren: $getRoot().getChildren()
    };
  });

  const headerContent = document.querySelector('.Header-Input')?.getAttribute('value') || '';
  const footerContent = document.querySelector('.Footer-Input')?.getAttribute('value') || '';

  editor.getEditorState().read(() => {
    const root = $getRoot();
    const children = root.getChildren();

    const footnoteNodes = $getAllFootnoteNodes();
    const footnotes = new Map<string, FootnoteData>();
    const footnoteDefinitions: Record<number, { children: Paragraph[] }> = {};

    if (footnoteNodes?.length) {

      footNoteArr.footnotes.forEach((item: any, index: any) => {
        const footnoteId = index + 1;
        footnotes.set(item.id, { id: footnoteId, content: item.text || "" });
        footnoteDefinitions[footnoteId] = {
          children: [new Paragraph({ children: [new TextRun({ text: item.text || "" })] })]
        };
      });

    }

    const documentBlocks: BlockElement[] = [];
    children.forEach((child) => {
      const { blocks } = processNode(child, footnotes);
      console.log('shfdgg',child)
      documentBlocks.push(...blocks);
    });

        children.forEach((child:any)=>{
      if(child.getType() === 'layout-container'){
        child.getChildren().forEach((pageNode:any)=>{
          if(pageNode.getType() === 'layout-item'){
            pageNode.getChildren().forEach((content:any)=>{
            const { blocks } = processNode(content, footnotes);
            documentBlocks.push(...blocks);
            })
          }
        })
      }
    })

    if (documentBlocks.length === 0) {
      documentBlocks.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
    }
    
    console.log('kfjdhgdfg',documentBlocks)
    const header = new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun({ children: [headerContent] })
          ]
        })
      ]
    })

    const footer = new Footer({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ children: [PageNumber.CURRENT] }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.LEFT,
          children: [
            new TextRun(footerContent),
          ],
        }),
      ],
    });

    const documentSections: any[] = [];

    // --- NEW: default page metrics in case pagination hasn't run yet ---
    const DEFAULT_PAGE = {
      orientation: landscape ? "landscape" : "portrait",
      widthTwips: 816 * 15,   // A4 portrait width
      heightTwips: 1290 * 15, // A4 portrait height
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440, header: 720, footer: 720 }
    };

    // Group LexicalNodes by their `data-block-index` from the DOM (with fallback)
    const groupedByBlockIndex: Record<string, LexicalNode[]> = {};
    const unpaginatedBucket: LexicalNode[] = [];

    children.forEach((child) => {
      const key = child.getLatest().__key;
      const domNode = editor.getElementByKey(key);
      const blockIndex = domNode?.getAttribute("data-block-index");

      if (blockIndex != null) {
        (groupedByBlockIndex[blockIndex] ??= []).push(child);
      } else {
        // --- NEW: keep nodes that don’t yet have pagination markers ---
        unpaginatedBucket.push(child);
      }
    });

    const hasAnyGroups = Object.keys(groupedByBlockIndex).length > 0;
    const sortedBlockIndexes = hasAnyGroups
      ? Object.keys(groupedByBlockIndex).sort((a, b) => +a - +b)
      : [];

    // --- Build sections from groups if available ---
    if (hasAnyGroups) {
      // If some nodes weren’t paginated yet, append them as a last section
      if (unpaginatedBucket.length > 0) {
        groupedByBlockIndex["999999"] = unpaginatedBucket;
        sortedBlockIndexes.push("999999");
      }

      sortedBlockIndexes.forEach((blockIndex) => {
        const group = groupedByBlockIndex[blockIndex];
        if (group.length === 0) return;

        const firstDom = editor.getElementByKey(group[0].getLatest().__key);
        const isLandscape = firstDom?.getAttribute("data-landscape") === "true";

        const pageWidthTwips = isLandscape ? 1290 * 15 : 816 * 15;
        const pageHeightTwips = isLandscape ? 816 * 15 : 1290 * 15;
        const { top, right, bottom, left, header: head, footer: foot } = DEFAULT_PAGE.margins;
        const contentWidth = pageWidthTwips - (left + right);

        const sectionBlocks: BlockElement[] = [];
        group.forEach((child) => {
          const { blocks } = processNode(child, footnotes, contentWidth);
          sectionBlocks.push(...blocks);
        });

        group.forEach((child:any)=>{
      if(child.getType() === 'layout-container'){
        child.getChildren().forEach((pageNode:any)=>{
          if(pageNode.getType() === 'layout-item'){
            pageNode.getChildren().forEach((content:any)=>{
            const { blocks } = processNode(content, footnotes);
            sectionBlocks.push(...blocks);
            })
          }
        })
      }
    })

        documentSections.push({
          properties: {
            page: {
              size: {
                orientation: isLandscape ? "landscape" : "portrait",
                width: pageWidthTwips,
                height: pageHeightTwips,
              },
              margin: { top, right, bottom, left, header: head, footer: foot },
            },
          },
          headers: { default: header },
          footers: { default: footer },
          children: sectionBlocks.length > 0 ? sectionBlocks : [
            new Paragraph({ children: [new TextRun("")] })
          ],
        });
      });
    } else {
      // --- NEW: absolute fallback — build a single section from all children ---
      const pageWidthTwips = DEFAULT_PAGE.widthTwips;
      const { left, right } = DEFAULT_PAGE.margins;
      const contentWidth = pageWidthTwips - (left + right);

      const sectionBlocks: BlockElement[] = [];
      children.forEach((child) => {
        const { blocks } = processNode(child, footnotes, contentWidth);
        sectionBlocks.push(...blocks);
      });
      children.forEach((child:any)=>{
      if(child.getType() === 'layout-container'){
        child.getChildren().forEach((pageNode:any)=>{
          if(pageNode.getType() === 'layout-item'){
            pageNode.getChildren().forEach((content:any)=>{
            const { blocks } = processNode(content, footnotes);
            sectionBlocks.push(...blocks);
            })
          }
        })
      }
    })

      documentSections.push({
        properties: {
          page: {
            size: {
              orientation: DEFAULT_PAGE.orientation,
              width: DEFAULT_PAGE.widthTwips,
              height: DEFAULT_PAGE.heightTwips,
            },
            margin: DEFAULT_PAGE.margins,
          },
        },
        headers: { default: header },
        footers: { default: footer },
        children: sectionBlocks.length > 0 ? sectionBlocks : [
          new Paragraph({ children: [new TextRun("")] })
        ],
      });
      console.log('dfkjhgdfg',sectionBlocks)
    }
    const doc = new Document({
      footnotes: footnoteDefinitions,
      sections: documentSections,
    });


    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${fileName}.docx`);
    });
  });
}
