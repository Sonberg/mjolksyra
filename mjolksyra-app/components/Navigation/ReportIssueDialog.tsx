"use client";

import { useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { MessageSquareWarningIcon } from "lucide-react";
import { createFeedbackReport } from "@/services/feedbackReports/createFeedbackReport";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type ReportIssueDialogProps = {
  trigger?: ReactNode;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function ReportIssueDialog({
  trigger,
  hideTrigger = false,
  open,
  onOpenChange,
}: ReportIssueDialogProps) {
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const isControlled = open !== undefined;
  const resolvedOpen = isControlled ? open : internalOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const create = useMutation({
    mutationFn: async () => {
      const trimmed = message.trim();
      if (!trimmed) {
        throw new Error("Message is required");
      }
      const pageUrl = typeof window === "undefined" ? null : window.location.href;
      await createFeedbackReport({ message: trimmed, pageUrl });
    },
    onSuccess: () => {
      setSent(true);
      setMessage("");
    },
  });

  return (
    <Dialog
      open={resolvedOpen}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSent(false);
          create.reset();
        }
      }}
    >
      {!hideTrigger ? (
        <DialogTrigger asChild>
          {trigger ?? (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface-strong)]"
              aria-label="Report issue"
            >
              <MessageSquareWarningIcon className="h-4 w-4" />
            </button>
          )}
        </DialogTrigger>
      ) : null}
      <DialogContent className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] text-[var(--shell-ink)] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report issue</DialogTitle>
          <DialogDescription className="text-[var(--shell-muted)]">
            Share a bug or confusing behavior. We automatically attach the page URL.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-ink)]">
            Thanks. Your report was submitted.
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="report-issue-message"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--shell-muted)]"
          >
            Message
          </label>
          <textarea
            id="report-issue-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="What happened? What did you expect to happen?"
            className="w-full resize-y rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2 text-sm text-[var(--shell-ink)] outline-none placeholder:text-[var(--shell-muted)] focus:border-[var(--shell-accent)]"
          />
          {create.isError ? (
            <p className="text-sm text-[var(--shell-accent)]">
              Could not submit report. Please try again.
            </p>
          ) : null}
          {pathname ? (
            <p className="truncate text-xs text-[var(--shell-muted)]">
              Page: {pathname}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] text-[var(--shell-ink)] hover:bg-[var(--shell-surface)]"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={() => create.mutate()}
            disabled={create.isPending || message.trim().length === 0}
            className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-accent)] text-[var(--shell-surface)] hover:bg-[#ce2f10]"
          >
            {create.isPending ? "Sending..." : "Send report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
