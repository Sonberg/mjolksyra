"use client";

import { useState } from "react";
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

export function ReportIssueDialog() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

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
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSent(false);
          create.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/80 text-zinc-200 transition hover:border-zinc-700 hover:bg-zinc-900/90"
          aria-label="Report issue"
        >
          <MessageSquareWarningIcon className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Report issue</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Share a bug or confusing behavior. We automatically attach the page URL.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">
            Thanks. Your report was submitted.
          </div>
        ) : null}

        <div className="space-y-2">
          <label
            htmlFor="report-issue-message"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500"
          >
            Message
          </label>
          <textarea
            id="report-issue-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="What happened? What did you expect to happen?"
            className="w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
          />
          {create.isError ? (
            <p className="text-sm text-red-300">
              Could not submit report. Please try again.
            </p>
          ) : null}
          {pathname ? (
            <p className="truncate text-xs text-zinc-500">
              Page: {pathname}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={() => create.mutate()}
            disabled={create.isPending || message.trim().length === 0}
            className="bg-zinc-100 text-black hover:bg-zinc-300"
          >
            {create.isPending ? "Sending..." : "Send report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
