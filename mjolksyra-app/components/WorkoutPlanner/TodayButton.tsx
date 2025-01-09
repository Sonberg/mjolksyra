"use client";

import { CalendarHeartIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  onClick: () => void;
};

export function TodayButton({ onClick }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          onClick={onClick}
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
}
