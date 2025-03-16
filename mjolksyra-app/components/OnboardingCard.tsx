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
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl p-8 shadow-lg transition-all duration-200",
        "border border-gray-800/50 backdrop-blur-sm",
        {
          "bg-gray-950/50": variant === "default",
          "bg-gray-900/50": variant === "purple",
        },
        "hover:shadow-xl hover:shadow-white/5",
        className
      )}
    >
      <div className="relative z-10">
        {title && (
          <h3
            className={cn("mb-4 text-2xl font-semibold tracking-tight", {
              "bg-gradient-to-r from-stone-100 to-white bg-clip-text text-transparent":
                variant === "default",
              "text-white": variant === "purple",
            })}
          >
            {title}
          </h3>
        )}

        {text && (
          <p className="text-base leading-relaxed text-gray-400">{text}</p>
        )}

        {button && <div className="mt-6">{button}</div>}
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-white/5 to-stone-500/5 blur-2xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-tr from-stone-400/5 to-white/5 blur-2xl opacity-50" />
    </div>
  );
}
