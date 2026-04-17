"use client";

import { ReactNode, useEffect, useRef, useState, useId } from "react";
import { isAxiosError } from "axios";
import {
  SendIcon,
  XIcon,
  PaperclipIcon,
  CheckIcon,
  RotateCcwIcon,
  Trash2Icon,
  LoaderCircle,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { clarifyWorkoutPlan } from "@/services/traineePlanner/clarifyWorkoutPlan";
import { applyPlannerProposal } from "@/services/traineePlanner/applyPlannerProposal";
import { deletePlannerSession } from "@/services/traineePlanner/deletePlannerSession";
import { discardPlannerProposal } from "@/services/traineePlanner/discardPlannerProposal";
import { getLatestPlannerSession } from "@/services/traineePlanner/getLatestPlannerSession";
import { PurchaseCreditsDialog } from "@/dialogs/PurchaseCreditsDialog/PurchaseCreditsDialog";
import type {
  PlannerFileContent,
  AIPlannerActionProposal,
  AIPlannerActionSet,
  AIPlannerCreditBreakdownItem,
  PreviewWorkoutPlanWorkout,
} from "@/services/traineePlanner/types";
import { cn } from "@/lib/utils";

type Props = {
  traineeId: string;
  onGenerated: () => Promise<unknown>;
  initialState?: {
    sessionId?: string | null;
    description?: string;
    messages?: Message[];
    attachedFiles?: PlannerFileContent[];
    proposedActionSet?: AIPlannerActionSet | null;
    previewWorkouts?: PreviewWorkoutPlanWorkout[] | null;
  };
};

type Message = {
  role: "user" | "assistant";
  content: string;
  options?: string[];
};

const ACCEPTED_EXTENSIONS =
  ".json,.txt,.csv,.xlsx,.jpg,.jpeg,.png,.webp,.heic,.heif";
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
  "image/heic",
  "image/heif",
]);
const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

function isImageFile(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) return true;
  const ext = "." + (file.name.split(".").pop()?.toLowerCase() ?? "");
  return IMAGE_EXTENSIONS.has(ext);
}

