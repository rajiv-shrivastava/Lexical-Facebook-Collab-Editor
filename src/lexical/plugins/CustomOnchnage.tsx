import { useEffect, useState, useRef, useCallback } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $getRoot } from "lexical";
import { removePTagInsideH1FromString } from "../utils/editorstateHelper";

const CustomOnChange = ({FootNote, onChange,showHeaderFooter }:any) => {
  const [editor] = useLexicalComposerContext();
  const [firstRender, setFirstRender] = useState(true);
  const prevHtmlRef = useRef(""); 
  const prevHtml = prevHtmlRef.current;
  // let heading :any;
  

  
  
  const handleEditorChange = useCallback(() => {
    editor.update(() => {
      let currentHtml = $generateHtmlFromNodes(editor);
      let combinedData;
      if(showHeaderFooter){
          const headerData :any = document.querySelector('.header-input')
      const footerData :any= document.querySelector('.footer-input')
        
      const saveHeaderFooterData = `<h6 data-header='${headerData? headerData.value: 'Type a Header'}' data-footer='${footerData ? footerData.value : 'Type a Footer'}'></h6> <h6 data-footnotes>${FootNote}</h6>`
      combinedData  = showHeaderFooter ? `${currentHtml} ${saveHeaderFooterData}` : currentHtml;

      }
      else{
        combinedData = currentHtml
      }
    // Optional: Clean up P tags inside H1s (based on your imported helper)
    currentHtml = removePTagInsideH1FromString(currentHtml);

    if (firstRender) {
      setFirstRender(false);
    } else if (currentHtml !== prevHtml) {
      onChange(combinedData);
      prevHtmlRef.current = combinedData;
    }
  });
}, [editor, firstRender, onChange, prevHtml]);

  useEffect(() => {
    const unregister = editor.registerUpdateListener(handleEditorChange);
    return () => unregister();
  }, [editor, handleEditorChange]);

  return null; 
};

export default CustomOnChange;
