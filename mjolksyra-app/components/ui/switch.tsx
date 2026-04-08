"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center border border-[var(--shell-border)] transition-[background-color] duration-[150ms] ease-[cubic-bezier(0.23,1,0.32,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--shell-surface)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--shell-accent)] data-[state=checked]:bg-[var(--shell-accent)] data-[state=unchecked]:bg-[var(--shell-surface-strong)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 bg-[var(--shell-surface)] ring-0 transition-transform duration-[150ms] ease-[cubic-bezier(0.23,1,0.32,1)] data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
