"use client";

import { useEffect, useState, useRef } from "react";
import { useLayoutStore } from "@/store/useLayoutStore";

export function CustomCursor() {
  const { pointerStyle } = useLayoutStore();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pointerStyle === "default") {
      document.body.style.cursor = "auto";
      // Restore cursor to elements
      const links = document.querySelectorAll("a, button, [role='button'], input, select, textarea");
      links.forEach((link) => {
        (link as HTMLElement).style.cursor = "pointer";
      });
      return;
    }
    
    // Hide standard cursor
    document.body.style.cursor = "none";

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    const addHoverListeners = () => {
      const links = document.querySelectorAll("a, button, [role='button'], input, select, textarea");
      links.forEach((link) => {
        link.addEventListener("mouseenter", () => setLinkHovered(true));
        link.addEventListener("mouseleave", () => setLinkHovered(false));
        (link as HTMLElement).style.cursor = "none";
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    addHoverListeners();

    // Check periodically for dynamically loaded elements
    const interval = setInterval(addHoverListeners, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      clearInterval(interval);
      document.body.style.cursor = "auto";
      const links = document.querySelectorAll("a, button, [role='button'], input, select, textarea");
      links.forEach((link) => {
        (link as HTMLElement).style.cursor = "pointer";
      });
    };
  }, [pointerStyle, isVisible]);

  if (pointerStyle === "default" || !isVisible) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scale(${clicked ? 0.8 : linkHovered ? 1.4 : 1})`,
      }}
    >
      {pointerStyle === "glow" && (
        <div className="relative flex items-center justify-center">
          {/* Glowing trailing aura */}
          <div className="absolute h-9 w-9 rounded-full bg-indigo-500/25 blur-md animate-pulse" />
          {/* Outer Ring */}
          <div className="h-5 w-5 rounded-full border border-indigo-500/80 transition-all duration-300" />
          {/* Inner Core */}
          <div className="absolute h-2 w-2 rounded-full bg-indigo-400 shadow-md" />
        </div>
      )}
      
      {pointerStyle === "bubble" && (
        <div className="h-8 w-8 rounded-full border border-white/40 bg-white/10 dark:bg-white/5 dark:border-white/20 backdrop-blur-[2px] shadow-lg transition-all duration-200" />
      )}

      {pointerStyle === "crosshair" && (
        <div className="relative h-6 w-6 flex items-center justify-center">
          <div className="absolute h-0.5 w-4 bg-emerald-400 shadow-sm" />
          <div className="absolute h-4 w-0.5 bg-emerald-400 shadow-sm" />
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 border border-black/40" />
        </div>
      )}
    </div>
  );
}
