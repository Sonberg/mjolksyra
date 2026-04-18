import { ReactNode } from "react";
import { LoaderCircle, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
  canSend?: boolean;
  rows?: number;
  children?: ReactNode;
};

export function ChatMessageComposer({
  value,
  onChange,
  onSend,
  onKeyDown,
  placeholder = "Write a message...",
  disabled,
  isSending,
  canSend,
  rows = 1,
  children,
}: Props) {
  return (
    <>
      <Separator />
      <div className="bg-[var(--shell-surface-strong)] p-2 shadow-[0_-6px_24px_rgba(0,0,0,0.04)]">
        <div className="flex items-end gap-2">
          <div className="min-h-11 min-w-0 flex-1 px-3">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              rows={rows}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-10 resize-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0"
            />
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!canSend || isSending}
            onClick={onSend}
            className="shrink-0 self-end"
          >
            {isSending ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <SendIcon data-icon="inline-start" />
            )}
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </>
  );
}
