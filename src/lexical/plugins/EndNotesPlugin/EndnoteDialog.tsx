import { useState } from "react";

interface EndNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (text: string) => void;
}

export function EndNoteDialog({ open, onClose, onConfirm }: EndNoteDialogProps) {
  const [endNoteText, setEndNoteText] = useState("");

  const handleConfirm = () => {
    if (endNoteText.trim()) {
      onConfirm(endNoteText.trim());
      setEndNoteText("");
      onClose();
    }
  };

  const handleCancel = () => {
    setEndNoteText("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  if (!open) return null; // Return null if the modal isn't open

  return (
    <div className="endnote-modal-overlay" onClick={handleCancel}>
      <div className="endnote-modal" onClick={(e) => e.stopPropagation()}>
        <div className="endnote-modal-header">
          <h2>Add Endnote</h2>
          <p>Enter the text for your endnote. It will be automatically numbered and placed at the bottom of the document.</p>
        </div>
        <div className="endnote-modal-body">
          <input
            id="endnote-text"
            type="text"
            value={endNoteText}
            onChange={(e) => setEndNoteText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter endnote text..."
            autoFocus
          />
        </div>
        <div className="endnote-modal-footer">
          <button className="endnote-cancel-btn" onClick={handleCancel}>Cancel</button>
          <button className="endnote-ok-btn" onClick={handleConfirm} disabled={!endNoteText.trim()}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
