import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  mjolksyraButtonVariants,
  type MjolksyraButtonVariantProps,
} from "mjolksyra-ui-design-system"

import { cn } from "@/lib/utils"

const buttonVariants = mjolksyraButtonVariants;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    MjolksyraButtonVariantProps {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
