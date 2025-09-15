import html2pdf from 'html2pdf.js';


export const exportToPDF1 = async (editId: string, editorTitle: string,parsedHtmlString:string,setpdfExport:any, landscape?: boolean): Promise<any> => {

    setpdfExport(true);
    const editorElement = document.querySelector(`.editor-autosave-${editId}`);

    if (!editorElement) {
      console.error("Editor content not found.");
      setpdfExport(false);
      return;
    }
    const clone: any = editorElement.cloneNode(true);

    clone
      .querySelectorAll(".PlaygroundEditorTheme__tableCell")
      .forEach((cell: any) => {
        cell.style.minWidth = "0px";
        cell.style.width = "0px";
      });

    const style = document.createElement("style");
    style.innerHTML = `
    .break-avoid {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .PlaygroundEditorTheme__table {
      margin: 0 !important;
      border-collapse: collapse !important;
      box-sizing: border-box !important;
      overflow-wrap: break-word !important;
    }
    .PlaygroundEditorTheme__tableCell, .PlaygroundEditorTheme__tableCellHeader {
      word-break: break-word !important;
      overflow-wrap: break-word !important;
      white-space: normal !important;
      box-sizing: border-box !important;
    }
    .block-end {
      border-bottom: none !important
    }
    .block-end::after {
      content: none !important;
    }
    .block-end::before {
      content: none !important;
    }
    #header {
      display: none
    }
    #footer {
      display: none
    }
    [data-header]::after {
      opacity: 0;
    }
    [data-footer]::after { 
      opacity: 0;
    }
      .padding-elem{
      all:unset;
      }
      .potrait{
      all:unset;
      }
      .potrait-tables{
      all: unset;
      }
  `;
    clone.appendChild(style);

    const textElements = clone.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li");
    textElements.forEach((el: any) => {
      el.classList.add("break-avoid");
      el.classList.remove("padding-elem");
    });

    const tables = clone.querySelectorAll("table");
    tables.forEach((el: any) => {
      if(el.tagName === 'TABLE'){
        el.classList.remove('potrait-tables')
        el.classList.remove('padding-elem')
        el.classList.remove('header-js')
        el.classList.remove('block-end')
        console.log('dsjfhkjsdhfsdf',el)
      }
      
    });

    const tempContainer = document.createElement("div");
tempContainer.innerHTML = parsedHtmlString;


    const footnotes = tempContainer.querySelectorAll('.footnote');
    const footnoteMap: Record<number, string[]> = {};

    function getFootnoteValue(footnoteId: string): string | null {
      const h6Elems: any = tempContainer.querySelectorAll('h6[data-footnotes]');
      for (const h6Elem of h6Elems) {
        const rawText = h6Elem.textContent?.trim();
        if (!rawText) continue;

        try {
          const parsed = JSON.parse(rawText);
          if (parsed[footnoteId]) {
            return parsed[footnoteId];
          }
        } catch (e) {
          console.log(e)
        }
      }
      return null;
    }

    footnotes.forEach((footnote: any) => {
      const footnoteId = footnote.id;

      const match = footnoteId.match(/footnote_page-number-(\d+)-/);
      if (!match) return;

      let pageNumber = parseInt(match[1], 10);

      // Adjust pageNumber based on footnote index
      // const footnoteIndex: any = Array.from(footnotes).indexOf(footnote);

      // if (footnoteIndex >= 3 && footnoteIndex < 10) {
      //   pageNumber += 1;
      // } else if (footnoteIndex >= 10 && footnoteIndex < 20) {
      //   pageNumber += 2;
      // }

      const value = getFootnoteValue(footnoteId);

      if (value) {
        if (!footnoteMap[pageNumber]) footnoteMap[pageNumber] = [];
        if (!footnoteMap[pageNumber].includes(value)) {
          footnoteMap[pageNumber].push(value);
        }
      }

    });


    const today = new Date();
    const formattedDate = today?.toISOString()?.split("T")[0];
    const customTitle = `${editorTitle}-${formattedDate}`;

    const rawHeader = document.querySelector('.header-input')?.getAttribute('value') || '';
    const rawFooter = document.querySelector('.footer-input')?.getAttribute('value') || '';

    const headerText = rawHeader.trim();
    const footerText = rawFooter.trim();

    const isDefaultHeader = headerText === '' || headerText === 'Type a Header';
    const isDefaultFooter = footerText === '' || footerText === 'Type a Footer';

    clone.querySelectorAll('[data-header], [data-footer]').forEach((el: HTMLElement) => {
      const pageIndex = Number(el.getAttribute("data-block-index"));

      if (pageIndex > 1) {
        el.style.opacity = '0';
      }
    }); //remove the header and footer from clone

    const wrapper = document.createElement("div");
    wrapper.style.boxSizing = "border-box";
    wrapper.appendChild(clone);

    const defaultOptions = {
      margin: isDefaultHeader && isDefaultFooter ? [0, 1, 1.3, 1] : [0.75, 1, 1.3, 1],
      filename: `${customTitle || 'sample-project'}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scrollY: 0,
        useCORS: true,
        allowTaint: true,
      },
      jsPDF: {
        unit: "in",
        format: [9, 17],
        orientation: "portrait",
        putOnlyUsedFonts: true,
      },
      pagebreak: {
        mode: "css",
        avoid: ".break-avoid",
      },
    };

    // Step 1: Render once in memory to get page count
    let pageCount = 0;
    await html2pdf()
      .set({ ...defaultOptions, html2canvas: { ...defaultOptions.html2canvas, scale: 1.0 } })
      .from(tempContainer)
      .toPdf()
      .get("pdf")
      .then((pdf: any) => {
        pageCount = pdf.internal.getNumberOfPages();
      });

    // Step 2: Decide scale based on page count
    let adjustedScale = 2.0;

    if (pageCount > 30 && pageCount < 55) adjustedScale = 0.8;
    else if (pageCount > 55) {
      adjustedScale = 0.8
    }

    const finalOpt = {
      ...defaultOptions,
      html2canvas: {
        ...defaultOptions.html2canvas,
        scale: adjustedScale,
      },
    };

    setTimeout(() => {
      html2pdf()
        .set(finalOpt)
        .from(wrapper)
        .toPdf()
        .get("pdf")
        .then((pdf: any) => {
          const totalPages = pdf.internal.getNumberOfPages();
          let noteCount: any = 1;

          for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.setTextColor(100);
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            if (!isDefaultHeader) {
              pdf.setFontSize(12);
              pdf.text(headerText, 0.3, 0.75 - 0.3);
            }

            if (!isDefaultFooter) {
              pdf.setFontSize(12);
              pdf.text(footerText, 0.3, pageHeight - 0.75 + 0.3);
            }

            pdf.text(`${i}`, pageWidth - 0.5, pageHeight - 0.3, { align: "right" });

            const notes: string[] | undefined = footnoteMap[i];
            if (notes && notes.length > 0) {
              const pageHeight = pdf.internal.pageSize.getHeight();
              const footerOffset = 0.5;
              const lineHeight = 0.2;

              // Calculate total height required for notes
              const totalFootnoteHeight = notes.length * lineHeight + 0.2;
              const startY = pageHeight - footerOffset - totalFootnoteHeight;

              const lineMarginLeft = 1.3;
              const lineWidth = pageWidth * 0.3;
              const lineXStart = lineMarginLeft;
              const lineXEnd = lineXStart + lineWidth;

              pdf.setDrawColor(0, 0, 0);
              pdf.setLineWidth(0.01);
              pdf.line(lineXStart, startY, lineXEnd, startY);

              pdf.setFontSize(9);
              pdf.setTextColor(0, 0, 0);
              notes.forEach((note: string, index: number) => {
                const y = startY + 0.2 + index * lineHeight;
                pdf.text(`${noteCount}. ${note}`, 1.3, y, { maxWidth: pageWidth - 1.2 });
                noteCount++
              });
            }

          }





        })
        .save()
        .then(() => {
          console.log("PDF saved with page numbers", editorElement);
          setpdfExport(false);
        })
        .catch(() => {
          setpdfExport(false);
        })
    }, 1000);

  };