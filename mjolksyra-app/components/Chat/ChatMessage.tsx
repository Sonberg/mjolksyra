import { ReactNode } from "react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

type Props = {
  align: "start" | "end";
  label: string;
  children: ReactNode;
  timestamp?: Date;
  isEdited?: boolean;
  editForm?: ReactNode;
  footer?: ReactNode;
};

export function ChatMessage({
  align,
  label,
  children,
  timestamp,
  isEdited,
  editForm,
  footer,
}: Props) {
  const isEnd = align === "end";

  return (
    <article className={cn("flex", isEnd ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "flex max-w-[92%] flex-col",
          isEnd ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]",
            isEnd && "text-right",
          )}
        >
          {label}
        </div>
        {editForm ?? (
          <div
            className={cn(
              "inline-flex max-w-full text-sm leading-6 text-[var(--shell-ink)]",
              isEnd
                ? "bg-[var(--shell-bg)]"
                : "bg-[var(--shell-surface-strong)] px-4 py-2",
            )}
          >
            {children}
          </div>
        )}
        {timestamp && (
          <p
            className={cn(
              "mt-2 text-[11px] text-[var(--shell-muted)]",
              isEnd && "text-right",
            )}
          >
            {dayjs(timestamp).format("HH:mm")}
            {isEdited ? " · edited" : ""}
          </p>
        )}
        {footer && <div className="mt-1">{footer}</div>}
      </div>
    </article>
  );
}
