import React, { useEffect, useState } from 'react';
import { Sample } from "./sample";
import { Editor } from './Editor';
import { EditorTask } from './EditorTask';

function App() {
  const [initialEditorState, setInitialEditorState] = useState<any>(
    {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: "",
                    mode: "normal",
                    style: "ASA",
                    text: "",
                    type: "text",
                    version: 1,
                  },
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "paragraph",
                version: 1,
                textFormat: 0,
              },
            ],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1,
          },
          comments: [],
  });
  const [CollabApiKey, setCollabApiKey] = useState("");
  const [docId, setDocId] = useState('id_500');
  const [userObjData, setUserObj] = useState(
    {
      userName: 'sample',
      userId: 1,
      userEmail: 'sample@gmail.com',
    }
  );
  const mentionItems = [
    {
      name: "EXT Akash Shrivastava",
      email: "ext-akash.shrivastava@spinverse.com",
      partnerName: null,
      userbase: "Internal",
    },
    {
      name: "EXT Raghvendra Roy",
      email: "ext-raghvendra.roy@spinverse.com",
      partnerName: null,
      userbase: "Internal",
    },
    {
      name: "Akash",
      email: "akash.shrivastava@tarento.com",
      partnerName: "accenture",
      userbase: "External",
    },
  ];
  const commentsData = localStorage.getItem("commentsData");
  const parsedComments =
    typeof commentsData === "string"
      ? JSON.parse(commentsData)
      : commentsData || [];
  

  const updateSharepointList = (data: any,editId: any) => {
    localStorage.setItem('editorData',data)
    
  }

  const updateSharepointList2 = (data: any,editId: any) => {
    localStorage.setItem('editorData2',data)

  }

  const styleConfig = {
    pageMarginTop: "10px",
    pageMarginLeft: "10px",
    pageMarginRight: "10px",
    pageMarginBottom: "10px",
    tableStyles: {
      backgroundColor: "#fff"
    },
    heading: [
    {
        title: "Heading1",
        fontFamily: "Times New Roman",
        fontSize: 14.5,
        fontColor: "black",
        leadingSpace: 0.5,
        trailingSpace: 0.5,
        bold: "Yes",
        italic: "No",
        lineSpacing: 2.1,
        alignment: "Left",
      },
      {
        title: "Heading2",
        fontFamily: "Times New Roman",
        fontSize: 14.5,
        fontColor: "black",
        leadingSpace: 0.3,
        trailingSpace: 0.4,
        bold: "Yes",
        italic: "Yes",
        lineSpacing: 1.1,
        alignment: "Left",
      },
      {
        title: "Heading3",
        fontFamily: "Times New Roman",
        fontSize: 14.5,
        fontColor: "black",
        leadingSpace: 0.2,
        trailingSpace: 0.3,
        bold: "No",
        italic: "Yes",
        lineSpacing: 1.1,
        alignment: "Left",
      },
      {
        title: "Heading4",
        fontFamily: "Times New Roman",
        fontSize: 14.5,
        fontColor: "#000",
        leadingSpace: 0.1,
        trailingSpace: 0.2,
        bold: "No",
        italic: "Yes",
        lineSpacing: 1.1,
        alignment: "Left",
      },
      {
        title: "Heading5",
        fontFamily: "Times New Roman",
        fontSize: 14.5,
        fontColor: "#000",
        leadingSpace: 0.1,
        trailingSpace: 0.2,
        bold: "No",
        italic: "Yes",
        lineSpacing: 1.1,
        alignment: "left",
      },
       {
        title: "Cross-refrence Text",
        fontFamily: "Times New Roman",
        fontSize: 10,
        fontColor: "black",
        leadingSpace: 0.5,
        trailingSpace: 0.5,
        bold: "Yes",
        italic: "No",
        lineSpacing: 2.1,
        alignment: "Left",
        color : "green"
    },
    {
        title: "Captions",
        fontFamily: "Times New Roman",
        fontSize: '14',
        fontColor: "black",
        leadingSpace: 0.5,
        trailingSpace: 0.5,
        bold: "No",
        italic: "Yes",
        lineSpacing: 2.1,
        alignment: "left",
        color : "green"
    },
    ],

  };

