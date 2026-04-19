"use client";

import { type AttachmentIntegrityReport } from "@/services/admin/schema";
import { FileWarningIcon, FilesIcon, ShieldAlertIcon } from "lucide-react";

type Props = {
  report: AttachmentIntegrityReport;
};

export function AttachmentIntegrityTab({ report }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
        <div>
          <h2 className="text-lg text-[var(--shell-ink)]">Attachment integrity</h2>
          <p className="mt-1 text-sm text-[var(--shell-muted)]">
            Read-only scan of workout attachments versus storage objects. Start here before we add any destructive cleanup actions.
          </p>
        </div>
        <p className="mt-3 text-xs text-[var(--shell-muted)]">
          Generated {report.generatedAt.toLocaleString("sv-SE")}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Referenced URLs" value={String(report.summary.totalReferencedMediaUrls)} icon={<FilesIcon className="h-5 w-5 text-[var(--shell-muted)]" />} />
        <StatCard label="R2 objects" value={String(report.summary.totalR2Objects)} icon={<FilesIcon className="h-5 w-5 text-[var(--shell-muted)]" />} />
        <StatCard label="Orphans" value={String(report.summary.orphanObjectCount)} icon={<FileWarningIcon className="h-5 w-5 text-[var(--shell-muted)]" />} />
        <StatCard label="Raw + compressed" value={String(report.summary.rawWithCompressedCount)} icon={<ShieldAlertIcon className="h-5 w-5 text-[var(--shell-muted)]" />} />
        <StatCard label="Dead references" value={String(report.summary.deadReferenceCount)} icon={<ShieldAlertIcon className="h-5 w-5 text-[var(--shell-muted)]" />} />
      </div>

      <IntegritySection
        title="Orphan objects"
        description="Files found in R2 under workouts/ that are not referenced anywhere in completed workouts, chat, or analyses."
        emptyMessage="No orphan attachment objects found."
        rows={report.orphanObjects.map((item) => ({
          title: item.key,
          subtitle: `${formatBytes(item.sizeBytes)}${item.lastModifiedAt ? ` • ${item.lastModifiedAt.toLocaleString("sv-SE")}` : ""}`,
        }))}
      />

      <IntegritySection
        title="Raw with compressed"
        description="Media records that still point at a raw URL even though a compressed replacement already exists."
        emptyMessage="No raw+compressed pairs found."
        rows={report.rawWithCompressed.map((item) => ({
          title: item.rawKey,
          subtitle: `${item.sourceType} • ${item.ownerId}`,
          meta: item.compressedKey,
        }))}
      />

      <IntegritySection
        title="Dead references"
        description="Attachment references that point to missing R2 objects or URLs that did not respond successfully during the scan."
        emptyMessage="No dead attachment references found."
        rows={report.deadReferences.map((item) => ({
          title: item.url,
          subtitle: `${item.sourceType} • ${item.ownerId}`,
          meta: item.reason,
        }))}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--shell-muted)]">{label}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-semibold text-[var(--shell-ink)]">{value}</p>
    </div>
  );
}

function IntegritySection({
  title,
  description,
  emptyMessage,
  rows,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  rows: Array<{ title: string; subtitle?: string; meta?: string }>;
}) {
  return (
    <section className="rounded-none border border-[var(--shell-border)] bg-[var(--shell-surface)]">
      <div className="border-b border-[var(--shell-border)] px-4 py-3">
        <h3 className="text-sm font-semibold text-[var(--shell-ink)]">{title}</h3>
        <p className="mt-1 text-xs text-[var(--shell-muted)]">{description}</p>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-[var(--shell-muted)]">{emptyMessage}</p>
      ) : (
        <ul className="divide-y divide-[var(--shell-border)]/30">
          {rows.map((row, index) => (
            <li key={`${row.title}-${index}`} className="px-4 py-3">
              <p className="break-all text-sm text-[var(--shell-ink)]">{row.title}</p>
              {row.subtitle ? (
                <p className="mt-1 text-xs text-[var(--shell-muted)]">{row.subtitle}</p>
              ) : null}
              {row.meta ? (
                <p className="mt-1 break-all text-xs text-[var(--shell-muted)]">{row.meta}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