async function parseFileToContent(file: File): Promise<PlannerFileContent> {
  if (isImageFile(file)) {
    return {
      name: file.name,
      type: "image",
      content: `[Image file: ${file.name} — upload to storage for AI vision analysis]`,
    };
  }

  if (
    file.name.endsWith(".xlsx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    const { read, utils } = await import("xlsx");
    const buffer = await file.arrayBuffer();
    const workbook = read(buffer);
    const sheets = workbook.SheetNames.map((name) => {
      const sheet = workbook.Sheets[name];
      const json = utils.sheet_to_json(sheet);
      return `Sheet: ${name}\n${JSON.stringify(json, null, 2)}`;
    });
    return { name: file.name, type: "excel", content: sheets.join("\n\n") };
  }

  const text = await file.text();
  return { name: file.name, type: file.type || "text", content: text };
}

export function TraineePlannerPanel({
  traineeId,
  onGenerated,
  initialState,
}: Props) {
  const attachmentInputId = useId();
  const [sessionId, setSessionId] = useState<string | null>(
    initialState?.sessionId ?? null,
  );
  const [description, setDescription] = useState(
    initialState?.description ?? "",
  );
  const [messages, setMessages] = useState<Message[]>(
    initialState?.messages ?? [],
  );
  const [attachedFiles, setAttachedFiles] = useState<PlannerFileContent[]>(
    initialState?.attachedFiles ?? [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(!initialState);
  const [proposedActionSet, setProposedActionSet] =
    useState<AIPlannerActionSet | null>(
      initialState?.proposedActionSet ?? null,
    );
  const [previewData, setPreviewData] = useState<
    PreviewWorkoutPlanWorkout[] | null
  >(initialState?.previewWorkouts ?? null);
  const [userInput, setUserInput] = useState("");
  const [insufficientCredits, setInsufficientCredits] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [isClearingSession, setIsClearingSession] = useState(false);
  const [proposalError, setProposalError] = useState<string | null>(null);
  const [attachmentDragDepth, setAttachmentDragDepth] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasPendingProposal = proposedActionSet?.status === "pending";
  const hasStarted = messages.length > 0 || isLoading;
  const hasSessionDraft =
    hasStarted ||
    attachedFiles.length > 0 ||
    !!description.trim() ||
    !!proposedActionSet;

  useEffect(() => {
    if (initialState) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;

    async function clearPersistedSession() {
      try {
        const session = await getLatestPlannerSession({ traineeId });
        if (cancelled || !session) {
          return;
        }

        await deletePlannerSession({ traineeId, sessionId: session.sessionId });
      } catch {
        // stale session cleanup is best-effort
      } finally {
        if (!cancelled) {
          handleReset();
          setIsBootstrapping(false);
        }
      }
    }

    void clearPersistedSession();
    return () => {
      cancelled = true;
    };
  }, [initialState, traineeId]);

  function scrollToBottom() {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  async function handleSendInitial() {
    if (!description.trim()) return;

    const userMessage: Message = { role: "user", content: description.trim() };
    const newMessages = [userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await clarifyWorkoutPlan({
        traineeId,
        sessionId,
        description: description.trim(),
        filesContent: attachedFiles,
        conversationHistory: [],
      });

      setSessionId(response.sessionId);

      const aiMessage: Message = {
        role: "assistant",
        content: response.message,
        options: response.options?.length ? response.options : undefined,
      };
      setMessages([...newMessages, aiMessage]);

      setProposedActionSet(response.proposedActionSet);
      setPreviewData(
        response.previewWorkouts?.length ? response.previewWorkouts : null,
      );
      setProposalError(null);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  function toggleOption(option: string) {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
    );
  }

  async function handleSendOptions() {
    if (!selectedOptions.length) return;
    const text = selectedOptions.join(", ");
    setSelectedOptions([]);
    await handleSendFollowUpWithText(text);
  }

  async function handleSendFollowUp() {
    if (!userInput.trim()) return;
    await handleSendFollowUpWithText(userInput.trim());
    setUserInput("");
  }

  async function handleSendFollowUpWithText(text: string) {
    if (!text.trim()) return;

    setSelectedOptions([]);
    const userMessage: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);
    scrollToBottom();

    try {
      const response = await clarifyWorkoutPlan({
        traineeId,
        sessionId,
        description,
        filesContent: attachedFiles,
        conversationHistory: newMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      setSessionId(response.sessionId);

      const aiMessage: Message = {
        role: "assistant",
        content: response.message,
        options: response.options?.length ? response.options : undefined,
      };
      setMessages([...newMessages, aiMessage]);

      setProposedActionSet(response.proposedActionSet);
      setPreviewData(
        response.previewWorkouts?.length ? response.previewWorkouts : null,
      );
      setProposalError(null);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  async function handleApplyProposal() {
    if (!proposedActionSet) return;

    setIsLoading(true);
    setInsufficientCredits(false);

    try {
      const result = await applyPlannerProposal({
        traineeId,
        proposalId: proposedActionSet.id,
      });

      setProposedActionSet(null);
      setPreviewData(null);
      await onGenerated();
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: `Done — ${result.actionsApplied} change${result.actionsApplied !== 1 ? "s" : ""} applied. ${result.summary} What would you like to adjust next?`,
        },
      ]);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setProposalError(
          typeof err.response?.data?.error === "string"
            ? err.response.data.error
            : "This proposal is stale. Ask the planner to refresh it.",
        );
      } else if (isAxiosError(err) && err.response?.status === 422) {
        setInsufficientCredits(true);
      } else {
        setMessages([
          ...messages,
          {
            role: "assistant",
            content: "Applying this proposal failed. Please try again.",
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDiscardProposal() {
    if (!proposedActionSet || isLoading) return;

    setIsLoading(true);
    try {
      await discardPlannerProposal({
        traineeId,
        proposalId: proposedActionSet.id,
      });
      setProposedActionSet(null);
      setPreviewData(null);
      setProposalError(null);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Proposal discarded. Tell me what you want to change next.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setSessionId(null);
    setDescription("");
    setMessages([]);
    setAttachedFiles([]);
    setUserInput("");
    setProposedActionSet(null);
    setPreviewData(null);
    setProposalError(null);
  }

  async function handleClearSession() {
    if (isLoading || isClearingSession) {
      return;
    }

    setIsClearingSession(true);
    try {
      if (sessionId) {
        await deletePlannerSession({ traineeId, sessionId });
      }
      handleReset();
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Couldn't clear this session right now. Please try again.",
        },
      ]);
    } finally {
      setIsClearingSession(false);
    }
  }

  async function addAttachedFiles(files: File[]) {
    if (!files.length) {
      return;
    }

    const parsed = await Promise.all(files.map(parseFileToContent));
    setAttachedFiles((prev) => [...prev, ...parsed]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    await addAttachedFiles(Array.from(e.target.files ?? []));
  }

  const isAttachmentDragActive = attachmentDragDepth > 0;

  function handleAttachmentDragEnter(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    setAttachmentDragDepth((value) => value + 1);
  }

  function handleAttachmentDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleAttachmentDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.types.includes("Files")) {
      return;
    }

    e.preventDefault();
    setAttachmentDragDepth((value) => Math.max(0, value - 1));
  }

  async function handleAttachmentDrop(e: React.DragEvent<HTMLDivElement>) {
    if (!e.dataTransfer.files.length) {
      return;
    }

    e.preventDefault();
    setAttachmentDragDepth(0);
    await addAttachedFiles(Array.from(e.dataTransfer.files));
  }

  function removeFile(index: number) {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  if (isBootstrapping) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingDots />
      </div>
    );
  }


  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--shell-surface)]">
      <Card className="border-b border-[var(--shell-border)] border-x-0 border-t-0 shadow-none">
        <CardHeader className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--shell-muted)]">
                Planning assistant
              </p>
              <CardTitle className="mt-1 text-base">
                Build, adjust, and approve the next block
              </CardTitle>
              <CardDescription className="mt-1 text-xs leading-5">
                Coach the assistant with a brief, review staged changes, and
                apply them only when you approve.
              </CardDescription>
            </div>
            {hasSessionDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isLoading || isClearingSession}
                className=""
                onClick={() => void handleClearSession()}
              >
                <RotateCcwIcon data-icon="inline-start" />
                Clear session
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {hasStarted && (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex min-h-full flex-col gap-4">
            <div className="flex flex-col gap-3">
              {messages.map((message, index) => {
                const isLastAi =
                  message.role === "assistant" &&
                  index ===
                    messages.findLastIndex((m) => m.role === "assistant");
                const showOptions =
                  isLastAi &&
                  message.options?.length &&
                  !isLoading &&
                  !hasPendingProposal;

                return (
                  <div key={index} className="flex flex-col gap-1.5">
                    <PlannerBubble role={message.role}>
                      {message.content}
                    </PlannerBubble>
                    {showOptions && (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-2">
                          {message.options!.map((option) => {
                            const isSelected = selectedOptions.includes(option);
                            return (
                              <Button
                                key={option}
                                type="button"
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleOption(option)}
                              >
                                {isSelected && <CheckIcon className="mr-1 size-3" />}
                                {option}
                              </Button>
                            );
                          })}
                        </div>
                        {selectedOptions.length > 0 && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => void handleSendOptions()}
                          >
                            <SendIcon data-icon="inline-start" />
                            {selectedOptions.join(", ")}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {isLoading && (
                <div className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-4 py-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
                    Planner
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--shell-muted)]">
                    <LoadingDots />
                    <span>Thinking through the plan…</span>
                  </div>
                </div>
              )}
            </div>

            {hasPendingProposal && proposedActionSet && (
              <ProposalReviewCard
                proposal={proposedActionSet}
                workouts={previewData ?? []}
                isLoading={isLoading}
                error={proposalError}
                onApply={() => void handleApplyProposal()}
                onDiscard={() => void handleDiscardProposal()}
              />
            )}
            {insufficientCredits && (
              <Alert variant="destructive">
                <AlertTitle>Not enough credits for this proposal.</AlertTitle>
                <AlertDescription className="flex items-center justify-between gap-3">
                  <span>
                    Buy more credits and then apply this{" "}
                    {proposedActionSet?.creditCost || 1} credit proposal again.
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setPurchaseDialogOpen(true)}
                  >
                    Buy credits
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div ref={bottomRef} />
        </div>
      )}

      {!hasStarted ? (
        <div
          className={[
            "flex flex-1 flex-col justify-end overflow-hidden transition",
            isAttachmentDragActive
              ? "bg-[color-mix(in_srgb,var(--shell-surface)_72%,white_28%)]"
              : "",
          ].join(" ")}
          data-testid="ai-planner-attachment-dropzone"
          onDragEnter={handleAttachmentDragEnter}
          onDragOver={handleAttachmentDragOver}
          onDragLeave={handleAttachmentDragLeave}
          onDrop={(e) => void handleAttachmentDrop(e)}
        >
          <Separator />
          <AIPlannerComposer
            value={description}
            onChange={setDescription}
            onSend={() => void handleSendInitial()}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSendInitial(); }}
            canSend={!!description.trim()}
            isLoading={isLoading}
            rows={5}
            placeholder="e.g. Build a 12-week strength block for a powerlifter, 3 days per week, then shift the final two weeks into a taper."
            fileInputRef={fileInputRef}
            fileInputId={attachmentInputId}
            attachedFiles={attachedFiles}
            isAttachmentDragActive={isAttachmentDragActive}
            attachmentButtonLabel="Attach context"
            onAttachmentClick={() => fileInputRef.current?.click()}
            onRemoveFile={removeFile}
            onFileChange={handleFileChange}
          />
        </div>
      ) : (
        <>
        <Separator />
        <div
          data-testid="ai-planner-attachment-dropzone"
          onDragEnter={handleAttachmentDragEnter}
          onDragOver={handleAttachmentDragOver}
          onDragLeave={handleAttachmentDragLeave}
          onDrop={(e) => void handleAttachmentDrop(e)}
        >
          <AIPlannerComposer
            value={userInput}
            onChange={setUserInput}
            onSend={() => void handleSendFollowUp()}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSendFollowUp(); }}
            canSend={!!userInput.trim()}
            isLoading={isLoading}
            rows={3}
            placeholder={hasPendingProposal ? "Ask for changes or explain what to revise..." : "Reply with the next detail..."}
            textareaDisabled={isLoading}
            fileInputRef={fileInputRef}
            fileInputId={attachmentInputId}
            attachedFiles={attachedFiles}
            isAttachmentDragActive={isAttachmentDragActive}
            attachmentButtonLabel="Attach"
            onAttachmentClick={() => fileInputRef.current?.click()}
            onRemoveFile={removeFile}
            onFileChange={handleFileChange}
          />
        </div>
        </>
      )}
      <PurchaseCreditsDialog
        open={purchaseDialogOpen}
        onOpenChange={(open) => {
          setPurchaseDialogOpen(open);
          if (!open) setInsufficientCredits(false);
        }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <dt className="text-[var(--shell-muted)]">{label}</dt>
      <dd className="font-medium text-[var(--shell-ink)]">{value}</dd>
    </div>
  );
}

function AssistantSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border border-[var(--shell-border)] shadow-none">
      <CardHeader className="border-b border-[var(--shell-border)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          {eyebrow}
        </p>
        <CardTitle className="mt-1 text-sm">{title}</CardTitle>
        {description && (
          <CardDescription className="mt-1 text-xs leading-5">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 p-4">{children}</CardContent>
    </Card>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--shell-ink)]">
        {value}
      </p>
    </div>
  );
}