const tempState:any = Sample.data
const tempState2:any = localStorage.getItem("editorData") || "<p></p>";

  const handleSaveComments = (state: any) => {
    localStorage.setItem("commentsData", JSON.stringify(state));
  };
  const wpAndTaskId = {
    workplanId: 7,
    taskId: 10,
  };
  const [showPagination, setshowPagination] = useState(false)
  const [showPdf, setshowPdf] = useState(true)
  const [landscape, setLandscape] = useState(true); //for handling orientation
  const [enableTable,setEnableTable] = useState(true)
  const [showEditorCursor,setshowEditorCursor] = useState(true)
  const [showComments, setShowComments] = useState(false);

  const exportToPDF = () => {
    console.log('exporting...')
  }

setTimeout(()=>{setshowPagination(false)},10000)

  const referencing_array  = [
    {
        "element": null,
        "id": 8,
        "label": "test3"
    },
    {
        "element": null,
        "id": 9,
        "label": "Task_1"
    },
    {
        "element": null,
        "id": 12,
        "label": "Mile_1"
    },
    {
        "element": null,
        "id": 16,
        "label": "Deliver_1111"
    },
]
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-1 container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-4">
                <Editor
              editId={`wp-13--889999s9dfsfsdf8222ddd222222`}
              //@ts-ignore
              key={docId}
              defaultState={initialEditorState}
              initialEditorState={tempState2}
              styleConfig={styleConfig}
              savedComments={parsedComments}
              docId={12345}
              userObj={userObjData}
              CollabApiKey={""}
              mentionItems={mentionItems}
              updateSharepointList={updateSharepointList}
              updateSharepointList2={updateSharepointList2}
              type="objecive"
              handleSaveComments={handleSaveComments}
              pagination={false}
              customHeight={null}
              customWidth={null}
              isCollab={true}
              showTabContent={true}
              toolbarShow={true}
              isEditable={true}
              wpAndTaskId={wpAndTaskId}
              enableCaptions={true}
              showPagination={showPagination}
              setshowPagination={setshowPagination}
              editorTitle="R-test-24"
              setshowPdf={setshowPdf}
              showPdf={showPdf}
              showCommentPlugin={true}
              exportToPDF={exportToPDF}
              editorForTemplate={false}
              enableSpellCheckerFlag={true}
              showHeaderFooter={true}
              isPdfExporting={false}
              landscape={landscape}
              setLandscape={setLandscape}
              ispagebreakOn={true}
              showFootNoteOption={true}
              referencing_array = {referencing_array}
              enableTable={enableTable}
              showEditorCursor={showEditorCursor}
              setShowComments={setShowComments}
              showComments={showComments}
              commentId={"btvdw"}
            />  
  
                {/* <EditorTask
              editId={`wp-2--`}
              //@ts-ignore
              key={docId}
              defaultState={initialEditorState}
              initialEditorState={tempState2}
              styleConfig={styleConfig}
              savedComments={parsedComments}
              docId={12345}
              userObj={userObjData}
              CollabApiKey={"28db4aa1-fd1d-4f75-9f78-f60a9c5b9b78"}
              mentionItems={mentionItems}
              updateSharepointList={updateSharepointList}
              updateSharepointList2={updateSharepointList2}
              type="objecive"
              handleSaveComments={() => {return console.log("asdasdsa")}}
              pagination={false}
              customHeight={null}
              customWidth={null}
              isCollab={true}
              showTabContent={false}
              toolbarShow={true}
              isEditable={true}
              wpAndTaskId={wpAndTaskId}
              enableCaptions={true}
              showPagination={false}
              setshowPagination={setshowPagination}
              editorTitle="R-test-24"
              setshowPdf={setshowPdf}
              showPdf={showPdf}
              showCommentPlugin={true}
            />      */}
        </div>
      </div>
    </div>
  );
}

export default App;

