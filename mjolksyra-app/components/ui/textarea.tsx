import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)] ring-offset-[var(--shell-surface)] transition-[border-color,box-shadow] duration-[150ms] ease-[cubic-bezier(0.23,1,0.32,1)] placeholder:text-[var(--shell-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
