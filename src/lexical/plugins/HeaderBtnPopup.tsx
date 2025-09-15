import React, { useState, useEffect, useRef } from "react";
export default function DynamicHeadersPopup({openHeaderModal,landscape}:any) {
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const popupRef = useRef<HTMLDivElement | null>(null);

const handleMouseEnter = (e: MouseEvent) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains("header-js")) {
    const rect = target.getBoundingClientRect();

    // Click coordinates relative to the element
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const isInTopLeft = clickX >= 0 && clickX <= (landscape ? 1216.64 : 816) && clickY >= 0 && clickY <= 50;

    if (isInTopLeft) {
      const x = rect.left - 65;
      const y = rect.top + 10;

      setPopupPosition({ x, y });
      openHeaderModal();
    }
  }
};


  useEffect(() => {
    document.addEventListener("dblclick", handleMouseEnter, true);

    return () => {
      document.removeEventListener("mouseenter", handleMouseEnter, true);
    };
  }, []);

  useEffect(() => {
    if ( !popupRef.current) return;

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
  }, [ popupPosition]);

  return (null)
}
