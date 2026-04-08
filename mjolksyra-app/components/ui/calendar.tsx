"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-[var(--shell-muted)] w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-outside)]:bg-[var(--shell-surface-strong)] [&:has([aria-selected])]:bg-[var(--shell-surface-strong)] focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        range_end: "day-range-end",
        selected:
          "bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent)] hover:text-[var(--shell-accent-ink)] focus:bg-[var(--shell-accent)] focus:text-[var(--shell-accent-ink)]",
        today: "bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        outside:
          "day-outside text-[var(--shell-muted)] aria-selected:bg-[var(--shell-surface-strong)] aria-selected:text-[var(--shell-muted)]",
        disabled: "text-[var(--shell-muted)] opacity-50",
        range_middle:
          "aria-selected:bg-[var(--shell-surface-strong)] aria-selected:text-[var(--shell-ink)]",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" {...props} />
          }
          return <ChevronRight className="h-4 w-4" {...props} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
