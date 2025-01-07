"use client";

import { CalendarHeartIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
  return useMemo(() => {
    if (isVisible) {
      return;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={() => {
              document
                .querySelectorAll('[data-today="true"]')
                .forEach((el) =>
                  el.scrollIntoView({ behavior: "smooth", block: "center" })
                );
            }}
            className="absolute text-white text-sm right-8 bottom-8 bg-red-800 hover:bg-red-700  rounded-full font-bold h-10 w-10 grid place-items-center cursor-pointer"
          >
            <CalendarHeartIcon className="h-4" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Back to current week</p>
        </TooltipContent>
      </Tooltip>
    );
  }, [isVisible]);
}
