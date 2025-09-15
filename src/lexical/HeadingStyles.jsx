import { Helmet } from "react-helmet";

export const HeadingStyles = ({ styleConfig }) => {
    const { heading } = styleConfig;
  const CaptionStyle = styleConfig?.heading?.filter((item) => item.title === 'Captions')
  const CaptionStyle_ = CaptionStyle && CaptionStyle[0];
  let head1 = heading.find((item) => item.title === "Heading1");
  let head2 = heading.find((item) => item.title === "Heading2");
  let head3 = heading.find((item) => item.title === "Heading3");
  let head4 = heading.find((item) => item.title === "Heading4");
  let head5 = heading.find((item) => item.title === "Heading5");

  return (
    <Helmet>
      <style type="text/css">{`
      .PlaygroundEditorTheme__h1 {
        font-size: ${head1?.fontSize || 14.5}px !important;
        font-weight: ${head1?.bold === "Yes" ? 700 : 400};
        font-style: ${head1?.italic === "Yes" ? "italic" : "normal"};
        color: ${head1?.fontColor || "black"};
        font-family: "Times New Roman", serif;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }

      .PlaygroundEditorTheme__h2 {
        font-size: ${head2?.fontSize || 14.5}px !important;
        font-weight: ${head2?.bold === "Yes" ? 700 : 400};
        font-style: ${head2?.italic === "Yes" ? "italic" : "normal"};
        color: ${head2?.fontColor || "black"};
        font-family: "Times New Roman", serif;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }

      .PlaygroundEditorTheme__h3 {
        font-size: ${head3?.fontSize || 14.5}px !important;
        font-weight: ${head3?.bold === "Yes" ? 700 : 400};
        font-style: ${head3?.italic === "Yes" ? "italic" : "normal"};
        color: ${head3?.fontColor || "black"};
        font-family: "Times New Roman", serif;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }

      .PlaygroundEditorTheme__h4 {
        font-size: ${head4?.fontSize || 14.5}px !important;
        font-weight: ${head4?.bold === "Yes" ? 700 : 400};
        font-style: ${head4?.italic === "Yes" ? "italic" : "normal"};
        color: ${head4?.fontColor || "black"};
        font-family: "Times New Roman", serif;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }

      .PlaygroundEditorTheme__h5 {
        font-size: ${head5?.fontSize || 14.5}px !important;
        font-weight: ${head5?.bold === "Yes" ? 700 : 400};
        font-style: ${head5?.italic === "Yes" ? "italic" : "normal"};
        color: ${head5?.fontColor || "black"};
        font-family: "Times New Roman", serif;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
        margin-left: 0 !important;
      }

      .PlaygroundEditorTheme__h1_nested {
        font-size: 14.5px;
        font-weight: 700;
        font-style: normal;
        color: black;
        font-family: "Times New Roman", serif;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }

      .PlaygroundEditorTheme__h2_nested {
        font-size: 14.5px;
        font-weight: 700;
        font-style: italic;
        color: black;
        font-family: "Times New Roman", serif;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }

      .PlaygroundEditorTheme__h3_nested,
      .PlaygroundEditorTheme__h4_nested,
      .PlaygroundEditorTheme__h5_nested {
        font-size: 14.5px;
        font-weight: 700;
        font-style: normal;
        color: black;
        font-family: "Times New Roman", serif;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }

            .PlaygroundEditorTheme__h6_nested {
        
      margin: 0 !important;
      margin-top: 0 !important;
      // this is important for layout
      display: none !important;
      }

      .PlaygroundEditorTheme__table {
        max-width: 100%;
        padding: 200px;
      }

      .PlaygroundEditorTheme__tableCellHeader_custom {
        background-color: #fff !important;
        font-weight: normal;
      }

      .PlaygroundEditorTheme__paragraph {
        line-height: 25px !important;
        font-size: 14.5px !important;
      }

      .PlaygroundEditorTheme__h6 {
        font-size: 0.2px;
        opacity: 0;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
        display:none !important;
      }

      .PlaygroundEditorTheme__h5.PlaygroundEditorTheme__ltr.padding-elem:first-of-type {
        width: 76%;
        margin-left: -28px;
        margin-top: -80px;
        color: rgb(109, 84, 84);
        font-size: 20px;
        padding: 0px 0px 40px;
        min-height: 0px;
      }

      .PlaygroundEditorTheme__h5.PlaygroundEditorTheme__ltr.padding-elem:last-of-type {
        margin-left: -28px;
        margin-top: 80px;
        color: rgb(109, 84, 84);
        font-size: 20px;
        padding: 0px 0px 40px;
        min-height: 0px;
        width: 100%;
        padding-top: 25px;
      }

      .PlaygroundEditorTheme__ltr {
        line-height: 25px;
      }
      span[id^="table-"] {
        color: ${CaptionStyle_?.fontColor || "black"} !important;
        font-weight: ${CaptionStyle_?.bold === "Yes" ? "bold" : "normal"} !important;
        font-style: ${CaptionStyle_?.italic === "Yes" ? "italic" : "normal"} !important;
        font-size: ${CaptionStyle_?.fontSize ? `${CaptionStyle_?.fontSize}px` : "14.5px"} !important;
        font-family: ${CaptionStyle_?.fontFamily || "Arial"} !important;
        line-height: ${CaptionStyle_?.lineSpacing || "1"} !important;
        text-align: ${CaptionStyle_?.alignment || "left"} !important;
        padding-left: ${CaptionStyle_?.leadingSpace || "0"}ch !important;
        padding-right: ${CaptionStyle_?.trailingSpace || "0"}ch !important;
        
      }
      span[id*="-Image-"] {
        color: ${CaptionStyle_?.fontColor || "black"} !important;
        font-weight: ${CaptionStyle_?.bold === "Yes" ? "bold" : "normal"} !important;
        font-style: ${CaptionStyle_?.italic === "Yes" ? "italic" : "normal"} !important;
        font-size: ${CaptionStyle_?.fontSize ? `${CaptionStyle_?.fontSize}px` : "14.5px"} !important;
        font-family: ${CaptionStyle_?.fontFamily || "Arial"} !important;

        line-height: ${CaptionStyle_?.lineSpacing || "1"} !important;
        text-align: ${CaptionStyle_?.alignment || "left"} !important;

        padding-left: ${CaptionStyle_?.leadingSpace || "0"}ch !important;
        padding-right: ${CaptionStyle_?.trailingSpace || "0"}ch !important;

      }
    `}</style>
    </Helmet>
  );
};