function AttachmentPill({
  fileName,
  onRemove,
}: {
  fileName: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="gap-1.5 py-1 normal-case tracking-[0.04em]"
    >
      <span className="text-[10px] font-medium text-[var(--shell-muted)]">
        {fileName}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="transition hover:text-[var(--shell-ink)]"
        aria-label={`Remove attachment ${fileName}`}
      >
        <XIcon className="size-3" />
      </button>
    </Badge>
  );
}

function PlannerBubble({
  role,
  children,
}: {
  role: Message["role"];
  children: ReactNode;
}) {
  const isUser = role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div className="max-w-[92%]">
        <div
          className={cn(
            "mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--shell-muted)]",
            isUser && "text-right",
          )}
        >
          {isUser ? "Coach" : "Planner"}
        </div>
        <div
          className={cn(
            "border px-4 py-3 text-sm leading-6 text-[var(--shell-ink)]",
            isUser
              ? "border-[var(--shell-border)] bg-[var(--shell-surface)]"
              : "border-[var(--shell-border)] bg-[var(--shell-surface-strong)]",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

type WeekGroup = {
  weekLabel: string;
  weekRange: string;
  workouts: PreviewWorkoutPlanWorkout[];
};

function groupByWeek(workouts: PreviewWorkoutPlanWorkout[]): WeekGroup[] {
  const map = new Map<string, PreviewWorkoutPlanWorkout[]>();
  for (const workout of workouts) {
    const d = dayjs(workout.plannedAt);
    const key = `${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, "0")}`;
    map.set(key, [...(map.get(key) ?? []), workout]);
  }
  const groups: WeekGroup[] = [];
  let weekIndex = 1;
  for (const [, weekWorkouts] of map) {
    const monday = dayjs(weekWorkouts[0].plannedAt).startOf(
      "isoWeek" as dayjs.OpUnitType,
    );
    const sunday = monday.add(6, "day");
    groups.push({
      weekLabel: `Week ${weekIndex}`,
      weekRange: `${monday.format("MMM D")} – ${sunday.format("MMM D")}`,
      workouts: weekWorkouts.sort((a, b) =>
        a.plannedAt.localeCompare(b.plannedAt),
      ),
    });
    weekIndex++;
  }
  return groups;
}

function formatSet(
  set: PreviewWorkoutPlanWorkout["exercises"][0]["sets"][0],
  type?: string,
): string {
  if (type === "DurationSeconds" && set.durationSeconds)
    return `${set.durationSeconds}s`;
  if (type === "DistanceMeters" && set.distanceMeters)
    return `${set.distanceMeters}m`;
  const parts: string[] = [];
  if (set.reps) parts.push(`${set.reps}`);
  if (set.weightKg) parts.push(`${set.weightKg}kg`);
  return parts.join(" @ ");
}

function formatPrescription(
  exercise: PreviewWorkoutPlanWorkout["exercises"][0],
): string {
  if (!exercise.sets.length) return "";
  const type = exercise.prescriptionType;
  if (exercise.sets.length === 1)
    return formatSet(exercise.sets[0], type ?? undefined);
  const first = formatSet(exercise.sets[0], type ?? undefined);
  const allSame = exercise.sets.every(
    (s) => formatSet(s, type ?? undefined) === first,
  );
  if (allSame) return `${exercise.sets.length}×${first}`;
  return exercise.sets.map((s) => formatSet(s, type ?? undefined)).join(", ");
}

type ProposalReviewCardProps = {
  proposal: AIPlannerActionSet;
  workouts: PreviewWorkoutPlanWorkout[];
  isLoading: boolean;
  error: string | null;
  onApply: () => void;
  onDiscard: () => void;
};

function ProposalReviewCard({
  proposal,
  workouts,
  isLoading,
  error,
  onApply,
  onDiscard,
}: ProposalReviewCardProps) {
  const weeks = groupByWeek(workouts);
  const creditCost = proposal.creditCost || 1;
  const breakdownSummary = summarizeCreditBreakdown(proposal.creditBreakdown);

  return (
    <Card className="border border-[var(--shell-border)] shadow-none">
      <CardHeader className="border-b border-[var(--shell-border)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Pending approval
        </p>
        <CardTitle className="mt-1 text-base">{proposal.summary}</CardTitle>
        {proposal.explanation && (
          <CardDescription className="mt-1 text-xs leading-5">
            {proposal.explanation}
          </CardDescription>
        )}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <StatTile
            label="Actions"
            value={`${proposal.actions.length} staged change${proposal.actions.length !== 1 ? "s" : ""}`}
          />
          <StatTile
            label="Date range"
            value={formatDateRange(
              proposal.affectedDateFrom,
              proposal.affectedDateTo,
            )}
          />
          <StatTile label="Price" value={`${creditCost} cr`} />
        </div>
        <p className="mt-3 text-xs text-[var(--shell-muted)]">
          {breakdownSummary ? `${breakdownSummary}. ` : ""}Rounded and capped at
          5 cr.
        </p>
      </CardHeader>

      <CardContent className="border-b border-[var(--shell-border)] p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Review changes
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {proposal.actions.map((action, index) => (
            <ProposalActionRow
              key={`${action.actionType}-${action.targetWorkoutId ?? action.targetDate ?? index}`}
              action={action}
            />
          ))}
        </div>
      </CardContent>

      <CardContent className="border-b border-[var(--shell-border)] p-0">
      <ScrollArea className="max-h-[260px]">
      <div className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-muted)]">
          Preview
        </p>
        <p className="mt-1 text-xs text-[var(--shell-muted)]">
          {workouts.length === 0
            ? "No preview workouts were returned for this proposal."
            : `${workouts.length} workout${workouts.length !== 1 ? "s" : ""} across ${weeks.length} week${weeks.length !== 1 ? "s" : ""}`}
        </p>
        {workouts.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--shell-muted)]">
            Ask the planner to refine the proposal if you want a clearer preview
            before approving.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            {weeks.map((week) => (
              <div
                key={week.weekLabel}
                className="border border-[var(--shell-border)] bg-[var(--shell-surface)]"
              >
                <div className="border-b border-[var(--shell-border)] px-3 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--shell-ink)]">
                      {week.weekLabel}
                    </span>
                    <span className="text-[10px] text-[var(--shell-muted)]">
                      {week.weekRange}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-3">
                  {week.workouts.map((workout) => (
                    <div
                      key={`${workout.plannedAt}-${workout.name ?? "workout"}`}
                      className="border border-[var(--shell-border)] bg-[var(--shell-surface-strong)] px-3 py-2"
                    >
                      <p className="text-xs font-medium text-[var(--shell-ink)]">
                        {dayjs(workout.plannedAt).format("ddd, MMM D")}
                        {workout.name && (
                          <span className="ml-1.5 font-normal text-[var(--shell-muted)]">
                            - {workout.name}
                          </span>
                        )}
                      </p>
                      {workout.note && (
                        <p className="mt-1 text-xs text-[var(--shell-muted)]">
                          {workout.note}
                        </p>
                      )}
                      {workout.exercises.length > 0 && (
                        <ul className="mt-2 flex flex-col gap-1">
                          {workout.exercises.map((exercise, i) => {
                            const prescription = formatPrescription(exercise);
                            return (
                              <li
                                key={`${exercise.name}-${i}`}
                                className="text-xs text-[var(--shell-muted)]"
                              >
                                <span className="font-medium text-[var(--shell-ink)]">
                                  {exercise.name}
                                </span>
                                {prescription ? ` · ${prescription}` : ""}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </ScrollArea>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-3 p-4 pt-4">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            disabled={isLoading}
            onClick={onApply}
          >
            <CheckIcon data-icon="inline-start" />
            {`Apply changes (${creditCost} cr)`}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onDiscard}
          >
            <Trash2Icon data-icon="inline-start" />
            Discard
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function ProposalActionRow({ action }: { action: AIPlannerActionProposal }) {
  return (
    <div className="border border-[var(--shell-border)] bg-[var(--shell-surface)] px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-[var(--shell-ink)]">
          {action.summary}
        </p>
        <Badge variant="secondary" className="shrink-0">
          {formatActionType(action.actionType)}
        </Badge>
      </div>
      <div className="mt-2 flex flex-col gap-1 text-xs text-[var(--shell-muted)]">
        {action.previousDate &&
          action.targetDate &&
          action.previousDate !== action.targetDate && (
            <Row
              label="Date"
              value={`${dayjs(action.previousDate).format("MMM D")} -> ${dayjs(action.targetDate).format("MMM D")}`}
            />
          )}
        {!action.previousDate && action.targetDate && (
          <Row
            label="Date"
            value={dayjs(action.targetDate).format("ddd, MMM D")}
          />
        )}
        {action.workout?.name && (
          <Row label="Workout" value={action.workout.name} />
        )}
        {action.workout?.exercises?.length ? (
          <Row
            label="Exercises"
            value={`${action.workout.exercises.length} exercise${action.workout.exercises.length !== 1 ? "s" : ""}`}
          />
        ) : null}
      </div>
    </div>
  );
}

function formatActionType(
  actionType: AIPlannerActionProposal["actionType"],
): string {
  return actionType.replaceAll("_", " ");
}

function summarizeCreditBreakdown(
  breakdown: AIPlannerCreditBreakdownItem[],
): string | null {
  if (!breakdown.length) {
    return null;
  }

  return breakdown
    .map((item) => `${item.count} ${formatActionType(item.actionType)}`)
    .join(" + ");
}

function formatDateRange(
  dateFrom?: string | null,
  dateTo?: string | null,
): string {
  if (!dateFrom && !dateTo) {
    return "Not specified";
  }

  if (dateFrom && dateTo) {
    if (dateFrom === dateTo) {
      return dayjs(dateFrom).format("ddd, MMM D");
    }

    return `${dayjs(dateFrom).format("MMM D")} - ${dayjs(dateTo).format("MMM D")}`;
  }

  return dayjs(dateFrom ?? dateTo ?? "").format("ddd, MMM D");
}

function LoadingDots() {
  return (
    <span className="flex gap-1">
      <span className="blocks-pulse size-1.5 bg-[var(--shell-muted)]" style={{ animationDelay: "0ms" }} />
      <span className="blocks-pulse size-1.5 bg-[var(--shell-muted)]" style={{ animationDelay: "200ms" }} />
      <span className="blocks-pulse size-1.5 bg-[var(--shell-muted)]" style={{ animationDelay: "400ms" }} />
    </span>
  );
}

type AIPlannerComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  canSend: boolean;
  isLoading: boolean;
  rows: number;
  placeholder: string;
  textareaDisabled?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputId: string;
  attachedFiles: PlannerFileContent[];
  isAttachmentDragActive: boolean;
  attachmentButtonLabel: string;
  onAttachmentClick: () => void;
  onRemoveFile: (index: number) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function AIPlannerComposer({
  value, onChange, onSend, onKeyDown,
  canSend, isLoading, rows, placeholder, textareaDisabled,
  fileInputRef, fileInputId, attachedFiles,
  isAttachmentDragActive, attachmentButtonLabel,
  onAttachmentClick, onRemoveFile, onFileChange,
}: AIPlannerComposerProps) {
  return (
    <div className="bg-[var(--shell-surface-strong)] p-2 shadow-[0_-6px_24px_rgba(0,0,0,0.04)]">
      <div className="flex items-end gap-2">
        <div className="min-h-11 min-w-0 flex-1 px-3">
          <Textarea
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={textareaDisabled}
            className="min-h-10 resize-none border-0 bg-transparent py-2 shadow-none focus-visible:ring-0"
          />
        </div>
        <Button
          type="button"
          size="sm"
          disabled={!canSend || isLoading}
          onClick={onSend}
          className="shrink-0 self-end"
        >
          {isLoading ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <SendIcon data-icon="inline-start" />
          )}
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          id={fileInputId}
          data-testid="ai-planner-attachment-input"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          onChange={onFileChange}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          data-testid="ai-planner-attachment-button"
          className="gap-1.5 text-[var(--shell-muted)] hover:text-[var(--shell-ink)]"
          onClick={onAttachmentClick}
        >
          <PaperclipIcon data-icon="inline-start" />
          {isAttachmentDragActive ? "Drop files here" : attachmentButtonLabel}
        </Button>
        {attachedFiles.map((file, i) => (
          <AttachmentPill
            key={`${file.name}-${i}`}
            fileName={file.name}
            onRemove={() => onRemoveFile(i)}
          />
        ))}
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--shell-muted)]">
          Cmd/Ctrl + Enter to send
        </span>
      </div>
    </div>
  );
}
