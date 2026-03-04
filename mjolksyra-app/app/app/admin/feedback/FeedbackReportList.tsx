"use client";

import { useState } from "react";
import { type FeedbackReportItem } from "@/services/admin/schema";
import { updateFeedbackReportStatus } from "@/services/admin/updateFeedbackReportStatus";
import { cn } from "@/lib/utils";

type Props = {
  reports: FeedbackReportItem[];
  accessToken: string;
};

export function FeedbackReportList({ reports: initialReports, accessToken }: Props) {
  const [reports, setReports] = useState(initialReports);
  const [updating, setUpdating] = useState<Set<string>>(new Set());

  async function handleMarkResolved(id: string) {
    setUpdating((prev) => new Set(prev).add(id));
    try {
      const result = await updateFeedbackReportStatus({ accessToken, id, status: "Resolved" });
      setReports((prev) =>
        prev.map((r) => (r.id === result.id ? { ...r, status: result.status } : r)),
      );
    } finally {
      setUpdating((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  if (reports.length === 0) {
    return <p className="text-sm text-[var(--shell-muted)]">No feedback reports yet.</p>;
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface)] p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={report.status} />
                {report.email && (
                  <span className="text-xs text-[var(--shell-muted)]">{report.email}</span>
                )}
                <span className="ml-auto text-xs text-[var(--shell-muted)]">
                  {new Date(report.createdAt).toLocaleDateString("sv-SE")}
                </span>
              </div>
              <p className="mt-2 text-sm text-[var(--shell-ink)]">{report.message}</p>
              {report.pageUrl && (
                <p className="mt-1 text-xs text-[var(--shell-muted)]">{report.pageUrl}</p>
              )}
            </div>
            {report.status !== "Resolved" && (
              <button
                type="button"
                disabled={updating.has(report.id)}
                onClick={() => handleMarkResolved(report.id)}
                className="shrink-0 rounded-none border-2 border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-1.5 text-xs font-medium text-[var(--shell-ink)] transition hover:bg-[var(--shell-surface)] disabled:opacity-50"
              >
                {updating.has(report.id) ? "Saving…" : "Mark Resolved"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-none border-2 border-[var(--shell-border)] px-2 py-0.5 text-xs font-medium",
        status === "Resolved"
          ? "bg-[var(--shell-ink)] text-[var(--shell-surface)]"
          : "bg-[var(--shell-surface-strong)] text-[var(--shell-ink)]",
      )}
    >
      {status}
    </span>
  );
}
