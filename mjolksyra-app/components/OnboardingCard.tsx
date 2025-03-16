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
        "border border-gray-100/20 backdrop-blur-sm",
        {
          "bg-white/90": variant === "default",
          "bg-[#c6b9ff]/90": variant === "purple",
        },
        "hover:shadow-xl",
        className
      )}
    >
      <div className="relative z-10">
        {title && (
          <h3
            className={cn("mb-4 text-2xl font-semibold tracking-tight", {
              "bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent":
                variant === "default",
              "text-gray-900": variant === "purple",
            })}
          >
            {title}
          </h3>
        )}

        {text && (
          <p className="text-base leading-relaxed text-gray-600">{text}</p>
        )}

        {button && <div className="mt-6">{button}</div>}
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 blur-2xl opacity-50" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-tr from-blue-100 to-blue-200 blur-2xl opacity-50" />
    </div>
  );
}
