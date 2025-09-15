import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";
import FooterPopup from "./FooterPopup";

export default function FooterPlugin({editId,savedStateFooter,landscape}:any) {
  const [editor] = useLexicalComposerContext();
  const [savedState, setSavedState] = useState("Type a Footer");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ogValue,setOgValue] = useState('default')

  const [activeInputs, setActiveInputs] = useState<{ [key: string]: boolean }>({
    footer: false,
    lastFooter: false
  });

  const inputRefs = {
    footer: useRef<HTMLInputElement>(null),
    lastFooter: useRef<HTMLInputElement>(null)
  };

  const SavedFooterState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSavedState(newValue);

  };

  const editable = (key: keyof typeof inputRefs) => {
    setActiveInputs(prev => ({ ...prev, [key]: true }));
    setTimeout(() => inputRefs[key].current?.focus(), 0);

            editor.update(()=>{
          const root = $getRoot();
          const text = $createTextNode('.')
          const para = $createParagraphNode()
          para.append(text)
          if(root) root.append(para)
        })
  };

  const handleBlur = (key: keyof typeof inputRefs) => {
    setActiveInputs(prev => ({ ...prev, [key]: false }));

      editor.update(() => {
    const root = $getRoot();
    const children = root.getChildren();

    // Example: remove any paragraph with the exact "removing one" text
    children.forEach((child) => {
      if (
        child.getType() === 'paragraph' &&
        child.getTextContent() === " "
      ) {
        child.remove();
      }
    });
  });
  };

  useEffect(() => {
const html = savedStateFooter;

const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const h6Element :any= doc.querySelector('h6[data-Footer]');
if(h6Element){
const dataFooter = h6Element.getAttribute('data-footer');
setSavedState(dataFooter)
}




    const blockElem: any = document.querySelectorAll(".block-end");
    blockElem.forEach((block: any) => {
      block.setAttribute(
        "data-footer",
        `${savedState && savedState.length > 0 ? savedState : "Type a footer"}`
      );
    });

  }, []);

        const openModal = () => {

        const paddingElem = document.querySelector(`.padding-elem`);
        if(paddingElem){
          const value :any =  paddingElem.getAttribute("data-footer");
          setOgValue(value)
        }
        setIsModalOpen(true);

    editor.update(() => {
      const root = $getRoot();
      const text = $createTextNode(" ");
      const para = $createParagraphNode();
      para.append(text);
      root.append(para);
    });
  };


        const cancelChanges = () => {
        setIsModalOpen(false)
        setSavedState(ogValue)
  };

        const applyChanges = () => {
    setIsModalOpen(false);
    cancelChanges

        const allchild = document.querySelector(`.content-editable-grid-${editId.editId}`);

    if(allchild){
      Array.from(allchild.children).forEach(element => {
        element.setAttribute(
        "data-footer",
        `${savedState}`
      );
      
      });
    }
            if (savedState.trim() === "") {
      setSavedState("Type a Footer");
    }
  };

  return (
    <>
          <input
        ref={inputRefs.footer}
        id="footer-save"
        type="text"
        data-block-index='1'
        data-landscape='false'
        onChange={SavedFooterState}
        onDoubleClick={() => editable("footer")}
        className={`footer-input ${activeInputs.footer ? "active" : ""}`}
        autoComplete="off"
        value={savedState}
        onBlur={() => handleBlur("footer")}/>

          
      {isModalOpen && (
        <div className="modal-backdrop" >
          <div className="modal">
        <h4>Edit Footer</h4>

      <input
        ref={inputRefs.footer}
        id="footer"
        type="text"
        data-block-index='1'
        onChange={SavedFooterState}
        onDoubleClick={() => editable("footer")}
        className={`footer-input ${activeInputs.footer ? "active" : ""}`}
        autoComplete="off"
        value={savedState}
        onBlur={() => handleBlur("footer")}/>

                          <div className="modal-actions">
              <button onClick={applyChanges} className="apply-btn">
                Apply
              </button>
              <button onClick={cancelChanges} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

       <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          width: 300px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
        }

        .footer-input {
          width: 93%;
          padding: 0.5rem;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .footer-input.active {
          border: 1px solid #007bff;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .apply-btn,
        .cancel-btn {
          padding: 0.4rem 0.8rem;
          border: none;
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
        }

        .apply-btn {
          background-color: #007bff;
          color: white;
        }

        .cancel-btn {
          background-color: #ccc;
        }
        #footer-save{
        display: none !important;
        }
      `}</style>

      <FooterPopup landscape={landscape} openfooterModal={openModal}/>
    </>
  );
}
