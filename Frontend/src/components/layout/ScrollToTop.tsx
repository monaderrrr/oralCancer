import React, { useEffect, useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  const handleScroll = useCallback(() => {
    const scrolled = window.scrollY > 400;
    setVisible(scrolled);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed 
        bottom-20 
        right-6 
        md:right-8
        w-12 
        h-12 
        rounded-full 
        backdrop-blur-md
        bg-teal-600/90
        hover:bg-teal-700
        text-white
        shadow-xl
        hover:scale-110
        active:scale-95
        transition-all 
        duration-300 
        flex 
        items-center 
        justify-center
        z-40
        ${
          visible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10 pointer-events-none"
        }
      `}
    >
      <ArrowUp size={20} />
    </button>
  );
}