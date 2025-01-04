"use client";

import { useEffect, useState } from "react";

export function TodayButton() {
  const [isVisible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const elements = document.querySelectorAll('[data-today="true"]');
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });

    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);

  console.log(isVisible);

  if (isVisible) {
    return;
  }

  return (
    <div
      onClick={() => {
        document
          .querySelectorAll('[data-today="true"]')
          .forEach((el) =>
            el.scrollIntoView({ behavior: "smooth", block: "center" })
          );
      }}
      className="absolute text-sm right-8 bottom-8 bg-red-800 hover:bg-red-700  rounded-full font-bold px-4 py-2 cursor-pointer"
    >
      Today
    </div>
  );
}
