import React from "react";
import "./Spinner.css"; // You can define styles in this CSS file

const Spinner = ({ type }) => {
  return (
    <div className="spinner-wrapper">
      {
        type !== "richText" ? <>
          <div className="spinner"></div>
          <div>Editor is loading...</div>

        </> : <>fetching editor state...</>
      }

    </div>
  );
};

export default Spinner;
