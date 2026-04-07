import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full border border-[var(--shell-border)]",
          "bg-[var(--shell-surface)] px-3 py-2 text-sm text-[var(--shell-ink)] ring-offset-[var(--shell-surface)]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-[var(--shell-muted)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
