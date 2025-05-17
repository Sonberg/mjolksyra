import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  text?: string;
  button?: ReactNode;
  className?: string;
  variant?: "default" | "purple";
};

export function OnboardingCard({
  text,
  title,
  button,
  className,
  variant = "default",
}: Props) {
  const baseStyles =
    "relative overflow-hidden rounded-xl p-8 transition-all duration-300 ";
  const borderStyles = "border";
  const glassEffect = "backdrop-blur-sm";
  const hoverEffect = cn(
    "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
    "hover:shadow-[0_0_30px_rgba(0,0,0,0.15)]"
  );

  const backgroundStyles = cn({
    "bg-background/40": variant === "default",
    "bg-purple-900/40": variant === "purple",
  });

  const titleStyles = cn("mb-4 text-2xl font-semibold tracking-tight", {
    "bg-gradient-to-r from-foreground/90 to-foreground bg-clip-text text-transparent":
      variant === "default",
    "text-foreground": variant === "purple",
  });

  return (
    <div
      className={cn(
        baseStyles,
        borderStyles,
        glassEffect,
        backgroundStyles,
        hoverEffect,
        className
      )}
    >
      {/* Content */}
      <div className="relative z-10 space-y-4">
        {title && <h3 className={titleStyles}>{title}</h3>}
        {text && (
          <p className="text-base leading-relaxed text-muted-foreground">
            {text}
          </p>
        )}
        {button && (
          <div className="mt-2 flex justify-start">
            <div className="inline-flex">{button}</div>
          </div>
        )}
      </div>

      {/* Background Decorations */}
      <div
        className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 
          rounded-full bg-gradient-to-br from-foreground/5 to-foreground/10 
          blur-2xl opacity-50"
      />
      <div
        className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 
          rounded-full bg-gradient-to-tr from-foreground/10 to-foreground/5 
          blur-2xl opacity-50"
      />
    </div>
  );
}
