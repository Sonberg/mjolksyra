import { PaperclipIcon, XIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AttachedFile = { name: string };

type Props = {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputId: string;
  attachedFiles: AttachedFile[];
  isAttachmentDragActive: boolean;
  label: string;
  accept?: string;
  onAttachmentClick: () => void;
  onRemoveFile: (index: number) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ChatMessageAttachmentBar({
  fileInputRef,
  fileInputId,
  attachedFiles,
  isAttachmentDragActive,
  label,
  accept,
  onAttachmentClick,
  onRemoveFile,
  onFileChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        id={fileInputId}
        accept={accept}
        multiple
        onChange={onFileChange}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-[var(--shell-muted)] hover:text-[var(--shell-ink)]"
        onClick={onAttachmentClick}
      >
        <PaperclipIcon data-icon="inline-start" />
        {isAttachmentDragActive ? "Drop files here" : label}
      </Button>
      {attachedFiles.map((file, i) => (
        <Badge
          key={`${file.name}-${i}`}
          variant="secondary"
          className="gap-1.5 py-1 normal-case tracking-[0.04em]"
        >
          <span className="text-[10px] font-medium text-[var(--shell-muted)]">
            {file.name}
          </span>
          <button
            type="button"
            onClick={() => onRemoveFile(i)}
            className="transition hover:text-[var(--shell-ink)]"
            aria-label={`Remove attachment ${file.name}`}
          >
            <XIcon className="size-3" />
          </button>
        </Badge>
      ))}
      <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
        Cmd/Ctrl + Enter to send
      </span>
    </div>
  );
}
