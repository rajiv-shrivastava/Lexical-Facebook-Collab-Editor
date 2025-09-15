import React from "react";
import upArrow from "../../images/icons/arrow-up-solid.svg";
import downArrow from "../../images/icons/arrow-down-solid.svg";
import closeWhiteIcon from "../../images/icons/white-close-icon.svg";
import chevronWhiteRight from "../../images/icons/chevron-right.svg";
import chevronWhiteDown from "../../images/icons/white-chevron-down.svg";
import replaceIcon from "../../images/icons/replace-icon.svg";
import replaceAllIcon from "../../images/icons/replace-all-icon.svg";
import "./searchAndReplace.css";

interface SearchAndReplaceModalProps {
  handleClose: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
  replaceText: string;
  setReplaceText: (text: string) => void;
  handleReplaceAll: () => void;
  handleReplace: () => void;
  handleNextMatch: () => void;
  handlePreviousMatch: () => void;
  matchesCount: number;
  currentMatchIndex: number;
  searchInputRef: React.RefObject<HTMLInputElement>;
  replaceInputRef: React.RefObject<HTMLInputElement>;
  setReplaceBoxOpen: (open: boolean) => void;
  ReplaceBoxOpen: boolean;
}

const SearchAndReplaceModal = ({
  handleClose,
  searchText,
  setSearchText,
  replaceText,
  setReplaceText,
  handleReplaceAll,
  handleReplace,
  handleNextMatch,
  handlePreviousMatch,
  matchesCount,
  currentMatchIndex,
  searchInputRef,
  replaceInputRef,
  ReplaceBoxOpen,
  setReplaceBoxOpen,
}: SearchAndReplaceModalProps) => {
  return (
    <div className="search-and-replace-modal-overlay modal-overlay">
      <div className="search-and-replace-modal-content modal-content">
        <div className="search-and-replace-search-section search-section">
          <div className="search-and-replace-search-header search-header">
            <img
              className={`search-and-replace-${
                ReplaceBoxOpen ? "chevronDownIcon" : "chevronRightIcon"
              }`}
              width={20}
              height={20}
              src={ReplaceBoxOpen ? chevronWhiteDown : chevronWhiteRight}
              alt=""
              onClick={() => setReplaceBoxOpen(!ReplaceBoxOpen)}
            />

            <span>Find</span>
            <div className="search-and-replace-search-controls search-controls">
              <input
                autoFocus={true}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="search-and-replace-search-input search-input"
                placeholder="Search"
                ref={searchInputRef}
              />
              {matchesCount === 0 ? (
                <span className="search-and-replace-no-results">
                  No results
                </span>
              ) : (
                <span className="search-and-replace-results-count">
                  {currentMatchIndex + 1} of {matchesCount}
                </span>
              )}
              <button
                className="search-and-replace-control-btn control-btn"
                onClick={handlePreviousMatch}
              >
                <img
                  className="search-and-replace-upArrowIcon upArrowIcon"
                  src={upArrow}
                  alt=""
                />
              </button>
              <button
                className="search-and-replace-control-btn control-btn"
                onClick={handleNextMatch}
              >
                <img
                  className="search-and-replace-downArrowIcon downArrowIcon"
                  src={downArrow}
                  alt=""
                />
              </button>
              <button
                className="search-and-replace-control-btn control-btn close"
                onClick={handleClose}
              >
                <img
                  className="search-and-replace-downArrowIcon downArrowIcon downArrowIcon"
                  src={closeWhiteIcon}
                  alt=""
                />
              </button>
            </div>
          </div>
        </div>
        {ReplaceBoxOpen && (
          <div className="search-and-replace-replace-section replace-section">
            <div className="search-and-replace-replace-header replace-header">
              <span>Replace</span>
              <div className="search-and-replace-replace-controls replace-controls">
                <input
                  type="text"
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="search-and-replace-replace-input replace-input"
                  placeholder="Replace"
                  ref={replaceInputRef}
                />
                <button
                  className="search-and-replace-control-btn control-btn"
                  onClick={handleReplace}
                  title="Replace"
                >
                  <img width={25} height={22} src={replaceIcon} alt="" />
                </button>
                <button
                  className="search-and-replace-control-btn control-btn"
                  onClick={handleReplaceAll}
                  title="Replace all"
                >
                  <img width={25} height={22} src={replaceAllIcon} alt="" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndReplaceModal;
