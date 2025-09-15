import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import { useEffect, useRef, useState } from "react";
import DynamicHeadersPopup from "./HeaderBtnPopup";

export default function HeaderPlugin({editId,savedStateHeader,landscape}:any) {
  const [savedState, setSavedState] = useState("Type a Header");
  const [editor] = useLexicalComposerContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ogValue,setOgValue] = useState('default')
  const [activeInputs, setActiveInputs] = useState<{ [key: string]: boolean }>({
    header: false,
  });

  // button header code
  const [showPopup, setShowPopup] = useState(false);
   const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
   const togglePopup = () => setShowPopup(!showPopup);
    const handleClick = (e:any) => {
    setPopupPosition({ x: e.clientX, y: e.clientY });
    setShowPopup(true)
  };


  const inputRefs = {
    header: useRef<HTMLInputElement>(null),
  };

  const SavedHeaderState = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSavedState(newValue);

  };

  const editable = (key: keyof typeof inputRefs) => {
    setActiveInputs(prev => ({ ...prev, [key]: true }));
    setTimeout(() => inputRefs[key].current?.focus(), 0);
    
        editor.update(()=>{
      const root = $getRoot();
      const text = $createTextNode(' ')
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
        child.getTextContent() === ' '
      ) {
        child.remove();
      }
    });
  });
};


  useEffect(() => {
const html = savedStateHeader;

const parser = new DOMParser();
const doc = parser.parseFromString(html, 'text/html');
const h6Element :any= doc.querySelector('h6[data-header]');
if(h6Element){
const dataHeader = h6Element.getAttribute('data-header');

setSavedState(dataHeader)
}




    const blockElem: any = document.querySelectorAll(".block-end");
    blockElem.forEach((block: any) => {
      block.setAttribute(
        "data-header",
        `${savedState}`
      );
    });

  }, []);

      const applyChanges = () => {
    setIsModalOpen(false);

        const allchild = document.querySelector(`.content-editable-grid-${editId.editId}`);

    if(allchild){
      Array.from(allchild.children).forEach(element => {
        element.setAttribute(
        "data-header",
        `${savedState}`
      );
      
      });
    }
        if (savedState.trim() === "") {
      setSavedState("Type a Header");
    }
  };

      const cancelChanges = () => {
        setIsModalOpen(false)
        setSavedState(ogValue)
  };

      const openModal = () => {

        const paddingElem = document.querySelector(`.padding-elem`);
        if(paddingElem){
          const value :any =  paddingElem.getAttribute("data-header");
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

// const headerElems = document.querySelectorAll('.header-js');

// headerElems.forEach(headerElem => {
//   headerElem.addEventListener('mouseenter', (e) => {
//     handleClick(e)
//     console.log('yes enetred')
//   });

//   // If you want to re-enable mouseleave behavior, uncomment below:
//   // headerElem.addEventListener('mouseleave', () => {
//   //   togglePopup();
//   // });
// });



  return (
    <>

      {/* {showPopup && (
        <div
          style={{
            position: "absolute",
            left: popupPosition.x,
            top: popupPosition.y,
            marginTop: 10,
            padding: 10,
            border: "1px solid #ccc",
            borderRadius: 4,
            backgroundColor: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            width: 150,
            zIndex: 1000,
          }}
        >
          <button onClick={openModal}>Edit Header</button>
          <button onClick={togglePopup}>close</button>
        </div>
      )} */}

            <input
        ref={inputRefs.header}
        id="header-save"
        type="text"
        data-block-index='1'
        data-landscape='false'
        onChange={SavedHeaderState}
        onDoubleClick={() => editable("header")}
        className={`header-input ${activeInputs.header ? "active" : ""}`}
        autoComplete="off"
        value={savedState}
        readOnly={!activeInputs.header}
        onBlur={() => handleBlur("header")}
      />

      {isModalOpen && (
        <div className="modal-backdrop" >
          <div className="modal">
        <h4>Edit Header</h4>
      <input
        ref={inputRefs.header}
        id="header"
        type="text"
        data-block-index='1'
        data-landscape='false'
        onChange={SavedHeaderState}
        onDoubleClick={() => editable("header")}
        className={`header-input ${activeInputs.header ? "active" : ""}`}
        autoComplete="off"
        value={savedState}
        onBlur={() => handleBlur("header")}
      />

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

        .header-input {
          width: 93%;
          padding: 0.5rem;
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .header-input.active {
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
        #header-save{
        display: none !important;
        }
      `}</style>
      <DynamicHeadersPopup landscape={landscape} openHeaderModal={openModal} />
    </>
  );
}