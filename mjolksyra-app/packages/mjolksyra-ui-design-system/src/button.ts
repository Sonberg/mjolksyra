import { cva, type VariantProps } from "class-variance-authority";

export const mjolksyraButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-xs font-medium transition-[background-color,transform,opacity] duration-[150ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--shell-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--shell-surface)] disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--shell-accent)] text-[var(--shell-accent-ink)] hover:bg-[var(--shell-accent-hover)]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]",
        secondary:
          "bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:bg-[var(--shell-border)]",
        ghost:
          "bg-transparent text-[var(--shell-ink)] hover:bg-[var(--shell-surface-strong)]",
        link: "text-[var(--shell-ink)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-2.5",
        sm: "h-7 px-2 [&_svg]:size-3.5",
        lg: "h-9 px-3",
        icon: "size-8",
        "icon-sm": "size-7 [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type MjolksyraButtonVariantProps = VariantProps<
  typeof mjolksyraButtonVariants
>;
