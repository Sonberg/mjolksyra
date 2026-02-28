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
    return (
      <p className="text-sm text-zinc-500">No feedback reports yet.</p>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div
          key={report.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <StatusBadge status={report.status} />
                {report.email && (
                  <span className="text-xs text-zinc-500">{report.email}</span>
                )}
                <span className="ml-auto text-xs text-zinc-600">
                  {new Date(report.createdAt).toLocaleDateString("sv-SE")}
                </span>
              </div>
              <p className="mt-2 text-sm text-zinc-200">{report.message}</p>
              {report.pageUrl && (
                <p className="mt-1 text-xs text-zinc-500">{report.pageUrl}</p>
              )}
            </div>
            {report.status !== "Resolved" && (
              <button
                type="button"
                disabled={updating.has(report.id)}
                onClick={() => handleMarkResolved(report.id)}
                className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100 disabled:opacity-50"
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
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        status === "Resolved"
          ? "bg-green-950 text-green-400"
          : "bg-yellow-950 text-yellow-400",
      )}
    >
      {status}
    </span>
  );
}
