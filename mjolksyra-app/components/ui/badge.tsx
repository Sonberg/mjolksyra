import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.08em]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--shell-accent)] text-[var(--shell-accent-ink)]",
        secondary:
          "border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-[var(--shell-border)] text-[var(--shell-ink)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
