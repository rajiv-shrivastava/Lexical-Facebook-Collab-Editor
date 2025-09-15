import React, { useState, useEffect, useRef } from "react";

export default function FooterPopup({openfooterModal,landscape}:any) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement | null>(null);

const handleMouseEnter = (e: MouseEvent) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains("block-end")) {
    const rect = target.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const blockWidth = landscape ? 1216.64 : 816;
    const bottomAreaHeight = 96;

    const isInBottomArea =
      clickX >= 0 &&
      clickX <= blockWidth &&
      clickY >= rect.height - bottomAreaHeight &&
      clickY <= rect.height;

    if (isInBottomArea) {
      const x = rect.left - 65;
      const y = rect.bottom + 10;

      setPopupPosition({ x, y });
      openfooterModal();
    }
  }
};



  useEffect(() => {
    document.addEventListener("dblclick", handleMouseEnter, true);

    return () => {
      document.removeEventListener("dblclick", handleMouseEnter, true);
    };
  }, []);

  useEffect(() => {
    if (!popupRef.current) return;

    const popupRect = popupRef.current.getBoundingClientRect();
    let newX = popupPosition.x;
    let newY = popupPosition.y;

    if (popupRect.left < 0) {
      newX = 10;
    }

    if (popupRect.bottom > window.innerHeight) {
      newY = Math.max(10, popupPosition.y - (popupRect.bottom - window.innerHeight + 10));
    }

    if (newX !== popupPosition.x || newY !== popupPosition.y) {
      setPopupPosition({ x: newX, y: newY });
    }
  }, [popupPosition]);

  return ( null );
}
